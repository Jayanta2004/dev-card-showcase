/**
 * Genomic Pattern Analyzer - Mutation Clustering Engine
 * Issue #6255
 *
 * Features:
 * - Multiple clustering algorithms (K-means, Hierarchical, DBSCAN, PCA+K-means)
 * - Distance metrics (Hamming, Levenshtein, Jaccard, Euclidean)
 * - Interactive heatmap visualization
 * - Dendrogram for hierarchical clustering
 * - Pattern insights and mutation correlation analysis
 */

// Global state and configuration
let genomicData = {
    sequences: [],
    mutations: [],
    clusters: [],
    distanceMatrix: [],
    analysisResults: null
};

let currentVisualization = null;
let heatmapChart = null;
let dendrogramSvg = null;

// DOM elements
const analyzeBtn = document.getElementById('analyze-data');
const loadSampleBtn = document.getElementById('load-sample-data');
const clearDataBtn = document.getElementById('clear-data');
const exportJsonBtn = document.getElementById('export-json');
const exportCsvBtn = document.getElementById('export-csv');
const exportSvgBtn = document.getElementById('export-svg');
const generateReportBtn = document.getElementById('generate-report');
const resultsContainer = document.getElementById('results-container');
const noResults = document.getElementById('no-results');
const similarityThreshold = document.getElementById('similarity-threshold');
const thresholdValue = document.getElementById('threshold-value');

// Initialize the application
function init() {
    setupEventListeners();
    updateThresholdDisplay();
}

// Event listeners setup
function setupEventListeners() {
    analyzeBtn.addEventListener('click', analyzeGenomicData);
    loadSampleBtn.addEventListener('click', loadSampleData);
    clearDataBtn.addEventListener('click', clearData);
    exportJsonBtn.addEventListener('click', exportAsJSON);
    exportCsvBtn.addEventListener('click', exportAsCSV);
    exportSvgBtn.addEventListener('export-svg', exportHeatmapSVG);
    generateReportBtn.addEventListener('click', generateReport);
    similarityThreshold.addEventListener('input', updateThresholdDisplay);

    // File upload handling
    document.getElementById('vcf-file').addEventListener('change', handleFileUpload);
}

// Update threshold display
function updateThresholdDisplay() {
    thresholdValue.textContent = similarityThreshold.value;
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            parseVCFFile(e.target.result);
        };
        reader.readAsText(file);
        document.getElementById('file-info').textContent = `Loaded: ${file.name}`;
    }
}

// Parse VCF file format
function parseVCFFile(content) {
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    genomicData.mutations = [];

    lines.forEach((line, index) => {
        const parts = line.split('\t');
        if (parts.length >= 5) {
            genomicData.mutations.push({
                id: `mutation_${index + 1}`,
                chromosome: parts[0],
                position: parseInt(parts[1]),
                reference: parts[2],
                alternate: parts[3],
                sampleId: parts[4] || `sample_${index + 1}`,
                quality: parts[5] ? parseFloat(parts[5]) : 30,
                type: determineMutationType(parts[2], parts[3])
            });
        }
    });

    updateDataDisplay();
}

// Determine mutation type
function determineMutationType(ref, alt) {
    if (ref.length === 1 && alt.length === 1) return 'SNV';
    if (ref.length !== alt.length) return 'INDEL';
    if (ref.length > alt.length) return 'DELETION';
    if (ref.length < alt.length) return 'INSERTION';
    return 'CNV';
}

// Parse FASTA sequences
function parseFASTASequences(content) {
    const sequences = [];
    const lines = content.split('\n');
    let currentSequence = null;

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('>')) {
            if (currentSequence) {
                sequences.push(currentSequence);
            }
            currentSequence = {
                id: line.substring(1).split(' ')[0],
                header: line.substring(1),
                sequence: ''
            };
        } else if (currentSequence && line) {
            currentSequence.sequence += line.toUpperCase();
        }
    });

    if (currentSequence) {
        sequences.push(currentSequence);
    }

    return sequences;
}

