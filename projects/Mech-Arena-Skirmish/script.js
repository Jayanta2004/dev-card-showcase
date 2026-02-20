const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Ground
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Mech
let mech = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
mech.position.y = 1;
scene.add(mech);

// Covers
const covers = [];
for (let i = 0; i < 5; i++) {
    const cover = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.5), new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
    cover.position.set(Math.random() * 40 - 20, 1, Math.random() * 40 - 20);
    scene.add(cover);
    covers.push(cover);
}

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Movement
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
});

// Pointer lock
// document.addEventListener('click', () => {
//     controls.lock();
// });

// Skills
let shootCooldown = 0;
let dashCooldown = 0;

document.getElementById('skill1').addEventListener('click', () => {
    if (shootCooldown <= 0) {
        shoot();
        shootCooldown = 120; // 2s at 60fps
    }
});

document.getElementById('skill2').addEventListener('click', () => {
    if (dashCooldown <= 0) {
        dash();
        dashCooldown = 300; // 5s
    }
});

function shoot() {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(covers);
    if (intersects.length > 0) {
        const hit = intersects[0].object;
        scene.remove(hit);
        covers.splice(covers.indexOf(hit), 1);
    }
}

function dash() {
    const dashDir = new THREE.Vector3(0, 0, -1);
    dashDir.applyQuaternion(camera.quaternion);
    dashDir.y = 0;
    mech.position.add(dashDir.multiplyScalar(5));
}

// Loadout
document.getElementById('mech1').addEventListener('click', () => {
    mech.material.color.set(0xff0000);
    mech.scale.set(1, 1, 1);
});

document.getElementById('mech2').addEventListener('click', () => {
    mech.material.color.set(0x0000ff);
    mech.scale.set(1.5, 1.5, 1.5);
});

// Animate
function animate() {
    requestAnimationFrame(animate);

    // Movement
    const direction = new THREE.Vector3();
    if (moveForward) direction.z -= 1;
    if (moveBackward) direction.z += 1;
    if (moveLeft) direction.x -= 1;
    if (moveRight) direction.x += 1;
    direction.normalize();
    direction.applyQuaternion(camera.quaternion);
    direction.y = 0; // Keep on ground
    mech.position.add(direction.multiplyScalar(0.1));

    // Update camera to follow mech
    camera.position.x = mech.position.x;
    camera.position.z = mech.position.z + 10;
    camera.position.y = mech.position.y + 5;

    controls.target.copy(mech.position);
    controls.update();

    // Cooldowns
    if (shootCooldown > 0) shootCooldown--;
    if (dashCooldown > 0) dashCooldown--;

    renderer.render(scene, camera);
}

animate();

// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});