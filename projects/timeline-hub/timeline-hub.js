// timeline-hub.js
// Client Communication Timeline Hub - Complete Implementation

// ========== Data Storage & State ==========
let clients = [];
let currentClientId = null;
let currentActivityIndex = null;
let editMode = false;

// ========== Local Storage Functions ==========
function saveToLocalStorage() {
    try {
        localStorage.setItem('clientTimelineData', JSON.stringify(clients));
        showNotification('Data saved successfully', 'success');
    } catch (error) {
        showNotification('Error saving data', 'error');
        console.error('Save error:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const data = localStorage.getItem('clientTimelineData');
        if (data) {
            clients = JSON.parse(data);
        } else {
            // Initialize with sample data
            clients = getSampleData();
            saveToLocalStorage();
        }
    } catch (error) {
        console.error('Load error:', error);
        clients = getSampleData();
    }
}

function getSampleData() {
    return [
        {
            id: Date.now(),
            name: "Acme Corporation",
            email: "contact@acmecorp.com",
            phone: "+1 555-0100",
            company: "Acme Corp",
            lastContact: "2026-03-01",
            status: "Active",
            notes: "Major client for web development projects",
            activities: [
                {
                    type: "Email",
                    title: "Project Kickoff Discussion",
                    date: "2026-03-01",
                    time: "10:00",
                    notes: "Discussed initial project requirements and timeline. Client wants to start ASAP.",
                    priority: false
                },
                {
                    type: "Meeting",
                    title: "Requirements Gathering Session",
                    date: "2026-02-28",
                    time: "14:30",
                    notes: "Comprehensive meeting to understand all project requirements. Collected detailed specifications.",
                    priority: true
                },
                {
                    type: "Deadline",
                    title: "Phase 1 Delivery",
                    date: "2026-03-15",
                    time: "17:00",
                    notes: "First phase must be delivered by this date.",
                    priority: true
                }
            ]
        },
        {
            id: Date.now() + 1,
            name: "Tech Innovations LLC",
            email: "hello@techinnovations.com",
            phone: "+1 555-0200",
            company: "Tech Innovations",
            lastContact: "2026-02-20",
            status: "Pending",
            notes: "Potential client for mobile app development",
            activities: [
                {
                    type: "Call",
                    title: "Initial Consultation",
                    date: "2026-02-20",
                    time: "11:00",
                    notes: "Discussed their mobile app needs. Interested in cross-platform solution.",
                    priority: false
                },
                {
                    type: "Email",
                    title: "Proposal Sent",
                    date: "2026-02-22",
                    time: "09:15",
                    notes: "Sent detailed proposal with pricing and timeline.",
                    priority: false
                }
            ]
        },
        {
            id: Date.now() + 2,
            name: "Global Solutions Inc",
            email: "info@globalsolutions.com",
            phone: "+1 555-0300",
            company: "Global Solutions",
            lastContact: "2026-02-10",
            status: "Inactive",
            notes: "Previous client, may have new projects soon",
            activities: [
                {
                    type: "Email",
                    title: "Follow-up Check-in",
                    date: "2026-02-10",
                    time: "16:00",
                    notes: "Sent email to check on potential new projects. Awaiting response.",
                    priority: false
                },
                {
                    type: "Task",
                    title: "Final Report Submission",
                    date: "2026-02-05",
                    time: "10:00",
                    notes: "Submitted final project report for previous engagement.",
                    priority: false
                }
            ]
        }
    ];
}

// ========== Utility Functions ==========
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr;
}

function getDaysSince(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = today - date;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function generateId() {
    return Date.now() + Math.random();
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ========== Navigation ==========
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');
            
            // Re-render section if needed
            if (targetId === 'timeline') renderTimeline();
            if (targetId === 'alerts') renderAlerts();
            if (targetId === 'summaries') renderSummaries();
        });
    });
}

