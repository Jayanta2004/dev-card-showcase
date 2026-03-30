// What helped me journal
const journalForm = document.getElementById('journalForm');
const journalList = document.getElementById('journalList');

journalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const helped = journalForm.helped.value;
    const entry = { helped, date: new Date().toISOString() };
    let journal = JSON.parse(localStorage.getItem('helpedJournal') || '[]');
    journal.push(entry);
    localStorage.setItem('helpedJournal', JSON.stringify(journal));
    showJournal(journal);
    journalForm.reset();
});

function showJournal(journal) {
    if (journal.length === 0) {
        journalList.innerHTML = '<p>No entries yet.</p>';
        return;
    }
    journalList.innerHTML = '<ul>' + journal.map(j => `<li>${j.helped} (${new Date(j.date).toLocaleDateString()})</li>`).join('') + '</ul>';
}

window.onload = function() {
    const journal = JSON.parse(localStorage.getItem('helpedJournal') || '[]');
    showJournal(journal);
};