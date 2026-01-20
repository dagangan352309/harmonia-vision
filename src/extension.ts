import * as vscode from 'vscode';
import { CalibratorPanel } from './panels/CalibratorPanel';
import { StatsPanel } from './panels/StatsPanel';
import { PauseManager } from './logic/pauseManager';

let pauseManager: PauseManager | undefined;

export function activate(context: vscode.ExtensionContext): void {
    // Initialize PauseManager
    pauseManager = new PauseManager(context.globalState);
    context.subscriptions.push(pauseManager);

    // Register open calibrator command
    const openCalibratorCommand = vscode.commands.registerCommand(
        'harmoniaVision.openCalibrator',
        () => {
            CalibratorPanel.createOrShow(context, pauseManager);
        }
    );
    context.subscriptions.push(openCalibratorCommand);

    // Register toggle pause command
    const togglePauseCommand = vscode.commands.registerCommand(
        'harmoniaVision.togglePause',
        async () => {
            if (pauseManager) {
                const enabled = await pauseManager.toggle();
                const message = enabled
                    ? 'Harmonia Vision: Eye break reminders enabled'
                    : 'Harmonia Vision: Eye break reminders disabled';
                vscode.window.showInformationMessage(message);
            }
        }
    );
    context.subscriptions.push(togglePauseCommand);

    // Register pause now command
    const pauseNowCommand = vscode.commands.registerCommand('harmoniaVision.pauseNow', () => {
        if (pauseManager) {
            pauseManager.triggerBreakNow();
        }
    });
    context.subscriptions.push(pauseNowCommand);

    // Register snooze command
    const snoozePauseCommand = vscode.commands.registerCommand(
        'harmoniaVision.snoozePause',
        () => {
            if (pauseManager) {
                pauseManager.snooze();
            }
        }
    );
    context.subscriptions.push(snoozePauseCommand);

    // Register open stats command
    const openStatsCommand = vscode.commands.registerCommand(
        'harmoniaVision.openStats',
        () => {
            StatsPanel.createOrShow(context, pauseManager);
        }
    );
    context.subscriptions.push(openStatsCommand);

    // Track user activity for idle detection
    const activityEvents = [
        vscode.window.onDidChangeActiveTextEditor,
        vscode.window.onDidChangeTextEditorSelection,
        vscode.workspace.onDidChangeTextDocument,
    ];

    for (const event of activityEvents) {
        context.subscriptions.push(
            event(() => {
                if (pauseManager) {
                    pauseManager.recordActivity();
                }
            })
        );
    }

    // Track the panel if it exists
    if (CalibratorPanel.currentPanel) {
        context.subscriptions.push(CalibratorPanel.currentPanel);
    }
}

export function deactivate(): void {
    pauseManager = undefined;
}