// ========== Client Management ==========
function renderClients() {
    const list = document.getElementById('client-list');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const sortBy = document.getElementById('sort-clients').value;
    
    let filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm) ||
                            client.company.toLowerCase().includes(searchTerm) ||
                            (client.email && client.email.toLowerCase().includes(searchTerm));
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    // Sort clients
    filteredClients.sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
            return new Date(b.lastContact) - new Date(a.lastContact);
        } else if (sortBy === 'status') {
            return a.status.localeCompare(b.status);
        }
        return 0;
    });
    
    list.innerHTML = '';
    
    if (filteredClients.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">No clients found. Add your first client!</p>';
        return;
    }
    
    filteredClients.forEach(client => {
        const card = document.createElement('div');
        card.className = 'client-card';
        card.style.background = getClientCardGradient(client.status);
        card.innerHTML = `
            <h3>${client.name}</h3>
            <div class="last-contact">
                <i class="fas fa-calendar-alt"></i> Last Contact: ${formatDate(client.lastContact)}
            </div>
            <div class="status">
                <i class="fas fa-circle"></i> ${client.status}
            </div>
            <div class="activity-count">
                <i class="fas fa-tasks"></i> ${client.activities.length} activities
            </div>
        `;
        card.addEventListener('click', () => openClientDetail(client.id));
        list.appendChild(card);
    });
}

function getClientCardGradient(status) {
    const gradients = {
        'Active': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Pending': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'Inactive': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'Completed': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    };
    return gradients[status] || gradients['Active'];
}

function openClientModal(clientId = null) {
    const modal = document.getElementById('client-modal');
    const form = document.getElementById('client-form');
    const title = document.getElementById('client-modal-title');
    
    editMode = clientId !== null;
    currentClientId = clientId;
    
    if (editMode) {
        const client = clients.find(c => c.id === clientId);
        title.innerHTML = '<i class="fas fa-user-edit"></i> Edit Client';
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-email').value = client.email || '';
        document.getElementById('client-phone').value = client.phone || '';
        document.getElementById('client-company').value = client.company || '';
        document.getElementById('client-status').value = client.status;
        document.getElementById('client-notes').value = client.notes || '';
    } else {
        title.innerHTML = '<i class="fas fa-user-plus"></i> Add Client';
        form.reset();
    }
    
    modal.classList.add('active');
}

function closeClientModal() {
    const modal = document.getElementById('client-modal');
    modal.classList.remove('active');
    document.getElementById('client-form').reset();
    editMode = false;
    currentClientId = null;
}

function saveClient(e) {
    e.preventDefault();
    
    const clientData = {
        name: document.getElementById('client-name').value.trim(),
        email: document.getElementById('client-email').value.trim(),
        phone: document.getElementById('client-phone').value.trim(),
        company: document.getElementById('client-company').value.trim(),
        status: document.getElementById('client-status').value,
        notes: document.getElementById('client-notes').value.trim(),
        lastContact: new Date().toISOString().split('T')[0]
    };
    
    if (!clientData.name) {
        showNotification('Client name is required', 'error');
        return;
    }
    
    if (editMode) {
        const client = clients.find(c => c.id === currentClientId);
        Object.assign(client, clientData);
        showNotification('Client updated successfully', 'success');
    } else {
        const newClient = {
            id: generateId(),
            ...clientData,
            activities: []
        };
        clients.push(newClient);
        showNotification('Client added successfully', 'success');
    }
    
    saveToLocalStorage();
    closeClientModal();
    renderClients();
    updateClientFilter();
}

function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        clients = clients.filter(c => c.id !== clientId);
        saveToLocalStorage();
        closeClientDetailModal();
        renderClients();
        updateClientFilter();
        showNotification('Client deleted successfully', 'success');
    }
}

