// Skill matching logic
const matchResults = document.getElementById('matchResults');

// Demo: Simulated user profiles
const demoProfiles = [
    {
        name: 'Alice',
        teachSkills: 'Excel, Python',
        learnSkills: 'Spoken English, Guitar'
    },
    {
        name: 'Bob',
        teachSkills: 'Spoken English, Cooking',
        learnSkills: 'Excel, Python'
    },
    {
        name: 'Charlie',
        teachSkills: 'Guitar, Painting',
        learnSkills: 'Cooking, Excel'
    }
];

function findMatches(myProfile, profiles) {
    // Match if teachSkills of others intersect with learnSkills of mine
    const myLearn = myProfile.learnSkills.toLowerCase().split(',').map(s => s.trim());
    return profiles.filter(p => {
        const theirTeach = p.teachSkills.toLowerCase().split(',').map(s => s.trim());
        return theirTeach.some(skill => myLearn.includes(skill));
    });
}

window.onload = function() {
    const saved = localStorage.getItem('skillSwapProfile');
    if (!saved) {
        matchResults.innerHTML = '<p>Please create your profile first.</p>';
        return;
    }
    const myProfile = JSON.parse(saved);
    const matches = findMatches(myProfile, demoProfiles);
    if (matches.length === 0) {
        matchResults.innerHTML = '<p>No matches found. Try updating your skills!</p>';
    } else {
        matchResults.innerHTML = '<ul>' + matches.map(p => `<li><strong>${p.name}</strong> can teach: ${p.teachSkills}</li>`).join('') + '</ul>';
    }
};