const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const enemy = document.getElementById("enemy");
const scoreDisplay = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");

let playerX = 100;
let playerY = 150;

let enemyX = 500;
let enemyY = 150;

let score = 0;
let isGameOver = false;

const speed = 4;
const enemySpeed = 2;

const keys = {};

let portalA = null;
let portalB = null;

/* ======================
   CONTROLS
====================== */
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === "e") createPortal("A");
    if (e.key === "q") createPortal("B");
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

/* ======================
   CREATE PORTALS
====================== */
function createPortal(type) {
    const portal = document.createElement("div");
    portal.style.left = playerX + "px";
    portal.style.top = playerY + "px";

    if (type === "A") {
        if (portalA) portalA.remove();
        portal.classList.add("portalA");
        portalA = portal;
    } else {
        if (portalB) portalB.remove();
        portal.classList.add("portalB");
        portalB = portal;
    }

    gameArea.appendChild(portal);
}

/* ======================
   GAME LOOP
====================== */
function update() {
    if (isGameOver) return;

    // Player Movement
    if (keys["ArrowLeft"]) playerX -= speed;
    if (keys["ArrowRight"]) playerX += speed;
    if (keys["ArrowUp"]) playerY -= speed;
    if (keys["ArrowDown"]) playerY += speed;

    // Boundaries
    playerX = Math.max(0, Math.min(660, playerX));
    playerY = Math.max(0, Math.min(360, playerY));

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    // Enemy AI (chasing)
    if (enemyX < playerX) enemyX += enemySpeed;
    if (enemyX > playerX) enemyX -= enemySpeed;
    if (enemyY < playerY) enemyY += enemySpeed;
    if (enemyY > playerY) enemyY -= enemySpeed;

    enemy.style.left = enemyX + "px";
    enemy.style.top = enemyY + "px";

    checkPortalTeleport();
    checkCollision();

    requestAnimationFrame(update);
}

/* ======================
   TELEPORT LOGIC
====================== */
function checkPortalTeleport() {
    if (portalA && portalB) {
        const playerRect = player.getBoundingClientRect();
        const aRect = portalA.getBoundingClientRect();
        const bRect = portalB.getBoundingClientRect();

        if (intersects(playerRect, aRect)) {
            playerX = parseInt(portalB.style.left);
            playerY = parseInt(portalB.style.top);
        }

        if (intersects(playerRect, bRect)) {
            playerX = parseInt(portalA.style.left);
            playerY = parseInt(portalA.style.top);
        }
    }
}

function intersects(r1, r2) {
    return !(
        r1.right < r2.left ||
        r1.left > r2.right ||
        r1.bottom < r2.top ||
        r1.top > r2.bottom
    );
}

/* ======================
   COLLISION
====================== */
function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    if (intersects(playerRect, enemyRect)) {
        isGameOver = true;
        player.style.background = "red";
        restartBtn.classList.remove("hidden");
    }
}

/* ======================
   SCORE
====================== */
setInterval(() => {
    if (!isGameOver) {
        score++;
        scoreDisplay.textContent = score;
    }
}, 100);

/* ======================
   RESTART
====================== */
restartBtn.addEventListener("click", () => {
    location.reload();
});

update();