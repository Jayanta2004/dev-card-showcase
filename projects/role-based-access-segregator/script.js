/**
 * Role-Based Access Segregator
 * Enterprise-grade access control and policy management system
 * Version 1.0.0
 */

class RoleBasedAccessSegregator {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.roles = [];
        this.policies = [];
        this.permissions = [];
        this.resources = [];
        this.auditLog = [];
        this.sessions = new Map();
        this.policyCache = new Map();
        this.settings = this.loadSettings();
        this.initialize();
    }

    initialize() {
        this.bindEvents();
        this.initializeCharts();
        this.loadData();
        this.updateUI();
        this.startPeriodicUpdates();
        this.logAuditEvent('system', 'startup', 'System initialized');
        console.log('Role-Based Access Segregator initialized');
    }

    bindEvents() {
        // Main controls
        document.getElementById('loginBtn').addEventListener('click', () => this.showLogin());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('createUserBtn').addEventListener('click', () => this.showUserModal());
        document.getElementById('createRoleBtn').addEventListener('click', () => this.showRoleModal());
        document.getElementById('createPolicyBtn').addEventListener('click', () => this.showPolicyModal());
        document.getElementById('runAccessCheckBtn').addEventListener('click', () => this.showAccessCheckModal());
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReport());
        document.getElementById('exportConfigBtn').addEventListener('click', () => this.exportConfiguration());

        // Quick actions
        document.getElementById('bulkUserImportBtn').addEventListener('click', () => this.bulkUserImport());
        document.getElementById('roleTemplateBtn').addEventListener('click', () => this.showRoleTemplates());
        document.getElementById('policyWizardBtn').addEventListener('click', () => this.showPolicyWizard());
        document.getElementById('auditTrailBtn').addEventListener('click', () => this.showAuditTrail());
        document.getElementById('accessMatrixBtn').addEventListener('click', () => this.showAccessMatrix());
        document.getElementById('simulationBtn').addEventListener('click', () => this.showSimulation());

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.navigateToSection(e.target.dataset.section));
        });

        // Search and filters
        document.getElementById('userSearch').addEventListener('input', () => this.filterUsers());
        document.getElementById('userFilter').addEventListener('change', () => this.filterUsers());
        document.getElementById('roleSearch').addEventListener('input', () => this.filterRoles());
        document.getElementById('policySearch').addEventListener('input', () => this.filterPolicies());
        document.getElementById('policyTypeFilter').addEventListener('change', () => this.filterPolicies());
        document.getElementById('resourceSearch').addEventListener('input', () => this.filterResources());
        document.getElementById('resourceTypeFilter').addEventListener('change', () => this.filterResources());

        // Role management
        document.getElementById('createRoleFromTemplateBtn').addEventListener('click', () => this.createRoleFromTemplate());

        // Matrix controls
        document.getElementById('refreshMatrixBtn').addEventListener('click', () => this.refreshPermissionMatrix());
        document.getElementById('exportMatrixBtn').addEventListener('click', () => this.exportPermissionMatrix());

        // Audit controls
        document.getElementById('filterAuditBtn').addEventListener('click', () => this.filterAuditLog());

        // Report controls
        document.getElementById('generateCustomReportBtn').addEventListener('click', () => this.generateCustomReport());

        // Settings
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettingsBtn').addEventListener('click', () => this.resetSettings());
        document.getElementById('exportSettingsBtn').addEventListener('click', () => this.exportSettings());

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });

        document.getElementById('saveUserBtn').addEventListener('click', () => this.saveUser());
        document.getElementById('cancelUserBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('saveRoleBtn').addEventListener('click', () => this.saveRole());
        document.getElementById('cancelRoleBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('savePolicyBtn').addEventListener('click', () => this.savePolicy());
        document.getElementById('cancelPolicyBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('runCheckBtn').addEventListener('click', () => this.runAccessCheck());
        document.getElementById('closeCheckBtn').addEventListener('click', () => this.closeModal());

        // Policy rules
        document.getElementById('addRuleBtn').addEventListener('click', () => this.addPolicyRule());

        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
    }

    initializeCharts() {
        // Access Patterns Chart
        const accessPatternsCtx = document.getElementById('accessPatternsChart').getContext('2d');
        this.charts = {
            accessPatterns: new Chart(accessPatternsCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Access Requests',
                        data: [],
                        borderColor: 'rgba(30, 64, 175, 1)',
                        backgroundColor: 'rgba(30, 64, 175, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }),

            // Role Distribution Chart
            roleDistribution: new Chart(document.getElementById('roleDistributionChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            'rgba(30, 64, 175, 0.8)',
                            'rgba(5, 150, 105, 0.8)',
                            'rgba(217, 119, 6, 0.8)',
                            'rgba(220, 38, 38, 0.8)',
                            'rgba(139, 69, 19, 0.8)',
                            'rgba(75, 85, 99, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            }),

            // Security Incidents Chart
            securityIncidents: new Chart(document.getElementById('securityIncidentsChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Security Incidents',
                        data: [],
                        backgroundColor: 'rgba(220, 38, 38, 0.8)',
                        borderColor: 'rgba(220, 38, 38, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            })
        };
    }

    loadData() {
        // Load sample data
        this.loadSampleData();
        this.loadSavedData();
    }

    loadSampleData() {
        // Sample permissions
        this.permissions = [
            { id: 'read', name: 'Read', description: 'Read access to resources' },
            { id: 'write', name: 'Write', description: 'Write access to resources' },
            { id: 'delete', name: 'Delete', description: 'Delete access to resources' },
            { id: 'execute', name: 'Execute', description: 'Execute operations' },
            { id: 'admin', name: 'Admin', description: 'Administrative access' },
            { id: 'manage_users', name: 'Manage Users', description: 'User management access' },
            { id: 'manage_roles', name: 'Manage Roles', description: 'Role management access' },
            { id: 'audit', name: 'Audit', description: 'Audit log access' }
        ];

        // Sample resources
        this.resources = [
            { id: 'user_data', name: 'User Data', type: 'database', description: 'User profile information' },
            { id: 'financial_records', name: 'Financial Records', type: 'database', description: 'Financial transaction data' },
            { id: 'system_config', name: 'System Configuration', type: 'application', description: 'System settings and configuration' },
            { id: 'audit_logs', name: 'Audit Logs', type: 'file', description: 'System audit logs' },
            { id: 'reports', name: 'Reports', type: 'file', description: 'Generated reports' },
            { id: 'api_endpoints', name: 'API Endpoints', type: 'api', description: 'REST API endpoints' },
            { id: 'network_devices', name: 'Network Devices', type: 'network', description: 'Network infrastructure' },
            { id: 'backup_storage', name: 'Backup Storage', type: 'file', description: 'Backup storage systems' }
        ];

        // Sample roles
        this.roles = [
            {
                id: 'admin',
                name: 'System Administrator',
                description: 'Full system access',
                permissions: ['read', 'write', 'delete', 'execute', 'admin', 'manage_users', 'manage_roles', 'audit'],
                level: 5,
                parentId: null,
                active: true
            },
            {
                id: 'manager',
                name: 'Manager',
                description: 'Management level access',
                permissions: ['read', 'write', 'execute', 'manage_users'],
                level: 3,
                parentId: null,
                active: true
            },
            {
                id: 'user',
                name: 'Standard User',
                description: 'Basic user access',
                permissions: ['read', 'write'],
                level: 1,
                parentId: null,
                active: true
            },
            {
                id: 'auditor',
                name: 'Auditor',
                description: 'Audit and compliance access',
                permissions: ['read', 'audit'],
                level: 2,
                parentId: null,
                active: true
            }
        ];

        // Sample users
        this.users = [
            {
                id: 'admin_user',
                username: 'admin',
                email: 'admin@company.com',
                firstName: 'System',
                lastName: 'Administrator',
                department: 'IT',
                roles: ['admin'],
                active: true,
                lastLogin: new Date(),
                created: new Date()
            },
            {
                id: 'manager_user',
                username: 'manager',
                email: 'manager@company.com',
                firstName: 'John',
                lastName: 'Manager',
                department: 'Operations',
                roles: ['manager'],
                active: true,
                lastLogin: new Date(Date.now() - 86400000),
                created: new Date()
            },
            {
                id: 'user1',
                username: 'user1',
                email: 'user1@company.com',
                firstName: 'Jane',
                lastName: 'User',
                department: 'Sales',
                roles: ['user'],
                active: true,
                lastLogin: new Date(Date.now() - 3600000),
                created: new Date()
            }
        ];

        // Sample policies
        this.policies = [
            {
                id: 'default_deny',
                name: 'Default Deny Policy',
                type: 'access',
                description: 'Deny access by default unless explicitly allowed',
                rules: [
                    {
                        subject: 'user',
                        operator: 'equals',
                        value: '*',
                        action: 'deny',
                        priority: 1
                    }
                ],
                active: true,
                priority: 1
            },
            {
                id: 'admin_full_access',
                name: 'Administrator Full Access',
                type: 'access',
                description: 'Grant full access to administrators',
                rules: [
                    {
                        subject: 'role',
                        operator: 'equals',
                        value: 'admin',
                        action: 'allow',
                        priority: 100
                    }
                ],
                active: true,
                priority: 100
            },
            {
                id: 'financial_restrictions',
                name: 'Financial Data Restrictions',
                type: 'data',
                description: 'Restrict access to financial data',
                rules: [
                    {
                        subject: 'department',
                        operator: 'equals',
                        value: 'Finance',
                        action: 'allow',
                        priority: 50
                    },
                    {
                        subject: 'role',
                        operator: 'equals',
                        value: 'auditor',
                        action: 'allow',
                        priority: 40
                    }
                ],
                active: true,
                priority: 50
            }
        ];
    }

    loadSavedData() {
        const savedData = localStorage.getItem('rbacData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.users = data.users || this.users;
            this.roles = data.roles || this.roles;
            this.policies = data.policies || this.policies;
            this.auditLog = data.auditLog || [];
            this.currentUser = data.currentUser || null;
        }
    }

    saveData() {
        const dataToSave = {
            users: this.users,
            roles: this.roles,
            policies: this.policies,
            auditLog: this.auditLog.slice(-1000), // Keep last 1000 audit entries
            currentUser: this.currentUser,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('rbacData', JSON.stringify(dataToSave));
    }

    loadSettings() {
        const defaultSettings = {
            sessionTimeout: 60,
            maxLoginAttempts: 5,
            enableAuditLogging: true,
            enableRealTimeMonitoring: true,
            passwordPolicy: 'strong',
            enableMFA: false,
            enableEncryption: true,
            encryptionAlgorithm: 'AES256',
            defaultDeny: 'deny',
            enablePolicyCaching: true,
            policyRefreshInterval: 300
        };

        const saved = localStorage.getItem('rbacSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    updateUI() {
        this.updateStats();
        this.updateNavigation();
        this.updateCurrentUserDisplay();
        this.refreshAllViews();
        this.updateCharts();
    }

    updateStats() {
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('activeRoles').textContent = this.roles.filter(r => r.active).length;
        document.getElementById('activePolicies').textContent = this.policies.filter(p => p.active).length;
        document.getElementById('accessRequests').textContent = this.auditLog.filter(a => a.event === 'access_request').length;
        document.getElementById('securityAlerts').textContent = this.auditLog.filter(a => a.event === 'security_alert').length;
    }

    updateNavigation() {
        // Update navigation based on current user permissions
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (this.currentUser) {
                link.style.display = 'block';
            } else {
                link.style.display = link.dataset.section === 'users' ? 'block' : 'none';
            }
        });
    }

    updateCurrentUserDisplay() {
        const currentUserElement = document.getElementById('currentUser');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.currentUser) {
            const user = this.users.find(u => u.id === this.currentUser);
            currentUserElement.textContent = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            currentUserElement.textContent = 'Not logged in';
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }
    }

    refreshAllViews() {
        this.refreshUsersList();
        this.refreshRolesList();
        this.refreshPoliciesList();
        this.refreshResourcesList();
        this.refreshAuditLog();
        this.refreshPermissionMatrix();
    }

    refreshUsersList() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        this.users.forEach(user => {
            const row = document.createElement('tr');
            const rolesText = user.roles.map(roleId => {
                const role = this.roles.find(r => r.id === roleId);
                return role ? role.name : roleId;
            }).join(', ');

            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.department || '-'}</td>
                <td>${rolesText}</td>
                <td><span class="status-badge ${user.active ? 'active' : 'inactive'}">${user.active ? 'Active' : 'Inactive'}</span></td>
                <td class="action-buttons">
                    <button class="action-btn edit" onclick="rbac.editUser('${user.id}')">Edit</button>
                    <button class="action-btn delete" onclick="rbac.deleteUser('${user.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        usersList.appendChild(table);
    }

    refreshRolesList() {
        const roleTree = document.getElementById('roleTree');
        roleTree.innerHTML = '';

        // Build role hierarchy
        const roleMap = new Map();
        this.roles.forEach(role => roleMap.set(role.id, role));

        const buildRoleTree = (parentId = null, level = 1) => {
            const childRoles = this.roles.filter(role => role.parentId === parentId);

            childRoles.forEach(role => {
                const roleElement = document.createElement('div');
                roleElement.className = `role-node level-${level}`;
                roleElement.textContent = role.name;
                roleElement.onclick = () => this.selectRole(role.id);
                roleTree.appendChild(roleElement);

                buildRoleTree(role.id, level + 1);
            });
        };

        buildRoleTree();
    }

    selectRole(roleId) {
        // Remove previous selection
        document.querySelectorAll('.role-node').forEach(node => node.classList.remove('selected'));

        // Select current role
        const selectedNode = document.querySelector(`[onclick="rbac.selectRole('${roleId}')"]`);
        if (selectedNode) {
            selectedNode.classList.add('selected');
        }

        // Show role details
        const role = this.roles.find(r => r.id === roleId);
        if (role) {
            const roleDetails = document.getElementById('roleDetails');
            roleDetails.innerHTML = `
                <div class="role-info">
                    <h3>${role.name}</h3>
                    <p>${role.description}</p>
                    <p><strong>Security Level:</strong> ${role.level}</p>
                    <p><strong>Status:</strong> ${role.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div class="role-permissions">
                    <h4>Permissions</h4>
                    ${role.permissions.map(permId => {
                        const perm = this.permissions.find(p => p.id === permId);
                        return perm ? `<span class="permission-tag">${perm.name}</span>` : '';
                    }).join('')}
                </div>
                <div class="role-actions">
                    <button class="btn btn-primary" onclick="rbac.editRole('${role.id}')">Edit Role</button>
                    <button class="btn btn-danger" onclick="rbac.deleteRole('${role.id}')">Delete Role</button>
                </div>
            `;
        }
    }

    refreshPoliciesList() {
        const policiesList = document.getElementById('policiesList');
        policiesList.innerHTML = '';

        this.policies.forEach(policy => {
            const policyElement = document.createElement('div');
            policyElement.className = 'policy-item';
            policyElement.innerHTML = `
                <div class="policy-header">
                    <div class="policy-name">${policy.name}</div>
                    <div class="policy-type">${policy.type}</div>
                </div>
                <div class="policy-description">${policy.description}</div>
                <div class="policy-meta">
                    <span>Priority: ${policy.priority}</span>
                    <span>Rules: ${policy.rules.length}</span>
                    <span>Status: ${policy.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="policy-actions">
                    <button class="btn btn-small" onclick="rbac.editPolicy('${policy.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="rbac.deletePolicy('${policy.id}')">Delete</button>
                </div>
            `;
            policiesList.appendChild(policyElement);
        });
    }

    refreshResourcesList() {
        const resourcesList = document.getElementById('resourcesList');
        resourcesList.innerHTML = '';

        this.resources.forEach(resource => {
            const resourceElement = document.createElement('div');
            resourceElement.className = 'resource-card';
            resourceElement.innerHTML = `
                <div class="resource-header">
                    <div class="resource-name">${resource.name}</div>
                    <div class="resource-type">${resource.type}</div>
                </div>
                <div class="resource-info">${resource.description}</div>
                <div class="resource-permissions">
                    <!-- Permissions will be populated based on current user -->
                </div>
            `;
            resourcesList.appendChild(resourceElement);
        });
    }

    refreshPermissionMatrix() {
        const matrix = document.getElementById('permissionMatrix');
        matrix.innerHTML = '';

        // Create matrix header
        const header = document.createElement('div');
        header.className = 'matrix-header';
        header.innerHTML = '<div class="matrix-header-cell">Role / Permission</div>';

        this.permissions.forEach(perm => {
            header.innerHTML += `<div class="matrix-header-cell">${perm.name}</div>`;
        });
        matrix.appendChild(header);

        // Create matrix rows
        this.roles.filter(r => r.active).forEach(role => {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            row.innerHTML = `<div class="matrix-cell">${role.name}</div>`;

            this.permissions.forEach(perm => {
                const hasPermission = role.permissions.includes(perm.id);
                const inherited = this.checkInheritedPermission(role.id, perm.id);
                let indicatorClass = 'none';

                if (hasPermission) {
                    indicatorClass = 'allowed';
                } else if (inherited) {
                    indicatorClass = 'inherited';
                }

                row.innerHTML += `<div class="matrix-cell"><div class="permission-indicator ${indicatorClass}"></div></div>`;
            });

            matrix.appendChild(row);
        });
    }

    checkInheritedPermission(roleId, permissionId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role || !role.parentId) return false;

        const parentRole = this.roles.find(r => r.id === role.parentId);
        if (!parentRole) return false;

        return parentRole.permissions.includes(permissionId) || this.checkInheritedPermission(role.parentId, permissionId);
    }

    refreshAuditLog() {
        const auditLog = document.getElementById('auditLog');
        auditLog.innerHTML = '';

        this.auditLog.slice(-50).reverse().forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = `audit-entry ${entry.event}`;
            entryElement.innerHTML = `
                <div class="audit-header">
                    <div class="audit-event">${entry.event.replace('_', ' ').toUpperCase()}</div>
                    <div class="audit-timestamp">${new Date(entry.timestamp).toLocaleString()}</div>
                </div>
                <div class="audit-details">${entry.details}</div>
                <div class="audit-user">User: ${entry.user}</div>
            `;
            auditLog.appendChild(entryElement);
        });
    }

    updateCharts() {
        // Update access patterns
        const accessData = this.getAccessPatternsData();
        this.charts.accessPatterns.data.labels = accessData.labels;
        this.charts.accessPatterns.data.datasets[0].data = accessData.data;
        this.charts.accessPatterns.update();

        // Update role distribution
        const roleData = this.getRoleDistributionData();
        this.charts.roleDistribution.data.labels = roleData.labels;
        this.charts.roleDistribution.data.datasets[0].data = roleData.data;
        this.charts.roleDistribution.update();

        // Update security incidents
        const incidentData = this.getSecurityIncidentsData();
        this.charts.securityIncidents.data.labels = incidentData.labels;
        this.charts.securityIncidents.data.datasets[0].data = incidentData.data;
        this.charts.securityIncidents.update();
    }

    getAccessPatternsData() {
        const last24Hours = [];
        const now = new Date();

        for (let i = 23; i >= 0; i--) {
            const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
            const count = this.auditLog.filter(entry =>
                entry.event === 'access_request' &&
                new Date(entry.timestamp) >= hour &&
                new Date(entry.timestamp) < new Date(hour.getTime() + 60 * 60 * 1000)
            ).length;
            last24Hours.push(count);
        }

        return {
            labels: last24Hours.map((_, i) => `${23 - i}h ago`),
            data: last24Hours
        };
    }

    getRoleDistributionData() {
        const roleCounts = {};
        this.roles.forEach(role => {
            roleCounts[role.name] = this.users.filter(user => user.roles.includes(role.id)).length;
        });

        return {
            labels: Object.keys(roleCounts),
            data: Object.values(roleCounts)
        };
    }

    getSecurityIncidentsData() {
        const last7Days = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const count = this.auditLog.filter(entry =>
                entry.event === 'security_alert' &&
                new Date(entry.timestamp).toDateString() === day.toDateString()
            ).length;
            last7Days.push(count);
        }

        return {
            labels: last7Days.map((_, i) => {
                const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
                return date.toLocaleDateString();
            }),
            data: last7Days
        };
    }

    // User Management
    showUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');

        if (userId) {
            const user = this.users.find(u => u.id === userId);
            if (user) {
                title.textContent = 'Edit User';
                document.getElementById('userUsername').value = user.username;
                document.getElementById('userEmail').value = user.email;
                document.getElementById('userFirstName').value = user.firstName;
                document.getElementById('userLastName').value = user.lastName;
                document.getElementById('userDepartment').value = user.department || '';
                document.getElementById('userActive').checked = user.active;

                // Populate manager dropdown
                this.populateManagerDropdown(user.managerId);

                // Populate role checkboxes
                this.populateRoleCheckboxes(user.roles);
            }
        } else {
            title.textContent = 'Create User';
            form.reset();
            this.populateManagerDropdown();
            this.populateRoleCheckboxes();
        }

        modal.style.display = 'block';
    }

    populateManagerDropdown(selectedManagerId = null) {
        const managerSelect = document.getElementById('userManager');
        managerSelect.innerHTML = '<option value="">Select Manager</option>';

        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.firstName} ${user.lastName}`;
            if (user.id === selectedManagerId) {
                option.selected = true;
            }
            managerSelect.appendChild(option);
        });
    }

    populateRoleCheckboxes(selectedRoles = []) {
        const roleSelection = document.getElementById('userRolesSelection');
        roleSelection.innerHTML = '';

        this.roles.filter(r => r.active).forEach(role => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${role.id}" ${selectedRoles.includes(role.id) ? 'checked' : ''}>
                ${role.name}
            `;
            roleSelection.appendChild(label);
        });
    }

    saveUser() {
        const username = document.getElementById('userUsername').value;
        const email = document.getElementById('userEmail').value;
        const firstName = document.getElementById('userFirstName').value;
        const lastName = document.getElementById('userLastName').value;
        const department = document.getElementById('userDepartment').value;
        const managerId = document.getElementById('userManager').value;
        const active = document.getElementById('userActive').checked;

        const selectedRoles = Array.from(document.querySelectorAll('#userRolesSelection input:checked')).map(cb => cb.value);

        if (!username || !email || !firstName || !lastName) {
            alert('Please fill in all required fields');
            return;
        }

        const userData = {
            username,
            email,
            firstName,
            lastName,
            department,
            managerId: managerId || null,
            roles: selectedRoles,
            active,
            lastLogin: new Date(),
            created: new Date()
        };

        const existingUserIndex = this.users.findIndex(u => u.username === username);
        if (existingUserIndex >= 0) {
            // Update existing user
            userData.id = this.users[existingUserIndex].id;
            userData.created = this.users[existingUserIndex].created;
            this.users[existingUserIndex] = userData;
            this.logAuditEvent('user', 'update', `Updated user: ${username}`);
        } else {
            // Create new user
            userData.id = 'user_' + Date.now();
            this.users.push(userData);
            this.logAuditEvent('user', 'create', `Created user: ${username}`);
        }

        this.closeModal();
        this.updateUI();
        this.saveData();
    }

    editUser(userId) {
        this.showUserModal(userId);
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            const userIndex = this.users.findIndex(u => u.id === userId);
            if (userIndex >= 0) {
                const user = this.users[userIndex];
                this.users.splice(userIndex, 1);
                this.logAuditEvent('user', 'delete', `Deleted user: ${user.username}`);
                this.updateUI();
                this.saveData();
            }
        }
    }

    // Role Management
    showRoleModal(roleId = null) {
        const modal = document.getElementById('roleModal');
        const title = document.getElementById('roleModalTitle');
        const form = document.getElementById('roleForm');

        if (roleId) {
            const role = this.roles.find(r => r.id === roleId);
            if (role) {
                title.textContent = 'Edit Role';
                document.getElementById('roleName').value = role.name;
                document.getElementById('roleDescription').value = role.description;
                document.getElementById('roleLevel').value = role.level;
                document.getElementById('roleActive').checked = role.active;

                // Populate parent dropdown
                this.populateParentRoleDropdown(role.parentId);

                // Populate permission checkboxes
                this.populatePermissionCheckboxes(role.permissions);
            }
        } else {
            title.textContent = 'Create Role';
            form.reset();
            this.populateParentRoleDropdown();
            this.populatePermissionCheckboxes();
        }

        modal.style.display = 'block';
    }

    populateParentRoleDropdown(selectedParentId = null) {
        const parentSelect = document.getElementById('roleParent');
        parentSelect.innerHTML = '<option value="">No Parent</option>';

        this.roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id;
            option.textContent = role.name;
            if (role.id === selectedParentId) {
                option.selected = true;
            }
            parentSelect.appendChild(option);
        });
    }

    populatePermissionCheckboxes(selectedPermissions = []) {
        const permissionSelection = document.getElementById('rolePermissionsSelection');
        permissionSelection.innerHTML = '';

        this.permissions.forEach(perm => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${perm.id}" ${selectedPermissions.includes(perm.id) ? 'checked' : ''}>
                ${perm.name}
            `;
            permissionSelection.appendChild(label);
        });
    }

    saveRole() {
        const name = document.getElementById('roleName').value;
        const description = document.getElementById('roleDescription').value;
        const parentId = document.getElementById('roleParent').value;
        const level = parseInt(document.getElementById('roleLevel').value);
        const active = document.getElementById('roleActive').checked;

        const selectedPermissions = Array.from(document.querySelectorAll('#rolePermissionsSelection input:checked')).map(cb => cb.value);

        if (!name) {
            alert('Please enter a role name');
            return;
        }

        const roleData = {
            name,
            description,
            parentId: parentId || null,
            permissions: selectedPermissions,
            level,
            active
        };

        const existingRoleIndex = this.roles.findIndex(r => r.name === name);
        if (existingRoleIndex >= 0) {
            // Update existing role
            roleData.id = this.roles[existingRoleIndex].id;
            this.roles[existingRoleIndex] = roleData;
            this.logAuditEvent('role', 'update', `Updated role: ${name}`);
        } else {
            // Create new role
            roleData.id = 'role_' + Date.now();
            this.roles.push(roleData);
            this.logAuditEvent('role', 'create', `Created role: ${name}`);
        }

        this.closeModal();
        this.updateUI();
        this.saveData();
    }

    editRole(roleId) {
        this.showRoleModal(roleId);
    }

    deleteRole(roleId) {
        if (confirm('Are you sure you want to delete this role?')) {
            const roleIndex = this.roles.findIndex(r => r.id === roleId);
            if (roleIndex >= 0) {
                const role = this.roles[roleIndex];
                this.roles.splice(roleIndex, 1);
                this.logAuditEvent('role', 'delete', `Deleted role: ${role.name}`);
                this.updateUI();
                this.saveData();
            }
        }
    }

    // Policy Management
    showPolicyModal(policyId = null) {
        const modal = document.getElementById('policyModal');
        const title = document.getElementById('policyModalTitle');
        const form = document.getElementById('policyForm');

        if (policyId) {
            const policy = this.policies.find(p => p.id === policyId);
            if (policy) {
                title.textContent = 'Edit Policy';
                document.getElementById('policyName').value = policy.name;
                document.getElementById('policyType').value = policy.type;
                document.getElementById('policyDescription').value = policy.description;
                document.getElementById('policyPriority').value = policy.priority;
                document.getElementById('policyActive').checked = policy.active;

                // Populate rules
                this.populatePolicyRules(policy.rules);
            }
        } else {
            title.textContent = 'Create Policy';
            form.reset();
            this.populatePolicyRules([]);
        }

        modal.style.display = 'block';
    }

    populatePolicyRules(rules) {
        const rulesContainer = document.getElementById('policyRulesContainer');
        rulesContainer.innerHTML = '';

        rules.forEach((rule, index) => {
            this.addPolicyRuleElement(rule);
        });

        if (rules.length === 0) {
            this.addPolicyRuleElement();
        }
    }

    addPolicyRuleElement(rule = null) {
        const rulesContainer = document.getElementById('policyRulesContainer');
        const ruleElement = document.createElement('div');
        ruleElement.className = 'policy-rule';

        ruleElement.innerHTML = `
            <select class="rule-subject">
                <option value="user" ${rule && rule.subject === 'user' ? 'selected' : ''}>User</option>
                <option value="role" ${rule && rule.subject === 'role' ? 'selected' : ''}>Role</option>
                <option value="group" ${rule && rule.subject === 'group' ? 'selected' : ''}>Group</option>
                <option value="department" ${rule && rule.subject === 'department' ? 'selected' : ''}>Department</option>
            </select>
            <select class="rule-operator">
                <option value="equals" ${rule && rule.operator === 'equals' ? 'selected' : ''}>equals</option>
                <option value="contains" ${rule && rule.operator === 'contains' ? 'selected' : ''}>contains</option>
                <option value="matches" ${rule && rule.operator === 'matches' ? 'selected' : ''}>matches</option>
            </select>
            <input type="text" class="rule-value" placeholder="Value" value="${rule ? rule.value : ''}">
            <select class="rule-action">
                <option value="allow" ${rule && rule.action === 'allow' ? 'selected' : ''}>Allow</option>
                <option value="deny" ${rule && rule.action === 'deny' ? 'selected' : ''}>Deny</option>
                <option value="log" ${rule && rule.action === 'log' ? 'selected' : ''}>Log Only</option>
            </select>
            <button type="button" class="remove-rule btn btn-small btn-danger">Remove</button>
        `;

        ruleElement.querySelector('.remove-rule').addEventListener('click', () => {
            rulesContainer.removeChild(ruleElement);
        });

        rulesContainer.appendChild(ruleElement);
    }

    addPolicyRule() {
        this.addPolicyRuleElement();
    }

    savePolicy() {
        const name = document.getElementById('policyName').value;
        const type = document.getElementById('policyType').value;
        const description = document.getElementById('policyDescription').value;
        const priority = parseInt(document.getElementById('policyPriority').value);
        const active = document.getElementById('policyActive').checked;

        // Collect rules
        const rules = [];
        document.querySelectorAll('.policy-rule').forEach(ruleElement => {
            const subject = ruleElement.querySelector('.rule-subject').value;
            const operator = ruleElement.querySelector('.rule-operator').value;
            const value = ruleElement.querySelector('.rule-value').value;
            const action = ruleElement.querySelector('.rule-action').value;

            if (value.trim()) {
                rules.push({ subject, operator, value, action, priority: rules.length + 1 });
            }
        });

        if (!name || rules.length === 0) {
            alert('Please enter a policy name and at least one rule');
            return;
        }

        const policyData = {
            name,
            type,
            description,
            rules,
            priority,
            active
        };

        const existingPolicyIndex = this.policies.findIndex(p => p.name === name);
        if (existingPolicyIndex >= 0) {
            // Update existing policy
            policyData.id = this.policies[existingPolicyIndex].id;
            this.policies[existingPolicyIndex] = policyData;
            this.logAuditEvent('policy', 'update', `Updated policy: ${name}`);
        } else {
            // Create new policy
            policyData.id = 'policy_' + Date.now();
            this.policies.push(policyData);
            this.logAuditEvent('policy', 'create', `Created policy: ${name}`);
        }

        this.closeModal();
        this.updateUI();
        this.saveData();
    }

    editPolicy(policyId) {
        this.showPolicyModal(policyId);
    }

    deletePolicy(policyId) {
        if (confirm('Are you sure you want to delete this policy?')) {
            const policyIndex = this.policies.findIndex(p => p.id === policyId);
            if (policyIndex >= 0) {
                const policy = this.policies[policyIndex];
                this.policies.splice(policyIndex, 1);
                this.logAuditEvent('policy', 'delete', `Deleted policy: ${policy.name}`);
                this.updateUI();
                this.saveData();
            }
        }
    }

    // Access Control
    showAccessCheckModal() {
        const modal = document.getElementById('accessCheckModal');

        // Populate user and resource dropdowns
        const userSelect = document.getElementById('checkUser');
        userSelect.innerHTML = '<option value="">Select User</option>';
        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.firstName} ${user.lastName} (${user.username})`;
            userSelect.appendChild(option);
        });

        const resourceSelect = document.getElementById('checkResource');
        resourceSelect.innerHTML = '<option value="">Select Resource</option>';
        this.resources.forEach(resource => {
            const option = document.createElement('option');
            option.value = resource.id;
            option.textContent = `${resource.name} (${resource.type})`;
            resourceSelect.appendChild(option);
        });

        modal.style.display = 'block';
    }

    runAccessCheck() {
        const userId = document.getElementById('checkUser').value;
        const resourceId = document.getElementById('checkResource').value;
        const action = document.getElementById('checkAction').value;

        if (!userId || !resourceId || !action) {
            alert('Please select user, resource, and action');
            return;
        }

        const result = this.evaluateAccess(userId, resourceId, action);
        const resultDiv = document.getElementById('accessResult');

        if (result.allowed) {
            resultDiv.className = 'access-result allowed';
            resultDiv.innerHTML = `
                <h4>Access Granted</h4>
                <p>User has permission to perform this action.</p>
                <p><strong>Reason:</strong> ${result.reason}</p>
            `;
        } else {
            resultDiv.className = 'access-result denied';
            resultDiv.innerHTML = `
                <h4>Access Denied</h4>
                <p>User does not have permission to perform this action.</p>
                <p><strong>Reason:</strong> ${result.reason}</p>
            `;
        }

        this.logAuditEvent('access_request', 'check', `Access check: ${userId} -> ${resourceId}:${action} = ${result.allowed ? 'granted' : 'denied'}`);
    }

    evaluateAccess(userId, resourceId, action) {
        const user = this.users.find(u => u.id === userId);
        if (!user || !user.active) {
            return { allowed: false, reason: 'User not found or inactive' };
        }

        // Get user roles and their permissions
        const userPermissions = new Set();
        user.roles.forEach(roleId => {
            const role = this.roles.find(r => r.id === roleId);
            if (role && role.active) {
                role.permissions.forEach(perm => userPermissions.add(perm));
                // Add inherited permissions
                this.getInheritedPermissions(role.id, userPermissions);
            }
        });

        // Check if user has the required permission
        if (!userPermissions.has(action)) {
            return { allowed: false, reason: 'Insufficient permissions' };
        }

        // Evaluate policies
        const applicablePolicies = this.policies.filter(p => p.active).sort((a, b) => b.priority - a.priority);

        for (const policy of applicablePolicies) {
            const policyResult = this.evaluatePolicy(policy, user, resourceId, action);
            if (policyResult !== null) {
                return {
                    allowed: policyResult,
                    reason: `Policy "${policy.name}" ${policyResult ? 'allows' : 'denies'} access`
                };
            }
        }

        // Default deny if no policy applies
        return { allowed: false, reason: 'No applicable policy found (default deny)' };
    }

    getInheritedPermissions(roleId, permissions) {
        const role = this.roles.find(r => r.id === roleId);
        if (role && role.parentId) {
            const parentRole = this.roles.find(r => r.id === role.parentId);
            if (parentRole && parentRole.active) {
                parentRole.permissions.forEach(perm => permissions.add(perm));
                this.getInheritedPermissions(role.parentId, permissions);
            }
        }
    }

    evaluatePolicy(policy, user, resourceId, action) {
        for (const rule of policy.rules) {
            let matches = false;

            switch (rule.subject) {
                case 'user':
                    matches = this.matchRule(user.username, rule.operator, rule.value);
                    break;
                case 'role':
                    matches = user.roles.some(roleId => {
                        const role = this.roles.find(r => r.id === roleId);
                        return role && this.matchRule(role.name, rule.operator, rule.value);
                    });
                    break;
                case 'department':
                    matches = this.matchRule(user.department, rule.operator, rule.value);
                    break;
                case 'group':
                    // Group matching would be implemented here
                    matches = false;
                    break;
            }

            if (matches) {
                return rule.action === 'allow';
            }
        }

        return null; // No rule matched
    }

    matchRule(value, operator, ruleValue) {
        if (!value) return false;

        switch (operator) {
            case 'equals':
                return value === ruleValue;
            case 'contains':
                return value.toLowerCase().includes(ruleValue.toLowerCase());
            case 'matches':
                try {
                    const regex = new RegExp(ruleValue);
                    return regex.test(value);
                } catch (e) {
                    return false;
                }
            default:
                return false;
        }
    }

    // Authentication
    showLogin() {
        const username = prompt('Enter username:');
        if (username) {
            const user = this.users.find(u => u.username === username && u.active);
            if (user) {
                this.currentUser = user.id;
                user.lastLogin = new Date();
                this.logAuditEvent('authentication', 'login', `User logged in: ${username}`);
                this.updateUI();
                this.saveData();
                alert(`Welcome, ${user.firstName} ${user.lastName}!`);
            } else {
                alert('Invalid username or user is inactive');
            }
        }
    }

    logout() {
        if (this.currentUser) {
            const user = this.users.find(u => u.id === this.currentUser);
            this.logAuditEvent('authentication', 'logout', `User logged out: ${user.username}`);
        }
        this.currentUser = null;
        this.updateUI();
        this.saveData();
    }

    // Navigation
    navigateToSection(section) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));

        // Add active class to selected nav link and section
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        document.getElementById(`${section}Section`).classList.add('active');
    }

    // Filtering
    filterUsers() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const statusFilter = document.getElementById('userFilter').value;

        const filteredUsers = this.users.filter(user => {
            const matchesSearch = !searchTerm ||
                user.username.toLowerCase().includes(searchTerm) ||
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && user.active) ||
                (statusFilter === 'inactive' && !user.active) ||
                (statusFilter === 'admin' && user.roles.includes('admin'));

            return matchesSearch && matchesStatus;
        });

        this.displayFilteredUsers(filteredUsers);
    }

    displayFilteredUsers(users) {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        users.forEach(user => {
            const row = document.createElement('tr');
            const rolesText = user.roles.map(roleId => {
                const role = this.roles.find(r => r.id === roleId);
                return role ? role.name : roleId;
            }).join(', ');

            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.department || '-'}</td>
                <td>${rolesText}</td>
                <td><span class="status-badge ${user.active ? 'active' : 'inactive'}">${user.active ? 'Active' : 'Inactive'}</span></td>
                <td class="action-buttons">
                    <button class="action-btn edit" onclick="rbac.editUser('${user.id}')">Edit</button>
                    <button class="action-btn delete" onclick="rbac.deleteUser('${user.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        usersList.appendChild(table);
    }

    filterRoles() {
        const searchTerm = document.getElementById('roleSearch').value.toLowerCase();
        const filteredRoles = this.roles.filter(role =>
            !searchTerm ||
            role.name.toLowerCase().includes(searchTerm) ||
            role.description.toLowerCase().includes(searchTerm)
        );

        this.displayFilteredRoles(filteredRoles);
    }

    displayFilteredRoles(roles) {
        const roleTree = document.getElementById('roleTree');
        roleTree.innerHTML = '';

        roles.forEach(role => {
            const roleElement = document.createElement('div');
            roleElement.className = 'role-node';
            roleElement.textContent = role.name;
            roleElement.onclick = () => this.selectRole(role.id);
            roleTree.appendChild(roleElement);
        });
    }

    filterPolicies() {
        const searchTerm = document.getElementById('policySearch').value.toLowerCase();
        const typeFilter = document.getElementById('policyTypeFilter').value;

        const filteredPolicies = this.policies.filter(policy => {
            const matchesSearch = !searchTerm ||
                policy.name.toLowerCase().includes(searchTerm) ||
                policy.description.toLowerCase().includes(searchTerm);

            const matchesType = typeFilter === 'all' || policy.type === typeFilter;

            return matchesSearch && matchesType;
        });

        this.displayFilteredPolicies(filteredPolicies);
    }

    displayFilteredPolicies(policies) {
        const policiesList = document.getElementById('policiesList');
        policiesList.innerHTML = '';

        policies.forEach(policy => {
            const policyElement = document.createElement('div');
            policyElement.className = 'policy-item';
            policyElement.innerHTML = `
                <div class="policy-header">
                    <div class="policy-name">${policy.name}</div>
                    <div class="policy-type">${policy.type}</div>
                </div>
                <div class="policy-description">${policy.description}</div>
                <div class="policy-meta">
                    <span>Priority: ${policy.priority}</span>
                    <span>Rules: ${policy.rules.length}</span>
                    <span>Status: ${policy.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div class="policy-actions">
                    <button class="btn btn-small" onclick="rbac.editPolicy('${policy.id}')">Edit</button>
                    <button class="btn btn-small btn-danger" onclick="rbac.deletePolicy('${policy.id}')">Delete</button>
                </div>
            `;
            policiesList.appendChild(policyElement);
        });
    }

    filterResources() {
        const searchTerm = document.getElementById('resourceSearch').value.toLowerCase();
        const typeFilter = document.getElementById('resourceTypeFilter').value;

        const filteredResources = this.resources.filter(resource => {
            const matchesSearch = !searchTerm ||
                resource.name.toLowerCase().includes(searchTerm) ||
                resource.description.toLowerCase().includes(searchTerm);

            const matchesType = typeFilter === 'all' || resource.type === typeFilter;

            return matchesSearch && matchesType;
        });

        this.displayFilteredResources(filteredResources);
    }

    displayFilteredResources(resources) {
        const resourcesList = document.getElementById('resourcesList');
        resourcesList.innerHTML = '';

        resources.forEach(resource => {
            const resourceElement = document.createElement('div');
            resourceElement.className = 'resource-card';
            resourceElement.innerHTML = `
                <div class="resource-header">
                    <div class="resource-name">${resource.name}</div>
                    <div class="resource-type">${resource.type}</div>
                </div>
                <div class="resource-info">${resource.description}</div>
                <div class="resource-permissions">
                    <!-- Permissions will be populated based on current user -->
                </div>
            `;
            resourcesList.appendChild(resourceElement);
        });
    }

    filterAuditLog() {
        const startDate = document.getElementById('auditStartDate').value;
        const endDate = document.getElementById('auditEndDate').value;
        const eventFilter = document.getElementById('auditEventFilter').value;

        const filteredEntries = this.auditLog.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            const matchesDateRange = (!startDate || entryDate >= new Date(startDate)) &&
                                   (!endDate || entryDate <= new Date(endDate));
            const matchesEvent = eventFilter === 'all' || entry.event === eventFilter;

            return matchesDateRange && matchesEvent;
        });

        this.displayFilteredAuditLog(filteredEntries);
    }

    displayFilteredAuditLog(entries) {
        const auditLog = document.getElementById('auditLog');
        auditLog.innerHTML = '';

        entries.slice(-100).reverse().forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = `audit-entry ${entry.event}`;
            entryElement.innerHTML = `
                <div class="audit-header">
                    <div class="audit-event">${entry.event.replace('_', ' ').toUpperCase()}</div>
                    <div class="audit-timestamp">${new Date(entry.timestamp).toLocaleString()}</div>
                </div>
                <div class="audit-details">${entry.details}</div>
                <div class="audit-user">User: ${entry.user}</div>
            `;
            auditLog.appendChild(entryElement);
        });
    }

    // Reporting
    generateReport() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalUsers: this.users.length,
                activeUsers: this.users.filter(u => u.active).length,
                totalRoles: this.roles.length,
                activeRoles: this.roles.filter(r => r.active).length,
                totalPolicies: this.policies.length,
                activePolicies: this.policies.filter(p => p.active).length,
                totalAuditEntries: this.auditLog.length,
                recentAlerts: this.auditLog.filter(e => e.event === 'security_alert').length
            },
            topRoles: this.getTopRoles(),
            accessPatterns: this.getAccessPatternsData(),
            securitySummary: this.getSecuritySummary()
        };

        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(`
            <html>
            <head>
                <title>RBAC Security Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1, h2 { color: #1e40af; }
                    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .summary { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <h1>Role-Based Access Control Security Report</h1>
                <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

                <div class="summary">
                    <h2>Executive Summary</h2>
                    <ul>
                        <li>Total Users: ${reportData.summary.totalUsers} (${reportData.summary.activeUsers} active)</li>
                        <li>Total Roles: ${reportData.summary.totalRoles} (${reportData.summary.activeRoles} active)</li>
                        <li>Total Policies: ${reportData.summary.totalPolicies} (${reportData.summary.activePolicies} active)</li>
                        <li>Audit Entries: ${reportData.summary.totalAuditEntries}</li>
                        <li>Security Alerts: ${reportData.summary.recentAlerts}</li>
                    </ul>
                </div>

                <h2>Top Roles by User Count</h2>
                <table>
                    <tr><th>Role</th><th>User Count</th><th>Permissions</th></tr>
                    ${reportData.topRoles.map(role =>
                        `<tr><td>${role.name}</td><td>${role.count}</td><td>${role.permissions.length}</td></tr>`
                    ).join('')}
                </table>

                <h2>Security Summary</h2>
                <ul>
                    <li>Users without roles: ${reportData.securitySummary.usersWithoutRoles}</li>
                    <li>Roles without users: ${reportData.securitySummary.rolesWithoutUsers}</li>
                    <li>Inactive policies: ${reportData.securitySummary.inactivePolicies}</li>
                    <li>Recent failed access attempts: ${reportData.securitySummary.failedAccessAttempts}</li>
                </ul>
            </body>
            </html>
        `);
        reportWindow.document.close();

        this.logAuditEvent('report', 'generate', 'Security report generated');
    }

    getTopRoles() {
        const roleCounts = {};
        this.roles.forEach(role => {
            roleCounts[role.id] = this.users.filter(user => user.roles.includes(role.id)).length;
        });

        return Object.entries(roleCounts)
            .map(([roleId, count]) => {
                const role = this.roles.find(r => r.id === roleId);
                return { name: role.name, count, permissions: role.permissions };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    getSecuritySummary() {
        return {
            usersWithoutRoles: this.users.filter(u => u.roles.length === 0).length,
            rolesWithoutUsers: this.roles.filter(r => !this.users.some(u => u.roles.includes(r.id))).length,
            inactivePolicies: this.policies.filter(p => !p.active).length,
            failedAccessAttempts: this.auditLog.filter(e => e.event === 'access_denied').length
        };
    }

    // Settings
    saveSettings() {
        this.settings = {
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value),
            enableAuditLogging: document.getElementById('enableAuditLogging').checked,
            enableRealTimeMonitoring: document.getElementById('enableRealTimeMonitoring').checked,
            passwordPolicy: document.getElementById('passwordPolicy').value,
            enableMFA: document.getElementById('enableMFA').checked,
            enableEncryption: document.getElementById('enableEncryption').checked,
            encryptionAlgorithm: document.getElementById('encryptionAlgorithm').value,
            defaultDeny: document.getElementById('defaultDeny').value,
            enablePolicyCaching: document.getElementById('enablePolicyCaching').checked,
            policyRefreshInterval: parseInt(document.getElementById('policyRefreshInterval').value)
        };

        localStorage.setItem('rbacSettings', JSON.stringify(this.settings));
        this.closeModal();
        this.logAuditEvent('settings', 'update', 'System settings updated');
    }

    resetSettings() {
        localStorage.removeItem('rbacSettings');
        this.settings = this.loadSettings();
        this.applySettingsToUI();
        this.closeModal();
        this.logAuditEvent('settings', 'reset', 'Settings reset to defaults');
    }

    applySettingsToUI() {
        document.getElementById('sessionTimeout').value = this.settings.sessionTimeout;
        document.getElementById('maxLoginAttempts').value = this.settings.maxLoginAttempts;
        document.getElementById('enableAuditLogging').checked = this.settings.enableAuditLogging;
        document.getElementById('enableRealTimeMonitoring').checked = this.settings.enableRealTimeMonitoring;
        document.getElementById('passwordPolicy').value = this.settings.passwordPolicy;
        document.getElementById('enableMFA').checked = this.settings.enableMFA;
        document.getElementById('enableEncryption').checked = this.settings.enableEncryption;
        document.getElementById('encryptionAlgorithm').value = this.settings.encryptionAlgorithm;
        document.getElementById('defaultDeny').value = this.settings.defaultDeny;
        document.getElementById('enablePolicyCaching').checked = this.settings.enablePolicyCaching;
        document.getElementById('policyRefreshInterval').value = this.settings.policyRefreshInterval;
    }

    // Utility Methods
    logAuditEvent(event, action, details) {
        if (!this.settings.enableAuditLogging) return;

        const auditEntry = {
            id: 'audit_' + Date.now(),
            timestamp: new Date().toISOString(),
            event,
            action,
            details,
            user: this.currentUser ? this.users.find(u => u.id === this.currentUser)?.username : 'system',
            ip: '127.0.0.1', // Would be actual IP in real implementation
            userAgent: navigator.userAgent
        };

        this.auditLog.push(auditEntry);

        // Keep only last 10000 audit entries
        if (this.auditLog.length > 10000) {
            this.auditLog = this.auditLog.slice(-10000);
        }

        // Update recent activity
        this.updateRecentActivity(auditEntry);

        // Check for security alerts
        if (event === 'access_denied' || event === 'security_alert') {
            this.handleSecurityAlert(auditEntry);
        }
    }

    updateRecentActivity(entry) {
        const activityFeed = document.getElementById('recentActivity');
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <strong>${entry.event}</strong>: ${entry.details}
            <div class="activity-time">${new Date(entry.timestamp).toLocaleTimeString()}</div>
        `;

        activityFeed.insertBefore(activityItem, activityFeed.firstChild);

        // Keep only last 10 activities
        while (activityFeed.children.length > 10) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    handleSecurityAlert(entry) {
        // In a real system, this would trigger notifications, alerts, etc.
        console.warn('Security Alert:', entry);
        this.updateStats();
    }

    startPeriodicUpdates() {
        // Update charts every 30 seconds
        setInterval(() => {
            this.updateCharts();
        }, 30000);

        // Save data every 60 seconds
        setInterval(() => {
            this.saveData();
        }, 60000);

        // Session timeout check
        setInterval(() => {
            if (this.currentUser && this.settings.sessionTimeout > 0) {
                const user = this.users.find(u => u.id === this.currentUser);
                if (user && user.lastLogin) {
                    const timeSinceLogin = (new Date() - new Date(user.lastLogin)) / 1000 / 60;
                    if (timeSinceLogin > this.settings.sessionTimeout) {
                        this.logout();
                        alert('Session expired due to inactivity');
                    }
                }
            }
        }, 60000);
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }

    // Placeholder methods for future implementation
    bulkUserImport() {
        alert('Bulk user import feature - Coming soon!');
    }

    showRoleTemplates() {
        alert('Role templates feature - Coming soon!');
    }

    showPolicyWizard() {
        alert('Policy wizard feature - Coming soon!');
    }

    showAuditTrail() {
        this.navigateToSection('audit');
    }

    showAccessMatrix() {
        this.navigateToSection('permissions');
    }

    showSimulation() {
        alert('Access simulation feature - Coming soon!');
    }

    generateCustomReport() {
        alert('Custom report generation - Coming soon!');
    }

    exportConfiguration() {
        const config = {
            users: this.users,
            roles: this.roles,
            policies: this.policies,
            permissions: this.permissions,
            resources: this.resources,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rbac-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.logAuditEvent('configuration', 'export', 'System configuration exported');
    }

    exportSettings() {
        const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rbac-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (confirm('This will replace current configuration. Continue?')) {
                    if (data.users) this.users = data.users;
                    if (data.roles) this.roles = data.roles;
                    if (data.policies) this.policies = data.policies;
                    if (data.permissions) this.permissions = data.permissions;
                    if (data.resources) this.resources = data.resources;
                    if (data.settings) this.settings = data.settings;

                    this.updateUI();
                    this.saveData();
                    alert('Configuration imported successfully');
                    this.logAuditEvent('configuration', 'import', 'Configuration imported from file');
                }
            } catch (error) {
                alert('Error importing configuration: ' + error.message);
            }
        };
        reader.readAsText(file);
    }

    createRoleFromTemplate() {
        alert('Role template creation - Coming soon!');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.rbac = new RoleBasedAccessSegregator();
});