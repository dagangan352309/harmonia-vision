import * as vscode from 'vscode';
import { getWebviewContent } from '../webview/htmlBuilder';
import {
    computeRecommendations,
    RecommendationInput,
    RecommendationOutput,
    EditorSettings,
} from '../logic/recommendations';
import { SettingsManager, EditorSettingsSnapshot, LineHighlightType } from '../logic/settingsManager';
import { debounce } from '../utils/throttle';
import { getTranslations } from '../i18n/translations';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface WebviewMessage {
    command: string;
    payload?: RecommendationInput | EditorSettings | unknown;
}

interface SettingsPayload {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    fontWeight: string;
    cursorWidth: number;
    renderLineHighlight?: LineHighlightType;
}

// ─────────────────────────────────────────────────────────────────────────────
// Calibrator Panel
// ─────────────────────────────────────────────────────────────────────────────

export class CalibratorPanel implements vscode.Disposable {
    public static currentPanel: CalibratorPanel | undefined;

    private static readonly viewType = 'harmoniaVision.calibrator';
    private readonly _panel: vscode.WebviewPanel;
    private readonly _context: vscode.ExtensionContext;
    private readonly _settingsManager: SettingsManager;
    private _disposables: vscode.Disposable[] = [];

    // Debounced apply function (200ms delay)
    private readonly _debouncedApply: (settings: EditorSettingsSnapshot) => void;

    private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
        this._panel = panel;
        this._context = context;
        this._settingsManager = new SettingsManager(context.globalState);

        // Create debounced apply function
        this._debouncedApply = debounce(
            (settings: EditorSettingsSnapshot) => this._executeApply(settings),
            200
        );

        // Capture initial snapshot if none exists
        this._initializeSnapshot();

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.onDidChangeViewState(
            () => {
                if (this._panel.visible) {
                    // Do NOT call _update() here - it regenerates HTML and destroys state
                    // retainContextWhenHidden: true preserves the webview state
                    // Only resend state data (not regenerate HTML)
                    this._sendFullStateToWebview();
                }
            },
            null,
            this._disposables
        );

        this._panel.webview.onDidReceiveMessage(
            (message: WebviewMessage) => {
                this._handleMessage(message);
            },
            null,
            this._disposables
        );

