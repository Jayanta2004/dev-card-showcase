// Bitcoin Mining Network Simulation - Event System
// Handles event-driven shocks and emergent network dynamics

class EventManager {
    constructor(simulation) {
        this.sim = simulation;
    }
    
    triggerRandomEvent() {
        const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        this.triggerEvent(eventType);
    }
    
    triggerEvent(eventType) {
        const event = {
            id: this.sim.nextEventId++,
            type: eventType,
            startTime: this.sim.simulationTime,
            duration: 300 + Math.random() * 1800, // 5-30 minutes
        };
        
        switch(eventType) {
            case 'ENERGY_SPIKE':
                event.energyCostMultiplier = 1.5 + Math.random() * 1.0; // 1.5x - 2.5x
                event.name = 'Energy Price Spike';
                event.description = `Energy costs increased by ${((event.energyCostMultiplier - 1) * 100).toFixed(0)}%`;
                event.severity = 'warning';
                break;
                
            case 'ENERGY_DROP':
                event.energyCostMultiplier = 0.5 + Math.random() * 0.3; // 0.5x - 0.8x
                event.name = 'Energy Price Drop';
                event.description = `Energy costs decreased by ${((1 - event.energyCostMultiplier) * 100).toFixed(0)}%`;
                event.severity = 'success';
                break;
                
            case 'BTC_CRASH':
                event.btcPriceMultiplier = 0.6 + Math.random() * 0.2; // 60-80% of current
                event.name = 'BTC Price Crash';
                event.description = `Bitcoin price crashed by ${((1 - event.btcPriceMultiplier) * 100).toFixed(0)}%`;
                event.severity = 'danger';
                break;
                
            case 'BTC_RALLY':
                event.btcPriceMultiplier = 1.3 + Math.random() * 0.5; // 1.3x - 1.8x
                event.name = 'BTC Rally';
                event.description = `Bitcoin price surged by ${((event.btcPriceMultiplier - 1) * 100).toFixed(0)}%`;
                event.severity = 'success';
                break;
                
            case 'HARDWARE_FAILURE':
                const affectedCount = Math.ceil(this.sim.miners.length * (0.1 + Math.random() * 0.2));
                event.affectedMiners = this.sim.miners
                    .sort(() => Math.random() - 0.5)
                    .slice(0, affectedCount)
                    .map(m => m.id);
                event.hashPowerMultiplier = 0.3 + Math.random() * 0.4; // 30-70% capacity
                event.name = 'Hardware Failure';
                event.description = `${affectedCount} miners experiencing hardware issues`;
                event.severity = 'warning';
                break;
                
            case 'NEW_ASIC_RELEASE':
                event.name = 'New ASIC Release';
                event.description = 'Next-gen mining hardware available';
                event.severity = 'info';
                // Trigger autonomous miner upgrades
                this.sim.minerManager.triggerMinerUpgrades();
                break;
                
            case 'REGULATION_CHANGE':
                event.energyCostMultiplier = 0.8 + Math.random() * 0.6; // 0.8x - 1.4x
                event.name = 'Regulatory Change';
                event.description = 'New mining regulations imposed';
                event.severity = Math.random() > 0.5 ? 'warning' : 'info';
                break;
                
            case 'NETWORK_CONGESTION':
                event.feeMultiplier = 2 + Math.random() * 3; // 2x - 5x fees
                event.name = 'Network Congestion';
                event.description = `Transaction fees spiked ${event.feeMultiplier.toFixed(1)}x`;
                event.severity = 'success'; // Good for miners
                break;
                
            case 'POOL_MERGER':
                event.name = 'Pool Merger';
                event.description = 'Major mining pools consolidating';
                event.severity = 'info';
                if (this.sim.miners.length > 2) {
                    this.sim.minerManager.mergePools();
                }
                break;
                
            case 'WEATHER_EVENT':
                const affectedByWeather = Math.ceil(this.sim.miners.length * (0.2 + Math.random() * 0.3));
                event.affectedMiners = this.sim.miners
                    .sort(() => Math.random() - 0.5)
                    .slice(0, affectedByWeather)
                    .map(m => m.id);
                event.hashPowerMultiplier = Math.random() > 0.5 ? 0.5 : 0; // 50% or complete outage
                event.name = 'Severe Weather';
                event.description = `${affectedByWeather} miners affected by weather event`;
                event.severity = 'danger';
                break;
        }
        
        this.sim.activeShocks.push(event);
        this.logEvent(eventType, event.description, event.severity);
        
        // Schedule event end
        setTimeout(() => {
            this.endEvent(event.id);
        }, event.duration * 1000 / this.sim.simulationSpeed);
    }
    
    endEvent(eventId) {
        const index = this.sim.activeShocks.findIndex(e => e.id === eventId);
        if (index !== -1) {
            const event = this.sim.activeShocks[index];
            this.logEvent('EVENT_END', `${event.name} ended`, 'info');
            this.sim.activeShocks.splice(index, 1);
        }
    }
    
    processActiveShocks() {
        this.sim.activeShocks.forEach(shock => {
            // Apply BTC price effects
            if (shock.btcPriceMultiplier && !shock.btcPriceApplied) {
                this.sim.btcPrice *= shock.btcPriceMultiplier;
                shock.btcPriceApplied = true;
            }
            
            // Apply fee effects
            if (shock.feeMultiplier && !shock.feeApplied) {
                this.sim.avgTransactionFee *= shock.feeMultiplier;
                shock.feeApplied = true;
            }
        });
    }
    
    logEvent(type, description, severity = 'info') {
        const event = {
            type,
            description,
            severity,
            time: this.sim.formatTime(this.sim.simulationTime),
            timestamp: Date.now()
        };
        
        this.sim.eventHistory.unshift(event);
        if (this.sim.eventHistory.length > 50) {
            this.sim.eventHistory.pop();
        }
        
        // Visual notification
        this.showNotification(description, severity);
    }
    
    showNotification(message, severity) {
        // Create notification container if not exists
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${severity}`;
        notification.innerHTML = `
            <i class="fas fa-${severity === 'success' ? 'check-circle' : severity === 'danger' ? 'exclamation-triangle' : severity === 'warning' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}
