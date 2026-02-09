// Travel Journal & Map Tracker
let trips = JSON.parse(localStorage.getItem('trips') || '[]');

function renderTrips() {
    const tripsDiv = document.getElementById('trips');
    tripsDiv.innerHTML = '';
    trips.forEach(t => {
        const card = document.createElement('div');
        card.className = 'trip-card';
        if (t.photo) card.innerHTML += `<img src="${t.photo}" alt="Trip">`;
        card.innerHTML += `<b>${t.title}</b><br><small>${t.date}</small><br><span>${t.location}</span><br><p>${t.story}</p>`;
        tripsDiv.appendChild(card);
    });
}

document.getElementById('add-trip-btn').onclick = function() {
    const title = document.getElementById('trip-title').value.trim();
    const date = document.getElementById('trip-date').value;
    const location = document.getElementById('trip-location').value.trim();
    const story = document.getElementById('trip-story').value.trim();
    const photoInput = document.getElementById('trip-photo');
    if (!title || !date || !location || !story) {
        alert('Please fill all required fields.');
        return;
    }
    let photo = '';
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photo = e.target.result;
            addTrip({ title, date, location, story, photo });
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        addTrip({ title, date, location, story, photo: '' });
    }
};

function addTrip(trip) {
    trips.push(trip);
    localStorage.setItem('trips', JSON.stringify(trips));
    renderTrips();
    renderRoute();
    renderStats();
}

function renderRoute() {
    const canvas = document.getElementById('route-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,800,300);
    ctx.strokeStyle = '#4f8cff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    trips.forEach((t, idx) => {
        const x = 100 + idx*100;
        const y = 150 + Math.sin(idx)*60;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        ctx.arc(x, y, 16, 0, 2*Math.PI);
        ctx.fillStyle = '#f8ffae';
        ctx.fill();
        ctx.font = 'bold 14px Segoe UI';
        ctx.fillStyle = '#333';
        ctx.fillText(t.location, x, y-24);
    });
    ctx.stroke();
}

function renderStats() {
    const statsDiv = document.getElementById('trip-stats');
    statsDiv.innerHTML = `<b>Total Trips:</b> ${trips.length}<br>`;
    statsDiv.innerHTML += `<b>Unique Locations:</b> ${[...new Set(trips.map(t => t.location))].length}<br>`;
}

document.getElementById('export-csv-btn').onclick = function() {
    let csv = 'Title,Date,Location,Story\n';
    trips.forEach(t => {
        csv += `${t.title},${t.date},${t.location},"${t.story.replace(/\n/g,' ')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'travel-journal.csv';
    link.click();
};

document.getElementById('export-pdf-btn').onclick = function() {
    alert('PDF export is a placeholder. Use browser print to PDF for now.');
};

renderTrips();
renderRoute();
renderStats();