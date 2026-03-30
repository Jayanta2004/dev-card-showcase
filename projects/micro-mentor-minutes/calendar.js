// Calendar sync logic
const calendarList = document.getElementById('calendarList');
const exportBtn = document.getElementById('exportBtn');

function showCalendar() {
    const bookings = JSON.parse(localStorage.getItem('microMentorBookings') || '[]');
    if (bookings.length === 0) {
        calendarList.innerHTML = '<p>No booked slots.</p>';
        return;
    }
    calendarList.innerHTML = '<ul>' + bookings.map(b => `<li>${b.topic} with ${b.mentor} on ${b.date} at ${b.time}</li>`).join('') + '</ul>';
}

exportBtn.onclick = function() {
    const bookings = JSON.parse(localStorage.getItem('microMentorBookings') || '[]');
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
    bookings.forEach(b => {
        ics += 'BEGIN:VEVENT\n';
        ics += `SUMMARY:${b.topic} with ${b.mentor}\n`;
        ics += `DTSTART:${b.date.replace(/-/g,'')}T${b.time.replace(':','')}00\n`;
        ics += `DTEND:${b.date.replace(/-/g,'')}T${b.time.replace(':','')}15\n`;
        ics += 'END:VEVENT\n';
    });
    ics += 'END:VCALENDAR';
    const blob = new Blob([ics.replace(/\n/g,'\r\n')], {type: 'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'micro-mentor-calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
};

window.onload = showCalendar;