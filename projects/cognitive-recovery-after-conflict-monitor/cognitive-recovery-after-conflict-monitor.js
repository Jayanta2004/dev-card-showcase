// cognitive-recovery-after-conflict-monitor.js

document.addEventListener('DOMContentLoaded', function() {
    const primaryFavicon = document.getElementById('primary-favicon');
    
    if (primaryFavicon) {
        const img = new Image();
        img.onload = function() {
            console.log('Primary favicon loaded successfully');
        };
        img.onerror = function() {
            console.log('Primary favicon failed to load, trying fallbacks...');
            tryFallbackFavicons();
        };
        img.src = primaryFavicon.href;
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load data from localStorage
    loadStoredData();
    
    // Update UI with stored data
    updateHistory();
    updateChart();
    updateRecoveryTimeTracking();
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    initializeKeyboardNavigation();
    
    initializeAriaLiveRegions();
});

function announceToScreenReader(message, priority = 'polite') {
    const region = document.getElementById(priority === 'assertive' ? 'alertRegion' : 'announcementRegion');
    if (region) {
        region.textContent = message;
        setTimeout(() => {
            region.textContent = '';
        }, 3000);
    }
}

function updateProgressBarAria(percentage) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.setAttribute('aria-valuetext', `${percentage}% complete`);
    }
}

function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.altKey && e.key === 'b') {
            e.preventDefault();
            document.getElementById('startBaselineBtn').click();
            announceToScreenReader('Starting baseline test');
        }
        
        if (e.altKey && e.key === 'p') {
            e.preventDefault();
            document.getElementById('startConflictBtn').click();
            announceToScreenReader('Starting post-conflict test');
        }
        
        if (e.key === 'Escape' && document.getElementById('testSection').style.display === 'block') {
            e.preventDefault();
            cancelTest();
            announceToScreenReader('Test cancelled', 'assertive');
        }
    });
    
    document.getElementById('skipLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('main-content').focus();
    });
}

function initializeAriaLiveRegions() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressBar.setAttribute('aria-valuenow', '0');
    }
}

function tryFallbackFavicons() {
    const fallbacks = [
        document.getElementById('fallback-favicon-ico'),
        document.getElementById('fallback-favicon-png'),
        document.getElementById('emergency-favicon')
    ];
    
    let fallbackIndex = 0;
    
    function tryNextFallback() {
        if (fallbackIndex >= fallbacks.length) {
            console.log('All favicons failed, using emoji fallback');
            createEmojiFavicon();
            return;
        }
        
        const fallback = fallbacks[fallbackIndex];
        if (!fallback) {
            fallbackIndex++;
            tryNextFallback();
            return;
        }
        
        const img = new Image();
        img.onload = function() {
            console.log(`Fallback favicon ${fallbackIndex + 1} loaded`);
            removeAllFavicons();
            document.head.appendChild(fallback.cloneNode());
        };
        img.onerror = function() {
            console.log(`Fallback ${fallbackIndex + 1} failed`);
            fallbackIndex++;
            tryNextFallback();
        };
        img.src = fallback.href;
    }
    
    tryNextFallback();
}

function removeAllFavicons() {
    const favicons = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
    favicons.forEach(favicon => favicon.remove());
}

function createEmojiFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.font = '24px Arial';
    ctx.fillStyle = '#4CAF50';
    ctx.fillText('🧠', 4, 24);
    
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
}

function initializeEventListeners() {
    // Button click handlers
    document.getElementById('startBaselineBtn').addEventListener('click', startBaselineTest);
    document.getElementById('startConflictBtn').addEventListener('click', startConflictTest);
    document.getElementById('reactionBtn').addEventListener('click', recordReaction);
    
    // Intensity slider
    document.getElementById('conflictIntensity').addEventListener('input', function() {
        const value = this.value;
        document.getElementById('intensityValue').textContent = value;
        this.setAttribute('aria-valuenow', value);
        this.setAttribute('aria-valuetext', `Current intensity: ${value} out of 10`);
    });
    
    document.getElementById('memoryAnswer').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 5);
    });
}

function updateIntensityValue(value) {
    document.getElementById('intensityValue').textContent = value;
    const input = document.getElementById('conflictIntensity');
    input.setAttribute('aria-valuenow', value);
    input.setAttribute('aria-valuetext', `Current intensity: ${value} out of 10`);
}

