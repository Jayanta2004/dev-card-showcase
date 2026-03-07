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
    updateStatisticalAnalysis(); // New function call
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
    
    initializeKeyboardNavigation();
    initializeAriaLiveRegions();
    initializeSessionTimeout();
});

const StatisticalAnalyzer = {
    movingAverage(data, windowSize = 3) {
        if (data.length < windowSize) return data;
        
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(data.length, i + Math.floor(windowSize / 2) + 1);
            const window = data.slice(start, end);
            const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
            result.push(avg);
        }
        return result;
    },

    calculateTrend(data) {
        if (data.length < 2) return { direction: 'stable', strength: 0 };
        
        const recent = data.slice(-3);
        const first = recent[0];
        const last = recent[recent.length - 1];
        
        if (recent.length < 2) return { direction: 'stable', strength: 0 };
        
        const change = ((last - first) / first) * 100;
        
        if (Math.abs(change) < 5) return { direction: 'stable', strength: Math.abs(change) };
        if (change < 0) return { direction: 'improving', strength: Math.abs(change) };
        return { direction: 'worsening', strength: change };
    },

    standardDeviation(data) {
        if (data.length < 2) return 0;
        
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const squareDiffs = data.map(val => Math.pow(val - mean, 2));
        const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / data.length;
        return Math.sqrt(avgSquareDiff);
    },

    predictNextRecovery(data) {
        if (data.length < 3) return null;
        
        const indices = data.map((_, i) => i);
        const n = data.length;
        
        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + (x * data[i]), 0);
        const sumXX = indices.reduce((sum, x) => sum + (x * x), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const nextIndex = n;
        const prediction = slope * nextIndex + intercept;
        
        const residuals = data.map((y, i) => Math.abs(y - (slope * i + intercept)));
        const mae = residuals.reduce((sum, val) => sum + val, 0) / n;
        
        return {
            value: Math.max(0, Math.round(prediction)),
            lowerBound: Math.max(0, Math.round(prediction - mae)),
            upperBound: Math.round(prediction + mae),
            confidence: Math.min(100, Math.round((1 - (mae / (prediction || 1))) * 100))
        };
    },

    identifyPatterns(data) {
        if (data.length < 4) return { type: 'insufficient_data', description: 'Not enough data for pattern analysis' };
        
        const recent = data.slice(-4);
        const variance = this.standardDeviation(recent) / (recent.reduce((a, b) => a + b, 0) / recent.length);
        
        const trend = this.calculateTrend(data);
        
        if (variance < 0.1) {
            return { type: 'consistent', description: 'Recovery times are very consistent' };
        } else if (trend.direction === 'improving' && trend.strength > 10) {
            return { type: 'improving', description: 'Recovery times are consistently improving' };
        } else if (trend.direction === 'worsening' && trend.strength > 10) {
            return { type: 'declining', description: 'Recovery times are getting longer' };
        } else if (variance > 0.3) {
            return { type: 'variable', description: 'Recovery times show high variability' };
        }
        
        return { type: 'stable', description: 'Recovery patterns are stable' };
    },

    percentile(data, percentile) {
        if (data.length === 0) return 0;
        const sorted = [...data].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        if (Math.floor(index) === index) return sorted[index];
        
        const lower = sorted[Math.floor(index)];
        const upper = sorted[Math.ceil(index)];
        return lower + (upper - lower) * (index - Math.floor(index));
    },

    generateInsights(recoveryTimes) {
        if (!recoveryTimes || recoveryTimes.length === 0) {
            return { hasData: false };
        }
        
        const times = recoveryTimes.map(rt => rt.recoveryTime);
        const intensities = recoveryTimes.map(rt => rt.intensity).filter(i => i);
        
        const stats = {
            hasData: true,
            count: times.length,
            mean: times.reduce((a, b) => a + b, 0) / times.length,
            median: this.percentile(times, 50),
            stdDev: this.standardDeviation(times),
            min: Math.min(...times),
            max: Math.max(...times),
            q1: this.percentile(times, 25),
            q3: this.percentile(times, 75),
            trend: this.calculateTrend(times),
            pattern: this.identifyPatterns(times),
            prediction: this.predictNextRecovery(times)
        };
        
        if (intensities.length >= 3 && intensities.length === times.length) {
            const correlation = this.calculateCorrelation(intensities, times);
            stats.intensityCorrelation = correlation;
        }
        
        return stats;
    },

    calculateCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + (xi * y[i]), 0);
        const sumXX = x.reduce((sum, xi) => sum + (xi * xi), 0);
        const sumYY = y.reduce((sum, yi) => sum + (yi * yi), 0);
        
        const correlation = (n * sumXY - sumX * sumY) / 
            Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
        
        return correlation;
    },

    getRecoveryCategory(recoveryTime, stats) {
        if (!stats || !stats.hasData) return 'unknown';
        
        if (recoveryTime <= stats.q1) return 'excellent';
        if (recoveryTime <= stats.median) return 'good';
        if (recoveryTime <= stats.q3) return 'average';
        return 'needs_improvement';
    }
};

