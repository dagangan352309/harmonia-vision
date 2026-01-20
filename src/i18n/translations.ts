/**
 * Harmonia Vision - Internationalization
 *
 * Provides translations for the webview UI.
 * Supports English (en) and Spanish (es).
 */

export interface Translations {
    // Header
    title: string;
    subtitle: string;

    // Backup status
    lastSavedSettings: string;
    size: string;
    height: string;
    weight: string;

    // Visual Profile
    visualProfile: string;
    visualProfileDesc: string;

    // Conditions
    myopia: string;
    myopiaDesc: string;
    astigmatism: string;
    astigmatismDesc: string;
    eyeStrain: string;
    eyeStrainDesc: string;
    blurGhost: string;
    blurGhostDesc: string;
    lightSens: string;
    lightSensDesc: string;
    crowding: string;
    crowdingDesc: string;

    // Prescription
    prescriptionTitle: string;
    prescriptionOptional: string;
    sphere: string;
    sphereTooltip: string;
    cylinder: string;
    cylinderTooltip: string;

    // Generate button
    generateRecommendations: string;

    // Recommendations
    recommendations: string;
    recommendationsDesc: string;
    recommendationsEmpty: string;

    // Editor Settings
    editorSettings: string;
    editorSettingsDesc: string;
    fontSize: string;
    lineHeight: string;
    letterSpacing: string;
    fontWeight: string;
    cursorWidth: string;
    lineHighlight: string;
    lineHighlightNone: string;
    lineHighlightGutter: string;
    lineHighlightLine: string;
    lineHighlightAll: string;
    auto: string;
    light: string;
    bold: string;

    // Preview
    livePreview: string;
    livePreviewDesc: string;
    original: string;
    preview: string;
    live: string;

    // Actions
    revert: string;
    save: string;

    // Disclaimer
    disclaimer: string;
    disclaimerText: string;

    // Setting names for recommendations
    settingNames: {
        fontSize: string;
        lineHeight: string;
        letterSpacing: string;
        fontWeight: string;
        cursorWidth: string;
    };

    // Pause/Eye Break Feature
    pauseSection: string;
    pauseSectionDesc: string;
    pauseEnabled: string;
    pauseEnabledDesc: string;
    pauseWorkInterval: string;
    pauseWorkIntervalDesc: string;
    pauseBreakDuration: string;
    pauseBreakDurationDesc: string;
    pauseShowStatusBar: string;
    pauseShowStatusBarDesc: string;
    pauseWhenIdle: string;
    pauseWhenIdleDesc: string;
    pauseTakeBreakNow: string;
    pauseStatus: string;
    pauseStatusActive: string;
    pauseStatusInactive: string;
    pauseStatusOnBreak: string;
    pauseMinutes: string;
    pauseSeconds: string;
}

