// Bitcoin Mining Network Simulation - Configuration
// Contains all constants and initial parameters

const SIMULATION_CONFIG = {
    // Network parameters
    BLOCK_REWARD_INITIAL: 6.25,
    HALVING_INTERVAL: 210000,
    TARGET_BLOCK_TIME: 600, // 10 minutes in seconds
    DIFFICULTY_INITIAL: 20000000000000, // ~20T starting difficulty
    DIFFICULTY_ADJUSTMENT_INTERVAL: 2016,
    
    // Economics
    ENERGY_COST_INITIAL: 0.08, // $ per kWh
    BTC_PRICE_INITIAL: 45000, // USD per BTC
    AVG_TRANSACTION_FEE: 0.1, // BTC per block in fees
    
    // Network dynamics
    NETWORK_LATENCY: 2, // Average block propagation delay in seconds
    MEMPOOL_MAX_SIZE: 5000,
    
    // Event probabilities
    EVENT_TRIGGER_CHANCE: 0.0003, // Per tick (~1.8% per minute)
    
    // Miner decision intervals
    AUTONOMOUS_DECISION_INTERVAL: 60, // seconds
    BTC_PRICE_UPDATE_INTERVAL: 30, // seconds
    STATS_RECORD_INTERVAL: 60, // seconds
};

const EVENT_TYPES = [
    'ENERGY_SPIKE', 'ENERGY_DROP', 'BTC_CRASH', 'BTC_RALLY',
    'HARDWARE_FAILURE', 'NEW_ASIC_RELEASE', 'REGULATION_CHANGE',
    'NETWORK_CONGESTION', 'POOL_MERGER', 'WEATHER_EVENT'
];

const MINER_NAMES = [
    'HashFlare Pro', 'Genesis Mining', 'Bitmain S19', 'Whatsminer M50',
    'Canaan Avalon', 'Ebang E12', 'MicroBT Whatsminer', 'Innosilicon T3',
    'Goldshell KD6', 'iBeLink BM-K1', 'Halong Mining', 'StrongU STU-U8'
];

const NEW_ENTRANT_NAMES = [
    'New Competitor', 'Startup Mining Co', 'Institutional Miner', 
    'Regional Pool', 'Private Farm', 'Investment Mining'
];
