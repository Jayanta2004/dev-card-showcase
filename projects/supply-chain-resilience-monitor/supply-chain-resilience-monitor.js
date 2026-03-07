/**
 * Supply Chain Resilience Monitor - Disruption Forecaster
 * Issue #6252
 *
 * Features:
 * - Predictive risk analysis for logistics networks
 * - Monte Carlo simulation for disruption scenarios
 * - Bottleneck identification and impact assessment
 * - Geopolitical, weather, and operational risk modeling
 */

// Global state
let supplyChainNetwork = {
    suppliers: [],
    routes: [],
    riskFactors: {
        geopolitical: {},
        weather: {},
        operational: {}
    }
};

let simulationResults = {
    overallRiskScore: 0,
    bottlenecks: [],
    averageDelay: 0,
    costImpact: 0,
    recommendations: [],
    confidenceLevel: 0.95
};

// Risk factor weights and impact multipliers
const RISK_WEIGHTS = {
    geopolitical: {
        'trade-tension': { weight: 0.3, impact: 2.0 },
        'political-instability': { weight: 0.4, impact: 2.5 },
        'regulatory-changes': { weight: 0.3, impact: 1.8 }
    },
    weather: {
        'hurricane-risk': { weight: 0.4, impact: 3.0 },
        'earthquake-risk': { weight: 0.3, impact: 4.0 },
        'flood-risk': { weight: 0.3, impact: 2.2 }
    },
    operational: {
        'port-congestion': { weight: 0.4, impact: 2.8 },
        'labor-shortages': { weight: 0.3, impact: 2.0 },
        'equipment-failure': { weight: 0.3, impact: 1.5 }
    }
};

// Transportation mode characteristics
const TRANSPORT_MODES = {
    sea: { baseDelay: 2, costPerKm: 0.5, reliability: 0.85 },
    air: { baseDelay: 0.5, costPerKm: 5.0, reliability: 0.95 },
    road: { baseDelay: 1, costPerKm: 2.0, reliability: 0.90 },
    rail: { baseDelay: 1.5, costPerKm: 1.2, reliability: 0.88 }
};

// DOM elements
const addSupplierBtn = document.getElementById('add-supplier');
const suppliersList = document.getElementById('suppliers-list');
const addRouteBtn = document.getElementById('add-route');
const routesList = document.getElementById('routes-list');
const runSimulationBtn = document.getElementById('run-simulation');
const resetNetworkBtn = document.getElementById('reset-network');
const exportReportBtn = document.getElementById('export-report');
const simulationStatus = document.getElementById('simulation-status');
const resultsContainer = document.getElementById('results-container');

// Initialize the application
function init() {
    setupEventListeners();
    updateSupplierDropdowns();
    updateRouteDropdowns();
}

// Event listeners setup
function setupEventListeners() {
    addSupplierBtn.addEventListener('click', addSupplier);
    addRouteBtn.addEventListener('click', addRoute);
    runSimulationBtn.addEventListener('click', runSimulation);
    resetNetworkBtn.addEventListener('click', resetNetwork);
    exportReportBtn.addEventListener('click', exportReport);

    // Risk slider listeners
    document.querySelectorAll('.risk-slider').forEach(slider => {
        slider.addEventListener('input', updateSliderValue);
    });

    // Dynamic supplier/route removal
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-supplier')) {
            removeSupplier(e.target);
        } else if (e.target.classList.contains('remove-route')) {
            removeRoute(e.target);
        }
    });
}

// Supplier management
function addSupplier() {
    const supplierItem = document.createElement('div');
    supplierItem.className = 'supplier-item';
    supplierItem.innerHTML = `
        <input type="text" placeholder="Supplier Name" class="supplier-name">
        <input type="text" placeholder="Location/Country" class="supplier-location">
        <select class="supplier-risk">
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical Risk</option>
        </select>
        <button class="remove-supplier">❌</button>
    `;
    suppliersList.appendChild(supplierItem);
    updateSupplierDropdowns();
}

function removeSupplier(button) {
    button.closest('.supplier-item').remove();
    updateSupplierDropdowns();
}

function updateSupplierDropdowns() {
    const supplierNames = Array.from(document.querySelectorAll('.supplier-name'))
        .map(input => input.value)
        .filter(name => name.trim() !== '');

    document.querySelectorAll('.route-from, .route-to').forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select</option>';
        supplierNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            if (name === currentValue) option.selected = true;
            select.appendChild(option);
        });
    });
}

