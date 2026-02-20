// Skyrail Surfer 3D Game
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lights
const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 5);
scene.add(directionalLight);

// Player
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 2, 0);
scene.add(player);

// Rails
const rails = [];
const railMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
for (let i = 0; i < 10; i++) {
    const railGeometry = new THREE.BoxGeometry(0.5, 0.2, 20);
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.position.set((Math.random() - 0.5) * 20, Math.random() * 10 + 1, -i * 25);
    rails.push(rail);
    scene.add(rail);
}

// Game variables
let score = 0;
let velocityY = 0;
const gravity = -0.01;
let onRail = true;
let currentRail = 0;

// Controls
const keys = {};
document.addEventListener('keydown', (e) => keys[e.code] = true);
document.addEventListener('keyup', (e) => keys[e.code] = false);

// Update UI
function updateUI() {
    document.getElementById('score').textContent = `Score: ${Math.floor(score)}`;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Player movement
    if (keys['Space'] && onRail) {
        velocityY = 0.3; // Jump
        onRail = false;
    }

    if (!onRail) {
        velocityY += gravity;
        player.position.y += velocityY;
    }

    // Auto move forward
    player.position.z -= 0.1;
    camera.position.z -= 0.1;

    // Check rail collision
    rails.forEach((rail, index) => {
        if (player.position.distanceTo(rail.position) < 2 && player.position.y <= rail.position.y + 0.5 && velocityY < 0) {
            player.position.y = rail.position.y + 0.5;
            velocityY = 0;
            onRail = true;
            currentRail = index;
            score += 10; // Score for landing
        }
    });

    // If player falls too low, reset
    if (player.position.y < -10) {
        player.position.set(0, 2, 0);
        velocityY = 0;
        onRail = true;
        score = 0;
    }

    // Camera follow
    camera.position.x = player.position.x;
    camera.position.y = player.position.y + 5;
    camera.lookAt(player.position);

    updateUI();
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});