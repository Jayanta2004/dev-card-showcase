// Local Volunteer Matchmaker
// Author: Ayaanshaikh12243
// Features: Add opportunities, match by skills/interests, manage matches, modals, localStorage, modern UI

// --- GLOBALS ---
let opportunities = JSON.parse(localStorage.getItem('volOpportunities') || 'null') || [
    { title: 'Park Cleanup', org: 'Green City', skills: ['Cleaning', 'Teamwork'], interests: ['Environment'], location: 'Central Park', description: 'Help clean up the park and make the city greener.' },
    { title: 'Food Bank Helper', org: 'Helping Hands', skills: ['Organization', 'Lifting'], interests: ['Hunger'], location: 'Community Center', description: 'Sort and distribute food to those in need.' },
    { title: 'Tech Tutor', org: 'Digital Bridge', skills: ['Teaching', 'Computers'], interests: ['Education'], location: 'Library', description: 'Teach basic computer skills to seniors.' },
    { title: 'Art Workshop Assistant', org: 'Art4All', skills: ['Art', 'Patience'], interests: ['Arts'], location: 'Art Studio', description: 'Assist in children’s art workshops.' }
];
let matches = JSON.parse(localStorage.getItem('volMatches') || '[]');
let userProfile = JSON.parse(localStorage.getItem('volUserProfile') || 'null') || { name: 'You', skills: ['Teamwork', 'Art'], interests: ['Arts', 'Environment'] };

// --- DOM ELEMENTS ---
const addOpportunityBtn = document.getElementById('addOpportunityBtn');
const findMatchBtn = document.getElementById('findMatchBtn');
const myMatchesBtn = document.getElementById('myMatchesBtn');
const aboutBtn = document.getElementById('aboutBtn');
const opportunityListSection = document.getElementById('opportunityListSection');
const matchSection = document.getElementById('matchSection');
const myMatchesSection = document.getElementById('myMatchesSection');
const aboutSection = document.getElementById('aboutSection');
const opportunityList = document.getElementById('opportunityList');
const matchList = document.getElementById('matchList');
const myMatchesList = document.getElementById('myMatchesList');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addOpportunityBtn.onclick = () => showAddOpportunityModal();
findMatchBtn.onclick = () => showSection('match');
myMatchesBtn.onclick = () => showSection('myMatches');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    opportunityListSection.classList.add('hidden');
    matchSection.classList.add('hidden');
    myMatchesSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'opportunities') opportunityListSection.classList.remove('hidden');
    if (section === 'match') matchSection.classList.remove('hidden');
    if (section === 'myMatches') myMatchesSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
    if (section === 'match') renderMatchList();
}

// --- OPPORTUNITY LIST ---
function renderOpportunityList() {
    opportunityList.innerHTML = '';
    opportunities.forEach((opp, idx) => {
        const card = document.createElement('div');
        card.className = 'opportunity-card';
        card.innerHTML = `
            <span class="opportunity-title">${opp.title}</span>
            <span class="opportunity-meta">Org: ${opp.org}</span>
            <span class="opportunity-meta">Skills: ${opp.skills.join(', ')}</span>
            <span class="opportunity-meta">Interests: ${opp.interests.join(', ')}</span>
            <span class="opportunity-meta">Location: ${opp.location}</span>
            <span class="opportunity-meta">${opp.description}</span>
            <div class="opportunity-actions">
                <button class="opportunity-btn" onclick="showOpportunityDetails(${idx})">Details</button>
                <button class="opportunity-btn" onclick="editOpportunity(${idx})">Edit</button>
                <button class="opportunity-btn" onclick="deleteOpportunity(${idx})">Delete</button>
            </div>
        `;
        opportunityList.appendChild(card);
    });
}
window.showOpportunityDetails = function(idx) {
    const opp = opportunities[idx];
    modalBody.innerHTML = `
        <h2>${opp.title}</h2>
        <p><b>Organization:</b> ${opp.org}</p>
        <p><b>Skills:</b> ${opp.skills.join(', ')}</p>
        <p><b>Interests:</b> ${opp.interests.join(', ')}</p>
        <p><b>Location:</b> ${opp.location}</p>
        <p>${opp.description}</p>
    `;
    showModal();
};
window.editOpportunity = function(idx) {
    showAddOpportunityModal(opportunities[idx], idx);
};
window.deleteOpportunity = function(idx) {
    if (confirm('Delete this opportunity?')) {
        opportunities.splice(idx, 1);
        localStorage.setItem('volOpportunities', JSON.stringify(opportunities));
        renderOpportunityList();
    }
};

