// Battle Dice 3D Game
// Physics-driven dice combat

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.camera.position.set(0, 10, 15);
        this.camera.lookAt(0, 0, 0);

        // Physics world
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.defaultContactMaterial.friction = 0.4;
        this.world.defaultContactMaterial.restitution = 0.3;

        // Game state
        this.playerHealth = 100;
        this.score = 0;
        this.currentDiceType = 'basic';
        this.dice = [];
        this.enemies = [];
        this.projectiles = [];

        // Mouse aiming
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.aimDirection = new THREE.Vector3();

        // Ground
        this.ground = null;

        this.init();
        this.animate();
    }

    init() {
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Ground
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Physics ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({ mass: 0 });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        this.world.addBody(groundBody);

        // Create enemies
        for (let i = 0; i < 3; i++) {
            this.createEnemy(i * 5 - 5, 0, -10);
        }

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('keydown', (event) => this.onKeyDown(event));

        // UI buttons
        document.getElementById('basic-dice').addEventListener('click', () => this.selectDice('basic'));
        document.getElementById('fire-dice').addEventListener('click', () => this.selectDice('fire'));
        document.getElementById('ice-dice').addEventListener('click', () => this.selectDice('ice'));

        this.updateUI();
    }

    createDice(type) {
        const diceGeometry = new THREE.BoxGeometry(1, 1, 1);
        let diceMaterial;

        switch (type) {
            case 'basic':
                diceMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
                break;
            case 'fire':
                diceMaterial = new THREE.MeshLambertMaterial({ color: 0xff4444 });
                break;
            case 'ice':
                diceMaterial = new THREE.MeshLambertMaterial({ color: 0x4444ff });
                break;
        }

        const dice = new THREE.Mesh(diceGeometry, diceMaterial);
        dice.castShadow = true;
        dice.position.set(0, 5, 5);
        this.scene.add(dice);

        // Physics body
        const diceShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
        const diceBody = new CANNON.Body({ mass: 1 });
        diceBody.addShape(diceShape);
        diceBody.position.set(0, 5, 5);
        this.world.addBody(diceBody);

        const diceObj = {
            mesh: dice,
            body: diceBody,
            type: type,
            thrown: false,
            landed: false,
            value: 1
        };

        this.dice.push(diceObj);
        return diceObj;
    }

    createEnemy(x, y, z) {
        const enemyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
        const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
        enemy.position.set(x, 1, z);
        enemy.castShadow = true;
        this.scene.add(enemy);

        const enemyObj = {
            mesh: enemy,
            health: 50,
            maxHealth: 50
        };

        this.enemies.push(enemyObj);
    }

    selectDice(type) {
        this.currentDiceType = type;
        document.querySelectorAll('#controls button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${type}-dice`).classList.add('active');
        this.updateUI();
    }

    throwDice() {
        if (this.dice.length >= 5) return; // Limit dice on screen

        const dice = this.createDice(this.currentDiceType);

        // Calculate throw direction based on mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersection);

        const direction = intersection.sub(this.camera.position).normalize();
        direction.y = 0.5; // Add some upward force

        // Apply force to physics body
        const force = new CANNON.Vec3(direction.x * 20, direction.y * 20, direction.z * 20);
        dice.body.applyLocalForce(force, new CANNON.Vec3(0, 0, 0));

        // Add random torque
        const torque = new CANNON.Vec3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        dice.body.applyLocalTorque(torque);

        dice.thrown = true;
    }

    update() {
        // Update physics
        this.world.step(1 / 60);

        // Update dice positions and check for landing
        this.dice.forEach((dice, index) => {
            dice.mesh.position.copy(dice.body.position);
            dice.mesh.quaternion.copy(dice.body.quaternion);

            if (dice.thrown && !dice.landed && dice.body.velocity.length() < 0.1) {
                dice.landed = true;
                dice.value = this.calculateDiceValue(dice);
                this.applyDiceEffect(dice);
            }
        });

        // Remove old dice
        this.dice = this.dice.filter(dice => {
            if (dice.landed && Date.now() - dice.landTime > 5000) {
                this.scene.remove(dice.mesh);
                this.world.removeBody(dice.body);
                return false;
            }
            return true;
        });

        // Update enemies
        this.enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) {
                this.scene.remove(enemy.mesh);
                this.enemies.splice(index, 1);
                this.score += 100;
                this.updateUI();
            }
        });

        // Spawn new enemies occasionally
        if (Math.random() < 0.005 && this.enemies.length < 5) {
            const x = (Math.random() - 0.5) * 20;
            const z = -10 - Math.random() * 10;
            this.createEnemy(x, 0, z);
        }
    }

    calculateDiceValue(dice) {
        // Simple dice value calculation based on orientation
        const up = new THREE.Vector3(0, 1, 0);
        const diceUp = up.clone().applyQuaternion(dice.mesh.quaternion);

        // Determine which face is up (simplified)
        const faces = [
            { normal: new THREE.Vector3(0, 1, 0), value: 1 },
            { normal: new THREE.Vector3(0, -1, 0), value: 6 },
            { normal: new THREE.Vector3(1, 0, 0), value: 2 },
            { normal: new THREE.Vector3(-1, 0, 0), value: 5 },
            { normal: new THREE.Vector3(0, 0, 1), value: 3 },
            { normal: new THREE.Vector3(0, 0, -1), value: 4 }
        ];

        let bestMatch = 1;
        let bestDot = -1;

        faces.forEach(face => {
            const dot = diceUp.dot(face.normal);
            if (dot > bestDot) {
                bestDot = dot;
                bestMatch = face.value;
            }
        });

        return bestMatch;
    }

    applyDiceEffect(dice) {
        // Find enemies near the dice
        this.enemies.forEach(enemy => {
            const distance = dice.mesh.position.distanceTo(enemy.mesh.position);
            if (distance < 3) {
                let damage = dice.value;

                switch (dice.type) {
                    case 'fire':
                        damage *= 1.5;
                        break;
                    case 'ice':
                        damage *= 0.8;
                        // Freeze effect (slow enemy)
                        break;
                }

                enemy.health -= damage;
                console.log(`Hit enemy for ${damage} damage!`);
            }
        });

        dice.landTime = Date.now();
    }

    updateUI() {
        document.getElementById('health').textContent = `Player Health: ${this.playerHealth}`;
        document.getElementById('score').textContent = `Score: ${this.score}`;

        const descriptions = {
            basic: 'Basic (1-6 damage)',
            fire: 'Fire (1.5x damage)',
            ice: 'Ice (0.8x damage, freeze)'
        };
        document.getElementById('dice-type').textContent = `Current Dice: ${descriptions[this.currentDiceType]}`;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onKeyDown(event) {
        if (event.code === 'Space') {
            this.throwDice();
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
new Game();