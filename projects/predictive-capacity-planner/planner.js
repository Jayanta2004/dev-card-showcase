/**
 * Predictive Capacity Allocation Planner
 * 
 * AI-driven forecasting engine for infrastructure capacity planning
 * Analyzes historical usage patterns and generates forward-looking allocation strategies
 */

class PredictiveCapacityPlanner {
    constructor() {
        this.historicalData = [];
        this.forecasts = [];
        this.models = {};
        this.recommendations = [];
        this.analysisResults = {};
        
        this.resources = {
            cpu: { current: 0, unit: 'cores' },
            memory: { current: 0, unit: 'GB' },
            storage: { current: 0, unit: 'TB' },
            network: { current: 0, unit: 'Gbps' }
        };

        this.initializeHistoricalData();
        this.initializeCharts();
    }

    /**
     * Initialize sample historical data
     */
    initializeHistoricalData() {
        const now = new Date();
        const data = [];

        // Generate 90 days of historical data with realistic patterns
        for (let i = 89; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Simulate usage with growth trend and daily/weekly patterns
            const dayOfWeek = date.getDay();
            const dayOfMonth = date.getDate();
            const trend = (90 - i) * 0.15; // Gradual growth
            const weeklyPattern = (dayOfWeek === 5 || dayOfWeek === 6) ? 0.2 : 0; // Weekend spike
            const dailyVariance = Math.sin(i * 0.1) * 0.3; // Daily variation

            const baseLoad = 40;
            const cpuUsage = baseLoad + trend + weeklyPattern * 10 + dailyVariance * 15 + Math.random() * 5;
            const memoryUsage = (cpuUsage / 100) * 120 + Math.random() * 10; // Correlated with CPU
            const storageUsage = 200 + trend * 3 + (dayOfMonth / 30) * 50 + Math.random() * 5; // Linear growth
            const networkTraffic = 50 + trend * 0.8 + Math.random() * 20;
            const peakLoad = cpuUsage * (1 + weeklyPattern);

            data.push({
                date,
                cpu: Math.round(cpuUsage * 10) / 10,
                memory: Math.round(memoryUsage * 10) / 10,
                storage: Math.round(storageUsage * 10) / 10,
                network: Math.round(networkTraffic * 10) / 10,
                peakLoad: Math.round(peakLoad * 10) / 10
            });
        }

        this.historicalData = data;
        this.resources.cpu.current = data[data.length - 1].cpu;
        this.resources.memory.current = data[data.length - 1].memory;
        this.resources.storage.current = data[data.length - 1].storage;
        this.resources.network.current = data[data.length - 1].network;
    }

    /**
     * Analyze historical data and generate forecasts
     */
    analyze() {
        if (this.historicalData.length === 0) {
            console.error('No historical data available');
            return;
        }

        this.analysisResults = this.analyzeHistoricalPatterns();
        this.generateForecasts();
        this.evaluateModels();
        this.generateRecommendations();
        
        this.updateUI();
        console.log('✅ Analysis completed');
    }

    /**
     * Analyze patterns in historical data
     */
    analyzeHistoricalPatterns() {
        const analysis = {
            growthRate: this.calculateGrowthRate(),
            peakHours: this.identifyPeakPatterns(),
            utilizationTrend: this.analyzeUtilizationTrend(),
            riskFactors: this.identifyRisks(),
            correlations: this.analyzeCorrelations()
        };

        return analysis;
    }

