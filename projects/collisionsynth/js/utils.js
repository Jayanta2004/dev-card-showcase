/**
 * @file utils.js
 * @description Comprehensive utility library for CollisionSynth.
 * Provides mathematical helpers, vector operations, and generative tools.
 */

const Utils = (() => {
    /**
     * Vector2D Class
     * Standard 2D vector for physics calculations.
     */
    class Vec2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        static add(v1, v2) { return new Vec2(v1.x + v2.x, v1.y + v2.y); }
        static sub(v1, v2) { return new Vec2(v1.x - v2.x, v1.y - v2.y); }
        static mul(v, s) { return new Vec2(v.x * s, v.y * s); }
        static div(v, s) { return new Vec2(v.x / s, v.y / s); }
        
        add(v) { this.x += v.x; this.y += v.y; return this; }
        sub(v) { this.x -= v.x; this.y -= v.y; return this; }
        mul(s) { this.x *= s; this.y *= s; return this; }
        div(s) { this.x /= s; this.y /= s; return this; }

        magSq() { return this.x * this.x + this.y * this.y; }
        mag() { return Math.sqrt(this.magSq()); }
        normalize() {
            const m = this.mag();
            if (m > 0) this.div(m);
            return this;
        }

        dot(v) { return this.x * v.x + this.y * v.y; }
        dist(v) { return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2); }
        
        copy() { return new Vec2(this.x, this.y); }
        set(x, y) { this.x = x; this.y = y; return this; }
    }

    /**
     * Mathematical Helpers
     */
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const map = (val, s1, e1, s2, e2) => s2 + (e2 - s2) * ((val - s1) / (e1 - s1));
    
    /**
     * Randomization
     */
    const random = (min, max) => Math.random() * (max - min) + min;
    const randomInt = (min, max) => Math.floor(random(min, max + 1));
    const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    /**
     * DOM / CSS Helpers
     */
    const getCSSVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    /**
     * Audio/Music Helpers
     */
    const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
    
    // Scales definitions
    const SCALES = {
        pentatonic: [0, 3, 5, 7, 10, 12],
        chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        dorian: [0, 2, 3, 5, 7, 9, 10, 12],
        aeolian: [0, 2, 3, 5, 7, 8, 10, 12]
    };

    /**
     * Collision Geometry Helpers
     */
    const closestPointOnLine = (p, a, b) => {
        const ap = Vec2.sub(p, a);
        const ab = Vec2.sub(b, a);
        let t = ap.dot(ab) / ab.magSq();
        t = clamp(t, 0, 1);
        return Vec2.add(a, Vec2.mul(ab, t));
    };

    return {
        Vec2,
        lerp,
        clamp,
        map,
        random,
        randomInt,
        randomPick,
        midiToFreq,
        SCALES,
        getCSSVar,
        closestPointOnLine
    };
})();
