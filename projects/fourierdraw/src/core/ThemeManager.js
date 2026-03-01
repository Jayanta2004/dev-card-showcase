import { CONFIG } from '../config.js';

/**
 * @fileoverview Theme and Color Management.
 * Handles dynamic color shifting, palette generation, and UI state styling.
 */

export class ThemeManager {
    constructor() {
        /** @type {string[]} */
        this.palettes = [
            '#6366f1', // Indigo
            '#ec4899', // Pink
            '#8b5cf6', // Violet
            '#06b6d4', // Cyan
            '#10b981'  // Emerald
        ];

        /** @type {number} */
        this.currentIndex = 0;

        /** @type {boolean} */
        this.autoShift = false;

        /** @type {number} */
        this.hue = 240; // Default Indigo hue
    }

    /**
     * Cycles to the next color in the predefined palette.
     * @returns {string} The new primary color.
     */
    cycle() {
        this.currentIndex = (this.currentIndex + 1) % this.palettes.length;
        const newColor = this.palettes[this.currentIndex];
        this.updateCSSVariables(newColor);
        return newColor;
    }

    /**
     * Perturbs the current hue slightly for a "shimmering" effect.
     */
    shimmer() {
        this.hue = (this.hue + 0.5) % 360;
        const color = `hsl(${this.hue}, 70%, 65%)`;
        this.updateCSSVariables(color);
    }

    /**
     * Updates CSS custom properties to reflect the new theme colors.
     * @param {string} primaryColor 
     */
    updateCSSVariables(primaryColor) {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', primaryColor);

        // Calculate a glow variant (we'll use a semi-transparent version)
        // Note: In a real app we'd use a color library, but we'll stick to vanilla logic
        if (primaryColor.startsWith('#')) {
            const glow = this.hexToRGBA(primaryColor, 0.3);
            root.style.setProperty('--accent-glow', glow);
        } else if (primaryColor.startsWith('hsl')) {
            const glow = primaryColor.replace(')', ', 0.3)').replace('hsl', 'hsla');
            root.style.setProperty('--accent-glow', glow);
        }
    }

    /**
     * Converts Hex to RGBA.
     * @param {string} hex 
     * @param {number} alpha 
     * @returns {string}
     */
    hexToRGBA(hex, alpha) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Gets the current primary color.
     * @returns {string}
     */
    getCurrentColor() {
        return this.palettes[this.currentIndex];
    }
}