const en: Translations = {
    // Header
    title: 'Harmonia Vision',
    subtitle: 'Personalized editor settings for visual comfort',

    // Backup status
    lastSavedSettings: 'Last saved settings',
    size: 'Size',
    height: 'Height',
    weight: 'Weight',

    // Visual Profile
    visualProfile: 'Visual Profile',
    visualProfileDesc: 'Select conditions that affect your vision',

    // Conditions
    myopia: 'Myopia',
    myopiaDesc: 'Nearsighted',
    astigmatism: 'Astigmatism',
    astigmatismDesc: 'Blurred',
    eyeStrain: 'Eye Strain',
    eyeStrainDesc: 'Fatigue',
    blurGhost: 'Blur/Ghost',
    blurGhostDesc: 'Double vision',
    lightSens: 'Light Sens.',
    lightSensDesc: 'Photophobia',
    crowding: 'Crowding',
    crowdingDesc: 'Dense text',

    // Prescription
    prescriptionTitle: 'Prescription',
    prescriptionOptional: '(Optional)',
    sphere: 'Sphere',
    sphereTooltip: 'Spherical power (SPH) corrects nearsightedness (-) or farsightedness (+). Found on your glasses prescription.',
    cylinder: 'Cylinder',
    cylinderTooltip: 'Cylindrical power (CYL) corrects astigmatism. Found on your glasses prescription if you have astigmatism.',

    // Generate button
    generateRecommendations: 'Generate Recommendations',

    // Recommendations
    recommendations: 'Recommendations',
    recommendationsDesc: 'Personalized settings based on your profile',
    recommendationsEmpty: 'Complete your profile and click "Generate" to see recommendations.',

    // Editor Settings
    editorSettings: 'Editor Settings',
    editorSettingsDesc: 'Fine-tune your preferences',
    fontSize: 'Font Size',
    lineHeight: 'Line Height',
    letterSpacing: 'Letter Spacing',
    fontWeight: 'Font Weight',
    cursorWidth: 'Cursor Width',
    lineHighlight: 'Line Highlight',
    lineHighlightNone: 'None',
    lineHighlightGutter: 'Gutter Only',
    lineHighlightLine: 'Line Only',
    lineHighlightAll: 'All (Default)',
    auto: 'Auto',
    light: 'Light',
    bold: 'Bold',

    // Preview
    livePreview: 'Live Preview',
    livePreviewDesc: 'Compare original vs. new settings',
    original: 'Original',
    preview: 'Preview',
    live: 'LIVE',

    // Actions
    revert: 'Revert',
    save: 'Save',

    // Disclaimer
    disclaimer: 'Important Notice',
    disclaimerText: 'This tool is designed to improve visual comfort while coding. It is NOT a substitute for professional eye care. If you experience persistent eye strain, headaches, or vision problems, please consult an optometrist or ophthalmologist.',

    // Setting names
    settingNames: {
        fontSize: 'Font Size',
        lineHeight: 'Line Height',
        letterSpacing: 'Letter Spacing',
        fontWeight: 'Font Weight',
        cursorWidth: 'Cursor Width',
    },

    // Pause/Eye Break Feature
    pauseSection: 'Eye Break Reminders',
    pauseSectionDesc: 'Follow the 20-20-20 rule for eye health',
    pauseEnabled: 'Enable reminders',
    pauseEnabledDesc: 'Get periodic reminders to rest your eyes',
    pauseWorkInterval: 'Work interval',
    pauseWorkIntervalDesc: 'Time between breaks',
    pauseBreakDuration: 'Break duration',
    pauseBreakDurationDesc: 'How long each break lasts',
    pauseShowStatusBar: 'Show countdown',
    pauseShowStatusBarDesc: 'Display timer in status bar',
    pauseWhenIdle: 'Pause when idle',
    pauseWhenIdleDesc: 'Stop timer when not actively coding',
    pauseTakeBreakNow: 'Take Break Now',
    pauseStatus: 'Status',
    pauseStatusActive: 'Active',
    pauseStatusInactive: 'Inactive',
    pauseStatusOnBreak: 'On Break',
    pauseMinutes: 'min',
    pauseSeconds: 'sec',
};

