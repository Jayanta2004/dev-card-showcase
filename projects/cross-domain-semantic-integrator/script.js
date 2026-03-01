// Cross-Domain Semantic Integrator - JavaScript Implementation

class CrossDomainSemanticIntegrator {
    constructor() {
        this.domains = [];
        this.entities = [];
        this.relationships = [];
        this.correlations = [];
        this.insights = [];
        this.activityLog = [];
        this.graphNodes = [];
        this.graphEdges = [];
        this.isIntegrating = false;
        this.similarityThreshold = 0.8;
        this.maxRelationships = 5;
        this.processingMode = 'streaming';

        this.metrics = {
            dataSources: 6,
            entitiesMapped: 2847,
            semanticConfidence: 94,
            graphNodes: 15632,
            graphEdges: 48921,
            processingSpeed: 1200000,
            mappingAccuracy: 96.4,
            integrationTime: 2.3,
            memoryUsage: 1.8
        };

        this.initializeElements();
        this.bindEvents();
        this.initializeDomains();
        this.initializeEntities();
        this.startIntegration();
        this.updateUI();
    }

    initializeElements() {
        // Status elements
        this.dataSourcesEl = document.getElementById('dataSources');
        this.entitiesMappedEl = document.getElementById('entitiesMapped');
        this.semanticConfidenceEl = document.getElementById('semanticConfidence');
        this.graphNodesEl = document.getElementById('graphNodes');
        this.graphEdgesEl = document.getElementById('graphEdges');

        // Panel elements
        this.domainGrid = document.getElementById('domainGrid');
        this.sourceDomainSelect = document.getElementById('sourceDomain');
        this.targetDomainSelect = document.getElementById('targetDomain');
        this.sourceEntities = document.getElementById('sourceEntities');
        this.targetEntities = document.getElementById('targetEntities');
        this.mappingConfidenceEl = document.getElementById('mappingConfidence');
        this.correlationResults = document.getElementById('correlationResults');
        this.processingSpeedEl = document.getElementById('processingSpeed');
        this.mappingAccuracyEl = document.getElementById('mappingAccuracy');
        this.integrationTimeEl = document.getElementById('integrationTime');
        this.memoryUsageEl = document.getElementById('memoryUsage');
        this.insightsList = document.getElementById('insightsList');
        this.activityLogEl = document.getElementById('activityLog');

        // Control elements
        this.similarityThresholdInput = document.getElementById('similarityThreshold');
        this.similarityThresholdValueEl = document.getElementById('similarityThresholdValue');
        this.maxRelationshipsInput = document.getElementById('maxRelationships');
        this.maxRelationshipsValueEl = document.getElementById('maxRelationshipsValue');
        this.processingModeSelect = document.getElementById('processingMode');
        this.startIntegrationBtn = document.getElementById('startIntegration');
        this.pauseIntegrationBtn = document.getElementById('pauseIntegration');
        this.resetIntegrationBtn = document.getElementById('resetIntegration');

        // Modal elements
        this.domainModal = document.getElementById('domainModal');
        this.entityModal = document.getElementById('entityModal');
        this.addDomainBtn = document.getElementById('addDomain');
        this.closeDomainModal = document.getElementById('closeDomainModal');
        this.domainForm = document.getElementById('domainForm');
        this.closeEntityModal = document.getElementById('closeEntityModal');
        this.entityDetails = document.getElementById('entityDetails');

        // Other elements
        this.autoMapBtn = document.getElementById('autoMap');
        this.analyzeCorrelationsBtn = document.getElementById('analyzeCorrelations');
        this.generateInsightsBtn = document.getElementById('generateInsights');
        this.clearLogBtn = document.getElementById('clearLog');
        this.graphLayoutSelect = document.getElementById('graphLayout');
        this.resetGraphBtn = document.getElementById('resetGraph');
        this.metricsTimeframeSelect = document.getElementById('metricsTimeframe');
    }

