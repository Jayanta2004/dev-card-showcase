// Moderation Component
class Moderation {
    constructor(container) {
        this.container = container;
        this.reports = [];
        this.init();
    }

    init() {
        this.render();
        this.loadReports();
    }

    render() {
        this.container.innerHTML = `
            <div class="moderation-header">Moderation Tools</div>
            <button id="report-message-btn">Report Message</button>
            <div id="reports-list"></div>
        `;
        this.reportBtn = document.getElementById('report-message-btn');
        this.reportsList = document.getElementById('reports-list');
        this.reportBtn.addEventListener('click', () => {
            this.reportMessage();
        });
    }

    loadReports() {
        const stored = localStorage.getItem('moderation-reports');
        if (stored) {
            this.reports = JSON.parse(stored);
        } else {
            // Sample reports for demo
            this.reports = [
                { timestamp: new Date(Date.now()-7200000).toISOString(), status: 'Pending', reason: 'Inappropriate language' },
                { timestamp: new Date(Date.now()-3600000).toISOString(), status: 'Resolved', reason: 'Spam' }
            ];
        }
        this.renderReports();
    }

    saveReports() {
        localStorage.setItem('moderation-reports', JSON.stringify(this.reports));
    }

    reportMessage() {
        const report = {
            timestamp: new Date().toISOString(),
            status: 'Pending',
        };
        this.reports.push(report);
        this.saveReports();
        this.renderReports();
        alert('Message reported. Moderators will review it soon.');
    }

    renderReports() {
        this.reportsList.innerHTML = '';
        this.reports.forEach((r, idx) => {
            const div = document.createElement('div');
            div.className = 'report-item card';
            div.innerHTML = `<strong>Report #${idx + 1}</strong> - <span style="color:${r.status==='Resolved'?'#5bc0be':'#7e57c2'}">${r.status}</span> <br>Reason: ${r.reason} <br>(${new Date(r.timestamp).toLocaleString()})`;
            if (r.status === 'Pending') {
                const resolveBtn = document.createElement('button');
                resolveBtn.textContent = 'Resolve';
                resolveBtn.style.marginLeft = '8px';
                resolveBtn.addEventListener('click', () => {
                    this.reports[idx].status = 'Resolved';
                    this.saveReports();
                    this.renderReports();
                });
                div.appendChild(resolveBtn);
            }
            this.reportsList.appendChild(div);
        });
    }
}

export default Moderation;