// Route management
function addRoute() {
    const routeItem = document.createElement('div');
    routeItem.className = 'route-item';
    routeItem.innerHTML = `
        <select class="route-from"><option value="">From</option></select>
        <span>→</span>
        <select class="route-to"><option value="">To</option></select>
        <select class="transport-mode">
            <option value="sea">Sea Freight</option>
            <option value="air">Air Freight</option>
            <option value="road">Road Transport</option>
            <option value="rail">Rail Transport</option>
        </select>
        <input type="number" placeholder="Distance (km)" class="route-distance" min="1">
        <button class="remove-route">❌</button>
    `;
    routesList.appendChild(routeItem);
    updateRouteDropdowns();
}

function removeRoute(button) {
    button.closest('.route-item').remove();
}

function updateRouteDropdowns() {
    updateSupplierDropdowns(); // Reuse the same logic
}

// Risk slider value updates
function updateSliderValue(e) {
    const slider = e.target;
    const value = slider.value;
    const valueSpan = slider.nextElementSibling;
    valueSpan.textContent = value;

    // Update risk factors in global state
    const riskType = slider.closest('.risk-category').querySelector('h3').textContent.includes('Geopolitical') ? 'geopolitical' :
                    slider.closest('.risk-category').querySelector('h3').textContent.includes('Weather') ? 'weather' : 'operational';

    supplyChainNetwork.riskFactors[riskType][slider.dataset.risk] = parseInt(value);
}

// Network data collection
function collectNetworkData() {
    // Collect suppliers
    supplyChainNetwork.suppliers = Array.from(document.querySelectorAll('.supplier-item')).map(item => ({
        name: item.querySelector('.supplier-name').value,
        location: item.querySelector('.supplier-location').value,
        risk: item.querySelector('.supplier-risk').value
    })).filter(supplier => supplier.name.trim() !== '');

    // Collect routes
    supplyChainNetwork.routes = Array.from(document.querySelectorAll('.route-item')).map(item => ({
        from: item.querySelector('.route-from').value,
        to: item.querySelector('.route-to').value,
        mode: item.querySelector('.transport-mode').value,
        distance: parseFloat(item.querySelector('.route-distance').value) || 0
    })).filter(route => route.from && route.to && route.distance > 0);

    // Risk factors are already updated via sliders
}

// Monte Carlo simulation for disruption forecasting
function runMonteCarloSimulation(network, days, confidenceLevel, iterations = 1000) {
    const results = {
        disruptions: [],
        delays: [],
        costs: [],
        bottlenecks: new Map()
    };

    for (let i = 0; i < iterations; i++) {
        const simulationResult = simulateSingleScenario(network, days);
        results.disruptions.push(simulationResult.disruption);
        results.delays.push(simulationResult.totalDelay);
        results.costs.push(simulationResult.totalCost);

        // Track bottlenecks
        simulationResult.bottlenecks.forEach(bottleneck => {
            const key = `${bottleneck.type}:${bottleneck.location}`;
            results.bottlenecks.set(key, (results.bottlenecks.get(key) || 0) + 1);
        });
    }

    return analyzeSimulationResults(results, confidenceLevel);
}

function simulateSingleScenario(network, days) {
    let totalDelay = 0;
    let totalCost = 0;
    const bottlenecks = [];

    // Simulate disruptions for each route
    network.routes.forEach(route => {
        const transportMode = TRANSPORT_MODES[route.mode];
        const baseDelay = transportMode.baseDelay * (route.distance / 100); // Scale by distance

        // Calculate disruption probability based on risk factors
        const disruptionProb = calculateDisruptionProbability(route, network.riskFactors);

        // Simulate if disruption occurs
        if (Math.random() < disruptionProb) {
            const delayDays = baseDelay * (1 + Math.random() * 2); // 1-3x base delay
            const additionalCost = transportMode.costPerKm * route.distance * (0.5 + Math.random()); // 50-150% additional cost

            totalDelay += delayDays;
            totalCost += additionalCost;

            bottlenecks.push({
                type: 'route',
                location: `${route.from} → ${route.to}`,
                delay: delayDays,
                cost: additionalCost
            });
        }
    });

    // Simulate supplier disruptions
    network.suppliers.forEach(supplier => {
        const supplierRisk = { low: 0.1, medium: 0.3, high: 0.6, critical: 0.9 }[supplier.risk] || 0.1;
        const disruptionProb = supplierRisk * calculateSupplierRiskMultiplier(network.riskFactors);

        if (Math.random() < disruptionProb) {
            const delayDays = 3 + Math.random() * 7; // 3-10 days delay
            const costImpact = 10000 + Math.random() * 50000; // $10k-$60k impact

            totalDelay += delayDays;
            totalCost += costImpact;

            bottlenecks.push({
                type: 'supplier',
                location: supplier.name,
                delay: delayDays,
                cost: costImpact
            });
        }
    });

    return {
        disruption: totalDelay > 0 || totalCost > 10000,
        totalDelay,
        totalCost,
        bottlenecks
    };
}