    bindEvents() {
        this.similarityThresholdInput.addEventListener('input', (e) => {
            this.similarityThreshold = parseFloat(e.target.value);
            this.similarityThresholdValueEl.textContent = this.similarityThreshold.toFixed(1);
        });

        this.maxRelationshipsInput.addEventListener('input', (e) => {
            this.maxRelationships = parseInt(e.target.value);
            this.maxRelationshipsValueEl.textContent = this.maxRelationships;
        });

        this.processingModeSelect.addEventListener('change', (e) => {
            this.processingMode = e.target.value;
            this.addActivityLog('info', `Processing mode changed to ${this.processingMode}`);
        });

        this.startIntegrationBtn.addEventListener('click', () => this.startIntegration());
        this.pauseIntegrationBtn.addEventListener('click', () => this.pauseIntegration());
        this.resetIntegrationBtn.addEventListener('click', () => this.resetIntegration());

        this.addDomainBtn.addEventListener('click', () => this.showDomainModal());
        this.closeDomainModal.addEventListener('click', () => this.hideDomainModal());
        this.domainForm.addEventListener('submit', (e) => this.createDomain(e));

        this.closeEntityModal.addEventListener('click', () => this.hideEntityModal());
        this.sourceDomainSelect.addEventListener('change', () => this.updateEntityLists());
        this.targetDomainSelect.addEventListener('change', () => this.updateEntityLists());

        this.autoMapBtn.addEventListener('click', () => this.autoMapEntities());
        this.analyzeCorrelationsBtn.addEventListener('click', () => this.analyzeCorrelations());
        this.generateInsightsBtn.addEventListener('click', () => this.generateInsights());
        this.clearLogBtn.addEventListener('click', () => this.clearActivityLog());

        this.graphLayoutSelect.addEventListener('change', () => this.updateGraph());
        this.resetGraphBtn.addEventListener('click', () => this.resetGraph());
        this.metricsTimeframeSelect.addEventListener('change', () => this.updateMetrics());
    }

    initializeDomains() {
        this.domains = [
            {
                id: 'customer',
                name: 'Customer Data',
                type: 'customer',
                entityCount: 1250,
                description: 'Customer profiles, preferences, and behavior data',
                lastUpdated: new Date(Date.now() - 3600000)
            },
            {
                id: 'product',
                name: 'Product Data',
                type: 'product',
                entityCount: 850,
                description: 'Product catalog, specifications, and inventory',
                lastUpdated: new Date(Date.now() - 7200000)
            },
            {
                id: 'sales',
                name: 'Sales Data',
                type: 'sales',
                entityCount: 2100,
                description: 'Sales transactions, orders, and revenue data',
                lastUpdated: new Date(Date.now() - 1800000)
            },
            {
                id: 'support',
                name: 'Support Data',
                type: 'support',
                entityCount: 680,
                description: 'Customer support tickets and interactions',
                lastUpdated: new Date(Date.now() - 900000)
            },
            {
                id: 'inventory',
                name: 'Inventory Data',
                type: 'inventory',
                entityCount: 450,
                description: 'Stock levels, warehouse locations, and supply chain',
                lastUpdated: new Date(Date.now() - 2700000)
            },
            {
                id: 'financial',
                name: 'Financial Data',
                type: 'financial',
                entityCount: 320,
                description: 'Financial transactions, budgets, and forecasts',
                lastUpdated: new Date(Date.now() - 4500000)
            }
        ];

        this.renderDomains();
        this.updateDomainSelects();
    }

