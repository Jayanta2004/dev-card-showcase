// Zero-Trust Access Governance Portal JavaScript

// Mock data for policies
const policies = [
    { name: 'Multi-Factor Authentication', status: 'active', users: 1247, compliance: 94.8 },
    { name: 'Role-Based Access Control', status: 'active', users: 892, compliance: 96.2 },
    { name: 'Device Trust Verification', status: 'active', users: 1156, compliance: 91.5 },
    { name: 'Session Management', status: 'active', users: 1247, compliance: 97.1 },
    { name: 'Data Encryption', status: 'pending', users: 734, compliance: 88.9 },
    { name: 'Network Segmentation', status: 'inactive', users: 456, compliance: 76.3 }
];

// Mock data for users
let users = [
    { id: 1, name: 'Alice Johnson', email: 'alice.johnson@company.com', role: 'admin', status: 'active', lastAccess: '2026-02-26 08:45:23' },
    { id: 2, name: 'Bob Smith', email: 'bob.smith@company.com', role: 'user', status: 'active', lastAccess: '2026-02-26 08:42:15' },
    { id: 3, name: 'Carol Williams', email: 'carol.williams@company.com', role: 'user', status: 'suspended', lastAccess: '2026-02-25 16:30:45' },
    { id: 4, name: 'David Brown', email: 'david.brown@company.com', role: 'admin', status: 'active', lastAccess: '2026-02-26 08:38:12' },
    { id: 5, name: 'Eva Davis', email: 'eva.davis@company.com', role: 'guest', status: 'pending', lastAccess: '2026-02-25 14:20:33' },
    { id: 6, name: 'Frank Miller', email: 'frank.miller@company.com', role: 'user', status: 'active', lastAccess: '2026-02-26 08:35:18' },
    { id: 7, name: 'Grace Wilson', email: 'grace.wilson@company.com', role: 'user', status: 'active', lastAccess: '2026-02-26 08:30:45' },
    { id: 8, name: 'Henry Taylor', email: 'henry.taylor@company.com', role: 'admin', status: 'suspended', lastAccess: '2026-02-25 12:15:22' }
];

// Mock data for access events
let accessEvents = [
    { timestamp: '2026-02-26 08:45:23', type: 'login', user: 'Alice Johnson', message: 'Successful login from trusted device', severity: 'success' },
    { timestamp: '2026-02-26 08:42:15', type: 'policy', user: 'System', message: 'MFA policy updated for admin role', severity: 'info' },
    { timestamp: '2026-02-26 08:40:08', type: 'failed', user: 'Unknown', message: 'Failed login attempt from untrusted IP', severity: 'warning' },
    { timestamp: '2026-02-26 08:38:12', type: 'login', user: 'David Brown', message: 'Login with elevated privileges', severity: 'info' },
    { timestamp: '2026-02-26 08:35:18', type: 'logout', user: 'Frank Miller', message: 'Session terminated normally', severity: 'info' },
    { timestamp: '2026-02-26 08:30:45', type: 'failed', user: 'Grace Wilson', message: 'MFA challenge failed', severity: 'error' },
    { timestamp: '2026-02-26 08:25:33', type: 'policy', user: 'System', message: 'Device trust verification enabled', severity: 'info' },
    { timestamp: '2026-02-26 08:20:15', type: 'login', user: 'Bob Smith', message: 'Login from new device - verification required', severity: 'warning' }
];

// DOM elements
const policiesGrid = document.getElementById('policies-grid');
const userTableBody = document.getElementById('user-table-body');
const eventsLog = document.getElementById('events-log');
const activeUsersEl = document.getElementById('active-users');
const policyComplianceEl = document.getElementById('policy-compliance');
const riskAlertsEl = document.getElementById('risk-alerts');
const lastAuditEl = document.getElementById('last-audit');

// Modal elements
const userModal = document.getElementById('user-modal');
const modalTitle = document.getElementById('modal-title');
const userForm = document.getElementById('user-form');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const userRoleInput = document.getElementById('user-role');
const userStatusInput = document.getElementById('user-status');

// Canvas for risk chart
const riskCanvas = document.getElementById('risk-chart');
const riskCtx = riskCanvas.getContext('2d');

