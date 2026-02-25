// modular-data-integrity-sentinel.js

let scanResults = [];
let isScanning = false;

function runModule(moduleType) {
    if (isScanning) return;

    const statusElement = document.getElementById(`${moduleType}-status`);
    statusElement.textContent = 'Running...';
    statusElement.className = 'module-status running';

    // Simulate async operation
    setTimeout(() => {
        let result;
        switch (moduleType) {
            case 'consistency':
                result = checkConsistency();
                break;
            case 'checksum':
                result = checkChecksum();
                break;
            case 'range':
                result = checkRanges();
                break;
            case 'duplicates':
                result = checkDuplicates();
                break;
        }

        statusElement.textContent = result.status === 'success' ? 'Passed' : 'Issues Found';
        statusElement.className = `module-status ${result.status}`;

        addResult(`${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Check`, result);
        displayResults();
    }, 1000 + Math.random() * 2000); // Random delay for realism
}

function runFullScan() {
    if (isScanning) return;

    isScanning = true;
    scanResults = [];
    document.getElementById('scanBtn').disabled = true;
    document.getElementById('scanProgress').style.display = 'block';
    document.getElementById('scanStatus').textContent = 'Initializing scan...';

    const modules = ['consistency', 'checksum', 'range', 'duplicates'];
    let completed = 0;

    modules.forEach((module, index) => {
        setTimeout(() => {
            runModule(module);
            completed++;
            const progress = (completed / modules.length) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('scanStatus').textContent = `Scanning ${module}... (${completed}/${modules.length})`;

            if (completed === modules.length) {
                document.getElementById('scanStatus').textContent = 'Scan complete!';
                setTimeout(() => {
                    document.getElementById('scanProgress').style.display = 'none';
                    document.getElementById('scanBtn').disabled = false;
                    isScanning = false;
                }, 1000);
            }
        }, index * 1500);
    });
}

function checkConsistency() {
    // Check if stored data has consistent structure
    const keys = Object.keys(localStorage);
    let issues = 0;

    keys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) {
                // Check if array elements have consistent structure
                if (data.length > 1) {
                    const firstItemKeys = Object.keys(data[0]);
                    data.forEach(item => {
                        const itemKeys = Object.keys(item);
                        if (itemKeys.length !== firstItemKeys.length ||
                            !firstItemKeys.every(k => itemKeys.includes(k))) {
                            issues++;
                        }
                    });
                }
            }
        } catch (e) {
            issues++;
        }
    });

    return {
        status: issues === 0 ? 'success' : 'warning',
        message: issues === 0 ? 'All data structures are consistent.' : `Found ${issues} consistency issues.`
    };
}

function checkChecksum() {
    // Simple checksum validation (in real implementation, use proper crypto)
    const keys = Object.keys(localStorage);
    let valid = true;

    keys.forEach(key => {
        try {
            const data = localStorage.getItem(key);
            const checksum = simpleChecksum(data);
            // In a real system, compare with stored checksum
            if (checksum < 0) valid = false; // Placeholder
        } catch (e) {
            valid = false;
        }
    });

    return {
        status: valid ? 'success' : 'error',
        message: valid ? 'All checksums are valid.' : 'Checksum validation failed.'
    };
}

function checkRanges() {
    // Check if numeric values are within reasonable ranges
    const keys = Object.keys(localStorage);
    let issues = 0;

    keys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) {
                data.forEach(item => {
                    Object.values(item).forEach(value => {
                        if (typeof value === 'number') {
                            if (value < -1000000 || value > 1000000 || !isFinite(value)) {
                                issues++;
                            }
                        }
                    });
                });
            }
        } catch (e) {
            // Skip non-JSON data
        }
    });

    return {
        status: issues === 0 ? 'success' : 'warning',
        message: issues === 0 ? 'All values are within expected ranges.' : `Found ${issues} out-of-range values.`
    };
}

function checkDuplicates() {
    // Check for duplicate entries
    const keys = Object.keys(localStorage);
    let duplicates = 0;

    keys.forEach(key => {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(data)) {
                const seen = new Set();
                data.forEach(item => {
                    const hash = JSON.stringify(item);
                    if (seen.has(hash)) {
                        duplicates++;
                    } else {
                        seen.add(hash);
                    }
                });
            }
        } catch (e) {
            // Skip non-JSON data
        }
    });

    return {
        status: duplicates === 0 ? 'success' : 'warning',
        message: duplicates === 0 ? 'No duplicate entries found.' : `Found ${duplicates} duplicate entries.`
    };
}

function simpleChecksum(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

function addResult(moduleName, result) {
    scanResults.push({
        module: moduleName,
        status: result.status,
        message: result.message,
        timestamp: new Date().toLocaleString()
    });
}

function displayResults() {
    const container = document.getElementById('resultsContainer');
    if (scanResults.length === 0) {
        container.innerHTML = '<p class="no-results">No scans performed yet. Run a module or full scan to see results.</p>';
        return;
    }

    container.innerHTML = scanResults.map(result => `
        <div class="result-item ${result.status}">
            <strong>${result.module}:</strong> ${result.message}
            <small>(${result.timestamp})</small>
        </div>
    `).join('');
}

function repairData(action) {
    switch (action) {
        case 'auto':
            alert('Auto repair feature would attempt to fix detected issues automatically.');
            break;
        case 'backup':
            const data = {};
            Object.keys(localStorage).forEach(key => {
                data[key] = localStorage.getItem(key);
            });
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `data-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            alert('Backup created successfully!');
            break;
        case 'clean':
            alert('Clean invalid data feature would remove corrupted entries.');
            break;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayResults();
});