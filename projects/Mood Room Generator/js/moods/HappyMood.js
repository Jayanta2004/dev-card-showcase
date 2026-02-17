/**
 * HappyMood.js
 * Configuration and logic for the Happy mood.
 */
import ConfettiParticle from '../particles/ConfettiParticle.js';

export default class HappyMood {
    static get config() {
        return {
            name: 'Happy',
            colors: {
                primary: '#fce38a',
                secondary: '#f38181',
                accent: '#95e1d3'
            },
            lighting: {
                overlayGradient: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 200, 0.2), rgba(243, 129, 129, 0.1))'
            },
            particles: {
                class: ConfettiParticle,
                options: {
                    maxParticles: 60,
                    spawnRate: 150
                }
            }
        };
    }
}
