// Profile page logic
const form = document.getElementById('profileForm');
const profileData = document.getElementById('profileData');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    const teachSkills = form.teachSkills.value;
    const learnSkills = form.learnSkills.value;
    const profile = {
        name,
        email,
        teachSkills,
        learnSkills
    };
    localStorage.setItem('skillSwapProfile', JSON.stringify(profile));
    showProfile(profile);
});

function showProfile(profile) {
    profileData.innerHTML = `
        <h3>Profile Saved</h3>
        <p><strong>Name:</strong> ${profile.name}</p>
        <p><strong>Email:</strong> ${profile.email}</p>
        <p><strong>Skills to Teach:</strong> ${profile.teachSkills}</p>
        <p><strong>Skills to Learn:</strong> ${profile.learnSkills}</p>
    `;
}

window.onload = function() {
    const saved = localStorage.getItem('skillSwapProfile');
    if (saved) {
        showProfile(JSON.parse(saved));
    }
};