// Current sorting
let currentSort = { column: 'name', direction: 'asc' };
let currentUserId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderPolicies();
    renderUsers();
    renderEvents();
    updateMetrics();
    initializeRiskChart();
    startRealTimeUpdates();
});

// Initialize event listeners
function initializeEventListeners() {
    // User management
    document.getElementById('add-user-btn').addEventListener('click', () => openUserModal());
    document.getElementById('user-search').addEventListener('input', filterUsers);
    document.getElementById('role-filter').addEventListener('change', filterUsers);
    document.getElementById('status-filter').addEventListener('change', filterUsers);

    // Table sorting
    document.querySelectorAll('#user-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => sortUsers(th.dataset.sort));
    });

    // Events filtering
    document.getElementById('event-filter').addEventListener('change', filterEvents);
    document.getElementById('date-filter').addEventListener('change', filterEvents);
    document.getElementById('clear-filters').addEventListener('click', clearEventFilters);

    // Modal
    document.querySelector('.close').addEventListener('click', closeUserModal);
    document.getElementById('cancel-btn').addEventListener('click', closeUserModal);
    userForm.addEventListener('submit', saveUser);

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === userModal) {
            closeUserModal();
        }
    });
}

// Render policy cards
function renderPolicies() {
    policiesGrid.innerHTML = '';

    policies.forEach(policy => {
        const card = document.createElement('div');
        card.className = 'policy-card';

        card.innerHTML = `
            <div class="policy-header">
                <div class="policy-name">${policy.name}</div>
                <div class="policy-status ${policy.status}">${policy.status}</div>
            </div>
            <div class="policy-metrics">
                <div class="metric-item">
                    <div class="value">${policy.users}</div>
                    <div class="label">Users</div>
                </div>
                <div class="metric-item">
                    <div class="value">${policy.compliance}%</div>
                    <div class="label">Compliance</div>
                </div>
            </div>
        `;

        policiesGrid.appendChild(card);
    });
}

// Render users table
function renderUsers(filteredUsers = users) {
    userTableBody.innerHTML = '';

    filteredUsers.forEach(user => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>${user.lastAccess}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editUser(${user.id})">Edit</button>
                <button class="btn-action btn-suspend" onclick="toggleUserStatus(${user.id})">
                    ${user.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;

        userTableBody.appendChild(row);
    });
}

// Render access events
function renderEvents(filteredEvents = accessEvents) {
    eventsLog.innerHTML = '';

    filteredEvents.forEach(event => {
        const eventEntry = document.createElement('div');
        eventEntry.className = 'event-entry';

        eventEntry.innerHTML = `
            <div class="event-info">
                <div class="event-timestamp">${event.timestamp}</div>
                <div class="event-message">${event.message}</div>
                <div class="event-details">User: ${event.user} | Type: ${event.type}</div>
            </div>
            <div class="event-severity ${event.severity}">${event.severity}</div>
        `;

        eventsLog.appendChild(eventEntry);
    });
}

// Update dashboard metrics
function updateMetrics() {
    const activeUsers = users.filter(u => u.status === 'active').length;
    const avgCompliance = policies.reduce((sum, p) => sum + p.compliance, 0) / policies.length;
    const riskAlerts = accessEvents.filter(e => e.severity === 'error' || e.severity === 'warning').length;

    activeUsersEl.textContent = activeUsers.toLocaleString();
    policyComplianceEl.textContent = `${avgCompliance.toFixed(1)}%`;
    riskAlertsEl.textContent = riskAlerts;
    lastAuditEl.textContent = 'Just now';
}

// Initialize risk chart
function initializeRiskChart() {
    const riskData = {
        low: 15,
        medium: 35,
        high: 25,
        critical: 5
    };

    const colors = {
        low: '#388E3C',
        medium: '#F57C00',
        high: '#FF5722',
        critical: '#D32F2F'
    };

    const labels = Object.keys(riskData);
    const data = Object.values(riskData);

    new Chart(riskCtx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1) + ' Risk'),
            datasets: [{
                data: data,
                backgroundColor: Object.values(colors),
                borderWidth: 2,
                borderColor: '#1e1e1e'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Filter users
function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    let filtered = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) ||
                             user.email.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers(filtered);
}

// Sort users
function sortUsers(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    users.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];

        if (column === 'lastAccess') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        if (currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    renderUsers();
    updateSortIndicators();
}

