// Sustainability dashboard logic
const dashboard = document.getElementById('dashboard');

function showDashboard() {
    let items = JSON.parse(localStorage.getItem('closetItems') || '[]');
    let total = items.length;
    let requested = items.filter(i => i.requests.length > 0).length;
    let completed = localStorage.getItem('closetCompleted') ? parseInt(localStorage.getItem('closetCompleted')) : 0;
    dashboard.innerHTML = `<h3>Stats</h3>
        <ul>
            <li>Total items listed: ${total}</li>
            <li>Items requested: ${requested}</li>
            <li>Pickups completed: ${completed}</li>
            <li>Waste reduced: ${completed * 2} kg (est.)</li>
        </ul>`;
}

window.onload = showDashboard;