function calculateDisruptionProbability(route, riskFactors) {
    let probability = 0;

    // Base probability from transport mode reliability
    probability += (1 - TRANSPORT_MODES[route.mode].reliability);

    // Add risk factor contributions
    probability += calculateRiskContribution(riskFactors.geopolitical, RISK_WEIGHTS.geopolitical);
    probability += calculateRiskContribution(riskFactors.weather, RISK_WEIGHTS.weather);
    probability += calculateRiskContribution(riskFactors.operational, RISK_WEIGHTS.operational);

    // Distance factor (longer routes have higher risk)
    probability += Math.min(route.distance / 10000, 0.2);

    return Math.min(probability, 0.95); // Cap at 95%
}

function calculateRiskContribution(riskValues, weights) {
    let contribution = 0;
    let totalWeight = 0;

    for (const [risk, weight] of Object.entries(weights)) {
        const value = riskValues[risk] || 0;
        contribution += (value / 10) * weight.weight * weight.impact;
        totalWeight += weight.weight;
    }

    return contribution / totalWeight;
}

function calculateSupplierRiskMultiplier(riskFactors) {
    const geoRisk = calculateRiskContribution(riskFactors.geopolitical, RISK_WEIGHTS.geopolitical);
    const weatherRisk = calculateRiskContribution(riskFactors.weather, RISK_WEIGHTS.weather);
    const opRisk = calculateRiskContribution(riskFactors.operational, RISK_WEIGHTS.operational);

    return 1 + (geoRisk + weatherRisk + opRisk) * 0.5;
}

