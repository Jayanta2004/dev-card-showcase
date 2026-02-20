/**
 * FocusMood.js
 * Configuration and logic for the Focus mood.
 */
import FloatingOrb from '../particles/FloatingOrb.js';

export default class FocusMood {
    static get config() {
        return {
            name: 'Focus',
            colors: {
                primary: '#2c3e50',
                secondary: '#4ca1af',
                accent: '#ffffff'
            },
            lighting: {
                overlayGradient: 'linear-gradient(to bottom, rgba(44, 62, 80, 0.1), rgba(0,0,0,0.8))'
            },
            particles: {
                class: FloatingOrb, // Reusing Orb but stricter/smaller
                options: {
                    maxParticles: 15,
                    spawnRate: 800,
                    color: 'rgba(255, 255, 255, 0.8)',
                    glowColor: 'rgba(76, 161, 175, 0.3)'
                }
            }
        };
    }
}
