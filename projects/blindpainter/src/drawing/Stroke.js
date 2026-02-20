import { MathUtils } from '../utils/MathUtils.js';

/**
 * @class Stroke
 * @description Data structure for a single continuous line drawn by the user.
 * Stores a list of points (Vector2) and creation metadata.
 */
export class Stroke {
    /**
     * @param {number} startTime 
     */
    constructor(startTime) {
        this.id = MathUtils.uuid();
        this.points = []; // Array of Vector2
        this.startTime = startTime;
        this.active = true;
    }

    /**
     * @method addPoint
     * @param {Vector2} point 
     */
    addPoint(point) {
        this.points.push(point.clone());
    }

    /**
     * @method finish
     * @description Marks the stroke as complete.
     */
    finish() {
        this.active = false;
    }

    /**
     * @method getLength
     * @returns {number} Number of points
     */
    getLength() {
        return this.points.length;
    }
}
