import * as vscode from 'vscode';
import { PauseManager } from '../logic/pauseManager';
import { getTranslations } from '../i18n/translations';
import { getStatsWebviewContent } from '../webview/statsHtmlBuilder';

export class StatsPanel implements vscode.Disposable {
    public static currentPanel: StatsPanel | undefined;

    private static readonly viewType = 'harmoniaVision.stats';
    private readonly _panel: vscode.WebviewPanel;
    private readonly _pauseManager: PauseManager | undefined;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, pauseManager?: PauseManager) {
        this._panel = panel;
        this._pauseManager = pauseManager;

        this._update();

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            (message) => this._handleMessage(message),
            null,
            this._disposables
        );
    }

    public static createOrShow(
        context: vscode.ExtensionContext,
        pauseManager?: PauseManager
    ): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (StatsPanel.currentPanel) {
            StatsPanel.currentPanel._panel.reveal(column);
            StatsPanel.currentPanel._sendStats();
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            StatsPanel.viewType,
            'Break Statistics',
            column || vscode.ViewColumn.One,
            { enableScripts: true, retainContextWhenHidden: true }
        );

        StatsPanel.currentPanel = new StatsPanel(panel, pauseManager);
    }

    public dispose(): void {
        StatsPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const d = this._disposables.pop();
            if (d) d.dispose();
        }
    }

    private _update(): void {
        const t = getTranslations(vscode.env.language);
        this._panel.title = t.statsSection;
        this._panel.webview.html = getStatsWebviewContent(this._panel.webview, t);
    }

    private _handleMessage(message: { command: string }): void {
        switch (message.command) {
            case 'getStats':
                this._sendStats();
                break;
            case 'resetStats':
                this._confirmAndResetStats();
                break;
        }
    }

    private async _confirmAndResetStats(): Promise<void> {
        const confirm = await vscode.window.showWarningMessage(
            'Reset all break statistics?',
            { modal: true },
            'Reset'
        );
        if (confirm === 'Reset') {
            await this._resetStats();
        }
    }

    private _sendStats(): void {
        if (!this._pauseManager) return;
        this._panel.webview.postMessage({
            command: 'stats',
            payload: this._pauseManager.getStats(),
        });
    }

    private async _resetStats(): Promise<void> {
        if (!this._pauseManager) return;
        await this._pauseManager.resetStats();
        // Send statsReset command so webview shows zeros instead of "no data"
        this._panel.webview.postMessage({
            command: 'statsReset',
            payload: this._pauseManager.getStats(),
        });
        vscode.window.showInformationMessage('Harmonia Vision: Statistics reset.');
    }
}
