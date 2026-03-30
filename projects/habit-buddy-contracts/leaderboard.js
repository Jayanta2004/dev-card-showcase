// Streak leaderboard logic
const leaderboard = document.getElementById('leaderboard');

function showLeaderboard() {
    let contracts = JSON.parse(localStorage.getItem('habitBuddyContracts') || '[]');
    if (contracts.length === 0) {
        leaderboard.innerHTML = '<p>No contracts yet.</p>';
        return;
    }
    contracts.sort((a, b) => b.streak - a.streak);
    leaderboard.innerHTML = '<table><tr><th>Goal</th><th>Buddy</th><th>Streak</th></tr>' +
        contracts.map(c => `<tr><td>${c.goal}</td><td>${c.buddy}</td><td>${c.streak}</td></tr>`).join('') + '</table>';
}

window.onload = showLeaderboard;