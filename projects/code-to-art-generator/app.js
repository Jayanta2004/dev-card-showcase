// Code-to-Art Generator: Basic generative art based on code input

const codeInput = document.getElementById('codeInput');
const generateBtn = document.getElementById('generateBtn');
const artCanvas = document.getElementById('artCanvas');
const ctx = artCanvas.getContext('2d');

// Set canvas size
artCanvas.width = 480;
artCanvas.height = 320;

function hashCode(str) {
    // Simple hash for string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function randomFromSeed(seed) {
    // Seeded pseudo-random generator
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function drawArtFromCode(code) {
    ctx.clearRect(0, 0, artCanvas.width, artCanvas.height);
    if (!code.trim()) return;
    const hash = hashCode(code);
    let seed = hash;
    // Draw shapes based on code structure
    for (let i = 0; i < 32; i++) {
        seed += i * 31;
        const x = randomFromSeed(seed) * artCanvas.width;
        const y = randomFromSeed(seed + 1) * artCanvas.height;
        const size = 20 + randomFromSeed(seed + 2) * 60;
        const hue = (seed % 360);
        ctx.save();
        ctx.globalAlpha = 0.5 + randomFromSeed(seed + 3) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.shadowColor = `hsl(${(hue+60)%360}, 80%, 50%)`;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
    }
    // Optionally, add lines or patterns based on code length
    for (let i = 0; i < code.length % 12; i++) {
        seed += i * 13;
        ctx.save();
        ctx.strokeStyle = `hsl(${(seed*2)%360}, 80%, 70%)`;
        ctx.globalAlpha = 0.3 + randomFromSeed(seed + 4) * 0.7;
        ctx.beginPath();
        ctx.moveTo(randomFromSeed(seed + 5) * artCanvas.width, randomFromSeed(seed + 6) * artCanvas.height);
        ctx.lineTo(randomFromSeed(seed + 7) * artCanvas.width, randomFromSeed(seed + 8) * artCanvas.height);
        ctx.lineWidth = 2 + randomFromSeed(seed + 9) * 6;
        ctx.stroke();
        ctx.restore();
    }
}

generateBtn.addEventListener('click', () => {
    drawArtFromCode(codeInput.value);
});

// Optional: live preview
codeInput.addEventListener('input', () => {
    drawArtFromCode(codeInput.value);
});

drawArtFromCode(''); // Initial blank
