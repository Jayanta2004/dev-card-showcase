// Skill Swap Marketplace
// Author: Ayaanshaikh12243
// Features: Offer/request skills, barter system, swap management, modals, localStorage, modern UI

// --- GLOBALS ---
let offers = JSON.parse(localStorage.getItem('offers') || '[]');
let requests = JSON.parse(localStorage.getItem('requests') || '[]');
let swaps = JSON.parse(localStorage.getItem('swaps') || '[]');
const userId = localStorage.getItem('swapUserId') || (() => { const id = 'user_' + Math.floor(Math.random() * 100000); localStorage.setItem('swapUserId', id); return id; })();

// --- DOM ELEMENTS ---
const addOfferBtn = document.getElementById('addOfferBtn');
const addRequestBtn = document.getElementById('addRequestBtn');
const mySwapsBtn = document.getElementById('mySwapsBtn');
const aboutBtn = document.getElementById('aboutBtn');
const offerListSection = document.getElementById('offerListSection');
const requestListSection = document.getElementById('requestListSection');
const mySwapsSection = document.getElementById('mySwapsSection');
const aboutSection = document.getElementById('aboutSection');
const offerList = document.getElementById('offerList');
const requestList = document.getElementById('requestList');
const mySwapsList = document.getElementById('mySwapsList');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

// --- NAVIGATION ---
addOfferBtn.onclick = () => showAddOfferModal();
addRequestBtn.onclick = () => showAddRequestModal();
mySwapsBtn.onclick = () => showSection('mySwaps');
aboutBtn.onclick = () => showSection('about');
closeModal.onclick = hideModal;
modal.onclick = (e) => { if (e.target.id === 'modal') hideModal(); };

function showSection(section) {
    offerListSection.classList.add('hidden');
    requestListSection.classList.add('hidden');
    mySwapsSection.classList.add('hidden');
    aboutSection.classList.add('hidden');
    if (section === 'offers') offerListSection.classList.remove('hidden');
    if (section === 'requests') requestListSection.classList.remove('hidden');
    if (section === 'mySwaps') mySwapsSection.classList.remove('hidden');
    if (section === 'about') aboutSection.classList.remove('hidden');
}

// --- OFFER LIST ---
function renderOfferList() {
    offerList.innerHTML = '';
    offers.forEach((offer, idx) => {
        const card = document.createElement('div');
        card.className = 'swap-card';
        card.innerHTML = `
            <span class="swap-title">${offer.title}</span>
            <span class="swap-meta">By: ${offer.user}</span>
            <span class="swap-meta">Skill: ${offer.skill}</span>
            <span class="swap-meta">Wants: ${offer.wants}</span>
            <span class="swap-meta">${offer.description}</span>
            <div class="swap-actions">
                <button class="swap-btn" onclick="proposeSwap('offer',${idx})">Propose Swap</button>
                ${offer.userId === userId ? `<button class="swap-btn" onclick="editOffer(${idx})">Edit</button><button class="swap-btn" onclick="deleteOffer(${idx})">Delete</button>` : ''}
            </div>
        `;
        offerList.appendChild(card);
    });
}
window.editOffer = function(idx) {
    showAddOfferModal(offers[idx], idx);
};
window.deleteOffer = function(idx) {
    if (confirm('Delete this offer?')) {
        offers.splice(idx, 1);
        localStorage.setItem('offers', JSON.stringify(offers));
        renderOfferList();
    }
};

// --- REQUEST LIST ---
function renderRequestList() {
    requestList.innerHTML = '';
    requests.forEach((req, idx) => {
        const card = document.createElement('div');
        card.className = 'swap-card';
        card.innerHTML = `
            <span class="swap-title">${req.title}</span>
            <span class="swap-meta">By: ${req.user}</span>
            <span class="swap-meta">Needs: ${req.skill}</span>
            <span class="swap-meta">Can Offer: ${req.canOffer}</span>
            <span class="swap-meta">${req.description}</span>
            <div class="swap-actions">
                <button class="swap-btn" onclick="proposeSwap('request',${idx})">Propose Swap</button>
                ${req.userId === userId ? `<button class="swap-btn" onclick="editRequest(${idx})">Edit</button><button class="swap-btn" onclick="deleteRequest(${idx})">Delete</button>` : ''}
            </div>
        `;
        requestList.appendChild(card);
    });
}
window.editRequest = function(idx) {
    showAddRequestModal(requests[idx], idx);
};
window.deleteRequest = function(idx) {
    if (confirm('Delete this request?')) {
        requests.splice(idx, 1);
        localStorage.setItem('requests', JSON.stringify(requests));
        renderRequestList();
    }
};

