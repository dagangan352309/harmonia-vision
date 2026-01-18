import * as vscode from 'vscode';
import { Translations } from '../i18n/translations';

export function getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    t: Translations
): string {
    const nonce = getNonce();
    const lang = vscode.env.language.split('-')[0] || 'en';

    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'nonce-${nonce}' https://cdn.tailwindcss.com;">
    <script src="https://cdn.tailwindcss.com"></script>
    <script nonce="${nonce}">
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'vscode-bg': 'var(--vscode-editor-background)',
                        'vscode-fg': 'var(--vscode-foreground)',
                        'vscode-muted': 'var(--vscode-descriptionForeground)',
                        'vscode-border': 'var(--vscode-widget-border)',
                        'vscode-input-bg': 'var(--vscode-input-background)',
                        'vscode-input-fg': 'var(--vscode-input-foreground)',
                        'vscode-btn': 'var(--vscode-button-background)',
                        'vscode-btn-fg': 'var(--vscode-button-foreground)',
                        'vscode-btn-hover': 'var(--vscode-button-hoverBackground)',
                        'vscode-sidebar': 'var(--vscode-sideBar-background)',
                        'vscode-focus': 'var(--vscode-focusBorder)',
                    }
                }
            }
        }
    </script>
    <title>${t.title}</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .slider {
            -webkit-appearance: none;
            appearance: none;
            height: 6px;
            background: var(--vscode-scrollbarSlider-background);
            border-radius: 3px;
            outline: none;
        }
        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--vscode-button-background);
            cursor: pointer;
            border: 2px solid var(--vscode-editor-background);
        }
        .slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--vscode-button-background);
            cursor: pointer;
            border: 2px solid var(--vscode-editor-background);
        }
        pre, code {
            background: transparent !important;
            -webkit-user-select: none;
            user-select: none;
        }
        pre code {
            display: block;
            color: var(--vscode-editor-foreground);
        }
        /* Hide number input spinners */
        input[type="text"].prescription-input::-webkit-outer-spin-button,
        input[type="text"].prescription-input::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type="number"] {
            -moz-appearance: textfield;
        }
        /* Consistent borders using a reliable color */
        .bordered {
            border: 1px solid rgba(128, 128, 128, 0.4) !important;
            outline: none !important;
        }
        .bordered:hover {
            border: 1px solid rgba(128, 128, 128, 0.6) !important;
        }
        input.bordered:focus,
        input.bordered:focus-visible,
        .bordered:focus,
        .bordered:focus-visible {
            border-color: var(--vscode-button-background) !important;
            outline: none !important;
        }
        /* Tooltip styles */
        .tooltip {
            position: relative;
        }
        .tooltip .tooltip-text {
            visibility: hidden;
            opacity: 0;
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--vscode-editorWidget-background, #252526);
            color: var(--vscode-foreground);
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 11px;
            line-height: 1.4;
            width: 220px;
            text-align: left;
            z-index: 100;
            margin-bottom: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 1px solid var(--vscode-widget-border);
            transition: opacity 0.2s, visibility 0.2s;
        }
        .tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
        }
        /* Code Preview with Gutter */
        .code-preview {
            font-family: var(--vscode-editor-font-family, 'Consolas', 'Courier New', monospace);
            font-size: 12px;
            line-height: 1.5;
        }
        .code-line {
            display: flex;
            min-height: 1.5em;
        }
        .code-line .gutter {
            width: 32px;
            min-width: 32px;
            padding: 0 8px;
            text-align: right;
            color: var(--vscode-editorLineNumber-foreground, #858585);
            background: var(--vscode-editorGutter-background, transparent);
            user-select: none;
            flex-shrink: 0;
        }
        .code-line .code-content {
            flex: 1;
            padding-left: 8px;
            white-space: pre;
        }
        /* Line highlight modes */
        .code-preview[data-highlight="all"] .active-line .gutter {
            color: var(--vscode-editorLineNumber-activeForeground, #c6c6c6);
            background: var(--vscode-editor-lineHighlightBackground, rgba(255,255,255,0.1));
        }
        .code-preview[data-highlight="all"] .active-line .code-content {
            background: var(--vscode-editor-lineHighlightBackground, rgba(255,255,255,0.1));
        }
        .code-preview[data-highlight="line"] .active-line .gutter {
            color: var(--vscode-editorLineNumber-activeForeground, #c6c6c6);
        }
        .code-preview[data-highlight="line"] .active-line .code-content {
            background: var(--vscode-editor-lineHighlightBackground, rgba(255,255,255,0.1));
        }
        .code-preview[data-highlight="gutter"] .active-line .gutter {
            color: var(--vscode-editorLineNumber-activeForeground, #c6c6c6);
            background: var(--vscode-editor-lineHighlightBackground, rgba(255,255,255,0.1));
        }
        .code-preview[data-highlight="none"] .active-line .gutter,
        .code-preview[data-highlight="none"] .active-line .code-content {
            /* No highlight */
        }
    </style>
</head>
<body class="p-6 max-w-3xl mx-auto">
    <!-- Header -->
    <header class="text-center mb-8">
        <h1 class="text-2xl font-semibold mb-1">${t.title}</h1>
        <p class="text-vscode-muted text-sm">${t.subtitle}</p>
    </header>

    <!-- Medical Disclaimer -->
    <div class="flex items-start gap-3 p-4 mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10">
        <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <div>
            <span class="font-medium text-sm block text-amber-500">${t.disclaimer}</span>
            <p class="text-xs text-vscode-muted mt-1">${t.disclaimerText}</p>
        </div>
    </div>

    <!-- Backup Status -->
    <div class="flex items-center gap-4 p-4 mb-6 rounded-lg border border-vscode-border bg-vscode-sidebar">
        <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
        </div>
        <div class="flex-1">
            <span class="font-medium text-sm block">${t.lastSavedSettings}</span>
            <span class="text-xs text-vscode-muted" id="snapshotAge"></span>
        </div>
        <div class="flex gap-3 text-xs">
            <div class="text-center px-2 py-1 bg-vscode-input-bg rounded">
                <span class="block text-vscode-muted uppercase text-[10px]">${t.size}</span>
                <span class="font-semibold" id="origFontSize">--</span>
            </div>
            <div class="text-center px-2 py-1 bg-vscode-input-bg rounded">
                <span class="block text-vscode-muted uppercase text-[10px]">${t.height}</span>
                <span class="font-semibold" id="origLineHeight">--</span>
            </div>
            <div class="text-center px-2 py-1 bg-vscode-input-bg rounded">
                <span class="block text-vscode-muted uppercase text-[10px]">${t.weight}</span>
                <span class="font-semibold" id="origFontWeight">--</span>
            </div>
        </div>
    </div>

    <!-- Visual Profile Section -->
    <section class="mb-6 p-5 rounded-lg border border-vscode-border bg-vscode-sidebar">
        <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-lg bg-vscode-input-bg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                    <circle cx="12" cy="12" r="3" stroke-width="1.5"/>
                </svg>
            </div>
            <div>
                <h2 class="font-semibold">${t.visualProfile}</h2>
                <p class="text-xs text-vscode-muted">${t.visualProfileDesc}</p>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-2 mb-5">
            <label class="condition-card bordered cursor-pointer p-3 rounded-lg bg-vscode-input-bg transition-all text-center relative">
                <input type="checkbox" id="myopia" class="sr-only peer">
                <svg class="w-6 h-6 mx-auto mb-1 text-vscode-muted peer-checked:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                    <path stroke-width="1.5" d="M8 12h8M12 8v8"/>
                </svg>
                <span class="text-xs font-medium block peer-checked:text-blue-400">${t.myopia}</span>
                <span class="text-[10px] text-vscode-muted">${t.myopiaDesc}</span>
            </label>

            <label class="condition-card bordered cursor-pointer p-3 rounded-lg bg-vscode-input-bg transition-all text-center relative">
                <input type="checkbox" id="astigmatism" class="sr-only peer">
                <svg class="w-6 h-6 mx-auto mb-1 text-vscode-muted peer-checked:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="12" rx="10" ry="6" stroke-width="1.5"/>
                    <ellipse cx="12" cy="12" rx="6" ry="10" stroke-width="1.5"/>
                </svg>
                <span class="text-xs font-medium block peer-checked:text-blue-400">${t.astigmatism}</span>
                <span class="text-[10px] text-vscode-muted">${t.astigmatismDesc}</span>
            </label>

            <label class="condition-card bordered cursor-pointer p-3 rounded-lg bg-vscode-input-bg transition-all text-center relative">
                <input type="checkbox" id="eyeStrain" class="sr-only peer">
                <svg class="w-6 h-6 mx-auto mb-1 text-vscode-muted peer-checked:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
                    <path stroke-width="1.5" d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>
                </svg>
                <span class="text-xs font-medium block peer-checked:text-blue-400">${t.eyeStrain}</span>
                <span class="text-[10px] text-vscode-muted">${t.eyeStrainDesc}</span>
            </label>

            <label class="condition-card bordered cursor-pointer p-3 rounded-lg bg-vscode-input-bg transition-all text-center relative">
                <input type="checkbox" id="blurGhosting" class="sr-only peer">
                <svg class="w-6 h-6 mx-auto mb-1 text-vscode-muted peer-checked:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke-width="1.5"/>
                    <rect x="7" y="7" width="10" height="10" rx="1" stroke-width="1" opacity="0.5"/>
                </svg>
                <span class="text-xs font-medium block peer-checked:text-blue-400">${t.blurGhost}</span>
                <span class="text-[10px] text-vscode-muted">${t.blurGhostDesc}</span>
            </label>

            <label class="condition-card bordered cursor-pointer p-3 rounded-lg bg-vscode-input-bg transition-all text-center relative">
                <input type="checkbox" id="photophobia" class="sr-only peer">
                <svg class="w-6 h-6 mx-auto mb-1 text-vscode-muted peer-checked:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="5" stroke-width="1.5"/>
                    <path stroke-width="1.5" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/>
                </svg>
                <span class="text-xs font-medium block peer-checked:text-blue-400">${t.lightSens}</span>
                <span class="text-[10px] text-vscode-muted">${t.lightSensDesc}</span>
            </label>

            <label class="condition-card bordered cursor-pointer p-3 rounded-lg bg-vscode-input-bg transition-all text-center relative">
                <input type="checkbox" id="crowding" class="sr-only peer">
                <svg class="w-6 h-6 mx-auto mb-1 text-vscode-muted peer-checked:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-width="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
                <span class="text-xs font-medium block peer-checked:text-blue-400">${t.crowding}</span>
                <span class="text-[10px] text-vscode-muted">${t.crowdingDesc}</span>
            </label>
        </div>

        <!-- Prescription -->
        <div class="bg-vscode-input-bg rounded-lg p-4 mb-4">
            <div class="flex items-center gap-2 mb-3">
                <svg class="w-4 h-4 text-vscode-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-width="1.5" d="M9 12h6M12 9v6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
                </svg>
                <span class="text-xs font-medium">${t.prescriptionTitle} ${t.prescriptionOptional}</span>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <div class="flex items-center gap-1 mb-1">
                        <label class="text-[10px] text-vscode-muted uppercase">${t.sphere}</label>
                        <div class="tooltip">
                            <svg class="w-3 h-3 text-vscode-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                <path stroke-width="2" d="M12 16v-4M12 8h.01"/>
                            </svg>
                            <span class="tooltip-text">${t.sphereTooltip}</span>
                        </div>
                    </div>
                    <div class="relative">
                        <input type="text" id="sphere" inputmode="decimal" placeholder="-2.00"
                            class="bordered w-full px-3 py-2 bg-vscode-bg rounded text-sm">
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-vscode-muted pointer-events-none">D</span>
                    </div>
                </div>
                <div>
                    <div class="flex items-center gap-1 mb-1">
                        <label class="text-[10px] text-vscode-muted uppercase">${t.cylinder}</label>
                        <div class="tooltip">
                            <svg class="w-3 h-3 text-vscode-muted cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke-width="2"/>
                                <path stroke-width="2" d="M12 16v-4M12 8h.01"/>
                            </svg>
                            <span class="tooltip-text">${t.cylinderTooltip}</span>
                        </div>
                    </div>
                    <div class="relative">
                        <input type="text" id="cylinder" inputmode="decimal" placeholder="-0.25"
                            class="bordered w-full px-3 py-2 bg-vscode-bg rounded text-sm">
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-vscode-muted pointer-events-none">D</span>
                    </div>
                </div>
            </div>
        </div>

        <button id="generateBtn" class="w-full py-3 px-4 bg-vscode-btn text-vscode-btn-fg rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            ${t.generateRecommendations}
        </button>
    </section>

    <!-- Recommendations -->
    <section class="mb-6 p-5 rounded-lg border border-vscode-border bg-vscode-sidebar">
        <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-lg bg-vscode-btn flex items-center justify-center">
                <svg class="w-5 h-5 text-vscode-btn-fg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <div>
                <h2 class="font-semibold">${t.recommendations}</h2>
                <p class="text-xs text-vscode-muted">${t.recommendationsDesc}</p>
            </div>
        </div>
        <div id="recommendationsContent" class="text-center py-6 text-vscode-muted text-sm">
            <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            <p>${t.recommendationsEmpty}</p>
        </div>
    </section>

    <!-- Editor Settings -->
    <section class="mb-6 p-5 rounded-lg border border-vscode-border bg-vscode-sidebar">
        <div class="flex items-center gap-3 mb-5">
            <div class="w-9 h-9 rounded-lg bg-vscode-input-bg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" stroke-width="1.5"/>
                    <path stroke-width="1.5" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
            </div>
            <div>
                <h2 class="font-semibold">${t.editorSettings}</h2>
                <p class="text-xs text-vscode-muted">${t.editorSettingsDesc}</p>
            </div>
        </div>

        <div class="space-y-5">
            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium">${t.fontSize}</label>
                    <span id="fontSizeValue" class="text-xs font-semibold px-2 py-0.5 bg-vscode-btn/20 text-vscode-btn rounded">14px</span>
                </div>
                <input type="range" id="fontSize" min="12" max="32" value="14" class="slider w-full">
                <div class="flex justify-between text-[10px] text-vscode-muted mt-1">
                    <span>12px</span>
                    <span>32px</span>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium">${t.lineHeight}</label>
                    <span id="lineHeightValue" class="text-xs font-semibold px-2 py-0.5 bg-vscode-btn/20 text-vscode-btn rounded">${t.auto}</span>
                </div>
                <input type="range" id="lineHeight" min="0" max="2.2" step="0.1" value="0" class="slider w-full">
                <div class="flex justify-between text-[10px] text-vscode-muted mt-1">
                    <span>${t.auto}</span>
                    <span>2.2x</span>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium">${t.letterSpacing}</label>
                    <span id="letterSpacingValue" class="text-xs font-semibold px-2 py-0.5 bg-vscode-btn/20 text-vscode-btn rounded">0px</span>
                </div>
                <input type="range" id="letterSpacing" min="0" max="1.5" step="0.1" value="0" class="slider w-full">
                <div class="flex justify-between text-[10px] text-vscode-muted mt-1">
                    <span>0px</span>
                    <span>1.5px</span>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium">${t.fontWeight}</label>
                    <span id="fontWeightValue" class="text-xs font-semibold px-2 py-0.5 bg-vscode-btn/20 text-vscode-btn rounded">400</span>
                </div>
                <input type="range" id="fontWeight" min="300" max="700" step="100" value="400" class="slider w-full">
                <div class="flex justify-between text-[10px] text-vscode-muted mt-1">
                    <span>${t.light}</span>
                    <span>${t.bold}</span>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium">${t.cursorWidth}</label>
                    <span id="cursorWidthValue" class="text-xs font-semibold px-2 py-0.5 bg-vscode-btn/20 text-vscode-btn rounded">2px</span>
                </div>
                <input type="range" id="cursorWidth" min="1" max="5" value="2" class="slider w-full">
                <div class="flex justify-between text-[10px] text-vscode-muted mt-1">
                    <span>1px</span>
                    <span>5px</span>
                </div>
            </div>

            <div>
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-medium">${t.lineHighlight}</label>
                </div>
                <select id="renderLineHighlight" class="bordered w-full px-3 py-2 bg-vscode-bg rounded text-sm cursor-pointer">
                    <option value="all">${t.lineHighlightAll}</option>
                    <option value="line">${t.lineHighlightLine}</option>
                    <option value="gutter">${t.lineHighlightGutter}</option>
                    <option value="none">${t.lineHighlightNone}</option>
                </select>
            </div>
        </div>
    </section>

    <!-- Live Preview -->
    <section class="mb-24 p-5 rounded-lg border border-vscode-border bg-vscode-sidebar">
        <div class="flex items-center gap-3 mb-4">
            <div class="w-9 h-9 rounded-lg bg-vscode-input-bg flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" stroke-width="1.5"/>
                    <path stroke-width="1.5" d="M8 21h8M12 17v4"/>
                </svg>
            </div>
            <div>
                <h2 class="font-semibold">${t.livePreview}</h2>
                <p class="text-xs text-vscode-muted">${t.livePreviewDesc}</p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg border border-vscode-border overflow-hidden bg-vscode-bg">
                <div class="px-3 py-2 bg-vscode-input-bg border-b border-vscode-border">
                    <span class="text-xs font-semibold">${t.original}</span>
                </div>
                <div id="originalPreview" class="code-preview overflow-auto h-40 m-0 bg-vscode-bg" data-highlight="all">
                    <div class="code-line"><span class="gutter">1</span><span class="code-content">function calculateTotal(items) {</span></div>
                    <div class="code-line"><span class="gutter">2</span><span class="code-content">    let total = 0;</span></div>
                    <div class="code-line active-line"><span class="gutter">3</span><span class="code-content">    for (const item of items) {</span></div>
                    <div class="code-line"><span class="gutter">4</span><span class="code-content">        total += item.price * item.qty;</span></div>
                    <div class="code-line"><span class="gutter">5</span><span class="code-content">    }</span></div>
                    <div class="code-line"><span class="gutter">6</span><span class="code-content">    return total.toFixed(2);</span></div>
                    <div class="code-line"><span class="gutter">7</span><span class="code-content">}</span></div>
                    <div class="code-line"><span class="gutter">8</span><span class="code-content"></span></div>
                    <div class="code-line"><span class="gutter">9</span><span class="code-content">const order = calculateTotal(cart);</span></div>
                </div>
            </div>
            <div class="rounded-lg border border-vscode-border overflow-hidden bg-vscode-bg">
                <div class="px-3 py-2 bg-vscode-input-bg border-b border-vscode-border flex justify-between items-center">
                    <span class="text-xs font-semibold">${t.preview}</span>
                    <span class="text-[10px] px-2 py-0.5 bg-green-500 text-white rounded-full font-semibold">${t.live}</span>
                </div>
                <div id="previewCode" class="code-preview overflow-auto h-40 m-0 bg-vscode-bg" data-highlight="all">
                    <div class="code-line"><span class="gutter">1</span><span class="code-content">function calculateTotal(items) {</span></div>
                    <div class="code-line"><span class="gutter">2</span><span class="code-content">    let total = 0;</span></div>
                    <div class="code-line active-line"><span class="gutter">3</span><span class="code-content">    for (const item of items) {</span></div>
                    <div class="code-line"><span class="gutter">4</span><span class="code-content">        total += item.price * item.qty;</span></div>
                    <div class="code-line"><span class="gutter">5</span><span class="code-content">    }</span></div>
                    <div class="code-line"><span class="gutter">6</span><span class="code-content">    return total.toFixed(2);</span></div>
                    <div class="code-line"><span class="gutter">7</span><span class="code-content">}</span></div>
                    <div class="code-line"><span class="gutter">8</span><span class="code-content"></span></div>
                    <div class="code-line"><span class="gutter">9</span><span class="code-content">const order = calculateTotal(cart);</span></div>
                </div>
            </div>
        </div>
    </section>

    <!-- Action Bar -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-vscode-bg border-t border-vscode-border">
        <div class="flex justify-center gap-2 max-w-lg mx-auto">
            <button id="revertBtn" disabled class="bordered py-3 px-4 bg-vscode-input-bg text-vscode-fg rounded-lg font-medium text-sm hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3v5h5"/>
                </svg>
                ${t.revert}
            </button>
            <button id="previewBtn" class="bordered flex-1 py-3 px-4 bg-vscode-input-bg text-vscode-fg rounded-lg font-medium text-sm hover:opacity-80 transition-opacity flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                ${t.preview}
            </button>
            <button id="saveBtn" class="bordered py-3 px-5 bg-vscode-btn text-vscode-btn-fg rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                ${t.save}
            </button>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const translations = ${JSON.stringify(t.settingNames)};

        let originalSettings = null;
        let currentSettings = null;

        const toggleIds = ['myopia', 'astigmatism', 'photophobia', 'eyeStrain', 'blurGhosting', 'crowding'];
        const sliderIds = ['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight', 'cursorWidth'];

        const generateBtn = document.getElementById('generateBtn');
        const previewBtn = document.getElementById('previewBtn');
        const saveBtn = document.getElementById('saveBtn');
        const revertBtn = document.getElementById('revertBtn');
        const recommendationsContent = document.getElementById('recommendationsContent');
        const snapshotAgeEl = document.getElementById('snapshotAge');
        const originalPreview = document.getElementById('originalPreview');
        const previewCode = document.getElementById('previewCode');

        function getLineHeightDisplay(value) {
            if (value === 0 || value === undefined || value === null) return '${t.auto}';
            if (value <= 8) return value.toFixed(1) + 'x';
            return value + 'px';
        }

        function getLineHeightCss(value) {
            if (value === 0 || value === undefined || value === null) return 'normal';
            if (value <= 8) return value;
            return value + 'px';
        }

        function updateSliderDisplay(id, value) {
            const el = document.getElementById(id + 'Value');
            if (!el) return;
            switch (id) {
                case 'fontSize': el.textContent = value + 'px'; break;
                case 'lineHeight': el.textContent = getLineHeightDisplay(parseFloat(value)); break;
                case 'letterSpacing': el.textContent = parseFloat(value).toFixed(1) + 'px'; break;
                case 'fontWeight': el.textContent = value; break;
                case 'cursorWidth': el.textContent = value + 'px'; break;
            }
        }

        function updateSliderValue(id, value) {
            const el = document.getElementById(id);
            if (el) {
                el.value = value;
                updateSliderDisplay(id, value);
            }
        }

        function updateOriginalSettingsDisplay(settings) {
            if (!settings) return;
            document.getElementById('origFontSize').textContent = (settings.fontSize || 14) + 'px';
            document.getElementById('origLineHeight').textContent = getLineHeightDisplay(settings.lineHeight);
            document.getElementById('origFontWeight').textContent = settings.fontWeight === 'normal' ? '400' : (settings.fontWeight || '400');
        }

        function applyStylesToPreview(container, fontSize, lineHeight, fontWeight, letterSpacing, lineHighlight) {
            container.style.fontSize = fontSize + 'px';
            container.style.lineHeight = getLineHeightCss(lineHeight);
            container.style.fontWeight = fontWeight === 'normal' ? '400' : fontWeight;
            container.style.letterSpacing = letterSpacing + 'px';
            container.dataset.highlight = lineHighlight || 'all';
        }

        function updateComparisonPreview() {
            if (originalSettings) {
                const fs = originalSettings.fontSize || 14;
                const lh = originalSettings.lineHeight;
                const wt = originalSettings.fontWeight || 'normal';
                const sp = originalSettings.letterSpacing || 0;
                const hl = originalSettings.renderLineHighlight || 'all';
                applyStylesToPreview(originalPreview, fs, lh, wt, sp, hl);
            }
            const s = collectSliderSettings();
            applyStylesToPreview(previewCode, s.fontSize, s.lineHeight, s.fontWeight, s.letterSpacing, s.renderLineHighlight);
        }

        function collectDiagnosticInput() {
            const toggles = {};
            toggleIds.forEach(id => {
                const el = document.getElementById(id);
                toggles[id] = el ? el.checked : false;
            });
            const sphereEl = document.getElementById('sphere');
            const cylinderEl = document.getElementById('cylinder');
            return {
                prescription: {
                    sphere: sphereEl && sphereEl.value !== '' ? parseFloat(sphereEl.value) : null,
                    cylinder: cylinderEl && cylinderEl.value !== '' ? parseFloat(cylinderEl.value) : null,
                },
                toggles: toggles,
            };
        }

        function collectSliderSettings() {
            const fontSize = parseInt(document.getElementById('fontSize').value, 10) || 14;
            const lineHeight = parseFloat(document.getElementById('lineHeight').value) || 0;
            const letterSpacing = parseFloat(document.getElementById('letterSpacing').value) || 0;
            const fontWeight = parseInt(document.getElementById('fontWeight').value, 10) || 400;
            const cursorWidth = parseInt(document.getElementById('cursorWidth').value, 10) || 2;
            const renderLineHighlight = document.getElementById('renderLineHighlight').value || 'all';
            return {
                fontSize,
                lineHeight,
                letterSpacing,
                fontWeight: fontWeight === 400 ? 'normal' : String(fontWeight),
                cursorWidth,
                renderLineHighlight,
            };
        }

        function applySettingsToSliders(settings) {
            if (!settings) return;
            if (settings.fontSize !== undefined) updateSliderValue('fontSize', settings.fontSize);
            if (settings.lineHeight !== undefined) {
                if (settings.lineHeight === 0) updateSliderValue('lineHeight', 0);
                else if (settings.lineHeight <= 8) updateSliderValue('lineHeight', settings.lineHeight);
                else if (settings.fontSize) updateSliderValue('lineHeight', Math.min(2.2, settings.lineHeight / settings.fontSize));
            }
            if (settings.letterSpacing !== undefined) updateSliderValue('letterSpacing', settings.letterSpacing);
            if (settings.fontWeight !== undefined) {
                const w = settings.fontWeight === 'normal' ? 400 : parseInt(settings.fontWeight, 10) || 400;
                updateSliderValue('fontWeight', w);
            }
            if (settings.cursorWidth !== undefined) updateSliderValue('cursorWidth', settings.cursorWidth);
            if (settings.renderLineHighlight !== undefined) {
                const selectEl = document.getElementById('renderLineHighlight');
                if (selectEl) selectEl.value = settings.renderLineHighlight;
            }
            updateComparisonPreview();
        }

        function displayRecommendations(rec) {
            applySettingsToSliders(rec.settings);
            if (rec.rationale && rec.rationale.length > 0) {
                let html = '<div class="space-y-2">';
                rec.rationale.forEach(item => {
                    html += '<div class="flex gap-3 p-3 bg-vscode-input-bg rounded-lg border-l-2 border-green-500 items-start">';
                    html += '<svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
                    html += '<div class="text-left"><strong class="text-sm block text-left">' + (translations[item.setting] || item.setting) + '</strong>';
                    html += '<p class="text-xs text-vscode-muted text-left">' + item.reason + '</p></div></div>';
                });
                html += '</div>';
                recommendationsContent.innerHTML = html;
            }
        }

        function handleFullState(payload) {
            originalSettings = payload.snapshot || payload.current;
            currentSettings = payload.current;
            updateOriginalSettingsDisplay(originalSettings);
            if (payload.snapshotAge) snapshotAgeEl.textContent = payload.snapshotAge;
            revertBtn.disabled = !payload.hasSnapshot;
            applySettingsToSliders(payload.current);
        }

        generateBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'updateInput', payload: collectDiagnosticInput() });
        });

        previewBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'previewSettings', payload: collectSliderSettings() });
        });

        saveBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'saveSettings', payload: collectSliderSettings() });
        });

        revertBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'revert' });
        });

        sliderIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', e => {
                    updateSliderDisplay(id, e.target.value);
                    updateComparisonPreview();
                });
            }
        });

        // Line highlight dropdown change handler
        const lineHighlightSelect = document.getElementById('renderLineHighlight');
        if (lineHighlightSelect) {
            lineHighlightSelect.addEventListener('change', () => {
                updateComparisonPreview();
            });
        }

        window.addEventListener('message', event => {
            const msg = event.data;
            switch (msg.command) {
                case 'recommendations': displayRecommendations(msg.payload); break;
                case 'currentSettings': applySettingsToSliders(msg.payload); break;
                case 'fullState': handleFullState(msg.payload); break;
            }
        });

        sliderIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) updateSliderDisplay(id, el.value);
        });

        // Prescription input validation - only allow decimals up to 2 places
        function validateDecimalInput(input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value;
                value = value.replace(/[^0-9.\\-]/g, '');
                if (value.indexOf('-') > 0) {
                    value = value.replace(/-/g, '');
                }
                const parts = value.split('.');
                if (parts.length > 2) {
                    value = parts[0] + '.' + parts.slice(1).join('');
                }
                if (parts.length === 2 && parts[1].length > 2) {
                    value = parts[0] + '.' + parts[1].substring(0, 2);
                }
                e.target.value = value;
            });
            input.addEventListener('keypress', function(e) {
                const char = String.fromCharCode(e.which);
                const value = e.target.value;
                if (!/[0-9.\\-]/.test(char)) {
                    e.preventDefault();
                    return;
                }
                if (char === '-' && (value.length > 0 || e.target.selectionStart > 0)) {
                    e.preventDefault();
                    return;
                }
                if (char === '.' && value.includes('.')) {
                    e.preventDefault();
                    return;
                }
                const decimalIndex = value.indexOf('.');
                if (decimalIndex !== -1 && e.target.selectionStart > decimalIndex) {
                    const decimals = value.substring(decimalIndex + 1);
                    if (decimals.length >= 2) {
                        e.preventDefault();
                        return;
                    }
                }
            });
        }

        const sphereInput = document.getElementById('sphere');
        const cylinderInput = document.getElementById('cylinder');
        if (sphereInput) validateDecimalInput(sphereInput);
        if (cylinderInput) validateDecimalInput(cylinderInput);

        vscode.postMessage({ command: 'getInitialState' });
    </script>
</body>
</html>`;
}

function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
