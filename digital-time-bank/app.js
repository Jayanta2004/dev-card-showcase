// Digital Time Bank
// Author: EWOC Contributors
// Description: Users exchange time-based services (e.g., 1 hour of tutoring for 1 hour of gardening help).

const serviceForm = document.getElementById('serviceForm');
const requestForm = document.getElementById('requestForm');
const confirmation = document.getElementById('confirmation');
const offerListDiv = document.getElementById('offerList');
const requestListDiv = document.getElementById('requestList');
const balancesDiv = document.getElementById('balances');

const STORAGE_KEY = 'digitalTimeBank';

function getData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { offers: [], requests: [], balances: {} };
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderOffers() {
    const data = getData();
    if (!data.offers.length) {
        offerListDiv.innerHTML = '<em>No offers yet.</em>';
        return;
    }
    offerListDiv.innerHTML = data.offers.slice().reverse().map((o, idx) =>
        `<div class="offer-card">
            <b>${escapeHtml(o.username)}</b> offers <b>${escapeHtml(o.service)}</b> for <b>${o.hours}</b> hour(s)
            <button onclick="acceptOffer(${data.offers.length-1-idx})">Accept</button>
        </div>`
    ).join('');
}

function renderRequests() {
    const data = getData();
    if (!data.requests.length) {
        requestListDiv.innerHTML = '<em>No requests yet.</em>';
        return;
    }
    requestListDiv.innerHTML = data.requests.slice().reverse().map((r, idx) =>
        `<div class="request-card">
            <b>${escapeHtml(r.username)}</b> requests <b>${escapeHtml(r.service)}</b> for <b>${r.hours}</b> hour(s)
            <button onclick="fulfillRequest(${data.requests.length-1-idx})">Fulfill</button>
        </div>`
    ).join('');
}

function renderBalances() {
    const data = getData();
    const balances = data.balances;
    if (!Object.keys(balances).length) {
        balancesDiv.innerHTML = '<em>No exchanges yet.</em>';
        return;
    }
    balancesDiv.innerHTML = Object.entries(balances).map(([user, hours]) =>
        `<div class="balance-card">${escapeHtml(user)}: ${hours} hour(s)</div>`
    ).join('');
}

window.acceptOffer = function(idx) {
    const data = getData();
    const offer = data.offers[idx];
    const user = prompt('Enter your name (to receive the service):');
    if (!user) return;
    // Deduct hours from offerer, add to receiver
    data.balances[offer.username] = (data.balances[offer.username] || 0) - offer.hours;
    data.balances[user] = (data.balances[user] || 0) + offer.hours;
    data.offers.splice(idx, 1);
    saveData(data);
    renderOffers();
    renderBalances();
};

window.fulfillRequest = function(idx) {
    const data = getData();
    const req = data.requests[idx];
    const user = prompt('Enter your name (to provide the service):');
    if (!user) return;
    // Add hours to requester, deduct from fulfiller
    data.balances[req.username] = (data.balances[req.username] || 0) + req.hours;
    data.balances[user] = (data.balances[user] || 0) - req.hours;
    data.requests.splice(idx, 1);
    saveData(data);
    renderRequests();
    renderBalances();
};

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

serviceForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = serviceForm.username.value.trim();
    const service = serviceForm.service.value.trim();
    const hours = parseFloat(serviceForm.hours.value);
    if (!username || !service || !hours) return;
    const data = getData();
    data.offers.push({ username, service, hours });
    saveData(data);
    confirmation.textContent = 'Service offered!';
    confirmation.classList.remove('hidden');
    serviceForm.reset();
    renderOffers();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

requestForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = requestForm.reqUsername.value.trim();
    const service = requestForm.requestedService.value.trim();
    const hours = parseFloat(requestForm.reqHours.value);
    if (!username || !service || !hours) return;
    const data = getData();
    data.requests.push({ username, service, hours });
    saveData(data);
    confirmation.textContent = 'Service requested!';
    confirmation.classList.remove('hidden');
    requestForm.reset();
    renderRequests();
    setTimeout(() => confirmation.classList.add('hidden'), 2000);
});

// Initial load
renderOffers();
renderRequests();
renderBalances();
