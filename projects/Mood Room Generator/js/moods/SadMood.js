/**
 * SadMood.js
 * Configuration and logic for the Sad mood.
 */
import RainParticle from '../particles/RainParticle.js';

export default class SadMood {
    static get config() {
        return {
            name: 'Sad',
            colors: {
                primary: '#203a43',
                secondary: '#2c5364',
                accent: '#0f2027'
            },
            lighting: {
                overlayGradient: 'linear-gradient(to top, #203a43 0%, rgba(0,0,0,0.8) 100%)'
            },
            particles: {
                class: RainParticle,
                options: {
                    maxParticles: 100,
                    spawnRate: 50,
                    color: 'rgba(100, 150, 255, 0.3)'
                }
            }
        };
    }
}
