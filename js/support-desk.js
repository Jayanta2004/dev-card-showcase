// Customer Support Desk Lite - JavaScript

class SupportDesk {
    constructor() {
        this.tickets = this.loadTickets();
        this.agentStatus = localStorage.getItem('agentStatus') || 'online';
        this.currentTicketId = null;
        this.slaIntervals = {};

        this.initializeEventListeners();
        this.renderTickets();
        this.updateStats();
        this.startSLATimers();
    }

    initializeEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Status buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setAgentStatus(e.target.closest('.status-btn').dataset.status));
        });

        // Ticket intake form
        document.getElementById('intakeForm').addEventListener('submit', (e) => this.createTicket(e));

        // Search and filter
        document.getElementById('searchTickets').addEventListener('input', (e) => this.filterTickets());
        document.getElementById('filterStatus').addEventListener('change', () => this.filterTickets());
        document.getElementById('filterPriority').addEventListener('change', () => this.filterTickets());

        // Canned responses
        document.querySelectorAll('.canned-response-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.insertCannedResponse(e.target.dataset.response));
        });

        // Modal
        document.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('sendResponseBtn').addEventListener('click', () => this.sendResponse());
        document.getElementById('closeTicketBtn').addEventListener('click', () => this.closeTicket());

        // Reports
        document.getElementById('exportReportBtn').addEventListener('click', () => this.exportReport());
        document.getElementById('refreshReportBtn').addEventListener('click', () => this.refreshReports());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Ticket Management
    createTicket(e) {
        e.preventDefault();

        const form = e.target;
        let isValid = true;

        // Validate form
        const customerName = document.getElementById('customerName').value.trim();
        const customerEmail = document.getElementById('customerEmail').value.trim();
        const ticketSubject = document.getElementById('ticketSubject').value.trim();
        const ticketDescription = document.getElementById('ticketDescription').value.trim();
        const ticketPriority = document.getElementById('ticketPriority').value;
        const ticketCategory = document.getElementById('ticketCategory').value;

        if (!customerName) {
            this.showError('errorCustomerName', 'Customer name is required');
            isValid = false;
        } else {
            this.clearError('errorCustomerName');
        }

        if (!customerEmail || !this.validateEmail(customerEmail)) {
            this.showError('errorCustomerEmail', 'Valid email is required');
            isValid = false;
        } else {
            this.clearError('errorCustomerEmail');
        }

        if (!ticketSubject) {
            this.showError('errorTicketSubject', 'Subject is required');
            isValid = false;
        } else {
            this.clearError('errorTicketSubject');
        }

        if (!ticketDescription) {
            this.showError('errorTicketDescription', 'Description is required');
            isValid = false;
        } else {
            this.clearError('errorTicketDescription');
        }

        if (!ticketPriority) {
            this.showError('errorTicketPriority', 'Priority is required');
            isValid = false;
        } else {
            this.clearError('errorTicketPriority');
        }

        if (!ticketCategory) {
            this.showError('errorTicketCategory', 'Category is required');
            isValid = false;
        } else {
            this.clearError('errorTicketCategory');
        }

        if (!isValid) return;

        const ticket = {
            id: 'TKT-' + Date.now(),
            customer: customerName,
            email: customerEmail,
            subject: ticketSubject,
            description: ticketDescription,
            priority: ticketPriority,
            category: ticketCategory,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
            responses: [],
            slaTime: this.calculateSLATime(ticketPriority)
        };

        this.tickets.unshift(ticket);
        this.saveTickets();
        this.renderTickets();
        this.updateStats();
        this.startSLATimer(ticket.id);

        // Reset form
        form.reset();
        this.switchTab('board');

        // Show success message
        document.getElementById('globalAlert').textContent = 'Ticket created successfully: ' + ticket.id;
    }

    calculateSLATime(priority) {
        const now = new Date();
        let hours = 4; // Default

        if (priority === 'high') hours = 2;
        else if (priority === 'medium') hours = 4;
        else if (priority === 'low') hours = 8;

        return new Date(now.getTime() + hours * 60 * 60 * 1000);
    }

    renderTickets() {
        const board = document.getElementById('ticketBoard');
        
        if (this.tickets.length === 0) {
            board.innerHTML = '<p class="empty-state">No tickets yet. Create a new one to get started.</p>';
            return;
        }

        board.innerHTML = this.tickets.map(ticket => `
            <div class="ticket-card ${ticket.priority}" data-ticket-id="${ticket.id}" role="button" tabindex="0" 
                 aria-label="Ticket ${ticket.id}: ${ticket.subject}">
                <div class="ticket-info">
                    <div class="ticket-header">
                        <span class="ticket-id">${ticket.id}</span>
                        <span class="ticket-status-badge ${ticket.status}">${ticket.status}</span>
                    </div>
                    <div class="ticket-subject">${this.escapeHtml(ticket.subject)}</div>
                    <div class="ticket-meta">
                        <span class="ticket-customer">👤 ${this.escapeHtml(ticket.customer)}</span>
                        <span class="ticket-time">⏰ ${this.formatTime(new Date(ticket.createdAt))}</span>
                        <span class="ticket-category">📂 ${ticket.category}</span>
                    </div>
                </div>
                <div class="ticket-sla">
                    <span class="sla-timer ${this.isSLACritical(ticket) ? 'critical' : ''}">
                        ⏱️ ${this.formatSLATime(ticket.slaTime)}
                    </span>
                </div>
            </div>
        `).join('');

        // Attach click listeners
        document.querySelectorAll('.ticket-card').forEach(card => {
            card.addEventListener('click', () => this.openTicketModal(card.dataset.ticketId));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openTicketModal(card.dataset.ticketId);
                }
            });
        });
    }

    filterTickets() {
        const searchTerm = document.getElementById('searchTickets').value.toLowerCase();
        const statusFilter = document.getElementById('filterStatus').value;
        const priorityFilter = document.getElementById('filterPriority').value;

        const filtered = this.tickets.filter(ticket => {
            const matchesSearch = ticket.id.toLowerCase().includes(searchTerm) ||
                                 ticket.customer.toLowerCase().includes(searchTerm) ||
                                 ticket.subject.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || ticket.status === statusFilter;
            const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });

        const board = document.getElementById('ticketBoard');
        if (filtered.length === 0) {
            board.innerHTML = '<p class="empty-state">No tickets match your filters.</p>';
            return;
        }

        board.innerHTML = filtered.map(ticket => `
            <div class="ticket-card ${ticket.priority}" data-ticket-id="${ticket.id}" role="button" tabindex="0">
                <div class="ticket-info">
                    <div class="ticket-header">
                        <span class="ticket-id">${ticket.id}</span>
                        <span class="ticket-status-badge ${ticket.status}">${ticket.status}</span>
                    </div>
                    <div class="ticket-subject">${this.escapeHtml(ticket.subject)}</div>
                    <div class="ticket-meta">
                        <span class="ticket-customer">👤 ${this.escapeHtml(ticket.customer)}</span>
                        <span class="ticket-time">⏰ ${this.formatTime(new Date(ticket.createdAt))}</span>
                        <span class="ticket-category">📂 ${ticket.category}</span>
                    </div>
                </div>
                <div class="ticket-sla">
                    <span class="sla-timer ${this.isSLACritical(ticket) ? 'critical' : ''}">
                        ⏱️ ${this.formatSLATime(ticket.slaTime)}
                    </span>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.ticket-card').forEach(card => {
            card.addEventListener('click', () => this.openTicketModal(card.dataset.ticketId));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openTicketModal(card.dataset.ticketId);
                }
            });
        });
    }

    openTicketModal(ticketId) {
        const ticket = this.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        this.currentTicketId = ticketId;
        const modal = document.getElementById('ticketModal');
        const details = document.getElementById('ticketDetails');

        details.innerHTML = `
            <div class="detail-row">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${ticket.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${this.escapeHtml(ticket.customer)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${this.escapeHtml(ticket.email)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Subject:</span>
                <span class="detail-value">${this.escapeHtml(ticket.subject)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">${this.escapeHtml(ticket.description)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Priority:</span>
                <span class="detail-value"><span class="ticket-status-badge ${ticket.priority}">${ticket.priority}</span></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value"><span class="ticket-status-badge ${ticket.status}">${ticket.status}</span></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">SLA Time Remaining:</span>
                <span class="detail-value">${this.formatSLATime(ticket.slaTime)}</span>
            </div>
        `;

        // Render response history
        const history = document.getElementById('responseHistory');
        history.innerHTML = '<h3>Response History</h3>' + (ticket.responses.length > 0 ?
            ticket.responses.map(response => `
                <div class="response-item">
                    <div class="response-meta">👤 ${this.escapeHtml(response.agent)} • ${this.formatTime(new Date(response.timestamp))}</div>
                    <div class="response-text">${this.escapeHtml(response.text)}</div>
                </div>
            `).join('')
            : '<p>No responses yet.</p>'
        );

        modal.classList.remove('hidden');
        document.getElementById('responseText').focus();
    }

    sendResponse() {
        const responseText = document.getElementById('responseText').value.trim();
        if (!responseText) return;

        const ticket = this.tickets.find(t => t.id === this.currentTicketId);
        if (!ticket) return;

        ticket.responses.push({
            agent: 'You',
            text: responseText,
            timestamp: new Date()
        });

        if (ticket.status !== 'in-progress') {
            ticket.status = 'in-progress';
        }

        ticket.updatedAt = new Date();
        this.saveTickets();
        this.renderTickets();
        this.updateStats();

        document.getElementById('responseText').value = '';
        this.openTicketModal(this.currentTicketId);
        document.getElementById('globalStatus').textContent = 'Response sent successfully';
    }

    closeTicket() {
        const ticket = this.tickets.find(t => t.id === this.currentTicketId);
        if (!ticket) return;

        ticket.status = 'closed';
        ticket.updatedAt = new Date();
        this.saveTickets();
        this.renderTickets();
        this.updateStats();
        this.closeModal();
        document.getElementById('globalAlert').textContent = `Ticket ${ticket.id} has been closed`;
    }

    compareStatus() {
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-status="${this.agentStatus}"]`).classList.add('active');
    }

    setAgentStatus(status) {
        this.agentStatus = status;
        localStorage.setItem('agentStatus', status);
        this.compareStatus();
        document.getElementById('globalStatus').textContent = `Your status is now ${status}`;
    }

    insertCannedResponse(response) {
        const textArea = document.getElementById('responseText');
        textArea.value += (textArea.value ? '\n' : '') + response;
        textArea.focus();
    }

    // SLA Management
    startSLATimers() {
        this.tickets.forEach(ticket => {
            if (ticket.status !== 'closed') {
                this.startSLATimer(ticket.id);
            }
        });
    }

    startSLATimer(ticketId) {
        if (this.slaIntervals[ticketId]) clearInterval(this.slaIntervals[ticketId]);

        this.slaIntervals[ticketId] = setInterval(() => {
            this.renderTickets();
        }, 60000); // Update every minute
    }

    isSLACritical(ticket) {
        const now = new Date();
        const timeLeft = new Date(ticket.slaTime) - now;
        return timeLeft < 30 * 60 * 1000; // Less than 30 minutes
    }

    formatSLATime(slaTime) {
        const now = new Date();
        const timeLeft = new Date(slaTime) - now;

        if (timeLeft < 0) return 'SLA Exceeded';

        const minutes = Math.floor(timeLeft / 60000);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) return `${hours}h ${remainingMinutes}m`;
        return `${minutes}m`;
    }

    // Reports
    generateReports() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTickets = this.tickets.filter(t => {
            const ticketDate = new Date(t.createdAt);
            ticketDate.setHours(0, 0, 0, 0);
            return ticketDate.getTime() === today.getTime();
        });

        const closedToday = todayTickets.filter(t => t.status === 'closed');
        const openTickets = this.tickets.filter(t => t.status === 'open');
        const inProgressTickets = this.tickets.filter(t => t.status === 'in-progress');

        const avgResolutionTime = closedToday.length > 0
            ? closedToday.reduce((sum, t) => {
                const created = new Date(t.createdAt);
                const updated = new Date(t.updatedAt);
                return sum + (updated - created);
            }, 0) / closedToday.length / 60000
            : 0;

        return {
            todayCreated: todayTickets.length,
            todayResolved: closedToday.length,
            avgResolutionTime: Math.round(avgResolutionTime),
            openCount: openTickets.length,
            inProgressCount: inProgressTickets.length,
            closedCount: this.tickets.filter(t => t.status === 'closed').length,
            totalCount: this.tickets.length
        };
    }

    updateReports() {
        const reports = this.generateReports();

        document.getElementById('todayCreated').textContent = reports.todayCreated;
        document.getElementById('todayResolved').textContent = reports.todayResolved;
        document.getElementById('avgTime').textContent = reports.avgResolutionTime + 'm';

        document.getElementById('reportOpen').textContent = reports.openCount;
        document.getElementById('reportInProgress').textContent = reports.inProgressCount;
        document.getElementById('reportClosed').textContent = reports.closedCount;

        const total = reports.totalCount || 1;
        document.getElementById('reportOpenPct').textContent = Math.round((reports.openCount / total) * 100) + '%';
        document.getElementById('reportInProgressPct').textContent = Math.round((reports.inProgressCount / total) * 100) + '%';
        document.getElementById('reportClosedPct').textContent = Math.round((reports.closedCount / total) * 100) + '%';
    }

    refreshReports() {
        this.updateReports();
        document.getElementById('globalStatus').textContent = 'Reports refreshed';
    }

    exportReport() {
        const reports = this.generateReports();
        let csv = 'Support Desk Report\n';
        csv += 'Generated: ' + new Date().toLocaleString() + '\n\n';
        csv += 'Today\'s Statistics\n';
        csv += 'Tickets Created,' + reports.todayCreated + '\n';
        csv += 'Tickets Resolved,' + reports.todayResolved + '\n';
        csv += 'Avg Resolution Time,' + reports.avgResolutionTime + ' minutes\n\n';
        csv += 'Queue Status\n';
        csv += 'Open,' + reports.openCount + '\n';
        csv += 'In Progress,' + reports.inProgressCount + '\n';
        csv += 'Closed,' + reports.closedCount + '\n';

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
        element.setAttribute('download', 'support-desk-report.csv');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        document.getElementById('globalAlert').textContent = 'Report exported successfully';
    }

    // UI Updates
    updateStats() {
        const open = this.tickets.filter(t => t.status === 'open').length;
        const inProgress = this.tickets.filter(t => t.status === 'in-progress').length;
        const closed = this.tickets.filter(t => t.status === 'closed').length;

        document.getElementById('totalTickets').textContent = this.tickets.length;
        document.getElementById('openCount').textContent = open;
        document.getElementById('inProgressCount').textContent = inProgress;
        document.getElementById('closedCount').textContent = closed;

        this.updateReports();
    }

    switchTab(tabName) {
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${tabName}-panel`).classList.add('active');

        if (tabName === 'reports') {
            this.updateReports();
        }
    }

    closeModal() {
        document.getElementById('ticketModal').classList.add('hidden');
    }

    // Utilities
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    formatTime(date) {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.parentElement.classList.add('error');
    }

    clearError(elementId) {
        const element = document.getElementById(elementId);
        element.textContent = '';
        element.parentElement.classList.remove('error');
    }

    // Storage
    saveTickets() {
        localStorage.setItem('supportDeskTickets', JSON.stringify(this.tickets));
    }

    loadTickets() {
        const saved = localStorage.getItem('supportDeskTickets');
        return saved ? JSON.parse(saved) : [];
    }

    // Keyboard shortcuts
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') {
                e.preventDefault();
                this.switchTab('board');
            } else if (e.key === 'n') {
                e.preventDefault();
                this.switchTab('intake');
            } else if (e.key === 'r') {
                e.preventDefault();
                this.switchTab('reports');
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const desk = new SupportDesk();
    console.log('Customer Support Desk Lite loaded!');

    // Set initial status
    desk.compareStatus();
});
