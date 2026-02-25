// Virtual Emotion Garden Logic
// Plant and nurture digital flowers representing emotions, each with unique growth patterns

const emotionPicker = document.getElementById('emotion-picker');
const plantBtn = document.getElementById('plant-flower');
const nurtureBtn = document.getElementById('nurture-all');
const gardenSVG = document.getElementById('garden-svg');

let flowers = JSON.parse(localStorage.getItem('emotionFlowers')) || [];

const emotionPatterns = {
    joy: { color: '#ffd600', growth: 1.2, petals: 8 },
    sadness: { color: '#2196f3', growth: 0.8, petals: 6 },
    anger: { color: '#d32f2f', growth: 1.1, petals: 7 },
    love: { color: '#e91e63', growth: 1.3, petals: 10 },
    calm: { color: '#4caf50', growth: 1.0, petals: 5 },
    fear: { color: '#6d4c41', growth: 0.7, petals: 4 }
};

function renderGarden() {
    gardenSVG.innerHTML = '';
    const width = gardenSVG.width.baseVal.value;
    const height = gardenSVG.height.baseVal.value;
    flowers.forEach((flower, idx) => {
        const pattern = emotionPatterns[flower.emotion];
        const cx = 80 + (idx % 8) * 80;
        const cy = 80 + Math.floor(idx / 8) * 160;
        // Draw petals
        for (let p = 0; p < pattern.petals; p++) {
            const angle = (2 * Math.PI / pattern.petals) * p;
            const px = cx + Math.cos(angle) * (30 + flower.growth * 10);
            const py = cy + Math.sin(angle) * (30 + flower.growth * 10);
            const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            petal.setAttribute('cx', px);
            petal.setAttribute('cy', py);
            petal.setAttribute('rx', 18 * pattern.growth * flower.growth);
            petal.setAttribute('ry', 8 * pattern.growth * flower.growth);
            petal.setAttribute('fill', pattern.color);
            petal.setAttribute('opacity', 0.7);
            gardenSVG.appendChild(petal);
        }
        // Draw center
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', cx);
        center.setAttribute('cy', cy);
        center.setAttribute('r', 16 * pattern.growth * flower.growth);
        center.setAttribute('fill', '#fff');
        center.setAttribute('stroke', pattern.color);
        center.setAttribute('stroke-width', 3);
        center.classList.add('flower');
        center.onclick = () => nurtureFlower(idx);
        gardenSVG.appendChild(center);
    });
}

plantBtn.onclick = () => {
    const emotion = emotionPicker.value;
    flowers.push({ emotion, growth: 1 });
    localStorage.setItem('emotionFlowers', JSON.stringify(flowers));
    renderGarden();
};

function nurtureFlower(idx) {
    flowers[idx].growth += emotionPatterns[flowers[idx].emotion].growth * 0.2;
    localStorage.setItem('emotionFlowers', JSON.stringify(flowers));
    renderGarden();
}

nurtureBtn.onclick = () => {
    flowers.forEach((flower, idx) => nurtureFlower(idx));
};

renderGarden();
