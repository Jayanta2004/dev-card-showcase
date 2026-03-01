// Distributed Log Integrity Validator - JavaScript Implementation

class DistributedLogIntegrityValidator {
    constructor() {
        this.nodes = [];
        this.nodeCount = 5;
        this.logsPerNode = 10;
        this.isValidating = false;

        this.initializeElements();
        this.bindEvents();
        this.updateUI();
    }

    initializeElements() {
        // Control elements
        this.nodeCountSelect = document.getElementById('nodeCount');
        this.logCountSelect = document.getElementById('logCount');
        this.generateLogsBtn = document.getElementById('generateLogs');
        this.validateIntegrityBtn = document.getElementById('validateIntegrity');
        this.simulateTamperingBtn = document.getElementById('simulateTampering');
        this.resetSystemBtn = document.getElementById('resetSystem');

        // Tampering controls
        this.tamperingControls = document.getElementById('tamperingControls');
        this.tamperNodeSelect = document.getElementById('tamperNode');
        this.tamperLogSelect = document.getElementById('tamperLog');
        this.applyTamperingBtn = document.getElementById('applyTampering');

        // Status elements
        this.overallStatus = document.getElementById('overallStatus');
        this.statusIndicator = this.overallStatus.querySelector('.status-indicator');
        this.integrityScore = document.getElementById('integrityScore');

        // Results elements
        this.hashResults = document.getElementById('hashResults');
        this.consistencyResults = document.getElementById('consistencyResults');
        this.anomalyResults = document.getElementById('anomalyResults');

        // Nodes visualization
        this.nodesGrid = document.getElementById('nodesGrid');
    }

    bindEvents() {
        this.nodeCountSelect.addEventListener('change', (e) => {
            this.nodeCount = parseInt(e.target.value);
            this.updateUI();
        });

        this.logCountSelect.addEventListener('change', (e) => {
            this.logsPerNode = parseInt(e.target.value);
        });

        this.generateLogsBtn.addEventListener('click', () => this.generateLogs());
        this.validateIntegrityBtn.addEventListener('click', () => this.validateIntegrity());
        this.simulateTamperingBtn.addEventListener('click', () => this.showTamperingControls());
        this.resetSystemBtn.addEventListener('click', () => this.resetSystem());
        this.applyTamperingBtn.addEventListener('click', () => this.applyTampering());
    }

    updateUI() {
        this.updateTamperNodeOptions();
        this.renderNodes();
        this.updateStatus('ready');
    }

    updateStatus(status, score = 100) {
        const statusText = {
            'ready': 'System Ready',
            'generating': 'Generating Logs...',
            'validating': 'Validating Integrity...',
            'compromised': 'Integrity Compromised',
            'valid': 'All Systems Valid'
        };

        this.statusIndicator.className = `status-indicator ${status}`;
        this.statusIndicator.querySelector('span').textContent = statusText[status] || statusText['ready'];

        this.integrityScore.textContent = `${score}%`;
        this.integrityScore.className = score < 100 ? 'score-value compromised' : 'score-value';
    }

    async generateLogs() {
        this.updateStatus('generating');
        this.nodes = [];

        // Generate nodes with logs
        for (let i = 0; i < this.nodeCount; i++) {
            const node = {
                id: i + 1,
                name: `Node-${i + 1}`,
                logs: [],
                status: 'unknown'
            };

            // Generate logs for this node
            for (let j = 0; j < this.logsPerNode; j++) {
                const logEntry = this.generateLogEntry(j + 1);
                const hash = await this.hashLogEntry(logEntry);
                node.logs.push({
                    id: j + 1,
                    content: logEntry,
                    hash: hash,
                    tampered: false
                });
            }

            this.nodes.push(node);
        }

        this.renderNodes();
        this.updateStatus('ready');
        this.clearResults();
    }

