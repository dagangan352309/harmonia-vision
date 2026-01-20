/**
 * Harmonia Vision - Eye Health Tips
 *
 * Bilingual tips following the 20-20-20 rule and other eye health practices.
 * Tips are displayed during break reminders to encourage healthy habits.
 */

export interface PauseTip {
    en: string;
    es: string;
}

/**
 * Collection of eye health tips with translations.
 * Each tip encourages a different eye-friendly activity.
 */
export const pauseTips: PauseTip[] = [
    // 20-20-20 rule tips
    {
        en: 'Look at something 20 feet (6 meters) away for 20 seconds to relax your eye muscles.',
        es: 'Mira algo a 6 metros de distancia durante 20 segundos para relajar los musculos oculares.',
    },
    {
        en: 'Focus on a distant object through a window. Let your eyes rest from the screen.',
        es: 'Enfoca un objeto lejano a traves de una ventana. Deja que tus ojos descansen de la pantalla.',
    },
    {
        en: 'Find something far away to look at. Your eyes need a break from close-up focus.',
        es: 'Busca algo lejano para mirar. Tus ojos necesitan un descanso del enfoque cercano.',
    },

    // Blinking exercises
    {
        en: 'Blink slowly 10 times to refresh your eyes and spread natural tears.',
        es: 'Parpadea lentamente 10 veces para refrescar tus ojos y distribuir las lagrimas naturales.',
    },
    {
        en: 'We blink less when using screens. Take a moment to blink consciously several times.',
        es: 'Parpadeamos menos al usar pantallas. Toma un momento para parpadear conscientemente varias veces.',
    },

    // Eye relaxation
    {
        en: 'Close your eyes gently for 20 seconds. Let the darkness soothe your vision.',
        es: 'Cierra los ojos suavemente durante 20 segundos. Deja que la oscuridad calme tu vision.',
    },
    {
        en: 'Cover your closed eyes with your palms (palming). Feel the warmth relax your eye muscles.',
        es: 'Cubre tus ojos cerrados con las palmas (palming). Siente como el calor relaja los musculos oculares.',
    },
    {
        en: 'Roll your eyes slowly in circles, then reverse direction. This exercises your eye muscles.',
        es: 'Gira los ojos lentamente en circulos, luego invierte la direccion. Esto ejercita los musculos oculares.',
    },

    // Physical stretching
    {
        en: 'Stretch your neck by gently tilting your head to each side. Release tension from extended focus.',
        es: 'Estira el cuello inclinando suavemente la cabeza a cada lado. Libera la tension del enfoque prolongado.',
    },
    {
        en: 'Roll your shoulders back and down. Good posture supports healthy vision.',
        es: 'Gira los hombros hacia atras y abajo. Una buena postura apoya una vision saludable.',
    },
    {
        en: 'Stand up and stretch your whole body. Movement helps blood flow to your eyes.',
        es: 'Levantate y estira todo el cuerpo. El movimiento ayuda al flujo sanguineo hacia los ojos.',
    },

    // Hydration
    {
        en: 'Take a sip of water. Staying hydrated helps prevent dry eyes.',
        es: 'Toma un sorbo de agua. Mantenerse hidratado ayuda a prevenir los ojos secos.',
    },
    {
        en: 'Drink some water and give your eyes a rest. Hydration is key for eye health.',
        es: 'Bebe agua y dale un descanso a tus ojos. La hidratacion es clave para la salud ocular.',
    },

    // Mindfulness
    {
        en: 'Take three deep breaths. Relaxation reduces eye strain from stress.',
        es: 'Toma tres respiraciones profundas. La relajacion reduce la fatiga ocular por estres.',
    },
    {
        en: 'Look away from the screen and simply breathe. Your eyes will thank you.',
        es: 'Aparta la mirada de la pantalla y simplemente respira. Tus ojos te lo agradeceran.',
    },
];

/**
 * Gets a random tip in the specified language.
 *
 * @param language - Language code (e.g., 'en', 'es', 'es-MX')
 * @returns A random eye health tip in the specified language
 */
export function getRandomTip(language: string): string {
    const baseLang = language.split('-')[0].toLowerCase();
    const randomIndex = Math.floor(Math.random() * pauseTips.length);
    const tip = pauseTips[randomIndex];

    // Return tip in requested language, fallback to English
    return baseLang === 'es' ? tip.es : tip.en;
}

/**
 * Gets all tips in the specified language.
 *
 * @param language - Language code
 * @returns Array of all tips in the specified language
 */
export function getAllTips(language: string): string[] {
    const baseLang = language.split('-')[0].toLowerCase();
    return pauseTips.map((tip) => (baseLang === 'es' ? tip.es : tip.en));
}