// --- ADD/EDIT OFFER MODAL ---
function showAddOfferModal(offer = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${offer ? 'Edit' : 'Offer'} Skill</h2>
        <input id="offerTitle" placeholder="Title" value="${offer ? offer.title : ''}" style="width:100%;margin-bottom:8px;">
        <input id="offerSkill" placeholder="Your Skill (e.g. Coding)" value="${offer ? offer.skill : ''}" style="width:100%;margin-bottom:8px;">
        <input id="offerWants" placeholder="Looking for (e.g. Art Lessons)" value="${offer ? offer.wants : ''}" style="width:100%;margin-bottom:8px;">
        <textarea id="offerDescription" placeholder="Description" style="width:100%;margin-bottom:8px;">${offer ? offer.description : ''}</textarea>
        <button onclick="submitOffer(${idx !== null ? idx : ''})">${offer ? 'Save' : 'Add'} Offer</button>
    `;
    showModal();
}
window.submitOffer = function(idx) {
    const title = document.getElementById('offerTitle').value.trim();
    const skill = document.getElementById('offerSkill').value.trim();
    const wants = document.getElementById('offerWants').value.trim();
    const description = document.getElementById('offerDescription').value.trim();
    if (!title || !skill || !wants) {
        alert('Please fill all required fields.');
        return;
    }
    const offer = { title, skill, wants, description, user: 'You', userId };
    if (idx !== undefined && idx !== null && offers[idx]) {
        offers[idx] = offer;
    } else {
        offers.push(offer);
    }
    localStorage.setItem('offers', JSON.stringify(offers));
    renderOfferList();
    hideModal();
};

// --- ADD/EDIT REQUEST MODAL ---
function showAddRequestModal(req = null, idx = null) {
    modalBody.innerHTML = `
        <h2>${req ? 'Edit' : 'Request'} Skill</h2>
        <input id="requestTitle" placeholder="Title" value="${req ? req.title : ''}" style="width:100%;margin-bottom:8px;">
        <input id="requestSkill" placeholder="Skill Needed (e.g. Coding)" value="${req ? req.skill : ''}" style="width:100%;margin-bottom:8px;">
        <input id="requestCanOffer" placeholder="Can Offer (e.g. Art Lessons)" value="${req ? req.canOffer : ''}" style="width:100%;margin-bottom:8px;">
        <textarea id="requestDescription" placeholder="Description" style="width:100%;margin-bottom:8px;">${req ? req.description : ''}</textarea>
        <button onclick="submitRequest(${idx !== null ? idx : ''})">${req ? 'Save' : 'Add'} Request</button>
    `;
    showModal();
}
window.submitRequest = function(idx) {
    const title = document.getElementById('requestTitle').value.trim();
    const skill = document.getElementById('requestSkill').value.trim();
    const canOffer = document.getElementById('requestCanOffer').value.trim();
    const description = document.getElementById('requestDescription').value.trim();
    if (!title || !skill || !canOffer) {
        alert('Please fill all required fields.');
        return;
    }
    const req = { title, skill, canOffer, description, user: 'You', userId };
    if (idx !== undefined && idx !== null && requests[idx]) {
        requests[idx] = req;
    } else {
        requests.push(req);
    }
    localStorage.setItem('requests', JSON.stringify(requests));
    renderRequestList();
    hideModal();
};

// --- PROPOSE SWAP ---
window.proposeSwap = function(type, idx) {
    let swap;
    if (type === 'offer') {
        const offer = offers[idx];
        swap = { type: 'offer', offer, userId, status: 'pending', date: new Date().toLocaleString() };
    } else {
        const req = requests[idx];
        swap = { type: 'request', request: req, userId, status: 'pending', date: new Date().toLocaleString() };
    }
    swaps.push(swap);
    localStorage.setItem('swaps', JSON.stringify(swaps));
    renderMySwaps();
    alert('Swap proposed!');
};

// --- MY SWAPS ---
function renderMySwaps() {
    mySwapsList.innerHTML = '';
    swaps.filter(s => s.userId === userId).forEach((swap, idx) => {
        const card = document.createElement('div');
        card.className = 'swap-card';
        card.innerHTML = `
            <span class="swap-title">${swap.type === 'offer' ? swap.offer.title : swap.request.title}</span>
            <span class="swap-meta">Type: ${swap.type}</span>
            <span class="swap-meta">Status: ${swap.status}</span>
            <span class="swap-meta">Date: ${swap.date}</span>
            <div class="swap-actions">
                <button class="swap-btn" onclick="cancelSwap(${idx})">Cancel</button>
            </div>
        `;
        mySwapsList.appendChild(card);
    });
}
window.cancelSwap = function(idx) {
    swaps.splice(idx, 1);
    localStorage.setItem('swaps', JSON.stringify(swaps));
    renderMySwaps();
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
    renderOfferList();
    renderRequestList();
    renderMySwaps();
    showSection('offers');
    // Add navigation for requests
    const reqBtn = document.createElement('button');
    reqBtn.textContent = 'Skill Requests';
    reqBtn.onclick = () => showSection('requests');
    document.querySelector('nav').appendChild(reqBtn);
}
init();

// --- EXTENSIONS: More Features ---
// 1. Messaging between users
// 2. Swap status updates (accepted, completed)
// 3. User profiles
// 4. Search/filter by skill
// 5. Export/import swaps
// 6. Accessibility improvements
// 7. Animations and UI transitions
// 8. Data validation and error handling
// 9. Statistics dashboard
// ... (This file can be extended further as needed)
