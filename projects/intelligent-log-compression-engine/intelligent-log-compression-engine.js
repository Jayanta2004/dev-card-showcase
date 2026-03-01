// Intelligent Log Compression Engine - JavaScript

class LogCompressionEngine {
    constructor() {
        this.compressionHistory = [];
        this.settings = {
            autoCompress: false,
            realTimeAnalytics: true,
            maxHistory: 100,
            defaultAlgorithm: 'intelligent',
            defaultLevel: 6
        };
        this.charts = {};
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
        this.loadHistory();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.getAttribute('href').substring(1));
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Compression
        document.getElementById('compress-btn').addEventListener('click', () => {
            this.compressLogs();
        });

        document.getElementById('file-input').addEventListener('change', (e) => {
            this.loadFile(e.target.files[0]);
        });

        document.getElementById('level-slider').addEventListener('input', (e) => {
            document.getElementById('level-value').textContent = e.target.value;
        });

        // Output controls
        document.getElementById('copy-output').addEventListener('click', () => {
            this.copyOutput();
        });

        document.getElementById('download-output').addEventListener('click', () => {
            this.downloadOutput();
        });

        document.getElementById('clear-output').addEventListener('click', () => {
            this.clearOutput();
        });

        // Pattern analysis
        document.getElementById('analyze-patterns').addEventListener('click', () => {
            this.analyzePatterns();
        });

        document.getElementById('export-patterns').addEventListener('click', () => {
            this.exportPatterns();
        });

