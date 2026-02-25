// Volunteer Opportunity Matcher
const matcherForm = document.getElementById('matcher-form');
const userLocation = document.getElementById('user-location');
const userSkills = document.getElementById('user-skills');
const userInterests = document.getElementById('user-interests');
const opportunityResults = document.getElementById('opportunity-results');

// Example local opportunities (in real app, fetch from API)
const opportunities = [
    {
        title: "Food Bank Helper",
        location: "New York",
        skills: ["organization", "packing"],
        interests: ["hunger", "community"]
    },
    {
        title: "Park Clean-Up Volunteer",
        location: "San Francisco",
        skills: ["cleaning", "teamwork"],
        interests: ["environment", "outdoors"]
    },
    {
        title: "Senior Tech Tutor",
        location: "Chicago",
        skills: ["technology", "teaching"],
        interests: ["education", "seniors"]
    },
    {
        title: "Animal Shelter Assistant",
        location: "Houston",
        skills: ["animal care", "cleaning"],
        interests: ["animals", "rescue"]
    },
    {
        title: "Community Garden Helper",
        location: "New York",
        skills: ["gardening", "teamwork"],
        interests: ["environment", "community"]
    }
];

function matchOpportunities(location, skills, interests) {
    const skillArr = skills.split(',').map(s => s.trim().toLowerCase());
    const interestArr = interests.split(',').map(i => i.trim().toLowerCase());
    return opportunities.filter(opp => {
        const locMatch = opp.location.toLowerCase().includes(location.toLowerCase());
        const skillMatch = opp.skills.some(s => skillArr.includes(s));
        const interestMatch = opp.interests.some(i => interestArr.includes(i));
        return locMatch && (skillMatch || interestMatch);
    });
}

matcherForm.addEventListener('submit', e => {
    e.preventDefault();
    const location = userLocation.value.trim();
    const skills = userSkills.value.trim();
    const interests = userInterests.value.trim();
    const matches = matchOpportunities(location, skills, interests);
    opportunityResults.innerHTML = '';
    if (matches.length === 0) {
        opportunityResults.innerHTML = '<div>No matching opportunities found. Try different skills or interests!</div>';
    } else {
        matches.forEach(opp => {
            const div = document.createElement('div');
            div.className = 'opportunity';
            div.innerHTML = `<strong>${opp.title}</strong><br>Location: ${opp.location}<br>Skills: ${opp.skills.join(', ')}<br>Interests: ${opp.interests.join(', ')}`;
            opportunityResults.appendChild(div);
        });
    }
});