// Load sample genomic data
function loadSampleData() {
    // Sample FASTA sequences
    const sampleSequences = `>Sample_1_Human
ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG
>Sample_2_Human
ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG
>Sample_3_Chimpanzee
ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCA
>Sample_4_Gorilla
ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCT
>Sample_5_Orangutan
ATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCG`;

    // Sample mutations
    const sampleMutations = `1 12345 A T Sample_1
1 12346 T C Sample_1
1 23456 G A Sample_2
1 23457 C T Sample_2
2 34567 T A Sample_3
2 34568 G C Sample_3
3 45678 A G Sample_4
3 45679 T C Sample_4
4 56789 G T Sample_5
4 56790 C A Sample_5`;

    document.getElementById('sequence-input').value = sampleSequences;
    document.getElementById('mutation-data').value = sampleMutations;

    genomicData.sequences = parseFASTASequences(sampleSequences);
    parseVCFFile(sampleMutations);

    updateDataDisplay();
}

// Update data display
function updateDataDisplay() {
    document.getElementById('total-samples').textContent = genomicData.sequences.length;
    document.getElementById('total-mutations').textContent = genomicData.mutations.length;
}

// Clear all data
function clearData() {
    genomicData = {
        sequences: [],
        mutations: [],
        clusters: [],
        distanceMatrix: [],
        analysisResults: null
    };

    document.getElementById('sequence-input').value = '';
    document.getElementById('mutation-data').value = '';
    document.getElementById('vcf-file').value = '';
    document.getElementById('file-info').textContent = '';

    resultsContainer.classList.add('hidden');
    noResults.classList.remove('hidden');

    updateDataDisplay();
}

// Main analysis function
function analyzeGenomicData() {
    // Get input data
    const sequenceText = document.getElementById('sequence-input').value;
    const mutationText = document.getElementById('mutation-data').value;

    if (!sequenceText && !mutationText && genomicData.mutations.length === 0) {
        alert('Please provide genomic data (sequences or mutations) for analysis.');
        return;
    }

    // Parse data if provided
    if (sequenceText) {
        genomicData.sequences = parseFASTASequences(sequenceText);
    }
    if (mutationText) {
        parseVCFFile(mutationText);
    }

    // Get analysis parameters
    const algorithm = document.getElementById('clustering-algorithm').value;
    const distanceMetric = document.getElementById('distance-metric').value;
    const clusterCount = parseInt(document.getElementById('cluster-count').value);
    const minClusterSize = parseInt(document.getElementById('min-cluster-size').value);
    const threshold = parseFloat(document.getElementById('similarity-threshold').value);
    const mutationFilter = document.getElementById('mutation-type-filter').value;

    // Filter mutations if needed
    let filteredMutations = genomicData.mutations;
    if (mutationFilter !== 'all') {
        filteredMutations = genomicData.mutations.filter(m =>
            m.type.toLowerCase() === mutationFilter.toLowerCase()
        );
    }

    // Perform clustering analysis
    const results = performClusteringAnalysis(
        genomicData.sequences,
        filteredMutations,
        algorithm,
        distanceMetric,
        clusterCount,
        minClusterSize,
        threshold
    );

    genomicData.analysisResults = results;

    // Update UI
    displayAnalysisResults(results);
    resultsContainer.classList.remove('hidden');
    noResults.classList.add('hidden');
}

