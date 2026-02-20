// Submarine Salvage Game Script
// Pilot a mini-sub to recover wreckage underwater.
// Features: 3D underwater physics, sonar scanning, grab arms, limited power.

let scene, camera, renderer, controls;
let submarine, submarineVelocity;
let oceanFloor, wreckage = [];
let bubbles = [];
let sonarActive = false, sonarRange = 50;
let power = 100, oxygen = 100, depth = 0, score = 0;
let grabArmExtended = false;
let keys = {};

// Initialize the game
function init() {
    console.log('Initializing Submarine Salvage game...');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122); // Deep blue
    scene.fog = new THREE.Fog(0x001122, 10, 100);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 0, -10);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Underwater effect
    createUnderwaterEffect();

    // Submarine
    createSubmarine();

    // Ocean floor and environment
    createOceanFloor();
    createWreckage();

    // Event listeners
    setupEventListeners();

    // Start game loop
    animate();

    console.log('Game initialized.');
}

// Create underwater particle effect
function createUnderwaterEffect() {
    for (let i = 0; i < 100; i++) {
        const geometry = new THREE.SphereGeometry(0.02, 4, 4);
        const material = new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3 });
        const bubble = new THREE.Mesh(geometry, material);
        bubble.position.set(
            (Math.random() - 0.5) * 200,
            Math.random() * -50 - 5,
            (Math.random() - 0.5) * 200
        );
        bubble.velocity = new THREE.Vector3(0, Math.random() * 0.01 + 0.005, 0);
        scene.add(bubble);
        bubbles.push(bubble);
    }
}

// Create submarine
function createSubmarine() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.3, 2, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x666666 });
    submarine = new THREE.Mesh(geometry, material);
    submarine.position.set(0, -5, 0);
    submarine.castShadow = true;
    submarine.receiveShadow = true;
    scene.add(submarine);

    submarineVelocity = new THREE.Vector3(0, 0, 0);

    // Add propeller
    const propGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 6);
    const propMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    const propeller = new THREE.Mesh(propGeometry, propMaterial);
    propeller.position.set(0, -1, 0);
    submarine.add(propeller);
    submarine.propeller = propeller;

    // Add grab arm (placeholder)
    const armGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const grabArm = new THREE.Mesh(armGeometry, armMaterial);
    grabArm.position.set(0.8, 0, 0);
    submarine.add(grabArm);
    submarine.grabArm = grabArm;
}

// Create ocean floor
function createOceanFloor() {
    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const material = new THREE.MeshLambertMaterial({ color: 0x8B4513, wireframe: false });
    oceanFloor = new THREE.Mesh(geometry, material);
    oceanFloor.rotation.x = -Math.PI / 2;
    oceanFloor.position.y = -50;
    oceanFloor.receiveShadow = true;
    scene.add(oceanFloor);

    // Add some rocks
    for (let i = 0; i < 20; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 2 + 1, 0);
        const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            (Math.random() - 0.5) * 180,
            -50 + Math.random() * 5,
            (Math.random() - 0.5) * 180
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
}

// Create wreckage to collect
function createWreckage() {
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const wreck = new THREE.Mesh(geometry, material);
        wreck.position.set(
            (Math.random() - 0.5) * 100,
            -Math.random() * 40 - 10,
            (Math.random() - 0.5) * 100
        );
        wreck.castShadow = true;
        wreck.receiveShadow = true;
        wreck.userData = { collected: false, value: Math.floor(Math.random() * 100) + 50 };
        scene.add(wreck);
        wreckage.push(wreck);
    }
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('keydown', (e) => keys[e.code] = true);
    document.addEventListener('keyup', (e) => keys[e.code] = false);

    document.getElementById('restart').addEventListener('click', restartGame);
}

// Update submarine movement
function updateSubmarine() {
    const speed = 0.1;
    const turnSpeed = 0.02;

    if (keys['KeyW']) submarineVelocity.z -= speed * 0.1;
    if (keys['KeyS']) submarineVelocity.z += speed * 0.1;
    if (keys['KeyA']) submarine.rotation.y += turnSpeed;
    if (keys['KeyD']) submarine.rotation.y -= turnSpeed;
    if (keys['Space']) submarineVelocity.y += speed * 0.05; // Ascend
    if (keys['ShiftLeft']) submarineVelocity.y -= speed * 0.05; // Descend

    // Apply drag
    submarineVelocity.multiplyScalar(0.95);

    // Update position
    submarine.position.add(submarineVelocity);

    // Rotate propeller
    submarine.propeller.rotation.z += 0.5;

    // Update grab arm
    if (keys['KeyE']) {
        grabArmExtended = !grabArmExtended;
        submarine.grabArm.position.x = grabArmExtended ? 1.2 : 0.8;
        keys['KeyE'] = false; // Prevent continuous toggling
    }

    // Check collisions with wreckage
    checkWreckageCollision();

    // Update depth and resources
    depth = Math.abs(submarine.position.y);
    power = Math.max(0, power - 0.01);
    oxygen = Math.max(0, oxygen - 0.005);

    if (power <= 0 || oxygen <= 0) {
        gameOver();
    }
}

