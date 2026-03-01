/**
 * MysteryMood.js
 * Configuration and logic for the Mystery mood.
 */
import FireflyParticle from '../particles/FireflyParticle.js';

export default class MysteryMood {
    static get config() {
        return {
            name: 'Mystery',
            colors: {
                primary: '#4b0082', // Indigo
                secondary: '#000000',
                accent: '#ffd700' // Gold
            },
            lighting: {
                overlayGradient: 'radial-gradient(circle at 50% 50%, transparent 10%, #000 120%)'
            },
            particles: {
                class: FireflyParticle,
                options: {
                    maxParticles: 80,
                    spawnRate: 100
                }
            }
        };
    }
}
