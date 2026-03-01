/**
 * Edge Deployment Compatibility Mode
 * Comprehensive analysis tool for edge computing deployment compatibility
 * Version 1.0.0
 */

class EdgeDeploymentCompatibilityMode {
    constructor() {
        this.uploadedFiles = [];
        this.analysisResults = {};
        this.compatibilityScores = {
            architecture: 0,
            resources: 0,
            network: 0,
            security: 0,
            overall: 0
        };
        this.issues = [];
        this.recommendations = [];
        this.analysisHistory = [];
        this.chartInstance = null;

        this.platformConfigs = {
            kubernetes: {
                name: 'Kubernetes Edge',
                resourceLimits: { cpu: 2, memory: 4096, storage: 50 },
                networkFeatures: ['service-mesh', 'ingress', 'load-balancer'],
                securityFeatures: ['rbac', 'pod-security', 'network-policies']
            },
            k3s: {
                name: 'K3s',
                resourceLimits: { cpu: 1, memory: 2048, storage: 20 },
                networkFeatures: ['traefik', 'klipper-lb'],
                securityFeatures: ['rbac', 'pod-security']
            },
            docker: {
                name: 'Docker Edge',
                resourceLimits: { cpu: 1, memory: 2048, storage: 10 },
                networkFeatures: ['bridge', 'host', 'overlay'],
                securityFeatures: ['apparmor', 'seccomp']
            },
            'aws-iot': {
                name: 'AWS IoT Greengrass',
                resourceLimits: { cpu: 0.5, memory: 512, storage: 5 },
                networkFeatures: ['mqtt', 'shadow-service'],
                securityFeatures: ['device-certs', 'iot-policies']
            },
            'azure-iot': {
                name: 'Azure IoT Edge',
                resourceLimits: { cpu: 0.5, memory: 512, storage: 5 },
                networkFeatures: ['mqtt', 'edge-hub'],
                securityFeatures: ['device-identity', 'module-identity']
            }
        };

        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.initializeChart();
        this.updateUI();
    }