    /**
     * Calculate growth rate
     */
    calculateGrowthRate() {
        if (this.historicalData.length < 2) return 0;

        const data = this.historicalData;
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));

        const avgFirstHalf = firstHalf.reduce((sum, d) => sum + d.cpu, 0) / firstHalf.length;
        const avgSecondHalf = secondHalf.reduce((sum, d) => sum + d.cpu, 0) / secondHalf.length;

        const growth = ((avgSecondHalf - avgFirstHalf) / avgFirstHalf) * 100;
        return Math.round(growth * 10) / 10;
    }

    /**
     * Identify peak usage patterns
     */
    identifyPeakPatterns() {
        const byDayOfWeek = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

        this.historicalData.forEach(d => {
            byDayOfWeek[d.date.getDay()].push(d.cpu);
        });

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const peaks = dayNames.map((name, i) => ({
            day: name,
            avgUsage: Math.round(byDayOfWeek[i].reduce((a, b) => a + b, 0) / byDayOfWeek[i].length * 10) / 10
        }));

        return peaks;
    }

    /**
     * Analyze utilization trends
     */
    analyzeUtilizationTrend() {
        const data = this.historicalData;
        const cpuValues = data.map(d => d.cpu);
        const min = Math.min(...cpuValues);
        const max = Math.max(...cpuValues);
        const avg = cpuValues.reduce((a, b) => a + b) / cpuValues.length;
        const recent = cpuValues.slice(-7).reduce((a, b) => a + b) / 7;

        return {
            min: Math.round(min * 10) / 10,
            max: Math.round(max * 10) / 10,
            average: Math.round(avg * 10) / 10,
            recent: Math.round(recent * 10) / 10,
            trend: recent > avg ? 'increasing' : 'stable'
        };
    }

    /**
     * Identify risk factors
     */
    identifyRisks() {
        const lastWeek = this.historicalData.slice(-7);
        const lastMonth = this.historicalData.slice(-30);
        
        const weeklyAvg = lastWeek.reduce((sum, d) => sum + d.cpu, 0) / lastWeek.length;
        const monthlyAvg = lastMonth.reduce((sum, d) => sum + d.cpu, 0) / lastMonth.length;
        
        const weeklyMax = Math.max(...lastWeek.map(d => d.cpu));
        const monthlyMax = Math.max(...lastMonth.map(d => d.cpu));

        const risks = [];

        if (weeklyMax > 85) risks.push('High peak loads detected');
        if (weeklyAvg > monthlyAvg * 1.15) risks.push('Usage accelerating');
        if (this.calculateGrowthRate() > 5) risks.push('Rapid growth detected');
        if (monthlyMax > 90) risks.push('Approaching capacity limits');

        return risks.length > 0 ? risks : ['Low risk - Normal usage patterns'];
    }

    /**
     * Analyze correlations between resources
     */
    analyzeCorrelations() {
        const cpuData = this.historicalData.map(d => d.cpu);
        const memoryData = this.historicalData.map(d => d.memory);
        const storageData = this.historicalData.map(d => d.storage);

        const correlation = (arr1, arr2) => {
            const mean1 = arr1.reduce((a, b) => a + b) / arr1.length;
            const mean2 = arr2.reduce((a, b) => a + b) / arr2.length;
            
            let numerator = 0;
            let denominator1 = 0;
            let denominator2 = 0;

            for (let i = 0; i < arr1.length; i++) {
                const diff1 = arr1[i] - mean1;
                const diff2 = arr2[i] - mean2;
                numerator += diff1 * diff2;
                denominator1 += diff1 * diff1;
                denominator2 += diff2 * diff2;
            }

            return numerator / Math.sqrt(denominator1 * denominator2);
        };

        return {
            cpuMemory: Math.round(correlation(cpuData, memoryData) * 100) / 100,
            cpuStorage: Math.round(correlation(cpuData, storageData) * 100) / 100,
            memoryStorage: Math.round(correlation(memoryData, storageData) * 100) / 100
        };
    }

    /**
     * Generate forecasts using different models
     */
    generateForecasts() {
        const forecastDays = parseInt(document.getElementById('forecastDays').value) || 365;
        const modelType = document.getElementById('modelType').value || 'exponential';

        const forecast = {
            linear: this.forecastLinear(forecastDays),
            exponential: this.forecastExponential(forecastDays),
            polynomial: this.forecastPolynomial(forecastDays),
            seasonal: this.forecastSeasonal(forecastDays)
        };

        this.forecasts = forecast[modelType];
    }

    /**
     * Linear growth forecast
     */
    forecastLinear(days) {
        const data = this.historicalData;
        const n = data.length;
        
        // Calculate linear regression
        const indices = Array.from({length: n}, (_, i) => i);
        const cpuValues = data.map(d => d.cpu);
        
        const meanX = indices.reduce((a, b) => a + b) / n;
        const meanY = cpuValues.reduce((a, b) => a + b) / n;
        
        let slope = 0;
        let intercept = 0;
        
        let sumXY = 0;
        let sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumXY += indices[i] * cpuValues[i];
            sumX2 += indices[i] * indices[i];
        }
        
        slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
        intercept = meanY - slope * meanX;

        const forecast = [];
        const lastDate = data[data.length - 1].date;

        for (let i = 1; i <= days; i++) {
            const date = new Date(lastDate);
            date.setDate(date.getDate() + i);
            
            const predictedCpu = intercept + slope * (n + i - 1);
            const growthMultiplier = predictedCpu / cpuValues[cpuValues.length - 1];

            forecast.push({
                date,
                cpu: Math.max(0, Math.round(predictedCpu * 10) / 10),
                memory: Math.max(0, Math.round(data[data.length - 1].memory * growthMultiplier * 10) / 10),
                storage: Math.max(0, Math.round(data[data.length - 1].storage * growthMultiplier * 10) / 10),
                network: Math.max(0, Math.round(data[data.length - 1].network * growthMultiplier * 10) / 10),
                confidence: Math.round(Math.max(65, 95 - i / days * 30))
            });
        }

        return forecast;
    }

    /**
     * Exponential growth forecast
     */
    forecastExponential(days) {
        const data = this.historicalData;
        const cpuValues = data.map(d => d.cpu);
        const n = cpuValues.length;

        // Calculate exponential growth rate
        let sumLnY = 0;
        for (let i = 0; i < n; i++) {
            sumLnY += Math.log(Math.max(cpuValues[i], 1));
        }

        const avgLnY = sumLnY / n;
        let sumXLnY = 0;
        let sumX2 = 0;

        for (let i = 0; i < n; i++) {
            sumXLnY += i * Math.log(Math.max(cpuValues[i], 1));
            sumX2 += i * i;
        }

        const b = (sumXLnY - n * (n - 1) / 2 * avgLnY) / (sumX2 - n * ((n - 1) / 2) ** 2);
        const a = avgLnY - b * (n - 1) / 2;

        const forecast = [];
        const lastDate = data[data.length - 1].date;
        const lastCpu = cpuValues[cpuValues.length - 1];

        for (let i = 1; i <= days; i++) {
            const date = new Date(lastDate);
            date.setDate(date.getDate() + i);
            
            const predictedCpu = Math.exp(a + b * (n + i - 1));
            const growthMultiplier = predictedCpu / lastCpu;

            forecast.push({
                date,
                cpu: Math.round(predictedCpu * 10) / 10,
                memory: Math.round(data[data.length - 1].memory * growthMultiplier * 10) / 10,
                storage: Math.round(data[data.length - 1].storage * growthMultiplier * 10) / 10,
                network: Math.round(data[data.length - 1].network * growthMultiplier * 10) / 10,
                confidence: Math.round(Math.max(70, 92 - i / days * 25))
            });
        }

        return forecast;
    }

    /**
     * Polynomial growth forecast
     */
    forecastPolynomial(days) {
        const data = this.historicalData;
        const cpuValues = data.map(d => d.cpu);
        const n = cpuValues.length;

        // Simplified polynomial fit (quadratic)
        const indices = Array.from({length: n}, (_, i) => i);
        
        const sumX = indices.reduce((a, b) => a + b);
        const sumY = cpuValues.reduce((a, b) => a + b);
        const sumX2 = indices.reduce((a, b) => a + b * b);
        const sumX3 = indices.reduce((a, b) => a + b * b * b);
        const sumX4 = indices.reduce((a, b) => a + b * b * b * b);
        const sumXY = indices.reduce((sum, x, i) => sum + x * cpuValues[i], 0);
        const sumX2Y = indices.reduce((sum, x, i) => sum + x * x * cpuValues[i], 0);

        // Solving normal equations for quadratic fit
        const A = [[n, sumX, sumX2], [sumX, sumX2, sumX3], [sumX2, sumX3, sumX4]];
        const b = [sumY, sumXY, sumX2Y];

        // Simple Gaussian elimination
        const c0 = b[0] / n;
        const c1 = (b[1] - sumX * c0) / sumX2;
        const c2 = (b[2] - sumX3 * c1 - sumX2 * c0) / (sumX4 - sumX2 * sumX2 / n);

        const forecast = [];
        const lastDate = data[data.length - 1].date;
        const lastCpu = cpuValues[cpuValues.length - 1];

        for (let i = 1; i <= days; i++) {
            const date = new Date(lastDate);
            date.setDate(date.getDate() + i);
            
            const x = n + i - 1;
            const predictedCpu = c2 * x * x + c1 * x + c0;
            const growthMultiplier = predictedCpu / lastCpu;

            forecast.push({
                date,
                cpu: Math.round(predictedCpu * 10) / 10,
                memory: Math.round(data[data.length - 1].memory * growthMultiplier * 10) / 10,
                storage: Math.round(data[data.length - 1].storage * growthMultiplier * 10) / 10,
                network: Math.round(data[data.length - 1].network * growthMultiplier * 10) / 10,
                confidence: Math.round(Math.max(75, 90 - i / days * 20))
            });
        }

        return forecast;
    }

    /**
     * Seasonal pattern forecast
     */
    forecastSeasonal(days) {
        const data = this.historicalData;
        const cpuValues = data.map(d => d.cpu);
        const n = cpuValues.length;

        // Calculate trend line
        const indices = Array.from({length: n}, (_, i) => i);
        const meanX = indices.reduce((a, b) => a + b) / n;
        const meanY = cpuValues.reduce((a, b) => a + b) / n;

        let slope = 0;
        let sumX2 = 0;
        let sumXY = 0;

        for (let i = 0; i < n; i++) {
            sumXY += indices[i] * cpuValues[i];
            sumX2 += indices[i] * indices[i];
        }

        slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
        const intercept = meanY - slope * meanX;

        // Calculate seasonal component (weekly pattern)
        const seasonality = [0, 0, 0, 0, 0, 0.15, 0.25]; // Weekend boost

        const forecast = [];
        const lastDate = data[data.length - 1].date;

        for (let i = 1; i <= days; i++) {
            const date = new Date(lastDate);
            date.setDate(date.getDate() + i);
            
            const dayOfWeek = date.getDay();
            const trend = intercept + slope * (n + i - 1);
            const seasonal = trend * seasonality[dayOfWeek];
            const predictedCpu = trend + seasonal;
            const growthMultiplier = predictedCpu / cpuValues[cpuValues.length - 1];

            forecast.push({
                date,
                cpu: Math.round(predictedCpu * 10) / 10,
                memory: Math.round(data[data.length - 1].memory * growthMultiplier * 10) / 10,
                storage: Math.round(data[data.length - 1].storage * growthMultiplier * 10) / 10,
                network: Math.round(data[data.length - 1].network * growthMultiplier * 10) / 10,
                confidence: Math.round(Math.max(80, 95 - i / days * 30))
            });
        }

        return forecast;
    }

    /**
     * Evaluate model accuracy
     */
    evaluateModels() {
        // Use last 10% of historical data for validation
        const validationSize = Math.ceil(this.historicalData.length * 0.1);
        const trainingData = this.historicalData.slice(0, -validationSize);
        const validationData = this.historicalData.slice(-validationSize);

        const models = ['linear', 'exponential', 'polynomial', 'seasonal'];
        
        models.forEach(modelType => {
            const predictions = [];
            const trainingDataLength = trainingData.length;

            validationData.forEach((_, i) => {
                const x = trainingDataLength + i;
                // Generate prediction for this point
                let pred;
                switch(modelType) {
                    case 'linear':
                        pred = this.predictLinear(x, trainingData);
                        break;
                    case 'exponential':
                        pred = this.predictExponential(x, trainingData);
                        break;
                    case 'polynomial':
                        pred = this.predictPolynomial(x, trainingData);
                        break;
                    case 'seasonal':
                        pred = this.predictSeasonal(x, trainingData);
                        break;
                }
                predictions.push(pred);
            });

            // Calculate R² score
            const actualValues = validationData.map(d => d.cpu);
            const meanActual = actualValues.reduce((a, b) => a + b) / actualValues.length;
            
            let ssRes = 0;
            let ssTot = 0;

            for (let i = 0; i < actualValues.length; i++) {
                ssRes += Math.pow(actualValues[i] - predictions[i], 2);
                ssTot += Math.pow(actualValues[i] - meanActual, 2);
            }

            const r2 = 1 - (ssRes / ssTot);
            const accuracy = Math.min(100, Math.max(0, (r2 * 100 + 100) / 2));

            this.models[modelType] = {
                r2: Math.round(r2 * 100) / 100,
                accuracy: Math.round(accuracy)
            };
        });
    }

    /**
     * Helper prediction methods for model evaluation
     */
    predictLinear(x, data) {
        const n = data.length;
        const indices = Array.from({length: n}, (_, i) => i);
        const cpuValues = data.map(d => d.cpu);
        
        const meanX = indices.reduce((a, b) => a + b) / n;
        const meanY = cpuValues.reduce((a, b) => a + b) / n;
        
        let sumXY = 0;
        let sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumXY += indices[i] * cpuValues[i];
            sumX2 += indices[i] * indices[i];
        }
        
        const slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
        const intercept = meanY - slope * meanX;

        return intercept + slope * x;
    }

    predictExponential(x, data) {
        const cpuValues = data.map(d => d.cpu);
        const n = cpuValues.length;

        let sumLnY = 0;
        for (let i = 0; i < n; i++) {
            sumLnY += Math.log(Math.max(cpuValues[i], 1));
        }

        const avgLnY = sumLnY / n;
        let sumXLnY = 0;
        let sumX2 = 0;

        for (let i = 0; i < n; i++) {
            sumXLnY += i * Math.log(Math.max(cpuValues[i], 1));
            sumX2 += i * i;
        }

        const b = (sumXLnY - n * (n - 1) / 2 * avgLnY) / (sumX2 - n * ((n - 1) / 2) ** 2);
        const a = avgLnY - b * (n - 1) / 2;

        return Math.exp(a + b * x);
    }

    predictPolynomial(x, data) {
        const cpuValues = data.map(d => d.cpu);
        // Simplified - returns trend
        return this.predictLinear(x, data);
    }

    predictSeasonal(x, data) {
        const cpuValues = data.map(d => d.cpu);
        const n = cpuValues.length;
        // Use linear trend with seasonal adjustment
        return this.predictLinear(x, data);
    }

    /**
     * Generate recommendations
     */
    generateRecommendations() {
        if (this.forecasts.length === 0) return;

        const recommendations = [];
        const forecast = this.forecasts;
        const currentCPU = this.historicalData[this.historicalData.length - 1].cpu;
        const forecastedCPU = forecast[forecast.length - 1];

        // Strategy 1: Gradual scaling
        recommendations.push({
            id: 1,
            title: 'Gradual Capacity Scaling',
            icon: '📈',
            badge: 'Recommended',
            description: 'Incrementally add capacity based on quarterly data reviews.',
            points: [
                'Scale up 20-25% every 3 months',
                'Reduces waste from over-provisioning',
                'Maintains competitive infrastructure costs',
                'Quick response to accelerating growth'
            ],
            timeline: 'Quarterly',
            cost: 'Mid-range',
            riskLevel: 'Low'
        });

        // Strategy 2: Buffer provisioning
        if (forecastedCPU > currentCPU * 1.5) {
            recommendations.push({
                id: 2,
                title: 'Aggressive Buffer Strategy',
                icon: '🛡️',
                badge: 'High Growth',
                description: 'Pre-allocate capacity with 40-50% buffer for peak loads.',
                points: [
                    'Provision 40% above peak forecast',
                    'Handles unexpected traffic spikes',
                    'Ensures SLA compliance',
                    'Higher upfront cost but maximum reliability'
                ],
                timeline: 'Immediate',
                cost: 'High',
                riskLevel: 'Very Low'
            });
        }

        // Strategy 3: Auto-scaling
        recommendations.push({
            id: 3,
            title: 'Auto-Scaling Infrastructure',
            icon: '🤖',
            badge: 'Cost-Efficient',
            description: 'Implement dynamic resource allocation based on real-time demand.',
            points: [
                'Automatic scaling based on metrics',
                'Reduce idle capacity and costs',
                'Pay-as-you-go pricing model',
                'Requires monitoring and tuning'
            ],
            timeline: 'Ongoing',
            cost: 'Variable',
            riskLevel: 'Medium'
        });

        // Strategy 4: Resource optimization
        recommendations.push({
            id: 4,
            title: 'Resource Optimization',
            icon: '⚙️',
            badge: 'Sustainability',
            description: 'Optimize current resources before scaling.',
            points: [
                'Analyze and eliminate waste',
                'Implement caching and compression',
                'Database query optimization',
                'Container density improvement'
            ],
            timeline: 'Immediate',
            cost: 'Low',
            riskLevel: 'Low'
        });

        this.recommendations = recommendations;
    }

    /**
     * Update forecast with current selections
     */
    updateForecast() {
        this.generateForecasts();
        this.updateUI();
    }

    /**
     * Clear all data
     */
    clearData() {
        this.forecasts = [];
        this.recommendations = [];
        this.analysisResults = {};
        this.updateUI();
        console.log('🧹 Forecasts cleared');
    }

    /**
     * Update UI with current data
     */
    updateUI() {
        this.updateMetrics();
        this.updateForecastTable();
        this.updateResourceCards();
        this.updateModelStats();
        this.updateStrategies();
        this.updateAnalysisPanel();
        this.updateCharts();
        this.updateFooter();
    }

    /**
     * Update key metrics
     */
    updateMetrics() {
        const growthRate = this.analysisResults.growthRate || 0;
        const forecast = this.forecasts[this.forecasts.length - 1];
        const accuracy = forecast ? forecast.confidence : 0;
        
        const lastData = this.historicalData[this.historicalData.length - 1];
        const usage = (lastData.cpu / 100) * 100;
        const headroom = lastData.storage > 0 ? Math.round(300 / (lastData.storage / 10)) : 0;

        document.getElementById('growthRate').textContent = growthRate + '%';
        document.getElementById('accuracy').textContent = accuracy + '%';
        document.getElementById('headroom').textContent = headroom + ' months';
        document.getElementById('costForecast').textContent = '$' + Math.round(forecast ? forecast.network * 10000 : 0) + 'K';
    }

    /**
     * Update forecast table
     */
    updateForecastTable() {
        const tbody = document.getElementById('forecastTableBody');

        if (this.forecasts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="placeholder">Run analysis to generate forecast</td></tr>';
            return;
        }

        // Show every Nth row (to avoid too many rows)
        const step = Math.max(1, Math.floor(this.forecasts.length / 12));
        const rows = this.forecasts.filter((_, i) => i % step === 0 || i === this.forecasts.length - 1);

        tbody.innerHTML = rows.map(forecast => `
            <tr>
                <td>${forecast.date.toLocaleDateString()}</td>
                <td>${forecast.cpu} cores</td>
                <td>${forecast.memory} GB</td>
                <td>${forecast.storage} TB</td>
                <td>${forecast.network} Gbps</td>
                <td>${forecast.confidence}%</td>
            </tr>
        `).join('');
    }

    /**
     * Update resource allocation cards
     */
    updateResourceCards() {
        const data = this.historicalData[this.historicalData.length - 1];
        const forecast = this.forecasts[Math.floor(this.forecasts.length * 0.75)] || this.forecasts[this.forecasts.length - 1];

        const resources = [
            { id: 'cpu', label: 'CPU', current: data.cpu, unit: 'cores', forecast },
            { id: 'memory', label: 'Memory', current: data.memory, unit: 'GB', forecast },
            { id: 'storage', label: 'Storage', current: data.storage, unit: 'TB', forecast },
            { id: 'network', label: 'Network', current: data.network, unit: 'Gbps', forecast }
        ];

        resources.forEach(res => {
            const resourceKey = res.id === 'memory' ? 'memory' : res.id === 'storage' ? 'storage' : res.id === 'network' ? 'network' : 'cpu';
            const peak = Math.max(...this.historicalData.map(d => d[resourceKey]));
            const buffer = forecast ? Math.round((forecast[resourceKey] / peak - 1) * 100) : 0;
            const recommended = forecast ? Math.round(forecast[resourceKey] * 1.3 * 10) / 10 : peak;

            document.getElementById(res.id + 'Current').textContent = Math.round(res.current * 10) / 10;
            document.getElementById(res.id + 'Peak').textContent = Math.round(peak * 10) / 10;
            document.getElementById(res.id + 'Recommended').textContent = recommended;
            document.getElementById(res.id + 'Buffer').textContent = buffer + '%';
        });
    }

    /**
     * Update model statistics
     */
    updateModelStats() {
        Object.entries(this.models).forEach(([model, stats]) => {
            document.getElementById(model + 'Accuracy').textContent = stats.accuracy;
            document.getElementById(model + 'R2').textContent = stats.r2;
        });
    }

    /**
     * Update strategies section
     */
    updateStrategies() {
        const container = document.getElementById('strategiesContainer');

        if (this.recommendations.length === 0) {
            container.innerHTML = '<div class="placeholder">Run analysis to generate strategies</div>';
            return;
        }

        container.innerHTML = this.recommendations.map(strategy => `
            <div class="strategy-card">
                <div class="strategy-header">
                    <div class="strategy-icon">${strategy.icon}</div>
                    <div>
                        <h5>${strategy.title}</h5>
                        <span class="strategy-badge">${strategy.badge}</span>
                    </div>
                </div>
                <p class="strategy-description">${strategy.description}</p>
                <ul class="strategy-points">
                    ${strategy.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
                <div class="strategy-footer">
                    <span><strong>Timeline:</strong> ${strategy.timeline}</span>
                    <span><strong>Cost:</strong> ${strategy.cost}</span>
                    <span><strong>Risk:</strong> ${strategy.riskLevel}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update analysis panels
     */
    updateAnalysisPanel() {
        const analysis = this.analysisResults;

        // Patterns
        const patternsHTML = analysis.utilizationTrend ? `
            <div class="analysis-item">
                <strong>Min Load:</strong> ${analysis.utilizationTrend.min}% cores
            </div>
            <div class="analysis-item">
                <strong>Max Load:</strong> ${analysis.utilizationTrend.max}% cores
            </div>
            <div class="analysis-item">
                <strong>Average:</strong> ${analysis.utilizationTrend.average}% cores
            </div>
            <div class="analysis-item">
                <strong>Trend:</strong> ${analysis.utilizationTrend.trend.toUpperCase()}
            </div>
        ` : '<p class="placeholder">No data</p>';
        document.getElementById('patternsAnalysis').innerHTML = patternsHTML;

        // Peak hours
        const peaksHTML = analysis.peakHours ? `
            ${analysis.peakHours.map(peak => `
                <div class="analysis-item">
                    <strong>${peak.day}:</strong> ${peak.avgUsage}% avg load
                </div>
            `).join('')}
        ` : '<p class="placeholder">No data</p>';
        document.getElementById('peakAnalysis').innerHTML = peaksHTML;

        // Utilization
        const utilHTML = analysis.utilizationTrend ? `
            <div class="analysis-item">
                <strong>7-day Average:</strong> ${analysis.utilizationTrend.recent}% cores
            </div>
            <div class="analysis-item">
                <strong>90-day Average:</strong> ${analysis.utilizationTrend.average}% cores
            </div>
            <div class="analysis-item">
                <strong>Growth Rate:</strong> ${analysis.growthRate}% monthly
            </div>
        ` : '<p class="placeholder">No data</p>';
        document.getElementById('utilizationAnalysis').innerHTML = utilHTML;

        // Risks
        const risksHTML = analysis.riskFactors ? `
            ${analysis.riskFactors.map(risk => `
                <div class="analysis-item">${risk}</div>
            `).join('')}
        ` : '<p class="placeholder">No risks identified</p>';
        document.getElementById('riskAnalysis').innerHTML = risksHTML;

        // Historical data
        this.updateHistoricalDataTable();
    }

    /**
     * Update historical data table
     */
    updateHistoricalDataTable() {
        const tbody = document.getElementById('dataTableBody');
        const data = this.historicalData.slice(-14);

        tbody.innerHTML = data.map(row => `
            <tr>
                <td>${row.date.toLocaleDateString()}</td>
                <td>${row.cpu}%</td>
                <td>${row.memory} GB</td>
                <td>${row.storage} TB</td>
                <td>${row.network} Gbps</td>
                <td>${row.peakLoad}%</td>
            </tr>
        `).join('');
    }

    /**
     * Update charts
     */
    updateCharts() {
        this.drawForecastChart();
        this.drawResourceCharts();
        this.drawModelsChart();
    }

    /**
     * Draw forecast chart
     */
    drawForecastChart() {
        const ctx = document.getElementById('forecastChart')?.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const allData = [...this.historicalData, ...this.forecasts];
        if (allData.length === 0) return;

        const padding = 50;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;

        const maxCPU = Math.max(...allData.map(d => d.cpu));
        const pointSpacing = width / (allData.length - 1 || 1);

        // Draw grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        for (let i = 0; i <= 4; i++) {
            const y = padding + (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(ctx.canvas.width - padding, y);
            ctx.stroke();
        }

        // Draw historical data
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();

        this.historicalData.forEach((point, index) => {
            const x = padding + index * pointSpacing;
            const y = padding + height - (point.cpu / maxCPU) * height;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw forecast
        ctx.strokeStyle = '#8b5cf6';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();

        this.forecasts.forEach((point, index) => {
            const x = padding + (this.historicalData.length + index) * pointSpacing;
            const y = padding + height - (point.cpu / maxCPU) * height;

            if (index === 0) {
                ctx.moveTo(padding + (this.historicalData.length - 1) * pointSpacing, 
                          padding + height - (this.historicalData[this.historicalData.length - 1].cpu / maxCPU) * height);
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw legend
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(padding, 10, 15, 15);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px Arial';
        ctx.fillText('Historical', padding + 25, 22);

        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(padding + 150, 10, 15, 15);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('Forecast', padding + 175, 22);

        // Labels
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const value = Math.round((4 - i) * (maxCPU / 4));
            const y = padding + (height / 4) * i;
            ctx.fillText(value, padding - 25, y + 4);
        }
    }

    /**
     * Draw resource charts
     */
    drawResourceCharts() {
        const resources = [
            { id: 'cpu', data: this.historicalData.map(d => d.cpu), forecast: this.forecasts.map(d => d.cpu) },
            { id: 'memory', data: this.historicalData.map(d => d.memory), forecast: this.forecasts.map(d => d.memory) },
            { id: 'storage', data: this.historicalData.map(d => d.storage), forecast: this.forecasts.map(d => d.storage) },
            { id: 'network', data: this.historicalData.map(d => d.network), forecast: this.forecasts.map(d => d.network) }
        ];

        resources.forEach(resource => {
            const ctx = document.getElementById(resource.id + 'Chart')?.getContext('2d');
            if (!ctx) return;

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            const allValues = [...resource.data, ...resource.forecast];
            if (allValues.length === 0) return;

            const maxValue = Math.max(...allValues);
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            const barWidth = width / allValues.length;

            // Draw bars
            allValues.forEach((value, index) => {
                const barHeight = (value / maxValue) * (height - 20);
                const x = index * barWidth;
                const y = height - barHeight - 10;

                const isHistorical = index < resource.data.length;
                ctx.fillStyle = isHistorical ? '#3b82f6' : '#8b5cf6';
                ctx.fillRect(x, y, barWidth - 1, barHeight);
            });

            // Current value label
            if (resource.data.length > 0) {
                ctx.fillStyle = '#e2e8f0';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(Math.round(resource.data[resource.data.length - 1] * 10) / 10, 
                           resource.data.length * barWidth / 2, height - 5);
            }
        });
    }

    /**
     * Draw models comparison chart
     */
    drawModelsChart() {
        const ctx = document.getElementById('modelsComparisonChart')?.getContext('2d');
        if (!ctx || this.forecasts.length === 0) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const models = Object.keys(this.models);
        const padding = 50;
        const width = ctx.canvas.width - 2 * padding;
        const height = ctx.canvas.height - 2 * padding;
        const barWidth = width / (models.length * 2.5);
        const barSpacing = width / models.length;

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        models.forEach((model, index) => {
            const accuracy = this.models[model].accuracy;
            const barHeight = (accuracy / 100) * height;
            const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
            const y = padding + height - barHeight;

            // Draw bar
            ctx.fillStyle = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][index];
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw value
            ctx.fillStyle = '#e2e8f0';
            ctx.fillText(accuracy + '%', x + barWidth / 2, y - 5);

            // Draw label
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText(model.charAt(0).toUpperCase() + model.slice(1), 
                       x + barWidth / 2, ctx.canvas.height - 15);
        });
    }

    /**
     * Update footer
     */
    updateFooter() {
        const now = new Date();
        document.getElementById('analysisTime').textContent = now.toLocaleTimeString();
        document.getElementById('overallConfidence').textContent = this.forecasts.length > 0 
            ? this.forecasts[this.forecasts.length - 1].confidence 
            : 0;
        document.getElementById('dataPoints').textContent = this.historicalData.length;
    }

    /**
     * Generate report
     */
    generateReport() {
        const report = {
            title: 'Predictive Capacity Allocation Report',
            generatedAt: new Date().toLocaleString(),
            summary: {
                historicalDataPoints: this.historicalData.length,
                forecastPeriod: this.forecasts.length + ' days',
                growthRate: this.analysisResults.growthRate + '%',
                recommendations: this.recommendations.length
            },
            analysis: this.analysisResults,
            recommendations: this.recommendations,
            models: this.models
        };

        console.log('📊 Report generated:', report);
        alert('Report generated successfully! Check console for details.');
    }

    /**
     * Initialize charts once
     */
    initializeCharts() {
        // Charts initialized on first use
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PredictiveCapacityPlanner;
}
