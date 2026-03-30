document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let snapshots = [];
    let autoSnapshotInterval = null;
    let settings = {
        autoSnapshotEnabled: false,
        autoSnapshotInterval: 60,
        compressSnapshots: false,
        maxSnapshots: 100
    };
    let currentModalSnapshotIndex = -1;
    let timelineChart = null;

    // DOM elements
    const takeSnapshotBtn = document.getElementById('takeSnapshot');
    const autoSnapshotBtn = document.getElementById('autoSnapshot');
    const importSnapshotBtn = document.getElementById('importSnapshot');
    const exportSnapshotsBtn = document.getElementById('exportSnapshots');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const snapshotsGrid = document.getElementById('snapshotsGrid');
    const noSnapshots = document.getElementById('noSnapshots');
    const currentDataPre = document.getElementById('currentData');
    const refreshDataBtn = document.getElementById('refreshData');
    const clearDataBtn = document.getElementById('clearData');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const snapshotModal = document.getElementById('snapshotModal');
    const confirmModal = document.getElementById('confirmModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const loadModalSnapshotBtn = document.getElementById('loadModalSnapshot');
    const deleteModalSnapshotBtn = document.getElementById('deleteModalSnapshot');
    const confirmYesBtn = document.getElementById('confirmYes');

    // Settings elements
    const autoSnapshotEnabled = document.getElementById('autoSnapshotEnabled');
    const autoSnapshotIntervalInput = document.getElementById('autoSnapshotInterval');
    const compressSnapshots = document.getElementById('compressSnapshots');
    const maxSnapshotsInput = document.getElementById('maxSnapshots');
    const exportSettingsBtn = document.getElementById('exportSettings');
    const importSettingsBtn = document.getElementById('importSettings');

    // Stats elements
    const totalSnapshotsEl = document.getElementById('totalSnapshots');
    const totalDataPointsEl = document.getElementById('totalDataPoints');
    const storageUsedEl = document.getElementById('storageUsed');
    const avgSessionTimeEl = document.getElementById('avgSessionTime');

    // Initialize the application
    initializeApp();

    function initializeApp() {
        loadSettings();
        loadSnapshots();
        setupEventListeners();
        displayCurrentData();
        updateStats();
        renderTimelineChart();
        checkAutoSnapshot();
    }

    function setupEventListeners() {
        // Main buttons
        takeSnapshotBtn.addEventListener('click', takeSnapshot);
        autoSnapshotBtn.addEventListener('click', toggleAutoSnapshot);
        importSnapshotBtn.addEventListener('click', importSnapshots);
        exportSnapshotsBtn.addEventListener('click', exportSnapshots);

        // Search and sort
        searchInput.addEventListener('input', filterAndSortSnapshots);
        sortSelect.addEventListener('change', filterAndSortSnapshots);

        // Data controls
        refreshDataBtn.addEventListener('click', displayCurrentData);
        clearDataBtn.addEventListener('click', clearAllData);

        // Tabs
        tabButtons.forEach(button => {
            button.addEventListener('click', switchTab);
        });

        // Modals
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });

        // Modal actions
        loadModalSnapshotBtn.addEventListener('click', loadModalSnapshot);
        deleteModalSnapshotBtn.addEventListener('click', deleteModalSnapshot);
        confirmYesBtn.addEventListener('click', confirmAction);

        // Settings
        autoSnapshotEnabled.addEventListener('change', updateAutoSnapshotSetting);
        autoSnapshotIntervalInput.addEventListener('change', updateAutoSnapshotInterval);
        compressSnapshots.addEventListener('change', updateCompressionSetting);
        maxSnapshotsInput.addEventListener('change', updateMaxSnapshotsSetting);
        exportSettingsBtn.addEventListener('click', exportSettings);
        importSettingsBtn.addEventListener('click', importSettings);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('snapshotSettings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        applySettingsToUI();
    }

    function saveSettings() {
        localStorage.setItem('snapshotSettings', JSON.stringify(settings));
    }

    function applySettingsToUI() {
        autoSnapshotEnabled.checked = settings.autoSnapshotEnabled;
        autoSnapshotIntervalInput.value = settings.autoSnapshotInterval;
        compressSnapshots.checked = settings.compressSnapshots;
        maxSnapshotsInput.value = settings.maxSnapshots;
    }

    function loadSnapshots() {
        const savedSnapshots = localStorage.getItem('sessionSnapshots');
        if (savedSnapshots) {
            try {
                snapshots = JSON.parse(savedSnapshots);
                // Validate and clean snapshots
                snapshots = snapshots.filter(snapshot => 
                    snapshot && snapshot.timestamp && snapshot.data
                );
                // Sort by timestamp (newest first)
                snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                // Limit to max snapshots
                if (snapshots.length > settings.maxSnapshots) {
                    snapshots = snapshots.slice(0, settings.maxSnapshots);
                }
                saveSnapshotsToStorage();
            } catch (error) {
                console.error('Error loading snapshots:', error);
                snapshots = [];
            }
        }
        renderSnapshots();
    }

    function saveSnapshotsToStorage() {
        localStorage.setItem('sessionSnapshots', JSON.stringify(snapshots));
    }

    function takeSnapshot() {
        const snapshot = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            data: {},
            metadata: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                screenSize: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };

        // Collect all localStorage data except our app data
        for (let key in localStorage) {
            if (!['sessionSnapshots', 'snapshotSettings'].includes(key)) {
                snapshot.data[key] = localStorage.getItem(key);
            }
        }

        // Compress if enabled
        if (settings.compressSnapshots) {
            snapshot.data = compressData(snapshot.data);
            snapshot.compressed = true;
        }

        snapshots.unshift(snapshot); // Add to beginning

        // Limit snapshots
        if (snapshots.length > settings.maxSnapshots) {
            snapshots = snapshots.slice(0, settings.maxSnapshots);
        }

        saveSnapshotsToStorage();
        renderSnapshots();
        updateStats();
        renderTimelineChart();

        showToast('Snapshot taken successfully!', 'success');
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function compressData(data) {
        // Simple compression by removing null/undefined values and shortening keys
        const compressed = {};
        for (let key in data) {
            if (data[key] !== null && data[key] !== undefined) {
                // Simple key shortening (this is a basic example)
                const shortKey = key.length > 10 ? key.substr(0, 8) + '...' : key;
                compressed[shortKey] = data[key];
            }
        }
        return compressed;
    }

    function decompressData(data) {
        // Basic decompression (reverse the shortening)
        const decompressed = {};
        for (let key in data) {
            if (key.endsWith('...')) {
                // This is a simplified example - in reality you'd need a proper mapping
                decompressed[key] = data[key];
            } else {
                decompressed[key] = data[key];
            }
        }
        return decompressed;
    }

    function renderSnapshots() {
        const filteredSnapshots = getFilteredSnapshots();
        
        if (filteredSnapshots.length === 0) {
            snapshotsGrid.innerHTML = '';
            noSnapshots.style.display = 'block';
            return;
        }

        noSnapshots.style.display = 'none';
        snapshotsGrid.innerHTML = '';

        filteredSnapshots.forEach((snapshot, index) => {
            const card = createSnapshotCard(snapshot, index);
            snapshotsGrid.appendChild(card);
        });
    }

    function getFilteredSnapshots() {
        let filtered = [...snapshots];

        // Search filter
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(snapshot => 
                JSON.stringify(snapshot.data).toLowerCase().includes(searchTerm) ||
                new Date(snapshot.timestamp).toLocaleString().toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        const sortBy = sortSelect.value;
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'size':
                    return JSON.stringify(b.data).length - JSON.stringify(a.data).length;
                default: // newest
                    return new Date(b.timestamp) - new Date(a.timestamp);
            }
        });

        return filtered;
    }

    function createSnapshotCard(snapshot, index) {
        const card = document.createElement('div');
        card.className = 'snapshot-card';
        card.onclick = () => openSnapshotModal(snapshot, index);

        const timestamp = new Date(snapshot.timestamp);
        const dataPreview = getDataPreview(snapshot.data);
        const dataSize = JSON.stringify(snapshot.data).length;

        card.innerHTML = `
            <h3>${timestamp.toLocaleDateString()}</h3>
            <div class="timestamp">${timestamp.toLocaleTimeString()}</div>
            <div class="data-preview">${dataPreview}</div>
            <div class="snapshot-meta">
                <span>${Object.keys(snapshot.data).length} keys</span>
                <span>${formatBytes(dataSize)}</span>
            </div>
            <div class="actions">
                <button class="btn-secondary btn-small" onclick="event.stopPropagation(); loadSnapshot(${index})">Load</button>
                <button class="btn-danger btn-small" onclick="event.stopPropagation(); deleteSnapshot(${index})">Delete</button>
            </div>
        `;

        return card;
    }

    function getDataPreview(data) {
        const entries = Object.entries(data);
        if (entries.length === 0) return 'No data';

        const preview = entries.slice(0, 3).map(([key, value]) => {
            const shortValue = typeof value === 'string' && value.length > 50 
                ? value.substr(0, 50) + '...' 
                : String(value);
            return `<strong>${key}:</strong> ${shortValue}`;
        }).join('<br>');

        if (entries.length > 3) {
            return preview + `<br><em>... and ${entries.length - 3} more</em>`;
        }

        return preview;
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function filterAndSortSnapshots() {
        renderSnapshots();
    }

    function displayCurrentData() {
        const data = {};
        for (let key in localStorage) {
            if (!['sessionSnapshots', 'snapshotSettings'].includes(key)) {
                data[key] = localStorage.getItem(key);
            }
        }
        currentDataPre.textContent = JSON.stringify(data, null, 2);
    }

    function clearAllData() {
        showConfirmModal('Are you sure you want to clear all localStorage data? This action cannot be undone.', () => {
            for (let key in localStorage) {
                if (!['sessionSnapshots', 'snapshotSettings'].includes(key)) {
                    localStorage.removeItem(key);
                }
            }
            displayCurrentData();
            showToast('All data cleared!', 'warning');
        });
    }

    // Global functions for onclick handlers
    window.loadSnapshot = function(index) {
        const snapshot = snapshots[index];
        if (!snapshot) return;

        let data = snapshot.data;
        if (snapshot.compressed) {
            data = decompressData(data);
        }

        for (let key in data) {
            localStorage.setItem(key, data[key]);
        }

        displayCurrentData();
        showToast('Snapshot loaded successfully!', 'success');
    };

    window.deleteSnapshot = function(index) {
        showConfirmModal('Are you sure you want to delete this snapshot?', () => {
            snapshots.splice(index, 1);
            saveSnapshotsToStorage();
            renderSnapshots();
            updateStats();
            renderTimelineChart();
            showToast('Snapshot deleted!', 'warning');
        });
    };

    function switchTab(event) {
        const tabId = event.target.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        event.target.classList.add('active');
        document.getElementById(tabId + '-tab').classList.add('active');
    }

    function openSnapshotModal(snapshot, index) {
        currentModalSnapshotIndex = index;
        const modalTitle = document.getElementById('modalTitle');
        const snapshotDetails = document.getElementById('snapshotDetails');

        modalTitle.textContent = `Snapshot from ${new Date(snapshot.timestamp).toLocaleString()}`;

        let detailsHTML = `
            <div class="snapshot-info">
                <p><strong>ID:</strong> ${snapshot.id}</p>
                <p><strong>Timestamp:</strong> ${new Date(snapshot.timestamp).toLocaleString()}</p>
                <p><strong>Data Keys:</strong> ${Object.keys(snapshot.data).length}</p>
                <p><strong>Size:</strong> ${formatBytes(JSON.stringify(snapshot.data).length)}</p>
                <p><strong>Compressed:</strong> ${snapshot.compressed ? 'Yes' : 'No'}</p>
            </div>
            <div class="metadata">
                <h4>Metadata</h4>
                <pre>${JSON.stringify(snapshot.metadata || {}, null, 2)}</pre>
            </div>
            <div class="data-content">
                <h4>Data Content</h4>
                <pre>${JSON.stringify(snapshot.data, null, 2)}</pre>
            </div>
        `;

        snapshotDetails.innerHTML = detailsHTML;
        snapshotModal.classList.add('show');
    }

    function closeModals() {
        snapshotModal.classList.remove('show');
        confirmModal.classList.remove('show');
        currentModalSnapshotIndex = -1;
    }

    function loadModalSnapshot() {
        if (currentModalSnapshotIndex >= 0) {
            window.loadSnapshot(currentModalSnapshotIndex);
            closeModals();
        }
    }

    function deleteModalSnapshot() {
        if (currentModalSnapshotIndex >= 0) {
            window.deleteSnapshot(currentModalSnapshotIndex);
            closeModals();
        }
    }

    function showConfirmModal(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        confirmModal.classList.add('show');
        
        // Store the confirm action
        confirmYesBtn.onclick = () => {
            onConfirm();
            closeModals();
        };
    }

    function confirmAction() {
        // This is handled by the onclick set in showConfirmModal
    }

    function toggleAutoSnapshot() {
        settings.autoSnapshotEnabled = !settings.autoSnapshotEnabled;
        saveSettings();
        applySettingsToUI();
        checkAutoSnapshot();
        
        const status = settings.autoSnapshotEnabled ? 'enabled' : 'disabled';
        showToast(`Auto snapshot ${status}!`, 'success');
    }

    function checkAutoSnapshot() {
        if (autoSnapshotInterval) {
            clearInterval(autoSnapshotInterval);
            autoSnapshotInterval = null;
        }

        if (settings.autoSnapshotEnabled) {
            autoSnapshotInterval = setInterval(() => {
                takeSnapshot();
            }, settings.autoSnapshotInterval * 60 * 1000);
        }
    }

    function updateAutoSnapshotSetting() {
        settings.autoSnapshotEnabled = autoSnapshotEnabled.checked;
        saveSettings();
        checkAutoSnapshot();
    }

    function updateAutoSnapshotInterval() {
        settings.autoSnapshotInterval = parseInt(autoSnapshotIntervalInput.value) || 60;
        saveSettings();
        checkAutoSnapshot();
    }

    function updateCompressionSetting() {
        settings.compressSnapshots = compressSnapshots.checked;
        saveSettings();
    }

    function updateMaxSnapshotsSetting() {
        settings.maxSnapshots = parseInt(maxSnapshotsInput.value) || 100;
        saveSettings();
        // Re-apply limit
        if (snapshots.length > settings.maxSnapshots) {
            snapshots = snapshots.slice(0, settings.maxSnapshots);
            saveSnapshotsToStorage();
            renderSnapshots();
        }
    }

    function exportSnapshots() {
        const dataStr = JSON.stringify(snapshots, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `snapshots-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('Snapshots exported!', 'success');
    }

    function importSnapshots() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSnapshots = JSON.parse(e.target.result);
                        if (Array.isArray(importedSnapshots)) {
                            snapshots = [...importedSnapshots, ...snapshots];
                            // Remove duplicates and limit
                            const uniqueSnapshots = snapshots.filter((snapshot, index, self) => 
                                index === self.findIndex(s => s.id === snapshot.id)
                            );
                            snapshots = uniqueSnapshots.slice(0, settings.maxSnapshots);
                            saveSnapshotsToStorage();
                            renderSnapshots();
                            updateStats();
                            renderTimelineChart();
                            showToast('Snapshots imported successfully!', 'success');
                        } else {
                            throw new Error('Invalid file format');
                        }
                    } catch (error) {
                        showToast('Error importing snapshots: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    function exportSettings() {
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'snapshot-settings.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('Settings exported!', 'success');
    }

    function importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        settings = { ...settings, ...importedSettings };
                        saveSettings();
                        applySettingsToUI();
                        checkAutoSnapshot();
                        showToast('Settings imported successfully!', 'success');
                    } catch (error) {
                        showToast('Error importing settings: ' + error.message, 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    function updateStats() {
        totalSnapshotsEl.textContent = snapshots.length;
        
        const totalDataPoints = snapshots.reduce((sum, snapshot) => 
            sum + Object.keys(snapshot.data).length, 0);
        totalDataPointsEl.textContent = totalDataPoints;
        
        const storageUsed = snapshots.reduce((sum, snapshot) => 
            sum + JSON.stringify(snapshot).length, 0);
        storageUsedEl.textContent = formatBytes(storageUsed);
        
        // Calculate average session time (simplified)
        if (snapshots.length > 1) {
            const times = snapshots.map(s => new Date(s.timestamp).getTime());
            const avgTimeDiff = (Math.max(...times) - Math.min(...times)) / (snapshots.length - 1);
            const avgMinutes = Math.round(avgTimeDiff / (1000 * 60));
            avgSessionTimeEl.textContent = `${avgMinutes} min`;
        } else {
            avgSessionTimeEl.textContent = 'N/A';
        }
    }

    function renderTimelineChart() {
        const ctx = document.getElementById('snapshotTimelineChart');
        if (!ctx) return;

        if (timelineChart) {
            timelineChart.destroy();
        }

        const labels = snapshots.slice(0, 20).reverse().map(snapshot => 
            new Date(snapshot.timestamp).toLocaleDateString());
        const data = snapshots.slice(0, 20).reverse().map(snapshot => 
            Object.keys(snapshot.data).length);

        timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Data Points',
                    data: data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Snapshot Timeline'
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

    function handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    takeSnapshot();
                    break;
                case 'o':
                    event.preventDefault();
                    importSnapshots();
                    break;
                case 'e':
                    event.preventDefault();
                    exportSnapshots();
                    break;
                case '/':
                    event.preventDefault();
                    searchInput.focus();
                    break;
            }
        }

        if (event.key === 'Escape') {
            closeModals();
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Debounce search input
    const debouncedFilter = debounce(filterAndSortSnapshots, 300);
    searchInput.addEventListener('input', debouncedFilter);

    // Initialize on page load
    window.addEventListener('beforeunload', () => {
        if (autoSnapshotInterval) {
            clearInterval(autoSnapshotInterval);
        }
    });
});