    setupEventListeners() {
        // Main controls
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyzeApplication());
        document.getElementById('uploadBtn').addEventListener('click', () => this.triggerFileUpload());
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAnalysis());

        // File upload
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Configuration changes
        document.getElementById('targetPlatform').addEventListener('change', () => this.updatePlatformConfig());
        document.getElementById('cpuLimit').addEventListener('input', () => this.updateResourceConfig());
        document.getElementById('memoryLimit').addEventListener('input', () => this.updateResourceConfig());
        document.getElementById('storageLimit').addEventListener('input', () => this.updateResourceConfig());

        // Copy buttons
        document.getElementById('copyDockerfileBtn').addEventListener('click', () => this.copyToClipboard('dockerfileContent'));
        document.getElementById('copyK8sBtn').addEventListener('click', () => this.copyToClipboard('k8sManifestContent'));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');

        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    triggerFileUpload() {
        document.getElementById('fileInput').click();
    }

    processFiles(files) {
        files.forEach(file => {
            if (!this.uploadedFiles.find(f => f.name === file.name && f.size === file.size)) {
                this.uploadedFiles.push(file);
            }
        });

        this.updateFileList();
        this.showNotification(`${files.length} file(s) uploaded successfully`, 'success');
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        this.uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const fileInfo = document.createElement('div');
            fileInfo.className = 'file-info';

            const icon = this.getFileIcon(file.name);
            const fileName = document.createElement('span');
            fileName.className = 'file-name';
            fileName.textContent = file.name;

            const fileSize = document.createElement('span');
            fileSize.className = 'file-size';
            fileSize.textContent = this.formatFileSize(file.size);

            fileInfo.appendChild(icon);
            fileInfo.appendChild(fileName);
            fileInfo.appendChild(fileSize);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', () => this.removeFile(index));

            fileItem.appendChild(fileInfo);
            fileItem.appendChild(removeBtn);
            fileList.appendChild(fileItem);
        });
    }

    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconSvg = {
            zip: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="7.5,4.5 16.5,9.5"></polyline><polyline points="7.5,9.5 16.5,4.5"></polyline></svg>',
            js: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline></svg>',
            py: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline></svg>',
            dockerfile: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline></svg>'
        };

        const svg = document.createElement('div');
        svg.innerHTML = iconSvg[ext] || iconSvg.js;
        return svg.firstChild;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(index) {
        this.uploadedFiles.splice(index, 1);
        this.updateFileList();
    }

    updatePlatformConfig() {
        const platform = document.getElementById('targetPlatform').value;
        const config = this.platformConfigs[platform];

        if (config) {
            document.getElementById('cpuLimit').value = config.resourceLimits.cpu;
            document.getElementById('memoryLimit').value = config.resourceLimits.memory;
            document.getElementById('storageLimit').value = config.resourceLimits.storage;
        }
    }

    updateResourceConfig() {
        // Resource configuration updated, will be used in analysis
    }

    async analyzeApplication() {
        if (this.uploadedFiles.length === 0) {
            this.showNotification('Please upload application files first', 'error');
            return;
        }

        this.showNotification('Analyzing application for edge compatibility...', 'info');

        try {
            // Simulate analysis process
            await this.performAnalysis();

            this.updateCompatibilityScores();
            this.updateIssuesList();
            this.updateRecommendationsList();
            this.updateChart();
            this.generateDeploymentConfigs();
            this.saveAnalysisToHistory();

            this.showNotification('Analysis completed successfully', 'success');
        } catch (error) {
            console.error('Analysis failed:', error);
            this.showNotification('Analysis failed. Please try again.', 'error');
        }
    }

    async performAnalysis() {
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Analyze architecture compatibility
        this.compatibilityScores.architecture = this.analyzeArchitecture();

        // Analyze resource requirements
        this.compatibilityScores.resources = this.analyzeResources();

        // Analyze network compatibility
        this.compatibilityScores.network = this.analyzeNetwork();

        // Analyze security compliance
        this.compatibilityScores.security = this.analyzeSecurity();

        // Calculate overall score
        this.compatibilityScores.overall = Math.round(
            (this.compatibilityScores.architecture +
             this.compatibilityScores.resources +
             this.compatibilityScores.network +
             this.compatibilityScores.security) / 4
        );

        // Generate issues and recommendations
        this.generateIssues();
        this.generateRecommendations();
    }

    analyzeArchitecture() {
        let score = 100;

        // Check for containerization files
        const hasDockerfile = this.uploadedFiles.some(file =>
            file.name.toLowerCase().includes('dockerfile')
        );

        const hasContainerConfig = this.uploadedFiles.some(file =>
            file.name.toLowerCase().includes('docker-compose') ||
            file.name.toLowerCase().includes('.yaml') ||
            file.name.toLowerCase().includes('.yml')
        );

        if (!hasDockerfile) score -= 30;
        if (!hasContainerConfig) score -= 20;

        // Check programming language compatibility
        const supportedExtensions = ['.js', '.py', '.java', '.go', '.rs', '.cs'];
        const hasSupportedCode = this.uploadedFiles.some(file =>
            supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
        );

        if (!hasSupportedCode) score -= 25;

        return Math.max(0, score);
    }

    analyzeResources() {
        const platform = document.getElementById('targetPlatform').value;
        const config = this.platformConfigs[platform];

        const cpuLimit = parseFloat(document.getElementById('cpuLimit').value) || 1;
        const memoryLimit = parseInt(document.getElementById('memoryLimit').value) || 1024;
        const storageLimit = parseFloat(document.getElementById('storageLimit').value) || 10;

        let score = 100;

        // Check if resource limits are within platform constraints
        if (cpuLimit > config.resourceLimits.cpu) score -= 20;
        if (memoryLimit > config.resourceLimits.memory) score -= 20;
        if (storageLimit > config.resourceLimits.storage) score -= 20;

        // Check for resource-intensive dependencies
        const hasHeavyDeps = this.uploadedFiles.some(file =>
            file.name.toLowerCase().includes('tensorflow') ||
            file.name.toLowerCase().includes('pytorch') ||
            file.name.toLowerCase().includes('opencv')
        );

        if (hasHeavyDeps && (cpuLimit < 1 || memoryLimit < 2048)) {
            score -= 25;
        }

        return Math.max(0, score);
    }

    analyzeNetwork() {
        const networkProfile = document.getElementById('networkProfile').value;
        const platform = document.getElementById('targetPlatform').value;
        const config = this.platformConfigs[platform];

        let score = 100;

        // Check network requirements based on profile
        if (networkProfile === 'intermittent' && !config.networkFeatures.includes('offline-first')) {
            score -= 15;
        }

        if (networkProfile === 'high-throughput' && !config.networkFeatures.includes('load-balancer')) {
            score -= 20;
        }

        // Check for network-dependent code
        const hasNetworkDeps = this.uploadedFiles.some(file =>
            file.name.toLowerCase().includes('http') ||
            file.name.toLowerCase().includes('websocket') ||
            file.name.toLowerCase().includes('mqtt')
        );

        if (hasNetworkDeps && networkProfile === 'offline-first') {
            score -= 25;
        }

        return Math.max(0, score);
    }

    analyzeSecurity() {
        const securityLevel = document.getElementById('securityLevel').value;
        const platform = document.getElementById('targetPlatform').value;
        const config = this.platformConfigs[platform];

        let score = 100;

        // Check security features availability
        if (securityLevel === 'high' && !config.securityFeatures.includes('rbac')) {
            score -= 20;
        }

        if (securityLevel === 'critical' && !config.securityFeatures.includes('device-certs')) {
            score -= 25;
        }

        // Check for security-sensitive code
        const hasSensitiveCode = this.uploadedFiles.some(file =>
            file.name.toLowerCase().includes('auth') ||
            file.name.toLowerCase().includes('security') ||
            file.name.toLowerCase().includes('crypto')
        );

        if (hasSensitiveCode && securityLevel === 'basic') {
            score -= 15;
        }

        return Math.max(0, score);
    }

    generateIssues() {
        this.issues = [];

        if (this.compatibilityScores.architecture < 70) {
            this.issues.push({
                title: 'Containerization Issues',
                description: 'Application lacks proper containerization configuration for edge deployment.',
                severity: 'high',
                category: 'architecture'
            });
        }

        if (this.compatibilityScores.resources < 70) {
            this.issues.push({
                title: 'Resource Constraints',
                description: 'Application resource requirements exceed edge platform limitations.',
                severity: 'high',
                category: 'resources'
            });
        }

        if (this.compatibilityScores.network < 70) {
            this.issues.push({
                title: 'Network Compatibility',
                description: 'Application network requirements not compatible with edge environment.',
                severity: 'medium',
                category: 'network'
            });
        }

        if (this.compatibilityScores.security < 70) {
            this.issues.push({
                title: 'Security Compliance',
                description: 'Application does not meet required security standards for edge deployment.',
                severity: 'critical',
                category: 'security'
            });
        }
    }

    generateRecommendations() {
        this.recommendations = [];

        if (this.compatibilityScores.architecture < 80) {
            this.recommendations.push({
                title: 'Implement Containerization',
                description: 'Create Dockerfile and container orchestration manifests for edge deployment.',
                priority: 'high',
                category: 'architecture'
            });
        }

        if (this.compatibilityScores.resources < 80) {
            this.recommendations.push({
                title: 'Optimize Resource Usage',
                description: 'Reduce memory footprint and CPU usage for edge environment constraints.',
                priority: 'high',
                category: 'resources'
            });
        }

        if (this.compatibilityScores.network < 80) {
            this.recommendations.push({
                title: 'Implement Offline Capabilities',
                description: 'Add offline data synchronization and intermittent connectivity support.',
                priority: 'medium',
                category: 'network'
            });
        }

        if (this.compatibilityScores.security < 80) {
            this.recommendations.push({
                title: 'Enhance Security Measures',
                description: 'Implement proper authentication, encryption, and access controls.',
                priority: 'critical',
                category: 'security'
            });
        }

        // Always include general recommendations
        this.recommendations.push({
            title: 'Monitor Performance',
            description: 'Implement comprehensive monitoring and logging for edge deployment.',
            priority: 'medium',
            category: 'operations'
        });

        this.recommendations.push({
            title: 'Plan Scaling Strategy',
            description: 'Design horizontal scaling approach for variable edge workloads.',
            priority: 'low',
            category: 'scalability'
        });
    }

    updateCompatibilityScores() {
        document.getElementById('overallScore').textContent = this.compatibilityScores.overall;

        // Update progress bars
        this.updateProgressBar('architectureScore', this.compatibilityScores.architecture);
        this.updateProgressBar('resourcesScore', this.compatibilityScores.resources);
        this.updateProgressBar('networkScore', this.compatibilityScores.network);
        this.updateProgressBar('securityScore', this.compatibilityScores.security);

        // Update score values
        document.getElementById('architectureValue').textContent = `${this.compatibilityScores.architecture}%`;
        document.getElementById('resourcesValue').textContent = `${this.compatibilityScores.resources}%`;
        document.getElementById('networkValue').textContent = `${this.compatibilityScores.network}%`;
        document.getElementById('securityValue').textContent = `${this.compatibilityScores.security}%`;

        // Update circular progress
        this.updateCircularProgress();
    }

    updateProgressBar(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = `${value}%`;
        }
    }

    updateCircularProgress() {
        const score = this.compatibilityScores.overall;
        const circle = document.querySelector('.score-circle');
        if (circle) {
            circle.style.background = `conic-gradient(#667eea 0% ${score}%, #e9ecef ${score}% 100%)`;
        }
    }

    updateIssuesList() {
        const issuesList = document.getElementById('issuesList');

        if (this.issues.length === 0) {
            issuesList.innerHTML = '<div class="no-issues">No compatibility issues found. Application is ready for edge deployment!</div>';
            return;
        }

        issuesList.innerHTML = '';

        this.issues.forEach(issue => {
            const issueItem = document.createElement('div');
            issueItem.className = 'issue-item';

            const icon = document.createElement('div');
            icon.className = 'issue-icon';
            icon.innerHTML = this.getSeverityIcon(issue.severity);

            const content = document.createElement('div');
            content.className = 'issue-content';

            const title = document.createElement('div');
            title.className = 'issue-title';
            title.textContent = issue.title;

            const description = document.createElement('div');
            description.className = 'issue-description';
            description.textContent = issue.description;

            const severity = document.createElement('span');
            severity.className = `severity-badge severity-${issue.severity}`;
            severity.textContent = issue.severity;

            content.appendChild(title);
            content.appendChild(description);
            content.appendChild(severity);

            issueItem.appendChild(icon);
            issueItem.appendChild(content);

            issuesList.appendChild(issueItem);
        });
    }

    updateRecommendationsList() {
        const recommendationsList = document.getElementById('recommendationsList');

        if (this.recommendations.length === 0) {
            recommendationsList.innerHTML = '<div class="no-recommendations">No recommendations available.</div>';
            return;
        }

        recommendationsList.innerHTML = '';

        this.recommendations.forEach(rec => {
            const recItem = document.createElement('div');
            recItem.className = 'recommendation-item';

            const icon = document.createElement('div');
            icon.className = 'recommendation-icon';
            icon.innerHTML = this.getPriorityIcon(rec.priority);

            const content = document.createElement('div');
            content.className = 'recommendation-content';

            const title = document.createElement('div');
            title.className = 'recommendation-title';
            title.textContent = rec.title;

            const description = document.createElement('div');
            description.className = 'recommendation-description';
            description.textContent = rec.description;

            const priority = document.createElement('span');
            priority.className = `priority-badge priority-${rec.priority}`;
            priority.textContent = rec.priority;

            content.appendChild(title);
            content.appendChild(description);
            content.appendChild(priority);

            recItem.appendChild(icon);
            recItem.appendChild(content);

            recommendationsList.appendChild(recItem);
        });
    }

    getSeverityIcon(severity) {
        const icons = {
            critical: '🚨',
            high: '⚠️',
            medium: '⚡',
            low: 'ℹ️'
        };
        return icons[severity] || icons.medium;
    }

    getPriorityIcon(priority) {
        const icons = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        };
        return icons[priority] || icons.medium;
    }

    initializeChart() {
        const ctx = document.getElementById('compatibilityChart');
        if (ctx) {
            this.chartInstance = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Architecture', 'Resources', 'Network', 'Security'],
                    datasets: [{
                        label: 'Compatibility Score',
                        data: [0, 0, 0, 0],
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
    }

    updateChart() {
        if (this.chartInstance) {
            this.chartInstance.data.datasets[0].data = [
                this.compatibilityScores.architecture,
                this.compatibilityScores.resources,
                this.compatibilityScores.network,
                this.compatibilityScores.security
            ];
            this.chartInstance.update();
        }
    }

    generateDeploymentConfigs() {
        this.generateDockerfile();
        this.generateKubernetesManifest();
    }

    generateDockerfile() {
        const platform = document.getElementById('targetPlatform').value;
        const cpuLimit = document.getElementById('cpuLimit').value;
        const memoryLimit = document.getElementById('memoryLimit').value;

        let dockerfile = `# Multi-stage Dockerfile for Edge Deployment
FROM node:18-alpine AS base

# Install dependencies
RUN apk add --no-cache ca-certificates curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache ca-certificates curl

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy from base stage
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]`;

        // Adjust for different platforms
        if (platform === 'k3s' || platform === 'kubernetes') {
            dockerfile = dockerfile.replace('node:18-alpine', 'node:16-alpine');
        }

        document.getElementById('dockerfileContent').textContent = dockerfile;
    }

    generateKubernetesManifest() {
        const platform = document.getElementById('targetPlatform').value;
        const cpuLimit = document.getElementById('cpuLimit').value;
        const memoryLimit = document.getElementById('memoryLimit').value;

        let manifest = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: edge-app
  labels:
    app: edge-app
    platform: ${platform}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: edge-app
  template:
    metadata:
      labels:
        app: edge-app
    spec:
      containers:
      - name: app
        image: edge-app:latest
        ports:
        - containerPort: 3000
          name: http
        resources:
          limits:
            cpu: "${cpuLimit}"
            memory: "${memoryLimit}Mi"
          requests:
            cpu: "${Math.max(0.1, cpuLimit * 0.5)}"
            memory: "${Math.max(128, memoryLimit * 0.5)}Mi"
        livenessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/health
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL
      securityContext:
        fsGroup: 1001
---
apiVersion: v1
kind: Service
metadata:
  name: edge-app-service
  labels:
    app: edge-app
spec:
  selector:
    app: edge-app
  ports:
  - name: http
    port: 80
    targetPort: http
  type: ClusterIP`;

        document.getElementById('k8sManifestContent').textContent = manifest;
    }

    saveAnalysisToHistory() {
        const analysis = {
            date: new Date().toISOString(),
            scores: { ...this.compatibilityScores },
            platform: document.getElementById('targetPlatform').value,
            files: this.uploadedFiles.length,
            issues: this.issues.length,
            recommendations: this.recommendations.length
        };

        this.analysisHistory.unshift(analysis);
        this.saveToStorage();
        this.updateHistoryList();
    }

    updateHistoryList() {
        const historyList = document.getElementById('historyList');

        if (this.analysisHistory.length === 0) {
            historyList.innerHTML = '<div class="no-history">No analysis history available.</div>';
            return;
        }

        historyList.innerHTML = '';

        this.analysisHistory.slice(0, 5).forEach(analysis => {
            const item = document.createElement('div');
            item.className = 'history-item';

            const date = document.createElement('span');
            date.className = 'date';
            date.textContent = new Date(analysis.date).toLocaleDateString();

            const score = document.createElement('span');
            score.className = 'score';
            score.textContent = `Score: ${analysis.scores.overall}%`;

            const details = document.createElement('div');
            details.className = 'details';
            details.textContent = `${analysis.files} files • ${analysis.issues} issues • ${analysis.platform}`;

            item.appendChild(date);
            item.appendChild(score);
            item.appendChild(details);

            historyList.appendChild(item);
        });
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            compatibility: this.compatibilityScores,
            issues: this.issues,
            recommendations: this.recommendations,
            configuration: {
                platform: document.getElementById('targetPlatform').value,
                resources: {
                    cpu: document.getElementById('cpuLimit').value,
                    memory: document.getElementById('memoryLimit').value,
                    storage: document.getElementById('storageLimit').value
                },
                network: document.getElementById('networkProfile').value,
                security: document.getElementById('securityLevel').value
            },
            files: this.uploadedFiles.map(f => ({ name: f.name, size: f.size }))
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `edge-compatibility-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Report generated and downloaded', 'success');
    }

    resetAnalysis() {
        if (confirm('Are you sure you want to reset the analysis? All current data will be lost.')) {
            this.uploadedFiles = [];
            this.compatibilityScores = { architecture: 0, resources: 0, network: 0, security: 0, overall: 0 };
            this.issues = [];
            this.recommendations = [];

            this.updateFileList();
            this.updateCompatibilityScores();
            this.updateIssuesList();
            this.updateRecommendationsList();
            this.updateChart();

            this.showNotification('Analysis reset successfully', 'info');
        }
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            navigator.clipboard.writeText(element.textContent).then(() => {
                this.showNotification('Copied to clipboard', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy to clipboard', 'error');
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.getElementById('notificationContainer').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    saveToStorage() {
        try {
            localStorage.setItem('edgeDeploymentAnalysisHistory', JSON.stringify(this.analysisHistory));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const history = localStorage.getItem('edgeDeploymentAnalysisHistory');
            if (history) {
                this.analysisHistory = JSON.parse(history);
                this.updateHistoryList();
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    updateUI() {
        this.updateCompatibilityScores();
        this.updateIssuesList();
        this.updateRecommendationsList();
        this.updateChart();
        this.updateHistoryList();
    }

    // Utility methods
    validateConfiguration() {
        const errors = [];

        const cpu = parseFloat(document.getElementById('cpuLimit').value);
        const memory = parseInt(document.getElementById('memoryLimit').value);
        const storage = parseFloat(document.getElementById('storageLimit').value);

        if (cpu <= 0) errors.push('CPU limit must be greater than 0');
        if (memory <= 0) errors.push('Memory limit must be greater than 0');
        if (storage <= 0) errors.push('Storage limit must be greater than 0');

        return errors;
    }

    // Performance monitoring
    monitorPerformance() {
        const startTime = performance.now();

        this.analyzeApplication();

        const endTime = performance.now();
        console.log(`Analysis completed in ${(endTime - startTime).toFixed(2)}ms`);
    }

    // Error handling
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        this.showNotification(`An error occurred: ${error.message}`, 'error');
    }

    // Cleanup
    destroy() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        // Remove event listeners
        // (Cleanup code would go here)
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.edgeDeploymentMode = new EdgeDeploymentCompatibilityMode();
    } catch (error) {
        console.error('Failed to initialize Edge Deployment Compatibility Mode:', error);
        alert('Failed to initialize the application. Please refresh the page.');
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Service worker registration (if needed)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EdgeDeploymentCompatibilityMode;
}