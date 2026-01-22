// Bitcoin Mining Network Simulation - Miner Management
// Handles miner creation, updates, and autonomous decision making

class MinerManager {
    constructor(simulation) {
        this.sim = simulation;
    }
    
    addRandomMiner(name, baseHashPower, efficiency) {
        const hashPower = baseHashPower * (0.8 + Math.random() * 0.4); // ±20% variation
        const energyCostFactor = 0.9 + Math.random() * 0.2; // Efficiency variation
        
        const miner = {
            id: this.sim.nextMinerId++,
            name: name || `Miner-${this.sim.nextMinerId}`,
            hashPower: hashPower,
            efficiency: efficiency * energyCostFactor,
            active: true,
            blocksMined: 0,
            totalRewards: 0,
            profitability: 0,
            unprofitableTime: 0,
            joinTime: this.sim.simulationTime,
            effectiveHashPower: hashPower
        };
        
        this.sim.miners.push(miner);
        return miner;
    }
    
    addRandomMiners(count = 1) {
        for (let i = 0; i < count; i++) {
            const name = MINER_NAMES[Math.floor(Math.random() * MINER_NAMES.length)];
            const hashPower = 20 + Math.random() * 150;
            const efficiency = 0.6 + Math.random() * 0.3;
            this.addRandomMiner(name, hashPower, efficiency);
        }
    }
    
    removeMiner(id) {
        const index = this.sim.miners.findIndex(m => m.id === id);
        if (index !== -1) {
            this.sim.miners.splice(index, 1);
        }
    }
    
    updateMinerStates() {
        let totalHashPower = 0;
        let activeMiners = 0;
        
        this.sim.miners.forEach(miner => {
            // Apply shock effects to miner
            let effectiveEnergyCost = this.sim.energyCost;
            let effectiveHashPower = miner.hashPower;
            let effectiveEfficiency = miner.efficiency;
            
            // Apply active shock multipliers
            this.sim.activeShocks.forEach(shock => {
                if (shock.energyCostMultiplier) effectiveEnergyCost *= shock.energyCostMultiplier;
                if (shock.hashPowerMultiplier && shock.affectedMiners?.includes(miner.id)) {
                    effectiveHashPower *= shock.hashPowerMultiplier;
                }
                if (shock.efficiencyMultiplier) effectiveEfficiency *= shock.efficiencyMultiplier;
            });
            
            // Calculate profitability with transaction fees
            const hashPowerShare = this.sim.totalHashPower > 0 ? effectiveHashPower / this.sim.totalHashPower : 0;
            const expectedBlocksPerDay = (86400 / this.sim.targetBlockTime) * hashPowerShare;
            const totalBlockReward = this.sim.blockReward + this.sim.avgTransactionFee;
            const dailyRevenue = expectedBlocksPerDay * totalBlockReward * this.sim.btcPrice;
            
            // Energy consumption: watts * 24h * cost / efficiency
            const powerConsumption = effectiveHashPower * 1000; // TH/s to GH/s to watts (approx)
            const dailyCost = (powerConsumption / 1000) * 24 * effectiveEnergyCost / effectiveEfficiency;
            
            miner.profitability = dailyRevenue - dailyCost;
            miner.effectiveHashPower = effectiveHashPower;
            
            // Check for hardware degradation over time
            if (this.sim.simulationTime - miner.joinTime > 86400 * 30) { // After 30 days
                const degradation = 1 - (this.sim.simulationTime - miner.joinTime) / (86400 * 365 * 2) * 0.15; // 15% over 2 years
                miner.efficiency = Math.max(0.3, miner.efficiency * degradation);
            }
            
            // Automatically activate/deactivate based on profitability
            if (miner.profitability <= 0 && miner.active) {
                miner.unprofitableTime = (miner.unprofitableTime || 0) + 1;
                
                if (miner.unprofitableTime > 300) { // 5 minutes
                    miner.active = false;
                    miner.unprofitableTime = 0;
                    this.sim.eventManager.logEvent('MINER_SHUTDOWN', `${miner.name} shut down due to unprofitability`, 'warning');
                }
            } else if (miner.profitability > miner.hashPower * 0.5 && !miner.active) {
                // Reactivate if profitable enough
                miner.active = true;
                miner.unprofitableTime = 0;
                this.sim.eventManager.logEvent('MINER_RESTART', `${miner.name} restarted - profitable again`, 'success');
            } else {
                miner.unprofitableTime = 0;
            }
            
            if (miner.active) {
                totalHashPower += effectiveHashPower;
                activeMiners++;
            }
        });
        
        this.sim.totalHashPower = totalHashPower;
        this.sim.activeMiners = activeMiners;
    }
    
