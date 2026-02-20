/**
 * Application Utilities
 */

// Linearly interpolate between a and b
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Map a value from one range to another
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Generate random number between min and max
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Convert HSL to RGBA string
export function hslToRgba(h, s, l, a = 1) {
    return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

// Ease out quartic function for smooth animations
export function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}