let sessionTimeoutManager = {
    timeoutDuration: 5 * 60 * 1000, 
    warningTime: 60 * 1000, 
    timeoutId: null,
    warningId: null,
    startTime: null,
    isActive: false,
    onTimeout: null,
    onWarning: null,
    onExtend: null,
    checkInterval: null,
    
    start(callbacks = {}) {
        this.onTimeout = callbacks.onTimeout || this.defaultTimeout;
        this.onWarning = callbacks.onWarning || this.defaultWarning;
        this.onExtend = callbacks.onExtend || this.defaultExtend;
        
        this.startTime = Date.now();
        this.isActive = true;
        this.clearTimeouts();
        
        this.warningId = setTimeout(() => {
            if (this.isActive) {
                this.showWarning();
            }
        }, this.timeoutDuration - this.warningTime);
       
        this.timeoutId = setTimeout(() => {
            if (this.isActive) {
                this.executeTimeout();
            }
        }, this.timeoutDuration);
        
        this.startCheckInterval();
        
        console.log('Session timeout started:', new Date(this.startTime + this.timeoutDuration).toLocaleTimeString());
    },
    
    startCheckInterval() {
        this.checkInterval = setInterval(() => {
            if (this.isActive) {
                this.updateCountdownDisplay();
            }
        }, 1000);
    },
    
    updateCountdownDisplay() {
        if (!this.isActive) return;
        
        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.timeoutDuration - elapsed);
        
        const countdownElement = document.getElementById('sessionCountdown');
        if (countdownElement) {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (remaining <= this.warningTime) {
                countdownElement.classList.add('warning');
            } else {
                countdownElement.classList.remove('warning');
            }
        }
        
        if (this.isUserActive()) {
            this.extend();
        }
    },
    
    isUserActive() {
        const lastActivity = window.lastUserActivity || this.startTime;
        return (Date.now() - lastActivity) < 30000; 
    },
    
    showWarning() {
        if (!this.isActive) return;
        
        const warningMessage = 'Your test session will expire in 1 minute. Please complete your test or extend the session.';
        showTimeoutNotification('warning', warningMessage, () => this.extend(), () => this.executeTimeout());
        
        if (this.onWarning) {
            this.onWarning();
        }
        
        announceToScreenReader('Warning: Your test session will expire in 1 minute', 'assertive');
    },
    
    executeTimeout() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.clearTimeouts();
        
        if (window.testResults && Object.keys(window.testResults).length > 0) {
            this.savePartialResults();
        }
        
        resetTest();
        
        showTimeoutNotification('expired', 'Your test session has expired. Any partial results have been saved.', null, null, true);
        
        if (this.onTimeout) {
            this.onTimeout();
        }
        
        announceToScreenReader('Test session expired. Test has been reset.', 'assertive');
    },
    
    savePartialResults() {
        try {
            const partialResult = {
                timestamp: new Date().toISOString(),
                type: window.currentTest?.type || 'unknown',
                partialData: window.testResults,
                completedSteps: window.testStep || 0,
                status: 'incomplete',
                reason: 'session_timeout'
            };
            
            const partialResults = JSON.parse(localStorage.getItem('cognitivePartialResults') || '[]');
            partialResults.push(partialResult);
            localStorage.setItem('cognitivePartialResults', JSON.stringify(partialResults));
            
            console.log('Partial results saved:', partialResult);
        } catch (error) {
            console.error('Error saving partial results:', error);
        }
    },
    
    extend() {
        if (!this.isActive) return;
        
        this.clearTimeouts();
        this.start({
            onTimeout: this.onTimeout,
            onWarning: this.onWarning,
            onExtend: this.onExtend
        });
        
        window.lastUserActivity = Date.now();
        
        if (this.onExtend) {
            this.onExtend();
        }
        
        console.log('Session extended:', new Date(this.startTime + this.timeoutDuration).toLocaleTimeString());
    },
    
    clearTimeouts() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.warningId) {
            clearTimeout(this.warningId);
            this.warningId = null;
        }
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    },
    
    stop() {
        this.isActive = false;
        this.clearTimeouts();
        
        const indicator = document.querySelector('.session-timeout-indicator');
        if (indicator) {
            indicator.remove();
        }
    },
    
    defaultTimeout() {
        console.log('Session timeout occurred');
    },
    
    defaultWarning() {
        console.log('Session warning triggered');
    },
    
    defaultExtend() {
        console.log('Session extended');
    }
};