        // Listen for configuration changes (to detect external changes)
        const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
            if (this._settingsManager.isUpdating) {
                return;
            }
            if (e.affectsConfiguration('editor')) {
                this._sendCurrentSettingsToWebview();
            }
        });
        this._disposables.push(configListener);
    }

    private async _initializeSnapshot(): Promise<void> {
        // Capture snapshot on first use (doesn't overwrite existing)
        await this._settingsManager.captureSnapshot(false);
    }

    public static createOrShow(context: vscode.ExtensionContext): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (CalibratorPanel.currentPanel) {
            CalibratorPanel.currentPanel._panel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            CalibratorPanel.viewType,
            'Harmonia Vision',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(context.extensionUri, 'src', 'webview'),
                    vscode.Uri.joinPath(context.extensionUri, 'out', 'webview')
                ],
                retainContextWhenHidden: true
            }
        );

        CalibratorPanel.currentPanel = new CalibratorPanel(panel, context);
    }

    public dispose(): void {
        // Note: We do NOT revert on dispose anymore.
        // Settings are persistent and user can revert manually.
        CalibratorPanel.currentPanel = undefined;
        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _update(): void {
        const webview = this._panel.webview;
        const translations = getTranslations(vscode.env.language);
        this._panel.title = translations.title;
        this._panel.webview.html = getWebviewContent(webview, this._context.extensionUri, translations);
    }

    private _handleMessage(message: WebviewMessage): void {
        switch (message.command) {
            case 'updateInput':
                if (message.payload && this._isRecommendationInput(message.payload)) {
                    this._computeAndSendRecommendations(message.payload);
                }
                break;
            case 'applySettings':
                if (message.payload && this._isSettingsPayload(message.payload)) {
                    this._handleApplySettings(message.payload);
                }
                break;
            case 'previewSettings':
                // Preview applies to GLOBAL settings temporarily for testing
                if (message.payload && this._isSettingsPayload(message.payload)) {
                    this._handlePreviewSettings(message.payload);
                }
                break;
            case 'saveSettings':
                // Save commits settings AND updates the snapshot (new baseline)
                if (message.payload && this._isSettingsPayload(message.payload)) {
                    this._handleSaveSettings(message.payload);
                }
                break;
            case 'revert':
                this._handleRevert();
                break;
            case 'revertAndClear':
                this._handleRevertAndClear();
                break;
            case 'recaptureSnapshot':
                this._handleRecaptureSnapshot();
                break;
            case 'getInitialState':
                this._sendFullStateToWebview();
                break;
        }
    }

    private _isRecommendationInput(payload: unknown): payload is RecommendationInput {
        return typeof payload === 'object' && payload !== null && 'toggles' in payload;
    }

    private _isSettingsPayload(payload: unknown): payload is SettingsPayload {
        return typeof payload === 'object' && payload !== null && 'fontSize' in payload;
    }

    private _computeAndSendRecommendations(input: RecommendationInput): void {
        try {
            // Inject current settings as baseline floor
            const currentSettings = this._settingsManager.readCurrentSettings();
            const inputWithCurrentSettings: RecommendationInput = {
                ...input,
                currentSettings: {
                    fontSize: currentSettings.fontSize,
                    lineHeight: currentSettings.lineHeight,
                    letterSpacing: currentSettings.letterSpacing,
                    fontWeight: currentSettings.fontWeight,
                    cursorWidth: currentSettings.cursorWidth,
                },
            };

            const recommendations: RecommendationOutput = computeRecommendations(inputWithCurrentSettings);
            this._panel.webview.postMessage({
                command: 'recommendations',
                payload: recommendations,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Failed to compute recommendations: ${errorMessage}`);
        }
    }

    private _handleApplySettings(settings: SettingsPayload): void {
        // Use debounced apply for slider changes
        this._debouncedApply(this._convertToSnapshot(settings));
    }

    private async _handlePreviewSettings(settings: SettingsPayload): Promise<void> {
        // Preview action - apply to GLOBAL settings for testing (snapshot unchanged)
        const result = await this._settingsManager.applySettings(this._convertToSnapshot(settings), false);
        if (result.success) {
            this._sendFullStateToWebview();
            vscode.window.showInformationMessage('Harmonia Vision: Preview applied. Click "Save" to keep these settings.');
        } else {
            vscode.window.showErrorMessage(`Failed to apply preview: ${result.error}`);
        }
    }

    private async _handleSaveSettings(settings: SettingsPayload): Promise<void> {
        // Save action - apply settings AND update snapshot (new baseline)
        const settingsSnapshot = this._convertToSnapshot(settings);
        const result = await this._settingsManager.applySettings(settingsSnapshot, false);
        if (result.success) {
            // Update snapshot to current settings (this becomes the new "revert" target)
            await this._settingsManager.captureSnapshot(true);
            this._sendFullStateToWebview();
            vscode.window.showInformationMessage('Harmonia Vision: Settings saved as your new defaults.');
        } else {
            vscode.window.showErrorMessage(`Failed to save settings: ${result.error}`);
        }
    }

    private async _executeApply(settings: EditorSettingsSnapshot): Promise<void> {
        const result = await this._settingsManager.applySettings(settings);
        if (!result.success) {
            vscode.window.showErrorMessage(`Failed to apply settings: ${result.error}`);
        }
        this._sendFullStateToWebview();
    }

    private async _handleRevert(): Promise<void> {
        const result = await this._settingsManager.revert();

        if (result.success) {
            this._sendFullStateToWebview();
            vscode.window.showInformationMessage('Harmonia Vision: Settings reverted to original snapshot.');
        } else {
            vscode.window.showErrorMessage(`Failed to revert: ${result.error}`);
        }
    }

    private async _handleRevertAndClear(): Promise<void> {
        const result = await this._settingsManager.revertAndClear();

        if (result.success) {
            this._sendFullStateToWebview();
            vscode.window.showInformationMessage('Harmonia Vision: Settings reverted and snapshot cleared.');
        } else {
            vscode.window.showErrorMessage(`Failed to revert: ${result.error}`);
        }
    }

    private async _handleRecaptureSnapshot(): Promise<void> {
        await this._settingsManager.captureSnapshot(true); // Force recapture
        this._sendFullStateToWebview();
        vscode.window.showInformationMessage('Harmonia Vision: New snapshot captured from current settings.');
    }

    private _convertToSnapshot(settings: SettingsPayload): EditorSettingsSnapshot {
        return {
            fontSize: settings.fontSize,
            lineHeight: settings.lineHeight,
            letterSpacing: settings.letterSpacing,
            fontWeight: settings.fontWeight,
            cursorWidth: settings.cursorWidth,
            renderLineHighlight: settings.renderLineHighlight,
        };
    }

    private _sendCurrentSettingsToWebview(): void {
        const current = this._settingsManager.readCurrentSettings();
        this._panel.webview.postMessage({
            command: 'currentSettings',
            payload: current,
        });
    }

    private _sendFullStateToWebview(): void {
        const current = this._settingsManager.readCurrentSettings();
        const snapshot = this._settingsManager.getSnapshot();
        const snapshotAge = this._settingsManager.getSnapshotAge();
        const hasSnapshot = this._settingsManager.hasSnapshot();

        this._panel.webview.postMessage({
            command: 'fullState',
            payload: {
                current,
                snapshot,
                snapshotAge,
                hasSnapshot,
            },
        });
    }
}
