/**
 * CalmMood.js
 * Configuration and logic for the Calm mood.
 */
import FloatingOrb from '../particles/FloatingOrb.js';

export default class CalmMood {
    static get config() {
        return {
            name: 'Calm',
            colors: {
                primary: '#4ecdc4',
                secondary: '#292e49',
                accent: '#a8ff78'
            },
            lighting: {
                overlayGradient: 'radial-gradient(circle at 50% 50%, rgba(78, 205, 196, 0.2), #000 90%)'
            },
            particles: {
                class: FloatingOrb,
                options: {
                    maxParticles: 30,
                    spawnRate: 300,
                    color: 'radial-gradient(circle, rgba(168, 255, 120, 0.6), transparent)',
                    glowColor: 'rgba(78, 205, 196, 0.4)'
                }
            }
        };
    }
}