function showTimeoutNotification(type, message, onExtend, onClose, autoClose = false) {
    const existing = document.querySelector('.timeout-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `timeout-notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    
    let actions = '';
    if (type === 'warning' && onExtend) {
        actions = `
            <div class="timeout-actions">
                <button class="timeout-btn primary" onclick="extendSession()" aria-label="Extend session by 5 minutes">
                    Extend Session
                </button>
                <button class="timeout-btn secondary" onclick="closeTimeoutNotification(this)" aria-label="Close notification">
                    Close
                </button>
            </div>
        `;
    } else if (type === 'expired') {
        actions = `
            <div class="timeout-actions">
                <button class="timeout-btn primary" onclick="closeTimeoutNotification(this)" aria-label="OK">
                    OK
                </button>
            </div>
        `;
    }
    
    notification.innerHTML = `
        <div class="timeout-header">
            <i class="fas ${type === 'warning' ? 'fa-exclamation-triangle' : 'fa-hourglass-end'}"></i>
            <span class="timeout-title">${type === 'warning' ? 'Session Expiring Soon' : 'Session Expired'}</span>
        </div>
        <div class="timeout-message">${message}</div>
        ${type === 'warning' ? '<div class="timeout-timer" id="warningTimer">1:00</div>' : ''}
        ${actions}
    `;
    
    document.body.appendChild(notification);
    
    if (type === 'warning') {
        let timeLeft = 60;
        const timerElement = document.getElementById('warningTimer');
        const timerInterval = setInterval(() => {
            timeLeft--;
            if (timerElement) {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);
        
        notification.timerInterval = timerInterval;
    }
    
    if (autoClose) {
        setTimeout(() => {
            if (notification.parentNode) {
                closeTimeoutNotification(notification);
            }
        }, 5000);
    }
}

function closeTimeoutNotification(element) {
    const notification = element.closest ? element.closest('.timeout-notification') : element;
    if (notification) {
        if (notification.timerInterval) {
            clearInterval(notification.timerInterval);
        }
        
        notification.classList.add('closing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }
}

function extendSession() {
    sessionTimeoutManager.extend();
    closeTimeoutNotification(document.querySelector('.timeout-notification'));
    
    announceToScreenReader('Session extended by 5 minutes', 'polite');
}

function initializeSessionTimeout() {
    ['mousedown', 'keydown', 'touchstart', 'mousemove'].forEach(eventType => {
        document.addEventListener(eventType, () => {
            window.lastUserActivity = Date.now();
        }, { passive: true });
    });
}

function addTimeoutIndicator() {
    const testSection = document.getElementById('testSection');
    if (!testSection) return;
    
    const existing = document.querySelector('.session-timeout-indicator');
    if (existing) {
        existing.remove();
    }
    
    const indicator = document.createElement('div');
    indicator.className = 'session-timeout-indicator';
    indicator.innerHTML = `
        <div class="timeout-label">
            <i class="fas fa-hourglass-half"></i>
            <span>Session timeout:</span>
        </div>
        <div class="countdown-timer" id="sessionCountdown">5:00</div>
    `;
    
    testSection.appendChild(indicator);
}

function resetTest() {
    sessionTimeoutManager.stop();
    
    const testSection = document.getElementById('testSection');
    const resultsSection = document.getElementById('resultsSection');
    
    if (testSection) {
        testSection.style.display = 'none';
        testSection.setAttribute('aria-hidden', 'true');
    }
    
    if (resultsSection) {
        resultsSection.style.display = 'none';
        resultsSection.setAttribute('aria-hidden', 'true');
    }
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
        updateProgressBarAria(0);
    }
    
    window.testStep = 0;
    window.testResults = {};
    window.reactionStartTime = null;

    resetTestUI();
    
    const indicator = document.querySelector('.session-timeout-indicator');
    if (indicator) {
        indicator.remove();
    }
    
    clearOldPartialResults();
}

function clearOldPartialResults() {
    try {
        const partialResults = JSON.parse(localStorage.getItem('cognitivePartialResults') || '[]');
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        
        const filteredResults = partialResults.filter(result => {
            const resultTime = new Date(result.timestamp).getTime();
            return resultTime > oneDayAgo;
        });
        
        localStorage.setItem('cognitivePartialResults', JSON.stringify(filteredResults));
    } catch (error) {
        console.error('Error clearing old partial results:', error);
    }
}

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
    
    const skipLink = document.getElementById('skipLink');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('main-content').focus();
        });
    }
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
    const startBaselineBtn = document.getElementById('startBaselineBtn');
    if (startBaselineBtn) {
        startBaselineBtn.addEventListener('click', startBaselineTest);
    }
    
    const startConflictBtn = document.getElementById('startConflictBtn');
    if (startConflictBtn) {
        startConflictBtn.addEventListener('click', startConflictTest);
    }
    
    const reactionBtn = document.getElementById('reactionBtn');
    if (reactionBtn) {
        reactionBtn.addEventListener('click', recordReaction);
    }
    
    // Intensity slider
    const conflictIntensity = document.getElementById('conflictIntensity');
    if (conflictIntensity) {
        conflictIntensity.addEventListener('input', function() {
            const value = this.value;
            document.getElementById('intensityValue').textContent = value;
            this.setAttribute('aria-valuenow', value);
            this.setAttribute('aria-valuetext', `Current intensity: ${value} out of 10`);
        });
    }
    
    const memoryAnswer = document.getElementById('memoryAnswer');
    if (memoryAnswer) {
        memoryAnswer.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 5);
        });
        
        memoryAnswer.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkMemory();
            }
        });
    }
    
    const saveResultBtn = document.querySelector('.save-result-btn');
    if (saveResultBtn) {
        saveResultBtn.addEventListener('click', saveResult);
    }
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
    window.currentTest = { type: 'baseline' };
    window.lastTestTimestamp = Date.now();
    startTest();
    announceToScreenReader('Starting baseline cognitive test');
}