// --- ADD/EDIT OPPORTUNITY MODAL ---
function showAddOpportunityModal(opp = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${opp ? 'Edit' : 'Add'} Opportunity</h2>
        <input id="oppTitle" placeholder="Title" value="${opp ? opp.title : ''}" style="width:100%;margin-bottom:8px;">
        <input id="oppOrg" placeholder="Organization" value="${opp ? opp.org : ''}" style="width:100%;margin-bottom:8px;">
        <input id="oppSkills" placeholder="Skills (comma separated)" value="${opp ? opp.skills.join(', ') : ''}" style="width:100%;margin-bottom:8px;">
        <input id="oppInterests" placeholder="Interests (comma separated)" value="${opp ? opp.interests.join(', ') : ''}" style="width:100%;margin-bottom:8px;">
        <input id="oppLocation" placeholder="Location" value="${opp ? opp.location : ''}" style="width:100%;margin-bottom:8px;">
        <textarea id="oppDescription" placeholder="Description" style="width:100%;margin-bottom:8px;">${opp ? opp.description : ''}</textarea>
        <button onclick="submitOpportunity(${idx !== null ? idx : ''})">${opp ? 'Save' : 'Add'} Opportunity</button>
    `;
    showModal();
}
window.submitOpportunity = function(idx) {
    const title = document.getElementById('oppTitle').value.trim();
    const org = document.getElementById('oppOrg').value.trim();
    const skills = document.getElementById('oppSkills').value.split(',').map(s => s.trim()).filter(Boolean);
    const interests = document.getElementById('oppInterests').value.split(',').map(s => s.trim()).filter(Boolean);
    const location = document.getElementById('oppLocation').value.trim();
    const description = document.getElementById('oppDescription').value.trim();
    if (!title || !org || !skills.length || !interests.length || !location) {
        alert('Please fill all required fields.');
        return;
    }
    const opp = { title, org, skills, interests, location, description };
    if (idx !== undefined && idx !== null && opportunities[idx]) {
        opportunities[idx] = opp;
    } else {
        opportunities.push(opp);
    }
    localStorage.setItem('volOpportunities', JSON.stringify(opportunities));
    renderOpportunityList();
    hideModal();
};

// --- MATCHING ---
function renderMatchList() {
    matchList.innerHTML = '';
    const matchesFound = opportunities.filter(opp =>
        opp.skills.some(s => userProfile.skills.includes(s)) ||
        opp.interests.some(i => userProfile.interests.includes(i))
    );
    if (matchesFound.length === 0) {
        matchList.innerHTML = '<p>No matches found. Try updating your profile skills or interests.</p>';
        return;
    }
    matchesFound.forEach((opp, idx) => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <span class="match-title">${opp.title}</span>
            <span class="match-meta">Org: ${opp.org}</span>
            <span class="match-meta">Skills: ${opp.skills.join(', ')}</span>
            <span class="match-meta">Interests: ${opp.interests.join(', ')}</span>
            <span class="match-meta">Location: ${opp.location}</span>
            <span class="match-meta">${opp.description}</span>
            <div class="match-actions">
                <button class="match-btn" onclick="addToMyMatches(${idx})">Add to My Matches</button>
            </div>
        `;
        matchList.appendChild(card);
    });
}
window.addToMyMatches = function(idx) {
    const opp = opportunities[idx];
    if (!matches.some(m => m.title === opp.title && m.org === opp.org)) {
        matches.push(opp);
        localStorage.setItem('volMatches', JSON.stringify(matches));
        renderMyMatches();
        alert('Added to your matches!');
    }
};

// --- MY MATCHES ---
function renderMyMatches() {
    myMatchesList.innerHTML = '';
    matches.forEach((opp, idx) => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.innerHTML = `
            <span class="match-title">${opp.title}</span>
            <span class="match-meta">Org: ${opp.org}</span>
            <span class="match-meta">Skills: ${opp.skills.join(', ')}</span>
            <span class="match-meta">Interests: ${opp.interests.join(', ')}</span>
            <span class="match-meta">Location: ${opp.location}</span>
            <span class="match-meta">${opp.description}</span>
            <div class="match-actions">
                <button class="match-btn" onclick="removeFromMyMatches(${idx})">Remove</button>
            </div>
        `;
        myMatchesList.appendChild(card);
    });
}
window.removeFromMyMatches = function(idx) {
    matches.splice(idx, 1);
    localStorage.setItem('volMatches', JSON.stringify(matches));
    renderMyMatches();
};

// --- MODAL LOGIC ---
function showModal() {
    modal.classList.remove('hidden');
}
function hideModal() {
    modal.classList.add('hidden');
    modalBody.innerHTML = '';
}

// --- INIT ---
function init() {
    renderOpportunityList();
    renderMyMatches();
    showSection('opportunities');
    // Add profile button
    const profileBtn = document.createElement('button');
    profileBtn.textContent = 'Edit Profile';
    profileBtn.onclick = showEditProfileModal;
    document.querySelector('nav').appendChild(profileBtn);
}
function showEditProfileModal() {
    modalBody.innerHTML = `
        <h2>Edit Profile</h2>
        <input id="profileName" placeholder="Name" value="${userProfile.name}" style="width:100%;margin-bottom:8px;">
        <input id="profileSkills" placeholder="Skills (comma separated)" value="${userProfile.skills.join(', ')}" style="width:100%;margin-bottom:8px;">
        <input id="profileInterests" placeholder="Interests (comma separated)" value="${userProfile.interests.join(', ')}" style="width:100%;margin-bottom:8px;">
        <button onclick="submitProfile()">Save Profile</button>
    `;
    showModal();
}
window.submitProfile = function() {
    userProfile.name = document.getElementById('profileName').value.trim() || 'You';
    userProfile.skills = document.getElementById('profileSkills').value.split(',').map(s => s.trim()).filter(Boolean);
    userProfile.interests = document.getElementById('profileInterests').value.split(',').map(s => s.trim()).filter(Boolean);
    localStorage.setItem('volUserProfile', JSON.stringify(userProfile));
    hideModal();
};
init();

// --- EXTENSIONS: More Features ---
// 1. Opportunity application status
// 2. Export/import matches
// 3. Messaging with organizations
// 4. Accessibility improvements
// 5. Animations and UI transitions
// 6. Data validation and error handling
// 7. Statistics dashboard
// ... (This file can be extended further as needed)
