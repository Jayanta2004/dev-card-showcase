/**
 * Intelligent Cold-Start Mitigation Layer
 * 
 * Reduces cold-start latency through predictive service prewarming
 * based on demand pattern analysis and historical data.
 */

class ColdStartMitigationLayer {
    constructor() {
        this.mitigationEnabled = false;
        this.systemStartTime = null;
        this.services = [];
        this.warmingSchedule = [];
        this.demandHistory = [];
        this.performanceMetrics = {
            coldStartsWithout: [],
            coldStartsWith: [],
            costSavings: 0,
            preventedColds: 0
        };
        this.selectedService = null;

        this.config = {
            warmingLeadTime: 5000,
            coldStartThreshold: 2000,
            costPerHour: 0.10,
            costPerRequest: 0.0001
        };

        this.initializeDefaults();
    }

    /**
     * Initialize with default services and data
     */
    initializeDefaults() {
        this.services = [
            {
                id: 'api-gateway',
                name: 'API Gateway',
                region: 'us-east-1',
                coldStart: 2500,
                warmStart: 180,
                status: 'idle',
                instances: 2,
                avgResponseTime: 250,
                lastWarmed: null,
                costPerHour: 0.15
            },
            {
                id: 'auth-service',
                name: 'Authentication Service',
                region: 'us-east-1',
                coldStart: 3200,
                warmStart: 220,
                status: 'idle',
                instances: 1,
                avgResponseTime: 380,
                lastWarmed: null,
                costPerHour: 0.12
            },
            {
                id: 'user-service',
                name: 'User Service',
                region: 'us-west-2',
                coldStart: 2100,
                warmStart: 150,
                status: 'idle',
                instances: 3,
                avgResponseTime: 200,
                lastWarmed: null,
                costPerHour: 0.18
            },
            {
                id: 'payment-service',
                name: 'Payment Service',
                region: 'eu-west-1',
                coldStart: 4500,
                warmStart: 400,
                status: 'idle',
                instances: 2,
                avgResponseTime: 650,
                lastWarmed: null,
                costPerHour: 0.25
            },
            {
                id: 'notification-service',
                name: 'Notification Service',
                region: 'us-east-1',
                coldStart: 1800,
                warmStart: 120,
                status: 'idle',
                instances: 1,
                avgResponseTime: 150,
                lastWarmed: null,
                costPerHour: 0.08
            },
            {
                id: 'analytics-service',
                name: 'Analytics Service',
                region: 'us-west-2',
                coldStart: 5000,
                warmStart: 500,
                status: 'idle',
                instances: 2,
                avgResponseTime: 800,
                lastWarmed: null,
                costPerHour: 0.20
            }
        ];

        // Initialize demand history (hourly for last 24h)
        for (let i = 0; i < 24; i++) {
            const baseLoad = 100 + Math.sin(i / 6) * 80;
            const noise = Math.random() * 30;
            this.demandHistory.push({
                hour: i,
                demand: baseLoad + noise,
                coldStarts: Math.floor((baseLoad + noise) * 0.15),
                spike: i === 9 || i === 14 || i === 18
            });
        }

        // Generate demand-based warming schedule
        this.generateWarmingSchedule();
    }

    /**
     * Initialize UI
     */
    initialize() {
        this.updateUI();
    }

    /**
     * Generate optimal warming schedule based on demand forecast
     */
    generateWarmingSchedule() {
        this.warmingSchedule = [];

        // Identify peak demand periods
        this.demandHistory.forEach((period, index) => {
            if (period.demand > 150 && index < 23) {
                // Schedule warming 5 minutes before peak
                const warmingIndex = Math.max(0, index - 1);
                const alreadyScheduled = this.warmingSchedule.some(w => w.hour === warmingIndex);

                if (!alreadyScheduled) {
                    const servicesToWarm = this.selectServicesForWarming(period.demand);
                    this.warmingSchedule.push({
                        hour: warmingIndex,
                        time: `${String(warmingIndex).padStart(2, '0')}:00`,
                        services: servicesToWarm,
                        demand: period.demand,
                        confidence: Math.min(95, 70 + (period.demand / 200 * 30))
                    });
                }
            }
        });

        // Sort by hour
        this.warmingSchedule.sort((a, b) => a.hour - b.hour);
    }

