// Proof check-in logic
const checkinForm = document.getElementById('checkinForm');
const checkinList = document.getElementById('checkinList');

checkinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const goal = checkinForm.goal.value;
    const proof = checkinForm.proof.value;
    const photoInput = checkinForm.photo;
    let photoUrl = '';
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            photoUrl = evt.target.result;
            saveCheckin(goal, proof, photoUrl);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveCheckin(goal, proof, photoUrl);
    }
    checkinForm.reset();
});

function saveCheckin(goal, proof, photoUrl) {
    const checkin = { goal, proof, photoUrl, date: new Date().toISOString() };
    let checkins = JSON.parse(localStorage.getItem('habitBuddyCheckins') || '[]');
    checkins.push(checkin);
    localStorage.setItem('habitBuddyCheckins', JSON.stringify(checkins));
    updateStreak(goal);
    showCheckins(checkins);
}

function updateStreak(goal) {
    let contracts = JSON.parse(localStorage.getItem('habitBuddyContracts') || '[]');
    contracts.forEach(c => {
        if (c.goal === goal) c.streak++;
    });
    localStorage.setItem('habitBuddyContracts', JSON.stringify(contracts));
}

function showCheckins(checkins) {
    if (checkins.length === 0) {
        checkinList.innerHTML = '<p>No check-ins yet.</p>';
        return;
    }
    checkinList.innerHTML = '<ul>' + checkins.map(c => `<li>${c.goal}: ${c.proof} ${c.photoUrl ? '<img src="'+c.photoUrl+'" width="100">' : ''} (${new Date(c.date).toLocaleDateString()})</li>`).join('') + '</ul>';
}

window.onload = function() {
    const checkins = JSON.parse(localStorage.getItem('habitBuddyCheckins') || '[]');
    showCheckins(checkins);
};