const es: Translations = {
    // Header
    title: 'Harmonia Vision',
    subtitle: 'Configuracion personalizada del editor para comodidad visual',

    // Backup status
    lastSavedSettings: 'Ultima configuracion guardada',
    size: 'Tamano',
    height: 'Altura',
    weight: 'Peso',

    // Visual Profile
    visualProfile: 'Perfil Visual',
    visualProfileDesc: 'Selecciona las condiciones que afectan tu vision',

    // Conditions
    myopia: 'Miopia',
    myopiaDesc: 'Vision corta',
    astigmatism: 'Astigmatismo',
    astigmatismDesc: 'Vision borrosa',
    eyeStrain: 'Fatiga Ocular',
    eyeStrainDesc: 'Cansancio',
    blurGhost: 'Vision Doble',
    blurGhostDesc: 'Imagenes fantasma',
    lightSens: 'Sens. Luz',
    lightSensDesc: 'Fotofobia',
    crowding: 'Aglomeracion',
    crowdingDesc: 'Texto denso',

    // Prescription
    prescriptionTitle: 'Receta',
    prescriptionOptional: '(Opcional)',
    sphere: 'Esfera',
    sphereTooltip: 'Potencia esferica (ESF) corrige miopia (-) o hipermetropia (+). Se encuentra en tu receta de lentes.',
    cylinder: 'Cilindro',
    cylinderTooltip: 'Potencia cilindrica (CIL) corrige el astigmatismo. Se encuentra en tu receta si tienes astigmatismo.',

    // Generate button
    generateRecommendations: 'Generar Recomendaciones',

    // Recommendations
    recommendations: 'Recomendaciones',
    recommendationsDesc: 'Configuracion personalizada basada en tu perfil',
    recommendationsEmpty: 'Completa tu perfil y haz clic en "Generar" para ver las recomendaciones.',

    // Editor Settings
    editorSettings: 'Configuracion del Editor',
    editorSettingsDesc: 'Ajusta tus preferencias',
    fontSize: 'Tamano de Fuente',
    lineHeight: 'Altura de Linea',
    letterSpacing: 'Espaciado de Letras',
    fontWeight: 'Grosor de Fuente',
    cursorWidth: 'Ancho del Cursor',
    lineHighlight: 'Resaltado de Linea',
    lineHighlightNone: 'Ninguno',
    lineHighlightGutter: 'Solo Margen',
    lineHighlightLine: 'Solo Linea',
    lineHighlightAll: 'Todo (Por defecto)',
    auto: 'Auto',
    light: 'Ligero',
    bold: 'Negrita',

    // Preview
    livePreview: 'Vista Previa',
    livePreviewDesc: 'Compara la configuracion original vs. nueva',
    original: 'Original',
    preview: 'Vista Previa',
    live: 'EN VIVO',

    // Actions
    revert: 'Revertir',
    save: 'Guardar',

    // Disclaimer
    disclaimer: 'Aviso Importante',
    disclaimerText: 'Esta herramienta esta disenada para mejorar la comodidad visual al programar. NO es un sustituto del cuidado profesional de la vista. Si experimentas fatiga ocular persistente, dolores de cabeza o problemas de vision, consulta a un optometrista u oftalmologo.',

    // Setting names
    settingNames: {
        fontSize: 'Tamano de Fuente',
        lineHeight: 'Altura de Linea',
        letterSpacing: 'Espaciado de Letras',
        fontWeight: 'Grosor de Fuente',
        cursorWidth: 'Ancho del Cursor',
    },

    // Pause/Eye Break Feature
    pauseSection: 'Recordatorios de Descanso',
    pauseSectionDesc: 'Sigue la regla 20-20-20 para la salud ocular',
    pauseEnabled: 'Activar recordatorios',
    pauseEnabledDesc: 'Recibe recordatorios periodicos para descansar los ojos',
    pauseWorkInterval: 'Intervalo de trabajo',
    pauseWorkIntervalDesc: 'Tiempo entre descansos',
    pauseBreakDuration: 'Duracion del descanso',
    pauseBreakDurationDesc: 'Cuanto dura cada descanso',
    pauseShowStatusBar: 'Mostrar cuenta regresiva',
    pauseShowStatusBarDesc: 'Mostrar temporizador en la barra de estado',
    pauseWhenIdle: 'Pausar cuando inactivo',
    pauseWhenIdleDesc: 'Detener temporizador cuando no estas programando',
    pauseTakeBreakNow: 'Tomar Descanso Ahora',
    pauseStatus: 'Estado',
    pauseStatusActive: 'Activo',
    pauseStatusInactive: 'Inactivo',
    pauseStatusOnBreak: 'En Descanso',
    pauseMinutes: 'min',
    pauseSeconds: 'seg',
};

const translations: Record<string, Translations> = {
    en,
    es,
};

/**
 * Gets the translations for the specified language.
 * Falls back to English if the language is not supported.
 */
export function getTranslations(language: string): Translations {
    // Extract base language (e.g., 'es' from 'es-MX')
    const baseLang = language.split('-')[0].toLowerCase();
    return translations[baseLang] || translations['en'];
}

/**
 * Returns translations as a JSON string for injection into webview.
 */
export function getTranslationsJson(language: string): string {
    return JSON.stringify(getTranslations(language));
}