    initializeEntities() {
        // Sample entities for each domain
        this.entities = [
            // Customer entities
            { id: 'cust-001', domain: 'customer', name: 'John Smith', type: 'person', attributes: { email: 'john@example.com', segment: 'premium' } },
            { id: 'cust-002', domain: 'customer', name: 'Jane Doe', type: 'person', attributes: { email: 'jane@example.com', segment: 'standard' } },
            { id: 'cust-003', domain: 'customer', name: 'TechCorp Inc', type: 'organization', attributes: { industry: 'technology', size: 'enterprise' } },

            // Product entities
            { id: 'prod-001', domain: 'product', name: 'Laptop Pro X1', type: 'product', attributes: { category: 'electronics', price: 1299.99 } },
            { id: 'prod-002', domain: 'product', name: 'Wireless Headphones', type: 'product', attributes: { category: 'audio', price: 199.99 } },
            { id: 'prod-003', domain: 'product', name: 'Software License', type: 'service', attributes: { category: 'software', price: 49.99 } },

            // Sales entities
            { id: 'sale-001', domain: 'sales', name: 'Order #12345', type: 'transaction', attributes: { amount: 1499.98, status: 'completed' } },
            { id: 'sale-002', domain: 'sales', name: 'Quote #67890', type: 'quote', attributes: { amount: 2499.99, status: 'pending' } },

            // Support entities
            { id: 'supp-001', domain: 'support', name: 'Ticket #1001', type: 'ticket', attributes: { priority: 'high', status: 'open' } },
            { id: 'supp-002', domain: 'support', name: 'Ticket #1002', type: 'ticket', attributes: { priority: 'medium', status: 'resolved' } },

            // Inventory entities
            { id: 'inv-001', domain: 'inventory', name: 'Warehouse A', type: 'location', attributes: { capacity: 10000, utilization: 85 } },
            { id: 'inv-002', domain: 'inventory', name: 'Stock Item X1', type: 'item', attributes: { quantity: 150, reorderPoint: 50 } },

            // Financial entities
            { id: 'fin-001', domain: 'financial', name: 'Invoice #INV001', type: 'invoice', attributes: { amount: 2999.99, dueDate: '2024-02-15' } },
            { id: 'fin-002', domain: 'financial', name: 'Budget Q1 2024', type: 'budget', attributes: { amount: 50000, spent: 32000 } }
        ];

        this.initializeRelationships();
        this.initializeGraph();
    }

    initializeRelationships() {
        // Create sample relationships between entities
        this.relationships = [
            { source: 'cust-001', target: 'sale-001', type: 'purchased', strength: 1.0 },
            { source: 'cust-001', target: 'prod-001', type: 'interested_in', strength: 0.8 },
            { source: 'sale-001', target: 'prod-001', type: 'contains', strength: 1.0 },
            { source: 'sale-001', target: 'fin-001', type: 'billed_as', strength: 1.0 },
            { source: 'prod-001', target: 'inv-002', type: 'stored_as', strength: 0.9 },
            { source: 'supp-001', target: 'cust-001', type: 'related_to', strength: 0.7 },
            { source: 'cust-003', target: 'sale-002', type: 'quoted_for', strength: 0.6 }
        ];
    }

    initializeGraph() {
        // Create graph nodes and edges for visualization
        this.graphNodes = this.entities.map(entity => ({
            id: entity.id,
            label: entity.name,
            domain: entity.domain,
            type: entity.type,
            x: Math.random() * 500 + 50,
            y: Math.random() * 300 + 50,
            vx: 0,
            vy: 0
        }));

        this.graphEdges = this.relationships.map(rel => ({
            source: rel.source,
            target: rel.target,
            type: rel.type,
            strength: rel.strength
        }));

        this.updateGraph();
    }

    startIntegration() {
        if (this.isIntegrating) return;

        this.isIntegrating = true;
        this.startIntegrationBtn.disabled = true;
        this.pauseIntegrationBtn.disabled = false;

        this.addActivityLog('info', 'Cross-domain integration started');

        this.integrationInterval = setInterval(() => {
            this.processIntegration();
        }, 2000);
    }

    pauseIntegration() {
        this.isIntegrating = false;
        clearInterval(this.integrationInterval);
        this.startIntegrationBtn.disabled = false;
        this.pauseIntegrationBtn.disabled = true;

        this.addActivityLog('warning', 'Integration paused by user');
    }

    resetIntegration() {
        this.pauseIntegration();
        this.relationships = [];
        this.correlations = [];
        this.insights = [];
        this.graphEdges = [];
        this.metrics.entitiesMapped = 0;
        this.metrics.graphEdges = 0;

        this.initializeRelationships();
        this.initializeGraph();
        this.updateUI();

        this.addActivityLog('error', 'Integration system reset');
    }

    processIntegration() {
        if (!this.isIntegrating) return;

        // Simulate entity mapping
        const unmappedEntities = this.entities.filter(e =>
            !this.relationships.some(r => r.source === e.id || r.target === e.id)
        );

        if (unmappedEntities.length > 0) {
            const entity = unmappedEntities[Math.floor(Math.random() * unmappedEntities.length)];
            this.findRelationships(entity);
        }

        // Update metrics
        this.metrics.entitiesMapped += Math.floor(Math.random() * 10) + 1;
        this.metrics.graphEdges = this.relationships.length;
        this.metrics.processingSpeed = 1100000 + Math.random() * 200000;
        this.metrics.mappingAccuracy = 94 + Math.random() * 4;
        this.metrics.integrationTime = 2.0 + Math.random() * 0.6;

        this.updateUI();
    }