// Perform clustering analysis
function performClusteringAnalysis(sequences, mutations, algorithm, distanceMetric, k, minSize, threshold) {
    // Create feature matrix from sequences and mutations
    const featureMatrix = createFeatureMatrix(sequences, mutations);

    // Calculate distance matrix
    const distanceMatrix = calculateDistanceMatrix(featureMatrix, distanceMetric);

    // Perform clustering
    let clusters = [];
    switch (algorithm) {
        case 'kmeans':
            clusters = performKMeans(distanceMatrix, k);
            break;
        case 'hierarchical':
            clusters = performHierarchicalClustering(distanceMatrix, threshold);
            break;
        case 'dbscan':
            clusters = performDBSCAN(distanceMatrix, threshold, minSize);
            break;
        case 'pca':
            clusters = performPCAKMeans(featureMatrix, k);
            break;
    }

    // Calculate cluster statistics
    const clusterStats = calculateClusterStatistics(clusters, distanceMatrix);

    // Generate insights
    const insights = generatePatternInsights(clusters, mutations, sequences);

    return {
        clusters: clusters,
        distanceMatrix: distanceMatrix,
        featureMatrix: featureMatrix,
        statistics: clusterStats,
        insights: insights,
        algorithm: algorithm,
        parameters: { k, minSize, threshold, distanceMetric }
    };
}

// Create feature matrix from genomic data
function createFeatureMatrix(sequences, mutations) {
    const samples = [...new Set([
        ...sequences.map(s => s.id),
        ...mutations.map(m => m.sampleId)
    ])];

    const features = [];

    samples.forEach(sampleId => {
        const sampleMutations = mutations.filter(m => m.sampleId === sampleId);
        const sampleSequence = sequences.find(s => s.id === sampleId);

        // Create feature vector
        const featureVector = {
            id: sampleId,
            mutations: sampleMutations.length,
            snvs: sampleMutations.filter(m => m.type === 'SNV').length,
            indels: sampleMutations.filter(m => m.type === 'INDEL').length,
            sequenceLength: sampleSequence ? sampleSequence.sequence.length : 0,
            gcContent: sampleSequence ? calculateGCContent(sampleSequence.sequence) : 0,
            mutationPositions: sampleMutations.map(m => m.position)
        };

        features.push(featureVector);
    });

    return features;
}

// Calculate GC content
function calculateGCContent(sequence) {
    const gc = (sequence.match(/[GC]/g) || []).length;
    return gc / sequence.length;
}

// Calculate distance matrix
function calculateDistanceMatrix(featureMatrix, metric) {
    const n = featureMatrix.length;
    const matrix = Array(n).fill().map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const distance = calculateDistance(featureMatrix[i], featureMatrix[j], metric);
            matrix[i][j] = distance;
            matrix[j][i] = distance;
        }
    }

    return matrix;
}

// Calculate distance between two feature vectors
function calculateDistance(vec1, vec2, metric) {
    switch (metric) {
        case 'hamming':
            return calculateHammingDistance(vec1, vec2);
        case 'levenshtein':
            return calculateLevenshteinDistance(vec1, vec2);
        case 'jaccard':
            return 1 - calculateJaccardSimilarity(vec1, vec2); // Convert similarity to distance
        case 'euclidean':
            return calculateEuclideanDistance(vec1, vec2);
        default:
            return calculateEuclideanDistance(vec1, vec2);
    }
}

// Hamming distance for categorical features
function calculateHammingDistance(vec1, vec2) {
    let distance = 0;
    const keys = ['mutations', 'snvs', 'indels'];
    keys.forEach(key => {
        if (vec1[key] !== vec2[key]) distance++;
    });
    return distance;
}

// Levenshtein distance for sequences
function calculateLevenshteinDistance(vec1, vec2) {
    // Simplified version - compare mutation positions
    const pos1 = vec1.mutationPositions || [];
    const pos2 = vec2.mutationPositions || [];
    return Math.abs(pos1.length - pos2.length);
}

// Jaccard similarity for mutation sets
function calculateJaccardSimilarity(vec1, vec2) {
    const set1 = new Set(vec1.mutationPositions || []);
    const set2 = new Set(vec2.mutationPositions || []);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size || 0;
}

// Euclidean distance for numerical features
function calculateEuclideanDistance(vec1, vec2) {
    const features = ['mutations', 'snvs', 'indels', 'sequenceLength', 'gcContent'];
    let sum = 0;
    features.forEach(feature => {
        const diff = (vec1[feature] || 0) - (vec2[feature] || 0);
        sum += diff * diff;
    });
    return Math.sqrt(sum);
}

