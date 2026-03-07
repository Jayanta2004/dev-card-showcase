// Pickup coordination logic
const pickupList = document.getElementById('pickupList');

function showPickup() {
    let items = JSON.parse(localStorage.getItem('closetItems') || '[]');
    let pickups = items.filter(i => i.requests.length > 0);
    if (pickups.length === 0) {
        pickupList.innerHTML = '<p>No pickups scheduled yet.</p>';
        return;
    }
    pickupList.innerHTML = '<ul>' + pickups.map(i => `<li>${i.type} (${i.condition}, Size: ${i.size}) - ${i.desc} | Requests: ${i.requests.length} <button onclick='completePickup("${i.type}","${i.size}")'>Complete Pickup</button></li>`).join('') + '</ul>';
}

window.completePickup = function(type, size) {
    let items = JSON.parse(localStorage.getItem('closetItems') || '[]');
    items = items.filter(i => !(i.type === type && i.size === size));
    localStorage.setItem('closetItems', JSON.stringify(items));
    showPickup();
};

window.onload = showPickup;