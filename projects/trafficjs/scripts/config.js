/**
 * Simulation Configuration
 * Centralized management of all configuration parameters
 */

const CONFIG = {
    // Basic Simulation Settings
    SIMULATION: {
        FPS: 60,
        MAX_VEHICLES: 150,
        VEHICLE_SPAWN_INTERVAL: { MIN: 300, MAX: 1500 }, // ms
        BASE_SPEED: 1.0,
        MIN_SPEED: 0.5,
        MAX_SPEED: 3.0
    },

    // Traffic Light Timing Config (Unit: seconds)
    TRAFFIC_LIGHTS: {
        NS: {
            GREEN: 5,
            YELLOW: 2,
            RED: 7 // Auto-calculated: EW_GREEN + EW_YELLOW
        },
        EW: {
            GREEN: 5,
            YELLOW: 2,
            RED: 7 // Auto-calculated: NS_GREEN + NS_YELLOW
        },
        // Safety Interval (No Green Light during Yellow Light)
        SAFETY_INTERVAL: 1
    },

    // Vehicle Physics Parameters
    VEHICLE_PHYSICS: {
        // Acceleration (pixels/second^2)
        ACCELERATION: 100,
        DECELERATION: 150,
        MAX_SPEED: 250, // pixels/second
        MIN_SPEED: 20,  // pixels/second

        // Safe Distance (based on speed)
        SAFE_DISTANCE_FACTOR: 1.2, // Distance = Speed * Factor
        MIN_FOLLOWING_DISTANCE: 40, // pixels

        // Dimensions
        WIDTH: 30,
        LENGTH: 50,

        // Random Factors
        SPEED_VARIATION: 0.2 // ±20% Speed Variation
    },

    // Road Layout Parameters
    ROAD_LAYOUT: {
        // Road Dimensions (pixels)
        // Fixed Container Size: 800x800
        CONTAINER_WIDTH: 800,
        CONTAINER_HEIGHT: 800,
        ROAD_WIDTH: 200,
        INTERSECTION_SIZE: 220,

        // Lane Positions (Offsets for multiple lanes)
        LANES: {
            // Northbound (moving Down) - Spawns at top (North)
            // Lanes at X: 425 & 475 (Right side of road center 400)
            NORTH: [425, 475],

            // Southbound (moving Up) - Spawns at bottom (South)
            // Lanes at X: 375 & 325 (Left side of road center 400)
            SOUTH: [375, 325],

            // Eastbound (moving Left) - Spawns at right (East)
            // Lanes at Y: 425 & 475 (Bottom side of road center 400)
            EAST: [425, 475],

            // Westbound (moving Right) - Spawns at left (West)
            // Lanes at Y: 375 & 325 (Top side of road center 400)
            WEST: [375, 325]
        },

        // Waypoints (for vehicle navigation)
        // Dynamically generated in code based on lanes, or defined here as templates
        WAYPOINT_Y_STOPS: { // For Vertical roads
            START_NORTH: -100,
            STOP_NORTH: 290,
            INTERSECTION_ENTER_NORTH: 300,
            INTERSECTION_CENTER: 400,
            INTERSECTION_EXIT_NORTH: 510,
            END_NORTH: 900,

            START_SOUTH: 900,
            STOP_SOUTH: 510,
            INTERSECTION_ENTER_SOUTH: 500,
            INTERSECTION_EXIT_SOUTH: 290,
            END_SOUTH: -100
        },
        WAYPOINT_X_STOPS: { // For Horizontal roads
            START_EAST: 900,
            STOP_EAST: 510,
            INTERSECTION_ENTER_EAST: 500,
            INTERSECTION_EXIT_EAST: 290,
            END_EAST: -100,

            START_WEST: -100,
            STOP_WEST: 290,
            INTERSECTION_ENTER_WEST: 300,
            INTERSECTION_EXIT_WEST: 510,
            END_WEST: 900
        },

        // Stop Line Positions (Absolute coordinates)
        STOP_LINES: {
            NORTH: 290, // Y coordinate
            SOUTH: 510, // Y coordinate
            EAST: 510,  // X coordinate
            WEST: 290   // X coordinate
        }
    },

    // Visual Settings
    VISUAL: {
        // Grid
        GRID_SIZE: 40,
        SHOW_GRID: true,
        SHOW_PATHS: false,

        // Animation Duration
        VEHICLE_MOVE_DURATION: 0.1, // seconds
        LIGHT_TRANSITION_DURATION: 0.3, // seconds

        // Vehicle Types (for visual variation)
        VEHICLE_TYPES: [
            { color: '#60a5fa', width: 30, length: 50 }, // Car
            { color: '#34d399', width: 35, length: 60 }, // SUV
            { color: '#f472b6', width: 40, length: 70 }, // Truck
            { color: '#fbbf24', width: 28, length: 45 }, // Sports Car
            { color: '#a78bfa', width: 32, length: 55 }  // Van
        ]
    },

    // Control Settings
    CONTROLS: {
        // Spawn Intervals for Density Levels (ms)
        DENSITY_LEVELS: [
            3000, // Level 1: Very Low
            2000, // Level 2: Low
            1500, // Level 3: Low-Medium
            1000, // Level 4: Medium
            800,  // Level 5: Medium-High
            600,  // Level 6: High
            400,  // Level 7: Very High
            300,  // Level 8: Extreme
            200,  // Level 9: Crazy
            100   // Level 10: Limit
        ]
    },

    // Performance Settings
    PERFORMANCE: {
        // Reduce vehicle spawning if FPS is below this value
        TARGET_FPS: 50,

        // Interval to clean up invisible vehicles
        CLEANUP_INTERVAL: 10000, // ms

        // Max History
        MAX_HISTORY: 1000
    }
};

