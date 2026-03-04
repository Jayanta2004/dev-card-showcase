/**
 * Financial Fraud Sentinel - Anomaly Detection Core
 * Issue #6253
 *
 * Features:
 * - Machine learning-based transaction anomaly detection
 * - Behavioral pattern analysis and velocity monitoring
 * - Geographic deviation and spending cluster analysis
 * - Real-time fraud risk scoring and recommendations
 */

// Global state and configuration
let customerProfile = {
    avgDailySpend: 150,
    monthlySpend: 4500,
    preferredCategories: ['grocery', 'restaurant', 'gas'],
    homeLocation: 'New York, USA',
    workLocation: 'Newark, USA',
    travelFrequency: 'medium',
    dailyTxLimit: 20,
    hourlyVelocity: 5,
    riskTolerance: 'medium'
};

let transactionHistory = [];
let currentAnalysis = null;

// Risk scoring weights and thresholds
const RISK_WEIGHTS = {
    amount: 0.25,
    velocity: 0.30,
    location: 0.20,
    category: 0.15,
    time: 0.10
};

const RISK_THRESHOLDS = {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
    critical: 0.9
};

// Merchant category risk profiles
const CATEGORY_RISKS = {
    grocery: { risk: 0.1, typicalAmount: 75 },
    restaurant: { risk: 0.2, typicalAmount: 45 },
    gas: { risk: 0.15, typicalAmount: 60 },
    online: { risk: 0.4, typicalAmount: 120 },
    atm: { risk: 0.3, typicalAmount: 100 },
    hotel: { risk: 0.25, typicalAmount: 200 },
    entertainment: { risk: 0.35, typicalAmount: 80 },
    pharmacy: { risk: 0.2, typicalAmount: 50 },
    international: { risk: 0.6, typicalAmount: 500 }
};

// Geographic risk factors
const LOCATION_RISKS = {
    'New York, USA': 0.1,
    'Los Angeles, USA': 0.15,
    'Chicago, USA': 0.2,
    'London, UK': 0.4,
    'Tokyo, Japan': 0.5,
    'Mumbai, India': 0.45,
    'Dubai, UAE': 0.55,
    'Unknown': 0.8
};

// DOM elements
const analyzeBtn = document.getElementById('analyze-transaction');
const generateSampleBtn = document.getElementById('generate-sample');
const resultsContainer = document.getElementById('results-container');
const noResults = document.getElementById('no-results');
const loadSampleDataBtn = document.getElementById('load-sample-data');
const clearHistoryBtn = document.getElementById('clear-history');

// Initialize the application
function init() {
    setupEventListeners();
    updateProfileFromUI();
}

// Event listeners setup
function setupEventListeners() {
    analyzeBtn.addEventListener('click', analyzeTransaction);
    generateSampleBtn.addEventListener('click', generateSampleTransaction);
    loadSampleDataBtn.addEventListener('load-sample-data', loadSampleData);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Profile update listeners
    document.querySelectorAll('#profile-settings input, #profile-settings select').forEach(element => {
        element.addEventListener('change', updateProfileFromUI);
    });
}

// Update customer profile from UI inputs
function updateProfileFromUI() {
    customerProfile = {
        avgDailySpend: parseFloat(document.getElementById('avg-daily-spend').value) || 150,
        monthlySpend: parseFloat(document.getElementById('monthly-spend').value) || 4500,
        preferredCategories: ['grocery', 'restaurant', 'gas'], // Could be made dynamic
        homeLocation: document.getElementById('home-location').value || 'New York, USA',
        workLocation: document.getElementById('work-location').value || 'Newark, USA',
        travelFrequency: document.getElementById('travel-frequency').value || 'medium',
        dailyTxLimit: parseInt(document.getElementById('daily-tx-limit').value) || 20,
        hourlyVelocity: parseInt(document.getElementById('hourly-velocity').value) || 5,
        riskTolerance: document.getElementById('risk-tolerance').value || 'medium'
    };
}

