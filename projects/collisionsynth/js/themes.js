/**
 * @file themes.js
 * @description Theme management system for CollisionSynth.
 * Controls CSS variables to switch between different visual aesthetics.
 */

const Themes = (() => {
    const list = {
        'cyber': {
            '--bg-color': '#05070a',
            '--accent-primary': '#00f2ff',
            '--accent-secondary': '#ff007a',
            '--panel-bg': 'rgba(15, 20, 30, 0.8)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--text-main': '#e0e6ed',
            '--text-dim': '#8892b0'
        },
        'solar': {
            '--bg-color': '#1a0b00',
            '--accent-primary': '#ffaa00',
            '--accent-secondary': '#ff4400',
            '--panel-bg': 'rgba(30, 15, 5, 0.8)',
            '--glass-border': 'rgba(255, 150, 50, 0.2)',
            '--text-main': '#fff8e0',
            '--text-dim': '#b08060'
        },
        'mint': {
            '--bg-color': '#001a15',
            '--accent-primary': '#00ffa3',
            '--accent-secondary': '#008cff',
            '--panel-bg': 'rgba(0, 30, 25, 0.8)',
            '--glass-border': 'rgba(50, 255, 180, 0.15)',
            '--text-main': '#e0fff8',
            '--text-dim': '#60b0a0'
        },
        'monochrome': {
            '--bg-color': '#000000',
            '--accent-primary': '#ffffff',
            '--accent-secondary': '#888888',
            '--panel-bg': 'rgba(20, 20, 20, 0.9)',
            '--glass-border': 'rgba(255, 255, 255, 0.2)',
            '--text-main': '#ffffff',
            '--text-dim': '#aaaaaa'
        }
    };

    return {
        /**
         * Applies a theme by name.
         * @param {string} name 
         */
        apply: (name) => {
            const theme = list[name] || list['cyber'];
            const root = document.documentElement;

            Object.entries(theme).forEach(([key, val]) => {
                root.style.setProperty(key, val);
            });

            console.log(`Theme ${name} applied.`);
        },

        getNames: () => Object.keys(list)
    };
})();