// ========== Client Detail Modal ==========
function openClientDetail(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    currentClientId = clientId;
    const modal = document.getElementById('client-detail-modal');
    const title = document.getElementById('client-detail-title');
    const info = document.getElementById('client-detail-info');
    const activitiesList = document.getElementById('client-activities-list');
    
    title.innerHTML = `<i class="fas fa-user"></i> ${client.name}`;
    
    info.innerHTML = `
        <p><strong>Company:</strong> ${client.company || 'N/A'}</p>
        <p><strong>Email:</strong> ${client.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${client.phone || 'N/A'}</p>
        <p><strong>Status:</strong> <span class="event-type">${client.status}</span></p>
        <p><strong>Last Contact:</strong> ${formatDate(client.lastContact)}</p>
        ${client.notes ? `<p><strong>Notes:</strong> ${client.notes}</p>` : ''}
    `;
    
    activitiesList.innerHTML = '';
    
    if (client.activities.length === 0) {
        activitiesList.innerHTML = '<p style="color: #888;">No activities yet. Add your first activity!</p>';
    } else {
        client.activities.forEach((activity, index) => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-item-header">
                    <div>
                        <span class="event-type">${activity.type}</span>
                        <strong>${activity.title}</strong>
                        ${activity.priority ? '<span class="priority-badge">PRIORITY</span>' : ''}
                    </div>
                    <div class="activity-item-actions">
                        <button class="btn btn-small btn-secondary" onclick="editActivity(${clientId}, ${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteActivity(${clientId}, ${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="event-date">
                    <i class="fas fa-calendar"></i> ${formatDate(activity.date)}
                    ${activity.time ? `<span class="event-time"><i class="fas fa-clock"></i> ${formatTime(activity.time)}</span>` : ''}
                </div>
                ${activity.notes ? `<div class="event-notes">${activity.notes}</div>` : ''}
            `;
            activitiesList.appendChild(item);
        });
    }
    
    modal.classList.add('active');
}

function closeClientDetailModal() {
    const modal = document.getElementById('client-detail-modal');
    modal.classList.remove('active');
    currentClientId = null;
}

// ========== Activity Management ==========
function openActivityModal(clientId = null, activityIndex = null) {
    const modal = document.getElementById('activity-modal');
    const form = document.getElementById('activity-form');
    const title = document.getElementById('activity-modal-title');
    
    editMode = activityIndex !== null;
    currentClientId = clientId || currentClientId;
    currentActivityIndex = activityIndex;
    
    document.getElementById('activity-client-id').value = currentClientId;
    
    if (editMode) {
        const client = clients.find(c => c.id === currentClientId);
        const activity = client.activities[activityIndex];
        
        title.innerHTML = '<i class="fas fa-edit"></i> Edit Activity';
        document.getElementById('activity-type').value = activity.type;
        document.getElementById('activity-title').value = activity.title;
        document.getElementById('activity-date').value = activity.date;
        document.getElementById('activity-time').value = activity.time || '';
        document.getElementById('activity-notes').value = activity.notes || '';
        document.getElementById('activity-priority').checked = activity.priority || false;
    } else {
        title.innerHTML = '<i class="fas fa-plus-circle"></i> Add Activity';
        form.reset();
        document.getElementById('activity-date').valueAsDate = new Date();
    }
    
    modal.classList.add('active');
}

function closeActivityModal() {
    const modal = document.getElementById('activity-modal');
    modal.classList.remove('active');
    document.getElementById('activity-form').reset();
    editMode = false;
    currentActivityIndex = null;
}

function saveActivity(e) {
    e.preventDefault();
    
    const activityData = {
        type: document.getElementById('activity-type').value,
        title: document.getElementById('activity-title').value.trim(),
        date: document.getElementById('activity-date').value,
        time: document.getElementById('activity-time').value,
        notes: document.getElementById('activity-notes').value.trim(),
        priority: document.getElementById('activity-priority').checked
    };
    
    const client = clients.find(c => c.id === currentClientId);
    if (!client) return;
    
    if (editMode) {
        client.activities[currentActivityIndex] = activityData;
        showNotification('Activity updated successfully', 'success');
    } else {
        client.activities.push(activityData);
        showNotification('Activity added successfully', 'success');
    }
    
    // Update last contact date
    client.lastContact = activityData.date;
    
    saveToLocalStorage();
    closeActivityModal();
    openClientDetail(currentClientId);
    renderTimeline();
}

function editActivity(clientId, index) {
    openActivityModal(clientId, index);
}

function deleteActivity(clientId, index) {
    if (confirm('Are you sure you want to delete this activity?')) {
        const client = clients.find(c => c.id === clientId);
        client.activities.splice(index, 1);
        saveToLocalStorage();
        openClientDetail(clientId);
        renderTimeline();
        showNotification('Activity deleted successfully', 'success');
    }
}

// ========== Timeline View ==========
function renderTimeline() {
    const timeline = document.getElementById('timeline-view');
    const clientFilter = document.getElementById('client-filter').value;
    const typeFilter = document.getElementById('activity-type-filter').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    let allActivities = [];
    
    clients.forEach(client => {
        if (clientFilter !== 'all' && client.id.toString() !== clientFilter) return;
        
        client.activities.forEach(activity => {
            const matchesType = typeFilter === 'all' || activity.type === typeFilter;
            const matchesDateFrom = !dateFrom || activity.date >= dateFrom;
            const matchesDateTo = !dateTo || activity.date <= dateTo;
            const matchesSearch = activity.title.toLowerCase().includes(searchTerm) ||
                                (activity.notes && activity.notes.toLowerCase().includes(searchTerm)) ||
                                client.name.toLowerCase().includes(searchTerm);
            
            if (matchesType && matchesDateFrom && matchesDateTo && matchesSearch) {
                allActivities.push({
                    ...activity,
                    clientName: client.name,
                    clientId: client.id
                });
            }
        });
    });
    
    // Sort by date (newest first)
    allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    timeline.innerHTML = '';
    
    if (allActivities.length === 0) {
        timeline.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">No activities found.</p>';
        return;
    }
    
    allActivities.forEach(activity => {
        const event = document.createElement('div');
        event.className = `timeline-event ${activity.priority ? 'priority' : ''}`;
        event.innerHTML = `
            <h4>
                ${activity.title}
                <span class="event-type">${activity.type}</span>
                ${activity.priority ? '<span class="priority-badge">PRIORITY</span>' : ''}
            </h4>
            <div class="event-date">
                <i class="fas fa-calendar"></i> ${formatDate(activity.date)}
                ${activity.time ? `<span class="event-time"><i class="fas fa-clock"></i> ${formatTime(activity.time)}</span>` : ''}
            </div>
            ${activity.notes ? `<div class="event-notes">${activity.notes}</div>` : ''}
            <div class="event-client">
                <i class="fas fa-user"></i> Client: ${activity.clientName}
            </div>
        `;
        timeline.appendChild(event);
    });
}

// ========== Alerts System ==========
function renderAlerts() {
    const alertsView = document.getElementById('alerts-view');
    const alertDays = parseInt(document.getElementById('alert-days').value) || 5;
    
    alertsView.innerHTML = '';
    
    const today = new Date();
    let alertCount = 0;
    
    clients.forEach(client => {
        const daysSince = getDaysSince(client.lastContact);
        
        if (daysSince >= alertDays) {
            const alert = document.createElement('div');
            const isCritical = daysSince >= alertDays * 2;
            alert.className = `alert ${isCritical ? 'critical' : ''}`;
            alert.innerHTML = `
                <div>
                    <strong>${client.name}</strong>: No contact for <strong>${daysSince} days</strong>!
                    <br>
                    <small>Last contact: ${formatDate(client.lastContact)}</small>
                </div>
            `;
            alert.addEventListener('click', () => openClientDetail(client.id));
            alert.style.cursor = 'pointer';
            alertsView.appendChild(alert);
            alertCount++;
        }
    });
    
    if (alertCount === 0) {
        alertsView.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;"><i class="fas fa-check-circle" style="font-size: 3rem; display: block; margin-bottom: 16px; color: #34a853;"></i>All clients are up to date!</p>';
    }
}

// ========== Weekly Summaries ==========
function renderSummaries() {
    const summariesView = document.getElementById('summaries-view');
    const statsDashboard = document.getElementById('stats-dashboard');
    const period = parseInt(document.getElementById('summary-period').value) || 7;
    
    summariesView.innerHTML = '';
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);
    
    let totalActivities = 0;
    let activitiesByType = {};
    
    clients.forEach(client => {
        const recentActivities = client.activities.filter(a => 
            new Date(a.date) >= cutoffDate
        );
        
        totalActivities += recentActivities.length;
        
        if (recentActivities.length > 0 || client.status === 'Active') {
            const summary = document.createElement('div');
            summary.className = 'summary';
            
            let activityList = '';
            if (recentActivities.length === 0) {
                activityList = '<em>No activity in this period</em>';
            } else {
                activityList = recentActivities.map(a => {
                    activitiesByType[a.type] = (activitiesByType[a.type] || 0) + 1;
                    return `<div style="margin: 4px 0;">
                        <span class="event-type" style="font-size: 0.85rem;">${a.type}</span> 
                        ${a.title} - <em>${formatDate(a.date)}</em>
                    </div>`;
                }).join('');
            }
            
            summary.innerHTML = `
                <strong><i class="fas fa-building"></i> ${client.name}</strong>
                <div class="summary-content">
                    ${activityList}
                </div>
            `;
            summariesView.appendChild(summary);
        }
    });
    
    // Render statistics dashboard
    statsDashboard.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <h3>${totalActivities}</h3>
            <p><i class="fas fa-chart-line"></i> Total Activities</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
            <h3>${clients.length}</h3>
            <p><i class="fas fa-users"></i> Total Clients</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
            <h3>${clients.filter(c => c.status === 'Active').length}</h3>
            <p><i class="fas fa-check-circle"></i> Active Clients</p>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
            <h3>${Object.keys(activitiesByType).length}</h3>
            <p><i class="fas fa-tasks"></i> Activity Types</p>
        </div>
    `;
}

// ========== Export Functionality ==========
function exportData() {
    const dataStr = JSON.stringify(clients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-timeline-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully', 'success');
}

function generateReport() {
    const period = parseInt(document.getElementById('summary-period').value) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);
    
    let report = `CLIENT COMMUNICATION TIMELINE REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Period: Last ${period} days\n`;
    report += `${'='.repeat(60)}\n\n`;
    
    clients.forEach(client => {
        const recentActivities = client.activities.filter(a => 
            new Date(a.date) >= cutoffDate
        );
        
        report += `CLIENT: ${client.name}\n`;
        report += `Status: ${client.status}\n`;
        report += `Last Contact: ${formatDate(client.lastContact)}\n`;
        report += `Activities (${recentActivities.length}):\n`;
        
        if (recentActivities.length === 0) {
            report += `  - No activities in this period\n`;
        } else {
            recentActivities.forEach(a => {
                report += `  - [${a.type}] ${a.title} (${formatDate(a.date)})\n`;
                if (a.notes) {
                    report += `    Notes: ${a.notes}\n`;
                }
            });
        }
        report += `\n`;
    });
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('Report generated successfully', 'success');
}

// ========== Filter Updates ==========
function updateClientFilter() {
    const clientFilter = document.getElementById('client-filter');
    const currentValue = clientFilter.value;
    
    clientFilter.innerHTML = '<option value="all">All Clients</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;
        clientFilter.appendChild(option);
    });
    
    clientFilter.value = currentValue;
}