// K-means clustering
function performKMeans(distanceMatrix, k) {
    const n = distanceMatrix.length;
    let centroids = [];
    let clusters = Array(n).fill(0);

    // Initialize centroids randomly
    for (let i = 0; i < k; i++) {
        centroids.push(Math.floor(Math.random() * n));
    }

    // Simple k-means implementation (simplified for demo)
    for (let iter = 0; iter < 10; iter++) {
        // Assign points to nearest centroid
        for (let i = 0; i < n; i++) {
            let minDistance = Infinity;
            let closestCentroid = 0;

            for (let j = 0; j < k; j++) {
                const distance = distanceMatrix[i][centroids[j]];
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroid = j;
                }
            }
            clusters[i] = closestCentroid;
        }

        // Update centroids (simplified)
        for (let j = 0; j < k; j++) {
            const clusterPoints = clusters.map((c, i) => c === j ? i : -1).filter(i => i !== -1);
            if (clusterPoints.length > 0) {
                centroids[j] = clusterPoints[Math.floor(clusterPoints.length / 2)];
            }
        }
    }

    // Group points by cluster
    const clusterGroups = [];
    for (let i = 0; i < k; i++) {
        clusterGroups.push({
            id: i + 1,
            points: clusters.map((c, idx) => c === i ? idx : -1).filter(idx => idx !== -1),
            centroid: centroids[i]
        });
    }

    return clusterGroups.filter(c => c.points.length > 0);
}

// Hierarchical clustering (simplified)
function performHierarchicalClustering(distanceMatrix, threshold) {
    const n = distanceMatrix.length;
    let clusters = Array.from({length: n}, (_, i) => ({ id: i + 1, points: [i] }));

    while (clusters.length > 1) {
        let minDistance = Infinity;
        let mergeI = -1;
        let mergeJ = -1;

        // Find closest clusters
        for (let i = 0; i < clusters.length; i++) {
            for (let j = i + 1; j < clusters.length; j++) {
                const distance = calculateClusterDistance(clusters[i], clusters[j], distanceMatrix);
                if (distance < minDistance) {
                    minDistance = distance;
                    mergeI = i;
                    mergeJ = j;
                }
            }
        }

        if (minDistance > threshold) break;

        // Merge clusters
        const newCluster = {
            id: clusters.length + 1,
            points: [...clusters[mergeI].points, ...clusters[mergeJ].points]
        };

        clusters.splice(Math.max(mergeI, mergeJ), 1);
        clusters.splice(Math.min(mergeI, mergeJ), 1);
        clusters.push(newCluster);
    }

    return clusters;
}

// Calculate distance between clusters (average linkage)
function calculateClusterDistance(cluster1, cluster2, distanceMatrix) {
    let sum = 0;
    let count = 0;

    cluster1.points.forEach(i => {
        cluster2.points.forEach(j => {
            sum += distanceMatrix[i][j];
            count++;
        });
    });

    return sum / count;
}

// DBSCAN clustering
function performDBSCAN(distanceMatrix, eps, minPts) {
    const n = distanceMatrix.length;
    const visited = Array(n).fill(false);
    const clusters = [];
    let clusterId = 0;

    for (let i = 0; i < n; i++) {
        if (visited[i]) continue;

        visited[i] = true;
        const neighbors = findNeighbors(i, distanceMatrix, eps);

        if (neighbors.length < minPts) continue;

        clusterId++;
        const cluster = { id: clusterId, points: [i] };

        // Expand cluster
        for (let j = 0; j < neighbors.length; j++) {
            const neighbor = neighbors[j];
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                const neighborNeighbors = findNeighbors(neighbor, distanceMatrix, eps);
                if (neighborNeighbors.length >= minPts) {
                    neighbors.push(...neighborNeighbors.filter(n => !neighbors.includes(n)));
                }
            }
            if (!cluster.points.includes(neighbor)) {
                cluster.points.push(neighbor);
            }
        }

        clusters.push(cluster);
    }

    return clusters;
}

