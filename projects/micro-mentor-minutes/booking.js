// Booking logic
const bookingForm = document.getElementById('bookingForm');
const bookingList = document.getElementById('bookingList');

bookingForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const topic = bookingForm.topic.value;
    const mentor = bookingForm.mentor.value;
    const date = bookingForm.date.value;
    const time = bookingForm.time.value;
    const booking = { topic, mentor, date, time };
    let bookings = JSON.parse(localStorage.getItem('microMentorBookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('microMentorBookings', JSON.stringify(bookings));
    showBookings(bookings);
    bookingForm.reset();
});

function showBookings(bookings) {
    if (bookings.length === 0) {
        bookingList.innerHTML = '<p>No bookings yet.</p>';
        return;
    }
    bookingList.innerHTML = '<ul>' + bookings.map(b => `<li>${b.topic} with ${b.mentor} on ${b.date} at ${b.time}</li>`).join('') + '</ul>';
}

window.onload = function() {
    const bookings = JSON.parse(localStorage.getItem('microMentorBookings') || '[]');
    showBookings(bookings);
};