function startConflictTest() {
    const intensity = document.getElementById('conflictIntensity').value;
    window.currentTest = { 
        type: 'post-conflict', 
        intensity: parseInt(intensity), 
        timestamp: new Date().toISOString(),
        startTime: Date.now()
    };
    window.lastTestTimestamp = Date.now();
    startTest();
    announceToScreenReader(`Starting post-conflict test with intensity ${intensity}`);
}

function startTest() {
    window.testStep = 0;
    window.testResults = {};
    
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
    
    addTimeoutIndicator();
    
    sessionTimeoutManager.start({
        onTimeout: function() {
            console.log('Test session timed out');
        },
        onWarning: function() {
            console.log('Test session warning');
        },
        onExtend: function() {
            console.log('Test session extended');
        }
    });
}

function resetTestUI() {
    const reactionBtn = document.getElementById('reactionBtn');
    if (reactionBtn) {
        reactionBtn.textContent = 'Wait...';
        reactionBtn.className = 'reaction-btn waiting';
        reactionBtn.disabled = true;
        reactionBtn.setAttribute('aria-label', 'Reaction test button - waiting for green');
    }
    
    document.getElementById('reactionTest').style.display = 'none';
    document.getElementById('memoryTest').style.display = 'none';
    document.getElementById('memoryInput').style.display = 'none';
    document.getElementById('memoryAnswer').value = '';
    document.getElementById('testStatus').textContent = 'Test in progress...';
    
    window.reactionStartTime = null;
}