    findRelationships(entity) {
        const potentialMatches = this.entities.filter(e =>
            e.id !== entity.id &&
            e.domain !== entity.domain &&
            Math.random() > 0.7
        );

        potentialMatches.slice(0, Math.min(this.maxRelationships, potentialMatches.length)).forEach(match => {
            const similarity = Math.random();
            if (similarity >= this.similarityThreshold) {
                const relationship = {
                    source: entity.id,
                    target: match.id,
                    type: this.generateRelationshipType(entity, match),
                    strength: similarity
                };

                this.relationships.push(relationship);
                this.graphEdges.push({
                    source: relationship.source,
                    target: relationship.target,
                    type: relationship.type,
                    strength: relationship.strength
                });

                this.addActivityLog('success', `Mapped ${entity.name} to ${match.name} (${(similarity * 100).toFixed(1)}% confidence)`);
            }
        });
    }

    generateRelationshipType(sourceEntity, targetEntity) {
        const types = ['related_to', 'connected_with', 'associated_with', 'linked_to', 'correlates_with'];
        return types[Math.floor(Math.random() * types.length)];
    }

    renderDomains() {
        this.domainGrid.innerHTML = '';

        this.domains.forEach(domain => {
            const domainCard = document.createElement('div');
            domainCard.className = 'domain-card';
            domainCard.setAttribute('data-type', domain.type);

            domainCard.innerHTML = `
                <div class="domain-icon">
                    <i class="fas fa-${this.getDomainIcon(domain.type)}"></i>
                </div>
                <div class="domain-name">${domain.name}</div>
                <div class="domain-stats">${domain.entityCount} entities</div>
            `;

            this.domainGrid.appendChild(domainCard);
        });
    }

    getDomainIcon(type) {
        const icons = {
            customer: 'users',
            product: 'box',
            sales: 'chart-line',
            support: 'headset',
            inventory: 'warehouse',
            financial: 'dollar-sign'
        };
        return icons[type] || 'database';
    }

    updateDomainSelects() {
        [this.sourceDomainSelect, this.targetDomainSelect].forEach(select => {
            select.innerHTML = '<option value="">Select Domain</option>';
            this.domains.forEach(domain => {
                const option = document.createElement('option');
                option.value = domain.id;
                option.textContent = domain.name;
                select.appendChild(option);
            });
        });
    }

    updateEntityLists() {
        const sourceDomain = this.sourceDomainSelect.value;
        const targetDomain = this.targetDomainSelect.value;

        this.renderEntityList(this.sourceEntities, sourceDomain);
        this.renderEntityList(this.targetEntities, targetDomain);
    }

    renderEntityList(container, domainId) {
        container.innerHTML = '';

        if (!domainId) {
            container.innerHTML = '<div style="padding: 20px; color: var(--text-secondary); text-align: center;">Select a domain to view entities</div>';
            return;
        }

        const domainEntities = this.entities.filter(e => e.domain === domainId);

        domainEntities.forEach(entity => {
            const entityItem = document.createElement('div');
            entityItem.className = 'entity-item';
            entityItem.textContent = entity.name;
            entityItem.onclick = () => this.selectEntity(entity, container);

            container.appendChild(entityItem);
        });
    }

