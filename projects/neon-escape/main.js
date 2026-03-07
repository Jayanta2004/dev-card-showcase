const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================= SAFE ROUNDED RECT ================= */

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/* ================= GAME VARIABLES ================= */

let lanes = [-1, 0, 1];
let currentLane = 1;
let roadWidth = canvas.width * 0.5;

let baseSpeed = 6;
let speed = baseSpeed;
let maxSpeed = 20;

let score = 0;
let multiplier = 1;

let nitro = 100;
let maxNitro = 100;

let gameOver = false;
let showRestart = false;

let dashOffset = 0;

let player = {
    width: 90,
    height: 160,
    y: canvas.height - 200,
    lanePosition: canvas.width / 2
};

let coins = [];
let obstacles = [];
let particles = [];

/* ================= SPAWN ================= */

function spawnCoin() {
    coins.push({
        lane: Math.floor(Math.random() * 3),
        y: -100,
        size: 30,
        rotation: 0
    });
}

function spawnObstacle() {
    obstacles.push({
        lane: Math.floor(Math.random() * 3),
        y: -150,
        width: 80,
        height: 120
    });
}

setInterval(spawnCoin, 1200);
setInterval(spawnObstacle, 1600);

/* ================= ROAD ================= */

function drawRoad() {

    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#050505");
    gradient.addColorStop(1, "#222");

    ctx.fillStyle = gradient;
    ctx.fillRect(canvas.width/2 - roadWidth/2, 0, roadWidth, canvas.height);

    let glow = 15 + Math.sin(Date.now() * 0.005) * 5;

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 5;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = glow;
    ctx.strokeRect(canvas.width/2 - roadWidth/2, 0, roadWidth, canvas.height);
    ctx.shadowBlur = 0;

    ctx.setLineDash([40, 30]);
    ctx.lineDashOffset = -dashOffset;
    ctx.strokeStyle = "white";

    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();

    ctx.setLineDash([]);
    dashOffset += speed;
}

/* ================= SPEED LINES ================= */

function drawSpeedLines() {
    if (speed < baseSpeed + 2) return;

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;

    for (let i = 0; i < 15; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + speed * 3);
        ctx.stroke();
    }
}

/* ================= PLAYER ================= */

function drawCar() {

    let laneX = canvas.width/2 + lanes[currentLane] * (roadWidth/6);
    player.lanePosition += (laneX - player.lanePosition) * 0.15;

    let lean = (laneX - player.lanePosition) * 0.002;

    ctx.save();
    ctx.translate(player.lanePosition, player.y);
    ctx.rotate(lean);

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 70, 35, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nitro flame
    if (speed > baseSpeed + 3) {
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.moveTo(-8, 80);
        ctx.lineTo(0, 110 + Math.random()*10);
        ctx.lineTo(8, 80);
        ctx.fill();
    }

    // Body
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#ff0033";
    drawRoundedRect(-40, -80, 80, 150, 20);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Windshield
    ctx.fillStyle = "#66ccff";
    drawRoundedRect(-25, -55, 50, 35, 12);
    ctx.fill();

    // Wheels
    ctx.fillStyle = "black";
    ctx.fillRect(-50, -50, 15, 40);
    ctx.fillRect(35, -50, 15, 40);
    ctx.fillRect(-50, 5, 15, 40);
    ctx.fillRect(35, 5, 15, 40);

    ctx.restore();
}

/* ================= COINS ================= */

function updateCoins() {
    coins.forEach((coin, i) => {
        coin.y += speed;
        coin.rotation += 0.1;

        let x = canvas.width/2 + lanes[coin.lane] * (roadWidth/6);

        ctx.save();
        ctx.translate(x, coin.y);
        ctx.rotate(coin.rotation);
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(0, 0, coin.size/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (
            coin.y > player.y - 60 &&
            coin.y < player.y + 60 &&
            Math.abs(x - player.lanePosition) < 40
        ) {
            score += 10 * multiplier;
            multiplier += 0.1;
            coins.splice(i, 1);
        }

        if (coin.y > canvas.height) coins.splice(i, 1);
    });
}

/* ================= OBSTACLES ================= */

function updateObstacles() {
    obstacles.forEach((obs, i) => {

        obs.y += speed;

        let x = canvas.width/2 + lanes[obs.lane] * (roadWidth/6);

        ctx.shadowColor = "red";
        ctx.shadowBlur = 15;
        ctx.fillStyle = "#555";
        drawRoundedRect(x - obs.width/2, obs.y, obs.width, obs.height, 15);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "red";
        ctx.fillRect(x - obs.width/2, obs.y, obs.width, 15);

        if (
            obs.y + obs.height > player.y - 60 &&
            obs.y < player.y + 60 &&
            Math.abs(x - player.lanePosition) < 60
        ) {
            triggerCrash();
        }

        if (obs.y > canvas.height) obstacles.splice(i, 1);
    });
}

/* ================= CRASH ================= */

function triggerCrash() {
    if (gameOver) return;
    gameOver = true;
    showRestart = true;
}

/* ================= UI ================= */

function drawUI() {

    ctx.fillStyle = "#00ffff";
    ctx.font = "22px Arial";
    ctx.fillText("Score: " + Math.floor(score), 20, 40);
    ctx.fillText("Multiplier: x" + multiplier.toFixed(1), 20, 70);

    ctx.fillStyle = "#222";
    ctx.fillRect(20, 90, 200, 20);

    ctx.fillStyle = "#00ffcc";
    ctx.fillRect(20, 90, (nitro / maxNitro) * 200, 20);

    ctx.strokeStyle = "#00ffff";
    ctx.strokeRect(20, 90, 200, 20);
}

/* ================= RESTART ================= */

canvas.addEventListener("click", () => {
    if (showRestart) {
        score = 0;
        multiplier = 1;
        nitro = maxNitro;
        speed = baseSpeed;
        coins = [];
        obstacles = [];
        gameOver = false;
        showRestart = false;
    }
});

/* ================= GAME LOOP ================= */

function update() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {

        score += speed * 0.05;

        if (nitro < maxNitro) nitro += 0.3;

        speed = Math.min(maxSpeed, speed + 0.001);

        if (speed > baseSpeed + 3) {
            canvas.style.transform = "scale(1.02)";
        } else {
            canvas.style.transform = "scale(1)";
        }

        drawRoad();
        drawSpeedLines();
        updateCoins();
        updateObstacles();
        drawCar();
        drawUI();

    } else {

        ctx.fillStyle = "red";
        ctx.font = "60px Arial";
        ctx.fillText("GAME OVER", canvas.width/2 - 180, canvas.height/2);

        ctx.font = "25px Arial";
        ctx.fillText("Click to Restart", canvas.width/2 - 100, canvas.height/2 + 40);
    }

    requestAnimationFrame(update);
}

/* ================= CONTROLS ================= */

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && currentLane > 0) currentLane--;
    if (e.key === "ArrowRight" && currentLane < 2) currentLane++;

    if (e.key === " " && nitro > 0) {
        speed += 4;
        nitro -= 15;
    }
});

update();