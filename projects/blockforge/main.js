// Bitcoin Mining Network Simulation - Main Class
// Coordinates all simulation components and manages the simulation loop

class BitcoinMiningSimulation {
    constructor() {
        // Simulation state
        this.isRunning = true;
        this.simulationSpeed = 5;
        this.simulationTime = 0; // in seconds
        this.lastBlockTime = 0;
        this.tickCount = 0;
        
        // Network parameters
        this.blockHeight = 0;
        this.totalBlocks = 0;
        this.totalBTC = 0;
        this.blockReward = SIMULATION_CONFIG.BLOCK_REWARD_INITIAL;
        this.halvingInterval = SIMULATION_CONFIG.HALVING_INTERVAL;
        this.targetBlockTime = SIMULATION_CONFIG.TARGET_BLOCK_TIME;
        
        // Difficulty system (using realistic Bitcoin difficulty scale)
        this.difficulty = SIMULATION_CONFIG.DIFFICULTY_INITIAL;
        this.difficultyAdjustmentInterval = SIMULATION_CONFIG.DIFFICULTY_ADJUSTMENT_INTERVAL;
        this.blocksSinceLastAdjustment = 0;
        this.blockTimes = [];
        this.expectedHashesPerBlock = Math.pow(2, 32) * this.difficulty;
        
        // Miners
        this.miners = [];
        this.nextMinerId = 1;
        this.totalHashPower = 0;
        this.activeMiners = 0;
        
        // Economics
        this.energyCost = SIMULATION_CONFIG.ENERGY_COST_INITIAL;
        this.btcPrice = SIMULATION_CONFIG.BTC_PRICE_INITIAL;
        this.btcPriceHistory = [SIMULATION_CONFIG.BTC_PRICE_INITIAL];
        
        // Mempool and transaction fees
        this.mempool = [];
        this.avgTransactionFee = SIMULATION_CONFIG.AVG_TRANSACTION_FEE;
        
        // Event-driven shock system
        this.events = [];
        this.activeShocks = [];
        this.nextEventId = 1;
        
        // Network dynamics
        this.networkLatency = SIMULATION_CONFIG.NETWORK_LATENCY;
        this.orphanedBlocks = 0;
        this.chainReorgs = 0;
        
        // Statistics
        this.blocksFound = [];
        this.networkHistory = [];
        this.eventHistory = [];
        
        // Initialize managers
        this.minerManager = new MinerManager(this);
        this.eventManager = new EventManager(this);
        this.miningEngine = new MiningEngine(this);
        this.uiManager = new UIManager(this);
        
        // Get difficulty toggle reference
        this.difficultyToggle = document.getElementById('difficulty-adjustment');
        
        // Initialize simulation
        this.initSimulation();
        this.startSimulationLoop();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    initSimulation() {
        // Create initial miners
        this.minerManager.addRandomMiner('ASIC Farm Alpha', 120, 0.85);
        this.minerManager.addRandomMiner('GPU Cluster Beta', 45, 0.65);
        this.minerManager.addRandomMiner('Industrial Miner Gamma', 180, 0.90);
        this.minerManager.addRandomMiner('Small Pool Delta', 25, 0.55);
        
        // Initial UI update
        this.uiManager.updateNetworkMetrics();
        this.uiManager.updateMinersTable();
        this.uiManager.updateHashDistributionChart();
    }
    
    startSimulationLoop() {
        const simulationLoop = () => {
            if (this.isRunning) {
                // Process simulation ticks based on speed
                const ticks = Math.max(1, Math.floor(this.simulationSpeed / 2));
                
                for (let i = 0; i < ticks; i++) {
                    this.processTick();
                }
                
                // Update UI
                this.uiManager.updateNetworkMetrics();
                this.uiManager.updateMinersTable();
                this.uiManager.updateHashDistributionChart();
                this.uiManager.updateSimulationStats();
            }
            
            // Schedule next loop
            setTimeout(simulationLoop, 100);
        };
        
        simulationLoop();
    }
    
    processTick() {
        // Increment simulation time
        this.simulationTime += 1;
        this.tickCount++;
        
        // Update miner states and check profitability
        this.minerManager.updateMinerStates();
        
        // Process active shocks
        this.eventManager.processActiveShocks();
        
        // Randomly trigger events (shock system)
        if (Math.random() < SIMULATION_CONFIG.EVENT_TRIGGER_CHANCE) {
            this.eventManager.triggerRandomEvent();
        }
        
        // Simulate mempool growth
        this.miningEngine.updateMempool();
        
        // Attempt to find a block (realistic probabilistic mining)
        this.miningEngine.attemptBlockDiscovery();
        
        // Miners make autonomous decisions
        if (this.tickCount % SIMULATION_CONFIG.AUTONOMOUS_DECISION_INTERVAL === 0) {
            this.minerManager.makeAutonomousDecisions();
        }
        
        // BTC price volatility
        if (this.tickCount % SIMULATION_CONFIG.BTC_PRICE_UPDATE_INTERVAL === 0) {
            this.miningEngine.updateBTCPrice();
        }
        
        // Record network stats periodically
        if (this.simulationTime % SIMULATION_CONFIG.STATS_RECORD_INTERVAL === 0) {
            this.recordNetworkStats();
        }
    }
    
    recordNetworkStats() {
        const stat = {
            time: this.simulationTime,
            totalHashPower: this.totalHashPower,
            difficulty: this.difficulty,
            activeMiners: this.activeMiners,
            blockHeight: this.blockHeight
        };
        
        this.networkHistory.push(stat);
        
        // Keep history manageable
        if (this.networkHistory.length > 1000) {
            this.networkHistory.shift();
        }
    }
    
    formatTime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        
        if (days > 0) {
            return `${days}d ${hours}h ${mins}m`;
        } else if (hours > 0) {
            return `${hours}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }
    
    setupEventListeners() {
        // Start/Pause button
        this.uiManager.startPauseBtn.addEventListener('click', () => {
            this.isRunning = !this.isRunning;
            
            const icon = this.uiManager.startPauseBtn.querySelector('i');
            
            if (this.isRunning) {
                icon.className = 'fas fa-pause';
                this.uiManager.startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Simulation';
                document.querySelector('.status-indicator').classList.add('active');
                document.querySelector('.status-text').textContent = 'Simulation Running';
            } else {
                icon.className = 'fas fa-play';
                this.uiManager.startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume Simulation';
                document.querySelector('.status-indicator').classList.remove('active');
                document.querySelector('.status-text').textContent = 'Simulation Paused';
            }
        });
        
        // Reset button
        this.uiManager.resetBtn.addEventListener('click', () => {
            if (confirm('Reset the simulation? All data will be lost.')) {
                // Reset simulation state
                this.isRunning = true;
                this.simulationTime = 0;
                this.lastBlockTime = 0;
                this.tickCount = 0;
                this.blockHeight = 0;
                this.totalBlocks = 0;
                this.totalBTC = 0;
                this.blockReward = SIMULATION_CONFIG.BLOCK_REWARD_INITIAL;
                this.difficulty = SIMULATION_CONFIG.DIFFICULTY_INITIAL;
                this.blocksSinceLastAdjustment = 0;
                this.blockTimes = [];
                this.totalHashPower = 0;
                this.expectedHashesPerBlock = Math.pow(2, 32) * this.difficulty;
                
                // Reset miners
                this.miners = [];
                this.nextMinerId = 1;
                
                // Reset blocks and events
                this.blocksFound = [];
                this.activeShocks = [];
                this.eventHistory = [];
                this.uiManager.blocksTimeline.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-cubes"></i>
                        <p>No blocks mined yet</p>
                    </div>
                `;
                
                // Reinitialize
                this.initSimulation();
                
                // Update button state
                this.uiManager.startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Simulation';
                document.querySelector('.status-indicator').classList.add('active');
                document.querySelector('.status-text').textContent = 'Simulation Running';
            }
        });
        
        // Add miner button
        this.uiManager.addMinerBtn.addEventListener('click', () => {
            const hashPower = 50 + Math.random() * 150;
            const efficiency = 0.7 + Math.random() * 0.2;
            this.minerManager.addRandomMiner(`Custom Miner ${this.nextMinerId}`, hashPower, efficiency);
            this.uiManager.updateMinersTable();
        });
        
        // Add random miners button
        this.uiManager.addRandomMinersBtn.addEventListener('click', () => {
            this.minerManager.addRandomMiners(3);
            this.uiManager.updateMinersTable();
        });
        
        // Simulation speed slider
        this.uiManager.simulationSpeedSlider.addEventListener('input', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
            this.uiManager.speedValueElement.textContent = `${this.simulationSpeed}x`;
        });
        
        // Energy cost slider
        this.uiManager.energyCostSlider.addEventListener('input', (e) => {
            this.energyCost = parseInt(e.target.value) / 100;
            this.uiManager.energyCostValueElement.textContent = `$${this.energyCost.toFixed(2)}`;
            this.uiManager.updateNetworkMetrics();
        });
    }
}

// Initialize simulation when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.bitcoinSimulation = new BitcoinMiningSimulation();
});
