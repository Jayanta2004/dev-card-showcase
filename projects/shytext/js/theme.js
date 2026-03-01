/**
 * theme.js
 * 
 * Manages visual personalities for the ShyText application.
 * Allows switching between different "shyness" modes (e.g., Nervous, Ghostly, Intense).
 * 
 * @module Themes
 */

import { Logger } from './logger.js';

export const THEMES = {
    NERVOUS: {
        id: 'nervous',
        name: 'The Nervous Shadow',
        colors: {
            bg: '#0a0a0b',
            accent: '#6366f1',
            text: '#e0e0e0'
        },
        params: {
            blurIntensity: 1.0,
            movementExcitement: 1.2,
            particleCount: 45
        }
    },
    GHOSTLY: {
        id: 'ghostly',
        name: 'The Spectral Whisper',
        colors: {
            bg: '#050505',
            accent: '#ffffff',
            text: '#888888'
        },
        params: {
            blurIntensity: 1.8,
            movementExcitement: 0.5,
            particleCount: 20
        }
    },
    INTENSE: {
        id: 'intense',
        name: 'The Blinding Glare',
        colors: {
            bg: '#ffffff',
            accent: '#ff0000',
            text: '#111111'
        },
        params: {
            blurIntensity: 2.5,
            movementExcitement: 3.0,
            particleCount: 100
        }
    }
};

class ThemeManager {
    constructor() {
        this.current = THEMES.NERVOUS;
    }

    /**
     * Switches the active theme.
     * 
     * @param {string} themeKey - Key from THEMES object.
     */
    setTheme(themeKey) {
        const theme = THEMES[themeKey.toUpperCase()];
        if (!theme) {
            Logger.warn(`ThemeManager: Theme '${themeKey}' not found.`);
            return;
        }

        this.current = theme;
        this.applyToDOM();

        Logger.system(`Applied Theme: ${theme.name}`);
    }

    /**
     * Updates CSS variables and local classes.
     */
    applyToDOM() {
        const root = document.documentElement;
        const colors = this.current.colors;

        root.style.setProperty('--bg-primary', colors.bg);
        root.style.setProperty('--accent-color', colors.accent);
        root.style.setProperty('--text-primary', colors.text);

        // Update body class
        document.body.className = `theme-${this.current.id}`;

        // Notify other modules of change
        window.dispatchEvent(new CustomEvent('shytext:themechange', { detail: this.current }));
    }

    /**
     * Cycles through available themes.
     */
    cycle() {
        const keys = Object.keys(THEMES);
        const currentIndex = keys.indexOf(this.current.id.toUpperCase());
        const nextIndex = (currentIndex + 1) % keys.length;
        this.setTheme(keys[nextIndex]);
    }
}

export const Theme = new ThemeManager();

/**
 * TECHNICAL NOTE: Reactive Theming
 * 
 * Instead of hardcoding styles, the app relies on CSS custom properties (variables).
 * The ThemeManager simply updates these variables at the document root,
 * triggering a browser-native repaint/restyle that is highly efficient.
 * The 'shytext:themechange' event allows the Canvas and Logic modules
 * to recalibrate their internal parameters (like particle count) in sync.
 */
