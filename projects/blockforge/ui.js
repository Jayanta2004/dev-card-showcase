// Bitcoin Mining Network Simulation - UI Manager
// Handles all UI updates and display methods

class UIManager {
    constructor(simulation) {
        this.sim = simulation;
        this.initDOMReferences();
    }
    
    initDOMReferences() {
        // Network metrics
        this.totalHashElement = document.getElementById('total-hash');
        this.difficultyElement = document.getElementById('current-difficulty');
        this.blockHeightElement = document.getElementById('block-height');
        this.blockRewardElement = document.getElementById('block-reward');
        this.avgBlockTimeElement = document.getElementById('avg-block-time');
        this.activeMinersElement = document.getElementById('active-miners');
        this.inactiveMinersElement = document.getElementById('inactive-miners');
        this.energyCostElement = document.getElementById('energy-cost');
        
        // Hash distribution chart
        this.hashChartElement = document.getElementById('hash-distribution-chart');
        
        // Miners table
        this.minersTableBody = document.getElementById('miners-table-body');
        
        // Blocks timeline
        this.blocksTimeline = document.getElementById('blocks-timeline');
        this.blocksCountElement = document.getElementById('blocks-count');
        
        // Simulation controls
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.addMinerBtn = document.getElementById('add-miner-btn');
        this.addRandomMinersBtn = document.getElementById('add-random-miners-btn');
        this.simulationSpeedSlider = document.getElementById('simulation-speed');
        this.speedValueElement = document.getElementById('speed-value');
        this.energyCostSlider = document.getElementById('energy-cost-slider');
        this.energyCostValueElement = document.getElementById('energy-cost-value');
        
        // Statistics
        this.simTimeElement = document.getElementById('sim-time');
        this.totalBlocksElement = document.getElementById('total-blocks');
        this.totalBTCElement = document.getElementById('total-btc');
        this.lastBlockInfo = document.getElementById('last-block-info');
        this.nextDifficultyAdjustment = document.getElementById('next-difficulty-adjustment');
    }
    
    updateNetworkMetrics() {
        // Format hash power (EH/s)
        const hashPowerEH = this.sim.totalHashPower / 1000;
        this.totalHashElement.textContent = `${hashPowerEH.toFixed(2)} EH/s`;
        
        // Format difficulty (in Trillions)
        const difficultyT = this.sim.difficulty / 1e12;
        this.difficultyElement.textContent = `${difficultyT.toFixed(2)} T`;
        
        // Block height and reward
        this.blockHeightElement.textContent = this.sim.blockHeight.toLocaleString();
        this.blockRewardElement.textContent = `Reward: ${this.sim.blockReward.toFixed(2)} BTC + ${this.sim.avgTransactionFee.toFixed(4)} fees`;
        
        // Average block time
        const avgTime = this.sim.blockTimes.length > 0 
            ? this.sim.blockTimes.reduce((a, b) => a + b, 0) / this.sim.blockTimes.length 
            : 0;
        this.avgBlockTimeElement.textContent = `${Math.round(avgTime)}s`;
        
        // Miners
        this.activeMinersElement.textContent = this.sim.activeMiners;
        this.inactiveMinersElement.textContent = `Inactive: ${this.sim.miners.length - this.sim.activeMiners}`;
        
        // Energy cost (show current effective cost)
        let effectiveCost = this.sim.energyCost;
        this.sim.activeShocks.forEach(shock => {
            if (shock.energyCostMultiplier) effectiveCost *= shock.energyCostMultiplier;
        });
        this.energyCostElement.textContent = `$${effectiveCost.toFixed(2)}/kWh`;
        
        // Next difficulty adjustment
        const blocksLeft = this.sim.difficultyAdjustmentInterval - this.sim.blocksSinceLastAdjustment;
        this.nextDifficultyAdjustment.textContent = `Next difficulty adjustment: ${blocksLeft} blocks`;
        
        // Last block info
        if (this.sim.blocksFound.length > 0) {
            const lastBlock = this.sim.blocksFound[0];
            this.lastBlockInfo.textContent = `Last block: #${lastBlock.height} by ${lastBlock.minerName}`;
        }
    }
    
