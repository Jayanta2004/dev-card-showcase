// Reward milestones logic
const milestones = document.getElementById('milestones');

function showMilestones() {
    let contracts = JSON.parse(localStorage.getItem('habitBuddyContracts') || '[]');
    if (contracts.length === 0) {
        milestones.innerHTML = '<p>No contracts yet.</p>';
        return;
    }
    milestones.innerHTML = '<ul>' + contracts.map(c => {
        let reward = '';
        if (c.streak >= c.duration) reward = '🏆 Completed!';
        else if (c.streak >= Math.floor(c.duration/2)) reward = '🎉 Halfway!';
        else reward = 'Keep going!';
        return `<li>${c.goal} with ${c.buddy}: ${reward} (Streak: ${c.streak}/${c.duration} days)</li>`;
    }).join('') + '</ul>';
}

window.onload = showMilestones;