    selectEntity(entity, container) {
        // Remove previous selection
        container.querySelectorAll('.entity-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Select current entity
        event.target.classList.add('selected');

        // Calculate mapping confidence if both entities are selected
        const sourceSelected = this.sourceEntities.querySelector('.selected');
        const targetSelected = this.targetEntities.querySelector('.selected');

        if (sourceSelected && targetSelected) {
            const confidence = (Math.random() * 40 + 60).toFixed(1); // 60-100%
            this.mappingConfidenceEl.textContent = `${confidence}%`;
        }
    }

    autoMapEntities() {
        // Simulate automatic entity mapping
        let mappedCount = 0;
        this.entities.forEach(entity => {
            if (Math.random() > 0.8) {
                this.findRelationships(entity);
                mappedCount++;
            }
        });

        this.addActivityLog('info', `Auto-mapped ${mappedCount} entities`);
    }

    analyzeCorrelations() {
        this.correlations = [];

        // Generate sample correlations
        const correlationTypes = [
            { domains: ['customer', 'sales'], description: 'High-value customers show 40% higher purchase frequency', strength: 0.85 },
            { domains: ['product', 'inventory'], description: 'Popular products have 25% lower stock-out rates', strength: 0.72 },
            { domains: ['support', 'sales'], description: 'Support interactions correlate with 15% increase in repeat purchases', strength: 0.68 },
            { domains: ['customer', 'support'], description: 'Premium customers create 60% fewer support tickets', strength: 0.91 },
            { domains: ['sales', 'financial'], description: 'Seasonal sales patterns affect cash flow by ±30%', strength: 0.76 }
        ];

        this.correlations = correlationTypes;
        this.renderCorrelations();

        this.addActivityLog('info', 'Cross-domain correlation analysis completed');
    }

    renderCorrelations() {
        this.correlationResults.innerHTML = '';

        this.correlations.forEach(correlation => {
            const correlationItem = document.createElement('div');
            correlationItem.className = 'correlation-item';

            correlationItem.innerHTML = `
                <div class="correlation-description">${correlation.description}</div>
                <div class="correlation-strength">${(correlation.strength * 100).toFixed(1)}%</div>
            `;

            this.correlationResults.appendChild(correlationItem);
        });
    }

    generateInsights() {
        this.insights = [];

        // Generate sample insights
        const insightTypes = [
            {
                title: 'Customer-Product Affinity',
                description: 'Customers in tech industry prefer premium laptops by 3.2x',
                confidence: 0.89,
                strength: 'strong'
            },
            {
                title: 'Support-Sales Link',
                description: 'Resolved support tickets within 24h increase customer lifetime value by 18%',
                confidence: 0.76,
                strength: 'strong'
            },
            {
                title: 'Inventory Optimization',
                description: 'Products with >80% stock utilization see 12% higher sales velocity',
                confidence: 0.68,
                strength: 'medium'
            },
            {
                title: 'Seasonal Patterns',
                description: 'Q4 sales correlate with 25% increase in support ticket volume',
                confidence: 0.82,
                strength: 'strong'
            },
            {
                title: 'Geographic Insights',
                description: 'Urban customers show 15% higher engagement with digital products',
                confidence: 0.71,
                strength: 'medium'
            }
        ];

        this.insights = insightTypes;
        this.renderInsights();

        this.addActivityLog('success', 'Generated 5 new cross-domain insights');
    }

    renderInsights() {
        this.insightsList.innerHTML = '';

        this.insights.forEach(insight => {
            const insightItem = document.createElement('div');
            insightItem.className = `insight-item ${insight.strength}`;

            insightItem.innerHTML = `
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
                <div class="insight-confidence">Confidence: ${(insight.confidence * 100).toFixed(1)}%</div>
            `;

            this.insightsList.appendChild(insightItem);
        });
    }

    updateGraph() {
        const canvas = document.getElementById('semanticGraph');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw edges
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        this.graphEdges.forEach(edge => {
            const sourceNode = this.graphNodes.find(n => n.id === edge.source);
            const targetNode = this.graphNodes.find(n => n.id === edge.target);

            if (sourceNode && targetNode) {
                ctx.beginPath();
                ctx.moveTo(sourceNode.x, sourceNode.y);
                ctx.lineTo(targetNode.x, targetNode.y);
                ctx.stroke();
            }
        });

        // Draw nodes
        this.graphNodes.forEach(node => {
            const color = this.getNodeColor(node.domain);

            // Draw node circle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Draw node label
            ctx.fillStyle = '#1e293b';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.label.split(' ')[0], node.x, node.y - 12);
        });
    }

    getNodeColor(domain) {
        const colors = {
            customer: '#3b82f6',
            product: '#10b981',
            sales: '#f59e0b',
            support: '#ef4444',
            inventory: '#06b6d4',
            financial: '#8b5cf6'
        };
        return colors[domain] || '#64748b';
    }

    resetGraph() {
        // Reset node positions
        this.graphNodes.forEach(node => {
            node.x = Math.random() * 500 + 50;
            node.y = Math.random() * 300 + 50;
            node.vx = 0;
            node.vy = 0;
        });

        this.updateGraph();
        this.addActivityLog('info', 'Graph layout reset');
    }

