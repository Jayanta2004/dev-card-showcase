import { Logger } from '../utils/Logger.js';

/**
 * @class StrokeStatistics
 * @description Helper class to track metadata about drawings.
 * Useful for debug or potential "score" mechanics based on distance traveled.
 */
class StrokeStatistics {
    constructor() {
        this.totalDistance = 0;
        this.strokeCount = 0;
        this.totalTime = 0;
    }

    addStroke(stroke) {
        this.strokeCount++;
        // Calculate rough distance
        let dist = 0;
        for (let i = 1; i < stroke.points.length; i++) {
            dist += stroke.points[i].dist(stroke.points[i - 1]);
        }
        this.totalDistance += dist;
        Logger.debug(`StrokeStats: Added stroke. Total Dist: ${this.totalDistance.toFixed(0)}`);
    }

    reset() {
        this.totalDistance = 0;
        this.strokeCount = 0;
        this.totalTime = 0;
    }
}

export const globalStats = new StrokeStatistics();
