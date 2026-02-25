// Virtual Skill Exchange Marketplace
// Data storage
let offers = JSON.parse(localStorage.getItem('vsx_offers') || '[]');
let requests = JSON.parse(localStorage.getItem('vsx_requests') || '[]');
let exchanges = JSON.parse(localStorage.getItem('vsx_exchanges') || '[]');

// Tab navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(tc => tc.style.display = 'none');
        document.getElementById(btn.dataset.tab).style.display = 'block';
    });
});
tabBtns[0].classList.add('active');

// Offer form
const offerForm = document.getElementById('offer-form');
const offerSkill = document.getElementById('offer-skill');
const offerName = document.getElementById('offer-name');
const offerContact = document.getElementById('offer-contact');
const offerList = document.getElementById('offer-list');

function renderOffers() {
    offerList.innerHTML = '';
    offers.forEach((o, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${o.skill}</strong> by ${o.name} <br>Contact: <a href="mailto:${o.contact}">${o.contact}</a>`;
        offerList.appendChild(li);
    });
}
offerForm.addEventListener('submit', e => {
    e.preventDefault();
    offers.push({ skill: offerSkill.value, name: offerName.value, contact: offerContact.value });
    localStorage.setItem('vsx_offers', JSON.stringify(offers));
    offerSkill.value = offerName.value = offerContact.value = '';
    renderOffers();
});
renderOffers();

// Request form
const requestForm = document.getElementById('request-form');
const requestSkill = document.getElementById('request-skill');
const requestName = document.getElementById('request-name');
const requestContact = document.getElementById('request-contact');
const requestList = document.getElementById('request-list');

function renderRequests() {
    requestList.innerHTML = '';
    requests.forEach((r, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${r.skill}</strong> requested by ${r.name} <br>Contact: <a href="mailto:${r.contact}">${r.contact}</a>`;
        requestList.appendChild(li);
    });
}
requestForm.addEventListener('submit', e => {
    e.preventDefault();
    requests.push({ skill: requestSkill.value, name: requestName.value, contact: requestContact.value });
    localStorage.setItem('vsx_requests', JSON.stringify(requests));
    requestSkill.value = requestName.value = requestContact.value = '';
    renderRequests();
});
renderRequests();

// Exchange form
const exchangeForm = document.getElementById('exchange-form');
const exchangeOffer = document.getElementById('exchange-offer');
const exchangeRequest = document.getElementById('exchange-request');
const exchangeUsers = document.getElementById('exchange-users');
const exchangeList = document.getElementById('exchange-list');

function renderExchanges() {
    exchangeList.innerHTML = '';
    exchanges.forEach((ex, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${ex.offer}</strong> ↔ <strong>${ex.request}</strong><br>Users: ${ex.users}`;
        exchangeList.appendChild(li);
    });
}
exchangeForm.addEventListener('submit', e => {
    e.preventDefault();
    exchanges.push({ offer: exchangeOffer.value, request: exchangeRequest.value, users: exchangeUsers.value });
    localStorage.setItem('vsx_exchanges', JSON.stringify(exchanges));
    exchangeOffer.value = exchangeRequest.value = exchangeUsers.value = '';
    renderExchanges();
    renderNetwork();
});
renderExchanges();

// Learning Network Visualization
const networkGraph = document.getElementById('network-graph');
function renderNetwork() {
    networkGraph.innerHTML = '';
    // Build nodes and edges from exchanges
    let nodes = {};
    let edges = [];
    exchanges.forEach(ex => {
        const userArr = ex.users.split(',').map(u => u.trim());
        userArr.forEach(u => nodes[u] = true);
        if (userArr.length === 2) {
            edges.push({ from: userArr[0], to: userArr[1], offer: ex.offer, request: ex.request });
        }
    });
    // Draw nodes
    const nodeKeys = Object.keys(nodes);
    const nodePos = {};
    const w = networkGraph.offsetWidth;
    const h = networkGraph.offsetHeight;
    const radius = Math.min(w, h) / 2 - 40;
    nodeKeys.forEach((n, i) => {
        const angle = (2 * Math.PI * i) / nodeKeys.length;
        nodePos[n] = {
            x: w / 2 + radius * Math.cos(angle),
            y: h / 2 + radius * Math.sin(angle)
        };
        const nodeDiv = document.createElement('div');
        nodeDiv.style.position = 'absolute';
        nodeDiv.style.left = (nodePos[n].x - 30) + 'px';
        nodeDiv.style.top = (nodePos[n].y - 15) + 'px';
        nodeDiv.style.width = '60px';
        nodeDiv.style.height = '30px';
        nodeDiv.style.background = '#ffe082';
        nodeDiv.style.borderRadius = '16px';
        nodeDiv.style.textAlign = 'center';
        nodeDiv.style.lineHeight = '30px';
        nodeDiv.style.fontWeight = 'bold';
        nodeDiv.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
        nodeDiv.textContent = n;
        networkGraph.appendChild(nodeDiv);
    });
    // Draw edges
    edges.forEach(edge => {
        const from = nodePos[edge.from];
        const to = nodePos[edge.to];
        if (from && to) {
            const line = document.createElement('canvas');
            line.width = w;
            line.height = h;
            line.style.position = 'absolute';
            line.style.left = '0';
            line.style.top = '0';
            const ctx = line.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.strokeStyle = '#ffb300';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Label
            ctx.font = '12px Arial';
            ctx.fillStyle = '#333';
            ctx.fillText(`${edge.offer} ↔ ${edge.request}`, (from.x + to.x) / 2, (from.y + to.y) / 2);
            networkGraph.appendChild(line);
        }
    });
}
renderNetwork();