// Find neighbors within epsilon distance
function findNeighbors(point, distanceMatrix, eps) {
    const neighbors = [];
    for (let i = 0; i < distanceMatrix.length; i++) {
        if (distanceMatrix[point][i] <= eps) {
            neighbors.push(i);
        }
    }
    return neighbors;
}

// PCA + K-means (simplified)
function performPCAKMeans(featureMatrix, k) {
    // Simplified PCA - just use first few features
    const pcaFeatures = featureMatrix.map(f => [
        f.mutations || 0,
        f.snvs || 0,
        f.indels || 0,
        f.gcContent || 0
    ]);

    // Create distance matrix from PCA features
    const pcaDistanceMatrix = calculateDistanceMatrix(
        pcaFeatures.map((f, i) => ({ id: i, features: f })),
        'euclidean'
    );

    return performKMeans(pcaDistanceMatrix, k);
}

// Calculate cluster statistics
function calculateClusterStatistics(clusters, distanceMatrix) {
    return {
        totalClusters: clusters.length,
        avgClusterSize: clusters.reduce((sum, c) => sum + c.points.length, 0) / clusters.length,
        largestCluster: Math.max(...clusters.map(c => c.points.length)),
        smallestCluster: Math.min(...clusters.map(c => c.points.length)),
        silhouetteScore: calculateSilhouetteScore(clusters, distanceMatrix)
    };
}

// Calculate silhouette score (simplified)
function calculateSilhouetteScore(clusters, distanceMatrix) {
    // Simplified silhouette calculation
    let totalScore = 0;
    let count = 0;

    clusters.forEach(cluster => {
        cluster.points.forEach(point => {
            const a = calculateAverageDistance(point, cluster.points, distanceMatrix);
            const b = calculateMinDistanceToOtherClusters(point, clusters, distanceMatrix);

            if (a !== 0 || b !== 0) {
                const s = (b - a) / Math.max(a, b);
                totalScore += s;
                count++;
            }
        });
    });

    return count > 0 ? totalScore / count : 0;
}

// Helper functions for silhouette calculation
function calculateAverageDistance(point, points, distanceMatrix) {
    const distances = points.filter(p => p !== point).map(p => distanceMatrix[point][p]);
    return distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;
}

function calculateMinDistanceToOtherClusters(point, clusters, distanceMatrix) {
    let minDistance = Infinity;
    clusters.forEach(cluster => {
        if (!cluster.points.includes(point)) {
            const avgDistance = calculateAverageDistance(point, cluster.points, distanceMatrix);
            minDistance = Math.min(minDistance, avgDistance);
        }
    });
    return minDistance === Infinity ? 0 : minDistance;
}

