// Initialize map
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let selectedLatLng = null;

map.on('click', function(e) {
    selectedLatLng = e.latlng;
    document.getElementById('location').value = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
});

function addSoundMarker(sound) {
    const marker = L.marker(sound.latlng).addTo(map);
    marker.bindPopup(`<b>${sound.location}</b><br><audio controls src="${sound.audioUrl}"></audio>`);
}

function renderSoundList() {
    const sounds = JSON.parse(localStorage.getItem('sounds') || '[]');
    const list = document.getElementById('sounds');
    list.innerHTML = '';
    sounds.forEach((sound, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><b>${sound.location}</b></span> <audio controls src="${sound.audioUrl}"></audio>`;
        list.appendChild(li);
        addSoundMarker(sound);
    });
}

function clearMapMarkers() {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
}

document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const fileInput = document.getElementById('audio-file');
    const locationInput = document.getElementById('location');
    if (!fileInput.files[0] || !locationInput.value) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        let latlng = selectedLatLng;
        if (!latlng) {
            // Try to parse from input
            const parts = locationInput.value.split(',');
            if (parts.length === 2) {
                latlng = { lat: parseFloat(parts[0]), lng: parseFloat(parts[1]) };
            } else {
                alert('Please select a location on the map or enter valid coordinates.');
                return;
            }
        }
        const sound = {
            location: locationInput.value,
            latlng: latlng,
            audioUrl: event.target.result
        };
        let sounds = JSON.parse(localStorage.getItem('sounds') || '[]');
        sounds.push(sound);
        localStorage.setItem('sounds', JSON.stringify(sounds));
        clearMapMarkers();
        renderSoundList();
        fileInput.value = '';
        locationInput.value = '';
        selectedLatLng = null;
    };
    reader.readAsDataURL(fileInput.files[0]);
});

window.onload = function() {
    renderSoundList();
};
