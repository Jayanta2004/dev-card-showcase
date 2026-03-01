document.addEventListener('DOMContentLoaded', function() {
    const contentInput = document.getElementById('content-input');
    const indexingStrategy = document.getElementById('indexing-strategy');
    const nodesInput = document.getElementById('nodes');
    const buildIndexBtn = document.getElementById('build-index-btn');
    const resultsDiv = document.getElementById('results');
    const canvas = document.getElementById('fabric-canvas');
    const ctx = canvas.getContext('2d');
    const redistributeBtn = document.getElementById('redistribute');
    const optimizeBtn = document.getElementById('optimize');
    const zoomInput = document.getElementById('zoom');
    const searchQuery = document.getElementById('search-query');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const indexSize = document.getElementById('index-size');
    const queryLatency = document.getElementById('query-latency');
    const distributionBalance = document.getElementById('distribution-balance');
    const semanticAccuracy = document.getElementById('semantic-accuracy');

    let indexFabric = null;
    let zoomLevel = 1;

    buildIndexBtn.addEventListener('click', buildIndex);
    redistributeBtn.addEventListener('click', redistributeIndex);
    optimizeBtn.addEventListener('click', optimizeIndex);
    zoomInput.addEventListener('input', updateZoom);
    searchBtn.addEventListener('click', performSearch);

    // Initialize with default content
    initializeDefaultContent();

    function initializeDefaultContent() {
        const defaultContent = {
            documents: [
                { id: "doc1", content: "Machine learning algorithms transform data into insights", metadata: { author: "AI Researcher", category: "ML" } },
                { id: "doc2", content: "Neural networks process information using interconnected nodes", metadata: { author: "Neuroscientist", category: "NN" } },
                { id: "doc3", content: "Deep learning models achieve state-of-the-art performance", metadata: { author: "Data Scientist", category: "DL" } },
                { id: "doc4", content: "Computer vision enables machines to understand visual content", metadata: { author: "Vision Expert", category: "CV" } },
                { id: "doc5", content: "Natural language processing helps computers understand human language", metadata: { author: "NLP Specialist", category: "NLP" } }
            ]
        };
        contentInput.value = JSON.stringify(defaultContent, null, 2);
    }

    function buildIndex() {
        try {
            const content = JSON.parse(contentInput.value);
            const strategy = indexingStrategy.value;
            const numNodes = parseInt(nodesInput.value);

            resultsDiv.innerHTML = '<div class="loading">Building distributed semantic index...</div>';

            // Simulate index building process
            setTimeout(() => {
                const index = buildDistributedIndex(content, strategy, numNodes);
                displayResults(index);
                visualizeFabric(index);
                updateMetrics(index);
            }, 2000);

        } catch (error) {
            resultsDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        }
    }

    function buildDistributedIndex(content, strategy, numNodes) {
        const documents = content.documents;
        const nodes = [];

        // Initialize nodes
        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                id: `node_${i}`,
                documents: [],
                index: {},
                load: 0
            });
        }

        // Distribute documents across nodes based on strategy
        documents.forEach((doc, index) => {
            const nodeIndex = distributeDocument(doc, index, strategy, numNodes);
            nodes[nodeIndex].documents.push(doc);
            nodes[nodeIndex].load++;

            // Build semantic index for the document
            const semanticIndex = buildSemanticIndex(doc, strategy);
            Object.assign(nodes[nodeIndex].index, semanticIndex);
        });

        return {
            strategy: strategy,
            nodes: nodes,
            totalDocuments: documents.length,
            distribution: calculateDistribution(nodes),
            performance: calculatePerformance(nodes, strategy)
        };
    }

    function distributeDocument(doc, index, strategy, numNodes) {
        switch (strategy) {
            case 'semantic-embedding':
                // Distribute based on semantic similarity (simplified)
                return Math.floor(Math.random() * numNodes);

            case 'graph-based':
                // Distribute based on graph connectivity
                return index % numNodes;

            case 'vector-quantization':
                // Use vector quantization for distribution
                return Math.floor((doc.content.length * 31) % numNodes);

            case 'hierarchical-clustering':
                // Hierarchical distribution
                return Math.floor(Math.sqrt(index) % numNodes);

            case 'distributed-hashing':
                // Consistent hashing
                let hash = 0;
                for (let i = 0; i < doc.id.length; i++) {
                    hash = ((hash << 5) - hash + doc.id.charCodeAt(i)) & 0xffffffff;
                }
                return Math.abs(hash) % numNodes;

            default:
                return index % numNodes;
        }
    }

    function buildSemanticIndex(doc, strategy) {
        const index = {};
        const words = doc.content.toLowerCase().split(/\s+/);

        words.forEach(word => {
            if (word.length > 2) {
                if (!index[word]) {
                    index[word] = { count: 0, documents: [] };
                }
                index[word].count++;
                if (!index[word].documents.includes(doc.id)) {
                    index[word].documents.push(doc.id);
                }
            }
        });

        // Add semantic relationships based on strategy
        if (strategy === 'semantic-embedding') {
            // Add related terms (simplified)
            Object.keys(index).forEach(term => {
                const related = findRelatedTerms(term);
                related.forEach(rel => {
                    if (!index[rel]) {
                        index[rel] = { count: 1, documents: [doc.id] };
                    }
                });
            });
        }

        return index;
    }

    function findRelatedTerms(term) {
        // Simplified semantic relationship finder
        const relations = {
            'machine': ['computer', 'algorithm', 'automation'],
            'learning': ['training', 'education', 'adaptation'],
            'neural': ['brain', 'network', 'cognitive'],
            'deep': ['profound', 'intensive', 'complex'],
            'computer': ['machine', 'digital', 'electronic'],
            'vision': ['sight', 'perception', 'recognition'],
            'language': ['communication', 'speech', 'text'],
            'processing': ['analysis', 'computation', 'handling']
        };
        return relations[term] || [];
    }

    function calculateDistribution(nodes) {
        const loads = nodes.map(node => node.load);
        const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
        const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
        const balance = Math.max(0, 100 - (variance / avgLoad) * 100);

        return {
            averageLoad: avgLoad,
            maxLoad: Math.max(...loads),
            minLoad: Math.min(...loads),
            balance: balance
        };
    }

    function calculatePerformance(nodes, strategy) {
        const totalIndexSize = nodes.reduce((sum, node) => sum + Object.keys(node.index).length, 0);
        const avgQueryTime = Math.random() * 50 + 10; // Simulated
        const semanticAccuracy = Math.random() * 20 + 80; // Simulated

        return {
            indexSize: totalIndexSize,
            avgQueryLatency: avgQueryTime,
            semanticAccuracy: semanticAccuracy
        };
    }

    function displayResults(index) {
        const distribution = index.distribution;
        const performance = index.performance;

        resultsDiv.innerHTML = `
            <div class="metric">
                <span class="metric-label">Indexing Strategy:</span>
                <span class="metric-value">${index.strategy.replace('-', ' ').toUpperCase()}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Documents:</span>
                <span class="metric-value">${index.totalDocuments}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Number of Nodes:</span>
                <span class="metric-value">${index.nodes.length}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Average Load per Node:</span>
                <span class="metric-value">${distribution.averageLoad.toFixed(1)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Load Balance:</span>
                <span class="metric-value">${distribution.balance.toFixed(1)}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Index Size:</span>
                <span class="metric-value">${performance.indexSize} terms</span>
            </div>
            <div class="metric">
                <span class="metric-label">Avg Query Latency:</span>
                <span class="metric-value">${performance.avgQueryLatency.toFixed(1)}ms</span>
            </div>
            <div class="metric">
                <span class="metric-label">Semantic Accuracy:</span>
                <span class="metric-value">${performance.semanticAccuracy.toFixed(1)}%</span>
            </div>
        `;

        indexFabric = index;
    }

    function visualizeFabric(index) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(canvas.width / (2 * zoomLevel), canvas.height / (2 * zoomLevel));

        const nodes = index.nodes;
        const centerX = 0;
        const centerY = 0;
        const radius = Math.min(canvas.width, canvas.height) / 4;

        // Draw connections between nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const angle1 = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
                const angle2 = (j / nodes.length) * 2 * Math.PI - Math.PI / 2;

                const x1 = centerX + Math.cos(angle1) * radius;
                const y1 = centerY + Math.sin(angle1) * radius;
                const x2 = centerX + Math.cos(angle2) * radius;
                const y2 = centerY + Math.sin(angle2) * radius;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Draw nodes
        nodes.forEach((node, index) => {
            const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const size = Math.max(20, Math.min(50, node.load * 5));

            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fillStyle = `hsl(${index * 360 / nodes.length}, 70%, 60%)`;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw node label
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Node ${index}`, x, y + 4);
            ctx.fillText(`${node.documents.length} docs`, x, y + 20);
        });

        ctx.restore();
    }

    function redistributeIndex() {
        if (!indexFabric) return;

        // Simulate redistribution
        const nodes = indexFabric.nodes;
        const allDocs = nodes.flatMap(node => node.documents);

        nodes.forEach(node => {
            node.documents = [];
            node.load = 0;
            node.index = {};
        });

        allDocs.forEach((doc, index) => {
            const nodeIndex = (index + Math.floor(Math.random() * nodes.length)) % nodes.length;
            nodes[nodeIndex].documents.push(doc);
            nodes[nodeIndex].load++;
            const semanticIndex = buildSemanticIndex(doc, indexFabric.strategy);
            Object.assign(nodes[nodeIndex].index, semanticIndex);
        });

        indexFabric.distribution = calculateDistribution(nodes);
        displayResults(indexFabric);
        visualizeFabric(indexFabric);
        updateMetrics(indexFabric);
    }

    function optimizeIndex() {
        if (!indexFabric) return;

        // Simulate optimization
        const nodes = indexFabric.nodes;
        const totalTerms = nodes.reduce((sum, node) => sum + Object.keys(node.index).length, 0);
        const optimizedTerms = Math.floor(totalTerms * 0.9); // Simulate compression

        indexFabric.performance.indexSize = optimizedTerms;
        indexFabric.performance.avgQueryLatency *= 0.8;
        indexFabric.performance.semanticAccuracy = Math.min(100, indexFabric.performance.semanticAccuracy + 5);

        displayResults(indexFabric);
        updateMetrics(indexFabric);
    }

    function updateZoom() {
        zoomLevel = parseFloat(zoomInput.value);
        if (indexFabric) {
            visualizeFabric(indexFabric);
        }
    }

    function performSearch() {
        if (!indexFabric) {
            searchResults.innerHTML = '<p>Please build an index first.</p>';
            return;
        }

        const query = searchQuery.value.trim();
        if (!query) return;

        const startTime = Date.now();
        const results = searchIndex(query, indexFabric);
        const latency = Date.now() - startTime;

        queryLatency.textContent = `${latency}ms`;

        displaySearchResults(results, query);
    }

    function searchIndex(query, index) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const results = {};

        index.nodes.forEach(node => {
            queryTerms.forEach(term => {
                if (node.index[term]) {
                    node.index[term].documents.forEach(docId => {
                        if (!results[docId]) {
                            results[docId] = { score: 0, terms: [] };
                        }
                        results[docId].score += node.index[term].count;
                        if (!results[docId].terms.includes(term)) {
                            results[docId].terms.push(term);
                        }
                    });
                }
            });
        });

        // Sort by score
        return Object.entries(results)
            .map(([docId, data]) => ({ docId, ...data }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);
    }

    function displaySearchResults(results, query) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p>No results found.</p>';
            return;
        }

        let html = `<h3>Search Results for "${query}"</h3>`;
        results.forEach(result => {
            const doc = indexFabric.nodes.flatMap(node => node.documents).find(d => d.id === result.docId);
            if (doc) {
                html += `
                    <div class="search-result">
                        <h4>${doc.id}</h4>
                        <p>${doc.content}</p>
                        <p><strong>Score:</strong> ${result.score} | <strong>Matching terms:</strong> ${result.terms.join(', ')}</p>
                        <p><em>Author: ${doc.metadata.author} | Category: ${doc.metadata.category}</em></p>
                    </div>
                `;
            }
        });

        searchResults.innerHTML = html;
    }

    function updateMetrics(index) {
        const performance = index.performance;
        const distribution = index.distribution;

        indexSize.textContent = `${performance.indexSize} terms`;
        distributionBalance.textContent = `${distribution.balance.toFixed(1)}%`;
        semanticAccuracy.textContent = `${performance.semanticAccuracy.toFixed(1)}%`;
    }
});