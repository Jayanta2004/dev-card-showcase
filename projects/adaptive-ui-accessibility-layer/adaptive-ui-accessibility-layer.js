/**
 * Adaptive UI Accessibility Layer #5063
 * A comprehensive accessibility enhancement tool with adaptive features
 */

class AdaptiveUIAccessibilityLayer {
    constructor() {
        this.version = '1.0.0';
        this.scanResults = [];
        this.analyticsData = [];
        this.userPreferences = {};
        this.adaptationHistory = [];
        this.currentSimulation = null;
        this.voiceRecognition = null;
        this.isScanning = false;
        this.isSimulating = false;

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
        this.loadSettings();
        this.initializeVoiceControl();
        this.addSkipLinks();
    }

    loadData() {
        // Load data from localStorage
        this.scanResults = JSON.parse(localStorage.getItem('accessibility-scan-results') || '[]');
        this.analyticsData = JSON.parse(localStorage.getItem('accessibility-analytics') || '[]');
        this.userPreferences = JSON.parse(localStorage.getItem('accessibility-preferences') || '{}');
        this.adaptationHistory = JSON.parse(localStorage.getItem('adaptation-history') || '[]');
    }

    saveData() {
        localStorage.setItem('accessibility-scan-results', JSON.stringify(this.scanResults));
        localStorage.setItem('accessibility-analytics', JSON.stringify(this.analyticsData));
        localStorage.setItem('accessibility-preferences', JSON.stringify(this.userPreferences));
        localStorage.setItem('adaptation-history', JSON.stringify(this.adaptationHistory));
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
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Accessibility toggle
        document.getElementById('accessibility-toggle').addEventListener('click', () => this.toggleAccessibilityMode());

        // Export functionality
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());

        // Dashboard actions
        document.getElementById('quick-scan').addEventListener('click', () => this.startQuickScan());
        document.getElementById('auto-fix').addEventListener('click', () => this.applyAutoFixes());
        document.getElementById('generate-report').addEventListener('click', () => this.generateReport());

        // Scanner controls
        document.getElementById('start-scan').addEventListener('click', () => this.startAccessibilityScan());
        document.getElementById('stop-scan').addEventListener('click', () => this.stopScan());

        // Adaptor controls
        document.getElementById('user-disability').addEventListener('change', (e) => this.updateUserProfile(e.target.value));
        document.getElementById('auto-adapt').addEventListener('change', (e) => this.toggleAutoAdapt(e.target.checked));
        document.getElementById('voice-control').addEventListener('change', (e) => this.toggleVoiceControl(e.target.checked));