function loadStoredData() {
    window.baselineResults = JSON.parse(localStorage.getItem('cognitiveBaseline')) || null;
    window.recoveryResults = JSON.parse(localStorage.getItem('cognitiveRecoveryResults')) || [];
    window.recoveryTimes = JSON.parse(localStorage.getItem('cognitiveRecoveryTimes')) || [];
    window.lastTestTimestamp = null;
    window.currentTest = null;
    window.testStep = 0;
    window.testResults = {};
    window.reactionStartTime = null;
    window.recoveryChartInstance = null;
}

let baselineResults = window.baselineResults;
let recoveryResults = window.recoveryResults;
let recoveryTimes = window.recoveryTimes;
let lastTestTimestamp = window.lastTestTimestamp;
let currentTest = window.currentTest;
let reactionStartTime = window.reactionStartTime;
let testStep = window.testStep;
let testResults = window.testResults;
let recoveryChartInstance = window.recoveryChartInstance;

function startBaselineTest() {
    currentTest = { type: 'baseline' };
    lastTestTimestamp = Date.now();
    startTest();
    announceToScreenReader('Starting baseline cognitive test');
}

function startConflictTest() {
    const intensity = document.getElementById('conflictIntensity').value;
    currentTest = { 
        type: 'post-conflict', 
        intensity: parseInt(intensity), 
        timestamp: new Date().toISOString(),
        startTime: Date.now()
    };
    lastTestTimestamp = Date.now();
    startTest();
    announceToScreenReader(`Starting post-conflict test with intensity ${intensity}`);
}

function startTest() {
    testStep = 0;
    testResults = {};
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
        updateProgressBarAria(0);
    }
    
    const testSection = document.getElementById('testSection');
    testSection.style.display = 'block';
    testSection.setAttribute('aria-hidden', 'false');
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('resultsSection').setAttribute('aria-hidden', 'true');

    resetTestUI();
    nextTestStep();
    testSection.focus();
}

function resetTestUI() {
    const reactionBtn = document.getElementById('reactionBtn');
    if (reactionBtn) {
        reactionBtn.textContent = 'Wait...';
        reactionBtn.className = 'reaction-btn waiting';
        reactionBtn.disabled = true;
        reactionBtn.setAttribute('aria-label', 'Reaction test button - waiting for green');
    }
    
    document.getElementById('memoryTest').style.display = 'none';
    document.getElementById('memoryInput').style.display = 'none';
    document.getElementById('memoryAnswer').value = '';
    document.getElementById('testStatus').textContent = 'Test in progress...';
    
    reactionStartTime = null;
}

function nextTestStep() {
    testStep++;
    const progressPercentage = (testStep / 3) * 100;
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        updateProgressBarAria(progressPercentage);
    }

    if (testStep === 1) {
        startReactionTest();
    } else if (testStep === 2) {
        startMemoryTest();
    } else if (testStep === 3) {
        showResults();
    }
}

function startReactionTest() {
    document.getElementById('reactionTest').style.display = 'block';
    document.getElementById('memoryTest').style.display = 'none';
    document.getElementById('memoryInput').style.display = 'none';
    document.getElementById('testStatus').textContent = 'Reaction Time Test';
    announceToScreenReader('Reaction time test started');

    const btn = document.getElementById('reactionBtn');
    btn.textContent = 'Wait...';
    btn.className = 'reaction-btn waiting';
    btn.disabled = true;
    btn.setAttribute('aria-label', 'Reaction test button - waiting for green');

    setTimeout(() => {
        btn.textContent = 'Click Now!';
        btn.className = 'reaction-btn ready';
        btn.disabled = false;
        btn.setAttribute('aria-label', 'Reaction test button - click now!');
        reactionStartTime = Date.now();
        announceToScreenReader('Button is now green - click now!', 'assertive');
    }, Math.random() * 3000 + 1000);
}

function recordReaction() {
    if (!reactionStartTime) return;
    const reactionTime = Date.now() - reactionStartTime;
    testResults.reactionTime = reactionTime;
    announceToScreenReader(`Reaction time recorded: ${reactionTime} milliseconds`);
    nextTestStep();
}

function startMemoryTest() {
    document.getElementById('reactionTest').style.display = 'none';
    document.getElementById('memoryTest').style.display = 'block';
    document.getElementById('testStatus').textContent = 'Memory Test';
    announceToScreenReader('Memory test started');

    const numbers = Math.floor(Math.random() * 90000) + 10000;
    document.getElementById('memoryNumbers').textContent = numbers.toString();
    testResults.correctNumbers = numbers.toString();

    setTimeout(() => {
        document.getElementById('memoryNumbers').textContent = '???';
        document.getElementById('memoryInput').style.display = 'block';
        document.getElementById('memoryAnswer').focus();
        announceToScreenReader('Enter the 5-digit number you memorized');
    }, 5000);
}