// Generate pattern insights
function generatePatternInsights(clusters, mutations, sequences) {
    const insights = [];

    // Cluster size insights
    const largeClusters = clusters.filter(c => c.points.length > 5);
    if (largeClusters.length > 0) {
        insights.push(`Found ${largeClusters.length} large clusters with significant mutation patterns`);
    }

    // Mutation type distribution
    const mutationTypes = {};
    mutations.forEach(m => {
        mutationTypes[m.type] = (mutationTypes[m.type] || 0) + 1;
    });

    const dominantType = Object.entries(mutationTypes).sort((a, b) => b[1] - a[1])[0];
    if (dominantType) {
        insights.push(`Dominant mutation type: ${dominantType[0]} (${dominantType[1]} instances)`);
    }

    // Sequence similarity insights
    if (sequences.length > 1) {
        const avgSimilarity = calculateAverageSequenceSimilarity(sequences);
        insights.push(`Average sequence similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
    }

    // Hotspot detection
    const hotspots = detectMutationHotspots(mutations);
    if (hotspots.length > 0) {
        insights.push(`Identified ${hotspots.length} potential mutation hotspots`);
    }

    return insights;
}

// Calculate average sequence similarity
function calculateAverageSequenceSimilarity(sequences) {
    let totalSimilarity = 0;
    let count = 0;

    for (let i = 0; i < sequences.length; i++) {
        for (let j = i + 1; j < sequences.length; j++) {
            const similarity = calculateSequenceSimilarity(sequences[i].sequence, sequences[j].sequence);
            totalSimilarity += similarity;
            count++;
        }
    }

    return count > 0 ? totalSimilarity / count : 0;
}

// Simple sequence similarity calculation
function calculateSequenceSimilarity(seq1, seq2) {
    const minLength = Math.min(seq1.length, seq2.length);
    let matches = 0;

    for (let i = 0; i < minLength; i++) {
        if (seq1[i] === seq2[i]) matches++;
    }

    return matches / minLength;
}

// Detect mutation hotspots
function detectMutationHotspots(mutations) {
    const positionCounts = {};
    mutations.forEach(m => {
        positionCounts[m.position] = (positionCounts[m.position] || 0) + 1;
    });

    const avgMutations = mutations.length / Object.keys(positionCounts).length;
    return Object.entries(positionCounts)
        .filter(([pos, count]) => count > avgMutations * 2)
        .map(([pos, count]) => ({ position: parseInt(pos), count }));
}

// Display analysis results
function displayAnalysisResults(results) {
    // Update statistics
    document.getElementById('clusters-found').textContent = results.statistics.totalClusters;
    document.getElementById('avg-cluster-size').textContent = results.statistics.avgClusterSize.toFixed(1);

    // Create heatmap
    createHeatmap(results.distanceMatrix);

    // Display clusters
    displayClusters(results.clusters);

    // Show dendrogram if hierarchical
    if (results.algorithm === 'hierarchical') {
        createDendrogram(results.clusters);
        document.getElementById('dendrogram-section').classList.remove('hidden');
    } else {
        document.getElementById('dendrogram-section').classList.add('hidden');
    }

    // Display insights
    displayInsights(results.insights);
}

// Create heatmap visualization
function createHeatmap(distanceMatrix) {
    const canvas = document.getElementById('mutation-heatmap');
    const ctx = canvas.getContext('2d');

    const size = distanceMatrix.length;
    const cellSize = Math.min(400 / size, 20);
    canvas.width = size * cellSize;
    canvas.height = size * cellSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const distance = distanceMatrix[i][j];
            const intensity = Math.min(distance / 10, 1); // Normalize to 0-1

            // Color scheme: blue (low distance) to red (high distance)
            const r = Math.floor(intensity * 255);
            const g = Math.floor((1 - intensity) * 100);
            const b = Math.floor((1 - intensity) * 255);

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }

    // Add grid lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(canvas.width, i * cellSize);
        ctx.stroke();
    }
}

// Display cluster details
function displayClusters(clusters) {
    const clusterList = document.getElementById('cluster-list');
    clusterList.innerHTML = '';

    clusters.forEach(cluster => {
        const clusterDiv = document.createElement('div');
        clusterDiv.className = 'cluster-item';
        clusterDiv.innerHTML = `
            <h4>Cluster ${cluster.id}</h4>
            <p><strong>Size:</strong> ${cluster.points.length} samples</p>
            <p><strong>Samples:</strong> ${cluster.points.map(i => `Sample_${i + 1}`).join(', ')}</p>
            <div class="cluster-metrics">
                <span>Cohesion: ${calculateClusterCohesion(cluster, genomicData.analysisResults.distanceMatrix).toFixed(2)}</span>
            </div>
        `;
        clusterList.appendChild(clusterDiv);
    });
}

// Calculate cluster cohesion
function calculateClusterCohesion(cluster, distanceMatrix) {
    if (cluster.points.length <= 1) return 0;

    let totalDistance = 0;
    let count = 0;

    cluster.points.forEach(i => {
        cluster.points.forEach(j => {
            if (i !== j) {
                totalDistance += distanceMatrix[i][j];
                count++;
            }
        });
    });

    return count > 0 ? totalDistance / count : 0;
}

// Create dendrogram for hierarchical clustering
function createDendrogram(clusters) {
    const svg = d3.select('#dendrogram-svg');
    svg.selectAll('*').remove();

    // Simplified dendrogram - just show cluster hierarchy
    const width = 600;
    const height = 400;

    svg.attr('width', width).attr('height', height);

    // Create simple tree structure
    const treeData = buildTreeStructure(clusters);

    const treeLayout = d3.tree().size([width - 100, height - 100]);
    const root = d3.hierarchy(treeData);

    treeLayout(root);

    // Draw links
    svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2);

    // Draw nodes
    svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('circle')
        .attr('class', 'node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 5)
        .attr('fill', '#4a5568');

    // Add labels
    svg.selectAll('.label')
        .data(root.descendants())
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => d.x + 10)
        .attr('y', d => d.y + 5)
        .text(d => d.data.name)
        .attr('font-size', '12px');
}

// Build tree structure from clusters
function buildTreeStructure(clusters) {
    return {
        name: 'Root',
        children: clusters.map(cluster => ({
            name: `Cluster ${cluster.id}`,
            children: cluster.points.map(point => ({
                name: `Sample ${point + 1}`
            }))
        }))
    };
}

// Display insights
function displayInsights(insights) {
    const insightsList = document.getElementById('insights-list');
    insightsList.innerHTML = '';

    insights.forEach(insight => {
        const li = document.createElement('li');
        li.textContent = insight;
        insightsList.appendChild(li);
    });
}

// Export functions
function exportAsJSON() {
    const data = {
        timestamp: new Date().toISOString(),
        analysisResults: genomicData.analysisResults,
        inputData: {
            sequences: genomicData.sequences,
            mutations: genomicData.mutations
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'genomic-analysis-results.json');
}

function exportAsCSV() {
    if (!genomicData.analysisResults) return;

    let csv = 'Cluster,Sample,Mutations,SNVs,Indels\n';

    genomicData.analysisResults.clusters.forEach(cluster => {
        cluster.points.forEach(point => {
            const sample = genomicData.featureMatrix[point];
            csv += `${cluster.id},${sample.id},${sample.mutations},${sample.snvs},${sample.indels}\n`;
        });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, 'genomic-clusters.csv');
}

function exportHeatmapSVG() {
    // Simplified SVG export
    const canvas = document.getElementById('mutation-heatmap');
    const svgData = canvas.toDataURL('image/svg+xml');
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    downloadBlob(blob, 'mutation-heatmap.svg');
}

function generateReport() {
    const report = `
# Genomic Pattern Analysis Report

Generated on: ${new Date().toLocaleString()}

## Summary
- Total Samples: ${genomicData.sequences.length}
- Total Mutations: ${genomicData.mutations.length}
- Clusters Found: ${genomicData.analysisResults?.statistics.totalClusters || 0}

## Analysis Parameters
- Algorithm: ${genomicData.analysisResults?.algorithm || 'N/A'}
- Distance Metric: ${genomicData.analysisResults?.parameters.distanceMetric || 'N/A'}
- Similarity Threshold: ${genomicData.analysisResults?.parameters.threshold || 'N/A'}

## Key Findings
${genomicData.analysisResults?.insights.map(insight => `- ${insight}`).join('\n') || 'No insights available'}

## Cluster Details
${genomicData.analysisResults?.clusters.map(cluster =>
    `### Cluster ${cluster.id}
- Size: ${cluster.points.length} samples
- Samples: ${cluster.points.map(i => `Sample_${i + 1}`).join(', ')}`
).join('\n\n') || 'No clusters available'}
    `;

    const blob = new Blob([report], { type: 'text/markdown' });
    downloadBlob(blob, 'genomic-analysis-report.md');
}

// Utility function to download blobs
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);