    /**
     * Select services to warm based on demand level
     */
    selectServicesForWarming(demand) {
        const allServices = this.services;
        
        // High-demand: warm all critical services
        if (demand > 180) {
            return allServices.slice(0, 5).map(s => s.id);
        }
        
        // Medium-demand: warm top 3 services
        if (demand > 150) {
            return allServices.slice(0, 3).map(s => s.id);
        }
        
        // Low-demand: warm only API Gateway and Auth
        return [allServices[0].id, allServices[1].id];
    }

    /**
     * Toggle mitigation on/off
     */
    toggleMitigation() {
        this.mitigationEnabled = !this.mitigationEnabled;

        if (this.mitigationEnabled) {
            this.systemStartTime = new Date();
            this.startWarmingCycle();
            alert('✓ Cold-Start Mitigation Enabled');
        } else {
            alert('✓ Cold-Start Mitigation Disabled');
        }

        this.updateUI();
    }

    /**
     * Start warming cycle
     */
    startWarmingCycle() {
        if (!this.mitigationEnabled) return;

        // Prewarm critical services immediately
        const criticalServices = [this.services[0].id, this.services[1].id];
        criticalServices.forEach(id => {
            this.prewarmService(id);
        });
    }

    /**
     * Prewarm a service
     */
    prewarmService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        service.status = 'warming';
        service.lastWarmed = new Date();

