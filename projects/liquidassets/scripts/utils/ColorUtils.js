import { MathUtils } from './MathUtils.js';

export class ColorUtils {
    /**
     * Interpolates between two hex colors.
     * @param {string} hexA 
     * @param {string} hexB 
     * @param {number} t [0-1]
     */
    static lerpColor(hexA, hexB, t) {
        const rgbA = MathUtils.hexToRgb(hexA);
        const rgbB = MathUtils.hexToRgb(hexB);

        const r = Math.round(MathUtils.lerp(rgbA.r, rgbB.r, t));
        const g = Math.round(MathUtils.lerp(rgbA.g, rgbB.g, t));
        const b = Math.round(MathUtils.lerp(rgbA.b, rgbB.b, t));

        return `rgb(${r},${g},${b})`;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    static generateGradient(ctx, width, height, stops) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        stops.forEach(stop => {
            grad.addColorStop(stop.offset, stop.color);
        });
        return grad;
    }

    /**
     * Generates a random pastel color for UI elements
     */
    static randomPastel() {
        const r = Math.floor((Math.random() * 127) + 127);
        const g = Math.floor((Math.random() * 127) + 127);
        const b = Math.floor((Math.random() * 127) + 127);
        return `rgb(${r},${g},${b})`;
    }

    /**
     * Generates a "Fintech" accent color (Gold/Teal variations)
     */
    static randomFintechColor() {
        const palette = [
            '#64ffda', // Teal
            '#ffd700', // Gold
            '#00b4d8', // Blue
            '#ff5f5f', // Red (Expense)
            '#90e0ef', // Light Blue
            '#caf0f8'  // White Blue
        ];
        return palette[Math.floor(Math.random() * palette.length)];
    }
}
