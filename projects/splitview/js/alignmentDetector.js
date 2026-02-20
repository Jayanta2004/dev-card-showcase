// Alignment detection system for checking window positions

const AlignmentDetector = {
    difficulty: 'easy',
    hintsEnabled: true,
    tolerance: 50, // Will be set properly in init()
    lastAlignmentCheck: 0,
    alignmentStartTime: null,
    isAligned: false,

    /**
     * Initialize the alignment detector
     * @param {string} difficulty - Difficulty level
     * @param {boolean} hintsEnabled - Whether hints are enabled
     */
    init(difficulty = 'easy', hintsEnabled = true) {
        this.difficulty = difficulty;
        this.hintsEnabled = hintsEnabled;
        this.tolerance = CONFIG.DIFFICULTY[difficulty].tolerance;
        this.alignmentStartTime = null;
        this.isAligned = false;
    },

    /**
     * Check alignment of all windows
     * @param {Array} windows - Array of window data
     * @returns {Object} Alignment status
     */
    checkAlignment(windows) {
        if (!windows || windows.length !== 4) {
            return {
                aligned: false,
                percentage: 0,
                details: []
            };
        }

        const details = [];
        let totalScore = 0;

        // Check each pair of adjacent windows
        const pairs = [
            { a: 0, b: 1, direction: 'horizontal' }, // top-left to top-right
            { a: 2, b: 3, direction: 'horizontal' }, // bottom-left to bottom-right
            { a: 0, b: 2, direction: 'vertical' },   // top-left to bottom-left
            { a: 1, b: 3, direction: 'vertical' }    // top-right to bottom-right
        ];

        pairs.forEach(pair => {
            const windowA = windows[pair.a];
            const windowB = windows[pair.b];

            if (!windowA || !windowB) return;

            const alignment = this.checkPairAlignment(windowA, windowB, pair.direction);
            details.push({
                pair: [pair.a, pair.b],
                direction: pair.direction,
                ...alignment
            });

            totalScore += alignment.score;
        });

        const averageScore = totalScore / pairs.length;
        const percentage = Math.round(averageScore);
        const aligned = percentage >= 95;

        // Track alignment time
        if (aligned && !this.isAligned) {
            this.alignmentStartTime = Date.now();
        } else if (!aligned) {
            this.alignmentStartTime = null;
        }

        this.isAligned = aligned;

        return {
            aligned: aligned,
            percentage: percentage,
            details: details,
            alignmentDuration: this.alignmentStartTime
                ? Date.now() - this.alignmentStartTime
                : 0
        };
    },

    /**
     * Check alignment between two windows
     * @param {Object} windowA - First window data
     * @param {Object} windowB - Second window data
     * @param {string} direction - 'horizontal' or 'vertical'
     * @returns {Object} Alignment data
     */
    checkPairAlignment(windowA, windowB, direction) {
        const posA = windowA.position;
        const posB = windowB.position;

        let distance, offset, expectedOffset;

        if (direction === 'horizontal') {
            // Windows should be side by side
            expectedOffset = windowA.width;
            offset = Math.abs((posB.x - posA.x) - expectedOffset);
            distance = Math.abs(posA.y - posB.y); // Vertical alignment
        } else {
            // Windows should be stacked
            expectedOffset = windowA.height;
            offset = Math.abs((posB.y - posA.y) - expectedOffset);
            distance = Math.abs(posA.x - posB.x); // Horizontal alignment
        }

        // Calculate score based on distance and offset
        const maxDistance = this.tolerance * 2;
        const distanceScore = Math.max(0, 100 - (distance / maxDistance) * 100);
        const offsetScore = Math.max(0, 100 - (offset / maxDistance) * 100);

        const score = (distanceScore + offsetScore) / 2;
        const isAligned = distance <= this.tolerance && offset <= this.tolerance;

        return {
            score: score,
            distance: distance,
            offset: offset,
            isAligned: isAligned,
            distanceScore: distanceScore,
            offsetScore: offsetScore
        };
    },

    /**
     * Get hint directions for a window
     * @param {number} quadrantId - Quadrant ID
     * @param {Array} windows - Array of window data
     * @returns {Object} Hint data
     */
    getHintForWindow(quadrantId, windows) {
        if (!this.hintsEnabled) {
            return { show: false, direction: [] };
        }

        const window = windows.find(w => w.quadrantId === quadrantId);
        if (!window) return { show: false, direction: [] };

        // Calculate ideal position based on other windows
        const idealPosition = this.calculateIdealPosition(quadrantId, windows);
        if (!idealPosition) return { show: false, direction: [] };

        const currentPos = window.position;
        const direction = [];
        const threshold = this.tolerance * 1.5;

        // Determine hint directions
        if (idealPosition.x - currentPos.x > threshold) {
            direction.push('right');
        } else if (currentPos.x - idealPosition.x > threshold) {
            direction.push('left');
        }

        if (idealPosition.y - currentPos.y > threshold) {
            direction.push('down');
        } else if (currentPos.y - idealPosition.y > threshold) {
            direction.push('up');
        }

        return {
            show: direction.length > 0,
            direction: direction,
            distance: Utils.distance(
                currentPos.x, currentPos.y,
                idealPosition.x, idealPosition.y
            )
        };
    },

    /**
     * Calculate ideal position for a window based on others
     * @param {number} quadrantId - Quadrant ID
     * @param {Array} windows - Array of window data
     * @returns {Object|null} Ideal position {x, y}
     */
    calculateIdealPosition(quadrantId, windows) {
        const window = windows.find(w => w.quadrantId === quadrantId);
        if (!window) return null;

        // Use relative positions from other windows
        let idealX = null;
        let idealY = null;

        // Find reference windows
        const references = {
            0: { horizontal: 1, vertical: 2 },  // top-left
            1: { horizontal: 0, vertical: 3 },  // top-right
            2: { horizontal: 3, vertical: 0 },  // bottom-left
            3: { horizontal: 2, vertical: 1 }   // bottom-right
        };

        const ref = references[quadrantId];

        // Calculate from horizontal neighbor
        const hNeighbor = windows.find(w => w.quadrantId === ref.horizontal);
        if (hNeighbor) {
            if (quadrantId < ref.horizontal) {
                idealX = hNeighbor.position.x - window.width;
            } else {
                idealX = hNeighbor.position.x + hNeighbor.width;
            }
            idealY = hNeighbor.position.y;
        }

        // Calculate from vertical neighbor
        const vNeighbor = windows.find(w => w.quadrantId === ref.vertical);
        if (vNeighbor) {
            idealX = idealX || vNeighbor.position.x;
            if (quadrantId < ref.vertical) {
                idealY = vNeighbor.position.y - window.height;
            } else {
                idealY = vNeighbor.position.y + vNeighbor.height;
            }
        }

        if (idealX === null || idealY === null) {
            return null;
        }

        return { x: idealX, y: idealY };
    },

    /**
     * Get alignment quality description
     * @param {number} percentage - Alignment percentage
     * @returns {string} Quality description
     */
    getAlignmentQuality(percentage) {
        if (percentage >= CONFIG.ALIGNMENT.perfect) return 'Perfect';
        if (percentage >= CONFIG.ALIGNMENT.good) return 'Good';
        if (percentage >= CONFIG.ALIGNMENT.fair) return 'Fair';
        if (percentage >= CONFIG.ALIGNMENT.poor) return 'Poor';
        return 'Keep trying';
    },

    /**
     * Check if alignment is complete (sustained)
     * @param {Object} alignmentStatus - Current alignment status
     * @returns {boolean} True if puzzle is solved
     */
    isComplete(alignmentStatus) {
        return alignmentStatus.aligned &&
            alignmentStatus.alignmentDuration >= CONFIG.SUCCESS.minAlignmentTime;
    },

    /**
     * Reset alignment state
     */
    reset() {
        this.alignmentStartTime = null;
        this.isAligned = false;
        this.lastAlignmentCheck = 0;
    },

    /**
     * Update settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        if (settings.difficulty) {
            this.difficulty = settings.difficulty;
            this.tolerance = CONFIG.DIFFICULTY[settings.difficulty].tolerance;
        }
        if (settings.hintsEnabled !== undefined) {
            this.hintsEnabled = settings.hintsEnabled;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlignmentDetector;
}