function nextTestStep() {
    window.testStep++;
    const progressPercentage = (window.testStep / 3) * 100;
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = `${progressPercentage}%`;
        updateProgressBarAria(progressPercentage);
    }

    if (window.testStep === 1) {
        startReactionTest();
    } else if (window.testStep === 2) {
        startMemoryTest();
    } else if (window.testStep === 3) {
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
        window.reactionStartTime = Date.now();
        announceToScreenReader('Button is now green - click now!', 'assertive');
    }, Math.random() * 3000 + 1000);
}

function recordReaction() {
    if (!window.reactionStartTime) return;
    const reactionTime = Date.now() - window.reactionStartTime;
    window.testResults.reactionTime = reactionTime;
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
    window.testResults.correctNumbers = numbers.toString();

    setTimeout(() => {
        document.getElementById('memoryNumbers').textContent = '???';
        document.getElementById('memoryInput').style.display = 'block';
        document.getElementById('memoryAnswer').focus();
        announceToScreenReader('Enter the 5-digit number you memorized');
    }, 5000);
}

function showMemoryInput() {
    document.getElementById('memoryTest').style.display = 'none';
    document.getElementById('memoryInput').style.display = 'block';
    document.getElementById('memoryAnswer').focus();
}

function checkMemory() {
    const answer = document.getElementById('memoryAnswer').value.trim();
    const correct = window.testResults.correctNumbers;
    
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
    window.testResults.memoryScore = score;
    announceToScreenReader(`Memory score: ${score} out of 5`);
    nextTestStep();
}

