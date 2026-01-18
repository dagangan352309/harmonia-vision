/**
 * Harmonia Vision - Settings Manager
 *
 * Handles safe reading and writing of VS Code editor settings.
 * Provides PERSISTENT snapshot/restore functionality using globalState.
 *
 * Key Features:
 * - Snapshots persist across VS Code sessions via globalState
 * - Always writes to GLOBAL scope for persistence across files
 * - Revert is always available as long as a snapshot exists
 */

import * as vscode from 'vscode';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type LineHighlightType = 'none' | 'gutter' | 'line' | 'all';

export interface EditorSettingsSnapshot {
    fontSize: number | undefined;
    lineHeight: number | undefined;
    letterSpacing: number | undefined;
    fontWeight: string | undefined;
    cursorWidth: number | undefined;
    renderLineHighlight: LineHighlightType | undefined;
    capturedAt?: number; // Timestamp when snapshot was taken
}

export interface SettingsUpdateResult {
    success: boolean;
    error?: string;
}

// Storage key for globalState
const SNAPSHOT_KEY = 'harmoniaVision.originalSnapshot';

// ─────────────────────────────────────────────────────────────────────────────
// Settings Manager
// ─────────────────────────────────────────────────────────────────────────────

export class SettingsManager {
    private _globalState: vscode.Memento;
    private _isUpdating = false;

    constructor(globalState: vscode.Memento) {
        this._globalState = globalState;
    }

    /**
     * Returns true if we're currently updating settings (to avoid feedback loops).
     */
    public get isUpdating(): boolean {
        return this._isUpdating;
    }

    /**
     * Returns true if a persistent snapshot exists in globalState.
     */
    public hasSnapshot(): boolean {
        return this._globalState.get<EditorSettingsSnapshot>(SNAPSHOT_KEY) !== undefined;
    }

    /**
     * Gets the persistent snapshot from globalState.
     * Returns null if no snapshot exists.
     */
    public getSnapshot(): EditorSettingsSnapshot | null {
        return this._globalState.get<EditorSettingsSnapshot>(SNAPSHOT_KEY) ?? null;
    }

    /**
     * Captures the current editor settings and persists to globalState.
     * This snapshot survives VS Code restarts.
     *
     * @param force If true, overwrites existing snapshot. If false, only captures if no snapshot exists.
     */
    public async captureSnapshot(force: boolean = false): Promise<EditorSettingsSnapshot> {
        // Don't overwrite existing snapshot unless forced
        if (!force && this.hasSnapshot()) {
            return this.getSnapshot()!;
        }

        const config = vscode.workspace.getConfiguration('editor');

        const snapshot: EditorSettingsSnapshot = {
            fontSize: config.get<number>('fontSize'),
            lineHeight: config.get<number>('lineHeight'),
            letterSpacing: config.get<number>('letterSpacing'),
            fontWeight: config.get<string>('fontWeight'),
            cursorWidth: config.get<number>('cursorWidth'),
            renderLineHighlight: config.get<LineHighlightType>('renderLineHighlight'),
            capturedAt: Date.now(),
        };

        // Persist to globalState
        await this._globalState.update(SNAPSHOT_KEY, snapshot);

        return snapshot;
    }

    /**
     * Clears the persistent snapshot from globalState.
     * Call this after user explicitly applies and accepts changes.
     */
    public async clearSnapshot(): Promise<void> {
        await this._globalState.update(SNAPSHOT_KEY, undefined);
    }

    /**
     * Reads the current editor settings from VS Code configuration.
     */
    public readCurrentSettings(): EditorSettingsSnapshot {
        const config = vscode.workspace.getConfiguration('editor');

        return {
            fontSize: config.get<number>('fontSize'),
            lineHeight: config.get<number>('lineHeight'),
            letterSpacing: config.get<number>('letterSpacing'),
            fontWeight: config.get<string>('fontWeight'),
            cursorWidth: config.get<number>('cursorWidth'),
            renderLineHighlight: config.get<LineHighlightType>('renderLineHighlight'),
        };
    }

    /**
     * Applies settings to GLOBAL configuration.
     * This ensures settings persist across files and sessions.
     *
     * @param settings The settings to apply
     * @param captureSnapshotFirst If true, captures a snapshot before applying (default: true)
     */
    public async applySettings(
        settings: Partial<EditorSettingsSnapshot>,
        captureSnapshotFirst: boolean = true
    ): Promise<SettingsUpdateResult> {
        // Capture snapshot before first change
        if (captureSnapshotFirst && !this.hasSnapshot()) {
            await this.captureSnapshot();
        }

        return this._updateSettings(settings);
    }

    /**
     * Reverts to the persistent snapshot stored in globalState.
     * The snapshot remains in globalState after revert (can revert again).
     */
    public async revert(): Promise<SettingsUpdateResult> {
        const snapshot = this.getSnapshot();

        if (!snapshot) {
            return { success: false, error: 'No snapshot available to revert to.' };
        }

        return this._updateSettings(snapshot);
    }

    /**
     * Reverts and then clears the snapshot.
     * Use when user wants to fully reset and start fresh.
     */
    public async revertAndClear(): Promise<SettingsUpdateResult> {
        const result = await this.revert();
        if (result.success) {
            await this.clearSnapshot();
        }
        return result;
    }

    /**
     * Internal method to update VS Code GLOBAL settings.
     */
    private async _updateSettings(settings: Partial<EditorSettingsSnapshot>): Promise<SettingsUpdateResult> {
        this._isUpdating = true;

        try {
            const config = vscode.workspace.getConfiguration('editor');
            // Always use GLOBAL target for persistence
            const target = vscode.ConfigurationTarget.Global;

            const updates: Thenable<void>[] = [];

            if (settings.fontSize !== undefined) {
                updates.push(config.update('fontSize', settings.fontSize, target));
            }
            if (settings.lineHeight !== undefined) {
                updates.push(config.update('lineHeight', settings.lineHeight, target));
            }
            if (settings.letterSpacing !== undefined) {
                updates.push(config.update('letterSpacing', settings.letterSpacing, target));
            }
            if (settings.fontWeight !== undefined) {
                updates.push(config.update('fontWeight', settings.fontWeight, target));
            }
            if (settings.cursorWidth !== undefined) {
                updates.push(config.update('cursorWidth', settings.cursorWidth, target));
            }
            if (settings.renderLineHighlight !== undefined) {
                updates.push(config.update('renderLineHighlight', settings.renderLineHighlight, target));
            }

            await Promise.all(updates);

            return { success: true };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: message };
        } finally {
            // Small delay to allow VS Code to process the updates
            setTimeout(() => {
                this._isUpdating = false;
            }, 50);
        }
    }

    /**
     * Gets snapshot age in human-readable format.
     */
    public getSnapshotAge(): string | null {
        const snapshot = this.getSnapshot();
        if (!snapshot?.capturedAt) {
            return null;
        }

        const ageMs = Date.now() - snapshot.capturedAt;
        const ageMinutes = Math.floor(ageMs / 60000);
        const ageHours = Math.floor(ageMinutes / 60);
        const ageDays = Math.floor(ageHours / 24);

        if (ageDays > 0) {
            return `${ageDays} day${ageDays > 1 ? 's' : ''} ago`;
        }
        if (ageHours > 0) {
            return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
        }
        if (ageMinutes > 0) {
            return `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
        }
        return 'Just now';
    }
}
