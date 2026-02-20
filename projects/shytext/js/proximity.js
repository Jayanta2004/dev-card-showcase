/**
 * proximity.js
 * 
 * The "brain" of the shyness effect.
 * Calculates the distance between the cursor and various targets,
 * returning normalized values used by the renderer.
 * 
 * @module Proximity
 */

import { STATE } from './state.js';
import { CONFIG } from './config.js';
import { calculateDistance, clamp, mapRange } from './utils.js';

export class ProximityEngine {
    constructor() {
        this.targets = [];
        this.isCalibrated = false;
    }

    /**
     * Scans the DOM for elements marked for shyness.
     */
    refreshTargets() {
        const elements = document.querySelectorAll('[data-shy="true"]');
        this.targets = Array.from(elements).map(el => {
            const rect = el.getBoundingClientRect();
            return {
                element: el,
                id: el.id || `target-${Math.random().toString(36).substr(2, 9)}`,
                centerX: rect.left + rect.width / 2,
                centerY: rect.top + rect.height / 2,
                width: rect.width,
                height: rect.height,
                currentProximity: 0
            };
        });
        this.isCalibrated = true;

        if (CONFIG.DEBUG) {
            console.log(`ProximityEngine: Calibrated ${this.targets.length} targets.`);
        }
    }

    /**
     * Main calculation loop. 
     * Determines the shyness factor for each target.
     * 
     * @returns {Array} Array of target states with calculated proximity.
     */
    update() {
        if (!this.isCalibrated) return [];

        const { x: mouseX, y: mouseY } = STATE.cursor;
        const { MIN_THRESHOLD, MAX_THRESHOLD, EASING_STRENGTH } = CONFIG.PROXIMITY;

        return this.targets.map(target => {
            // Calculate distance to element center
            let dist = calculateDistance(mouseX, mouseY, target.centerX, target.centerY);

            // Normalize distance based on thresholds
            // 0.0 = Far (Sharp), 1.0 = Very Close (Blurry)
            let rawProximity = mapRange(
                clamp(dist, MAX_THRESHOLD, MIN_THRESHOLD),
                MIN_THRESHOLD, MAX_THRESHOLD,
                0, 1
            );

            // Apply non-linear easing for more "natural" shyness
            // Higher strength = text stays sharp longer then blurs quickly
            let easedProximity = Math.pow(rawProximity, 1 + EASING_STRENGTH * 2);

            target.currentProximity = easedProximity;
            return target;
        });
    }

    /**
     * Recalculates target positions (call on scroll or resize).
     */
    recalibrate() {
        this.targets.forEach(target => {
            const rect = target.element.getBoundingClientRect();
            target.centerX = rect.left + rect.width / 2;
            target.centerY = rect.top + rect.height / 2;
        });
    }
}

/**
 * Technical Documentation: Proximity Calculation
 * 
 * We use a "Radial Threshold" model. 
 * Imagine a circle around the text with radius MIN_THRESHOLD. 
 * Outside this circle, the text is perfectly sharp (Proximity 0).
 * As the cursor enters the circle, proximity grows towards 1.0 
 * as it approaches the MAX_THRESHOLD radius.
 * 
 * The center of each element is used for the distance check to simplify 
 * calculations and reduce CPU load, assuming text blocks aren't massive.
 */
