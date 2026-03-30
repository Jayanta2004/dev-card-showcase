// Weekly pattern insights
const insights = document.getElementById('insights');

function showInsights() {
    let moods = JSON.parse(localStorage.getItem('moodLog') || '[]');
    if (moods.length === 0) {
        insights.innerHTML = '<p>No mood data yet.</p>';
        return;
    }
    let week = moods.filter(m => {
        let d = new Date(m.date);
        let now = new Date();
        return (now - d) < 7*24*60*60*1000;
    });
    let moodCounts = {};
    week.forEach(m => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });
    let triggers = week.map(m => m.trigger).filter(t => t);
    insights.innerHTML = `<h3>This Week's Patterns</h3>
        <ul>
            <li>Most common mood: ${Object.keys(moodCounts).length ? Object.entries(moodCounts).sort((a,b)=>b[1]-a[1])[0][0] : 'None'}</li>
            <li>Triggers: ${triggers.join(', ') || 'None'}</li>
        </ul>`;
}

window.onload = showInsights;