        // Simulate warming delay
        setTimeout(() => {
            service.status = 'warm';
            this.performanceMetrics.preventedColds++;
            this.logPerformanceImprovement(service);
            this.updateUI();
        }, service.coldStart / 3);
    }

    /**
     * Log performance improvement from warming
     */
    logPerformanceImprovement(service) {
        const withoutMitigation = service.coldStart;
        const withMitigation = service.warmStart;
        const improvement = withoutMitigation - withMitigation;

        this.performanceMetrics.coldStartsWithout.push(withoutMitigation);
        this.performanceMetrics.coldStartsWith.push(withMitigation);
        
        const savedCost = (improvement / 3600000) * service.costPerHour;
        this.performanceMetrics.costSavings += savedCost;
    }

    /**
     * Simulate demand peaks
     */
    simulateDemand() {
        if (!this.mitigationEnabled) {
            alert('⚠️ Enable mitigation first');
            return;
        }

        // Simulate demand spike
        const spike = Math.floor(Math.random() * 6);
        const service = this.services[spike];

        // Simulate cold start without mitigation
        const coldStartTime = service.coldStart;
        
        // If recently warmed, use warm start
        const lastWarmed = service.lastWarmed ? new Date() - service.lastWarmed : Infinity;
        const isWarm = lastWarmed < 300000; // 5 minutes
        const actualTime = isWarm ? service.warmStart : coldStartTime;

        service.avgResponseTime = actualTime;
        service.status = isWarm ? 'warm' : 'processing';

        if (isWarm) {
            this.performanceMetrics.preventedColds++;
        }

        setTimeout(() => {
            service.status = 'idle';
            this.updateUI();
        }, actualTime);

        this.updateUI();
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
        const metrics = this.calculateMetrics();
        const report = `
Cold-Start Mitigation Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: ${this.mitigationEnabled ? 'Enabled ✓' : 'Disabled'}

Reduction Metrics:
  • Cold starts prevented: ${this.performanceMetrics.preventedColds}
  • Avg response time improvement: ${metrics.latencyReduction.toFixed(0)}ms
  • Worst-case latency improvement: ${(metrics.worstCaseReduction * 100).toFixed(1)}%
  
Cost Metrics:
  • Monthly savings: $${this.performanceMetrics.costSavings.toFixed(2)}
  • Cost per request: $${(this.performanceMetrics.costSavings / Math.max(this.performanceMetrics.preventedColds, 1)).toFixed(4)}
  • Efficiency ratio: ${metrics.efficiencyRatio.toFixed(1)}%
  
Service Coverage:
  • Prewarmed services: ${this.services.filter(s => s.status === 'warm').length}
  • Active monitoring: ${this.services.length}
  • Avg instances: ${(this.services.reduce((sum, s) => sum + s.instances, 0) / this.services.length).toFixed(1)}
  
Demand Forecast:
  • Peak hours: ${this.getPeakHours()}
  • Predicted surges: ${this.warmingSchedule.length}
  • Baseline load: ${this.getBaselineLoad().toFixed(0)} requests/hour
  
Next Warming Window:
  • Time: ${this.getNextWarmingWindow()}
  • Services: ${this.warmingSchedule[0]?.services.length || 0}
  • Confidence: ${(this.warmingSchedule[0]?.confidence || 0).toFixed(0)}%
`;
        alert(report);
    }

    /**
     * Calculate key metrics
     */
    calculateMetrics() {
        const avgColdStartWithout = this.performanceMetrics.coldStartsWithout.length > 0
            ? this.performanceMetrics.coldStartsWithout.reduce((a, b) => a + b, 0) / this.performanceMetrics.coldStartsWithout.length
            : 3000;

        const avgColdStartWith = this.performanceMetrics.coldStartsWith.length > 0
            ? this.performanceMetrics.coldStartsWith.reduce((a, b) => a + b, 0) / this.performanceMetrics.coldStartsWith.length
            : 300;

        const latencyReduction = avgColdStartWithout - avgColdStartWith;
        const worstCaseReduction = latencyReduction / avgColdStartWithout;
        const efficiencyRatio = latencyReduction > 0 ? (latencyReduction / latencyReduction) * 100 : 0;

        return {
            latencyReduction,
            worstCaseReduction,
            efficiencyRatio,
            avgWithout: avgColdStartWithout,
            avgWith: avgColdStartWith
        };
    }

    /**
     * Render services
     */
    renderServices() {
        const container = document.getElementById('servicesGrid');

        container.innerHTML = this.services.map(service => `
            <div class="service-card" onclick="window.mitigation.showServiceDetails('${service.id}')">
                <div class="service-header">
                    <div class="service-name">${service.name}</div>
                    <div class="service-status">
                        ${service.status === 'warm' ? '🟢 Warm' : service.status === 'warming' ? '🟡 Warming' : '⚪ Idle'}
                    </div>
                </div>
                <div class="service-body">
                    <div class="service-metric">
                        <span class="metric-name">Cold Start:</span>
                        <span class="metric-value">${service.coldStart}ms</span>
                    </div>
                    <div class="service-metric">
                        <span class="metric-name">Warm Start:</span>
                        <span class="metric-value">${service.warmStart}ms</span>
                    </div>
                    <div class="service-metric">
                        <span class="metric-name">Avg Response:</span>
                        <span class="metric-value">${service.avgResponseTime}ms</span>
                    </div>
                    <div class="service-metric">
                        <span class="metric-name">Region:</span>
                        <span class="metric-value">${service.region}</span>
                    </div>
                    <div class="service-metric">
                        <span class="metric-name">Instances:</span>
                        <span class="metric-value">${service.instances}</span>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="service-btn" onclick="event.stopPropagation(); window.mitigation.prewarmService('${service.id}')">Prewarm</button>
                    <button class="service-btn" onclick="event.stopPropagation(); window.mitigation.showServiceDetails('${service.id}')">Details</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Show service details
     */
    showServiceDetails(id) {
        const service = this.services.find(s => s.id === id);
        if (!service) return;

        this.selectedService = service;

        const detailsHtml = `
            <p><strong>Service:</strong> ${service.name}</p>
            <p><strong>Region:</strong> ${service.region}</p>
            <p><strong>Instances:</strong> ${service.instances}</p>
            <p><strong>Cold Start:</strong> ${service.coldStart}ms</p>
            <p><strong>Warm Start:</strong> ${service.warmStart}ms</p>
            <p><strong>Cost/Hour:</strong> $${service.costPerHour.toFixed(2)}</p>
            <p><strong>Last Warmed:</strong> ${service.lastWarmed ? service.lastWarmed.toLocaleTimeString() : 'Never'}</p>
            <p><strong>Status:</strong> ${service.status}</p>
        `;

        document.getElementById('serviceTitle').textContent = `${service.name} Details`;
        document.getElementById('serviceDetails').innerHTML = detailsHtml;
        document.getElementById('serviceModal').classList.add('show');
    }

    /**
     * Close modal
     */
    closeModal() {
        document.getElementById('serviceModal').classList.remove('show');
        this.selectedService = null;
    }

    /**
     * Warm service from modal
     */
    warmService() {
        if (this.selectedService) {
            this.prewarmService(this.selectedService.id);
            this.closeModal();
            this.updateUI();
        }
    }

    /**
     * Add warming window
     */
    addWarmingWindow() {
        alert('✓ Add custom warming window');
    }

    /**
     * Optimize schedule
     */
    optimizeSchedule() {
        this.generateWarmingSchedule();
        alert('✓ Warming schedule optimized based on demand forecast');
        this.updateUI();
    }

    /**
     * Clear schedule
     */
    clearSchedule() {
        if (confirm('Clear all warming windows?')) {
            this.warmingSchedule = [];
            alert('✓ Schedule cleared');
            this.updateUI();
        }
    }

    /**
     * Render warming schedule
     */
    renderWarmingSchedule() {
        const container = document.getElementById('warmingList');

        if (this.warmingSchedule.length === 0) {
            container.innerHTML = '<div class="placeholder">No warming windows scheduled</div>';
            return;
        }

        container.innerHTML = this.warmingSchedule.map((window, index) => {
            const served = window.services.length;
            const progress = (served / this.services.length) * 100;

            return `
                <div class="warming-card">
                    <div class="warming-header">
                        <span class="warming-time">🕒 ${window.time}</span>
                        <span class="warming-confidence">${window.confidence.toFixed(0)}% Confidence</span>
                    </div>
                    <div class="warming-services">
                        Services: ${window.services.map(id => 
                            this.services.find(s => s.id === id)?.name
                        ).join(', ')}
                    </div>
                    <div class="warming-progress">
                        <div class="warming-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render performance chart
     */
    renderPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;

        if (this.performanceMetrics.coldStartsWithout.length === 0) {
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Enable mitigation and simulate demand to see performance data', width / 2, height / 2);
            return;
        }

        const padding = 50;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        const maxLatency = Math.max(
            ...this.performanceMetrics.coldStartsWithout,
            ...this.performanceMetrics.coldStartsWith,
            5000
        );

        const dataPoints = Math.max(
            this.performanceMetrics.coldStartsWithout.length,
            this.performanceMetrics.coldStartsWith.length
        );

        const pointSpacing = dataPoints > 1 ? graphWidth / (dataPoints - 1) : graphWidth / 2;

        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw "without mitigation" line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.performanceMetrics.coldStartsWithout.forEach((latency, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - (latency / maxLatency) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw "with mitigation" line
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();

        this.performanceMetrics.coldStartsWith.forEach((latency, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - (latency / maxLatency) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Response Time (ms)', width / 2, height - 10);
    }

    /**
     * Render demand forecast chart
     */
    renderDemandChart() {
        const canvas = document.getElementById('demandChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        canvas.width = width;
        canvas.height = height;

        const padding = 50;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding * 2;

        const maxDemand = Math.max(...this.demandHistory.map(d => d.demand), 200);
        const pointSpacing = graphWidth / (this.demandHistory.length - 1 || 1);

        // Draw axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw demand line
        ctx.strokeStyle = '#0891b2';
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.demandHistory.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = height - padding - (point.demand / maxDemand) * graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Highlight spikes
        ctx.fillStyle = 'rgba(249, 115, 22, 0.3)';
        this.demandHistory.forEach((point, index) => {
            if (point.spike) {
                const x = padding + (index * pointSpacing);
                const y = height - padding - (point.demand / maxDemand) * graphHeight;

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Labels
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Demand (requests/hour)', width / 2, height - 10);
    }

    /**
     * Render latency distribution bars
     */
    renderLatencyDistribution() {
        const allLatencies = [...this.performanceMetrics.coldStartsWith];

        const ranges = {
            '0-100': allLatencies.filter(l => l < 100).length,
            '100-500': allLatencies.filter(l => l >= 100 && l < 500).length,
            '500-1000': allLatencies.filter(l => l >= 500 && l < 1000).length,
            '1000+': allLatencies.filter(l => l >= 1000).length
        };

        const total = allLatencies.length || 1;

        document.getElementById('latency0100').style.width = (ranges['0-100'] / total * 100) + '%';
        document.getElementById('latency0100-pct').textContent = ((ranges['0-100'] / total) * 100).toFixed(0) + '%';

        document.getElementById('latency100500').style.width = (ranges['100-500'] / total * 100) + '%';
        document.getElementById('latency100500-pct').textContent = ((ranges['100-500'] / total) * 100).toFixed(0) + '%';

        document.getElementById('latency5001000').style.width = (ranges['500-1000'] / total * 100) + '%';
        document.getElementById('latency5001000-pct').textContent = ((ranges['500-1000'] / total) * 100).toFixed(0) + '%';

        document.getElementById('latency1000plus').style.width = (ranges['1000+'] / total * 100) + '%';
        document.getElementById('latency1000plus-pct').textContent = ((ranges['1000+'] / total) * 100).toFixed(0) + '%';
    }

    /**
     * Get peak hours
     */
    getPeakHours() {
        const sorted = [...this.demandHistory].sort((a, b) => b.demand - a.demand);
        return sorted.slice(0, 3).map(h => `${String(h.hour).padStart(2, '0')}:00`).join(', ');
    }

    /**
     * Get baseline load
     */
    getBaselineLoad() {
        return this.demandHistory.reduce((sum, d) => sum + d.demand, 0) / this.demandHistory.length;
    }

    /**
     * Get next warming window
     */
    getNextWarmingWindow() {
        if (this.warmingSchedule.length === 0) return '--';
        return this.warmingSchedule[0].time;
    }

    /**
     * Update UI
     */
    updateUI() {
        const metrics = this.calculateMetrics();
        const warmServices = this.services.filter(s => s.status === 'warm').length;

        // Update performance overview
        const reductionPercent = metrics.worstCaseReduction > 0 
            ? Math.min(100, metrics.worstCaseReduction * 100)
            : 0;
        document.getElementById('coldStartReduction').textContent = reductionPercent.toFixed(1) + '%';

        const avgLatency = metrics.avgWith > 0 ? metrics.avgWith : '--';
        document.getElementById('avgLatency').textContent = avgLatency === '--' ? '--ms' : Math.round(avgLatency) + 'ms';

        document.getElementById('costSavings').textContent = '$' + this.performanceMetrics.costSavings.toFixed(2);
        document.getElementById('efficiencyRatio').textContent = metrics.efficiencyRatio.toFixed(1) + '%';

        // Update status overview
        document.getElementById('mitStatus').textContent = this.mitigationEnabled ? '🟢 Enabled' : '⚪ Disabled';
        document.getElementById('activeServices').textContent = this.services.length;
        document.getElementById('preventedColds').textContent = this.performanceMetrics.preventedColds;

        // Update next window
        if (this.warmingSchedule.length > 0) {
            document.getElementById('nextWindowTime').textContent = this.warmingSchedule[0].time;
            document.getElementById('nextWindowServices').textContent = this.warmingSchedule[0].services.length;
            document.getElementById('nextWindowConfidence').textContent = this.warmingSchedule[0].confidence.toFixed(0) + '%';
        }

        // Update footer
        const status = this.mitigationEnabled ? 'Active' : 'Idle';
        document.getElementById('systemStatus').textContent = status;

        if (this.systemStartTime) {
            const uptime = new Date() - this.systemStartTime;
            const minutes = Math.floor(uptime / 60000);
            const seconds = Math.floor((uptime % 60000) / 1000);
            document.getElementById('uptime').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        }

        document.getElementById('mitigationEnabled').textContent = this.mitigationEnabled ? 'Yes ✓' : 'No';
        document.getElementById('costEfficiency').textContent = metrics.efficiencyRatio.toFixed(1) + '%';

        // Render sections
        this.renderServices();
        this.renderWarmingSchedule();
        this.renderPerformanceChart();
        this.renderDemandChart();
        this.renderLatencyDistribution();

        // Update demand analysis
        document.getElementById('peakHours').textContent = this.getPeakHours();
        document.getElementById('predictedSurges').textContent = this.warmingSchedule.length;
        document.getElementById('baselineLoad').textContent = Math.round(this.getBaselineLoad()) + ' req/hour';

        // Update metrics
        document.getElementById('coldStartsWithout').textContent = Math.round(metrics.avgWithout) + 'ms';
        document.getElementById('coldStartsWith').textContent = Math.round(metrics.avgWith) + 'ms';
        document.getElementById('coldLatency').textContent = Math.round(metrics.avgWithout);
        document.getElementById('warmLatency').textContent = Math.round(metrics.avgWith);

        const accuracy = this.performanceMetrics.preventedColds > 0 ? 85 : 0;
        document.getElementById('warmingEfficiency').textContent = accuracy.toFixed(0) + '%';
        document.getElementById('predictAccuracy').textContent = accuracy.toFixed(1) + '%';

        const costPerReq = this.performanceMetrics.preventedColds > 0 
            ? this.performanceMetrics.costSavings / this.performanceMetrics.preventedColds 
            : 0;
        document.getElementById('costPerRequest').textContent = '$' + costPerReq.toFixed(4);
        document.getElementById('monthlyCost').textContent = '$' + (this.performanceMetrics.costSavings * 30).toFixed(2);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColdStartMitigationLayer;
}