    generateLogEntry(id) {
        const events = [
            'User login attempt',
            'Database query executed',
            'File access granted',
            'Network connection established',
            'Configuration change applied',
            'Security scan completed',
            'Backup process started',
            'Authentication token issued',
            'Permission check performed',
            'Audit log entry created'
        ];

        const severities = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
        const users = ['alice', 'bob', 'charlie', 'diana', 'eve', 'frank'];

        const event = events[Math.floor(Math.random() * events.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString();

        return `[${timestamp}] ${severity} - ${event} by user ${user} (ID: ${id})`;
    }

    async hashLogEntry(logEntry) {
        const encoder = new TextEncoder();
        const data = encoder.encode(logEntry);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async validateIntegrity() {
        if (this.nodes.length === 0) {
            alert('Please generate logs first.');
            return;
        }

        this.updateStatus('validating');
        this.isValidating = true;

        // Perform validation
        const validationResults = await this.performValidation();

        // Update UI with results
        this.displayValidationResults(validationResults);
        this.renderNodes();

        this.isValidating = false;
    }

    async performValidation() {
        const results = {
            hashVerification: [],
            consistencyCheck: [],
            anomalies: [],
            integrityScore: 100
        };

        // Hash verification (check if stored hashes match current content)
        for (const node of this.nodes) {
            let nodeValid = true;
            for (const log of node.logs) {
                const currentHash = await this.hashLogEntry(log.content);
                const hashValid = currentHash === log.hash;

                if (!hashValid) {
                    nodeValid = false;
                    results.anomalies.push({
                        type: 'hash_mismatch',
                        node: node.id,
                        log: log.id,
                        expected: log.hash,
                        actual: currentHash
                    });
                }
            }

            results.hashVerification.push({
                nodeId: node.id,
                valid: nodeValid
            });

            node.status = nodeValid ? 'valid' : 'invalid';
        }

        // Cross-node consistency check
        if (this.nodes.length > 1) {
            const referenceNode = this.nodes[0];
            const referenceHashes = referenceNode.logs.map(log => log.hash);

            for (let i = 1; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                const nodeHashes = node.logs.map(log => log.hash);
                const consistent = this.arraysEqual(referenceHashes, nodeHashes);

                results.consistencyCheck.push({
                    nodeId: node.id,
                    consistent: consistent,
                    differences: this.findDifferences(referenceHashes, nodeHashes)
                });

                if (!consistent) {
                    node.status = 'invalid';
                    results.integrityScore -= 20;
                }
            }
        }

        // Calculate final integrity score
        const invalidNodes = this.nodes.filter(node => node.status === 'invalid').length;
        results.integrityScore = Math.max(0, 100 - (invalidNodes * 20) - (results.anomalies.length * 5));

        return results;
    }

    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        return a.every((val, index) => val === b[index]);
    }

    findDifferences(a, b) {
        const differences = [];
        const maxLength = Math.max(a.length, b.length);

        for (let i = 0; i < maxLength; i++) {
            if (a[i] !== b[i]) {
                differences.push({
                    index: i,
                    expected: a[i],
                    actual: b[i]
                });
            }
        }

        return differences;
    }

    displayValidationResults(results) {
        this.updateStatus(results.integrityScore < 100 ? 'compromised' : 'valid', results.integrityScore);

        // Hash verification results
        this.hashResults.innerHTML = results.hashVerification.map(result => `
            <div class="validation-item ${result.valid ? 'valid' : 'invalid'}">
                <strong>Node ${result.nodeId}:</strong> ${result.valid ? '✓ Valid' : '✗ Invalid'}
            </div>
        `).join('');

        // Consistency results
        this.consistencyResults.innerHTML = results.consistencyCheck.map(result => `
            <div class="validation-item ${result.consistent ? 'valid' : 'invalid'}">
                <strong>Node ${result.nodeId} vs Reference:</strong>
                ${result.consistent ? '✓ Consistent' : `✗ Inconsistent (${result.differences.length} differences)`}
            </div>
        `).join('');

        // Anomalies
        if (results.anomalies.length > 0) {
            this.anomalyResults.innerHTML = results.anomalies.map(anomaly => `
                <div class="anomaly-item">
                    <strong>${anomaly.type.replace('_', ' ').toUpperCase()}</strong><br>
                    Node ${anomaly.node}, Log ${anomaly.log}<br>
                    <small>Expected: ${anomaly.expected.substring(0, 16)}...</small><br>
                    <small>Actual: ${anomaly.actual.substring(0, 16)}...</small>
                </div>
            `).join('');
        } else {
            this.anomalyResults.innerHTML = '<p>No anomalies detected.</p>';
        }
    }

    clearResults() {
        this.hashResults.innerHTML = '<p>Generate logs to see hash verification results.</p>';
        this.consistencyResults.innerHTML = '<p>Run validation to check cross-node consistency.</p>';
        this.anomalyResults.innerHTML = '<p>No anomalies detected.</p>';
    }

    showTamperingControls() {
        if (this.nodes.length === 0) {
            alert('Please generate logs first.');
            return;
        }

        this.tamperingControls.style.display = 'block';
        this.updateTamperNodeOptions();
        this.tamperingControls.scrollIntoView({ behavior: 'smooth' });
    }

    updateTamperNodeOptions() {
        this.tamperNodeSelect.innerHTML = '';
        this.nodes.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id - 1;
            option.textContent = `Node ${node.id}`;
            this.tamperNodeSelect.appendChild(option);
        });

        this.updateTamperLogOptions();
        this.tamperNodeSelect.addEventListener('change', () => this.updateTamperLogOptions());
    }

