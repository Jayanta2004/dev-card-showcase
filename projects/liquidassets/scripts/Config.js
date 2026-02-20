export const Config = {
    // Canvas & Simulation
    MAX_PARTICLES: 2200,
    GRAVITY: 900, // Increased gravity for more "liquid" feel on screen scale
    DT: 0.016, // Fixed time step (target 60fps)
    
    // SPH Physics Parameters
    SMOOTHING_RADIUS: 35, // h
    TARGET_DENSITY: 0.003, // Rest density
    PRESSURE_MULTIPLIER: 4000, // k (Stiffness)
    VISCOSITY_SIGMA: 0.1, // Viscosity strength
    COLLISION_DAMPING: 0.4, // Wall bounce energy loss
    
    // Spatial Grid
    GRID_CELL_SIZE: 35, // Should filter >= SMOOTHING_RADIUS

    // Visuals
    PARTICLE_RADIUS: 4, // Visual radius
    PARTICLE_COLOR_LOW_DENSITY: '#64ffda', // Light cyan
    PARTICLE_COLOR_HIGH_DENSITY: '#0a5fd0', // Deep blue
    
    // Financial Scaling
    PIXELS_TO_DOLLARS: 0.05, // Conversion rate
    INCOME_SPAWN_INTERVAL: 2, // frames between spawns (dynamic)
};