// Update sort indicators
function updateSortIndicators() {
    document.querySelectorAll('#user-table th[data-sort] i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    const currentTh = document.querySelector(`#user-table th[data-sort="${currentSort.column}"] i`);
    if (currentTh) {
        currentTh.className = `fas fa-sort-${currentSort.direction === 'asc' ? 'up' : 'down'}`;
    }
}

// Filter events
function filterEvents() {
    const typeFilter = document.getElementById('event-filter').value;
    const dateFilter = document.getElementById('date-filter').value;

    let filtered = accessEvents.filter(event => {
        const matchesType = typeFilter === 'all' || event.type === typeFilter;
        const matchesDate = !dateFilter || event.timestamp.startsWith(dateFilter.replace('T', ' '));

        return matchesType && matchesDate;
    });

    renderEvents(filtered);
}

// Clear event filters
function clearEventFilters() {
    document.getElementById('event-filter').value = 'all';
    document.getElementById('date-filter').value = '';
    renderEvents();
}

// Open user modal
function openUserModal(userId = null) {
    currentUserId = userId;

    if (userId) {
        const user = users.find(u => u.id === userId);
        modalTitle.textContent = 'Edit User';
        userNameInput.value = user.name;
        userEmailInput.value = user.email;
        userRoleInput.value = user.role;
        userStatusInput.value = user.status;
    } else {
        modalTitle.textContent = 'Add User';
        userForm.reset();
    }

    userModal.style.display = 'block';
}

// Close user modal
function closeUserModal() {
    userModal.style.display = 'none';
    currentUserId = null;
}

// Save user
function saveUser(e) {
    e.preventDefault();

    const userData = {
        name: userNameInput.value,
        email: userEmailInput.value,
        role: userRoleInput.value,
        status: userStatusInput.value
    };

    if (currentUserId) {
        // Edit existing user
        const userIndex = users.findIndex(u => u.id === currentUserId);
        users[userIndex] = { ...users[userIndex], ...userData };
        addEvent('policy', 'System', `User ${userData.name} updated`);
    } else {
        // Add new user
        const newUser = {
            id: Math.max(...users.map(u => u.id)) + 1,
            ...userData,
            lastAccess: 'Never'
        };
        users.push(newUser);
        addEvent('policy', 'System', `New user ${userData.name} added`);
    }

    renderUsers();
    updateMetrics();
    closeUserModal();
}

// Edit user
function editUser(userId) {
    openUserModal(userId);
}

// Toggle user status
function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    user.status = user.status === 'active' ? 'suspended' : 'active';
    user.lastAccess = new Date().toISOString().replace('T', ' ').substring(0, 19);

    addEvent(user.status === 'active' ? 'login' : 'logout', user.name,
             `User ${user.status === 'active' ? 'activated' : 'suspended'}`);

    renderUsers();
    updateMetrics();
}

// Delete user
function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    users = users.filter(u => u.id !== userId);

    addEvent('policy', 'System', `User ${user.name} deleted`);
    renderUsers();
    updateMetrics();
}

// Add event
function addEvent(type, user, message, severity = 'info') {
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);

    accessEvents.unshift({
        timestamp: timestamp,
        type: type,
        user: user,
        message: message,
        severity: severity
    });

    // Keep only last 20 events
    if (accessEvents.length > 20) {
        accessEvents.pop();
    }

    renderEvents();
}

// Start real-time updates
function startRealTimeUpdates() {
    setInterval(() => {
        // Simulate real-time updates
        updateMetrics();

        // Occasionally add new events
        if (Math.random() < 0.4) {
            const eventTypes = ['login', 'logout', 'failed', 'policy'];
            const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const randomUser = users[Math.floor(Math.random() * users.length)];

            let message, severity;
            switch (randomType) {
                case 'login':
                    message = 'Successful login';
                    severity = 'success';
                    break;
                case 'logout':
                    message = 'Session ended';
                    severity = 'info';
                    break;
                case 'failed':
                    message = 'Failed authentication attempt';
                    severity = 'warning';
                    break;
                case 'policy':
                    message = 'Policy compliance check passed';
                    severity = 'info';
                    break;
            }

            addEvent(randomType, randomUser.name, message, severity);
        }
    }, 5000);
}