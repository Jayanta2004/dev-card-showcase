// Sample geotagged requests
const sampleRequests = [
    {
        id: 1,
        lat: 28.6139,
        lng: 77.2090,
        title: 'Urgent: Medicine Delivery',
        description: 'Elderly resident needs medicine delivered.',
        urgency: 'High',
        claimed: false,
        badge: 'Trusted Volunteer',
    },
    {
        id: 2,
        lat: 28.6145,
        lng: 77.2085,
        title: 'Groceries Needed',
        description: 'Family needs groceries for the week.',
        urgency: 'Medium',
        claimed: false,
        badge: 'New Member',
    },
    {
        id: 3,
        lat: 28.6150,
        lng: 77.2100,
        title: 'Pet Care Help',
        description: 'Help needed to walk a dog.',
        urgency: 'Low',
        claimed: false,
        badge: 'Trusted Volunteer',
    }
];

let requests = JSON.parse(localStorage.getItem('neighborhoodRequests') || 'null') || sampleRequests;

function saveRequests() {
    localStorage.setItem('neighborhoodRequests', JSON.stringify(requests));
}

function renderMap() {
    const map = L.map('map').setView([28.614, 77.209], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    requests.forEach(req => {
        const marker = L.marker([req.lat, req.lng]).addTo(map);
        marker.bindPopup(`<b>${req.title}</b><br>${req.description}<br>Urgency: <span style='color:${req.urgency === 'High' ? 'red' : req.urgency === 'Medium' ? 'orange' : 'green'}'>${req.urgency}</span><br>Badge: ${req.badge}<br><button onclick='claimRequest(${req.id})'>${req.claimed ? 'Complete' : 'Claim'}</button>`);
    });
}

function renderList() {
    const list = document.getElementById('requestList');
    list.innerHTML = '<h3>Requests</h3>' + requests.map(req => `
        <div style='border:1px solid #ccc; margin:1em 0; padding:1em;'>
            <b>${req.title}</b> (${req.urgency})<br>
            ${req.description}<br>
            Badge: ${req.badge}<br>
            Status: ${req.claimed ? 'Claimed' : 'Open'}<br>
            <button onclick='claimRequest(${req.id})'>${req.claimed ? 'Complete' : 'Claim'}</button>
        </div>
    `).join('');
}

window.claimRequest = function(id) {
    const req = requests.find(r => r.id === id);
    if (!req) return;
    if (!req.claimed) {
        req.claimed = true;
    } else {
        requests = requests.filter(r => r.id !== id);
    }
    saveRequests();
    renderList();
    document.getElementById('map').innerHTML = '';
    renderMap();
};

window.onload = function() {
    renderMap();
    renderList();
};