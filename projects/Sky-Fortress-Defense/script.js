// Sky Fortress Defense Game
// 3D Tower Defense with rotatable platforms and altitude-based targeting

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.camera.position.set(0, 10, 20);
        this.controls.update();

        // Game state
        this.baseHealth = 100;
        this.score = 0;
        this.wave = 1;
        this.resources = 200;
        this.selectedTurretType = null;

        // Game objects
        this.base = null;
        this.platforms = [];
        this.turrets = [];
        this.enemies = [];
        this.projectiles = [];

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
        this.animate();
    }

    init() {
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);

        // Base (floating fortress)
        const baseGeometry = new THREE.BoxGeometry(5, 2, 5);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        this.base = new THREE.Mesh(baseGeometry, baseMaterial);
        this.base.position.y = 1;
        this.scene.add(this.base);

        // Platforms around the base
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 10;
            const z = Math.sin(angle) * 10;
            this.createPlatform(x, 0, z, angle);
        }

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousedown', (event) => this.onMouseDown(event));
        window.addEventListener('keydown', (event) => this.onKeyDown(event));

        // UI buttons
        document.getElementById('basic-turret').addEventListener('click', () => {
            this.selectedTurretType = 'basic';
        });
        document.getElementById('advanced-turret').addEventListener('click', () => {
            this.selectedTurretType = 'advanced';
        });

        // Start enemy spawning
        setInterval(() => this.spawnEnemy(), 3000);
    }

    createPlatform(x, y, z, rotation) {
        const platformGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 8);
        const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(x, y, z);
        platform.rotation.y = rotation;
        platform.userData = { type: 'platform', occupied: false };
        this.scene.add(platform);
        this.platforms.push(platform);
    }

    createTurret(platform, type) {
        const turretGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2);
        const turretMaterial = new THREE.MeshLambertMaterial({ color: type === 'basic' ? 0x00ff00 : 0xff0000 });
        const turret = new THREE.Mesh(turretGeometry, turretMaterial);
        turret.position.copy(platform.position);
        turret.position.y += 1.5;
        turret.userData = { type: 'turret', turretType: type, range: type === 'basic' ? 15 : 25, damage: type === 'basic' ? 10 : 20, fireRate: type === 'basic' ? 1000 : 500, lastFired: 0 };
        this.scene.add(turret);
        this.turrets.push(turret);
        platform.userData.occupied = true;
    }

    spawnEnemy() {
        const enemyGeometry = new THREE.SphereGeometry(0.5);
        const enemyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);

        // Random spawn position around the perimeter
        const angle = Math.random() * Math.PI * 2;
        const distance = 50;
        enemy.position.set(Math.cos(angle) * distance, Math.random() * 10 + 5, Math.sin(angle) * distance);
        enemy.userData = { type: 'enemy', health: 20, speed: 0.1 };
        this.scene.add(enemy);
        this.enemies.push(enemy);
    }

    update() {
        // Update enemies
        this.enemies.forEach((enemy, index) => {
            // Move towards base
            const direction = new THREE.Vector3().subVectors(this.base.position, enemy.position).normalize();
            enemy.position.add(direction.multiplyScalar(enemy.userData.speed));

            // Check if enemy reached base
            if (enemy.position.distanceTo(this.base.position) < 3) {
                this.baseHealth -= 10;
                this.updateHUD();
                this.scene.remove(enemy);
                this.enemies.splice(index, 1);
                if (this.baseHealth <= 0) {
                    alert('Game Over!');
                }
            }
        });

        // Update turrets
        this.turrets.forEach(turret => {
            const now = Date.now();
            if (now - turret.userData.lastFired > turret.userData.fireRate) {
                // Find closest enemy within range
                let closestEnemy = null;
                let closestDistance = Infinity;
                this.enemies.forEach(enemy => {
                    const distance = turret.position.distanceTo(enemy.position);
                    if (distance < turret.userData.range && distance < closestDistance) {
                        closestDistance = distance;
                        closestEnemy = enemy;
                    }
                });

                if (closestEnemy) {
                    this.fireProjectile(turret, closestEnemy);
                    turret.userData.lastFired = now;
                }
            }
        });

        // Update projectiles
        this.projectiles.forEach((projectile, index) => {
            projectile.position.add(projectile.userData.velocity);

            // Check collision with enemies
            this.enemies.forEach((enemy, enemyIndex) => {
                if (projectile.position.distanceTo(enemy.position) < 1) {
                    enemy.userData.health -= projectile.userData.damage;
                    if (enemy.userData.health <= 0) {
                        this.scene.remove(enemy);
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 10;
                        this.resources += 20;
                        this.updateHUD();
                    }
                    this.scene.remove(projectile);
                    this.projectiles.splice(index, 1);
                }
            });

            // Remove if out of bounds
            if (projectile.position.length() > 100) {
                this.scene.remove(projectile);
                this.projectiles.splice(index, 1);
            }
        });
    }

    fireProjectile(turret, target) {
        const projectileGeometry = new THREE.SphereGeometry(0.1);
        const projectileMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
        projectile.position.copy(turret.position);
        const direction = new THREE.Vector3().subVectors(target.position, turret.position).normalize();
        projectile.userData = { velocity: direction.multiplyScalar(0.5), damage: turret.userData.damage };
        this.scene.add(projectile);
        this.projectiles.push(projectile);
    }

    updateHUD() {
        document.getElementById('health').textContent = `Base Health: ${this.baseHealth}`;
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('wave').textContent = `Wave: ${this.wave}`;
    }

    onMouseDown(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.platforms);

        if (intersects.length > 0 && this.selectedTurretType) {
            const platform = intersects[0].object;
            if (!platform.userData.occupied) {
                const cost = this.selectedTurretType === 'basic' ? 50 : 100;
                if (this.resources >= cost) {
                    this.createTurret(platform, this.selectedTurretType);
                    this.resources -= cost;
                    this.selectedTurretType = null;
                }
            }
        }
    }

    onKeyDown(event) {
        if (event.key === 'a' || event.key === 'A') {
            this.platforms.forEach(platform => {
                platform.rotation.y -= 0.1;
            });
        } else if (event.key === 'd' || event.key === 'D') {
            this.platforms.forEach(platform => {
                platform.rotation.y += 0.1;
            });
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