// Generate sample transaction for testing
function generateSampleTransaction() {
    const categories = Object.keys(CATEGORY_RISKS);
    const locations = Object.keys(LOCATION_RISKS);

    const sampleTransaction = {
        amount: Math.random() * 1000 + 10, // $10-$1010
        category: categories[Math.floor(Math.random() * categories.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
    };

    // Populate form with sample data
    document.getElementById('transaction-amount').value = sampleTransaction.amount.toFixed(2);
    document.getElementById('merchant-category').value = sampleTransaction.category;
    document.getElementById('transaction-location').value = sampleTransaction.location;
    document.getElementById('transaction-time').value = sampleTransaction.timestamp.toISOString().slice(0, 16);
}

// Main transaction analysis function
function analyzeTransaction() {
    const transaction = {
        amount: parseFloat(document.getElementById('transaction-amount').value),
        category: document.getElementById('merchant-category').value,
        location: document.getElementById('transaction-location').value,
        timestamp: new Date(document.getElementById('transaction-time').value)
    };

    // Validate input
    if (!transaction.amount || !transaction.category || !transaction.location || !transaction.timestamp) {
        alert('Please fill in all transaction details.');
        return;
    }

    // Perform fraud analysis
    currentAnalysis = performFraudAnalysis(transaction);

    // Add to history
    transactionHistory.push({
        ...transaction,
        analysis: currentAnalysis
    });

    // Update UI
    displayAnalysisResults(currentAnalysis);
    updateTransactionCount();

    // Hide no results message
    noResults.style.display = 'none';
    resultsContainer.classList.remove('hidden');
}

// Core fraud analysis algorithm
function performFraudAnalysis(transaction) {
    const anomalies = [];
    let totalRiskScore = 0;
    const riskBreakdown = {
        amount: 0,
        velocity: 0,
        location: 0,
        category: 0,
        time: 0
    };

    // 1. Amount-based anomaly detection
    const amountRisk = analyzeAmountAnomaly(transaction);
    riskBreakdown.amount = amountRisk.score;
    totalRiskScore += amountRisk.score * RISK_WEIGHTS.amount;
    if (amountRisk.anomalies.length > 0) {
        anomalies.push(...amountRisk.anomalies);
    }

    // 2. Transaction velocity analysis
    const velocityRisk = analyzeVelocityAnomaly(transaction);
    riskBreakdown.velocity = velocityRisk.score;
    totalRiskScore += velocityRisk.score * RISK_WEIGHTS.velocity;
    if (velocityRisk.anomalies.length > 0) {
        anomalies.push(...velocityRisk.anomalies);
    }

    // 3. Geographic location analysis
    const locationRisk = analyzeLocationAnomaly(transaction);
    riskBreakdown.location = locationRisk.score;
    totalRiskScore += locationRisk.score * RISK_WEIGHTS.location;
    if (locationRisk.anomalies.length > 0) {
        anomalies.push(...locationRisk.anomalies);
    }

    // 4. Category-based analysis
    const categoryRisk = analyzeCategoryAnomaly(transaction);
    riskBreakdown.category = categoryRisk.score;
    totalRiskScore += categoryRisk.score * RISK_WEIGHTS.category;
    if (categoryRisk.anomalies.length > 0) {
        anomalies.push(...categoryRisk.anomalies);
    }

    // 5. Time-based pattern analysis
    const timeRisk = analyzeTimeAnomaly(transaction);
    riskBreakdown.time = timeRisk.score;
    totalRiskScore += timeRisk.score * RISK_WEIGHTS.time;
    if (timeRisk.anomalies.length > 0) {
        anomalies.push(...timeRisk.anomalies);
    }

    // Calculate confidence based on data completeness and consistency
    const confidence = calculateConfidence(transaction, anomalies);

    // Determine risk level
    const riskLevel = determineRiskLevel(totalRiskScore);

    // Generate recommendations
    const recommendations = generateRecommendations(totalRiskScore, anomalies, transaction);

    return {
        riskScore: totalRiskScore,
        riskLevel: riskLevel,
        confidence: confidence,
        anomalies: anomalies,
        riskBreakdown: riskBreakdown,
        recommendations: recommendations
    };
}

// Amount-based anomaly detection
function analyzeAmountAnomaly(transaction) {
    const anomalies = [];
    let score = 0;

    const categoryProfile = CATEGORY_RISKS[transaction.category] || { risk: 0.5, typicalAmount: 100 };
    const typicalAmount = categoryProfile.typicalAmount;

    // Amount deviation from category norm
    const amountDeviation = Math.abs(transaction.amount - typicalAmount) / typicalAmount;

    if (amountDeviation > 2) {
        score += 0.4;
        anomalies.push(`Unusual amount for ${transaction.category} category ($${transaction.amount.toFixed(2)} vs typical $${typicalAmount.toFixed(2)})`);
    } else if (amountDeviation > 1) {
        score += 0.2;
        anomalies.push(`Large amount for ${transaction.category} category`);
    }

    // Amount vs daily spending pattern
    const dailySpendRatio = transaction.amount / customerProfile.avgDailySpend;
    if (dailySpendRatio > 3) {
        score += 0.3;
        anomalies.push(`Amount significantly exceeds average daily spending ($${customerProfile.avgDailySpend.toFixed(2)})`);
    }

    // Round number suspicion (common in fraud)
    if (transaction.amount % 100 === 0 && transaction.amount > 500) {
        score += 0.2;
        anomalies.push('Round dollar amount may indicate automated transaction');
    }

    return { score: Math.min(score, 1), anomalies };
}

// Transaction velocity analysis
function analyzeVelocityAnomaly(transaction) {
    const anomalies = [];
    let score = 0;

    // Recent transactions in last hour
    const oneHourAgo = new Date(transaction.timestamp.getTime() - 60 * 60 * 1000);
    const recentTransactions = transactionHistory.filter(tx =>
        tx.timestamp >= oneHourAgo && tx.timestamp <= transaction.timestamp
    );

    if (recentTransactions.length >= customerProfile.hourlyVelocity) {
        score += 0.4;
        anomalies.push(`High velocity: ${recentTransactions.length + 1} transactions in last hour`);
    }

    // Daily transaction limit check
    const today = new Date(transaction.timestamp);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = transactionHistory.filter(tx =>
        tx.timestamp >= today && tx.timestamp < tomorrow
    );

    if (todayTransactions.length >= customerProfile.dailyTxLimit) {
        score += 0.5;
        anomalies.push(`Daily transaction limit exceeded: ${todayTransactions.length + 1} transactions today`);
    }

    // Burst detection (multiple transactions in short time)
    const fiveMinutesAgo = new Date(transaction.timestamp.getTime() - 5 * 60 * 1000);
    const burstTransactions = transactionHistory.filter(tx =>
        tx.timestamp >= fiveMinutesAgo && tx.timestamp <= transaction.timestamp
    );

    if (burstTransactions.length >= 3) {
        score += 0.3;
        anomalies.push(`Transaction burst detected: ${burstTransactions.length + 1} transactions in 5 minutes`);
    }

    return { score: Math.min(score, 1), anomalies };
}

// Geographic location analysis
function analyzeLocationAnomaly(transaction) {
    const anomalies = [];
    let score = 0;

    const locationRisk = LOCATION_RISKS[transaction.location] || 0.8;

    // Distance from home/work locations (simplified)
    const knownLocations = [customerProfile.homeLocation, customerProfile.workLocation];
    const isKnownLocation = knownLocations.some(loc =>
        transaction.location.toLowerCase().includes(loc.toLowerCase().split(',')[0])
    );

    if (!isKnownLocation) {
        score += 0.3;
        anomalies.push(`Transaction location outside normal geographic area`);
    }

    // International transaction risk
    if (transaction.location.includes('UK') || transaction.location.includes('Japan') ||
        transaction.location.includes('India') || transaction.location.includes('UAE')) {
        if (customerProfile.travelFrequency === 'low') {
            score += 0.4;
            anomalies.push('International transaction inconsistent with travel patterns');
        }
    }

    // Location risk based on global risk database
    score += locationRisk * 0.3;

    // Previous location analysis
    if (transactionHistory.length > 0) {
        const lastTransaction = transactionHistory[transactionHistory.length - 1];
        const locationChanged = lastTransaction.location !== transaction.location;

        if (locationChanged) {
            // Rapid location changes
            const timeDiff = (transaction.timestamp - lastTransaction.timestamp) / (1000 * 60 * 60); // hours
            if (timeDiff < 2) {
                score += 0.2;
                anomalies.push('Rapid geographic movement between transactions');
            }
        }
    }

    return { score: Math.min(score, 1), anomalies };
}

// Category-based analysis
function analyzeCategoryAnomaly(transaction) {
    const anomalies = [];
    let score = 0;

    const categoryProfile = CATEGORY_RISKS[transaction.category] || { risk: 0.5 };
    const isPreferredCategory = customerProfile.preferredCategories.includes(transaction.category);

    // Category preference deviation
    if (!isPreferredCategory) {
        score += 0.2;
        anomalies.push(`Transaction category (${transaction.category}) outside normal spending patterns`);
    }

    // Category risk score
    score += categoryProfile.risk * 0.4;

    // Category frequency analysis
    const recentCategoryTransactions = transactionHistory.filter(tx =>
        tx.category === transaction.category &&
        (transaction.timestamp - tx.timestamp) < (7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    if (recentCategoryTransactions.length === 0 && !isPreferredCategory) {
        score += 0.1;
        anomalies.push(`First transaction in ${transaction.category} category recently`);
    }

    return { score: Math.min(score, 1), anomalies };
}

// Time-based pattern analysis
function analyzeTimeAnomaly(transaction) {
    const anomalies = [];
    let score = 0;

    const hour = transaction.timestamp.getHours();
    const dayOfWeek = transaction.timestamp.getDay();

    // Unusual hours (3 AM - 5 AM)
    if (hour >= 3 && hour <= 5) {
        score += 0.3;
        anomalies.push('Transaction at unusual hour (3:00 AM - 5:00 AM)');
    }

    // Weekend vs weekday patterns
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendTransactions = transactionHistory.filter(tx => {
        const txDay = tx.timestamp.getDay();
        return txDay === 0 || txDay === 6;
    });

    const weekdayTransactions = transactionHistory.filter(tx => {
        const txDay = tx.timestamp.getDay();
        return txDay >= 1 && txDay <= 5;
    });

    if (isWeekend && weekendTransactions.length < weekdayTransactions.length * 0.3) {
        score += 0.1;
        anomalies.push('Unusual weekend transaction frequency');
    }

    return { score: Math.min(score, 1), anomalies };
}

// Calculate analysis confidence
function calculateConfidence(transaction, anomalies) {
    let confidence = 50; // Base confidence

    // Data completeness
    if (transaction.amount && transaction.category && transaction.location && transaction.timestamp) {
        confidence += 20;
    }

    // Historical data availability
    if (transactionHistory.length > 10) {
        confidence += 15;
    } else if (transactionHistory.length > 5) {
        confidence += 10;
    }

    // Profile completeness
    if (customerProfile.homeLocation && customerProfile.workLocation) {
        confidence += 10;
    }

    // Anomalies detected (more anomalies = higher confidence in analysis)
    confidence += Math.min(anomalies.length * 5, 15);

    return Math.min(confidence, 95);
}

// Determine risk level from score
function determineRiskLevel(score) {
    if (score >= RISK_THRESHOLDS.critical) return 'critical';
    if (score >= RISK_THRESHOLDS.high) return 'high';
    if (score >= RISK_THRESHOLDS.medium) return 'medium';
    return 'low';
}

// Generate recommendations based on analysis
function generateRecommendations(riskScore, anomalies, transaction) {
    const recommendations = [];

    if (riskScore >= RISK_THRESHOLDS.critical) {
        recommendations.push('🚨 CRITICAL RISK: Immediately block transaction and contact customer');
        recommendations.push('🔒 Temporarily freeze account pending verification');
        recommendations.push('📞 Initiate fraud investigation protocol');
    } else if (riskScore >= RISK_THRESHOLDS.high) {
        recommendations.push('⚠️ HIGH RISK: Require additional verification (OTP, biometric)');
        recommendations.push('📱 Contact customer to confirm transaction legitimacy');
        recommendations.push('🔍 Review recent account activity for patterns');
    } else if (riskScore >= RISK_THRESHOLDS.medium) {
        recommendations.push('🟡 MEDIUM RISK: Enhanced monitoring recommended');
        recommendations.push('📧 Send transaction confirmation notification');
        recommendations.push('📊 Add to watchlist for 24-hour monitoring');
    } else {
        recommendations.push('✅ LOW RISK: Transaction appears normal');
        recommendations.push('📝 Log for pattern analysis');
    }

    // Specific recommendations based on anomalies
    if (anomalies.some(a => a.includes('velocity'))) {
        recommendations.push('⚡ High velocity detected - consider rate limiting');
    }

    if (anomalies.some(a => a.includes('location'))) {
        recommendations.push('📍 Geographic anomaly - verify customer location');
    }

    if (anomalies.some(a => a.includes('amount'))) {
        recommendations.push('💰 Amount anomaly - check against spending patterns');
    }

    return recommendations;
}

// Display analysis results in UI
function displayAnalysisResults(analysis) {
    // Risk score and level
    document.getElementById('fraud-score').textContent = analysis.riskScore.toFixed(2);
    document.getElementById('risk-level').textContent = analysis.riskLevel.toUpperCase();
    document.getElementById('risk-level').className = `risk-indicator ${analysis.riskLevel}`;
    document.getElementById('confidence-level').textContent = `Confidence: ${analysis.confidence.toFixed(0)}%`;

    // Anomalies
    document.getElementById('anomaly-count').textContent = analysis.anomalies.length;
    const anomalyList = document.getElementById('anomaly-list');
    anomalyList.innerHTML = '';
    analysis.anomalies.forEach(anomaly => {
        const li = document.createElement('li');
        li.textContent = anomaly;
        anomalyList.appendChild(li);
    });

    // Velocity and location scores (simplified display)
    document.getElementById('velocity-score').textContent = analysis.riskBreakdown.velocity.toFixed(2);
    document.getElementById('location-score').textContent = analysis.riskBreakdown.location.toFixed(2);

    const velocityStatus = analysis.riskBreakdown.velocity > 0.5 ? 'High' : analysis.riskBreakdown.velocity > 0.3 ? 'Elevated' : 'Normal';
    const locationStatus = analysis.riskBreakdown.location > 0.5 ? 'High Risk' : analysis.riskBreakdown.location > 0.3 ? 'Moderate Risk' : 'Normal';

    document.getElementById('velocity-status').textContent = velocityStatus;
    document.getElementById('location-status').textContent = locationStatus;

    // Recommendations
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';
    analysis.recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });

    // Risk breakdown visualization (simplified)
    updateRiskChart(analysis.riskBreakdown);
}

// Update risk breakdown chart (simplified visualization)
function updateRiskChart(breakdown) {
    const chartDiv = document.getElementById('risk-chart');
    chartDiv.innerHTML = '';

    const factors = Object.entries(breakdown);
    factors.forEach(([factor, score]) => {
        const bar = document.createElement('div');
        bar.className = 'risk-bar';
        bar.innerHTML = `
            <div class="factor-name">${factor.charAt(0).toUpperCase() + factor.slice(1)}</div>
            <div class="bar-container">
                <div class="bar-fill" style="width: ${score * 100}%"></div>
            </div>
            <div class="score-value">${score.toFixed(2)}</div>
        `;
        chartDiv.appendChild(bar);
    });
}

// Load sample transaction data for testing
function loadSampleData() {
    // Generate 50 sample transactions
    const categories = Object.keys(CATEGORY_RISKS);
    const locations = Object.keys(LOCATION_RISKS);

    for (let i = 0; i < 50; i++) {
        const sampleTx = {
            amount: Math.random() * 500 + 10,
            category: categories[Math.floor(Math.random() * categories.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        };

        // Add some fraudulent patterns
        if (Math.random() < 0.1) { // 10% fraudulent
            sampleTx.amount *= 3; // Unusual amount
            sampleTx.location = 'Dubai, UAE'; // Unusual location
        }

        transactionHistory.push({
            ...sampleTx,
            analysis: performFraudAnalysis(sampleTx)
        });
    }

    updateHistoricalAnalysis();
    document.getElementById('historical-results').classList.remove('hidden');
}

// Update historical analysis display
function updateHistoricalAnalysis() {
    const totalTx = transactionHistory.length;
    const suspiciousTx = transactionHistory.filter(tx => tx.analysis.riskScore >= RISK_THRESHOLDS.medium).length;
    const avgRiskScore = transactionHistory.reduce((sum, tx) => sum + tx.analysis.riskScore, 0) / totalTx;
    const falsePositiveRate = (suspiciousTx / totalTx * 100); // Simplified calculation

    document.getElementById('total-tx').textContent = totalTx;
    document.getElementById('suspicious-tx').textContent = suspiciousTx;
    document.getElementById('avg-risk-score').textContent = avgRiskScore.toFixed(2);
    document.getElementById('false-positive-rate').textContent = falsePositiveRate.toFixed(1) + '%';

    updateTransactionCount();
}

// Clear transaction history
function clearHistory() {
    transactionHistory = [];
    updateHistoricalAnalysis();
    document.getElementById('historical-results').classList.add('hidden');
    updateTransactionCount();
}

// Update transaction count display
function updateTransactionCount() {
    document.getElementById('transaction-count').textContent = `${transactionHistory.length} transactions loaded`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);