// Quantum Maze Game
// Maze that shifts based on observation/perspective

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas') });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.camera.position.set(0, 5, 10);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // Game state
        this.player = null;
        this.walls = [];
        this.exit = null;
        this.mazeSize = 10;
        this.cellSize = 2;

        // Perspective tracking
        this.currentPerspective = 'front'; // front, side, top

        this.keys = {};

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

        // Player
        const playerGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        this.player = new THREE.Mesh(playerGeometry, playerMaterial);
        this.player.position.set(0, 0.4, 0);
        this.scene.add(this.player);

        // Exit
        const exitGeometry = new THREE.BoxGeometry(1, 1, 1);
        const exitMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        this.exit = new THREE.Mesh(exitGeometry, exitMaterial);
        this.exit.position.set((this.mazeSize - 1) * this.cellSize, 0.5, (this.mazeSize - 1) * this.cellSize);
        this.scene.add(this.exit);

        // Generate maze walls
        this.generateMaze();

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('keydown', (event) => this.onKeyDown(event));
        window.addEventListener('keyup', (event) => this.onKeyUp(event));
    }

    generateMaze() {
        // Clear existing walls
        this.walls.forEach(wall => this.scene.remove(wall));
        this.walls = [];

        // Get camera direction to determine perspective
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);

        // Determine perspective based on camera angle
        const absX = Math.abs(cameraDirection.x);
        const absY = Math.abs(cameraDirection.y);
        const absZ = Math.abs(cameraDirection.z);

        if (absY > absX && absY > absZ) {
            this.currentPerspective = cameraDirection.y > 0 ? 'top' : 'bottom';
        } else if (absX > absZ) {
            this.currentPerspective = cameraDirection.x > 0 ? 'right' : 'left';
        } else {
            this.currentPerspective = cameraDirection.z > 0 ? 'back' : 'front';
        }

        this.updatePerspectiveDisplay();

        // Generate walls based on perspective
        for (let x = 0; x < this.mazeSize; x++) {
            for (let z = 0; z < this.mazeSize; z++) {
                if (this.shouldHaveWall(x, z)) {
                    this.createWall(x * this.cellSize, 0, z * this.cellSize);
                }
            }
        }
    }

    shouldHaveWall(x, z) {
        // Different wall patterns for different perspectives
        const hash = (x * 31 + z * 37) % 100;

        switch (this.currentPerspective) {
            case 'front':
                return hash < 30 && (x + z) % 2 === 0;
            case 'back':
                return hash < 25 && x % 3 === 0;
            case 'left':
                return hash < 35 && z % 2 === 1;
            case 'right':
                return hash < 20 && (x * z) % 5 === 0;
            case 'top':
                return hash < 40 && Math.abs(x - z) < 2;
            case 'bottom':
                return hash < 15;
            default:
                return false;
        }
    }

    createWall(x, y, z) {
        const wallGeometry = new THREE.BoxGeometry(this.cellSize, 2, this.cellSize);
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const wall = new THREE.Mesh(wallGeometry, wallMaterial);
        wall.position.set(x, y + 1, z);
        this.scene.add(wall);
        this.walls.push(wall);
    }

    updatePerspectiveDisplay() {
        document.getElementById('perspective').textContent = `Perspective: ${this.currentPerspective.charAt(0).toUpperCase() + this.currentPerspective.slice(1)}`;
    }

    update() {
        // Check if camera perspective changed
        const oldPerspective = this.currentPerspective;
        this.generateMaze();
        if (oldPerspective !== this.currentPerspective) {
            // Perspective changed, regenerate maze
        }

        // Player movement
        const moveSpeed = 0.1;
        const newPosition = this.player.position.clone();

        if (this.keys['w'] || this.keys['W']) newPosition.z -= moveSpeed;
        if (this.keys['s'] || this.keys['S']) newPosition.z += moveSpeed;
        if (this.keys['a'] || this.keys['A']) newPosition.x -= moveSpeed;
        if (this.keys['d'] || this.keys['D']) newPosition.x += moveSpeed;

        // Check collision with walls
        if (!this.checkCollision(newPosition)) {
            this.player.position.copy(newPosition);
        }

        // Check win condition
        if (this.player.position.distanceTo(this.exit.position) < 1.5) {
            alert('You found the quantum exit! Maze shifts with observation.');
            // Reset player position
            this.player.position.set(0, 0.4, 0);
        }

        this.controls.update();
    }

    checkCollision(position) {
        for (const wall of this.walls) {
            if (Math.abs(position.x - wall.position.x) < this.cellSize / 2 + 0.4 &&
                Math.abs(position.z - wall.position.z) < this.cellSize / 2 + 0.4) {
                return true;
            }
        }
        return false;
    }

    onKeyDown(event) {
        this.keys[event.key] = true;
    }

    onKeyUp(event) {
        this.keys[event.key] = false;
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