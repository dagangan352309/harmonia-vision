/**
 * Harmonia Vision - Recommendation Engine
 *
 * Pure logic module for computing ergonomic editor settings based on
 * user visual conditions and prescription data.
 *
 * CALIBRATION PHILOSOPHY (Golden Standard):
 * ─────────────────────────────────────────
 * This engine is calibrated against empirically proven comfort profiles,
 * NOT theoretical minimums. The "14px standard" fails real myopia users.
 *
 * Golden Baseline (sphere ≈ -2.0, cylinder ≈ -0.25):
 *   - fontSize: 18px (minimum for abs(sphere) >= 1.5)
 *   - fontWeight: "400" (normal - clear without excessive brightness)
 *   - lineHeight: 0 (VS Code auto-calc, or 1.5× ratio)
 *
 * Rule: If myopia is present, NEVER suggest a font size that forces
 * the user to lean into the screen. Comfort > theoretical optimum.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DiagnosticToggles {
    myopia: boolean;
    astigmatism: boolean;
    photophobia: boolean;
    eyeStrain: boolean;
    blurGhosting: boolean;
    crowding: boolean;
}

export interface PrescriptionInput {
    sphere: number | null;  // Diopters, can be negative (myopia) or positive
    cylinder: number | null; // Diopters, sign varies by notation
}

export interface CurrentSettings {
    fontSize?: number;
    lineHeight?: number;  // 0 = auto, 1-8 = ratio, >8 = pixels
    letterSpacing?: number;
    fontWeight?: string;
    cursorWidth?: number;
}

export interface RecommendationInput {
    prescription: PrescriptionInput;
    toggles: DiagnosticToggles;
    currentSettings?: CurrentSettings;  // Optional: use as baseline floor
}

export type LineHighlightType = 'none' | 'gutter' | 'line' | 'all';

export interface EditorSettings {
    fontSize: number;        // px, typical range 14-24 for comfort
    lineHeight: number;      // ratio (0 = auto, 1.4-2.0 for custom), NOT pixels
    letterSpacing: number;   // px, typical range 0.0-1.5
    fontWeight: string;      // "normal" (400), "500", etc.
    cursorWidth: number;     // px, typical range 1-5
    renderLineHighlight?: LineHighlightType; // 'none', 'gutter', 'line', 'all'
}

export interface SettingRationale {
    setting: keyof EditorSettings;
    value: number | string;
    reason: string;
}

export interface RecommendationOutput {
    settings: EditorSettings;
    rationale: SettingRationale[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Golden Standard Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CALIBRATION REFERENCE:
 * - Author profile: sphere -2.00, cylinder -0.25
 * - Proven comfort: 18px fontSize, 400 weight
 * - This is our "anchor point" for the scaling formula
 */
const GOLDEN_REFERENCE = {
    sphere: 2.0,      // abs value
    cylinder: 0.25,   // abs value
    fontSize: 18,
    fontWeight: '400',
};

// Baseline for users WITHOUT vision conditions
const BASELINE_FONT_SIZE = 14;

// Minimum font sizes based on sphere magnitude (comfort thresholds)
const MYOPIA_THRESHOLDS = {
    MILD: { sphere: 0.5, minFontSize: 15 },      // abs(sphere) >= 0.5
    MODERATE: { sphere: 1.0, minFontSize: 16 },  // abs(sphere) >= 1.0
    SIGNIFICANT: { sphere: 1.5, minFontSize: 18 }, // abs(sphere) >= 1.5
    HIGH: { sphere: 3.0, minFontSize: 20 },      // abs(sphere) >= 3.0
    VERY_HIGH: { sphere: 5.0, minFontSize: 22 }, // abs(sphere) >= 5.0
};

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 32;
const MIN_LINE_HEIGHT_RATIO = 1.4;
const MAX_LINE_HEIGHT_RATIO = 2.0;
const DEFAULT_LINE_HEIGHT_RATIO = 1.5;
const MIN_LETTER_SPACING = 0;
const MAX_LETTER_SPACING = 1.5;

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function round(value: number, decimals: number = 1): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Calculates the minimum comfortable font size for myopia based on
 * empirical calibration, NOT theoretical formulas.
 *
 * Anchored to: sphere -2.0 → 18px (Golden Standard)
 */
