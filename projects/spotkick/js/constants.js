export const CONSTANTS = {
    PHYSICS: {
        GRAVITY: 9.81,
        AIR_DENSITY: 1.225, // kg/m^3
        DRAG_COEFFICIENT: 0.47, // Sphere
        BALL_RADIUS: 0.11, // meters
        BALL_MASS: 0.43, // kg
        MAGNUS_EFFECT_MULTIPLIER: 0.005,
        TIMESTEP: 1 / 60,
        SUB_STEPS: 5 // Physics steps per frame for accuracy
    },
    GAME: {
        TOTAL_ROUNDS: 5,
        WIN_SCORE: 5,
        KEEPER_REACTION_BASE: 300, // ms
    },
    FIELD: {
        GOAL_WIDTH: 7.32, // meters
        GOAL_HEIGHT: 2.44, // meters
        GOAL_Z: 11, // meters (11m spot to goal line)
        BALL_START_Z: 0,
        KEEPER_START_Z: 11
    },
    EVENTS: {
        GAME_START: 'game_start',
        GAME_OVER: 'game_over',
        SHOT_TAKEN: 'shot_taken',
        GOAL_SCORED: 'goal_scored',
        SHOT_SAVED: 'shot_saved',
        SHOT_MISSED: 'shot_missed',
        ROUND_END: 'round_end'
    },
    STATES: {
        MENU: 'MENU',
        AIMING: 'AIMING',
        POWERING: 'POWERING',
        SHOOTING: 'SHOOTING',
        FLIGHT: 'FLIGHT',
        REPLAY: 'REPLAY',
        ROUND_OVER: 'ROUND_OVER',
        GAME_OVER: 'GAME_OVER'
    }
};
