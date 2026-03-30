// Mentor impact stats logic
const stats = document.getElementById('stats');

function calculateStats() {
    const bookings = JSON.parse(localStorage.getItem('microMentorBookings') || '[]');
    const notes = JSON.parse(localStorage.getItem('microMentorNotes') || '[]');
    const checklist = JSON.parse(localStorage.getItem('microMentorChecklist') || '[]');
    let mentorStats = {};
    bookings.forEach(b => {
        mentorStats[b.mentor] = mentorStats[b.mentor] || { sessions: 0, notes: 0, checklist: 0 };
        mentorStats[b.mentor].sessions++;
    });
    notes.forEach(n => {
        mentorStats[n.mentor] = mentorStats[n.mentor] || { sessions: 0, notes: 0, checklist: 0 };
        mentorStats[n.mentor].notes++;
    });
    checklist.forEach(c => {
        mentorStats[c.mentor] = mentorStats[c.mentor] || { sessions: 0, notes: 0, checklist: 0 };
        mentorStats[c.mentor].checklist++;
    });
    if (Object.keys(mentorStats).length === 0) {
        stats.innerHTML = '<p>No mentor stats yet.</p>';
        return;
    }
    stats.innerHTML = '<table><tr><th>Mentor</th><th>Sessions</th><th>Notes</th><th>Checklist Items</th></tr>' +
        Object.entries(mentorStats).map(([mentor, s]) => `<tr><td>${mentor}</td><td>${s.sessions}</td><td>${s.notes}</td><td>${s.checklist}</td></tr>`).join('') + '</table>';
}

window.onload = calculateStats;