function showMemoryInput() {
    // Function body is intentionally empty as per original code
}

function checkMemory() {
    const answer = document.getElementById('memoryAnswer').value.trim();
    const correct = testResults.correctNumbers;
    
    const isValid = /^\d{5}$/.test(answer);
    
    if (!isValid) {
        alert('Please enter exactly 5 digits (0-9 only)');
        announceToScreenReader('Please enter exactly 5 digits', 'assertive');
        return; 
    }
    
    let score = 0;
    for (let i = 0; i < correct.length; i++) {
        if (answer[i] === correct[i]) score++;
    }
    testResults.memoryScore = score;
    announceToScreenReader(`Memory score: ${score} out of 5`);
    nextTestStep();
}

function calculateRecoveryTime() {
    if (!baselineResults || !currentTest || currentTest.type !== 'post-conflict') {
        return null;
    }
    
    const reactionDiff = testResults.reactionTime - baselineResults.reactionTime;
    const memoryDiff = testResults.memoryScore - baselineResults.memoryScore;
    
    // Calculate recovery time based on how far from baseline
    const reactionRecovery = Math.max(0, reactionDiff);
    const memoryRecovery = Math.max(0, 5 - memoryDiff);
    
    // Combined recovery score (lower is better)
    return reactionRecovery + (memoryRecovery * 50); // Weight memory more heavily
}

function getRecoveryTimeCategory(recoveryTime) {
    if (recoveryTime < 100) return 'Fast Recovery';
    if (recoveryTime < 250) return 'Moderate Recovery';
    return 'Slow Recovery';
}

function getRecoveryTimeBadgeClass(recoveryTime) {
    if (recoveryTime < 100) return 'badge-fast';
    if (recoveryTime < 250) return 'badge-moderate';
    return 'badge-slow';
}

/**
 * Get CSS class for intensity badge based on intensity value
 * @param {number} intensity - Intensity value from 1-10
 * @returns {string} CSS class for the badge
 */
function getIntensityBadgeClass(intensity) {
    if (intensity <= 3) return 'intensity-low';
    if (intensity <= 7) return 'intensity-medium';
    return 'intensity-high';
}

/**
 * Get display text for intensity badge
 * @param {number} intensity - Intensity value from 1-10
 * @returns {string} Display text for the badge
 */
function getIntensityBadgeText(intensity) {
    if (intensity <= 3) return 'Low';
    if (intensity <= 7) return 'Medium';
    return 'High';
}

function showResults() {
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('testSection').setAttribute('aria-hidden', 'true');
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').setAttribute('aria-hidden', 'false');

    document.getElementById('reactionTimeResult').textContent = `${testResults.reactionTime}ms`;

    const memoryPercentage = (testResults.memoryScore / 5) * 100;
    document.getElementById('memoryScoreResult').textContent = `${testResults.memoryScore}/5 (${memoryPercentage.toFixed(0)}%)`;

    let recoveryStatus = 'N/A';
    let recoveryTime = null;
    let recoveryCategory = 'N/A';
    
    if (baselineResults && currentTest && currentTest.type === 'post-conflict') {
        const reactionDiff = testResults.reactionTime - baselineResults.reactionTime;
        const memoryDiff = testResults.memoryScore - baselineResults.memoryScore;

        if (currentTest.type === 'post-conflict') {
            if (reactionDiff < 50 && memoryDiff >= 0) {
                recoveryStatus = 'Recovered';
            } else if (reactionDiff < 100 || memoryDiff >= -1) {
                recoveryStatus = 'Recovering';
            } else {
                recoveryStatus = 'Impaired';
            }
        }
        
        // Calculate recovery time
        recoveryTime = calculateRecoveryTime();
        if (recoveryTime !== null) {
            recoveryCategory = getRecoveryTimeCategory(recoveryTime);
        }
    }
    
    document.getElementById('recoveryStatus').textContent = recoveryStatus;
    
    // Display recovery time
    const recoveryTimeElement = document.getElementById('recoveryTimeResult');
    if (recoveryTime !== null) {
        recoveryTimeElement.innerHTML = `${recoveryTime}ms <span class="recovery-time-badge ${getRecoveryTimeBadgeClass(recoveryTime)}">${recoveryCategory}</span>`;
    } else {
        recoveryTimeElement.textContent = 'N/A';
    }
    
    // Store recovery time in testResults
    testResults.recoveryTime = recoveryTime;
    testResults.recoveryCategory = recoveryCategory;
    announceToScreenReader(`Test results: Reaction time ${testResults.reactionTime}ms, Memory score ${testResults.memoryScore}/5, Recovery status ${recoveryStatus}`, 'assertive');
    document.getElementById('resultsSection').focus();
}

