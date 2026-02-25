document.addEventListener('DOMContentLoaded', function() {
    const identityInput = document.getElementById('identity-input');
    const abstractionLevel = document.getElementById('abstraction-level');
    const operation = document.getElementById('operation');
    const processBtn = document.getElementById('process-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('identity-canvas');
    const ctx = canvas.getContext('2d');
    const encryptionStrength = document.getElementById('encryption-strength');
    const anonymityLevel = document.getElementById('anonymity-level');
    const verificationConfidence = document.getElementById('verification-confidence');

    let currentIdentity = null;

    processBtn.addEventListener('click', processIdentity);

    // Initialize with default identity
    initializeDefaultIdentity();

    function initializeDefaultIdentity() {
        const defaultIdentity = {
            id: generateId(),
            name: "Anonymous User",
            email: "user@example.com",
            attributes: ["standard", "verified"],
            created: new Date().toISOString(),
            status: "active"
        };
        identityInput.value = JSON.stringify(defaultIdentity, null, 2);
        currentIdentity = defaultIdentity;
        drawIdentityFlow(defaultIdentity);
    }

    function processIdentity() {
        try {
            const input = JSON.parse(identityInput.value);
            const level = abstractionLevel.value;
            const op = operation.value;

            resultsDiv.innerHTML = '<div class="loading">Processing identity...</div>';

            // Simulate processing
            setTimeout(() => {
                const results = simulateIdentityProcessing(input, level, op);
                displayResults(results);
                updateMetrics(results);
                drawIdentityFlow(input, results);
                currentIdentity = input;
            }, 2000);

        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    function simulateIdentityProcessing(identity, level, operation) {
        const baseResults = {
            operation: operation,
            level: level,
            timestamp: new Date().toISOString(),
            success: true
        };

        switch (operation) {
            case 'create':
                return {
                    ...baseResults,
                    identityId: generateId(),
                    publicKey: generateKey(),
                    privateKey: generateKey(),
                    certificate: generateCertificate(identity, level),
                    abstractionLayers: getAbstractionLayers(level)
                };

            case 'verify':
                return {
                    ...baseResults,
                    isValid: Math.random() > 0.1,
                    confidence: Math.random() * 0.3 + 0.7,
                    checks: ['signature', 'certificate', 'attributes'],
                    verificationTime: Math.random() * 100 + 50
                };

            case 'update':
                return {
                    ...baseResults,
                    changes: ['attributes', 'status'],
                    newAttributes: [...identity.attributes, 'updated'],
                    updateHash: generateHash(),
                    rollbackAvailable: true
                };

            case 'revoke':
                return {
                    ...baseResults,
                    revocationReason: 'user_request',
                    revocationCertificate: generateCertificate(identity, 'revoked'),
                    effectiveDate: new Date().toISOString()
                };
        }
    }

    function getAbstractionLayers(level) {
        const layers = {
            low: ['Basic Encryption', 'Access Control'],
            medium: ['Hash-based Identity', 'Attribute-based Access', 'Audit Logging'],
            high: ['Zero-Knowledge Proofs', 'Homomorphic Encryption', 'Secure Multi-party Computation'],
            maximum: ['Fully Homomorphic Encryption', 'Secure Enclave', 'Distributed Trust', 'Quantum-resistant Crypto']
        };
        return layers[level];
    }

    function generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    function generateKey() {
        return 'key_' + Math.random().toString(36).substr(2, 16).toUpperCase();
    }

    function generateCertificate(identity, level) {
        return `cert_${level}_${identity.id}_${Date.now()}`;
    }

    function generateHash() {
        return 'hash_' + Math.random().toString(36).substr(2, 12).toUpperCase();
    }

    function displayResults(results) {
        let output = `Operation: ${results.operation.toUpperCase()}\n`;
        output += `Abstraction Level: ${results.level.toUpperCase()}\n`;
        output += `Timestamp: ${results.timestamp}\n`;
        output += `Success: ${results.success}\n\n`;

        if (results.identityId) {
            output += `Identity ID: ${results.identityId}\n`;
            output += `Public Key: ${results.publicKey}\n`;
            output += `Certificate: ${results.certificate}\n`;
            output += `Abstraction Layers: ${results.abstractionLayers.join(', ')}\n`;
        }

        if (results.isValid !== undefined) {
            output += `Valid: ${results.isValid}\n`;
            output += `Confidence: ${(results.confidence * 100).toFixed(1)}%\n`;
            output += `Verification Time: ${results.verificationTime.toFixed(1)}ms\n`;
        }

        if (results.changes) {
            output += `Changes: ${results.changes.join(', ')}\n`;
            output += `New Attributes: ${results.newAttributes.join(', ')}\n`;
            output += `Update Hash: ${results.updateHash}\n`;
        }

        if (results.revocationReason) {
            output += `Revocation Reason: ${results.revocationReason}\n`;
            output += `Effective Date: ${results.effectiveDate}\n`;
        }

        resultsDiv.innerHTML = `<pre>${output}</pre>`;
    }

    function updateMetrics(results) {
        const levelMultipliers = {
            low: { encryption: 128, anonymity: 0.3, confidence: 0.8 },
            medium: { encryption: 256, anonymity: 0.6, confidence: 0.9 },
            high: { encryption: 512, anonymity: 0.8, confidence: 0.95 },
            maximum: { encryption: 1024, anonymity: 0.95, confidence: 0.99 }
        };

        const multipliers = levelMultipliers[results.level];

        encryptionStrength.textContent = `${multipliers.encryption} bits`;
        anonymityLevel.textContent = `${(multipliers.anonymity * 100).toFixed(1)}%`;
        verificationConfidence.textContent = `${(multipliers.confidence * 100).toFixed(1)}%`;
    }

    function drawIdentityFlow(identity, results = null) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw identity core
        ctx.beginPath();
        ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Identity', centerX, centerY + 5);

        // Draw abstraction layers
        const layers = getAbstractionLayers(abstractionLevel.value);
        const radiusStep = 60;

        layers.forEach((layer, index) => {
            const radius = 40 + (index + 1) * radiusStep;

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(52, 152, 219, ${0.8 - index * 0.2})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Layer label
            const angle = (index / layers.length) * 2 * Math.PI;
            const labelX = centerX + Math.cos(angle) * (radius + 20);
            const labelY = centerY + Math.sin(angle) * (radius + 20);

            ctx.fillStyle = '#ecf0f1';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(layer, labelX, labelY);
        });

        // Draw operation flow if results exist
        if (results) {
            drawOperationFlow(centerX, centerY, results);
        }
    }

    function drawOperationFlow(centerX, centerY, results) {
        const operations = ['create', 'verify', 'update', 'revoke'];
        const opIndex = operations.indexOf(results.operation);

        // Draw operation arrow
        const startX = centerX - 100;
        const startY = centerY - 100 + opIndex * 50;
        const endX = centerX;
        const endY = centerY;

        // Arrow shaft
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI/6), endY - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI/6), endY - 10 * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fillStyle = '#e74c3c';
        ctx.fill();

        // Operation label
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(results.operation.toUpperCase(), startX + (endX - startX)/2, startY + (endY - startY)/2 - 5);
    }

    // Update visualization when inputs change
    identityInput.addEventListener('input', function() {
        try {
            const identity = JSON.parse(this.value);
            drawIdentityFlow(identity);
        } catch (e) {
            // Invalid JSON, skip update
        }
    });

    abstractionLevel.addEventListener('change', function() {
        if (currentIdentity) {
            drawIdentityFlow(currentIdentity);
        }
    });
});