import * as vscode from 'vscode';
import { Translations } from '../i18n/translations';

export function getStatsWebviewContent(webview: vscode.Webview, t: Translations): string {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>${t.statsSection}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: var(--vscode-font-family);
            background: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            padding: 24px;
            max-width: 600px;
            margin: 0 auto;
        }
        .header { text-align: center; margin-bottom: 32px; }
        .header h1 { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
        .header p { color: var(--vscode-descriptionForeground); font-size: 13px; }
        .card {
            background: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
        }
        .card-title {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .card-title svg { opacity: 0.7; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
        }
        .stat-item { text-align: center; }
        .stat-value {
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
        }
        .stat-label {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        .green { color: #4ade80; }
        .amber { color: #fbbf24; }
        .blue { color: #60a5fa; }
        .red { color: #f87171; }
        .streak-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }
        .streak-item {
            background: var(--vscode-input-background);
            border-radius: 8px;
            padding: 16px;
            text-align: center;
        }
        .streak-value {
            font-size: 36px;
            font-weight: 700;
        }
        .streak-label {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        .no-data {
            text-align: center;
            padding: 48px 24px;
            color: var(--vscode-descriptionForeground);
        }
        .no-data svg { opacity: 0.3; margin-bottom: 16px; }
        .reset-btn {
            width: 100%;
            padding: 12px;
            background: rgba(239, 68, 68, 0.1);
            color: #f87171;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            cursor: pointer;
            transition: background 0.2s;
            outline: none;
        }
        .reset-btn:hover { background: rgba(239, 68, 68, 0.2); }
        .reset-btn:focus { outline: none; }
        .hidden { display: none; }
        .icon-circle {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
        }
        .icon-circle.green-bg { background: rgba(74, 222, 128, 0.15); }
        .icon-circle.amber-bg { background: rgba(251, 191, 36, 0.15); }
        .icon-circle.blue-bg { background: rgba(96, 165, 250, 0.15); }
    </style>
</head>
<body>
    <div class="header">
        <h1>${t.statsSection}</h1>
        <p>Track your eye health habits</p>
    </div>

    <div id="noData" class="no-data">
        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
        <p>${t.statsNoData}</p>
    </div>

    <div id="statsContent" class="hidden">
        <!-- Today -->
        <div class="card">
            <div class="card-title">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="2"/>
                    <path stroke-width="2" d="M12 6v6l4 2"/>
                </svg>
                ${t.statsToday}
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="icon-circle green-bg">
                        <svg width="24" height="24" class="green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <div class="stat-value green" id="todayTaken">0</div>
                    <div class="stat-label">${t.statsBreaksTaken}</div>
                </div>
                <div class="stat-item">
                    <div class="icon-circle amber-bg">
                        <svg width="24" height="24" class="amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="stat-value amber" id="todaySnoozed">0</div>
                    <div class="stat-label">${t.statsSnoozed}</div>
                </div>
                <div class="stat-item">
                    <div class="icon-circle blue-bg">
                        <svg width="24" height="24" class="blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </div>
                    <div class="stat-value blue" id="todayRest">0m</div>
                    <div class="stat-label">${t.statsRestTime}</div>
                </div>
            </div>
        </div>

        <!-- This Week -->
        <div class="card">
            <div class="card-title">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" stroke-width="2"/>
                    <path stroke-width="2" d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                ${t.statsWeek}
            </div>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-value green" id="weekTaken">0</div>
                    <div class="stat-label">${t.statsBreaksTaken}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value blue" id="weekCompliance">0%</div>
                    <div class="stat-label">${t.statsCompliance}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value blue" id="weekRest">0m</div>
                    <div class="stat-label">${t.statsRestTime}</div>
                </div>
            </div>
        </div>

        <!-- Streaks -->
        <div class="card">
            <div class="card-title">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Streaks
            </div>
            <div class="streak-grid">
                <div class="streak-item">
                    <div class="streak-value green" id="currentStreak">0</div>
                    <div class="streak-label">${t.statsCurrentStreak}</div>
                </div>
                <div class="streak-item">
                    <div class="streak-value amber" id="longestStreak">0</div>
                    <div class="streak-label">${t.statsLongestStreak}</div>
                </div>
            </div>
        </div>

        <!-- Reset -->
        <button id="resetBtn" class="reset-btn">${t.statsReset}</button>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let userHasReset = false;

        function formatTime(seconds) {
            if (seconds < 60) return seconds + 's';
            const mins = Math.floor(seconds / 60);
            if (mins < 60) return mins + 'm';
            const hrs = Math.floor(mins / 60);
            return hrs + 'h ' + (mins % 60) + 'm';
        }

        function applyStats(stats, forceShow) {
            const hasData = stats.allTime.breaksTaken > 0 || stats.today.breaksTaken > 0 ||
                            stats.today.breaksSnoozed > 0 || stats.today.breaksDismissed > 0;
            const showStats = hasData || forceShow;

            document.getElementById('noData').classList.toggle('hidden', showStats);
            document.getElementById('statsContent').classList.toggle('hidden', !showStats);

            document.getElementById('todayTaken').textContent = stats.today.breaksTaken;
            document.getElementById('todaySnoozed').textContent = stats.today.breaksSnoozed;
            document.getElementById('todayRest').textContent = formatTime(stats.today.totalRestSeconds);

            document.getElementById('weekTaken').textContent = stats.week.breaksTaken;
            document.getElementById('weekCompliance').textContent = stats.week.complianceRate + '%';
            document.getElementById('weekRest').textContent = formatTime(stats.week.totalRestSeconds);

            document.getElementById('currentStreak').textContent = stats.allTime.currentStreak;
            document.getElementById('longestStreak').textContent = stats.allTime.longestStreak;
        }

        window.addEventListener('message', e => {
            if (e.data.command === 'stats') {
                applyStats(e.data.payload, userHasReset);
            }
            if (e.data.command === 'statsReset') {
                userHasReset = true;
                applyStats(e.data.payload, true);
            }
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'resetStats' });
        });

        vscode.postMessage({ command: 'getStats' });
    </script>
</body>
</html>`;
}

function getNonce(): string {
    let text = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}