        // Settings
        document.getElementById('auto-compress').addEventListener('change', (e) => {
            this.settings.autoCompress = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('real-time-analytics').addEventListener('change', (e) => {
            this.settings.realTimeAnalytics = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('max-history').addEventListener('change', (e) => {
            this.settings.maxHistory = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('default-algorithm').addEventListener('change', (e) => {
            this.settings.defaultAlgorithm = e.target.value;
            this.saveSettings();
        });

        document.getElementById('default-level').addEventListener('input', (e) => {
            this.settings.defaultLevel = parseInt(e.target.value);
            document.getElementById('default-level-value').textContent = e.target.value;
            this.saveSettings();
        });

        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('export-settings').addEventListener('click', () => {
            this.exportSettings();
        });

        document.getElementById('import-settings').addEventListener('click', () => {
            this.importSettings();
        });

        // Auto-compress on input
        document.getElementById('log-input').addEventListener('input', () => {
            if (this.settings.autoCompress) {
                setTimeout(() => this.compressLogs(), 500);
            }
        });
    }

    switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('logCompressionSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }

        // Apply settings to UI
        document.getElementById('auto-compress').checked = this.settings.autoCompress;
        document.getElementById('real-time-analytics').checked = this.settings.realTimeAnalytics;
        document.getElementById('max-history').value = this.settings.maxHistory;
        document.getElementById('default-algorithm').value = this.settings.defaultAlgorithm;
        document.getElementById('default-level').value = this.settings.defaultLevel;
        document.getElementById('default-level-value').textContent = this.settings.defaultLevel;
    }

    saveSettings() {
        localStorage.setItem('logCompressionSettings', JSON.stringify(this.settings));
    }

    initializeCharts() {
        // Compression chart
        const compressionCtx = document.getElementById('compression-chart').getContext('2d');
        this.charts.compression = new Chart(compressionCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Compression Ratio (%)',
                    data: [],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });

        // Trends chart
        const trendsCtx = document.getElementById('trends-chart').getContext('2d');
        this.charts.trends = new Chart(trendsCtx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Average Compression',
                    data: [65, 72, 68, 75],
                    backgroundColor: '#10b981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Distribution chart
        const distributionCtx = document.getElementById('distribution-chart').getContext('2d');
        this.charts.distribution = new Chart(distributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Application Logs', 'System Logs', 'Error Logs', 'Access Logs'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Performance chart
        const performanceCtx = document.getElementById('performance-chart').getContext('2d');
        this.charts.performance = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Processing Time (ms)',
                    data: [],
                    borderColor: '#f59e0b',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Savings chart
        const savingsCtx = document.getElementById('savings-chart').getContext('2d');
        this.charts.savings = new Chart(savingsCtx, {
            type: 'area',
            data: {
                labels: [],
                datasets: [{
                    label: 'Space Saved (MB)',
                    data: [],
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Error patterns chart
        const errorPatternsCtx = document.getElementById('error-patterns-chart').getContext('2d');
        this.charts.errorPatterns = new Chart(errorPatternsCtx, {
            type: 'bar',
            data: {
                labels: ['NullPointerException', 'IOException', 'Timeout', 'ValidationError'],
                datasets: [{
                    label: 'Occurrences',
                    data: [12, 8, 5, 3],
                    backgroundColor: '#ef4444'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Frequency chart
        const frequencyCtx = document.getElementById('frequency-chart').getContext('2d');
        this.charts.frequency = new Chart(frequencyCtx, {
            type: 'radar',
            data: {
                labels: ['INFO', 'WARN', 'ERROR', 'DEBUG', 'TRACE'],
                datasets: [{
                    label: 'Log Level Frequency',
                    data: [45, 20, 15, 10, 5],
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async compressLogs() {
        const input = document.getElementById('log-input').value;
        if (!input.trim()) {
            alert('Please enter log data to compress.');
            return;
        }

        this.showLoading();

        const algorithm = document.getElementById('algorithm-select').value;
        const level = parseInt(document.getElementById('level-slider').value);
        const preserveTimestamps = document.getElementById('preserve-timestamps').checked;
        const removeDuplicates = document.getElementById('remove-duplicates').checked;

        const startTime = Date.now();

        try {
            let processedInput = input;

            // Pre-processing
            if (removeDuplicates) {
                processedInput = this.removeDuplicateLines(processedInput);
            }

            if (preserveTimestamps) {
                processedInput = this.extractAndPreserveTimestamps(processedInput);
            }

            // Compression
            const compressed = await this.compressData(processedInput, algorithm, level);
            const endTime = Date.now();
            const processingTime = endTime - startTime;

            // Update UI
            document.getElementById('compressed-output').value = compressed;
            document.getElementById('original-size').textContent = `${input.length} bytes`;
            document.getElementById('compressed-size').textContent = `${compressed.length} bytes`;
            const ratio = ((1 - compressed.length / input.length) * 100).toFixed(2);
            document.getElementById('compression-ratio').textContent = `${ratio}%`;
            document.getElementById('processing-time').textContent = `${processingTime} ms`;

            // Record in history
            this.addToHistory({
                timestamp: new Date().toISOString(),
                algorithm,
                originalSize: input.length,
                compressedSize: compressed.length,
                ratio: parseFloat(ratio),
                time: processingTime
            });

            // Update dashboard
            this.updateDashboard();

        } catch (error) {
            console.error('Compression error:', error);
            alert('An error occurred during compression. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async compressData(data, algorithm, level) {
        switch (algorithm) {
            case 'intelligent':
                return this.intelligentCompression(data, level);
            case 'lz77':
                return this.lz77Compression(data, level);
            case 'huffman':
                return this.huffmanCompression(data, level);
            case 'deflate':
                return this.deflateCompression(data, level);
            default:
                return this.intelligentCompression(data, level);
        }
    }

    intelligentCompression(data, level) {
        // Intelligent compression that adapts based on data characteristics
        let compressed = data;

        // Remove common log prefixes
        compressed = compressed.replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d{3})? \[[^\]]+\] /gm, '');

        // Compress repeated patterns
        compressed = this.compressRepeatedPatterns(compressed);

        // Apply level-based compression
        if (level > 6) {
            compressed = this.aggressiveCompression(compressed);
        }

        // Add compression metadata
        const metadata = `COMPRESSED:${Date.now()}:${level}:`;
        return metadata + btoa(compressed);
    }

    lz77Compression(data, level) {
        // Simplified LZ77 implementation
        const windowSize = Math.min(32768, data.length);
        const lookaheadSize = Math.min(258, data.length);
        let compressed = '';
        let i = 0;

        while (i < data.length) {
            let bestMatch = { length: 0, distance: 0 };
            const start = Math.max(0, i - windowSize);

            for (let j = start; j < i; j++) {
                let length = 0;
                while (length < lookaheadSize && i + length < data.length && data[j + length] === data[i + length]) {
                    length++;
                }
                if (length > bestMatch.length) {
                    bestMatch = { length, distance: i - j };
                }
            }

            if (bestMatch.length >= 3) {
                compressed += `<${bestMatch.distance},${bestMatch.length}>`;
                i += bestMatch.length;
            } else {
                compressed += data[i];
                i++;
            }
        }

        return `LZ77:${level}:` + btoa(compressed);
    }

    huffmanCompression(data, level) {
        // Simplified Huffman coding
        const frequency = {};
        for (let char of data) {
            frequency[char] = (frequency[char] || 0) + 1;
        }

        // Build Huffman tree (simplified)
        const codes = {};
        let code = 0;
        for (let char in frequency) {
            codes[char] = code.toString(2).padStart(8, '0');
            code++;
        }

        let compressed = '';
        for (let char of data) {
            compressed += codes[char];
        }

        const codeTable = JSON.stringify(codes);
        return `HUFFMAN:${level}:${btoa(codeTable)}:` + btoa(compressed);
    }

    deflateCompression(data, level) {
        // Use built-in compression if available, otherwise fallback
        try {
            // In a real implementation, this would use pako or similar
            // For demo purposes, we'll use a simple compression
            return `DEFLATE:${level}:` + btoa(data.split('').reverse().join(''));
        } catch (e) {
            return this.intelligentCompression(data, level);
        }
    }

    compressRepeatedPatterns(data) {
        const lines = data.split('\n');
        const patternCounts = {};

        // Count repeated patterns
        lines.forEach(line => {
            const pattern = line.replace(/\d+/g, 'N').replace(/[a-f0-9]{8,}/gi, 'HEX');
            patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
        });

        // Replace repeated patterns
        let compressed = data;
        let patternId = 0;
        const patterns = {};

        Object.entries(patternCounts).forEach(([pattern, count]) => {
            if (count > 2 && pattern.length > 20) {
                const id = `PATTERN_${patternId++}`;
                patterns[id] = pattern;
                compressed = compressed.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), id);
            }
        });

        if (Object.keys(patterns).length > 0) {
            compressed = JSON.stringify(patterns) + '\n---PATTERNS---\n' + compressed;
        }

        return compressed;
    }

    aggressiveCompression(data) {
        // Remove extra whitespace
        let compressed = data.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n');

        // Compress numbers
        compressed = compressed.replace(/\b\d+\b/g, (match) => {
            const num = parseInt(match);
            if (num < 256) return String.fromCharCode(num + 256);
            return match;
        });

        return compressed;
    }

    removeDuplicateLines(data) {
        const lines = data.split('\n');
        const uniqueLines = [...new Set(lines)];
        return uniqueLines.join('\n');
    }

    extractAndPreserveTimestamps(data) {
        const timestampRegex = /(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{3})?)/g;
        const timestamps = [];
        let match;

        while ((match = timestampRegex.exec(data)) !== null) {
            timestamps.push(match[1]);
        }

        // Remove timestamps from data
        const dataWithoutTimestamps = data.replace(timestampRegex, 'TIMESTAMP_PLACEHOLDER');

        return JSON.stringify(timestamps) + '\n---TIMESTAMPS---\n' + dataWithoutTimestamps;
    }

    addToHistory(entry) {
        this.compressionHistory.unshift(entry);
        if (this.compressionHistory.length > this.settings.maxHistory) {
            this.compressionHistory = this.compressionHistory.slice(0, this.settings.maxHistory);
        }
        this.saveHistory();
        this.updateHistoryTable();
    }

    saveHistory() {
        localStorage.setItem('compressionHistory', JSON.stringify(this.compressionHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('compressionHistory');
        if (saved) {
            this.compressionHistory = JSON.parse(saved);
            this.updateHistoryTable();
        }
    }

    updateHistoryTable() {
        const tbody = document.querySelector('#compression-history tbody');
        tbody.innerHTML = '';

        this.compressionHistory.slice(0, 10).forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(entry.timestamp).toLocaleString()}</td>
                <td>${entry.algorithm}</td>
                <td>${this.formatBytes(entry.originalSize)}</td>
                <td>${this.formatBytes(entry.compressedSize)}</td>
                <td>${entry.ratio.toFixed(2)}%</td>
                <td>${entry.time}ms</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateDashboard() {
        const totalLogs = this.compressionHistory.length;
        const avgCompression = totalLogs > 0 ?
            (this.compressionHistory.reduce((sum, entry) => sum + entry.ratio, 0) / totalLogs).toFixed(2) : 0;
        const spaceSaved = this.compressionHistory.reduce((sum, entry) => sum + (entry.originalSize - entry.compressedSize), 0);
        const avgTime = totalLogs > 0 ?
            (this.compressionHistory.reduce((sum, entry) => sum + entry.time, 0) / totalLogs).toFixed(0) : 0;

        document.getElementById('total-logs').textContent = totalLogs;
        document.getElementById('avg-compression').textContent = `${avgCompression}%`;
        document.getElementById('space-saved').textContent = this.formatBytes(spaceSaved);
        document.getElementById('processing-speed').textContent = avgTime > 0 ? `${(1000 / avgTime * 1024 * 1024).toFixed(0)} MB/s` : '0 MB/s';

        // Update charts
        this.updateCharts();
    }

    updateCharts() {
        if (this.compressionHistory.length > 0) {
            const recent = this.compressionHistory.slice(0, 20).reverse();
            this.charts.compression.data.labels = recent.map((_, i) => `Compression ${i + 1}`);
            this.charts.compression.data.datasets[0].data = recent.map(entry => entry.ratio);
            this.charts.compression.update();

            this.charts.performance.data.labels = recent.map((_, i) => `Compression ${i + 1}`);
            this.charts.performance.data.datasets[0].data = recent.map(entry => entry.time);
            this.charts.performance.update();

            this.charts.savings.data.labels = recent.map((_, i) => `Compression ${i + 1}`);
            this.charts.savings.data.datasets[0].data = recent.map(entry => entry.originalSize - entry.compressedSize);
            this.charts.savings.update();
        }
    }

    loadFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('log-input').value = e.target.result;
            if (this.settings.autoCompress) {
                setTimeout(() => this.compressLogs(), 500);
            }
        };
        reader.readAsText(file);
    }

    copyOutput() {
        const output = document.getElementById('compressed-output');
        output.select();
        document.execCommand('copy');
        this.showNotification('Output copied to clipboard!');
    }

    downloadOutput() {
        const output = document.getElementById('compressed-output').value;
        if (!output) {
            alert('No compressed output to download.');
            return;
        }

        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_logs_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearOutput() {
        document.getElementById('compressed-output').value = '';
        document.getElementById('original-size').textContent = '0 bytes';
        document.getElementById('compressed-size').textContent = '0 bytes';
        document.getElementById('compression-ratio').textContent = '0%';
        document.getElementById('processing-time').textContent = '0 ms';
    }

    analyzePatterns() {
        const input = document.getElementById('log-input').value;
        if (!input) {
            alert('Please enter log data to analyze.');
            return;
        }

        // Simple pattern analysis
        const lines = input.split('\n');
        const errorPatterns = {};
        const logLevels = { INFO: 0, WARN: 0, ERROR: 0, DEBUG: 0, TRACE: 0 };

        lines.forEach(line => {
            // Count log levels
            if (line.includes('INFO')) logLevels.INFO++;
            else if (line.includes('WARN')) logLevels.WARN++;
            else if (line.includes('ERROR')) logLevels.ERROR++;
            else if (line.includes('DEBUG')) logLevels.DEBUG++;
            else if (line.includes('TRACE')) logLevels.TRACE++;

            // Extract error patterns
            const errorMatch = line.match(/ERROR[:\s]+([^\s]+)/);
            if (errorMatch) {
                const error = errorMatch[1];
                errorPatterns[error] = (errorPatterns[error] || 0) + 1;
            }
        });

        // Update error patterns chart
        const errorLabels = Object.keys(errorPatterns);
        const errorData = Object.values(errorPatterns);
        this.charts.errorPatterns.data.labels = errorLabels;
        this.charts.errorPatterns.data.datasets[0].data = errorData;
        this.charts.errorPatterns.update();

        // Update frequency chart
        this.charts.frequency.data.datasets[0].data = Object.values(logLevels);
        this.charts.frequency.update();

        // Update anomaly list
        const anomalyList = document.getElementById('anomaly-list');
        anomalyList.innerHTML = '';

        Object.entries(errorPatterns).forEach(([error, count]) => {
            if (count > 5) { // Arbitrary threshold
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${error}</span>
                    <span class="count">${count} occurrences</span>
                `;
                anomalyList.appendChild(li);
            }
        });

        this.showNotification('Pattern analysis complete!');
    }

    exportPatterns() {
        const data = {
            errorPatterns: this.charts.errorPatterns.data,
            frequency: this.charts.frequency.data,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pattern_analysis_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all compression history?')) {
            this.compressionHistory = [];
            this.saveHistory();
            this.updateHistoryTable();
            this.updateDashboard();
            this.showNotification('History cleared!');
        }
    }

    exportSettings() {
        const data = {
            settings: this.settings,
            history: this.compressionHistory,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compression_settings_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.settings) {
                        this.settings = { ...this.settings, ...data.settings };
                        this.saveSettings();
                        this.loadSettings();
                    }
                    if (data.history) {
                        this.compressionHistory = data.history;
                        this.saveHistory();
                        this.updateHistoryTable();
                        this.updateDashboard();
                    }
                    this.showNotification('Settings imported successfully!');
                } catch (error) {
                    alert('Invalid settings file.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showLoading() {
        document.getElementById('loading-modal').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loading-modal').classList.remove('active');
    }

    showNotification(message) {
        // Simple notification - in a real app, you'd use a proper notification system
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new LogCompressionEngine();
});