function saveResult() {
    if (currentTest.type === 'baseline') {
        baselineResults = testResults;
        localStorage.setItem('cognitiveBaseline', JSON.stringify(baselineResults));
        alert('Baseline results saved successfully!');
        announceToScreenReader('Baseline results saved successfully', 'assertive');
    } else if (currentTest.type === 'post-conflict') {
        const result = {
            ...currentTest,
            ...testResults,
            baselineReactionTime: baselineResults ? baselineResults.reactionTime : null,
            baselineMemoryScore: baselineResults ? baselineResults.memoryScore : null,
            endTime: Date.now()
        };
        
        recoveryResults.push(result);
        localStorage.setItem('cognitiveRecoveryResults', JSON.stringify(recoveryResults));
        
        // Calculate and store recovery time
        if (testResults.recoveryTime !== null) {
            const recoveryTimeData = {
                timestamp: result.timestamp,
                recoveryTime: testResults.recoveryTime,
                category: testResults.recoveryCategory,
                intensity: result.intensity
            };
            recoveryTimes.push(recoveryTimeData);
            localStorage.setItem('cognitiveRecoveryTimes', JSON.stringify(recoveryTimes));
        }
        
        updateHistory();
        updateChart();
        updateRecoveryTimeTracking();
        alert('Post-conflict results saved successfully!');
        announceToScreenReader('Post-conflict results saved successfully', 'assertive');
    }

    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('resultsSection').setAttribute('aria-hidden', 'true');
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('testSection').setAttribute('aria-hidden', 'true');
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
        updateProgressBarAria(0);
    }
    
    testStep = 0;
}

function cancelTest() {
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('testSection').setAttribute('aria-hidden', 'true');
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('resultsSection').setAttribute('aria-hidden', 'true');
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
        updateProgressBarAria(0);
    }
    
    testStep = 0;
    resetTestUI();
}

