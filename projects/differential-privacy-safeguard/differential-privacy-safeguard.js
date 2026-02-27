// differential-privacy-safeguard.js

// Load navbar
fetch('../navbar.html')
    .then(response => response.text())
    .then(data => document.getElementById('navbar').innerHTML = data);

function computePrivateQuery() {
    const dataInput = document.getElementById('dataInput').value;
    const epsilon = parseFloat(document.getElementById('epsilonInput').value);
    const queryType = document.getElementById('queryType').value;
    const mechanism = document.getElementById('mechanism').value;

    if (!dataInput.trim()) {
        alert('Please enter your dataset.');
        return;
    }

    if (isNaN(epsilon) || epsilon <= 0) {
        alert('Please enter a valid epsilon > 0.');
        return;
    }

    // Parse data
    const data = dataInput.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

    if (data.length === 0) {
        alert('Please enter valid numbers.');
        return;
    }

    let originalResult, privateResult, sensitivity, noise;

    switch (queryType) {
        case 'sum':
            originalResult = data.reduce((a, b) => a + b, 0);
            sensitivity = Math.max(...data) - Math.min(...data); // For bounded sum
            break;
        case 'count':
            originalResult = data.length;
            sensitivity = 1;
            break;
        case 'mean':
            originalResult = data.reduce((a, b) => a + b, 0) / data.length;
            sensitivity = (Math.max(...data) - Math.min(...data)) / data.length;
            break;
        case 'histogram':
            const bins = createHistogram(data);
            originalResult = bins;
            sensitivity = 1; // For count queries in bins
            break;
    }

    if (queryType === 'histogram') {
        const privateBins = bins.map(count => count + generateNoise(mechanism, sensitivity, epsilon));
        privateResult = privateBins;
        noise = privateBins.map((priv, i) => priv - bins[i]);
    } else {
        noise = generateNoise(mechanism, sensitivity, epsilon);
        privateResult = originalResult + noise;
    }

    // Display results
    displayResults(originalResult, privateResult, noise, epsilon, queryType);
}

function createHistogram(data) {
    const bins = new Array(10).fill(0); // 10 bins: 0-9, 10-19, etc.
    data.forEach(value => {
        const binIndex = Math.min(Math.floor(value / 10), 9);
        bins[binIndex]++;
    });
    return bins;
}

function generateNoise(mechanism, sensitivity, epsilon) {
    const scale = sensitivity / epsilon;
    if (mechanism === 'laplace') {
        return generateLaplaceNoise(scale);
    } else { // gaussian
        const delta = 1e-5; // Small delta for (ε,δ)-DP
        const sigma = sensitivity * Math.sqrt(2 * Math.log(1.25 / delta)) / epsilon;
        return generateGaussianNoise(sigma);
    }
}

function generateLaplaceNoise(scale) {
    // Generate Laplace(0, scale) using inverse transform
    const u = Math.random() - 0.5;
    return (u < 0 ? 1 : -1) * scale * Math.log(1 - 2 * Math.abs(u));
}

function generateGaussianNoise(sigma) {
    // Box-Muller transform for Gaussian
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * sigma;
}

function displayResults(original, private, noise, epsilon, queryType) {
    const histogramContainer = document.getElementById('histogramContainer');
    
    if (queryType === 'histogram') {
        document.getElementById('originalResult').textContent = 'See histogram below';
        document.getElementById('privateResult').textContent = 'See histogram below';
        document.getElementById('noiseAdded').textContent = 'See histogram below';
        document.getElementById('privacyLoss').textContent = epsilon.toFixed(2);
        
        histogramContainer.style.display = 'block';
        displayHistogram('originalHistogram', original);
        displayHistogram('privateHistogram', private);
    } else {
        document.getElementById('originalResult').textContent = original.toFixed(2);
        document.getElementById('privateResult').textContent = private.toFixed(2);
        document.getElementById('noiseAdded').textContent = noise.toFixed(2);
        document.getElementById('privacyLoss').textContent = epsilon.toFixed(2);
        
        histogramContainer.style.display = 'none';
    }
}

function displayHistogram(elementId, data) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    data.forEach((count, index) => {
        const bar = document.createElement('div');
        bar.className = 'histogram-bar';
        bar.style.height = `${count * 10}px`; // Scale for display
        bar.title = `${index * 10}-${(index + 1) * 10}: ${count.toFixed(1)}`;
        container.appendChild(bar);
    });
}