function calculateRecoveryTime() {
    if (!window.baselineResults || !window.currentTest || window.currentTest.type !== 'post-conflict') {
        return null;
    }
    
    const reactionDiff = window.testResults.reactionTime - window.baselineResults.reactionTime;
    const memoryDiff = window.testResults.memoryScore - window.baselineResults.memoryScore;
    
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

function getIntensityBadgeClass(intensity) {
    if (intensity <= 3) return 'intensity-low';
    if (intensity <= 7) return 'intensity-medium';
    return 'intensity-high';
}

function getIntensityBadgeText(intensity) {
    if (intensity <= 3) return 'Low';
    if (intensity <= 7) return 'Medium';
    return 'High';
}

function showResults() {
    sessionTimeoutManager.stop();
    
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('testSection').setAttribute('aria-hidden', 'true');
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').setAttribute('aria-hidden', 'false');

    document.getElementById('reactionTimeResult').textContent = `${window.testResults.reactionTime}ms`;

    const memoryPercentage = (window.testResults.memoryScore / 5) * 100;
    document.getElementById('memoryScoreResult').textContent = `${window.testResults.memoryScore}/5 (${memoryPercentage.toFixed(0)}%)`;

    let recoveryStatus = 'N/A';
    let recoveryTime = null;
    let recoveryCategory = 'N/A';
    
    if (window.baselineResults && window.currentTest && window.currentTest.type === 'post-conflict') {
        const reactionDiff = window.testResults.reactionTime - window.baselineResults.reactionTime;
        const memoryDiff = window.testResults.memoryScore - window.baselineResults.memoryScore;

        if (window.currentTest.type === 'post-conflict') {
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
    window.testResults.recoveryTime = recoveryTime;
    window.testResults.recoveryCategory = recoveryCategory;
    announceToScreenReader(`Test results: Reaction time ${window.testResults.reactionTime}ms, Memory score ${window.testResults.memoryScore}/5, Recovery status ${recoveryStatus}`, 'assertive');
    document.getElementById('resultsSection').focus();
    
    const indicator = document.querySelector('.session-timeout-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function saveResult() {
    if (window.currentTest.type === 'baseline') {
        window.baselineResults = window.testResults;
        localStorage.setItem('cognitiveBaseline', JSON.stringify(window.baselineResults));
        alert('Baseline results saved successfully!');
        announceToScreenReader('Baseline results saved successfully', 'assertive');
    } else if (window.currentTest.type === 'post-conflict') {
        const result = {
            ...window.currentTest,
            ...window.testResults,
            baselineReactionTime: window.baselineResults ? window.baselineResults.reactionTime : null,
            baselineMemoryScore: window.baselineResults ? window.baselineResults.memoryScore : null,
            endTime: Date.now()
        };
        
        window.recoveryResults.push(result);
        localStorage.setItem('cognitiveRecoveryResults', JSON.stringify(window.recoveryResults));
        
        // Calculate and store recovery time
        if (window.testResults.recoveryTime !== null) {
            const recoveryTimeData = {
                timestamp: result.timestamp,
                recoveryTime: window.testResults.recoveryTime,
                category: window.testResults.recoveryCategory,
                intensity: result.intensity
            };
            window.recoveryTimes.push(recoveryTimeData);
            localStorage.setItem('cognitiveRecoveryTimes', JSON.stringify(window.recoveryTimes));
        }
        
        updateHistory();
        updateChart();
        updateRecoveryTimeTracking();
        updateStatisticalAnalysis(); 
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
    
    window.testStep = 0;
}

function cancelTest() {
    sessionTimeoutManager.stop();
    
    document.getElementById('testSection').style.display = 'none';
    document.getElementById('testSection').setAttribute('aria-hidden', 'true');
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('resultsSection').setAttribute('aria-hidden', 'true');
    
    const progressBar = document.getElementById('testProgress');
    if (progressBar) {
        progressBar.style.width = '0%';
        updateProgressBarAria(0);
    }
    
    window.testStep = 0;
    resetTestUI();
    
    const indicator = document.querySelector('.session-timeout-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function updateHistory() {
    const historyDiv = document.getElementById('recoveryHistory');
    historyDiv.innerHTML = '';

    if (window.recoveryResults.length === 0) {
        historyDiv.innerHTML = '<p>No recovery data yet. Take a post-conflict test to see history.</p>';
        return;
    }

    window.recoveryResults.slice(-5).reverse().forEach((result, index) => {
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

    if (window.recoveryChartInstance instanceof Chart) {
        window.recoveryChartInstance.destroy();
        window.recoveryChartInstance = null;
    }

    if (!window.recoveryResults || window.recoveryResults.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const reactionData = window.recoveryResults.map(result => ({
        x: new Date(result.timestamp),
        y: result.reactionTime
    }));

    const memoryData = window.recoveryResults.map(result => ({
        x: new Date(result.timestamp),
        y: result.memoryScore
    }));

    const recoveryTimeData = window.recoveryTimes.map(rt => ({
        x: new Date(rt.timestamp),
        y: rt.recoveryTime
    }));

    const recoveryValues = window.recoveryTimes.map(rt => rt.recoveryTime);
    const movingAvg = StatisticalAnalyzer.movingAverage(recoveryValues, 3);
    const movingAvgData = window.recoveryTimes.map((rt, index) => ({
        x: new Date(rt.timestamp),
        y: movingAvg[index]
    }));

    window.recoveryChartInstance = new Chart(ctx, {
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
                },
                {
                    label: 'Recovery Trend (3-period MA)',
                    data: movingAvgData,
                    borderColor: '#f44336',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0,
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
    if (!window.recoveryTimes || window.recoveryTimes.length === 0) {
        document.getElementById('avgRecoveryTime').textContent = '--';
        document.getElementById('fastestRecovery').textContent = '--';
        document.getElementById('slowestRecovery').textContent = '--';
        document.getElementById('recoverySuccessRate').textContent = '--';
        document.getElementById('recoveryTimeTrend').textContent = '';
        const timelineDiv = document.getElementById('recoveryTimeline');
        if (timelineDiv) {
            timelineDiv.innerHTML = '<h3>Recent Recovery Times</h3><p>No recovery time data yet. Complete post-conflict tests to see tracking.</p>';
        }
        return;
    }

    // Calculate statistics
    const last5Times = window.recoveryTimes.slice(-5);
    const avgTime = last5Times.reduce((sum, rt) => sum + rt.recoveryTime, 0) / last5Times.length;
    const fastestTime = Math.min(...window.recoveryTimes.map(rt => rt.recoveryTime));
    const slowestTime = Math.max(...window.recoveryTimes.map(rt => rt.recoveryTime));
    
    // Calculate success rate (recovery time < 200ms)
    const successfulRecoveries = window.recoveryTimes.filter(rt => rt.recoveryTime < 200).length;
    const successRate = (successfulRecoveries / window.recoveryTimes.length) * 100;

    // Update UI
    document.getElementById('avgRecoveryTime').textContent = `${Math.round(avgTime)}ms`;
    document.getElementById('fastestRecovery').textContent = `${Math.round(fastestTime)}ms`;
    document.getElementById('slowestRecovery').textContent = `${Math.round(slowestTime)}ms`;
    document.getElementById('recoverySuccessRate').textContent = `${Math.round(successRate)}%`;

    // Calculate trend
    if (window.recoveryTimes.length >= 3) {
        const recentAvg = last5Times.reduce((sum, rt) => sum + rt.recoveryTime, 0) / last5Times.length;
        const previousAvg = window.recoveryTimes.slice(-10, -5).reduce((sum, rt) => sum + rt.recoveryTime, 0) / 
                           Math.min(5, window.recoveryTimes.slice(-10, -5).length);
        
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
    if (!timelineDiv) return;
    
    const recentTimes = window.recoveryTimes.slice(-5).reverse();
    
    let timelineHtml = '<h3>Recent Recovery Times</h3>';
    
    if (recentTimes.length === 0) {
        timelineHtml += '<p>No recovery time data yet.</p>';
    } else {
        recentTimes.forEach((rt, index) => {
            const date = new Date(rt.timestamp).toLocaleDateString();
            const maxRecoveryTime = 500; // Assume max recovery time for scaling
            const percentage = Math.min(100, (rt.recoveryTime / maxRecoveryTime) * 100);
            
            let barColor = 'linear-gradient(90deg, #4CAF50, #FFC107, #f44336)';
            let baselinePosition = '0%';
            
            if (window.baselineResults) {
                const baselineRecovery = 100; 
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
    }
    
    timelineDiv.innerHTML = timelineHtml;
}

function updateStatisticalAnalysis() {
    const recoveryTimeSection = document.getElementById('recoveryTimeSection');
    
    const existingInsights = document.querySelector('.statistical-insights');
    if (existingInsights) {
        existingInsights.remove();
    }
    
    const stats = StatisticalAnalyzer.generateInsights(window.recoveryTimes);
    
    if (!stats.hasData) {
        return;
    }
    
    const insightsDiv = document.createElement('div');
    insightsDiv.className = 'statistical-insights';
    insightsDiv.setAttribute('role', 'region');
    insightsDiv.setAttribute('aria-label', 'Statistical Analysis Insights');
    
    const patternClass = `pattern-${stats.pattern.type}`;
    
    let trendIcon = '';
    let trendClass = '';
    if (stats.trend.direction === 'improving') {
        trendIcon = '📉';
        trendClass = 'trend-down';
    } else if (stats.trend.direction === 'worsening') {
        trendIcon = '📈';
        trendClass = 'trend-up';
    } else {
        trendIcon = '➡️';
        trendClass = 'trend-neutral';
    }
    
    let correlationHtml = '';
    if (stats.intensityCorrelation) {
        const correlationStrength = Math.abs(stats.intensityCorrelation);
        const correlationDirection = stats.intensityCorrelation > 0 ? 'positive' : 'negative';
        correlationHtml = `
            <div class="insight-card">
                <h4><i class="fas fa-link"></i> Intensity Correlation</h4>
                <div class="insight-value">${(stats.intensityCorrelation * 100).toFixed(1)}%</div>
                <div class="insight-trend ${correlationDirection === 'positive' ? 'trend-up' : 'trend-down'}">
                    ${correlationDirection === 'positive' ? '↑' : '↓'} ${correlationStrength > 0.7 ? 'Strong' : correlationStrength > 0.3 ? 'Moderate' : 'Weak'} correlation
                </div>
            </div>
        `;
    }
    
    let predictionHtml = '';
    if (stats.prediction) {
        const confidenceClass = stats.prediction.confidence > 70 ? 'trend-improving' : 
                               stats.prediction.confidence > 40 ? 'trend-stable' : 'trend-worsening';
        predictionHtml = `
            <div class="prediction-card">
                <div class="prediction-title"><i class="fas fa-chart-line"></i> Next Recovery Prediction</div>
                <div class="prediction-value">${stats.prediction.value}ms</div>
                <div class="prediction-range">Range: ${stats.prediction.lowerBound} - ${stats.prediction.upperBound}ms</div>
                <div class="insight-trend ${confidenceClass}">Confidence: ${stats.prediction.confidence}%</div>
            </div>
        `;
    }
    
    insightsDiv.innerHTML = `
        <div class="insights-header">
            <i class="fas fa-chart-bar"></i>
            <h3>Statistical Analysis & Predictions</h3>
        </div>
        
        <div class="insights-grid">
            <div class="insight-card">
                <h4><i class="fas fa-calculator"></i> Distribution</h4>
                <div class="insight-value">${stats.count} tests</div>
                <div class="insight-trend">
                    Q1: ${Math.round(stats.q1)}ms | Median: ${Math.round(stats.median)}ms | Q3: ${Math.round(stats.q3)}ms
                </div>
            </div>
            
            <div class="insight-card">
                <h4><i class="fas fa-chart-line"></i> Variability</h4>
                <div class="insight-value">±${Math.round(stats.stdDev)}ms</div>
                <div class="insight-trend">
                    Range: ${Math.round(stats.min)} - ${Math.round(stats.max)}ms
                </div>
            </div>
            
            <div class="insight-card">
                <h4><i class="fas fa-trend"></i> Current Trend</h4>
                <div class="insight-value">${trendIcon} ${stats.trend.direction}</div>
                <div class="insight-trend ${trendClass}">
                    ${stats.trend.strength.toFixed(1)}% change
                </div>
            </div>
            
            ${correlationHtml}
        </div>
        
        <div class="pattern-analysis">
            <span class="pattern-badge pattern-${stats.pattern.type}">${stats.pattern.type}</span>
            <span>${stats.pattern.description}</span>
        </div>
        
        ${predictionHtml}
        
        <div class="insight-footer">
            Analysis based on last ${stats.count} recovery measurements
            ${stats.count < 5 ? '· More data needed for better predictions' : ''}
        </div>
    `;
    
    const recoveryStats = document.querySelector('.recovery-stats');
    if (recoveryStats) {
        recoveryStats.parentNode.insertBefore(insightsDiv, recoveryStats.nextSibling);
    }
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (window.recoveryChartInstance instanceof Chart) {
        window.recoveryChartInstance.destroy();
        window.recoveryChartInstance = null;
    }
    
    sessionTimeoutManager.stop();
});