function analyzeSimulationResults(results, confidenceLevel) {
    // Sort results for percentile calculation
    results.delays.sort((a, b) => a - b);
    results.costs.sort((a, b) => a - b);

    const percentileIndex = Math.floor(results.delays.length * confidenceLevel);

    return {
        overallRiskScore: (results.disruptions.filter(d => d).length / results.disruptions.length) * 100,
        averageDelay: results.delays.reduce((a, b) => a + b, 0) / results.delays.length,
        worstCaseDelay: results.delays[percentileIndex],
        averageCost: results.costs.reduce((a, b) => a + b, 0) / results.costs.length,
        worstCaseCost: results.costs[percentileIndex],
        bottlenecks: Array.from(results.bottlenecks.entries())
            .map(([key, count]) => ({ location: key.split(':')[1], frequency: count / results.disruptions.length }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5) // Top 5 bottlenecks
    };
}

// Generate recommendations based on simulation results
function generateRecommendations(results, network) {
    const recommendations = [];

    if (results.overallRiskScore > 50) {
        recommendations.push('🚨 High overall risk detected. Consider diversifying suppliers and routes.');
    }

    if (results.averageDelay > 5) {
        recommendations.push('⏱️ Significant delay risks identified. Implement buffer inventory and alternative routing.');
    }

    if (results.averageCost > 25000) {
        recommendations.push('💰 High cost impact expected. Review insurance coverage and contingency budgets.');
    }

    // Route-specific recommendations
    const highRiskRoutes = network.routes.filter(route =>
        calculateDisruptionProbability(route, network.riskFactors) > 0.3
    );

    if (highRiskRoutes.length > 0) {
        recommendations.push(`🛣️ Consider alternative transport modes for high-risk routes: ${highRiskRoutes.map(r => `${r.from}→${r.to}`).join(', ')}`);
    }

    // Supplier-specific recommendations
    const highRiskSuppliers = network.suppliers.filter(supplier =>
        ['high', 'critical'].includes(supplier.risk)
    );

    if (highRiskSuppliers.length > 0) {
        recommendations.push(`🏭 Develop contingency plans for high-risk suppliers: ${highRiskSuppliers.map(s => s.name).join(', ')}`);
    }

    // Risk factor specific recommendations
    const highGeoRisk = Object.values(network.riskFactors.geopolitical).some(v => v > 7);
    if (highGeoRisk) {
        recommendations.push('🌍 High geopolitical risks detected. Monitor trade policies and consider regional diversification.');
    }

    const highWeatherRisk = Object.values(network.riskFactors.weather).some(v => v > 7);
    if (highWeatherRisk) {
        recommendations.push('🌪️ Weather risks are elevated. Review seasonal planning and weather contingency protocols.');
    }

    return recommendations.length > 0 ? recommendations : ['✅ Risk levels appear manageable. Continue monitoring and regular assessments.'];
}

// Main simulation function
function runSimulation() {
    collectNetworkData();

    if (supplyChainNetwork.suppliers.length === 0 || supplyChainNetwork.routes.length === 0) {
        alert('Please configure at least one supplier and one route before running the simulation.');
        return;
    }

    simulationStatus.textContent = 'Running Monte Carlo simulation...';
    runSimulationBtn.disabled = true;

    // Run simulation asynchronously to prevent UI blocking
    setTimeout(() => {
        const days = parseInt(document.getElementById('simulation-days').value);
        const confidenceLevel = parseFloat(document.getElementById('confidence-level').value);

        simulationResults = runMonteCarloSimulation(supplyChainNetwork, days, confidenceLevel);

        displayResults(simulationResults);
        simulationStatus.textContent = 'Simulation completed successfully.';
        runSimulationBtn.disabled = false;
    }, 100);
}

// Display simulation results
function displayResults(results) {
    // Overall risk score
    document.getElementById('overall-risk-score').textContent = results.overallRiskScore.toFixed(1) + '%';

    const riskLevel = results.overallRiskScore < 25 ? 'low' :
                     results.overallRiskScore < 50 ? 'medium' :
                     results.overallRiskScore < 75 ? 'high' : 'critical';
    document.getElementById('risk-level').textContent = riskLevel.toUpperCase();
    document.getElementById('risk-level').className = `risk-indicator ${riskLevel}`;

    // Bottlenecks
    document.getElementById('bottlenecks-count').textContent = results.bottlenecks.length;
    const bottlenecksList = document.getElementById('bottlenecks-list');
    bottlenecksList.innerHTML = '';
    results.bottlenecks.slice(0, 3).forEach(bottleneck => {
        const li = document.createElement('li');
        li.textContent = `${bottleneck.location} (${(bottleneck.frequency * 100).toFixed(1)}% occurrence)`;
        bottlenecksList.appendChild(li);
    });

    // Delay impact
    document.getElementById('avg-delay').textContent = results.averageDelay.toFixed(1) + ' days';
    const delayBreakdown = document.getElementById('delay-breakdown');
    delayBreakdown.innerHTML = `
        <li>Worst case (${results.confidenceLevel * 100}% confidence): ${results.worstCaseDelay.toFixed(1)} days</li>
    `;

    // Cost impact
    document.getElementById('cost-impact').textContent = '$' + results.averageCost.toLocaleString();
    const costBreakdown = document.getElementById('cost-breakdown');
    costBreakdown.innerHTML = `
        <li>Worst case (${results.confidenceLevel * 100}% confidence): $${results.worstCaseCost.toLocaleString()}</li>
    `;

    // Recommendations
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';
    const recommendations = generateRecommendations(results, supplyChainNetwork);
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });

    // Show results container
    resultsContainer.classList.remove('hidden');
}

// Reset network
function resetNetwork() {
    supplyChainNetwork = {
        suppliers: [],
        routes: [],
        riskFactors: {
            geopolitical: {},
            weather: {},
            operational: {}
        }
    };

    // Clear suppliers
    suppliersList.innerHTML = '';

    // Clear routes
    routesList.innerHTML = '';

    // Reset risk sliders
    document.querySelectorAll('.risk-slider').forEach(slider => {
        slider.value = slider.defaultValue || 3;
        slider.nextElementSibling.textContent = slider.value;
    });

    // Hide results
    resultsContainer.classList.add('hidden');
    simulationStatus.textContent = 'Network reset. Configure your supply chain and run simulation.';

    updateSupplierDropdowns();
}

// Export report
function exportReport() {
    if (resultsContainer.classList.contains('hidden')) {
        alert('Please run a simulation first to generate a report.');
        return;
    }

    const report = {
        timestamp: new Date().toISOString(),
        network: supplyChainNetwork,
        results: simulationResults,
        recommendations: generateRecommendations(simulationResults, supplyChainNetwork)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supply-chain-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);