// Check collision with wreckage
function checkWreckageCollision() {
    const subBox = new THREE.Box3().setFromObject(submarine);

    wreckage.forEach(wreck => {
        if (!wreck.userData.collected) {
            const wreckBox = new THREE.Box3().setFromObject(wreck);
            if (subBox.intersectsBox(wreckBox) && grabArmExtended) {
                collectWreckage(wreck);
            }
        }
    });
}

// Collect wreckage
function collectWreckage(wreck) {
    wreck.userData.collected = true;
    scene.remove(wreck);
    wreckage.splice(wreckage.indexOf(wreck), 1);
    score += wreck.userData.value;
    power = Math.min(100, power + 10); // Replenish some power
}

// Update bubbles
function updateBubbles() {
    bubbles.forEach(bubble => {
        bubble.position.add(bubble.velocity);
        if (bubble.position.y > 0) {
            bubble.position.y = -50;
            bubble.position.x = (Math.random() - 0.5) * 200;
            bubble.position.z = (Math.random() - 0.5) * 200;
        }
    });
}

// Sonar scanning
function updateSonar() {
    if (keys['KeyQ']) {
        sonarActive = !sonarActive;
        keys['KeyQ'] = false;
    }

    if (sonarActive) {
        power = Math.max(0, power - 0.05); // Sonar drains power faster
        const sonarDisplay = document.getElementById('sonar-display');
        let nearestWreck = null;
        let minDistance = sonarRange;

        wreckage.forEach(wreck => {
            if (!wreck.userData.collected) {
                const distance = submarine.position.distanceTo(wreck.position);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestWreck = wreck;
                }
            }
        });

        if (nearestWreck) {
            const direction = new THREE.Vector3().subVectors(nearestWreck.position, submarine.position).normalize();
            sonarDisplay.textContent = `Sonar: ${minDistance.toFixed(1)}m ${getDirectionString(direction)}`;
        } else {
            sonarDisplay.textContent = 'Sonar: No targets';
        }
    } else {
        document.getElementById('sonar-display').textContent = 'Sonar: Off';
    }
}

// Get direction string for sonar
function getDirectionString(direction) {
    const angles = {
        front: direction.z < -0.5,
        back: direction.z > 0.5,
        left: direction.x < -0.5,
        right: direction.x > 0.5,
        up: direction.y > 0.5,
        down: direction.y < -0.5
    };

    const directions = [];
    if (angles.front) directions.push('F');
    if (angles.back) directions.push('B');
    if (angles.left) directions.push('L');
    if (angles.right) directions.push('R');
    if (angles.up) directions.push('U');
    if (angles.down) directions.push('D');

    return directions.join('') || 'Center';
}

// Update UI
function updateUI() {
    document.getElementById('depth').textContent = `Depth: ${depth.toFixed(1)}m`;
    document.getElementById('power').textContent = `Power: ${power.toFixed(1)}%`;
    document.getElementById('oxygen').textContent = `Oxygen: ${oxygen.toFixed(1)}%`;
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Game over
function gameOver() {
    alert(`Game Over! Final Score: ${score}`);
    restartGame();
}

// Restart game
function restartGame() {
    submarine.position.set(0, -5, 0);
    submarineVelocity.set(0, 0, 0);
    submarine.rotation.y = 0;
    power = 100;
    oxygen = 100;
    score = 0;
    sonarActive = false;
    grabArmExtended = false;
    submarine.grabArm.position.x = 0.8;

    // Reset wreckage
    wreckage.forEach(wreck => scene.remove(wreck));
    wreckage = [];
    createWreckage();
}

// Animate loop
function animate() {
    requestAnimationFrame(animate);

    updateSubmarine();
    updateBubbles();
    updateSonar();
    updateUI();

    // Camera follows submarine
    camera.position.copy(submarine.position);
    camera.position.y += 3;
    camera.position.z += 5;
    controls.target.copy(submarine.position);

    controls.update();
    renderer.render(scene, camera);
}

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the game
init();