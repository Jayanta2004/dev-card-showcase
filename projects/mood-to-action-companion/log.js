// Mood logging logic
const moodForm = document.getElementById('moodForm');
const moodList = document.getElementById('moodList');

moodForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const mood = moodForm.mood.value;
    const trigger = moodForm.trigger.value;
    const entry = { mood, trigger, date: new Date().toISOString() };
    let moods = JSON.parse(localStorage.getItem('moodLog') || '[]');
    moods.push(entry);
    localStorage.setItem('moodLog', JSON.stringify(moods));
    showMoods(moods);
    moodForm.reset();
});

function showMoods(moods) {
    if (moods.length === 0) {
        moodList.innerHTML = '<p>No moods logged yet.</p>';
        return;
    }
    moodList.innerHTML = '<ul>' + moods.map(m => `<li>${m.mood} (${m.trigger}) - ${new Date(m.date).toLocaleDateString()}</li>`).join('') + '</ul>';
}

window.onload = function() {
    const moods = JSON.parse(localStorage.getItem('moodLog') || '[]');
    showMoods(moods);
};