        // Adaptation buttons
        document.querySelectorAll('.adaptation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyAdaptation(e.target.id));
        });

        // Simulator controls
        document.getElementById('start-simulation').addEventListener('click', () => this.startSimulation());
        document.getElementById('stop-simulation').addEventListener('click', () => this.stopSimulation());
        document.getElementById('reset-simulation').addEventListener('click', () => this.resetSimulation());

        document.querySelectorAll('.sim-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectSimulationMode(e.target.id));
        });

        // Analytics controls
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeTimeRange(e.target.dataset.range));
        });

        document.querySelectorAll('.metric-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.changeMetric(e.target.dataset.metric));
        });

        // Settings
        document.getElementById('export-data').addEventListener('click', () => this.exportData());
        document.getElementById('import-data').addEventListener('click', () => this.importData());
        document.getElementById('clear-history').addEventListener('click', () => this.clearHistory());
        document.getElementById('reset-settings').addEventListener('click', () => this.resetSettings());

        // Voice control modal
        document.getElementById('close-voice-modal').addEventListener('click', () => this.closeVoiceModal());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    switchSection(sectionId) {
        // Update active section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');

        // Update URL hash
        window.location.hash = sectionId;

        this.logActivity('navigation', `Switched to ${sectionId} section`);
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.logActivity('adaptation', `Theme changed to ${isDark ? 'dark' : 'light'}`);
    }

    toggleAccessibilityMode() {
        document.body.classList.toggle('accessibility-mode');
        const isEnabled = document.body.classList.contains('accessibility-mode');
        this.logActivity('adaptation', `Accessibility mode ${isEnabled ? 'enabled' : 'disabled'}`);
    }

    updateDashboard() {
        // Calculate metrics
        const recentScans = this.scanResults.slice(-10);
        const avgScore = recentScans.length > 0 ?
            recentScans.reduce((sum, scan) => sum + scan.score, 0) / recentScans.length : 0;

        const totalIssues = this.scanResults.reduce((sum, scan) => sum + scan.issues.length, 0);
        const complianceLevel = this.calculateComplianceLevel(avgScore);

        // Update metrics
        document.getElementById('accessibility-score').textContent = `${Math.round(avgScore)}%`;
        document.getElementById('issues-count').textContent = totalIssues;
        document.getElementById('compliance-level').textContent = complianceLevel;
        document.getElementById('users-assisted').textContent = this.adaptationHistory.length;

        // Update activity log
        this.updateActivityLog();
    }

    calculateComplianceLevel(score) {
        if (score >= 95) return 'AAA';
        if (score >= 90) return 'AA';
        if (score >= 85) return 'A';
        return 'F';
    }

    updateActivityLog() {
        const logContainer = document.getElementById('activity-log');
        logContainer.innerHTML = '';

        const recentActivities = this.adaptationHistory.slice(-5).reverse();

        recentActivities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';

            const iconClass = this.getActivityIcon(activity.type);
            const timeAgo = this.getTimeAgo(activity.timestamp);

            activityItem.innerHTML = `
                <div class="activity-icon ${iconClass}">${this.getActivityEmoji(activity.type)}</div>
                <div class="activity-content">
                    <h4>${activity.action}</h4>
                    <p>${activity.details || ''}</p>
                </div>
                <div class="activity-time">${timeAgo}</div>
            `;

            logContainer.appendChild(activityItem);
        });

        if (recentActivities.length === 0) {
            logContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">No recent activity</p>';
        }
    }

    getActivityIcon(type) {
        const icons = {
            'scan': 'success',
            'adaptation': 'info',
            'simulation': 'warning',
            'navigation': 'info',
            'export': 'success'
        };
        return icons[type] || 'info';
    }

    getActivityEmoji(type) {
        const emojis = {
            'scan': '🔍',
            'adaptation': '🎯',
            'simulation': '👁️',
            'navigation': '📊',
            'export': '📤'
        };
        return emojis[type] || '📝';
    }

    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    async startAccessibilityScan() {
        if (this.isScanning) return;

        this.isScanning = true;
        this.updateScanButton(true);

        const scanOptions = this.getScanOptions();
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const issuesList = document.getElementById('issues-list');

        issuesList.innerHTML = '';
        progressBar.style.width = '0%';
        progressText.textContent = 'Initializing scan...';

        try {
            const results = await this.performAccessibilityScan(scanOptions, (progress, status) => {
                progressBar.style.width = `${progress}%`;
                progressText.textContent = status;
            });

            this.displayScanResults(results);
            this.saveScanResults(results);
            this.updateDashboard();
            this.logActivity('scan', `Completed accessibility scan with ${results.issues.length} issues found`);

        } catch (error) {
            console.error('Scan failed:', error);
            progressText.textContent = 'Scan failed';
            this.logActivity('scan', 'Accessibility scan failed');
        } finally {
            this.isScanning = false;
            this.updateScanButton(false);
        }
    }

    getScanOptions() {
        return {
            contrast: document.getElementById('scan-contrast').checked,
            altText: document.getElementById('scan-alt-text').checked,
            keyboard: document.getElementById('scan-keyboard').checked,
            semantic: document.getElementById('scan-semantic').checked,
            forms: document.getElementById('scan-forms').checked,
            motion: document.getElementById('scan-motion').checked
        };
    }

    async performAccessibilityScan(options, progressCallback) {
        const issues = [];
        let progress = 0;

        // Simulate scanning process
        const scanSteps = [
            { name: 'Analyzing page structure...', weight: 20 },
            { name: 'Checking color contrast...', weight: 15 },
            { name: 'Validating alt text...', weight: 15 },
            { name: 'Testing keyboard navigation...', weight: 15 },
            { name: 'Reviewing semantic HTML...', weight: 15 },
            { name: 'Checking forms...', weight: 10 },
            { name: 'Analyzing motion and animations...', weight: 10 }
        ];

        for (const step of scanSteps) {
            progressCallback(progress, step.name);
            await this.delay(500); // Simulate processing time

            if (options.contrast && step.name.includes('color contrast')) {
                issues.push(...this.checkColorContrast());
            }
            if (options.altText && step.name.includes('alt text')) {
                issues.push(...this.checkAltText());
            }
            if (options.keyboard && step.name.includes('keyboard')) {
                issues.push(...this.checkKeyboardNavigation());
            }
            if (options.semantic && step.name.includes('semantic')) {
                issues.push(...this.checkSemanticHTML());
            }
            if (options.forms && step.name.includes('forms')) {
                issues.push(...this.checkForms());
            }
            if (options.motion && step.name.includes('motion')) {
                issues.push(...this.checkMotion());
            }

            progress += step.weight;
        }

        progressCallback(100, 'Scan complete');

        const score = Math.max(0, 100 - (issues.length * 5));
        return { issues, score, timestamp: Date.now() };
    }

    checkColorContrast() {
        const issues = [];
        // Simplified contrast checking - in real implementation, would use color analysis
        const elements = document.querySelectorAll('*');
        elements.forEach((el, index) => {
            const style = window.getComputedStyle(el);
            const bgColor = style.backgroundColor;
            const color = style.color;

            // Basic check for transparent or similar colors
            if (bgColor === 'rgba(0, 0, 0, 0)' && color === 'rgb(0, 0, 0)') {
                issues.push({
                    id: `contrast-${index}`,
                    type: 'contrast',
                    severity: 'warning',
                    title: 'Potential contrast issue',
                    description: 'Element may have insufficient color contrast',
                    location: this.getElementPath(el),
                    suggestion: 'Ensure text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)'
                });
            }
        });
        return issues;
    }

    checkAltText() {
        const issues = [];
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
            if (!img.getAttribute('alt') || img.getAttribute('alt').trim() === '') {
                issues.push({
                    id: `alt-${index}`,
                    type: 'alt-text',
                    severity: 'critical',
                    title: 'Missing alt text',
                    description: 'Image is missing alternative text',
                    location: this.getElementPath(img),
                    suggestion: 'Add descriptive alt text that conveys the image\'s purpose or content'
                });
            }
        });
        return issues;
    }

    checkKeyboardNavigation() {
        const issues = [];
        const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');

        interactiveElements.forEach((el, index) => {
            const tabindex = el.getAttribute('tabindex');
            if (tabindex && parseInt(tabindex) < 0 && !['button', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase())) {
                return; // Skip elements that should be focusable
            }

            // Check if element is visible
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                issues.push({
                    id: `keyboard-${index}`,
                    type: 'keyboard',
                    severity: 'warning',
                    title: 'Hidden interactive element',
                    description: 'Interactive element may not be accessible via keyboard',
                    location: this.getElementPath(el),
                    suggestion: 'Ensure interactive elements are visible and reachable via keyboard navigation'
                });
            }
        });
        return issues;
    }

    checkSemanticHTML() {
        const issues = [];
        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            if (level - lastLevel > 1 && lastLevel !== 0) {
                issues.push({
                    id: `heading-${index}`,
                    type: 'semantic',
                    severity: 'warning',
                    title: 'Skipped heading level',
                    description: `Heading level ${level} follows level ${lastLevel}`,
                    location: this.getElementPath(heading),
                    suggestion: 'Use sequential heading levels (h1 → h2 → h3, etc.)'
                });
            }
            lastLevel = level;
        });

        // Check for missing landmarks
        const landmarks = document.querySelectorAll('[role="main"], main, [role="navigation"], nav, [role="complementary"], aside');
        if (landmarks.length === 0) {
            issues.push({
                id: 'landmarks-missing',
                type: 'semantic',
                severity: 'info',
                title: 'Missing ARIA landmarks',
                description: 'Page may benefit from ARIA landmark roles',
                location: 'document',
                suggestion: 'Add main, navigation, and complementary landmarks using role attributes or semantic elements'
            });
        }

        return issues;
    }

    checkForms() {
        const issues = [];
        const forms = document.querySelectorAll('form');
        const inputs = document.querySelectorAll('input, select, textarea');

        inputs.forEach((input, index) => {
            // Check for labels
            const label = document.querySelector(`label[for="${input.id}"]`) ||
                         input.closest('label') ||
                         document.querySelector(`label[for="${input.name}"]`);

            if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
                issues.push({
                    id: `form-${index}`,
                    type: 'forms',
                    severity: 'critical',
                    title: 'Form field without label',
                    description: 'Form input is missing an associated label',
                    location: this.getElementPath(input),
                    suggestion: 'Add a label element with for attribute, or use aria-label/aria-labelledby'
                });
            }

            // Check for required fields
            if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
                issues.push({
                    id: `required-${index}`,
                    type: 'forms',
                    severity: 'warning',
                    title: 'Required field not announced',
                    description: 'Required form field should be announced to screen readers',
                    location: this.getElementPath(input),
                    suggestion: 'Add aria-required="true" to required form fields'
                });
            }
        });

        return issues;
    }

    checkMotion() {
        const issues = [];
        // Check for elements with CSS animations that may cause motion sickness
        const animatedElements = document.querySelectorAll('*[style*="animation"], *[style*="transition"]');

        animatedElements.forEach((el, index) => {
            const style = window.getComputedStyle(el);
            if (style.animationName !== 'none' || style.transitionProperty !== 'none') {
                // Check if element has reduced motion media query consideration
                const hasReducedMotion = style.animationName.includes('reduced') ||
                                       el.hasAttribute('data-reduced-motion');

                if (!hasReducedMotion) {
                    issues.push({
                        id: `motion-${index}`,
                        type: 'motion',
                        severity: 'info',
                        title: 'Animation may affect users',
                        description: 'Element has animation that may cause motion sickness',
                        location: this.getElementPath(el),
                        suggestion: 'Consider respecting prefers-reduced-motion media query'
                    });
                }
            }
        });

        return issues;
    }

    getElementPath(element) {
        const path = [];
        let current = element;

        while (current && current.nodeType === Node.ELEMENT_NODE) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break;
            } else if (current.className) {
                selector += `.${current.className.split(' ').join('.')}`;
            }

            // Add nth-child if needed
            const siblings = Array.from(current.parentNode?.children || []);
            const index = siblings.indexOf(current);
            if (siblings.length > 1) {
                selector += `:nth-child(${index + 1})`;
            }

            path.unshift(selector);
            current = current.parentNode;
        }

        return path.slice(0, 3).join(' > '); // Limit depth for readability
    }

    displayScanResults(results) {
        const issuesList = document.getElementById('issues-list');
        issuesList.innerHTML = '';

        if (results.issues.length === 0) {
            issuesList.innerHTML = '<p style="text-align: center; color: var(--success-color); padding: 2rem;">🎉 No accessibility issues found!</p>';
            return;
        }

        results.issues.forEach(issue => {
            const issueElement = document.createElement('div');
            issueElement.className = `issue-item ${issue.severity}`;

            issueElement.innerHTML = `
                <div class="issue-header">
                    <div class="issue-title">${issue.title}</div>
                    <div class="issue-severity ${issue.severity}">${issue.severity}</div>
                </div>
                <div class="issue-description">${issue.description}</div>
                <div class="issue-location">📍 ${issue.location}</div>
                <div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">
                    💡 ${issue.suggestion}
                </div>
            `;

            issuesList.appendChild(issueElement);
        });
    }

    saveScanResults(results) {
        this.scanResults.push(results);
        // Keep only last 100 scans
        if (this.scanResults.length > 100) {
            this.scanResults = this.scanResults.slice(-100);
        }
        this.saveData();
    }

    stopScan() {
        this.isScanning = false;
        this.updateScanButton(false);
        document.getElementById('progress-text').textContent = 'Scan stopped';
        this.logActivity('scan', 'Accessibility scan stopped by user');
    }

    updateScanButton(isScanning) {
        const startBtn = document.getElementById('start-scan');
        const stopBtn = document.getElementById('stop-scan');

        if (isScanning) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }

    updateUserProfile(disability) {
        this.userPreferences.disability = disability;
        this.saveData();

        // Auto-apply adaptations based on disability
        if (this.userPreferences.autoAdapt) {
            this.applyDisabilityAdaptations(disability);
        }

        this.logActivity('adaptation', `User profile updated: ${disability}`);
    }

    applyDisabilityAdaptations(disability) {
        switch (disability) {
            case 'visual':
                this.applyAdaptation('high-contrast');
                this.applyAdaptation('large-text');
                break;
            case 'motor':
                this.applyAdaptation('large-click');
                this.applyAdaptation('sticky-keys');
                break;
            case 'cognitive':
                this.applyAdaptation('simplify-content');
                this.applyAdaptation('progress-indicators');
                break;
        }
    }

    toggleAutoAdapt(enabled) {
        this.userPreferences.autoAdapt = enabled;
        this.saveData();
        this.logActivity('adaptation', `Auto-adapt ${enabled ? 'enabled' : 'disabled'}`);
    }

    toggleVoiceControl(enabled) {
        this.userPreferences.voiceControl = enabled;
        this.saveData();

        if (enabled) {
            this.startVoiceRecognition();
        } else {
            this.stopVoiceRecognition();
        }

        this.logActivity('adaptation', `Voice control ${enabled ? 'enabled' : 'disabled'}`);
    }

    applyAdaptation(adaptationId) {
        const previewArea = document.getElementById('preview-area');
        const body = document.body;

        switch (adaptationId) {
            case 'high-contrast':
                body.classList.toggle('high-contrast');
                previewArea.classList.toggle('high-contrast');
                break;
            case 'large-text':
                body.classList.toggle('large-text');
                previewArea.classList.toggle('large-text');
                break;
            case 'color-blind':
                this.applyColorBlindMode();
                break;
            case 'reduce-motion':
                body.classList.toggle('reduce-motion');
                break;
            case 'sticky-keys':
                this.enableStickyKeys();
                break;
            case 'large-click':
                this.enlargeClickAreas();
                break;
            case 'keyboard-nav':
                this.enableKeyboardNavigation();
                break;
            case 'voice-input':
                this.enableVoiceInput();
                break;
            case 'simplify-content':
                this.simplifyContent();
                break;
            case 'highlight-focus':
                this.highlightFocus();
                break;
            case 'reduce-clutter':
                this.reduceClutter();
                break;
            case 'progress-indicators':
                this.addProgressIndicators();
                break;
        }

        // Update button state
        const button = document.getElementById(adaptationId);
        if (button) {
            button.classList.toggle('active');
        }

        this.adaptationHistory.push({
            type: 'adaptation',
            action: `Applied ${adaptationId.replace('-', ' ')} adaptation`,
            timestamp: Date.now()
        });

        this.saveData();
        this.logActivity('adaptation', `Applied ${adaptationId} adaptation`);
    }

    applyColorBlindMode() {
        // Simulate different color blindness types
        const modes = ['protanopia', 'deuteranopia', 'tritanopia'];
        const currentMode = document.body.dataset.colorBlind || '';
        const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];

        document.body.dataset.colorBlind = nextMode;
        document.getElementById('preview-area').dataset.colorBlind = nextMode;

        // Apply CSS filters for color blindness simulation
        const filters = {
            protanopia: 'grayscale(0.5) contrast(1.2)',
            deuteranopia: 'hue-rotate(90deg) saturate(0.8)',
            tritanopia: 'hue-rotate(180deg) saturate(0.7)'
        };

        document.body.style.filter = filters[nextMode] || '';
    }

    enableStickyKeys() {
        // Implement sticky keys functionality
        let pressedKeys = new Set();

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Shift' || e.key === 'Ctrl' || e.key === 'Alt') {
                pressedKeys.add(e.key);
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (pressedKeys.has(e.key)) {
                pressedKeys.delete(e.key);
            }
        });

        // Show sticky keys indicator
        this.showStickyKeysIndicator(pressedKeys);
    }

    showStickyKeysIndicator(pressedKeys) {
        let indicator = document.getElementById('sticky-keys-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'sticky-keys-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: var(--primary-color);
                color: white;
                padding: 0.5rem;
                border-radius: var(--border-radius);
                z-index: 1000;
                font-size: 0.875rem;
            `;
            document.body.appendChild(indicator);
        }

        const keys = Array.from(pressedKeys);
        indicator.textContent = keys.length > 0 ? `Sticky: ${keys.join(' + ')}` : '';
        indicator.style.display = keys.length > 0 ? 'block' : 'none';
    }

    enlargeClickAreas() {
        const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"]');

        interactiveElements.forEach(el => {
            if (!el.dataset.enlarged) {
                el.dataset.enlarged = 'true';
                const originalPadding = window.getComputedStyle(el).padding;
                el.style.padding = '1rem 2rem';
                el.style.minWidth = '44px';
                el.style.minHeight = '44px';
            }
        });
    }

    enableKeyboardNavigation() {
        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    enableVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice input is not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            this.processVoiceCommand(transcript);
        };

        recognition.start();
        this.voiceRecognition = recognition;
    }

    simplifyContent() {
        // Simplify text content
        const elements = document.querySelectorAll('p, span, div');
        elements.forEach(el => {
            if (el.textContent && el.textContent.length > 100) {
                el.dataset.originalContent = el.textContent;
                el.textContent = el.textContent.substring(0, 100) + '...';
                el.style.cursor = 'pointer';
                el.title = 'Click to expand';
                el.addEventListener('click', () => {
                    el.textContent = el.dataset.originalContent;
                });
            }
        });
    }

    highlightFocus() {
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5) !important;
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    }

    reduceClutter() {
        // Hide non-essential elements
        const nonEssential = document.querySelectorAll('.sidebar, .navbar .nav-controls, .quick-actions');
        nonEssential.forEach(el => {
            el.style.display = 'none';
        });

        // Add restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = '🔄 Restore Layout';
        restoreBtn.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 1000;
            padding: 0.5rem 1rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            cursor: pointer;
        `;
        restoreBtn.addEventListener('click', () => {
            nonEssential.forEach(el => el.style.display = '');
            restoreBtn.remove();
        });
        document.body.appendChild(restoreBtn);
    }

    addProgressIndicators() {
        // Add progress indicators to forms and long content
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            let completed = 0;

            const updateProgress = () => {
                completed = Array.from(inputs).filter(input => input.value.trim() !== '').length;
                const progress = (completed / inputs.length) * 100;

                let progressBar = form.querySelector('.progress-indicator');
                if (!progressBar) {
                    progressBar = document.createElement('div');
                    progressBar.className = 'progress-indicator';
                    progressBar.style.cssText = `
                        width: 100%;
                        height: 4px;
                        background: var(--bg-tertiary);
                        border-radius: 2px;
                        margin-bottom: 1rem;
                        overflow: hidden;
                    `;
                    const fill = document.createElement('div');
                    fill.style.cssText = `
                        height: 100%;
                        background: var(--success-color);
                        width: 0%;
                        transition: width 0.3s ease;
                    `;
                    progressBar.appendChild(fill);
                    form.insertBefore(progressBar, form.firstChild);
                }

                progressBar.firstChild.style.width = `${progress}%`;
            };

            inputs.forEach(input => {
                input.addEventListener('input', updateProgress);
                input.addEventListener('change', updateProgress);
            });

            updateProgress();
        });
    }

    selectSimulationMode(modeId) {
        // Remove active class from all simulation buttons
        document.querySelectorAll('.sim-btn').forEach(btn => btn.classList.remove('active'));

        // Add active class to selected button
        document.getElementById(modeId).classList.add('active');

        this.currentSimulation = modeId.replace('sim-', '');
    }

    startSimulation() {
        if (!this.currentSimulation) {
            alert('Please select a simulation mode first.');
            return;
        }

        this.isSimulating = true;
        this.updateSimulationButtons(true);

        document.getElementById('simulation-status').textContent = `Simulating: ${this.currentSimulation}`;
        document.getElementById('simulation-feedback').innerHTML = '';

        this.applySimulation(this.currentSimulation);
        this.logActivity('simulation', `Started ${this.currentSimulation} simulation`);
    }

    stopSimulation() {
        this.isSimulating = false;
        this.updateSimulationButtons(false);

        document.getElementById('simulation-status').textContent = 'Simulation stopped';
        this.resetSimulationEffects();
        this.logActivity('simulation', 'Simulation stopped');
    }

    resetSimulation() {
        this.currentSimulation = null;
        this.isSimulating = false;
        this.updateSimulationButtons(false);

        document.getElementById('simulation-status').textContent = 'No simulation active';
        document.getElementById('simulation-feedback').innerHTML = '';

        // Remove active class from all buttons
        document.querySelectorAll('.sim-btn').forEach(btn => btn.classList.remove('active'));

        this.resetSimulationEffects();
        this.logActivity('simulation', 'Simulation reset');
    }

    applySimulation(mode) {
        const feedback = document.getElementById('simulation-feedback');

        switch (mode) {
            case 'blindness':
                this.simulateBlindness(feedback);
                break;
            case 'low-vision':
                this.simulateLowVision(feedback);
                break;
            case 'color-blind':
                this.simulateColorBlindness(feedback);
                break;
            case 'cataracts':
                this.simulateCataracts(feedback);
                break;
            case 'parkinsons':
                this.simulateParkinsons(feedback);
                break;
            case 'tremor':
                this.simulateTremor(feedback);
                break;
            case 'dyslexia':
                this.simulateDyslexia(feedback);
                break;
            case 'adhd':
                this.simulateADHD(feedback);
                break;
        }
    }

    simulateBlindness(feedback) {
        document.body.style.filter = 'brightness(0%)';
        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>Blindness Simulation</h4>
                <p>Screen is completely black. Users rely on:</p>
                <ul>
                    <li>Screen readers (NVDA, JAWS, VoiceOver)</li>
                    <li>Braille displays</li>
                    <li>Keyboard navigation</li>
                    <li>Semantic HTML structure</li>
                </ul>
                <p><strong>Key requirements:</strong> All content must be accessible via keyboard and screen readers.</p>
            </div>
        `;
    }

    simulateLowVision(feedback) {
        document.body.style.filter = 'blur(2px) brightness(1.2)';
        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>Low Vision Simulation</h4>
                <p>Content appears blurry. Users need:</p>
                <ul>
                    <li>High contrast colors</li>
                    <li>Larger text sizes</li>
                    <li>Zoom functionality</li>
                    <li>Clear, simple layouts</li>
                </ul>
                <p><strong>Recommendation:</strong> Ensure 200% zoom doesn't break layout.</p>
            </div>
        `;
    }

    simulateColorBlindness(feedback) {
        document.body.style.filter = 'grayscale(100%) contrast(1.2)';
        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>Color Blindness Simulation</h4>
                <p>Colors are desaturated. Users cannot distinguish:</p>
                <ul>
                    <li>Red and green</li>
                    <li>Blue and yellow</li>
                    <li>Similar shades</li>
                </ul>
                <p><strong>Solution:</strong> Use patterns, shapes, and text labels in addition to color.</p>
            </div>
        `;
    }

    simulateCataracts(feedback) {
        document.body.style.filter = 'blur(3px) brightness(1.5) contrast(0.8)';
        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>Cataracts Simulation</h4>
                <p>Vision is cloudy with reduced contrast. Users benefit from:</p>
                <ul>
                    <li>High contrast themes</li>
                    <li>Bold, clear fonts</li>
                    <li>Well-lit environments</li>
                    <li>Large, spaced elements</li>
                </ul>
            </div>
        `;
    }

    simulateParkinsons(feedback) {
        // Add tremor effect to interactive elements
        const interactive = document.querySelectorAll('button, a, input');
        interactive.forEach(el => {
            el.style.animation = 'tremor 0.1s infinite';
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes tremor {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-1px); }
                75% { transform: translateX(1px); }
            }
        `;
        document.head.appendChild(style);

        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>Parkinson's Simulation</h4>
                <p>Elements appear to shake. Users experience:</p>
                <ul>
                    <li>Uncontrolled movements</li>
                    <li>Difficulty with fine motor tasks</li>
                    <li>Slower response times</li>
                </ul>
                <p><strong>Accommodations:</strong> Larger click areas, sticky keys, voice control.</p>
            </div>
        `;
    }

    simulateTremor(feedback) {
        // Similar to Parkinson's but more intense
        const interactive = document.querySelectorAll('button, a, input');
        interactive.forEach(el => {
            el.style.animation = 'tremor 0.05s infinite';
        });

        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>Tremor Simulation</h4>
                <p>Severe shaking affects interaction. Solutions include:</p>
                <ul>
                    <li>Voice control</li>
                    <li>Eye tracking</li>
                    <li>Larger touch targets</li>
                    <li>Reduced time limits</li>
                </ul>
            </div>
        `;
    }

    simulateDyslexia(feedback) {
        // Scramble some letters to simulate reading difficulty
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
        textElements.forEach(el => {
            if (el.textContent.length > 10) {
                el.dataset.originalText = el.textContent;
                el.textContent = this.scrambleText(el.textContent);
            }
        });

        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>Dyslexia Simulation</h4>
                <p>Text appears scrambled. Users benefit from:</p>
                <ul>
                    <li>Simple, clear fonts</li>
                    <li>Short sentences</li>
                    <li>Left-aligned text</li>
                    <li>Color overlays</li>
                    <li>Text-to-speech</li>
                </ul>
            </div>
        `;
    }

    simulateADHD(feedback) {
        // Add distractions and reduce focus
        document.body.style.animation = 'distraction 3s infinite';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes distraction {
                0%, 100% { filter: none; }
                50% { filter: hue-rotate(45deg) saturate(1.5); }
            }
        `;
        document.head.appendChild(style);

        feedback.innerHTML = `
            <div class="simulation-result">
                <h4>ADHD Simulation</h4>
                <p>Colors shift to simulate distraction. Users need:</p>
                <ul>
                    <li>Reduced visual clutter</li>
                    <li>Clear focus indicators</li>
                    <li>Consistent layouts</li>
                    <li>Minimized animations</li>
                    <li>Structured content</li>
                </ul>
            </div>
        `;
    }

    scrambleText(text) {
        // Simple scrambling for demonstration
        return text.split(' ').map(word => {
            if (word.length <= 3) return word;
            const first = word[0];
            const last = word[word.length - 1];
            const middle = word.slice(1, -1).split('').sort(() => Math.random() - 0.5).join('');
            return first + middle + last;
        }).join(' ');
    }

    resetSimulationEffects() {
        document.body.style.filter = '';
        document.body.style.animation = '';

        // Reset scrambled text
        const textElements = document.querySelectorAll('[data-original-text]');
        textElements.forEach(el => {
            el.textContent = el.dataset.originalText;
            delete el.dataset.originalText;
        });

        // Remove tremor animations
        const interactive = document.querySelectorAll('button, a, input');
        interactive.forEach(el => {
            el.style.animation = '';
        });

        // Remove added styles
        const addedStyles = document.querySelectorAll('style[data-simulation]');
        addedStyles.forEach(style => style.remove());
    }

    updateSimulationButtons(isSimulating) {
        const startBtn = document.getElementById('start-simulation');
        const stopBtn = document.getElementById('stop-simulation');
        const resetBtn = document.getElementById('reset-simulation');

        startBtn.disabled = isSimulating;
        stopBtn.disabled = !isSimulating;
        resetBtn.disabled = isSimulating;
    }

    initializeCharts() {
        this.mainChart = null;
        this.issuesChart = null;
        this.adaptationChart = null;
        this.complianceChart = null;

        this.updateAnalyticsCharts();
    }

    updateAnalyticsCharts() {
        this.updateMainChart();
        this.updateIssuesChart();
        this.updateAdaptationChart();
        this.updateComplianceChart();
        this.updateIssuesTable();
    }

    updateMainChart() {
        const ctx = document.getElementById('main-analytics-chart');
        if (!ctx) return;

        const data = this.getChartData();
        const labels = data.map(d => new Date(d.date).toLocaleDateString());

        if (this.mainChart) {
            this.mainChart.destroy();
        }

        this.mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Accessibility Score',
                    data: data.map(d => d.score),
                    borderColor: 'var(--primary-color)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateIssuesChart() {
        const ctx = document.getElementById('issues-chart');
        if (!ctx) return;

        const issueTypes = {};
        this.scanResults.forEach(scan => {
            scan.issues.forEach(issue => {
                issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
            });
        });

        if (this.issuesChart) {
            this.issuesChart.destroy();
        }

        this.issuesChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(issueTypes),
                datasets: [{
                    data: Object.values(issueTypes),
                    backgroundColor: [
                        'var(--error-color)',
                        'var(--warning-color)',
                        'var(--info-color)',
                        'var(--success-color)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateAdaptationChart() {
        const ctx = document.getElementById('adaptation-chart');
        if (!ctx) return;

        const adaptations = {};
        this.adaptationHistory.forEach(item => {
            const type = item.action.split(' ')[1] || 'other';
            adaptations[type] = (adaptations[type] || 0) + 1;
        });

        if (this.adaptationChart) {
            this.adaptationChart.destroy();
        }

        this.adaptationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(adaptations),
                datasets: [{
                    label: 'Usage Count',
                    data: Object.values(adaptations),
                    backgroundColor: 'var(--primary-color)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateComplianceChart() {
        const ctx = document.getElementById('compliance-chart');
        if (!ctx) return;

        const complianceData = this.scanResults.map(scan => ({
            date: scan.timestamp,
            level: this.calculateComplianceLevel(scan.score)
        }));

        const levels = ['F', 'A', 'AA', 'AAA'];
        const levelCounts = levels.map(level =>
            complianceData.filter(d => d.level === level).length
        );

        if (this.complianceChart) {
            this.complianceChart.destroy();
        }

        this.complianceChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: levels,
                datasets: [{
                    label: 'Compliance Distribution',
                    data: levelCounts,
                    borderColor: 'var(--success-color)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateIssuesTable() {
        const tbody = document.querySelector('#issues-table tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const issueStats = {};
        this.scanResults.forEach(scan => {
            scan.issues.forEach(issue => {
                if (!issueStats[issue.type]) {
                    issueStats[issue.type] = {
                        count: 0,
                        severities: {},
                        lastSeen: 0
                    };
                }
                issueStats[issue.type].count++;
                issueStats[issue.type].severities[issue.severity] =
                    (issueStats[issue.type].severities[issue.severity] || 0) + 1;
                issueStats[issue.type].lastSeen = Math.max(issueStats[issue.type].lastSeen, scan.timestamp);
            });
        });

        Object.entries(issueStats).forEach(([type, stats]) => {
            const row = document.createElement('tr');
            const severity = Object.entries(stats.severities).sort((a, b) => {
                const order = { critical: 3, warning: 2, info: 1 };
                return order[b[0]] - order[a[0]];
            })[0][0];

            row.innerHTML = `
                <td>${type.replace('-', ' ')}</td>
                <td>${stats.count}</td>
                <td class="severity-${severity}">${severity}</td>
                <td>${new Date(stats.lastSeen).toLocaleDateString()}</td>
            `;
            tbody.appendChild(row);
        });
    }

    getChartData() {
        // Generate sample data for the last 30 days
        const data = [];
        const now = Date.now();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(now - (i * 24 * 60 * 60 * 1000));
            const score = Math.max(0, Math.min(100,
                70 + Math.sin(i / 5) * 20 + Math.random() * 10
            ));

            data.push({
                date: date.toISOString(),
                score: Math.round(score)
            });
        }

        return data;
    }

    changeTimeRange(range) {
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-range="${range}"]`).classList.add('active');

        // Update charts with new time range
        this.updateAnalyticsCharts();
    }

    changeMetric(metric) {
        document.querySelectorAll('.metric-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-metric="${metric}"]`).classList.add('active');

        const title = document.getElementById('main-chart-title');
        const titles = {
            score: 'Accessibility Score Trend',
            issues: 'Issues Found Trend',
            fixes: 'Fixes Applied Trend',
            users: 'Users Assisted Trend'
        };
        title.textContent = titles[metric] || titles.score;

        // Update chart data based on metric
        this.updateMainChart();
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('accessibility-settings') || '{}');

        // Load scan settings
        document.getElementById('scan-depth').value = settings.scanDepth || 'standard';
        document.getElementById('scan-frequency').value = settings.scanFrequency || 'manual';

        // Load adaptation settings
        document.getElementById('adaptation-speed').value = settings.adaptationSpeed || 'medium';
        document.getElementById('remember-preferences').checked = settings.rememberPreferences !== false;
        document.getElementById('share-anonymous-data').checked = settings.shareAnonymousData || false;
        document.getElementById('accessibility-api').value = settings.accessibilityApi || 'native';
    }

    saveSettings() {
        const settings = {
            scanDepth: document.getElementById('scan-depth').value,
            scanFrequency: document.getElementById('scan-frequency').value,
            adaptationSpeed: document.getElementById('adaptation-speed').value,
            rememberPreferences: document.getElementById('remember-preferences').checked,
            shareAnonymousData: document.getElementById('share-anonymous-data').checked,
            accessibilityApi: document.getElementById('accessibility-api').value
        };

        localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    }

    exportData() {
        const data = {
            scanResults: this.scanResults,
            analyticsData: this.analyticsData,
            userPreferences: this.userPreferences,
            adaptationHistory: this.adaptationHistory,
            exportDate: new Date().toISOString(),
            version: this.version
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accessibility-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logActivity('export', 'Data exported to JSON file');
    }

    importData() {
        const input = document.getElementById('import-file');
        input.click();

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        this.scanResults = data.scanResults || [];
                        this.analyticsData = data.analyticsData || [];
                        this.userPreferences = data.userPreferences || {};
                        this.adaptationHistory = data.adaptationHistory || [];
                        this.saveData();
                        this.updateDashboard();
                        this.updateAnalyticsCharts();
                        alert('Data imported successfully!');
                        this.logActivity('export', 'Data imported from file');
                    } catch (error) {
                        alert('Error importing data: Invalid file format');
                    }
                };
                reader.readAsText(file);
            }
        };
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
            this.scanResults = [];
            this.analyticsData = [];
            this.adaptationHistory = [];
            this.saveData();
            this.updateDashboard();
            this.updateAnalyticsCharts();
            this.logActivity('export', 'History cleared');
        }
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            localStorage.removeItem('accessibility-settings');
            localStorage.removeItem('accessibility-preferences');
            this.userPreferences = {};
            this.loadSettings();
            this.logActivity('export', 'Settings reset to defaults');
        }
    }

    initializeVoiceControl() {
        if (this.userPreferences.voiceControl) {
            this.startVoiceRecognition();
        }
    }

    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Voice recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.voiceRecognition = new SpeechRecognition();

        this.voiceRecognition.continuous = true;
        this.voiceRecognition.interimResults = false;
        this.voiceRecognition.lang = 'en-US';

        this.voiceRecognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
            this.processVoiceCommand(transcript);
        };

        this.voiceRecognition.onend = () => {
            if (this.userPreferences.voiceControl) {
                // Restart if still enabled
                setTimeout(() => this.startVoiceRecognition(), 1000);
            }
        };

        this.voiceRecognition.start();
        this.showVoiceModal();
    }

    stopVoiceRecognition() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
            this.voiceRecognition = null;
        }
        this.closeVoiceModal();
    }

    processVoiceCommand(command) {
        console.log('Voice command:', command);

        if (command.includes('scan page')) {
            this.startQuickScan();
        } else if (command.includes('high contrast')) {
            this.applyAdaptation('high-contrast');
        } else if (command.includes('large text')) {
            this.applyAdaptation('large-text');
        } else if (command.includes('navigate to dashboard')) {
            this.switchSection('dashboard');
        } else if (command.includes('navigate to scanner')) {
            this.switchSection('scanner');
        } else if (command.includes('navigate to adaptor')) {
            this.switchSection('adaptor');
        } else if (command.includes('navigate to simulator')) {
            this.switchSection('simulator');
        } else if (command.includes('navigate to analytics')) {
            this.switchSection('analytics');
        } else if (command.includes('navigate to settings')) {
            this.switchSection('settings');
        } else if (command.includes('stop listening')) {
            this.toggleVoiceControl(false);
        }

        // Provide feedback
        this.showVoiceFeedback(`Command: "${command}"`);
    }

    showVoiceModal() {
        document.getElementById('voice-modal').classList.add('show');
    }

    closeVoiceModal() {
        document.getElementById('voice-modal').classList.remove('show');
    }

    showVoiceFeedback(message) {
        const status = document.getElementById('voice-status');
        status.textContent = message;

        setTimeout(() => {
            status.textContent = 'Listening...';
        }, 2000);
    }

    handleKeyboardNavigation(e) {
        // Enhanced keyboard navigation
        if (e.altKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.switchSection('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchSection('scanner');
                    break;
                case '3':
                    e.preventDefault();
                    this.switchSection('adaptor');
                    break;
                case '4':
                    e.preventDefault();
                    this.switchSection('simulator');
                    break;
                case '5':
                    e.preventDefault();
                    this.switchSection('analytics');
                    break;
                case '6':
                    e.preventDefault();
                    this.switchSection('settings');
                    break;
            }
        }
    }

    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    startQuickScan() {
        // Quick scan with basic checks
        document.getElementById('scan-contrast').checked = true;
        document.getElementById('scan-alt-text').checked = true;
        document.getElementById('scan-keyboard').checked = true;
        document.getElementById('scan-semantic').checked = true;

        this.startAccessibilityScan();
    }

    applyAutoFixes() {
        // Apply automatic fixes for common issues
        const fixes = [];

        // Fix missing alt text (add generic alt text)
        const images = document.querySelectorAll('img:not([alt])');
        images.forEach((img, index) => {
            img.setAttribute('alt', `Image ${index + 1}`);
            fixes.push('Added generic alt text to images');
        });

        // Add ARIA labels to form inputs without labels
        const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputs.forEach((input, index) => {
            if (!input.getAttribute('placeholder')) {
                input.setAttribute('aria-label', `Input field ${index + 1}`);
                fixes.push('Added ARIA labels to form inputs');
            }
        });

        // Add missing landmarks
        if (!document.querySelector('main, [role="main"]')) {
            const main = document.querySelector('main') || document.createElement('main');
            if (!document.querySelector('main')) {
                // Wrap main content in main element
                const content = document.querySelector('.main-content');
                if (content) {
                    const mainEl = document.createElement('main');
                    mainEl.id = 'main-content';
                    content.parentNode.insertBefore(mainEl, content);
                    mainEl.appendChild(content);
                    fixes.push('Added main landmark');
                }
            }
        }

        if (fixes.length > 0) {
            alert(`Applied ${fixes.length} automatic fixes:\n${fixes.join('\n')}`);
            this.logActivity('adaptation', `Applied ${fixes.length} auto-fixes`);
        } else {
            alert('No automatic fixes available for current issues.');
        }
    }

    generateReport() {
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalScans: this.scanResults.length,
                averageScore: this.scanResults.length > 0 ?
                    this.scanResults.reduce((sum, scan) => sum + scan.score, 0) / this.scanResults.length : 0,
                totalIssues: this.scanResults.reduce((sum, scan) => sum + scan.issues.length, 0),
                adaptationsApplied: this.adaptationHistory.length
            },
            recentIssues: this.scanResults.slice(-5).flatMap(scan => scan.issues),
            recommendations: this.generateRecommendations()
        };

        // Create downloadable report
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logActivity('export', 'Accessibility report generated');
    }

    generateRecommendations() {
        const recommendations = [];
        const issueTypes = {};

        this.scanResults.forEach(scan => {
            scan.issues.forEach(issue => {
                issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
            });
        });

        if (issueTypes['alt-text'] > 0) {
            recommendations.push('Add descriptive alt text to all images');
        }
        if (issueTypes['contrast'] > 0) {
            recommendations.push('Improve color contrast ratios');
        }
        if (issueTypes['keyboard'] > 0) {
            recommendations.push('Ensure all interactive elements are keyboard accessible');
        }
        if (issueTypes['semantic'] > 0) {
            recommendations.push('Use proper semantic HTML elements');
        }

        return recommendations;
    }

    logActivity(type, action, details = '') {
        const activity = {
            type,
            action,
            details,
            timestamp: Date.now()
        };

        this.adaptationHistory.push(activity);
        this.saveData();
        this.updateActivityLog();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityLayer = new AdaptiveUIAccessibilityLayer();
});