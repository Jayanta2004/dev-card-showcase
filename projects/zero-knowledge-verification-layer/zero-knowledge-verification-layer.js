// Zero-Knowledge Verification Layer JavaScript

class ZeroKnowledgeLayer {
    constructor() {
        this.proofs = this.loadFromStorage('zk_proofs') || [];
        this.circuits = this.loadFromStorage('zk_circuits') || [];
        this.keys = this.loadFromStorage('zk_keys') || [];
        this.settings = this.loadFromStorage('zk_settings') || this.getDefaultSettings();
        this.activityLog = this.loadFromStorage('zk_activity') || [];
        this.verificationHistory = this.loadFromStorage('zk_verification_history') || [];
        this.securityPolicies = this.getDefaultSecurityPolicies();

        this.charts = {};
        this.intervals = {};
        this.currentSection = 'dashboard';

        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.loadInitialData();
        this.updateUI();
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.closest('.nav-link').getAttribute('href').substring(1));
            });
        });

        // Dashboard
        document.getElementById('refreshDashboardBtn')?.addEventListener('click', () => this.refreshDashboard());

        // Proof Management
        document.getElementById('generateProofBtn')?.addEventListener('click', () => this.showGenerateProofModal());
        document.getElementById('importProofBtn')?.addEventListener('click', () => this.importProof());

        // Verification
        document.getElementById('verifyProofBtn')?.addEventListener('click', () => this.showVerificationModal());
        document.getElementById('batchVerifyBtn')?.addEventListener('click', () => this.showBatchVerificationModal());
        document.getElementById('singleVerifyBtn')?.addEventListener('click', () => this.verifySingleProof());
        document.getElementById('batchVerifyExecuteBtn')?.addEventListener('click', () => this.verifyBatchProofs());

        // Circuits
        document.getElementById('createCircuitBtn')?.addEventListener('click', () => this.showCreateCircuitModal());
        document.getElementById('compileCircuitBtn')?.addEventListener('click', () => this.compileCircuit());
        document.getElementById('saveCircuitBtn')?.addEventListener('click', () => this.saveCircuit());
        document.getElementById('testCircuitBtn')?.addEventListener('click', () => this.testCircuit());

        // Cryptography
        document.getElementById('generateKeysBtn')?.addEventListener('click', () => this.showKeyGenerationModal());
        document.getElementById('generateKeyPairBtn')?.addEventListener('click', () => this.generateKeyPair());
        document.getElementById('encryptBtn')?.addEventListener('click', () => this.encryptData());
        document.getElementById('decryptBtn')?.addEventListener('click', () => this.decryptData());
        document.getElementById('computeHashBtn')?.addEventListener('click', () => this.computeHash());

        // Analytics
        document.getElementById('exportAnalyticsBtn')?.addEventListener('click', () => this.exportAnalytics());
        document.getElementById('generateReportBtn')?.addEventListener('click', () => this.generateReport());

        // Security
        document.getElementById('securityAuditBtn')?.addEventListener('click', () => this.runSecurityAudit());
        document.getElementById('threatAnalysisBtn')?.addEventListener('click', () => this.runThreatAnalysis());

        // Settings
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => this.resetSettings());

        // Emergency Stop
        document.getElementById('emergencyStopBtn')?.addEventListener('click', () => this.emergencyStop());

        // Modal close
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });

        // Alert modal
        document.getElementById('alertOkBtn')?.addEventListener('click', () => this.closeModal());

        // Form submissions
        document.getElementById('generateProofForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateProof();
        });
    }

    // Navigation
    switchSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId)?.classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`)?.classList.add('active');

        this.currentSection = sectionId;
        this.updateUI();
    }

    // Dashboard
    refreshDashboard() {
        this.updateMetrics();
        this.updateCharts();
        this.updateActivityLog();
        this.showAlert('Dashboard refreshed successfully', 'success');
    }

    updateMetrics() {
        const metrics = this.calculateMetrics();

        // Update metric values
        Object.keys(metrics).forEach(key => {
            const element = document.getElementById(`${key}Value`);
            if (element) {
                element.textContent = metrics[key].value;
            }

            const changeElement = document.getElementById(`${key}Change`);
            if (changeElement) {
                changeElement.textContent = metrics[key].change;
                changeElement.className = `metric-change ${metrics[key].changeType}`;
            }
        });
    }

    calculateMetrics() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        const recentProofs = this.proofs.filter(p => p.timestamp > oneHourAgo);
        const recentVerifications = this.verificationHistory.filter(v => v.timestamp > oneHourAgo);

        return {
            activeProofs: {
                value: this.proofs.filter(p => p.status === 'verified').length,
                change: `+${Math.floor(Math.random() * 20)} (${(Math.random() * 10).toFixed(1)}%)`,
                changeType: 'positive'
            },
            verificationsPerSec: {
                value: Math.floor(recentVerifications.length / 3600 * 1000),
                change: `+${Math.floor(Math.random() * 300)} (${(Math.random() * 20).toFixed(1)}%)`,
                changeType: 'positive'
            },
            avgProofTime: {
                value: `${(Math.random() * 3 + 1).toFixed(1)}s`,
                change: `${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 0.5).toFixed(1)}s (${(Math.random() * 20).toFixed(1)}%)`,
                changeType: Math.random() > 0.5 ? 'negative' : 'positive'
            },
            successRate: {
                value: `${(95 + Math.random() * 5).toFixed(1)}%`,
                change: `+${(Math.random() * 0.5).toFixed(1)}% (${(Math.random() * 0.1).toFixed(1)}%)`,
                changeType: 'positive'
            },
            gasUsage: {
                value: `${Math.floor(40 + Math.random() * 20)}K`,
                change: `${Math.random() > 0.5 ? '-' : '+'}${Math.floor(Math.random() * 5)}K (${(Math.random() * 10).toFixed(1)}%)`,
                changeType: Math.random() > 0.5 ? 'positive' : 'negative'
            },
            securityScore: {
                value: `${(95 + Math.random() * 5).toFixed(1)}%`,
                change: `+${(Math.random() * 0.5).toFixed(1)}% (${(Math.random() * 0.05).toFixed(1)}%)`,
                changeType: 'positive'
            }
        };
    }

    // Charts
    initializeCharts() {
        this.initializeProofRateChart();
        this.initializeVerificationChart();
        this.initializeProtocolChart();
        this.initializeProofSizeChart();
        this.initializeVerificationTimeChart();
    }

    initializeProofRateChart() {
        const ctx = document.getElementById('proofRateChart');
        if (!ctx) return;

        this.charts.proofRate = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(24),
                datasets: [{
                    label: 'Proofs Generated',
                    data: this.generateRandomData(24, 50, 200),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
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
                        beginAtZero: true
                    }
                }
            }
        });
    }

    initializeVerificationChart() {
        const ctx = document.getElementById('verificationChart');
        if (!ctx) return;

        this.charts.verification = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Successful', 'Failed', 'Pending'],
                datasets: [{
                    data: [85, 5, 10],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 0
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

    initializeProtocolChart() {
        const ctx = document.getElementById('protocolChart');
        if (!ctx) return;

        this.charts.protocol = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Groth16', 'PLONK', 'Marlin', 'Sonic'],
                datasets: [{
                    label: 'Performance Score',
                    data: [95, 88, 92, 85],
                    backgroundColor: '#6366f1',
                    borderRadius: 4
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

    initializeProofSizeChart() {
        const ctx = document.getElementById('proofSizeChart');
        if (!ctx) return;

        this.charts.proofSize = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Small', 'Medium', 'Large', 'Extra Large'],
                datasets: [{
                    label: 'Proof Size Distribution',
                    data: [30, 45, 20, 5],
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    pointBackgroundColor: '#6366f1'
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

    initializeVerificationTimeChart() {
        const ctx = document.getElementById('verificationTimeChart');
        if (!ctx) return;

        this.charts.verificationTime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(12),
                datasets: [{
                    label: 'Verification Time (ms)',
                    data: this.generateRandomData(12, 200, 800),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                // Update with new random data
                chart.data.datasets.forEach(dataset => {
                    dataset.data = this.generateRandomData(dataset.data.length, 50, 200);
                });
                chart.update();
            }
        });
    }

    generateTimeLabels(hours) {
        const labels = [];
        for (let i = hours - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 60 * 60 * 1000);
            labels.push(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }
        return labels;
    }

    generateRandomData(count, min, max) {
        return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }

    // Activity Log
    updateActivityLog() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const recentActivities = this.activityLog.slice(-10).reverse();

        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">${activity.timestamp}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    addActivity(title, type = 'info') {
        const activity = {
            id: Date.now(),
            title,
            type,
            timestamp: new Date().toLocaleString()
        };

        this.activityLog.push(activity);
        this.saveToStorage('zk_activity', this.activityLog);
        this.updateActivityLog();
    }

    // Proof Management
    showGenerateProofModal() {
        this.populateCircuitSelect();
        document.getElementById('generateProofModal').classList.add('show');
    }

    populateCircuitSelect() {
        const select = document.getElementById('circuitSelect');
        if (!select) return;

        select.innerHTML = '<option value="">Choose a circuit...</option>';
        this.circuits.forEach(circuit => {
            const option = document.createElement('option');
            option.value = circuit.id;
            option.textContent = circuit.name;
            select.appendChild(option);
        });
    }

    generateProof() {
        const formData = new FormData(document.getElementById('generateProofForm'));
        const proofData = {
            id: Date.now(),
            name: formData.get('proofName'),
            circuitId: formData.get('circuitSelect'),
            privateInputs: JSON.parse(formData.get('privateInputs') || '{}'),
            publicInputs: JSON.parse(formData.get('publicInputs') || '{}'),
            status: 'generating',
            timestamp: Date.now(),
            proof: this.simulateProofGeneration(),
            gasUsed: Math.floor(Math.random() * 10000) + 5000
        };

        this.proofs.push(proofData);
        this.saveToStorage('zk_proofs', this.proofs);

        // Simulate proof generation delay
        setTimeout(() => {
            proofData.status = 'verified';
            this.saveToStorage('zk_proofs', this.proofs);
            this.updateProofGrid();
            this.addActivity(`Proof "${proofData.name}" generated successfully`, 'success');
        }, 2000);

        this.closeModal();
        this.updateProofGrid();
        this.addActivity(`Started generating proof "${proofData.name}"`, 'info');
    }

    simulateProofGeneration() {
        // Simulate ZK proof generation
        return {
            pi_a: [this.generateRandomHex(64), this.generateRandomHex(64)],
            pi_b: [[this.generateRandomHex(64), this.generateRandomHex(64)], [this.generateRandomHex(64), this.generateRandomHex(64)]],
            pi_c: [this.generateRandomHex(64), this.generateRandomHex(64)],
            protocol: 'groth16'
        };
    }

    updateProofGrid() {
        const grid = document.getElementById('proofGrid');
        if (!grid) return;

        grid.innerHTML = this.proofs.slice(-6).reverse().map(proof => `
            <div class="proof-card">
                <div class="proof-header">
                    <div class="proof-title">${proof.name}</div>
                    <span class="proof-status ${proof.status}">${proof.status}</span>
                </div>
                <div class="proof-meta">
                    <div>Circuit: ${this.circuits.find(c => c.id == proof.circuitId)?.name || 'Unknown'}</div>
                    <div>Gas: ${proof.gasUsed || 'N/A'}</div>
                    <div>Created: ${new Date(proof.timestamp).toLocaleDateString()}</div>
                </div>
                <div class="proof-actions">
                    <button class="btn btn-small" onclick="zkLayer.verifyProof(${proof.id})">Verify</button>
                    <button class="btn btn-small btn-secondary" onclick="zkLayer.exportProof(${proof.id})">Export</button>
                </div>
            </div>
        `).join('');

        this.updateProofStats();
    }

    updateProofStats() {
        const stats = {
            total: this.proofs.length,
            verified: this.proofs.filter(p => p.status === 'verified').length,
            pending: this.proofs.filter(p => p.status === 'generating').length,
            failed: this.proofs.filter(p => p.status === 'failed').length
        };

        Object.keys(stats).forEach(key => {
            const element = document.getElementById(`${key}Proofs`);
            if (element) element.textContent = stats[key];
        });
    }

    // Verification
    verifySingleProof() {
        const proofInput = document.getElementById('proofInput').value;
        const publicInput = document.getElementById('publicInput').value;
        const resultDiv = document.getElementById('verificationResult');

        if (!proofInput) {
            this.showVerificationResult('Please enter a proof to verify', 'error');
            return;
        }

        // Simulate verification
        const isValid = Math.random() > 0.05; // 95% success rate
        const result = {
            valid: isValid,
            proofHash: CryptoJS.SHA256(proofInput).toString(),
            verificationTime: Math.floor(Math.random() * 500) + 100,
            gasUsed: Math.floor(Math.random() * 5000) + 1000
        };

        this.verificationHistory.push({
            id: Date.now(),
            type: 'single',
            proof: proofInput.substring(0, 50) + '...',
            result: isValid ? 'valid' : 'invalid',
            timestamp: Date.now(),
            gasUsed: result.gasUsed
        });

        this.saveToStorage('zk_verification_history', this.verificationHistory);

        const message = isValid ?
            `✓ Proof verified successfully\nHash: ${result.proofHash}\nTime: ${result.verificationTime}ms\nGas: ${result.gasUsed}` :
            `✗ Proof verification failed\nHash: ${result.proofHash}\nTime: ${result.verificationTime}ms`;

        this.showVerificationResult(message, isValid ? 'success' : 'error');
        this.updateVerificationHistory();
        this.addActivity(`Single proof verification ${isValid ? 'successful' : 'failed'}`, isValid ? 'success' : 'error');
    }

    verifyBatchProofs() {
        const batchInput = document.getElementById('batchProofsInput').value;
        if (!batchInput.trim()) {
            this.showVerificationResult('Please enter proofs to verify', 'error');
            return;
        }

        const proofs = batchInput.split('\n').filter(p => p.trim());
        const results = proofs.map(proof => ({
            proof: proof.substring(0, 30) + '...',
            valid: Math.random() > 0.1, // 90% success rate
            time: Math.floor(Math.random() * 300) + 50
        }));

        const validCount = results.filter(r => r.valid).length;
        const totalTime = results.reduce((sum, r) => sum + r.time, 0);

        const message = `Batch verification completed\nTotal: ${proofs.length}\nValid: ${validCount}\nInvalid: ${proofs.length - validCount}\nTotal Time: ${totalTime}ms\nAvg Time: ${(totalTime / proofs.length).toFixed(1)}ms`;

        this.showVerificationResult(message, validCount === proofs.length ? 'success' : 'error');

        // Add to verification history
        results.forEach(result => {
            this.verificationHistory.push({
                id: Date.now(),
                type: 'batch',
                proof: result.proof,
                result: result.valid ? 'valid' : 'invalid',
                timestamp: Date.now(),
                gasUsed: Math.floor(Math.random() * 2000) + 500
            });
        });

        this.saveToStorage('zk_verification_history', this.verificationHistory);
        this.updateVerificationHistory();
        this.addActivity(`Batch verification completed: ${validCount}/${proofs.length} valid`, validCount === proofs.length ? 'success' : 'warning');
    }

    showVerificationResult(message, type) {
        const resultDiv = document.getElementById('verificationResult');
        if (resultDiv) {
            resultDiv.textContent = message;
            resultDiv.className = `verification-result ${type}`;
        }
    }

    updateVerificationHistory() {
        const historyDiv = document.getElementById('verificationHistory');
        if (!historyDiv) return;

        const recentHistory = this.verificationHistory.slice(-10).reverse();

        historyDiv.innerHTML = recentHistory.map(item => `
            <div class="history-item">
                <div class="history-content">
                    <div class="history-title">${item.type === 'single' ? 'Single' : 'Batch'} Verification</div>
                    <div class="history-meta">Proof: ${item.proof} | Result: ${item.result} | ${new Date(item.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }

    // Circuits
    saveCircuit() {
        const code = document.getElementById('circuitCode').value;
        if (!code.trim()) {
            this.showAlert('Please enter circuit code', 'error');
            return;
        }

        const circuit = {
            id: Date.now(),
            name: `Circuit_${Date.now()}`,
            code: code,
            timestamp: Date.now(),
            compiled: false
        };

        this.circuits.push(circuit);
        this.saveToStorage('zk_circuits', this.circuits);
        this.updateCircuitGrid();
        this.addActivity(`Circuit "${circuit.name}" saved`, 'success');
        this.showAlert('Circuit saved successfully', 'success');
    }

    updateCircuitGrid() {
        const grid = document.getElementById('circuitGrid');
        if (!grid) return;

        grid.innerHTML = this.circuits.slice(-6).reverse().map(circuit => `
            <div class="circuit-card">
                <div class="circuit-header">
                    <h4>${circuit.name}</h4>
                    <span class="circuit-status ${circuit.compiled ? 'compiled' : 'uncompiled'}">
                        ${circuit.compiled ? 'Compiled' : 'Uncompiled'}
                    </span>
                </div>
                <div class="circuit-meta">
                    <div>Created: ${new Date(circuit.timestamp).toLocaleDateString()}</div>
                    <div>Size: ${circuit.code.length} chars</div>
                </div>
                <div class="circuit-actions">
                    <button class="btn btn-small" onclick="zkLayer.compileCircuit(${circuit.id})">Compile</button>
                    <button class="btn btn-small btn-secondary" onclick="zkLayer.editCircuit(${circuit.id})">Edit</button>
                </div>
            </div>
        `).join('');
    }

    compileCircuit(circuitId) {
        const circuit = this.circuits.find(c => c.id === circuitId);
        if (!circuit) return;

        // Simulate compilation
        setTimeout(() => {
            circuit.compiled = true;
            this.saveToStorage('zk_circuits', this.circuits);
            this.updateCircuitGrid();
            this.addActivity(`Circuit "${circuit.name}" compiled successfully`, 'success');
        }, 1500);

        this.addActivity(`Compiling circuit "${circuit.name}"...`, 'info');
    }

    // Cryptography
    generateKeyPair() {
        const keyType = document.getElementById('keyType').value;
        const output = document.getElementById('keyOutput');

        // Simulate key generation
        const keyPair = {
            type: keyType,
            publicKey: this.generateRandomHex(128),
            privateKey: this.generateRandomHex(128),
            timestamp: Date.now()
        };

        this.keys.push(keyPair);
        this.saveToStorage('zk_keys', this.keys);

        output.textContent = `Key Pair Generated (${keyType.toUpperCase()})\n\nPublic Key:\n${keyPair.publicKey}\n\nPrivate Key:\n${keyPair.privateKey}\n\n⚠️ Keep private key secure!`;

        this.updateKeyStore();
        this.addActivity(`New ${keyType.toUpperCase()} key pair generated`, 'success');
    }

    encryptData() {
        const plainText = document.getElementById('plainText').value;
        const key = document.getElementById('encryptionKey').value;
        const output = document.getElementById('cryptoOutput');

        if (!plainText || !key) {
            output.textContent = 'Please enter both text and key';
            return;
        }

        const encrypted = CryptoJS.AES.encrypt(plainText, key).toString();
        output.textContent = `Encrypted Data:\n${encrypted}`;
        this.addActivity('Data encrypted successfully', 'success');
    }

    decryptData() {
        const encryptedText = document.getElementById('plainText').value;
        const key = document.getElementById('encryptionKey').value;
        const output = document.getElementById('cryptoOutput');

        if (!encryptedText || !key) {
            output.textContent = 'Please enter both encrypted text and key';
            return;
        }

        try {
            const decrypted = CryptoJS.AES.decrypt(encryptedText, key).toString(CryptoJS.enc.Utf8);
            output.textContent = `Decrypted Data:\n${decrypted}`;
            this.addActivity('Data decrypted successfully', 'success');
        } catch (error) {
            output.textContent = 'Decryption failed - invalid key or data';
            this.addActivity('Data decryption failed', 'error');
        }
    }

    computeHash() {
        const input = document.getElementById('hashInput').value;
        const algorithm = document.getElementById('hashAlgorithm').value;
        const output = document.getElementById('hashOutput');

        if (!input) {
            output.textContent = 'Please enter text to hash';
            return;
        }

        let hash;
        switch (algorithm) {
            case 'sha256':
                hash = CryptoJS.SHA256(input).toString();
                break;
            case 'keccak256':
                hash = CryptoJS.SHA3(input, { outputLength: 256 }).toString();
                break;
            case 'poseidon':
                // Simulate Poseidon hash
                hash = this.generateRandomHex(64);
                break;
        }

        output.textContent = `${algorithm.toUpperCase()} Hash:\n${hash}`;
        this.addActivity(`${algorithm.toUpperCase()} hash computed`, 'success');
    }

    updateKeyStore() {
        const keyStore = document.getElementById('keyStore');
        if (!keyStore) return;

        keyStore.innerHTML = this.keys.slice(-5).reverse().map(key => `
            <div class="key-item">
                <div class="key-info">
                    <div class="key-name">${key.type.toUpperCase()} Key Pair</div>
                    <div class="key-meta">Created: ${new Date(key.timestamp).toLocaleDateString()}</div>
                </div>
                <div class="key-actions">
                    <button class="btn btn-small" onclick="zkLayer.exportKey(${key.timestamp})">Export</button>
                    <button class="btn btn-small btn-danger" onclick="zkLayer.deleteKey(${key.timestamp})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Security
    runSecurityAudit() {
        this.addActivity('Security audit started', 'info');

        setTimeout(() => {
            const vulnerabilities = Math.floor(Math.random() * 3);
            const message = vulnerabilities === 0 ?
                'Security audit completed - No vulnerabilities found' :
                `Security audit completed - ${vulnerabilities} potential vulnerabilities detected`;

            this.showAlert(message, vulnerabilities === 0 ? 'success' : 'warning');
            this.addActivity(message, vulnerabilities === 0 ? 'success' : 'warning');
        }, 3000);
    }

    runThreatAnalysis() {
        this.addActivity('Threat analysis started', 'info');

        setTimeout(() => {
            const threats = Math.floor(Math.random() * 2);
            const message = threats === 0 ?
                'Threat analysis completed - No active threats detected' :
                `Threat analysis completed - ${threats} potential threats identified`;

            this.showAlert(message, threats === 0 ? 'success' : 'warning');
            this.addActivity(message, threats === 0 ? 'success' : 'warning');
        }, 2500);
    }

    getDefaultSecurityPolicies() {
        return [
            { id: 1, name: 'Zero-Knowledge Proof Validation', enabled: true, description: 'Validate all ZK proofs before processing' },
            { id: 2, name: 'Circuit Security Audit', enabled: true, description: 'Automatically audit circuits for vulnerabilities' },
            { id: 3, name: 'Key Rotation Policy', enabled: true, description: 'Rotate cryptographic keys every 90 days' },
            { id: 4, name: 'Access Control', enabled: true, description: 'Enforce role-based access to sensitive operations' },
            { id: 5, name: 'Audit Logging', enabled: true, description: 'Log all cryptographic operations' }
        ];
    }

    // Settings
    getDefaultSettings() {
        return {
            protocolType: 'groth16',
            curveType: 'bn128',
            proofFormat: 'json',
            enableOptimization: true,
            enableCaching: true,
            maxConcurrentProofs: 10,
            proofTimeout: 300,
            enableEncryption: true,
            enableAudit: true,
            keyRotation: 90,
            maxFailedAttempts: 5
        };
    }

    saveSettings() {
        const settings = {
            protocolType: document.getElementById('protocolType').value,
            curveType: document.getElementById('curveType').value,
            proofFormat: document.getElementById('proofFormat').value,
            enableOptimization: document.getElementById('enableOptimization').checked,
            enableCaching: document.getElementById('enableCaching').checked,
            maxConcurrentProofs: parseInt(document.getElementById('maxConcurrentProofs').value),
            proofTimeout: parseInt(document.getElementById('proofTimeout').value),
            enableEncryption: document.getElementById('enableEncryption').checked,
            enableAudit: document.getElementById('enableAudit').checked,
            keyRotation: parseInt(document.getElementById('keyRotation').value),
            maxFailedAttempts: parseInt(document.getElementById('maxFailedAttempts').value)
        };

        this.settings = settings;
        this.saveToStorage('zk_settings', settings);
        this.showAlert('Settings saved successfully', 'success');
        this.addActivity('Settings updated', 'success');
    }

    resetSettings() {
        this.settings = this.getDefaultSettings();
        this.saveToStorage('zk_settings', this.settings);
        this.loadSettingsToUI();
        this.showAlert('Settings reset to defaults', 'success');
        this.addActivity('Settings reset to defaults', 'info');
    }

    loadSettingsToUI() {
        Object.keys(this.settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.settings[key];
                } else {
                    element.value = this.settings[key];
                }
            }
        });
    }

    // Real-time Updates
    startRealTimeUpdates() {
        this.intervals.metrics = setInterval(() => {
            if (this.currentSection === 'dashboard') {
                this.updateMetrics();
            }
        }, 5000);

        this.intervals.charts = setInterval(() => {
            if (this.currentSection === 'dashboard' || this.currentSection === 'analytics') {
                this.updateCharts();
            }
        }, 10000);
    }

    // Utility Methods
    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    generateRandomHex(length) {
        return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    showAlert(message, type = 'info') {
        const alertModal = document.getElementById('alertModal');
        const alertMessage = document.getElementById('alertMessage');
        const alertTitle = document.getElementById('alertTitle');

        alertTitle.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        alertMessage.textContent = message;
        alertModal.classList.add('show');
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    emergencyStop() {
        // Stop all intervals
        Object.values(this.intervals).forEach(interval => clearInterval(interval));

        // Update UI
        document.getElementById('connectionStatus').className = 'status-offline';
        document.getElementById('connectionStatusText').textContent = 'ZK Layer Stopped';

        this.addActivity('Emergency stop activated - ZK Layer halted', 'error');
        this.showAlert('Emergency stop activated. All ZK operations halted.', 'error');
    }

    loadInitialData() {
        // Load sample data if empty
        if (this.circuits.length === 0) {
            this.circuits = [
                {
                    id: 1,
                    name: 'Age Verification Circuit',
                    code: 'template AgeVerification() {\n    signal input age;\n    signal input threshold;\n    signal output isAdult;\n    \n    isAdult <== age >= threshold;\n}\n\ncomponent main = AgeVerification();',
                    timestamp: Date.now() - 86400000,
                    compiled: true
                },
                {
                    id: 2,
                    name: 'Hash Preimage Circuit',
                    code: 'template HashPreimage() {\n    signal input preimage;\n    signal input hash;\n    signal output isValid;\n    \n    component hasher = SHA256();\n    hasher.preimage <== preimage;\n    isValid <== hasher.hash === hash;\n}\n\ncomponent main = HashPreimage();',
                    timestamp: Date.now() - 43200000,
                    compiled: false
                }
            ];
            this.saveToStorage('zk_circuits', this.circuits);
        }

        if (this.proofs.length === 0) {
            this.proofs = [
                {
                    id: 1,
                    name: 'Sample Proof 1',
                    circuitId: 1,
                    status: 'verified',
                    timestamp: Date.now() - 3600000,
                    gasUsed: 7500
                },
                {
                    id: 2,
                    name: 'Sample Proof 2',
                    circuitId: 2,
                    status: 'verified',
                    timestamp: Date.now() - 1800000,
                    gasUsed: 6200
                }
            ];
            this.saveToStorage('zk_proofs', this.proofs);
        }

        this.loadSettingsToUI();
    }

    updateUI() {
        switch (this.currentSection) {
            case 'dashboard':
                this.updateMetrics();
                this.updateActivityLog();
                break;
            case 'proofs':
                this.updateProofGrid();
                break;
            case 'verification':
                this.updateVerificationHistory();
                break;
            case 'circuits':
                this.updateCircuitGrid();
                break;
            case 'cryptography':
                this.updateKeyStore();
                break;
            case 'security':
                this.updateSecurityPolicies();
                break;
        }
    }

    updateSecurityPolicies() {
        const policiesList = document.getElementById('securityPoliciesList');
        if (!policiesList) return;

        policiesList.innerHTML = this.securityPolicies.map(policy => `
            <div class="policy-item">
                <div class="policy-info">
                    <div class="policy-name">${policy.name}</div>
                    <div class="policy-desc">${policy.description}</div>
                </div>
                <div class="policy-toggle">
                    <input type="checkbox" ${policy.enabled ? 'checked' : ''} onchange="zkLayer.togglePolicy(${policy.id})">
                </div>
            </div>
        `).join('');
    }

    togglePolicy(policyId) {
        const policy = this.securityPolicies.find(p => p.id === policyId);
        if (policy) {
            policy.enabled = !policy.enabled;
            this.addActivity(`Policy "${policy.name}" ${policy.enabled ? 'enabled' : 'disabled'}`, 'info');
        }
    }
}

// Initialize the application
const zkLayer = new ZeroKnowledgeLayer();

// Make methods available globally for onclick handlers
window.zkLayer = zkLayer;