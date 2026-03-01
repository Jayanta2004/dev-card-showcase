// Adaptive Token Optimization Controller Script

// Global variables
let isRunning = false;
let currentUsage = 0;
let totalTokens = 1000;
let efficiency = 0;
let logs = [];
let settings = {
    algorithm: 'adaptive',
    threshold: 100,
    rate: 0.1,
    maxTokens: 500,
    autoOptimize: true,
    logLevel: 'info'
};
let dataPoints = [];

// DOM elements
const monitorBtn = document.getElementById('monitorBtn');
const settingsBtn = document.getElementById('settingsBtn');
const logsBtn = document.getElementById('logsBtn');
const analyticsBtn = document.getElementById('analyticsBtn');
const helpBtn = document.getElementById('helpBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsForm = document.getElementById('settingsForm');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const exportLogsBtn = document.getElementById('exportLogsBtn');
const logFilter = document.getElementById('logFilter');
const sections = document.querySelectorAll('section');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
    setupEventListeners();
    loadSettings();
    updateDisplay();
    log('System initialized', 'info');
}

// Event listeners
function setupEventListeners() {
    monitorBtn.addEventListener('click', () => showSection('monitor'));
    settingsBtn.addEventListener('click', () => showSection('settings'));
    logsBtn.addEventListener('click', () => showSection('logs'));
    analyticsBtn.addEventListener('click', () => showSection('analytics'));
    helpBtn.addEventListener('click', () => showSection('help'));
    
    startBtn.addEventListener('click', startOptimization);
    stopBtn.addEventListener('click', stopOptimization);
    resetBtn.addEventListener('click', resetSystem);
    
    settingsForm.addEventListener('submit', saveSettings);
    document.getElementById('defaultBtn').addEventListener('click', restoreDefaults);
    
    clearLogsBtn.addEventListener('click', clearLogs);
    exportLogsBtn.addEventListener('click', exportLogs);
    logFilter.addEventListener('input', filterLogs);
}

// Navigation
function showSection(sectionId) {
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#${sectionId}Btn`).classList.add('active');
}

// Optimization control
function startOptimization() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    log('Optimization started', 'info');
    runOptimizationLoop();
}

function stopOptimization() {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    log('Optimization stopped', 'info');
}

function resetSystem() {
    stopOptimization();
    currentUsage = 0;
    efficiency = 0;
    dataPoints = [];
    logs = [];
    updateDisplay();
    log('System reset', 'info');
}

function runOptimizationLoop() {
    if (!isRunning) return;
    
    // Simulate token usage
    const usage = Math.random() * 50 + 10;
    currentUsage += usage;
    
    // Apply optimization
    if (settings.autoOptimize && currentUsage > settings.threshold) {
        const optimized = applyOptimization(usage);
        currentUsage -= optimized;
        efficiency = Math.min(100, efficiency + settings.rate * 10);
        log(`Optimized ${optimized.toFixed(2)} tokens`, 'info');
    }
    
    // Update data
    dataPoints.push({
        time: new Date().toLocaleTimeString(),
        usage: currentUsage,
        optimized: usage,
        savings: efficiency
    });
    
    if (dataPoints.length > 20) dataPoints.shift();
    
    updateDisplay();
    
    setTimeout(runOptimizationLoop, 2000);
}

function applyOptimization(usage) {
    let optimized = 0;
    switch (settings.algorithm) {
        case 'greedy':
            optimized = Math.min(usage * 0.2, settings.maxTokens * 0.1);
            break;
        case 'adaptive':
            optimized = usage * settings.rate;
            break;
        case 'predictive':
            optimized = usage * (1 - predictEfficiency());
            break;
        default:
            optimized = usage * 0.1;
    }
    return Math.min(optimized, usage);
}

function predictEfficiency() {
    // Simple prediction based on recent data
    if (dataPoints.length < 5) return 0.5;
    const recent = dataPoints.slice(-5);
    const avgSavings = recent.reduce((sum, p) => sum + p.savings, 0) / recent.length;
    return avgSavings / 100;
}

// Settings
function saveSettings(e) {
    e.preventDefault();
    settings.algorithm = document.getElementById('algorithm').value;
    settings.threshold = parseInt(document.getElementById('threshold').value);
    settings.rate = parseFloat(document.getElementById('rate').value);
    settings.maxTokens = parseInt(document.getElementById('maxTokens').value);
    settings.autoOptimize = document.getElementById('autoOptimize').checked;
    settings.logLevel = document.getElementById('logLevel').value;
    
    localStorage.setItem('optimizationSettings', JSON.stringify(settings));
    log('Settings saved', 'info');
    showSection('monitor');
}

function loadSettings() {
    const saved = localStorage.getItem('optimizationSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
        updateSettingsForm();
    }
}

function updateSettingsForm() {
    document.getElementById('algorithm').value = settings.algorithm;
    document.getElementById('threshold').value = settings.threshold;
    document.getElementById('rate').value = settings.rate;
    document.getElementById('maxTokens').value = settings.maxTokens;
    document.getElementById('autoOptimize').checked = settings.autoOptimize;
    document.getElementById('logLevel').value = settings.logLevel;
}

