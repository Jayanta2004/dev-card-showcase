// Bitcoin Mining Network Simulation - Mining Logic
// Handles block discovery, difficulty adjustment, and blockchain mechanics

class MiningEngine {
    constructor(simulation) {
        this.sim = simulation;
    }
    
    attemptBlockDiscovery() {
        if (this.sim.totalHashPower === 0) return;
        
        // Realistic Bitcoin mining probability
        // Total hashes computed per second by network
        const totalHashesPerSecond = this.sim.totalHashPower * 1e12; // Convert TH/s to H/s
        
        // Probability = (hashes per tick) / (expected hashes per block)
        // Using Poisson process for block discovery
        const hashesThisTick = totalHashesPerSecond * 1; // 1 second per tick
        const probability = hashesThisTick / this.sim.expectedHashesPerBlock;
        
        // Poisson probability of finding at least one block
        const blockFoundProbability = 1 - Math.exp(-probability);
        
        if (Math.random() < blockFoundProbability) {
            this.foundBlock();
            
            // Small chance of simultaneous blocks (network race)
            if (Math.random() < 0.02 && this.sim.miners.length > 3) {
                setTimeout(() => this.handleOrphanBlock(), Math.random() * this.sim.networkLatency * 1000);
            }
        }
    }
    
    foundBlock() {
        // Determine which miner found the block (probabilistic based on hash power)
        let winner = null;
        let cumulativeProbability = 0;
        const randomValue = Math.random();
        
        for (const miner of this.sim.miners) {
            if (!miner.active) continue;
            
            const probability = miner.hashPower / this.sim.totalHashPower;
            cumulativeProbability += probability;
            
            if (randomValue <= cumulativeProbability) {
                winner = miner;
                break;
            }
        }
        
        if (!winner) return;
        
        // Calculate block time
        const blockTime = this.sim.simulationTime - this.sim.lastBlockTime;
        this.sim.lastBlockTime = this.sim.simulationTime;
        this.sim.blockTimes.push(blockTime);
        
        // Keep only recent block times for average calculation
        if (this.sim.blockTimes.length > 144) { // Last 144 blocks (~1 day)
            this.sim.blockTimes.shift();
        }
        
        // Update miner stats
        winner.blocksMined++;
        winner.totalRewards += this.sim.blockReward + this.sim.avgTransactionFee;
        
        // Clear mempool (transactions included in block)
        const txsIncluded = Math.min(2000, this.sim.mempool.length);
        this.sim.mempool = this.sim.mempool.slice(txsIncluded);
        
        // Update network stats
        this.sim.blockHeight++;
        this.sim.totalBlocks++;
        this.sim.totalBTC += this.sim.blockReward;
        this.sim.blocksSinceLastAdjustment++;
        
        // Halving logic
        if (this.sim.blockHeight % this.sim.halvingInterval === 0) {
            this.sim.blockReward /= 2;
            this.sim.eventManager.logEvent('HALVING', 
                `Block reward halved to ${this.sim.blockReward.toFixed(2)} BTC`, 
                'warning');
        }
        
        // Record block
        const block = {
            height: this.sim.blockHeight,
            minerId: winner.id,
            minerName: winner.name,
            reward: this.sim.blockReward,
            time: this.sim.formatTime(this.sim.simulationTime),
            timestamp: Date.now(),
            hashPower: winner.hashPower
        };
        
        this.sim.blocksFound.unshift(block);
        
        // Keep only recent blocks for display
        if (this.sim.blocksFound.length > 10) {
            this.sim.blocksFound.pop();
        }
        
        // Difficulty adjustment
        if (this.sim.blocksSinceLastAdjustment >= this.sim.difficultyAdjustmentInterval && 
            this.sim.difficultyToggle.checked) {
            this.adjustDifficulty();
            this.sim.blocksSinceLastAdjustment = 0;
        }
        
        // Update UI
        this.sim.uiManager.addBlockToTimeline(block);
        this.sim.uiManager.updateBlocksCount();
    }
    
    adjustDifficulty() {
        if (this.sim.blockTimes.length < 10) return;
        
        // Calculate average block time over adjustment period
        const averageBlockTime = this.sim.blockTimes.reduce((a, b) => a + b, 0) / this.sim.blockTimes.length;
        const ratio = this.sim.targetBlockTime / averageBlockTime;
        
        // Bitcoin protocol: max adjustment is 4x in either direction
        const adjustmentFactor = Math.max(0.25, Math.min(4, ratio));
        
        const oldDifficulty = this.sim.difficulty;
        this.sim.difficulty = this.sim.difficulty * adjustmentFactor;
        this.sim.expectedHashesPerBlock = Math.pow(2, 32) * this.sim.difficulty;
        
        // Log difficulty adjustment
        const change = ((this.sim.difficulty - oldDifficulty) / oldDifficulty * 100).toFixed(2);
        this.sim.eventManager.logEvent('DIFFICULTY_ADJUSTMENT', 
            `Difficulty adjusted by ${change > 0 ? '+' : ''}${change}% to ${(this.sim.difficulty / 1e12).toFixed(2)}T`, 
            'info');
        
        // Reset block times for next period
        this.sim.blockTimes = [];
    }
    
    handleOrphanBlock() {
        this.sim.orphanedBlocks++;
        this.sim.eventManager.logEvent('ORPHAN_BLOCK', 
            'Orphaned block detected - chain reorganization', 
            'warning');
        
        // Small chance of chain reorg
        if (Math.random() < 0.3) {
            this.sim.chainReorgs++;
        }
    }
    
    updateMempool() {
        // Simulate transaction growth
        const newTxs = Math.floor(Math.random() * 10) + 5;
        this.sim.mempool.push(...Array(newTxs).fill(0));
        
        // Limit mempool size
        if (this.sim.mempool.length > SIMULATION_CONFIG.MEMPOOL_MAX_SIZE) {
            this.sim.mempool = this.sim.mempool.slice(-SIMULATION_CONFIG.MEMPOOL_MAX_SIZE);
        }
        
        // Update avg fee based on congestion
        const congestionFactor = this.sim.mempool.length / 2000;
        this.sim.avgTransactionFee = 0.05 + congestionFactor * 0.3;
    }
    
    updateBTCPrice() {
        // Natural price volatility
        const volatility = (Math.random() - 0.5) * 0.002; // ±0.2% per 30 seconds
        this.sim.btcPrice *= (1 + volatility);
        
        // Keep within reasonable bounds
        this.sim.btcPrice = Math.max(20000, Math.min(80000, this.sim.btcPrice));
        
        this.sim.btcPriceHistory.push(this.sim.btcPrice);
        if (this.sim.btcPriceHistory.length > 100) {
            this.sim.btcPriceHistory.shift();
        }
    }
}
