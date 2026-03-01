/**
 * Easing.js
 * Easing functions for smooth animations.
 */
class Easing {
    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }
}