function restoreDefaults() {
    settings = {
        algorithm: 'adaptive',
        threshold: 100,
        rate: 0.1,
        maxTokens: 500,
        autoOptimize: true,
        logLevel: 'info'
    };
    updateSettingsForm();
    log('Defaults restored', 'info');
}

// Display updates
function updateDisplay() {
    document.getElementById('currentUsage').textContent = currentUsage.toFixed(2);
    document.getElementById('savings').textContent = `${efficiency.toFixed(1)}%`;
    document.getElementById('efficiency').textContent = Math.round(efficiency);
    document.getElementById('totalTokens').textContent = totalTokens;
    
    updateDataTable();
    updateAnalytics();
    updateLogsDisplay();
}

function updateDataTable() {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    
    dataPoints.slice(-10).forEach(point => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${point.time}</td>
            <td>${point.usage.toFixed(2)}</td>
            <td>${point.optimized.toFixed(2)}</td>
            <td>${point.savings.toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
    });
}

function updateAnalytics() {
    if (dataPoints.length === 0) return;
    
    const avgSavings = dataPoints.reduce((sum, p) => sum + p.savings, 0) / dataPoints.length;
    const peakEfficiency = Math.max(...dataPoints.map(p => p.savings));
    const totalRequests = dataPoints.length;
    
    document.getElementById('avgSavings').textContent = `${avgSavings.toFixed(1)}%`;
    document.getElementById('peakEfficiency').textContent = peakEfficiency.toFixed(1);
    document.getElementById('totalRequests').textContent = totalRequests;
}

// Logging
function log(message, level = 'info') {
    if (!shouldLog(level)) return;
    
    const timestamp = new Date().toLocaleString();
    logs.push({ timestamp, message, level });
    
    if (logs.length > 1000) logs.shift();
    
    updateLogsDisplay();
}

function shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentIndex = levels.indexOf(settings.logLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex <= currentIndex;
}

function updateLogsDisplay() {
    const container = document.getElementById('logContainer');
    const filter = logFilter.value.toLowerCase();
    
    const filteredLogs = logs.filter(log => 
        log.message.toLowerCase().includes(filter) || 
        log.level.toLowerCase().includes(filter)
    );
    
    container.innerHTML = filteredLogs.slice(-50).map(log => 
        `<div class="log-entry log-${log.level}">[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}</div>`
    ).join('');
    
    container.scrollTop = container.scrollHeight;
}

function clearLogs() {
    logs = [];
    updateLogsDisplay();
    log('Logs cleared', 'info');
}

function exportLogs() {
    const csv = logs.map(log => `${log.timestamp},${log.level},${log.message}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimization_logs.csv';
    a.click();
    URL.revokeObjectURL(url);
    log('Logs exported', 'info');
}

function filterLogs() {
    updateLogsDisplay();
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize with some sample data
function initializeSampleData() {
    for (let i = 0; i < 10; i++) {
        dataPoints.push({
            time: new Date(Date.now() - (10 - i) * 60000).toLocaleTimeString(),
            usage: Math.random() * 200,
            optimized: Math.random() * 50,
            savings: Math.random() * 100
        });
    }
    updateDisplay();
}

// Call initialization
initializeSampleData();

// Additional features
function addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    showSection('monitor');
                    break;
                case '2':
                    e.preventDefault();
                    showSection('settings');
                    break;
                case '3':
                    e.preventDefault();
                    showSection('logs');
                    break;
                case '4':
                    e.preventDefault();
                    showSection('analytics');
                    break;
                case '5':
                    e.preventDefault();
                    showSection('help');
                    break;
            }
        }
    });
}

addKeyboardShortcuts();

// Performance monitoring
function monitorPerformance() {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`, 'debug');
    }
}

monitorPerformance();

// Error handling
window.addEventListener('error', (e) => {
    log(`JavaScript error: ${e.message} at ${e.filename}:${e.lineno}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    log(`Unhandled promise rejection: ${e.reason}`, 'error');
});

// Accessibility improvements
function improveAccessibility() {
    // Add ARIA labels
    document.querySelectorAll('button').forEach(btn => {
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent);
        }
    });
    
    // Improve focus management
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Ensure focus is visible
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

improveAccessibility();

// Theme switching (future enhancement)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

loadTheme();

// Export functionality for settings
function exportSettings() {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimization_settings.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                settings = { ...settings, ...imported };
                updateSettingsForm();
                log('Settings imported', 'info');
            } catch (error) {
                log('Failed to import settings', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Add export/import buttons to settings
const exportBtn = document.createElement('button');
exportBtn.textContent = 'Export Settings';
exportBtn.addEventListener('click', exportSettings);
settingsForm.appendChild(exportBtn);

const importBtn = document.createElement('button');
importBtn.textContent = 'Import Settings';
importBtn.type = 'button';
importBtn.addEventListener('click', importSettings);
settingsForm.appendChild(importBtn);

// Final initialization log
log('Adaptive Token Optimization Controller fully loaded', 'info');