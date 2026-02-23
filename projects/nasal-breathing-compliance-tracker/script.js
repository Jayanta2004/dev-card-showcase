document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('session-form');
    const logsList = document.getElementById('session-logs');
    const totalSessionsEl = document.getElementById('total-sessions');
    const complianceRateEl = document.getElementById('compliance-rate');

    // Load existing sessions from localStorage
    let sessions = JSON.parse(localStorage.getItem('nasal-breathing-sessions')) || [];

    // Display sessions and stats
    updateDisplay();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const sessionType = document.getElementById('session-type').value;
        const date = document.getElementById('date').value;
        const duration = parseInt(document.getElementById('duration').value);
        const compliance = document.getElementById('compliance').value;

        const session = {
            id: Date.now(),
            type: sessionType,
            date: date,
            duration: duration,
            compliance: compliance === 'yes'
        };

        sessions.push(session);
        localStorage.setItem('nasal-breathing-sessions', JSON.stringify(sessions));

        updateDisplay();
        form.reset();
    });

    function updateDisplay() {
        // Update logs
        logsList.innerHTML = '';
        sessions.forEach(session => {
            const li = document.createElement('li');
            if (!session.compliance) {
                li.classList.add('no-compliance');
            }
            li.textContent = `${session.date} - ${session.type.charAt(0).toUpperCase() + session.type.slice(1)} - ${session.duration} min - Compliance: ${session.compliance ? 'Yes' : 'No'}`;
            logsList.appendChild(li);
        });

        // Update stats
        const totalSessions = sessions.length;
        const compliantSessions = sessions.filter(s => s.compliance).length;
        const complianceRate = totalSessions > 0 ? Math.round((compliantSessions / totalSessions) * 100) : 0;

        totalSessionsEl.textContent = totalSessions;
        complianceRateEl.textContent = complianceRate + '%';
    }
});