    updateMinersTable() {
        this.minersTableBody.innerHTML = '';
        
        this.sim.miners.forEach(miner => {
            const row = document.createElement('tr');
            
            // Calculate daily profitability
            const dailyProfit = miner.profitability;
            const isProfitable = dailyProfit > 0;
            
            row.innerHTML = `
                <td>
                    <div class="miner-id">${miner.name}</div>
                    <div class="miner-subid">ID: ${miner.id}</div>
                </td>
                <td>${miner.hashPower.toFixed(2)} TH/s</td>
                <td>${(miner.efficiency * 100).toFixed(1)}%</td>
                <td>
                    <span class="miner-status ${miner.active ? 'active' : 'inactive'}">
                        <i class="fas fa-${miner.active ? 'power-off' : 'pause-circle'}"></i>
                        ${miner.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <span class="profitability-indicator ${isProfitable ? 'profitable' : 'unprofitable'}">
                        <i class="fas fa-${isProfitable ? 'arrow-up' : 'arrow-down'}"></i>
                        $${Math.abs(dailyProfit).toFixed(2)}/day
                    </span>
                </td>
                <td>${miner.blocksMined}</td>
                <td>${miner.totalRewards.toFixed(4)} BTC</td>
                <td>
                    <button class="btn btn-danger btn-sm remove-miner" data-id="${miner.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            this.minersTableBody.appendChild(row);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-miner').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minerId = parseInt(e.target.closest('button').dataset.id);
                this.sim.minerManager.removeMiner(minerId);
                this.updateMinersTable();
            });
        });
    }
    
    updateHashDistributionChart() {
        this.hashChartElement.innerHTML = '';
        
        // Sort miners by hash power
        const sortedMiners = [...this.sim.miners]
            .filter(m => m.active)
            .sort((a, b) => b.hashPower - a.hashPower)
            .slice(0, 8); // Show top 8
        
        if (sortedMiners.length === 0) {
            this.hashChartElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-server"></i>
                    <p>No active miners</p>
                </div>
            `;
            return;
        }
        
        // Find max hash power for scaling
        const maxHashPower = Math.max(...sortedMiners.map(m => m.hashPower));
        
        sortedMiners.forEach(miner => {
            const percentage = (miner.hashPower / this.sim.totalHashPower) * 100;
            const barWidth = (miner.hashPower / maxHashPower) * 80 + 20; // 20-100%
            
            const barElement = document.createElement('div');
            barElement.className = 'hash-bar';
            barElement.innerHTML = `
                <div class="hash-bar-label">${miner.name}</div>
                <div class="hash-bar-container">
                    <div class="hash-bar-fill" style="width: ${barWidth}%"></div>
                </div>
                <div class="hash-bar-value">${miner.hashPower.toFixed(1)} TH/s (${percentage.toFixed(1)}%)</div>
            `;
            
            this.hashChartElement.appendChild(barElement);
        });
    }
    
    addBlockToTimeline(block) {
        const blockElement = document.createElement('div');
        blockElement.className = 'block-item';
        blockElement.innerHTML = `
            <div class="block-header">
                <div class="block-height">Block #${block.height}</div>
                <div class="block-time">${block.time}</div>
            </div>
            <div class="block-miner">
                <i class="fas fa-user-hard-hat"></i>
                <span>Mined by: ${block.minerName}</span>
            </div>
            <div class="block-details">
                <div class="block-hashpower">${block.hashPower.toFixed(1)} TH/s</div>
                <div class="block-reward">${block.reward.toFixed(2)} BTC</div>
            </div>
        `;
        
        // Remove empty state if present
        const emptyState = this.blocksTimeline.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        // Add to timeline (at the top)
        if (this.blocksTimeline.firstChild) {
            this.blocksTimeline.insertBefore(blockElement, this.blocksTimeline.firstChild);
        } else {
            this.blocksTimeline.appendChild(blockElement);
        }
        
        // Limit displayed blocks
        const blockItems = this.blocksTimeline.querySelectorAll('.block-item');
        if (blockItems.length > 10) {
            blockItems[blockItems.length - 1].remove();
        }
    }
    
    updateBlocksCount() {
        this.blocksCountElement.textContent = `${this.sim.totalBlocks} blocks`;
    }
    
    updateSimulationStats() {
        // Format simulation time
        const days = Math.floor(this.sim.simulationTime / 86400);
        const hours = Math.floor((this.sim.simulationTime % 86400) / 3600);
        const minutes = Math.floor((this.sim.simulationTime % 3600) / 60);
        
        this.simTimeElement.textContent = `${days}d ${hours}h ${minutes}m`;
        this.totalBlocksElement.textContent = this.sim.totalBlocks.toLocaleString();
        this.totalBTCElement.textContent = this.sim.totalBTC.toFixed(2);
    }
}
