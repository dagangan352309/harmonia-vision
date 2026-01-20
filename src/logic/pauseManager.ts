/**
 * Harmonia Vision - Pause Manager
 *
 * Implements the 20-20-20 rule for eye health:
 * Every 20 minutes, look at something 20 feet away for 20 seconds.
 *
 * Features:
 * - Configurable work interval and break duration
 * - Status bar countdown display
 * - Non-intrusive notifications with action buttons
 * - Idle detection to pause timer when user is inactive
 * - State persistence across sessions
 */

import * as vscode from 'vscode';
import { getRandomTip } from './pauseTips';
import { PauseStats, PauseStatsSummary } from './pauseStats';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PauseSettings {
    enabled: boolean;
    workIntervalMinutes: number;
    breakDurationSeconds: number;
    showStatusBar: boolean;
    pauseWhenIdle: boolean;
}

export interface PauseState {
    settings: PauseSettings;
    isRunning: boolean;
    remainingSeconds: number;
    isOnBreak: boolean;
}

// Storage keys for globalState
const PAUSE_SETTINGS_KEY = 'harmoniaVision.pauseSettings';
const PAUSE_STATE_KEY = 'harmoniaVision.pauseState';

// Default settings following the 20-20-20 rule
const DEFAULT_SETTINGS: PauseSettings = {
    enabled: false,
    workIntervalMinutes: 20,
    breakDurationSeconds: 20,
    showStatusBar: true,
    pauseWhenIdle: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// Pause Manager Class
// ─────────────────────────────────────────────────────────────────────────────

export class PauseManager implements vscode.Disposable {
    private _globalState: vscode.Memento;
    private _statusBarItem: vscode.StatusBarItem;
    private _timer: NodeJS.Timeout | null = null;
    private _settings: PauseSettings;
    private _remainingSeconds: number = 0;
    private _isOnBreak: boolean = false;
    private _lastActivityTime: number = Date.now();
    private _idleCheckInterval: NodeJS.Timeout | null = null;
    private _disposables: vscode.Disposable[] = [];
    private _stateChangeCallbacks: Array<(state: PauseState) => void> = [];
    private _stats: PauseStats;

    // Idle threshold: 2 minutes of no activity
    private static readonly IDLE_THRESHOLD_MS = 2 * 60 * 1000;

    constructor(globalState: vscode.Memento) {
        this._globalState = globalState;

        // Load settings and stats from storage
        this._settings = this._loadSettings();
        this._stats = new PauseStats(globalState);

        // Create status bar item
        this._statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this._statusBarItem.command = 'harmoniaVision.togglePause';
        this._disposables.push(this._statusBarItem);

        // Initialize timer state
        this._initializeState();

        // Start if enabled
        if (this._settings.enabled) {
            this._startTimer();
        }

        // Update status bar visibility
        this._updateStatusBarVisibility();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Gets the current pause state for the webview.
     */
    public getState(): PauseState {
        return {
            settings: { ...this._settings },
            isRunning: this._timer !== null,
            remainingSeconds: this._remainingSeconds,
            isOnBreak: this._isOnBreak,
        };
    }

    /**
     * Updates pause settings.
     */
    public async updateSettings(newSettings: Partial<PauseSettings>): Promise<void> {
        const wasEnabled = this._settings.enabled;

        this._settings = { ...this._settings, ...newSettings };
        await this._saveSettings();

        // Handle enable/disable
        if (newSettings.enabled !== undefined) {
            if (newSettings.enabled && !wasEnabled) {
                this._startTimer();
            } else if (!newSettings.enabled && wasEnabled) {
                this._stopTimer();
            }
        }

        // Handle work interval change while running
        if (newSettings.workIntervalMinutes !== undefined && this._timer && !this._isOnBreak) {
            // Reset timer with new interval
            this._remainingSeconds = newSettings.workIntervalMinutes * 60;
        }

        this._updateStatusBarVisibility();
        this._notifyStateChange();
    }

    /**
     * Toggles the pause feature on/off.
     */
    public async toggle(): Promise<boolean> {
        const newEnabled = !this._settings.enabled;
        await this.updateSettings({ enabled: newEnabled });
        return newEnabled;
    }

    /**
     * Triggers an immediate break.
     */
    public triggerBreakNow(): void {
        if (!this._settings.enabled) {
            return;
        }

        this._showBreakNotification();
    }

    /**
     * Snoozes the current reminder for 5 minutes.
     */
    public async snooze(): Promise<void> {
        await this._stats.recordBreakSnoozed();
        this._isOnBreak = false;
        this._remainingSeconds = 5 * 60; // 5 minutes
        this._updateStatusBar();
        this._notifyStateChange();

        vscode.window.showInformationMessage('Harmonia Vision: Snoozed for 5 minutes.');
    }

    /**
     * Gets statistics summary.
     */
    public getStats(): PauseStatsSummary {
        return this._stats.getSummary();
    }

    /**
     * Resets all statistics.
     */
    public async resetStats(): Promise<void> {
        await this._stats.reset();
    }

    /**
     * Records user activity (for idle detection).
     */
    public recordActivity(): void {
        this._lastActivityTime = Date.now();
    }

    /**
     * Registers a callback for state changes.
     */
    public onStateChange(callback: (state: PauseState) => void): vscode.Disposable {
        this._stateChangeCallbacks.push(callback);
        return {
            dispose: () => {
                const index = this._stateChangeCallbacks.indexOf(callback);
                if (index > -1) {
                    this._stateChangeCallbacks.splice(index, 1);
                }
            },
        };
    }

    /**
     * Disposes resources.
     */
    public dispose(): void {
        this._stopTimer();
        this._stopIdleCheck();

        for (const disposable of this._disposables) {
            disposable.dispose();
        }
        this._disposables = [];
        this._stateChangeCallbacks = [];
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────────────────

    private _loadSettings(): PauseSettings {
        const stored = this._globalState.get<PauseSettings>(PAUSE_SETTINGS_KEY);
        return stored ? { ...DEFAULT_SETTINGS, ...stored } : { ...DEFAULT_SETTINGS };
    }

    private async _saveSettings(): Promise<void> {
        await this._globalState.update(PAUSE_SETTINGS_KEY, this._settings);
    }

    private _initializeState(): void {
        // Try to restore state from previous session
        const savedState = this._globalState.get<{ remaining: number; isOnBreak: boolean }>(
            PAUSE_STATE_KEY
        );

        if (savedState && this._settings.enabled) {
            this._remainingSeconds = savedState.remaining;
            this._isOnBreak = savedState.isOnBreak;
        } else {
            this._remainingSeconds = this._settings.workIntervalMinutes * 60;
            this._isOnBreak = false;
        }
    }

    private async _saveState(): Promise<void> {
        await this._globalState.update(PAUSE_STATE_KEY, {
            remaining: this._remainingSeconds,
            isOnBreak: this._isOnBreak,
        });
    }

    private _startTimer(): void {
        if (this._timer) {
            return;
        }

        // Reset if starting fresh
        if (this._remainingSeconds <= 0) {
            this._remainingSeconds = this._settings.workIntervalMinutes * 60;
        }

        // Start the countdown
        this._timer = setInterval(() => this._tick(), 1000);

        // Start idle detection if enabled
        if (this._settings.pauseWhenIdle) {
            this._startIdleCheck();
        }

        this._updateStatusBar();
        this._notifyStateChange();
    }

    private _stopTimer(): void {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
        }

        this._stopIdleCheck();
        this._statusBarItem.hide();
        this._notifyStateChange();
    }

    private _tick(): void {
        // Check for idle if enabled
        if (this._settings.pauseWhenIdle && this._isIdle()) {
            // Don't decrement while idle
            return;
        }

        this._remainingSeconds--;

        if (this._remainingSeconds <= 0) {
            if (this._isOnBreak) {
                // Break is over, record and start work interval
                this._stats.recordBreakTaken(this._settings.breakDurationSeconds);
                this._isOnBreak = false;
                this._remainingSeconds = this._settings.workIntervalMinutes * 60;
            } else {
                // Work interval is over, show break notification
                this._showBreakNotification();
                this._isOnBreak = true;
                this._remainingSeconds = this._settings.breakDurationSeconds;
            }
        }

        this._updateStatusBar();
        this._saveState();
        this._notifyStateChange();
    }

    private _showBreakNotification(): void {
        const language = vscode.env.language;
        const tip = getRandomTip(language);

        const message =
            language.startsWith('es')
                ? `Descanso para los ojos: ${tip}`
                : `Eye Break: ${tip}`;

        const dismissLabel = language.startsWith('es') ? 'Descartar' : 'Dismiss';
        const snoozeLabel = language.startsWith('es') ? 'Posponer 5 min' : 'Snooze 5 min';

        vscode.window.showInformationMessage(message, dismissLabel, snoozeLabel).then((action) => {
            if (action === snoozeLabel) {
                this.snooze();
            } else if (action === dismissLabel) {
                // User explicitly dismissed
                this._stats.recordBreakDismissed();
                this._isOnBreak = false;
                this._remainingSeconds = this._settings.workIntervalMinutes * 60;
                this._updateStatusBar();
                this._notifyStateChange();
            } else {
                // User closed notification - continue with break timer
                this._isOnBreak = true;
                this._remainingSeconds = this._settings.breakDurationSeconds;
                this._notifyStateChange();
            }
        });
    }

    private _updateStatusBar(): void {
        if (!this._settings.showStatusBar || !this._settings.enabled) {
            this._statusBarItem.hide();
            return;
        }

        const minutes = Math.floor(this._remainingSeconds / 60);
        const seconds = this._remainingSeconds % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (this._isOnBreak) {
            this._statusBarItem.text = `$(eye-closed) ${timeStr}`;
            this._statusBarItem.tooltip = 'Harmonia Vision: On break - look away from the screen';
            this._statusBarItem.backgroundColor = new vscode.ThemeColor(
                'statusBarItem.warningBackground'
            );
        } else {
            this._statusBarItem.text = `$(eye) ${timeStr}`;
            this._statusBarItem.tooltip = 'Harmonia Vision: Time until next eye break';
            this._statusBarItem.backgroundColor = new vscode.ThemeColor(
                'statusBarItem.prominentBackground'
            );
        }

        this._statusBarItem.show();
    }

    private _updateStatusBarVisibility(): void {
        if (this._settings.showStatusBar && this._settings.enabled) {
            this._updateStatusBar();
        } else {
            this._statusBarItem.hide();
        }
    }

    private _startIdleCheck(): void {
        if (this._idleCheckInterval) {
            return;
        }

        // Check every 30 seconds
        this._idleCheckInterval = setInterval(() => {
            // Just update the last check time
        }, 30000);
    }

    private _stopIdleCheck(): void {
        if (this._idleCheckInterval) {
            clearInterval(this._idleCheckInterval);
            this._idleCheckInterval = null;
        }
    }

    private _isIdle(): boolean {
        return Date.now() - this._lastActivityTime > PauseManager.IDLE_THRESHOLD_MS;
    }

    private _notifyStateChange(): void {
        const state = this.getState();
        for (const callback of this._stateChangeCallbacks) {
            callback(state);
        }
    }
}
