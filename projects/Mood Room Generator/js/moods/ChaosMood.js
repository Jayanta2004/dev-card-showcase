/**
 * ChaosMood.js
 * Configuration and logic for the Chaos mood.
 */
import GlitchParticle from '../particles/GlitchParticle.js';

export default class ChaosMood {
    static get config() {
        return {
            name: 'Chaos',
            colors: {
                primary: '#ff0099',
                secondary: '#493240',
                accent: '#00ff00'
            },
            lighting: {
                overlayGradient: 'radial-gradient(circle, transparent 20%, #ff0099 20%, transparent 25%)' // Psychedelic
            },
            particles: {
                class: GlitchParticle,
                options: {
                    maxParticles: 200,
                    spawnRate: 20
                }
            }
        };
    }
}
