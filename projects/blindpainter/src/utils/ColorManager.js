import { MathUtils } from '../utils/MathUtils.js';

/**
 * @class ColorManager
 * @description Handles color generation based on audio parameters.
 * Even in a blind painting app, the cursor acts as a tiny guide.
 * This class maps frequency/pitch to HSL colors.
 */
export class ColorManager {
    /**
     * @static
     * @method freqToColor
     * @param {number} freq 
     * @returns {string} CSS/Canvas Color string
     */
    static freqToColor(freq) {
        // Map reasonable audio range (200Hz - 1000Hz) to Hue (0 - 360)
        const hue = MathUtils.map(freq, 200, 1000, 0, 300);
        return `hsl(${hue}, 70%, 50%)`;
    }

    /**
     * @static
     * @method speedToColor
     * @param {number} speed 
     * @returns {string}
     */
    static speedToColor(speed) {
        // Map speed to Saturation or Lightness
        const l = MathUtils.map(speed, 0, 50, 30, 80);
        return `hsl(200, 80%, ${l}%)`;
    }
}
