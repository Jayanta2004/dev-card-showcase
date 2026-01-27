
/**
 * TypeMorph - Themes
 * Manages visual presets.
 */

const THEMES = {
    cyber: {
        '--bg-color': '#050505',
        '--text-color': '#f0f0f0',
        '--accent-color': '#ff3366',
        'bg-style': 'radial-gradient(circle at 50% 50%, #1a0b14 0%, #050505 60%)'
    },
    heat: {
        '--bg-color': '#1a0500',
        '--text-color': '#ffcc00',
        '--accent-color': '#ff4500',
        'bg-style': 'linear-gradient(45deg, #2b0a00, #000000)'
    },
    zen: {
        '--bg-color': '#e0e0e0',
        '--text-color': '#222222',
        '--accent-color': '#555555',
        'bg-style': 'linear-gradient(to bottom, #ffffff, #e0e0e0)'
    },
    matrix: {
        '--bg-color': '#000000',
        '--text-color': '#00ff41',
        '--accent-color': '#008f11',
        'bg-style': 'radial-gradient(circle, #001a00, #000000)'
    }
};

function setTheme(themeName) {
    const theme = THEMES[themeName];
    if (!theme) return;

    const root = document.documentElement;

    // Set props
    root.style.setProperty('--bg-color', theme['--bg-color']);
    root.style.setProperty('--text-color', theme['--text-color']);
    root.style.setProperty('--accent-color', theme['--accent-color']);

    // Update BG div
    const bg = document.querySelector('.bg-gradient');
    if (bg) {
        bg.style.background = theme['bg-style'];
    }

    // Active state in UI (handled in input.js or controls.js)
}

window.setTheme = setTheme;