// ========== Event Listeners ==========
function initEventListeners() {
    // Add Client Button
    document.getElementById('add-client-btn').addEventListener('click', () => openClientModal());
    
    // Export Data Button
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    
    // Search Input
    document.getElementById('search-input').addEventListener('input', () => {
        renderClients();
        renderTimeline();
    });
    
    // Client Filters
    document.getElementById('status-filter').addEventListener('change', renderClients);
    document.getElementById('sort-clients').addEventListener('change', renderClients);
    
    // Timeline Filters
    document.getElementById('client-filter').addEventListener('change', renderTimeline);
    document.getElementById('activity-type-filter').addEventListener('change', renderTimeline);
    document.getElementById('date-from').addEventListener('change', renderTimeline);
    document.getElementById('date-to').addEventListener('change', renderTimeline);
    
    // Alert Settings
    document.getElementById('alert-days').addEventListener('change', renderAlerts);
    document.getElementById('refresh-alerts').addEventListener('click', renderAlerts);
    
    // Summary Controls
    document.getElementById('summary-period').addEventListener('change', renderSummaries);
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // Client Modal
    document.getElementById('client-form').addEventListener('submit', saveClient);
    document.querySelectorAll('#client-modal .close, #client-modal .cancel-btn').forEach(el => {
        el.addEventListener('click', closeClientModal);
    });
    
    // Activity Modal
    document.getElementById('activity-form').addEventListener('submit', saveActivity);
    document.querySelectorAll('#activity-modal .close, #activity-modal .cancel-btn').forEach(el => {
        el.addEventListener('click', closeActivityModal);
    });
    
    // Client Detail Modal
    document.querySelectorAll('#client-detail-modal .close').forEach(el => {
        el.addEventListener('click', closeClientDetailModal);
    });
    document.getElementById('edit-client-btn').addEventListener('click', () => {
        closeClientDetailModal();
        openClientModal(currentClientId);
    });
    document.getElementById('delete-client-btn').addEventListener('click', () => {
        deleteClient(currentClientId);
    });
    document.getElementById('add-activity-btn').addEventListener('click', () => {
        openActivityModal(currentClientId);
    });
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// ========== Initialization ==========
function init() {
    loadFromLocalStorage();
    initNavigation();
    initEventListeners();
    updateClientFilter();
    renderClients();
    renderTimeline();
    renderAlerts();
    renderSummaries();
    
    console.log('Client Communication Timeline Hub initialized successfully');
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
