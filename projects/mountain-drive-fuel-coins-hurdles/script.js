const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

let gravity = 0.6;
let cameraX = 0;
let distance = 0;
let score = 0;
let fuel = 100;
let running = true;

let car = {
    x: 200,
    y: 300,
    width: 120,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    wheelRadius: 22,
    wheelRotation: 0,
    angle: 0
};

let coins = [];
let hurdles = [];
let fuels = [];

function terrain(x) {
    return canvas.height - 250 + Math.sin(x * 0.004) * 150;
}

function getSlopeAngle(x) {
    let dx = 1;
    let y1 = terrain(x - dx);
    let y2 = terrain(x + dx);
    return Math.atan2(y2 - y1, 2 * dx);
}

/* SPAWN OBJECTS */
for (let i = 600; i < 8000; i += 700) {
    coins.push({ x: i, baseY: terrain(i) - 80, collected: false, anim: 0 });
}

for (let i = 1200; i < 8000; i += 1800) {
    hurdles.push({ x: i, y: terrain(i) - 30, width: 40, height: 30 });
}

for (let i = 1500; i < 8000; i += 2500) {
    fuels.push({ x: i, y: terrain(i) - 100, collected: false });
}

function update() {

    // ACCELERATE
    if (keys["ArrowRight"] && fuel > 0) {
        car.velocityX += 0.25;
        fuel -= 0.05;
    }

    // BRAKE / REVERSE
    if (keys["ArrowLeft"]) {
        car.velocityX -= 0.35;
    }

    // SPEED LIMIT
    if (car.velocityX > 6) car.velocityX = 6;
    if (car.velocityX < -4) car.velocityX = -4;

    // JUMP
    if (keys[" "] && car.velocityY === 0) {
        car.velocityY = -13;
    }

    car.velocityY += gravity;

    car.x += car.velocityX;
    car.y += car.velocityY;

    let ground = terrain(car.x);

    if (car.y + car.height > ground) {
        car.y = ground - car.height;
        car.velocityY = 0;
        car.angle = getSlopeAngle(car.x);
    }

    car.velocityX *= 0.99;
    car.wheelRotation += car.velocityX * 0.05;

    cameraX = car.x - canvas.width / 3;
    distance = Math.floor(car.x / 10);

    // COIN COLLECTION
    coins.forEach(coin => {
        if (!coin.collected &&
            Math.abs(car.x - coin.x) < 60 &&
            Math.abs(car.y - coin.baseY) < 60) {
            coin.collected = true;
            score += 10;
        }
    });

    // FUEL PICKUP
    fuels.forEach(f => {
        if (!f.collected &&
            Math.abs(car.x - f.x) < 60 &&
            Math.abs(car.y - f.y) < 60) {
            f.collected = true;
            fuel += 30;
            if (fuel > 100) fuel = 100;
        }
    });

    // HURDLE COLLISION
    hurdles.forEach(h => {
        if (
            Math.abs(car.x - h.x) < 50 &&
            car.y + car.height > h.y
        ) {
            running = false;
        }
    });

    if (fuel <= 0) running = false;
}

function drawSky() {
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#3f51b5");
    gradient.addColorStop(1, "#ff9800");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawTerrain() {
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        ctx.lineTo(x, terrain(x + cameraX));
    }

    ctx.lineTo(canvas.width, canvas.height);
    ctx.fillStyle = "#2e7d32";
    ctx.fill();
}

function drawCoins() {
    coins.forEach(coin => {
        if (!coin.collected) {
            coin.anim += 0.1;
            let floatY = coin.baseY + Math.sin(coin.anim) * 10;

            ctx.beginPath();
            ctx.arc(coin.x - cameraX, floatY, 15, 0, Math.PI * 2);
            ctx.fillStyle = "gold";
            ctx.fill();
        }
    });
}

function drawFuels() {
    fuels.forEach(f => {
        if (!f.collected) {
            ctx.fillStyle = "red";
            ctx.fillRect(f.x - cameraX - 15, f.y, 30, 40);

            ctx.fillStyle = "white";
            ctx.fillRect(f.x - cameraX - 10, f.y + 10, 20, 20);
        }
    });
}

function drawHurdles() {
    hurdles.forEach(h => {
        ctx.fillStyle = "#6d4c41";
        ctx.fillRect(h.x - cameraX, h.y, h.width, h.height);
    });
}

function drawCar() {
    ctx.save();
    ctx.translate(car.x - cameraX, car.y);
    ctx.rotate(car.angle);

    ctx.fillStyle = "#1976d2";
    ctx.fillRect(-car.width/2, -car.height/2, car.width, car.height);

    ctx.fillStyle = "#42a5f5";
    ctx.fillRect(-35, -55, 70, 30);

    drawWheel(-45, 25);
    drawWheel(45, 25);

    ctx.restore();
}

function drawWheel(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(car.wheelRotation);

    ctx.beginPath();
    ctx.arc(0, 0, car.wheelRadius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.restore();
}

function drawHUD() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Distance: " + distance + " m", 20, 40);
    ctx.fillText("Score: " + score, 20, 70);

    // Fuel bar
    ctx.fillStyle = "white";
    ctx.fillText("Fuel", 20, 100);

    ctx.fillStyle = "red";
    ctx.fillRect(20, 110, 200, 15);

    ctx.fillStyle = "lime";
    ctx.fillRect(20, 110, fuel * 2, 15);
}

function drawGameOver() {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER", canvas.width/2 - 180, canvas.height/2);

    ctx.font = "25px Arial";
    ctx.fillText("Refresh to Restart", canvas.width/2 - 120, canvas.height/2 + 40);
}

function loop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSky();

    if (running) update();

    drawTerrain();
    drawCoins();
    drawFuels();
    drawHurdles();
    drawCar();
    drawHUD();

    if (!running) {
        drawGameOver();
        return;
    }

    requestAnimationFrame(loop);
}

loop();