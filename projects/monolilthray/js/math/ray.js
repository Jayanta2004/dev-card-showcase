/**
 * @file ray.js
 * @description A Ray defined by an origin and a direction.
 */

class Ray {
    /**
     * @param {Vec3} origin 
     * @param {Vec3} direction 
     */
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }

    /**
     * Returns the point at distance t along the ray.
     * @param {number} t 
     * @returns {Vec3}
     */
    at(t) {
        return this.origin.add(this.direction.mul(t));
    }
}

// Global exposure
if (typeof window !== 'undefined') window.Ray = Ray;
if (typeof self !== 'undefined') self.Ray = Ray;