function calculateMyopiaFontSize(sphereMagnitude: number): number {
    if (sphereMagnitude >= MYOPIA_THRESHOLDS.VERY_HIGH.sphere) {
        return MYOPIA_THRESHOLDS.VERY_HIGH.minFontSize;
    }
    if (sphereMagnitude >= MYOPIA_THRESHOLDS.HIGH.sphere) {
        // Interpolate between 20 and 22 for sphere 3.0-5.0
        const progress = (sphereMagnitude - 3.0) / 2.0;
        return Math.round(20 + progress * 2);
    }
    if (sphereMagnitude >= MYOPIA_THRESHOLDS.SIGNIFICANT.sphere) {
        // Interpolate between 18 and 20 for sphere 1.5-3.0
        const progress = (sphereMagnitude - 1.5) / 1.5;
        return Math.round(18 + progress * 2);
    }
    if (sphereMagnitude >= MYOPIA_THRESHOLDS.MODERATE.sphere) {
        // Interpolate between 16 and 18 for sphere 1.0-1.5
        const progress = (sphereMagnitude - 1.0) / 0.5;
        return Math.round(16 + progress * 2);
    }
    if (sphereMagnitude >= MYOPIA_THRESHOLDS.MILD.sphere) {
        // Interpolate between 15 and 16 for sphere 0.5-1.0
        const progress = (sphereMagnitude - 0.5) / 0.5;
        return Math.round(15 + progress * 1);
    }

    // Very mild or no prescription - small boost from baseline
    if (sphereMagnitude > 0) {
        return BASELINE_FONT_SIZE + 1;
    }

    return BASELINE_FONT_SIZE;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recommendation Engine
// ─────────────────────────────────────────────────────────────────────────────

export function computeRecommendations(input: RecommendationInput): RecommendationOutput {
    const { prescription, toggles, currentSettings } = input;
    const rationale: SettingRationale[] = [];

    // Extract current settings as floor values
    const currentFontSize = currentSettings?.fontSize ?? BASELINE_FONT_SIZE;
    const currentLineHeight = currentSettings?.lineHeight ?? 0;

    // Extract prescription magnitudes (handle sign conventions)
    const sphereMagnitude = prescription.sphere !== null ? Math.abs(prescription.sphere) : 0;
    const cylinderMagnitude = prescription.cylinder !== null ? Math.abs(prescription.cylinder) : 0;

    // Detect if user has any vision condition
    const hasMyopia = toggles.myopia || sphereMagnitude > 0;
    const hasAstigmatism = toggles.astigmatism || cylinderMagnitude > 0;

    // ─────────────────────────────────────────────────────────────────────────
    // Font Size (Golden Standard Calibration)
    // Uses current setting as FLOOR - never recommend smaller than what user has
    // ─────────────────────────────────────────────────────────────────────────

    let fontSize = currentFontSize; // Start with user's current setting

    if (hasMyopia) {
        // Use empirically calibrated font size based on sphere magnitude
        const myopiaFontSize = calculateMyopiaFontSize(sphereMagnitude);

        // If toggle is checked but no prescription, use moderate baseline
        if (toggles.myopia && sphereMagnitude === 0) {
            const targetSize = MYOPIA_THRESHOLDS.MODERATE.minFontSize; // 16px
            if (targetSize > fontSize) {
                fontSize = targetSize;
                rationale.push({
                    setting: 'fontSize',
                    value: fontSize,
                    reason: `Increased to ${fontSize}px for myopia comfort – reduces ciliary muscle strain.`
                });
            }
        } else {
            // Use max of (current, recommended) - never decrease
            if (myopiaFontSize > fontSize) {
                fontSize = myopiaFontSize;
                rationale.push({
                    setting: 'fontSize',
                    value: fontSize,
                    reason: `Increased to ${fontSize}px based on sphere ${prescription.sphere}D – calibrated for relaxed focus.`
                });
            }
        }
    }

    // Additional boost for eye strain / blur symptoms
    if (toggles.eyeStrain || toggles.blurGhosting) {
        const boost = (toggles.eyeStrain ? 1 : 0) + (toggles.blurGhosting ? 1 : 0);
        const boostedSize = fontSize + boost;

        if (boostedSize > fontSize) {
            fontSize = boostedSize;
            rationale.push({
                setting: 'fontSize',
                value: fontSize,
                reason: `Boosted to ${fontSize}px – larger text reduces focusing effort and minimizes blur perception.`
            });
        }
    }

    fontSize = clamp(Math.round(fontSize), MIN_FONT_SIZE, MAX_FONT_SIZE);

    // ─────────────────────────────────────────────────────────────────────────
    // Line Height (as RATIO, respecting 0 = auto)
    // Only change from 0 if symptoms specifically require custom spacing
    // ─────────────────────────────────────────────────────────────────────────

    // Determine if we need to change lineHeight from current
    const needsLineHeightChange = hasAstigmatism || toggles.crowding || toggles.eyeStrain;

    let lineHeight: number;

    if (!needsLineHeightChange) {
        // No symptoms require line height change - keep current (including 0 = auto)
        lineHeight = currentLineHeight;
    } else {
        // Calculate recommended ratio
        let lineHeightRatio = DEFAULT_LINE_HEIGHT_RATIO;

        // Astigmatism or crowding: increase line height for better line tracking
        if (hasAstigmatism || toggles.crowding) {
            const cylinderBoost = Math.min(cylinderMagnitude * 0.15, 0.25);
            const toggleBoost = (toggles.astigmatism ? 0.1 : 0) + (toggles.crowding ? 0.1 : 0);
            lineHeightRatio += cylinderBoost + toggleBoost;
        }

        // General fatigue: ensure breathable code (>= 1.6)
        if (toggles.eyeStrain && lineHeightRatio < 1.6) {
            lineHeightRatio = 1.6;
        }

        // Round to 1 decimal place to match slider steps (0.1)
        lineHeightRatio = clamp(round(lineHeightRatio, 1), MIN_LINE_HEIGHT_RATIO, MAX_LINE_HEIGHT_RATIO);
        lineHeight = lineHeightRatio;

        // Add rationale after rounding
        if (hasAstigmatism || toggles.crowding) {
            rationale.push({
                setting: 'lineHeight',
                value: lineHeight,
                reason: `Ratio ${lineHeight}× – increased vertical space reduces crowding and improves line tracking.`
            });
        } else if (toggles.eyeStrain) {
            rationale.push({
                setting: 'lineHeight',
                value: lineHeight,
                reason: `Set to ${lineHeight}× for breathable code – adequate spacing reduces scan fatigue.`
            });
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Letter Spacing
    // ─────────────────────────────────────────────────────────────────────────

    let letterSpacing = 0;

    // Astigmatism: characters can blur together, spacing helps
    if (hasAstigmatism) {
        const cylinderBoost = Math.min(cylinderMagnitude * 0.3, 0.6);
        const toggleBoost = toggles.astigmatism ? 0.2 : 0;
        letterSpacing = Math.max(letterSpacing, cylinderBoost + toggleBoost);

        rationale.push({
            setting: 'letterSpacing',
            value: round(letterSpacing),
            reason: `Set to ${round(letterSpacing)}px – separates characters to reduce astigmatic blur overlap.`
        });
    }

    // Visual crowding: additional spacing
    if (toggles.crowding && letterSpacing < 0.5) {
        letterSpacing = Math.max(letterSpacing, 0.5);
        rationale.push({
            setting: 'letterSpacing',
            value: round(letterSpacing),
            reason: `Set to ${round(letterSpacing)}px – reduces visual crowding between characters.`
        });
    }

    letterSpacing = clamp(round(letterSpacing), MIN_LETTER_SPACING, MAX_LETTER_SPACING);

    // ─────────────────────────────────────────────────────────────────────────
    // Font Weight (Golden Standard: 400 for clarity without glare)
    // ─────────────────────────────────────────────────────────────────────────

    let fontWeight = GOLDEN_REFERENCE.fontWeight; // '400' (normal)

    // For very high myopia or blur/ghosting, slightly heavier can help glyph definition
    // BUT we don't go to 500 by default anymore - Golden Standard proved 400 is sufficient
    if (toggles.blurGhosting && sphereMagnitude >= 3.0) {
        fontWeight = '500';
        rationale.push({
            setting: 'fontWeight',
            value: fontWeight,
            reason: `Set to medium (500) – heavier strokes improve edge definition for high myopia with ghosting.`
        });
    }

    // Photophobia: ensure normal weight (avoid bright/heavy text)
    if (toggles.photophobia && fontWeight !== '400') {
        fontWeight = '400';
        rationale.push({
            setting: 'fontWeight',
            value: fontWeight,
            reason: `Kept at normal (400) – lighter weight reduces perceived brightness for light sensitivity.`
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cursor Width
    // ─────────────────────────────────────────────────────────────────────────

    let cursorWidth = 2; // Default

    // Larger cursor helps locate position with vision issues
    if (hasMyopia || toggles.blurGhosting) {
        if (sphereMagnitude >= 2.0 || toggles.blurGhosting) {
            cursorWidth = 3;
            rationale.push({
                setting: 'cursorWidth',
                value: cursorWidth,
                reason: `Set to ${cursorWidth}px – wider cursor is easier to locate and track.`
            });
        }
    }

    cursorWidth = clamp(cursorWidth, 1, 5);

    // ─────────────────────────────────────────────────────────────────────────
    // Build Output
    // ─────────────────────────────────────────────────────────────────────────

    // Add default rationale if no conditions triggered
    if (rationale.length === 0) {
        rationale.push({
            setting: 'fontSize',
            value: fontSize,
            reason: 'Default comfortable settings – adjust toggles or enter prescription for personalized recommendations.'
        });
    }

    return {
        settings: {
            fontSize,
            lineHeight,
            letterSpacing,
            fontWeight,
            cursorWidth,
        },
        rationale,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Self-Check / Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

export function runSelfChecks(): { passed: boolean; results: string[] } {
    const results: string[] = [];
    let allPassed = true;

    const check = (name: string, condition: boolean) => {
        if (condition) {
            results.push(`✓ ${name}`);
        } else {
            results.push(`✗ ${name}`);
            allPassed = false;
        }
    };

    const noToggles: DiagnosticToggles = {
        myopia: false,
        astigmatism: false,
        photophobia: false,
        eyeStrain: false,
        blurGhosting: false,
        crowding: false,
    };

    // Test 1: Default (no conditions) returns baseline 14px
    const defaultInput: RecommendationInput = {
        prescription: { sphere: null, cylinder: null },
        toggles: noToggles,
    };
    const defaultOutput = computeRecommendations(defaultInput);
    check('Default: fontSize is 14', defaultOutput.settings.fontSize === 14);

    // Test 2: GOLDEN STANDARD - sphere -2.0 → 18px minimum
    const goldenInput: RecommendationInput = {
        prescription: { sphere: -2.0, cylinder: -0.25 },
        toggles: { ...noToggles, myopia: true, astigmatism: true },
    };
    const goldenOutput = computeRecommendations(goldenInput);
    check('Golden Standard: fontSize >= 18', goldenOutput.settings.fontSize >= 18);
    check('Golden Standard: fontWeight is 400', goldenOutput.settings.fontWeight === '400');

    // Test 3: Significant myopia (sphere >= 1.5) → minimum 18px
    const significantMyopiaInput: RecommendationInput = {
        prescription: { sphere: -1.5, cylinder: null },
        toggles: { ...noToggles, myopia: true },
    };
    const significantMyopiaOutput = computeRecommendations(significantMyopiaInput);
    check('Significant myopia (1.5D): fontSize >= 18', significantMyopiaOutput.settings.fontSize >= 18);

    // Test 4: Moderate myopia (sphere 1.0) → minimum 16px
    const moderateMyopiaInput: RecommendationInput = {
        prescription: { sphere: -1.0, cylinder: null },
        toggles: { ...noToggles, myopia: true },
    };
    const moderateMyopiaOutput = computeRecommendations(moderateMyopiaInput);
    check('Moderate myopia (1.0D): fontSize >= 16', moderateMyopiaOutput.settings.fontSize >= 16);

    // Test 5: Myopia toggle without prescription → 16px (moderate baseline)
    const myopiaToggleOnlyInput: RecommendationInput = {
        prescription: { sphere: null, cylinder: null },
        toggles: { ...noToggles, myopia: true },
    };
    const myopiaToggleOnlyOutput = computeRecommendations(myopiaToggleOnlyInput);
    check('Myopia toggle only: fontSize >= 16', myopiaToggleOnlyOutput.settings.fontSize >= 16);

    // Test 6: High myopia (sphere >= 3.0) → 20px+
    const highMyopiaInput: RecommendationInput = {
        prescription: { sphere: -3.5, cylinder: null },
        toggles: { ...noToggles, myopia: true },
    };
    const highMyopiaOutput = computeRecommendations(highMyopiaInput);
    check('High myopia (3.5D): fontSize >= 20', highMyopiaOutput.settings.fontSize >= 20);

    // Test 7: Astigmatism increases letter spacing
    const astigmatismInput: RecommendationInput = {
        prescription: { sphere: null, cylinder: -1.0 },
        toggles: { ...noToggles, astigmatism: true },
    };
    const astigmatismOutput = computeRecommendations(astigmatismInput);
    check('Astigmatism: letterSpacing > 0', astigmatismOutput.settings.letterSpacing > 0);

    // Test 8: Photophobia keeps font weight at 400
    const photophobiaInput: RecommendationInput = {
        prescription: { sphere: -4.0, cylinder: null },
        toggles: { ...noToggles, myopia: true, blurGhosting: true, photophobia: true },
    };
    const photophobiaOutput = computeRecommendations(photophobiaInput);
    check('Photophobia: fontWeight stays 400', photophobiaOutput.settings.fontWeight === '400');

    // Test 9: Values stay within bounds for extreme input
    const extremeInput: RecommendationInput = {
        prescription: { sphere: -10.0, cylinder: -5.0 },
        toggles: {
            myopia: true,
            astigmatism: true,
            photophobia: true,
            eyeStrain: true,
            blurGhosting: true,
            crowding: true,
        },
    };
    const extremeOutput = computeRecommendations(extremeInput);
    check('Extreme: fontSize <= 32', extremeOutput.settings.fontSize <= MAX_FONT_SIZE);
    check('Extreme: letterSpacing <= 1.5', extremeOutput.settings.letterSpacing <= MAX_LETTER_SPACING);
    check('Extreme: cursorWidth <= 5', extremeOutput.settings.cursorWidth <= 5);

    // Test 10: Rationale is always provided
    check('Rationale: has entries', goldenOutput.rationale.length > 0);

    return { passed: allPassed, results };
}