    updateTamperLogOptions() {
        const selectedNodeIndex = parseInt(this.tamperNodeSelect.value);
        const selectedNode = this.nodes[selectedNodeIndex];

        this.tamperLogSelect.innerHTML = '';
        selectedNode.logs.forEach(log => {
            const option = document.createElement('option');
            option.value = log.id - 1;
            option.textContent = `Log ${log.id}`;
            this.tamperLogSelect.appendChild(option);
        });
    }

    async applyTampering() {
        const nodeIndex = parseInt(this.tamperNodeSelect.value);
        const logIndex = parseInt(this.tamperLogSelect.value);
        const tamperType = document.querySelector('input[name="tamperType"]:checked').value;

        const node = this.nodes[nodeIndex];
        const log = node.logs[logIndex];

        switch (tamperType) {
            case 'modify':
                // Modify the log content
                log.content += ' [TAMPERED]';
                log.tampered = true;
                break;
            case 'delete':
                // Mark log as deleted (remove from array)
                node.logs.splice(logIndex, 1);
                break;
            case 'insert':
                // Insert a fake log entry
                const fakeLog = {
                    id: node.logs.length + 1,
                    content: '[FAKE ENTRY] Suspicious activity detected',
                    hash: await this.hashLogEntry('[FAKE ENTRY] Suspicious activity detected'),
                    tampered: true
                };
                node.logs.splice(logIndex + 1, 0, fakeLog);
                break;
        }

        this.renderNodes();
        this.tamperingControls.style.display = 'none';
        alert('Tampering applied. Run validation to see the impact.');
    }

    renderNodes() {
        this.nodesGrid.innerHTML = '';

        this.nodes.forEach(node => {
            const nodeCard = document.createElement('div');
            nodeCard.className = `node-card ${node.status}`;

            nodeCard.innerHTML = `
                <div class="node-header">
                    <div class="node-name">${node.name}</div>
                    <div class="node-status ${node.status}">${node.status.toUpperCase()}</div>
                </div>
                <div class="node-logs">
                    ${node.logs.map(log => `
                        <div class="log-entry ${log.tampered ? 'tampered' : ''}">
                            ${log.content}
                            <div class="log-hash">SHA-256: ${log.hash}</div>
                        </div>
                    `).join('')}
                </div>
            `;

            this.nodesGrid.appendChild(nodeCard);
        });
    }

    resetSystem() {
        this.nodes = [];
        this.updateStatus('ready');
        this.clearResults();
        this.tamperingControls.style.display = 'none';
        this.renderNodes();
    }
}

// Initialize the validator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DistributedLogIntegrityValidator();
});