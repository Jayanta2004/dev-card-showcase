const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const generateBtn = document.getElementById("generate");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 100;

let animationId;
let mode = "abstract";
let particles = [];

generateBtn.addEventListener("click", () => {
    const prompt = document.getElementById("prompt").value.toLowerCase();
    detectMode(prompt);
    initScene();
});

function detectMode(prompt) {
    if (prompt.includes("galaxy") || prompt.includes("space")) {
        mode = "galaxy";
    } else if (prompt.includes("fire") || prompt.includes("flame")) {
        mode = "fire";
    } else if (prompt.includes("ocean") || prompt.includes("water")) {
        mode = "ocean";
    } else {
        mode = "abstract";
    }
}

function initScene() {
    cancelAnimationFrame(animationId);
    particles = [];

    if (mode === "galaxy") createStars();
    if (mode === "fire") createFire();
    if (mode === "ocean") createWaves();

    animate();
}

/* =========================
   Galaxy Mode
========================= */

function createStars() {
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

function drawGalaxy() {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";

    particles.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.y += star.speed;

        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

/* =========================
   Fire Mode
========================= */

function createFire() {
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height,
            size: Math.random() * 5 + 2,
            speedY: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 2
        });
    }
}

function drawFire() {
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, ${Math.random() * 150}, 0, 0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < canvas.height / 2) {
            p.y = canvas.height;
            p.x = canvas.width / 2;
        }
    });
}

/* =========================
   Ocean Mode
========================= */

let waveOffset = 0;

function createWaves() {
    waveOffset = 0;
}

function drawOcean() {
    ctx.fillStyle = "#001f3f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#00bfff";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < canvas.width; x++) {
        let y = canvas.height / 2 +
            Math.sin((x + waveOffset) * 0.02) * 40;
        ctx.lineTo(x, y);
    }

    ctx.stroke();
    waveOffset += 3;
}

/* =========================
   Abstract Mode
========================= */

function drawAbstract() {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.beginPath();
        ctx.arc(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 50,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

/* =========================
   Animation Loop
========================= */

function animate() {
    if (mode === "galaxy") drawGalaxy();
    else if (mode === "fire") drawFire();
    else if (mode === "ocean") drawOcean();
    else drawAbstract();

    animationId = requestAnimationFrame(animate);
}

/* Start default */
initScene();
