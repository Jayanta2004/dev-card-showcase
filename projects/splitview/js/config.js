// Configuration constants for the SplitView application
const CONFIG = {
    // Difficulty settings - tolerance in pixels for alignment
    DIFFICULTY: {
        easy: {
            tolerance: 50,
            name: 'Easy',
            description: 'Loose alignment'
        },
        medium: {
            tolerance: 25,
            name: 'Medium',
            description: 'Moderate precision'
        },
        hard: {
            tolerance: 10,
            name: 'Hard',
            description: 'Pixel perfect'
        }
    },

    // Window configuration
    WINDOW: {
        width: 400,
        height: 400,
        checkInterval: 100, // ms between position checks
        features: 'width=400,height=400,menubar=no,toolbar=no,location=no,status=no,scrollbars=no'
    },

    // Alignment thresholds
    ALIGNMENT: {
        perfect: 100,
        good: 75,
        fair: 50,
        poor: 25
    },

    // Visual feedback
    HINTS: {
        enabled: true,
        glowIntensity: 20,
        pulseSpeed: 1000
    },

    // Image processing
    IMAGE: {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.95
    },

    // Sample images (generated gradients)
    SAMPLES: {
        landscape: {
            type: 'gradient',
            colors: ['#667eea', '#764ba2', '#f093fb'],
            direction: 135
        },
        abstract: {
            type: 'radial',
            colors: ['#ff6b6b', '#4ecdc4', '#45b7d1']
        },
        geometric: {
            type: 'pattern',
            colors: ['#667eea', '#764ba2'],
            pattern: 'diagonal-stripes'
        }
    },

    // Quadrant positions (relative to full image)
    QUADRANTS: [
        { id: 0, name: 'top-left', x: 0, y: 0, expectedX: 0, expectedY: 0 },
        { id: 1, name: 'top-right', x: 0.5, y: 0, expectedX: 1, expectedY: 0 },
        { id: 2, name: 'bottom-left', x: 0, y: 0.5, expectedX: 0, expectedY: 1 },
        { id: 3, name: 'bottom-right', x: 0.5, y: 0.5, expectedX: 1, expectedY: 1 }
    ],

    // Success criteria
    SUCCESS: {
        minAlignmentTime: 2000, // ms windows must stay aligned
        celebrationDuration: 3000
    },

    // Toast notifications
    TOAST: {
        duration: 3000,
        types: {
            info: '💡',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