// Initialize Calculated Values
CONFIG.TRAFFIC_LIGHTS.NS.RED = CONFIG.TRAFFIC_LIGHTS.EW.GREEN + CONFIG.TRAFFIC_LIGHTS.EW.YELLOW;
CONFIG.TRAFFIC_LIGHTS.EW.RED = CONFIG.TRAFFIC_LIGHTS.NS.GREEN + CONFIG.TRAFFIC_LIGHTS.NS.YELLOW;

// Helper to generate waypoints for a specific lane
CONFIG.ROAD_LAYOUT.GET_WAYPOINTS = (direction, laneIndex) => {
    const lanes = CONFIG.ROAD_LAYOUT.LANES[direction.toUpperCase()];
    // Ensure valid lane index
    const actualLaneIndex = laneIndex % lanes.length;
    const offset = lanes[actualLaneIndex];
    const Y = CONFIG.ROAD_LAYOUT.WAYPOINT_Y_STOPS;
    const X = CONFIG.ROAD_LAYOUT.WAYPOINT_X_STOPS;

    switch (direction) {
        case 'north': // Spawns top, moves down. X is constant (offset). Y changes.
            return [
                { x: offset, y: Y.START_NORTH },
                { x: offset, y: Y.STOP_NORTH },
                { x: offset, y: Y.INTERSECTION_ENTER_NORTH },
                { x: offset, y: Y.INTERSECTION_CENTER }, // Center of intersection
                { x: offset, y: Y.END_NORTH }
            ];
        case 'south': // Spawns bottom, moves up. X is constant (offset).
            return [
                { x: offset, y: Y.START_SOUTH },
                { x: offset, y: Y.STOP_SOUTH },
                { x: offset, y: Y.INTERSECTION_ENTER_SOUTH },
                { x: offset, y: Y.INTERSECTION_CENTER },
                { x: offset, y: Y.END_SOUTH }
            ];
        case 'east': // Spawns right, moves left. Y is constant (offset). X changes.
            return [
                { x: X.START_EAST, y: offset },
                { x: X.STOP_EAST, y: offset },
                { x: X.INTERSECTION_ENTER_EAST, y: offset },
                { x: 400, y: offset }, // Center X
                { x: X.END_EAST, y: offset }
            ];
        case 'west': // Spawns left, moves right. Y is constant (offset).
            return [
                { x: X.START_WEST, y: offset },
                { x: X.STOP_WEST, y: offset },
                { x: X.INTERSECTION_ENTER_WEST, y: offset },
                { x: 400, y: offset }, // Center X
                { x: X.END_WEST, y: offset }
            ];
        default:
            return [];
    }
};

// Ensure Config is Immutable
Object.freeze(CONFIG);