function updateHistory() {
    const historyDiv = document.getElementById('recoveryHistory');
    historyDiv.innerHTML = '';

    if (recoveryResults.length === 0) {
        historyDiv.innerHTML = '<p>No recovery data yet. Take a post-conflict test to see history.</p>';
        return;
    }

    recoveryResults.slice(-5).reverse().forEach((result, index) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Recovery result ${index + 1}`);
        
        const date = new Date(result.timestamp).toLocaleDateString();
        const intensityBadgeClass = getIntensityBadgeClass(result.intensity);
        const intensityBadgeText = getIntensityBadgeText(result.intensity);
        
        let recoveryTimeHtml = '';
        if (result.recoveryTime) {
            const badgeClass = getRecoveryTimeBadgeClass(result.recoveryTime);
            recoveryTimeHtml = `<br>Recovery Time: ${result.recoveryTime}ms <span class="recovery-time-badge ${badgeClass}">${result.recoveryCategory}</span>`;
        }
        
        item.innerHTML = `
            <strong>${date}</strong> - Intensity: ${result.intensity}/10 
            <span class="intensity-badge ${intensityBadgeClass}">${intensityBadgeText}</span><br>
            Reaction: ${result.reactionTime}ms (Baseline: ${result.baselineReactionTime || 'N/A'}ms)<br>
            Memory: ${result.memoryScore}/5 (Baseline: ${result.baselineMemoryScore || 'N/A'}/5)
            ${recoveryTimeHtml}
        `;
        historyDiv.appendChild(item);
    });
}

function updateChart() {
    const canvas = document.getElementById('recoveryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    if (recoveryChartInstance instanceof Chart) {
        recoveryChartInstance.destroy();
        recoveryChartInstance = null;
    }

    if (!recoveryResults || recoveryResults.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const reactionData = recoveryResults.map(result => ({
        x: new Date(result.timestamp),
        y: result.reactionTime
    }));

    const memoryData = recoveryResults.map(result => ({
        x: new Date(result.timestamp),
        y: result.memoryScore
    }));

    const recoveryTimeData = recoveryTimes.map(rt => ({
        x: new Date(rt.timestamp),
        y: rt.recoveryTime
    }));

    recoveryChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Reaction Time (ms)',
                    data: reactionData,
                    borderColor: '#4fd1ff',
                    backgroundColor: 'rgba(79, 209, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Memory Score (/5)',
                    data: memoryData,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Recovery Time (ms)',
                    data: recoveryTimeData,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderDash: [5, 5],
                    yAxisID: 'y'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM D'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Reaction Time / Recovery Time (ms)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    max: 5,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Memory Score'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

function updateRecoveryTimeTracking() {
    if (!recoveryTimes || recoveryTimes.length === 0) {
        document.getElementById('avgRecoveryTime').textContent = '--';
        document.getElementById('fastestRecovery').textContent = '--';
        document.getElementById('slowestRecovery').textContent = '--';
        document.getElementById('recoverySuccessRate').textContent = '--';
        document.getElementById('recoveryTimeTrend').textContent = '';
        document.getElementById('recoveryTimeline').innerHTML = '<h3>Recent Recovery Times</h3><p>No recovery time data yet. Complete post-conflict tests to see tracking.</p>';
        return;
    }

    // Calculate statistics
    const last5Times = recoveryTimes.slice(-5);
    const avgTime = last5Times.reduce((sum, rt) => sum + rt.recoveryTime, 0) / last5Times.length;
    const fastestTime = Math.min(...recoveryTimes.map(rt => rt.recoveryTime));
    const slowestTime = Math.max(...recoveryTimes.map(rt => rt.recoveryTime));
    
    // Calculate success rate (recovery time < 200ms)
    const successfulRecoveries = recoveryTimes.filter(rt => rt.recoveryTime < 200).length;
    const successRate = (successfulRecoveries / recoveryTimes.length) * 100;

    // Update UI
    document.getElementById('avgRecoveryTime').textContent = `${Math.round(avgTime)}ms`;
    document.getElementById('fastestRecovery').textContent = `${Math.round(fastestTime)}ms`;
    document.getElementById('slowestRecovery').textContent = `${Math.round(slowestTime)}ms`;
    document.getElementById('recoverySuccessRate').textContent = `${Math.round(successRate)}%`;

    // Calculate trend
    if (recoveryTimes.length >= 3) {
        const recentAvg = last5Times.reduce((sum, rt) => sum + rt.recoveryTime, 0) / last5Times.length;
        const previousAvg = recoveryTimes.slice(-10, -5).reduce((sum, rt) => sum + rt.recoveryTime, 0) / 
                           Math.min(5, recoveryTimes.slice(-10, -5).length);
        
        const trendElement = document.getElementById('recoveryTimeTrend');
        if (recentAvg < previousAvg) {
            trendElement.textContent = '📈 Improving';
            trendElement.className = 'recovery-trend trend-improving';
        } else if (recentAvg > previousAvg) {
            trendElement.textContent = '📉 Worsening';
            trendElement.className = 'recovery-trend trend-worsening';
        } else {
            trendElement.textContent = '➡️ Stable';
            trendElement.className = 'recovery-trend trend-stable';
        }
    }

    // Update timeline
    updateRecoveryTimeline();
}

function updateRecoveryTimeline() {
    const timelineDiv = document.getElementById('recoveryTimeline');
    const recentTimes = recoveryTimes.slice(-5).reverse();
    
    let timelineHtml = '<h3>Recent Recovery Times</h3>';
    
    recentTimes.forEach((rt, index) => {
        const date = new Date(rt.timestamp).toLocaleDateString();
        const maxRecoveryTime = 500; // Assume max recovery time for scaling
        const percentage = Math.min(100, (rt.recoveryTime / maxRecoveryTime) * 100);
        
        let barColor = 'linear-gradient(90deg, #4CAF50, #FFC107, #f44336)';
        let baselinePosition = '0%';
        
        if (baselineResults) {
            // Calculate baseline position marker
            const baselineRecovery = 100; // Ideal recovery time
            baselinePosition = `${Math.min(100, (baselineRecovery / maxRecoveryTime) * 100)}%`;
        }
        
        timelineHtml += `
            <div class="timeline-item" role="listitem" aria-label="Recovery time from ${date}">
                <div class="timeline-time">${date}</div>
                <div class="timeline-bar-container" role="presentation">
                    <div class="timeline-bar" style="width: ${percentage}%; background: ${barColor};" 
                         role="progressbar" aria-valuenow="${rt.recoveryTime}" 
                         aria-valuemin="0" aria-valuemax="500" 
                         aria-valuetext="${rt.recoveryTime} milliseconds"></div>
                    <div class="timeline-baseline-marker" style="left: ${baselinePosition};" 
                         role="presentation"></div>
                </div>
                <div class="timeline-value">
                    ${rt.recoveryTime}ms
                    <span class="recovery-time-badge ${getRecoveryTimeBadgeClass(rt.recoveryTime)}">${rt.category}</span>
                </div>
            </div>
        `;
    });
    
    timelineDiv.innerHTML = timelineHtml;
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (recoveryChartInstance instanceof Chart) {
        recoveryChartInstance.destroy();
        recoveryChartInstance = null;
    }
});