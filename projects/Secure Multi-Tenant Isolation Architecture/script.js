document.addEventListener('DOMContentLoaded', function() {
    const addTenantBtn = document.getElementById('addTenantBtn');
    const isolateBtn = document.getElementById('isolateBtn');
    const simulateBtn = document.getElementById('simulateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const isolationLevel = document.getElementById('isolationLevel');
    const tenantsContainer = document.getElementById('tenantsContainer');
    const activeTenants = document.getElementById('activeTenants');
    const isolationStrength = document.getElementById('isolationStrength');
    const securityIncidents = document.getElementById('securityIncidents');
    const resourceUtilization = document.getElementById('resourceUtilization');
    const logsContainer = document.getElementById('logsContainer');

    let tenants = [];
    let isolationEnabled = false;
    let incidentCount = 0;
    let tenantCounter = 1;

    // Initialize the system
    logActivity('System initialized. Multi-tenant isolation architecture ready.');
    updateMetrics();

    addTenantBtn.addEventListener('click', function() {
        addTenant();
    });

    isolateBtn.addEventListener('click', function() {
        toggleIsolation();
    });

    simulateBtn.addEventListener('click', function() {
        simulateAttack();
    });

    resetBtn.addEventListener('click', function() {
        resetSystem();
    });

    isolationLevel.addEventListener('change', function() {
        updateIsolationStrength();
        logActivity(`Isolation level changed to ${isolationLevel.value}.`);
    });

    function addTenant() {
        const tenantId = `Tenant-${tenantCounter}`;
        const tenant = {
            id: tenantId,
            name: `Company ${tenantCounter}`,
            resources: Math.floor(Math.random() * 50) + 10,
            status: 'Active',
            isolated: false
        };

        tenants.push(tenant);
        tenantCounter++;

        renderTenant(tenant);
        updateMetrics();
        logActivity(`New tenant ${tenant.name} (${tenant.id}) added with ${tenant.resources}% resource allocation.`);
    }

    function renderTenant(tenant) {
        const tenantElement = document.createElement('div');
        tenantElement.className = 'tenant';
        tenantElement.id = tenant.id;
        tenantElement.innerHTML = `
            <h4>${tenant.name}</h4>
            <p>ID: ${tenant.id}</p>
            <p>Resources: ${tenant.resources}%</p>
            <p>Status: ${tenant.status}</p>
        `;

        if (tenant.isolated) {
            tenantElement.classList.add('isolated');
        }

        tenantsContainer.appendChild(tenantElement);
    }

    function toggleIsolation() {
        isolationEnabled = !isolationEnabled;

        tenants.forEach(tenant => {
            tenant.isolated = isolationEnabled;
            const tenantElement = document.getElementById(tenant.id);
            if (tenantElement) {
                if (isolationEnabled) {
                    tenantElement.classList.add('isolated');
                } else {
                    tenantElement.classList.remove('isolated');
                }
            }
        });

        updateMetrics();
        logActivity(`Isolation ${isolationEnabled ? 'enabled' : 'disabled'} for all tenants.`);
    }

    function simulateAttack() {
        if (tenants.length === 0) {
            logActivity('No tenants available for attack simulation.');
            return;
        }

        const targetTenant = tenants[Math.floor(Math.random() * tenants.length)];
        const success = Math.random() < (isolationEnabled ? 0.1 : 0.7); // 10% success with isolation, 70% without

        if (success) {
            incidentCount++;
            targetTenant.status = 'Compromised';
            const tenantElement = document.getElementById(targetTenant.id);
            if (tenantElement) {
                tenantElement.classList.add('isolated');
                tenantElement.querySelector('p:last-child').textContent = 'Status: Compromised';
            }
            logActivity(`🚨 SECURITY INCIDENT: ${targetTenant.name} (${targetTenant.id}) has been compromised!`);
        } else {
            logActivity(`✅ Attack on ${targetTenant.name} (${targetTenant.id}) was successfully blocked by isolation measures.`);
        }

        updateMetrics();
    }

    function resetSystem() {
        tenants = [];
        isolationEnabled = false;
        incidentCount = 0;
        tenantCounter = 1;

        tenantsContainer.innerHTML = '';
        updateMetrics();
        logActivity('System reset. All tenants removed, isolation disabled.');
    }

    function updateIsolationStrength() {
        const level = isolationLevel.value;
        let strength = 'Low';

        switch (level) {
            case 'basic':
                strength = 'Basic';
                break;
            case 'advanced':
                strength = 'High';
                break;
            case 'enterprise':
                strength = 'Maximum';
                break;
        }

        isolationStrength.textContent = strength;
    }

    function updateMetrics() {
        activeTenants.textContent = tenants.length;
        updateIsolationStrength();
        securityIncidents.textContent = incidentCount;
        resourceUtilization.textContent = Math.min(100, tenants.reduce((sum, tenant) => sum + tenant.resources, 0)) + '%';
    }

    function logActivity(message) {
        const logEntry = document.createElement('p');
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    // Auto-update resource utilization every 5 seconds
    setInterval(() => {
        if (tenants.length > 0) {
            tenants.forEach(tenant => {
                tenant.resources = Math.max(0, Math.min(100, tenant.resources + (Math.random() - 0.5) * 10));
                const tenantElement = document.getElementById(tenant.id);
                if (tenantElement) {
                    tenantElement.querySelector('p:nth-child(3)').textContent = `Resources: ${Math.round(tenant.resources)}%`;
                }
            });
            updateMetrics();
        }
    }, 5000);

    // Simulate background activity
    setInterval(() => {
        if (tenants.length > 0 && Math.random() < 0.3) {
            const randomTenant = tenants[Math.floor(Math.random() * tenants.length)];
            logActivity(`${randomTenant.name} performed routine maintenance.`);
        }
    }, 10000);
});