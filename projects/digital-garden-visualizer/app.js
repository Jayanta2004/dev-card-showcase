// Digital Garden Visualizer - Drag & Drop Layout, Growth Simulation
const canvas = document.getElementById('garden-canvas');
const ctx = canvas.getContext('2d');
let plants = [];
let draggingPlant = null;
let offsetX = 0, offsetY = 0;
const plantTypes = {
    flower: { icon: '🌸', color: '#ffb6b9', growth: 1 },
    tree:   { icon: '🌳', color: '#81c784', growth: 1 },
    cactus: { icon: '🌵', color: '#ffd600', growth: 1 },
    herb:   { icon: '🌿', color: '#90caf9', growth: 1 }
};
//
function drawGarden() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    plants.forEach(plant => {
        ctx.save();
        ctx.font = `${32 + plant.growth * 18}px Segoe UI Emoji`;
        ctx.globalAlpha = 0.9;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plantTypes[plant.type].icon, plant.x, plant.y);
        ctx.restore();
    });
}

document.getElementById('plant-palette').addEventListener('dragstart', e => {
    if (e.target.classList.contains('plant-icon')) {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    }
});

canvas.addEventListener('dragover', e => {
    e.preventDefault();
});

canvas.addEventListener('drop', e => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    plants.push({ type, x, y, growth: 1 });
    drawGarden();
});

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    for (let i = plants.length - 1; i >= 0; i--) {
        const plant = plants[i];
        ctx.font = `${32 + plant.growth * 18}px Segoe UI Emoji`;
        const size = 32 + plant.growth * 18;
        if (Math.abs(x - plant.x) < size/2 && Math.abs(y - plant.y) < size/2) {
            draggingPlant = plant;
            offsetX = x - plant.x;
            offsetY = y - plant.y;
            break;
        }
    }
});

canvas.addEventListener('mousemove', e => {
    if (draggingPlant) {
        const rect = canvas.getBoundingClientRect();
        draggingPlant.x = e.clientX - rect.left - offsetX;
        draggingPlant.y = e.clientY - rect.top - offsetY;
        drawGarden();
    }
});

canvas.addEventListener('mouseup', () => {
    draggingPlant = null;
});

// Growth simulation
function growPlants() {
    plants.forEach(plant => {
        if (plant.growth < 3) plant.growth += 0.2;
    });
    drawGarden();
}

document.getElementById('grow-btn').onclick = function() {
    let steps = 10, count = 0;
    function animate() {
        growPlants();
        count++;
        if (count < steps) setTimeout(animate, 120);
    }
    animate();
};

document.getElementById('reset-growth-btn').onclick = function() {
    plants.forEach(plant => plant.growth = 1);
    drawGarden();
};

document.getElementById('new-garden-btn').onclick = function() {
    plants = [];
    drawGarden();
};

document.getElementById('save-garden-btn').onclick = function() {
    const data = JSON.stringify(plants);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'my-garden.json';
    link.click();
};

document.getElementById('load-garden-btn').onclick = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                plants = JSON.parse(evt.target.result);
                drawGarden();
            } catch {
                alert('Invalid garden file.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

drawGarden();