    // Autonomous miner decision making
    makeAutonomousDecisions() {
        this.sim.miners.forEach(miner => {
            // Decision 1: Upgrade hardware if profitable and old
            const minerAge = this.sim.simulationTime - miner.joinTime;
            if (minerAge > 86400 * 60 && miner.profitability > 500 && Math.random() < 0.1) {
                this.upgradeMiner(miner);
            }
            
            // Decision 2: Expand operations if very profitable
            if (miner.profitability > miner.hashPower * 2 && Math.random() < 0.05) {
                this.expandMinerOperations(miner);
            }
            
            // Decision 3: Reduce operations if struggling
            if (miner.profitability < 0 && miner.active && Math.random() < 0.15) {
                this.reduceMinerOperations(miner);
            }
            
            // Decision 4: Exit market if consistently unprofitable
            if (miner.profitability < -miner.hashPower * 0.5 && Math.random() < 0.08) {
                this.minerExitsMarket(miner);
            }
        });
        
        // New miners enter if network is profitable
        if (this.sim.activeMiners > 0 && Math.random() < 0.1) {
            const avgProfitability = this.sim.miners
                .filter(m => m.active)
                .reduce((sum, m) => sum + m.profitability, 0) / this.sim.activeMiners;
            
            if (avgProfitability > 100) {
                this.newMinerEntersMarket();
            }
        }
    }
    
    upgradeMiner(miner) {
        const oldHashPower = miner.hashPower;
        miner.hashPower *= 1.5 + Math.random() * 0.5; // 1.5x - 2x upgrade
        miner.efficiency = Math.min(0.95, miner.efficiency * 1.2);
        this.sim.eventManager.logEvent('MINER_UPGRADE', 
            `${miner.name} upgraded hardware: ${oldHashPower.toFixed(1)} → ${miner.hashPower.toFixed(1)} TH/s`, 
            'success');
    }
    
    expandMinerOperations(miner) {
        const expansion = miner.hashPower * (0.2 + Math.random() * 0.3);
        miner.hashPower += expansion;
        this.sim.eventManager.logEvent('MINER_EXPANSION', 
            `${miner.name} expanded operations by ${expansion.toFixed(1)} TH/s`, 
            'info');
    }
    
    reduceMinerOperations(miner) {
        const reduction = miner.hashPower * (0.2 + Math.random() * 0.2);
        miner.hashPower = Math.max(10, miner.hashPower - reduction);
        this.sim.eventManager.logEvent('MINER_REDUCTION', 
            `${miner.name} reduced operations by ${reduction.toFixed(1)} TH/s`, 
            'warning');
    }
    
    minerExitsMarket(miner) {
        this.sim.eventManager.logEvent('MINER_EXIT', 
            `${miner.name} exited the market`, 
            'danger');
        this.removeMiner(miner.id);
    }
    
    newMinerEntersMarket() {
        const hashPower = 30 + Math.random() * 100;
        const efficiency = 0.75 + Math.random() * 0.15;
        const name = NEW_ENTRANT_NAMES[Math.floor(Math.random() * NEW_ENTRANT_NAMES.length)] + ' #' + this.sim.nextMinerId;
        this.addRandomMiner(name, hashPower, efficiency);
        this.sim.eventManager.logEvent('MINER_ENTRY', 
            `${name} entered the market with ${hashPower.toFixed(1)} TH/s`, 
            'info');
    }
    
    triggerMinerUpgrades() {
        // Some miners upgrade to new hardware
        const upgradeCount = Math.ceil(this.sim.miners.length * (0.3 + Math.random() * 0.3));
        const minersToUpgrade = [...this.sim.miners]
            .filter(m => m.profitability > 0)
            .sort(() => Math.random() - 0.5)
            .slice(0, upgradeCount);
        
        minersToUpgrade.forEach(miner => {
            setTimeout(() => this.upgradeMiner(miner), Math.random() * 300000);
        });
    }
    
    mergePools() {
        if (this.sim.miners.length < 2) return;
        
        // Select two miners to merge
        const sorted = [...this.sim.miners].sort((a, b) => b.hashPower - a.hashPower);
        const miner1 = sorted[Math.floor(Math.random() * Math.min(3, sorted.length))];
        const miner2 = sorted[Math.floor(Math.random() * Math.min(3, sorted.length))];
        
        if (miner1.id === miner2.id) return;
        
        // Merge smaller into larger
        miner1.hashPower += miner2.hashPower;
        miner1.blocksMined += miner2.blocksMined;
        miner1.totalRewards += miner2.totalRewards;
        miner1.name = `${miner1.name} + ${miner2.name}`;
        
        this.removeMiner(miner2.id);
        
        this.sim.eventManager.logEvent('POOL_MERGE', 
            `Mining pools merged into ${miner1.name.substring(0, 30)}...`, 
            'info');
    }
}
