/**
 * Knowledge Expiry Tracker #5064
 * A comprehensive tool for tracking knowledge and skills with expiry dates
 */

class KnowledgeExpiryTracker {
    constructor() {
        this.knowledgeItems = [];
        this.categories = [];
        this.settings = this.loadSettings();
        this.currentFilter = {
            search: '',
            category: 'all',
            status: 'all'
        };
        this.currentPage = 1;
        this.itemsPerPage = parseInt(this.settings.itemsPerPage) || 25;

        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadData();
        this.updateDashboard();
        this.updateCategories();
        this.updateReminders();
        this.updateAnalytics();
        this.applySettings();
        this.initCharts();
        this.checkReminders();
        this.startReminderCheck();
    }

    initEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.getAttribute('href').substring(1));
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

        // Knowledge management
        document.getElementById('add-knowledge-btn').addEventListener('click', () => {
            this.showKnowledgeModal();
        });

        document.getElementById('search-input').addEventListener('input', (e) => {
            this.currentFilter.search = e.target.value;
            this.updateKnowledgeDisplay();
        });

        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.currentFilter.category = e.target.value;
            this.updateKnowledgeDisplay();
        });

        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.currentFilter.status = e.target.value;
            this.updateKnowledgeDisplay();
        });

        // Category management
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.showCategoryModal();
        });

        // Settings
        this.initSettingsListeners();

        // Modals
        this.initModalListeners();
    }

    initSettingsListeners() {
        // Data management
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        document.getElementById('backup-data').addEventListener('click', () => {
            this.createBackup();
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                this.clearAllData();
            }
        });

        // Display settings
        document.getElementById('items-per-page').addEventListener('change', (e) => {
            this.settings.itemsPerPage = e.target.value;
            this.itemsPerPage = parseInt(e.target.value);
            this.saveSettings();
            this.updateKnowledgeDisplay();
        });

        document.getElementById('default-sort').addEventListener('change', (e) => {
            this.settings.defaultSort = e.target.value;
            this.saveSettings();
        });

        document.getElementById('show-expiry-warnings').addEventListener('change', (e) => {
            this.settings.showExpiryWarnings = e.target.checked;
            this.saveSettings();
        });

        // Notification settings
        document.getElementById('sound-notifications').addEventListener('change', (e) => {
            this.settings.soundNotifications = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('desktop-notifications').addEventListener('change', (e) => {
            this.settings.desktopNotifications = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('notification-time').addEventListener('change', (e) => {
            this.settings.notificationTime = e.target.value;
            this.saveSettings();
        });

        // Reminder settings
        document.getElementById('enable-notifications').addEventListener('change', (e) => {
            this.settings.enableNotifications = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('reminder-days').addEventListener('change', (e) => {
            this.settings.reminderDays = parseInt(e.target.value);
            this.saveSettings();
            this.updateReminders();
        });

        document.getElementById('weekly-digest').addEventListener('change', (e) => {
            this.settings.weeklyDigest = e.target.checked;
            this.saveSettings();
        });

        // Advanced settings
        document.getElementById('auto-backup').addEventListener('change', (e) => {
            this.settings.autoBackup = parseInt(e.target.value);
            this.saveSettings();
        });

        document.getElementById('enable-analytics').addEventListener('change', (e) => {
            this.settings.enableAnalytics = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                this.resetSettings();
            }
        });
    }

    initModalListeners() {
        // Knowledge modal
        document.getElementById('close-knowledge-modal').addEventListener('click', () => {
            this.hideKnowledgeModal();
        });

        document.getElementById('cancel-knowledge').addEventListener('click', () => {
            this.hideKnowledgeModal();
        });

        document.getElementById('knowledge-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveKnowledgeItem();
        });

        // Category modal
        document.getElementById('close-category-modal').addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('cancel-category').addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Delete modal
        document.getElementById('close-delete-modal').addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('cancel-delete').addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('confirm-delete').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Test notification
        document.getElementById('test-notification').addEventListener('click', () => {
            this.testNotification();
        });
    }

    initCharts() {
        // Status chart
        this.statusChart = new Chart(document.getElementById('status-chart'), {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Expiring Soon', 'Expired', 'Recently Renewed'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#10b981', '#f59e0b', '#ef4444', '#06b6d4'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Timeline chart
        this.timelineChart = new Chart(document.getElementById('timeline-chart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Items Expiring',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Category chart
        this.categoryChart = new Chart(document.getElementById('category-chart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Items per Category',
                    data: [],
                    backgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Renewal chart
        this.renewalChart = new Chart(document.getElementById('renewal-chart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Renewals',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Priority chart
        this.priorityChart = new Chart(document.getElementById('priority-chart'), {
            type: 'pie',
            data: {
                labels: ['Low', 'Medium', 'High', 'Critical'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#64748b', '#f59e0b', '#ef4444', '#7c2d12'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });

        // Activity chart
        this.activityChart = new Chart(document.getElementById('activity-chart'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Activities',
                    data: [],
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Data Management
    loadData() {
        try {
            const knowledgeData = localStorage.getItem('knowledge-items');
            const categoriesData = localStorage.getItem('knowledge-categories');

            this.knowledgeItems = knowledgeData ? JSON.parse(knowledgeData) : [];
            this.categories = categoriesData ? JSON.parse(categoriesData) : this.getDefaultCategories();
        } catch (e) {
            console.error('Error loading data:', e);
            this.knowledgeItems = [];
            this.categories = this.getDefaultCategories();
        }
    }

    saveData() {
        localStorage.setItem('knowledge-items', JSON.stringify(this.knowledgeItems));
        localStorage.setItem('knowledge-categories', JSON.stringify(this.categories));
    }

    getDefaultCategories() {
        return [
            {
                id: 'certifications',
                name: 'Certifications',
                description: 'Professional certifications and licenses',
                color: '#2563eb'
            },
            {
                id: 'training',
                name: 'Training',
                description: 'Training courses and workshops',
                color: '#10b981'
            },
            {
                id: 'licenses',
                name: 'Licenses',
                description: 'Professional licenses and permits',
                color: '#f59e0b'
            },
            {
                id: 'skills',
                name: 'Skills',
                description: 'Technical and soft skills',
                color: '#ef4444'
            }
        ];
    }

    loadSettings() {
        const defaultSettings = {
            theme: 'light',
            itemsPerPage: '25',
            defaultSort: 'expiry-date',
            showExpiryWarnings: true,
            soundNotifications: true,
            desktopNotifications: false,
            notificationTime: '09:00',
            enableNotifications: true,
            reminderDays: 30,
            weeklyDigest: false,
            autoBackup: 7,
            enableAnalytics: true
        };

        try {
            const saved = localStorage.getItem('knowledge-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            return defaultSettings;
        }
    }

    saveSettings() {
        localStorage.setItem('knowledge-settings', JSON.stringify(this.settings));
    }

    // UI Management
    switchSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        document.getElementById(sectionId).classList.add('active');
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'light' ? 'dark' : 'light';
        this.saveSettings();
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        document.getElementById('theme-toggle').textContent = this.settings.theme === 'dark' ? '☀️' : '🌙';
    }

    applySettings() {
        this.applyTheme();

        // Apply settings to form elements
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

    resetSettings() {
        localStorage.removeItem('knowledge-settings');
        this.settings = this.loadSettings();
        this.applySettings();
    }

    // Knowledge Management
    showKnowledgeModal(item = null) {
        const modal = document.getElementById('knowledge-modal');
        const form = document.getElementById('knowledge-form');
        const title = document.getElementById('modal-title');

        if (item) {
            title.textContent = 'Edit Knowledge Item';
            this.populateKnowledgeForm(item);
        } else {
            title.textContent = 'Add Knowledge Item';
            form.reset();
            document.getElementById('knowledge-expiry').valueAsDate = new Date();
        }

        this.updateCategoryOptions();
        modal.classList.add('active');
    }

    hideKnowledgeModal() {
        document.getElementById('knowledge-modal').classList.remove('active');
    }

    populateKnowledgeForm(item) {
        document.getElementById('knowledge-name').value = item.name;
        document.getElementById('knowledge-description').value = item.description || '';
        document.getElementById('knowledge-category').value = item.category;
        document.getElementById('knowledge-priority').value = item.priority;
        document.getElementById('knowledge-expiry').value = item.expiryDate;
        document.getElementById('knowledge-cost').value = item.cost || '';
        document.getElementById('knowledge-tags').value = item.tags ? item.tags.join(', ') : '';
        document.getElementById('knowledge-notes').value = item.notes || '';
    }

    updateCategoryOptions() {
        const select = document.getElementById('knowledge-category');
        select.innerHTML = '<option value="">Select Category</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
    }

    saveKnowledgeItem() {
        const formData = new FormData(document.getElementById('knowledge-form'));
        const item = {
            id: Date.now(),
            name: formData.get('name'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            expiryDate: formData.get('expiry'),
            cost: parseFloat(formData.get('cost')) || 0,
            tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
            notes: formData.get('notes'),
            createdAt: new Date().toISOString(),
            lastRenewed: null,
            renewalHistory: []
        };

        // Check if editing existing item
        const existingIndex = this.knowledgeItems.findIndex(k => k.id === this.editingItemId);
        if (existingIndex !== -1) {
            item.id = this.editingItemId;
            item.createdAt = this.knowledgeItems[existingIndex].createdAt;
            item.lastRenewed = this.knowledgeItems[existingIndex].lastRenewed;
            item.renewalHistory = this.knowledgeItems[existingIndex].renewalHistory;
            this.knowledgeItems[existingIndex] = item;
        } else {
            this.knowledgeItems.push(item);
        }

        this.saveData();
        this.updateKnowledgeDisplay();
        this.updateDashboard();
        this.updateAnalytics();
        this.addActivity('add', `Added knowledge item: ${item.name}`);
        this.hideKnowledgeModal();

        delete this.editingItemId;
    }

    editKnowledgeItem(id) {
        const item = this.knowledgeItems.find(k => k.id === id);
        if (item) {
            this.editingItemId = id;
            this.showKnowledgeModal(item);
        }
    }

    renewKnowledgeItem(id) {
        const item = this.knowledgeItems.find(k => k.id === id);
        if (item) {
            item.lastRenewed = new Date().toISOString();
            item.renewalHistory.push({
                date: new Date().toISOString(),
                cost: item.cost
            });

            this.saveData();
            this.updateKnowledgeDisplay();
            this.updateDashboard();
            this.updateAnalytics();
            this.addActivity('renew', `Renewed knowledge item: ${item.name}`);
            this.showNotification(`Successfully renewed: ${item.name}`);
        }
    }

    deleteKnowledgeItem(id) {
        this.itemToDelete = id;
        const item = this.knowledgeItems.find(k => k.id === id);
        document.getElementById('delete-message').textContent = `Are you sure you want to delete "${item.name}"?`;
        document.getElementById('delete-modal').classList.add('active');
    }

    confirmDelete() {
        if (this.itemToDelete) {
            const item = this.knowledgeItems.find(k => k.id === this.itemToDelete);
            this.knowledgeItems = this.knowledgeItems.filter(k => k.id !== this.itemToDelete);
            this.saveData();
            this.updateKnowledgeDisplay();
            this.updateDashboard();
            this.updateAnalytics();
            this.addActivity('delete', `Deleted knowledge item: ${item.name}`);
            this.hideDeleteModal();
            delete this.itemToDelete;
        }
    }

    updateKnowledgeDisplay() {
        const grid = document.getElementById('knowledge-grid');
        const filteredItems = this.getFilteredItems();
        const paginatedItems = this.paginateItems(filteredItems);

        grid.innerHTML = '';

        paginatedItems.forEach(item => {
            const card = this.createKnowledgeCard(item);
            grid.appendChild(card);
        });

        this.updatePagination(filteredItems.length);
    }

    getFilteredItems() {
        return this.knowledgeItems.filter(item => {
            const matchesSearch = !this.currentFilter.search ||
                item.name.toLowerCase().includes(this.currentFilter.search.toLowerCase()) ||
                item.description.toLowerCase().includes(this.currentFilter.search.toLowerCase());

            const matchesCategory = this.currentFilter.category === 'all' ||
                item.category === this.currentFilter.category;

            const matchesStatus = this.currentFilter.status === 'all' ||
                this.getItemStatus(item) === this.currentFilter.status;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }

    paginateItems(items) {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return items.slice(start, end);
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        // Pagination UI would go here if needed
    }

    createKnowledgeCard(item) {
        const card = document.createElement('div');
        card.className = 'knowledge-card';

        const status = this.getItemStatus(item);
        card.classList.add(status);

        const category = this.categories.find(c => c.id === item.category);
        const daysUntilExpiry = this.getDaysUntilExpiry(item.expiryDate);

        card.innerHTML = `
            <div class="knowledge-header">
                <div>
                    <h3 class="knowledge-title">${item.name}</h3>
                    <span class="knowledge-category" style="background-color: ${category?.color || '#2563eb'}">${category?.name || 'Unknown'}</span>
                </div>
                <span class="knowledge-priority ${item.priority}">${item.priority}</span>
            </div>
            ${item.description ? `<p class="knowledge-description">${item.description}</p>` : ''}
            <div class="knowledge-meta">
                <span class="knowledge-expiry ${status === 'expired' ? 'expired' : daysUntilExpiry <= 30 ? 'expiring-soon' : ''}">
                    Expires: ${this.formatDate(item.expiryDate)} (${daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'})
                </span>
                ${item.cost > 0 ? `<span>$${item.cost}</span>` : ''}
            </div>
            <div class="knowledge-actions">
                <button class="secondary-btn" onclick="tracker.editKnowledgeItem(${item.id})">✏️ Edit</button>
                <button class="primary-btn" onclick="tracker.renewKnowledgeItem(${item.id})">🔄 Renew</button>
                <button class="danger-btn" onclick="tracker.deleteKnowledgeItem(${item.id})">🗑️ Delete</button>
            </div>
        `;

        return card;
    }

    getItemStatus(item) {
        const daysUntilExpiry = this.getDaysUntilExpiry(item.expiryDate);

        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 30) return 'expiring-soon';
        if (item.lastRenewed && this.getDaysSinceRenewal(item.lastRenewed) <= 30) return 'renewed';
        return 'active';
    }

    getDaysUntilExpiry(expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysSinceRenewal(renewalDate) {
        const today = new Date();
        const renewal = new Date(renewalDate);
        const diffTime = today - renewal;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // Category Management
    showCategoryModal(category = null) {
        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');

        if (category) {
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-description').value = category.description;
            document.getElementById('category-color').value = category.color;
        } else {
            form.reset();
        }

        modal.classList.add('active');
    }

    hideCategoryModal() {
        document.getElementById('category-modal').classList.remove('active');
    }

    saveCategory() {
        const formData = new FormData(document.getElementById('category-form'));
        const category = {
            id: Date.now().toString(),
            name: formData.get('name'),
            description: formData.get('description'),
            color: formData.get('color')
        };

        this.categories.push(category);
        this.saveData();
        this.updateCategories();
        this.updateCategoryFilter();
        this.hideCategoryModal();
    }

    updateCategories() {
        const grid = document.getElementById('categories-grid');
        grid.innerHTML = '';

        this.categories.forEach(category => {
            const card = this.createCategoryCard(category);
            grid.appendChild(card);
        });
    }

    createCategoryCard(category) {
        const itemCount = this.knowledgeItems.filter(item => item.category === category.id).length;

        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <div class="category-header">
                <div class="category-color" style="background-color: ${category.color}"></div>
                <h3 class="category-name">${category.name}</h3>
            </div>
            <p class="category-description">${category.description}</p>
            <div class="category-stats">
                <span>${itemCount} items</span>
            </div>
            <div class="category-actions">
                <button class="secondary-btn" onclick="tracker.editCategory('${category.id}')">✏️ Edit</button>
                <button class="danger-btn" onclick="tracker.deleteCategory('${category.id}')">🗑️ Delete</button>
            </div>
        `;

        return card;
    }

    updateCategoryFilter() {
        const filter = document.getElementById('category-filter');
        filter.innerHTML = '<option value="all">All Categories</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            filter.appendChild(option);
        });
    }

    // Dashboard and Analytics
    updateDashboard() {
        const total = this.knowledgeItems.length;
        const expiringSoon = this.knowledgeItems.filter(item => this.getItemStatus(item) === 'expiring-soon').length;
        const expired = this.knowledgeItems.filter(item => this.getItemStatus(item) === 'expired').length;
        const upToDate = total - expiringSoon - expired;

        document.getElementById('total-items').textContent = total;
        document.getElementById('expiring-soon').textContent = expiringSoon;
        document.getElementById('expired-items').textContent = expired;
        document.getElementById('up-to-date').textContent = upToDate;

        this.updateCharts();
        this.updateActivityList();
    }

    updateCharts() {
        // Status chart
        const statusCounts = {
            active: this.knowledgeItems.filter(item => this.getItemStatus(item) === 'active').length,
            expiringSoon: this.knowledgeItems.filter(item => this.getItemStatus(item) === 'expiring-soon').length,
            expired: this.knowledgeItems.filter(item => this.getItemStatus(item) === 'expired').length,
            renewed: this.knowledgeItems.filter(item => this.getItemStatus(item) === 'renewed').length
        };

        this.statusChart.data.datasets[0].data = [
            statusCounts.active,
            statusCounts.expiringSoon,
            statusCounts.expired,
            statusCounts.renewed
        ];
        this.statusChart.update();

        // Timeline chart - items expiring in next 90 days
        const timelineData = [];
        const timelineLabels = [];
        for (let i = 0; i < 90; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const expiringCount = this.knowledgeItems.filter(item => {
                const expiryDate = new Date(item.expiryDate).toISOString().split('T')[0];
                return expiryDate === dateStr;
            }).length;

            timelineLabels.push(this.formatDate(dateStr));
            timelineData.push(expiringCount);
        }

        this.timelineChart.data.labels = timelineLabels.slice(0, 30); // Show next 30 days
        this.timelineChart.data.datasets[0].data = timelineData.slice(0, 30);
        this.timelineChart.update();

        // Category chart
        const categoryCounts = {};
        this.categories.forEach(category => {
            categoryCounts[category.name] = this.knowledgeItems.filter(item => item.category === category.id).length;
        });

        this.categoryChart.data.labels = Object.keys(categoryCounts);
        this.categoryChart.data.datasets[0].data = Object.values(categoryCounts);
        this.categoryChart.update();

        // Priority chart
        const priorityCounts = {
            low: this.knowledgeItems.filter(item => item.priority === 'low').length,
            medium: this.knowledgeItems.filter(item => item.priority === 'medium').length,
            high: this.knowledgeItems.filter(item => item.priority === 'high').length,
            critical: this.knowledgeItems.filter(item => item.priority === 'critical').length
        };

        this.priorityChart.data.datasets[0].data = [
            priorityCounts.low,
            priorityCounts.medium,
            priorityCounts.high,
            priorityCounts.critical
        ];
        this.priorityChart.update();
    }

    updateAnalytics() {
        // Calculate analytics
        const totalRenewals = this.knowledgeItems.reduce((sum, item) => sum + item.renewalHistory.length, 0);
        const totalCost = this.knowledgeItems.reduce((sum, item) => {
            return sum + item.cost + item.renewalHistory.reduce((renewalSum, renewal) => renewalSum + (renewal.cost || 0), 0);
        }, 0);

        const lifespans = this.knowledgeItems
            .filter(item => item.renewalHistory.length > 0)
            .map(item => {
                const created = new Date(item.createdAt);
                const lastRenewal = new Date(item.lastRenewed || item.createdAt);
                return Math.floor((lastRenewal - created) / (1000 * 60 * 60 * 24));
            });

        const avgLifespan = lifespans.length > 0 ? Math.round(lifespans.reduce((a, b) => a + b, 0) / lifespans.length) : 0;
        const renewalRate = this.knowledgeItems.length > 0 ? Math.round((totalRenewals / this.knowledgeItems.length) * 100) : 0;

        const categoryActivity = {};
        this.categories.forEach(category => {
            const items = this.knowledgeItems.filter(item => item.category === category.id);
            const renewals = items.reduce((sum, item) => sum + item.renewalHistory.length, 0);
            categoryActivity[category.name] = renewals;
        });

        const mostActiveCategory = Object.entries(categoryActivity)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || '-';

        // Update display
        document.getElementById('avg-lifespan').textContent = `${avgLifespan} days`;
        document.getElementById('renewal-rate').textContent = `${renewalRate}%`;
        document.getElementById('most-active-category').textContent = mostActiveCategory;
        document.getElementById('total-cost').textContent = `$${totalCost.toFixed(2)}`;
    }

    updateActivityList() {
        const activityList = document.getElementById('activity-list');
        // This would be populated with recent activities
        // For now, just show a placeholder
        activityList.innerHTML = '<p>No recent activity</p>';
    }

    addActivity(type, description) {
        // Add to activity log (could be stored in localStorage)
        const activity = {
            id: Date.now(),
            type: type,
            description: description,
            timestamp: new Date().toISOString()
        };

        // Store in localStorage or in-memory array
        let activities = JSON.parse(localStorage.getItem('knowledge-activities') || '[]');
        activities.unshift(activity);
        activities = activities.slice(0, 50); // Keep last 50 activities
        localStorage.setItem('knowledge-activities', JSON.stringify(activities));
    }

    // Reminders and Notifications
    updateReminders() {
        const remindersList = document.getElementById('reminders-list');
        const expiringSoon = this.knowledgeItems.filter(item => {
            const days = this.getDaysUntilExpiry(item.expiryDate);
            return days >= 0 && days <= this.settings.reminderDays;
        });

        const expired = this.knowledgeItems.filter(item => this.getDaysUntilExpiry(item.expiryDate) < 0);

        const allReminders = [...expiringSoon, ...expired];
        remindersList.innerHTML = '';

        allReminders.forEach(item => {
            const reminder = this.createReminderItem(item);
            remindersList.appendChild(reminder);
        });
    }

    createReminderItem(item) {
        const days = this.getDaysUntilExpiry(item.expiryDate);
        const isExpired = days < 0;
        const status = isExpired ? 'expired' : 'expiring-soon';

        const reminder = document.createElement('div');
        reminder.className = `reminder-item ${status}`;

        reminder.innerHTML = `
            <div class="reminder-icon ${status}">
                ${isExpired ? '⚠️' : '⏰'}
            </div>
            <div class="reminder-content">
                <h4 class="reminder-title">${item.name}</h4>
                <p class="reminder-description">${item.description || 'No description'}</p>
                <p class="reminder-time">
                    ${isExpired ? 'Expired' : 'Expires'} ${this.formatDate(item.expiryDate)}
                    ${!isExpired ? `(${days} days)` : ''}
                </p>
            </div>
            <div class="reminder-actions">
                <button class="secondary-btn" onclick="tracker.editKnowledgeItem(${item.id})">View</button>
                <button class="primary-btn" onclick="tracker.renewKnowledgeItem(${item.id})">Renew</button>
            </div>
        `;

        return reminder;
    }

    checkReminders() {
        if (!this.settings.enableNotifications) return;

        const expiringSoon = this.knowledgeItems.filter(item => {
            const days = this.getDaysUntilExpiry(item.expiryDate);
            return days >= 0 && days <= this.settings.reminderDays;
        });

        const expired = this.knowledgeItems.filter(item => this.getDaysUntilExpiry(item.expiryDate) < 0);

        if (expiringSoon.length > 0 || expired.length > 0) {
            this.showNotification(`You have ${expiringSoon.length} items expiring soon and ${expired.length} expired items.`);
        }
    }

    startReminderCheck() {
        // Check reminders every hour
        setInterval(() => {
            this.checkReminders();
        }, 60 * 60 * 1000);
    }

    testNotification() {
        this.showNotification('This is a test notification!');
    }

    showNotification(message) {
        // Browser notification
        if (this.settings.desktopNotifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Knowledge Expiry Tracker', {
                    body: message,
                    icon: '/favicon.ico'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Knowledge Expiry Tracker', {
                            body: message,
                            icon: '/favicon.ico'
                        });
                    }
                });
            }
        }

        // In-app notification
        this.showToast(message);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Import/Export
    exportData() {
        const data = {
            knowledgeItems: this.knowledgeItems,
            categories: this.categories,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, `knowledge-tracker-export-${new Date().toISOString().split('T')[0]}.json`);
    }

    exportAllData() {
        const data = {
            knowledgeItems: this.knowledgeItems,
            categories: this.categories,
            settings: this.settings,
            activities: JSON.parse(localStorage.getItem('knowledge-activities') || '[]'),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, `knowledge-tracker-full-export-${new Date().toISOString().split('T')[0]}.json`);
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (data.knowledgeItems) this.knowledgeItems = data.knowledgeItems;
                if (data.categories) this.categories = data.categories;
                if (data.settings) {
                    this.settings = { ...this.settings, ...data.settings };
                    this.saveSettings();
                    this.applySettings();
                }

                this.saveData();
                this.updateKnowledgeDisplay();
                this.updateCategories();
                this.updateDashboard();
                this.updateAnalytics();
                this.updateReminders();

                this.showNotification('Data imported successfully!');
            } catch (error) {
                this.showNotification('Error importing data: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    createBackup() {
        this.exportAllData();
        this.showNotification('Backup created successfully!');
    }

    clearAllData() {
        this.knowledgeItems = [];
        this.categories = this.getDefaultCategories();
        localStorage.clear();
        this.settings = this.loadSettings();
        this.applySettings();
        this.updateKnowledgeDisplay();
        this.updateCategories();
        this.updateDashboard();
        this.updateAnalytics();
        this.updateReminders();
        this.showNotification('All data cleared!');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility Functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    hideDeleteModal() {
        document.getElementById('delete-modal').classList.remove('active');
    }

    // Initialize the application
    init() {
        this.loadData();
        this.updateCategoryFilter();
        this.updateKnowledgeDisplay();
        this.updateCategories();
        this.updateDashboard();
        this.updateAnalytics();
        this.updateReminders();
        this.applySettings();
        this.initCharts();
        this.checkReminders();
        this.startReminderCheck();
    }
}

// Create global instance
const tracker = new KnowledgeExpiryTracker();