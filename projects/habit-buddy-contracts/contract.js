// Contract creation logic
const contractForm = document.getElementById('contractForm');
const contractList = document.getElementById('contractList');

contractForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const goal = contractForm.goal.value;
    const buddy = contractForm.buddy.value;
    const duration = contractForm.duration.value;
    const contract = { goal, buddy, duration, start: new Date().toISOString(), streak: 0 };
    let contracts = JSON.parse(localStorage.getItem('habitBuddyContracts') || '[]');
    contracts.push(contract);
    localStorage.setItem('habitBuddyContracts', JSON.stringify(contracts));
    showContracts(contracts);
    contractForm.reset();
});

function showContracts(contracts) {
    if (contracts.length === 0) {
        contractList.innerHTML = '<p>No contracts yet.</p>';
        return;
    }
    contractList.innerHTML = '<ul>' + contracts.map(c => `<li>${c.goal} with ${c.buddy} for ${c.duration} days (Streak: ${c.streak})</li>`).join('') + '</ul>';
}

window.onload = function() {
    const contracts = JSON.parse(localStorage.getItem('habitBuddyContracts') || '[]');
    showContracts(contracts);
};