    updateMetrics() {
        // Update metrics based on timeframe (simulated)
        const timeframe = this.metricsTimeframeSelect.value;
        const multiplier = { '1h': 1, '24h': 24, '7d': 168 }[timeframe] || 1;

        this.metrics.processingSpeed = Math.round((1200000 + Math.random() * 200000) * multiplier / 24);
        this.metrics.entitiesMapped = Math.round(2847 * (multiplier / 24));
        this.metrics.graphEdges = Math.round(48921 * (multiplier / 24));
    }

    updateUI() {
        // Update status overview
        this.dataSourcesEl.textContent = this.metrics.dataSources;
        this.entitiesMappedEl.textContent = this.metrics.entitiesMapped.toLocaleString();
        this.semanticConfidenceEl.textContent = `${this.metrics.semanticConfidence}%`;
        this.graphNodesEl.textContent = this.metrics.graphNodes.toLocaleString();
        this.graphEdgesEl.textContent = this.metrics.graphEdges.toLocaleString();

        // Update metrics
        this.processingSpeedEl.textContent = `${(this.metrics.processingSpeed / 1000000).toFixed(1)}M`;
        this.mappingAccuracyEl.textContent = `${this.metrics.mappingAccuracy}%`;
        this.integrationTimeEl.textContent = `${this.metrics.integrationTime.toFixed(1)}s`;
        this.memoryUsageEl.textContent = `${this.metrics.memoryUsage}GB`;

        // Update graph
        this.updateGraph();
    }

    showDomainModal() {
        this.domainModal.classList.add('active');
    }

    hideDomainModal() {
        this.domainModal.classList.remove('active');
    }

    createDomain(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const domain = {
            id: `domain-${Date.now()}`,
            name: formData.get('domainName'),
            type: formData.get('domainType'),
            entityCount: 0,
            description: formData.get('domainDescription'),
            lastUpdated: new Date()
        };

        this.domains.push(domain);
        this.renderDomains();
        this.updateDomainSelects();
        this.hideDomainModal();
        e.target.reset();

        this.addActivityLog('success', `New domain "${domain.name}" added`);
    }

    showEntityModal(entityId) {
        const entity = this.entities.find(e => e.id === entityId);
        if (!entity) return;

        this.entityDetails.innerHTML = `
            <h4>${entity.name}</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <h5>Entity Information</h5>
                    <p><strong>Domain:</strong> ${entity.domain}</p>
                    <p><strong>Type:</strong> ${entity.type}</p>
                    <p><strong>ID:</strong> ${entity.id}</p>
                </div>
                <div>
                    <h5>Attributes</h5>
                    ${Object.entries(entity.attributes).map(([key, value]) =>
                        `<p><strong>${key}:</strong> ${value}</p>`
                    ).join('')}
                </div>
            </div>
            <div style="margin-top: 20px;">
                <h5>Relationships</h5>
                <ul>
                    ${this.relationships.filter(r => r.source === entity.id || r.target === entity.id)
                        .map(rel => {
                            const otherId = rel.source === entity.id ? rel.target : rel.source;
                            const otherEntity = this.entities.find(e => e.id === otherId);
                            return `<li>${rel.type} ${otherEntity ? otherEntity.name : otherId} (${(rel.strength * 100).toFixed(1)}%)</li>`;
                        }).join('')}
                </ul>
            </div>
        `;

        this.entityModal.classList.add('active');
    }

    hideEntityModal() {
        this.entityModal.classList.remove('active');
    }

    addActivityLog(type, message) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;

        const icon = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-times-circle'
        }[type] || 'fas fa-info-circle';

        logEntry.innerHTML = `
            <div class="log-icon">
                <i class="${icon}"></i>
            </div>
            <div class="log-content">
                <div class="log-timestamp">${this.formatTime(new Date())}</div>
                <div class="log-message">${message}</div>
            </div>
        `;

        this.activityLogEl.insertBefore(logEntry, this.activityLogEl.firstChild);

        // Keep only last 50 entries
        while (this.activityLogEl.children.length > 50) {
            this.activityLogEl.removeChild(this.activityLogEl.lastChild);
        }
    }

    clearActivityLog() {
        this.activityLogEl.innerHTML = '';
        this.addActivityLog('info', 'Activity log cleared');
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

// Initialize the semantic integrator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.semanticIntegrator = new CrossDomainSemanticIntegrator();
});