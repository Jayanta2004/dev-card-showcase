/**
 * SOFTRENDER ENGINE CORE
 * A vanilla JS 3D Rasterizer implementation.
 * * ARCHITECTURE:
 * 1. SceneGraph: Manages meshes, lights, and camera.
 * 2. Pipeline: Handles Matrix transformations (World -> View -> Projection).
 * 3. Rasterizer: Draws lines/tris to the 2D Canvas.
 * 4. InputManager: Handles mouse orbit and keyboard events.
 * * * @author saiusesgithub
 * @version 1.0.0
 */

/* =========================================
   1. SAMPLE DATA (Default Cube)
   ========================================= */
const SAMPLE_OBJ = `
# Default Cube
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v -1.0 1.0 1.0
v 1.0 1.0 1.0
v -1.0 -1.0 -1.0
v 1.0 -1.0 -1.0
v -1.0 1.0 -1.0
v 1.0 1.0 -1.0
f 1 2 4 3
f 5 6 8 7
f 1 2 6 5
f 3 4 8 7
f 1 3 7 5
f 2 4 8 6
`;

/* =========================================
   2. 3D OBJECT CLASSES
   ========================================= */

class Mesh {
    constructor(name, vertices = [], faces = []) {
        this.name = name;
        this.vertices = vertices; // Array of Vec3
        this.faces = faces;       // Array of arrays [v1_idx, v2_idx, v3_idx, ...]

        // Transform
        this.position = new Vec3(0, 0, 0);
        this.rotation = new Vec3(0, 0, 0); // Euler angles in degrees
        this.scale = new Vec3(1, 1, 1);

        // Computed
        this.worldMatrix = new Mat4();
    }

    // Parse .obj string format
    static fromOBJ(name, text) {
        const verts = [];
        const faces = [];
        const lines = text.split('\n');

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('v ')) {
                const parts = line.split(/\s+/);
                verts.push(new Vec3(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ));
            } else if (line.startsWith('f ')) {
                const parts = line.split(/\s+/);
                const face = [];
                // OBJ is 1-based, we need 0-based
                for (let i = 1; i < parts.length; i++) {
                    const idx = parseInt(parts[i].split('/')[0]) - 1;
                    face.push(idx);
                }
                faces.push(face);
            }
        }
        return new Mesh(name, verts, faces);
    }
}

class Camera {
    constructor() {
        this.position = new Vec3(0, 2, 5); // Start back and up
        this.target = new Vec3(0, 0, 0);   // Look at center
        this.up = new Vec3(0, 1, 0);

        this.fov = 60;
        this.near = 0.1;
        this.far = 100.0;

        // Orbit controls state
        this.radius = 6.0;
        this.theta = 0; // Horizontal angle
        this.phi = 0;   // Vertical angle

        this.viewMatrix = new Mat4();
        this.projMatrix = new Mat4();
    }

    updateMatrices(aspect) {
        // 1. Update Position based on Spherical Coords (Orbit)
        // Convert Spherical to Cartesian
        // x = r * sin(phi) * sin(theta)
        // y = r * cos(phi)
        // z = r * sin(phi) * cos(theta)

        // Clamp phi to prevent gimbal lock flipping
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));

        this.position.x = this.radius * Math.sin(this.phi) * Math.sin(this.theta);
        this.position.y = this.radius * Math.cos(this.phi);
        this.position.z = this.radius * Math.sin(this.phi) * Math.cos(this.theta);

        // 2. Build Matrices
        this.viewMatrix = Mat4.lookAt(this.position, this.target, this.up);
        this.projMatrix = Mat4.perspective(this.fov, aspect, this.near, this.far);
    }
}

/* =========================================
   3. RENDER ENGINE (The Heavy Lifter)
   ========================================= */

class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for no transparency

        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        // Resolution Scaling (Retina support)
        this.pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        // Settings
        this.settings = {
            wireframe: true,
            backfaceCulling: true,
            drawVertices: false,
            usePerspective: true
        };
    }

    resize() {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    clear() {
        this.ctx.fillStyle = '#303030'; // Matches CSS --bg-viewport
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // THE PIPELINE: Mesh -> World -> View -> Clip -> Screen
    render(scene, camera) {
        this.clear();

        // 1. Calculate View-Projection Matrix (VP)
        // We do this once per frame, not per vertex
        const vpMatrix = new Mat4();
        vpMatrix.multiply(camera.projMatrix);
        vpMatrix.multiply(camera.viewMatrix);

        // Debug info
        let facesDrawn = 0;
        let vertsProcessed = 0;

        for (const mesh of scene.meshes) {
            // 2. Update Model Matrix (World)
            mesh.worldMatrix = Mat4.compose(mesh.position, mesh.rotation, mesh.scale);

            // 3. Combine to MVP (Model-View-Projection)
            const mvpMatrix = new Mat4();
            mvpMatrix.multiply(vpMatrix);       // P * V
            mvpMatrix.multiply(mesh.worldMatrix); // * M

            // 4. Vertex Shader Stage (Transform all verts)
            const projectedVerts = [];

            for (const v of mesh.vertices) {
                // Apply MVP
                const res = mvpMatrix.transformVec3(v);
                vertsProcessed++;

                // Perspective Divide (Clip Space -> NDC)
                if (res.w !== 0) {
                    res.x /= res.w;
                    res.y /= res.w;
                    res.z /= res.w;
                }

                // Viewport Transform (NDC -> Screen Space)
                // NDC is -1 to 1. Screen is 0 to Width/Height.
                const screenX = (res.x + 1) * 0.5 * this.width;
                const screenY = (1 - res.y) * 0.5 * this.height;

                projectedVerts.push({ x: screenX, y: screenY, z: res.z, w: res.w });
            }

            // 5. Rasterizer Stage (Draw Faces)
            this.ctx.strokeStyle = '#e6e6e6'; // CSS --text-main
            this.ctx.lineWidth = 1;
            this.ctx.fillStyle = 'rgba(40, 40, 40, 0.5)'; // Fill color

            for (const face of mesh.faces) {
                // A face is a list of vertex indices (usually 3 or 4)
                // We need at least 3 points to draw
                if (face.length < 3) continue;

                const v0 = projectedVerts[face[0]];
                const v1 = projectedVerts[face[1]];
                const v2 = projectedVerts[face[2]];

                // Clipping Check (Simple w-clip)
                // If any point is behind camera (w < near), skip face.
                // A real clipper clips the geometry, this just culls.
                if (v0.w < camera.near || v1.w < camera.near || v2.w < camera.near) continue;

                // Backface Culling
                if (this.settings.backfaceCulling) {
                    // Compute Face Normal in Screen Space (2D cross product)
                    // If z-component of cross product is negative, it faces away (assuming CCW winding)
                    const ax = v1.x - v0.x;
                    const ay = v1.y - v0.y;
                    const bx = v2.x - v0.x;
                    const by = v2.y - v0.y;

                    const crossZ = ax * by - ay * bx;

                    // If area is negative (or positive depending on coord system), cull
                    if (crossZ <= 0) continue;
                }

                // Draw Polygon
                this.ctx.beginPath();
                this.ctx.moveTo(v0.x, v0.y);
                for (let i = 1; i < face.length; i++) {
                    const v = projectedVerts[face[i]];
                    this.ctx.lineTo(v.x, v.y);
                }
                this.ctx.closePath();

                if (this.settings.wireframe) {
                    this.ctx.stroke();
                } else {
                    this.ctx.fill();
                    this.ctx.stroke();
                }

                facesDrawn++;
            }
        }

        return { faces: facesDrawn, verts: vertsProcessed };
    }
}

/* =========================================
   4. APP CONTROLLER (Input & UI)
   ========================================= */

class App {
    constructor() {
        this.renderer = new Renderer('render-surface');
        this.camera = new Camera();
        this.scene = { meshes: [] };

        // Input State
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.activeMesh = null;

        // Timing
        this.lastTime = 0;
        this.fps = 0;

        this.init();
    }

    init() {
        // Load Default Cube
        const cube = Mesh.fromOBJ('Cube', SAMPLE_OBJ);
        this.scene.meshes.push(cube);
        this.activeMesh = cube;

        // Initialize Camera Angles
        this.camera.theta = Math.PI / 4;
        this.camera.phi = Math.PI / 3;

        this.bindEvents();
        this.bindUI();

        // Start Loop
        requestAnimationFrame((t) => this.loop(t));
    }

    bindEvents() {
        const canvas = this.renderer.canvas;

        // Resize
        window.addEventListener('resize', () => this.renderer.resize());

        // Mouse Orbit
        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left Click
                this.isDragging = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;

                // Update Camera Angles
                const sensitivity = 0.01;
                this.camera.theta -= deltaX * sensitivity;
                this.camera.phi -= deltaY * sensitivity;

                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Zoom (Wheel)
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.radius += e.deltaY * 0.01;
            this.camera.radius = Math.max(2, Math.min(20, this.camera.radius));
        });

        // File Drop
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        // Button Logic - Load sample and hide drop zone
        document.getElementById('btn-load-sample').onclick = () => {
            dropZone.style.display = 'none';
        };

        // Make drop zone clickable to open file picker
        dropZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                fileInput.click();
            }
        });

        // Drag/Drop visual feedback
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.endsWith('.obj')) {
                this.loadOBJFile(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.loadOBJFile(file);
        });
    }

    bindUI() {
        // Transform Inputs
        const bindInput = (id, obj, prop) => {
            const el = document.getElementById(id);
            el.addEventListener('input', (e) => {
                if (this.activeMesh) {
                    this.activeMesh[obj][prop] = parseFloat(e.target.value);
                }
            });
        };

        // Position
        bindInput('inp-loc-x', 'position', 'x');
        bindInput('inp-loc-y', 'position', 'y');
        bindInput('inp-loc-z', 'position', 'z');
        // Rotation
        bindInput('inp-rot-x', 'rotation', 'x');
        bindInput('inp-rot-y', 'rotation', 'y');
        bindInput('inp-rot-z', 'rotation', 'z');
        // Scale
        bindInput('inp-scl-x', 'scale', 'x');
        bindInput('inp-scl-y', 'scale', 'y');
        bindInput('inp-scl-z', 'scale', 'z');

        // Render Settings
        document.getElementById('chk-wireframe').addEventListener('change', (e) => {
            this.renderer.settings.wireframe = e.target.checked;
        });
        document.getElementById('chk-culling').addEventListener('change', (e) => {
            this.renderer.settings.backfaceCulling = e.target.checked;
        });
        document.getElementById('rng-fov').addEventListener('input', (e) => {
            this.camera.fov = parseFloat(e.target.value);
        });

        // Perspective Toggle
        document.getElementById('chk-perspective').addEventListener('change', (e) => {
            this.renderer.settings.usePerspective = e.target.checked;
        });

        // Reset Camera Button
        const resetBtn = document.querySelector('.btn-icon[title="Reset Camera"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.camera.theta = Math.PI / 4;
                this.camera.phi = Math.PI / 3;
                this.camera.radius = 6.0;
                this.camera.fov = 60;
                document.getElementById('rng-fov').value = 60;
            });
        }
    }

    loadOBJFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const mesh = Mesh.fromOBJ(file.name, text);
            this.scene.meshes = [mesh]; // Replace scene
            this.activeMesh = mesh;
            document.getElementById('drop-zone').style.display = 'none';

            // Reset UI values
            this.updateUIFromMesh(mesh);
        };
        reader.readAsText(file);
    }

    updateUIFromMesh(mesh) {
        // Update all UI inputs to reflect mesh transform
        document.getElementById('inp-loc-x').value = mesh.position.x.toFixed(2);
        document.getElementById('inp-loc-y').value = mesh.position.y.toFixed(2);
        document.getElementById('inp-loc-z').value = mesh.position.z.toFixed(2);

        document.getElementById('inp-rot-x').value = mesh.rotation.x.toFixed(0);
        document.getElementById('inp-rot-y').value = mesh.rotation.y.toFixed(0);
        document.getElementById('inp-rot-z').value = mesh.rotation.z.toFixed(0);

        document.getElementById('inp-scl-x').value = mesh.scale.x.toFixed(2);
        document.getElementById('inp-scl-y').value = mesh.scale.y.toFixed(2);
        document.getElementById('inp-scl-z').value = mesh.scale.z.toFixed(2);

        // Update outliner
        const outliner = document.getElementById('outliner-list');
        outliner.innerHTML = `
            <div class="list-item active">
                <i class='bx bxs-cube-alt'></i> ${mesh.name || 'Mesh'}
            </div>
            <div class="list-item">
                <i class='bx bxs-camera'></i> Camera
            </div>
            <div class="list-item">
                <i class='bx bxs-bulb'></i> Light
            </div>
        `;
    }

    loop(timestamp) {
        // Calculate FPS
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        this.fps = Math.round(1000 / dt);

        // Update Logic
        const aspect = this.renderer.width / this.renderer.height;
        this.camera.updateMatrices(aspect);

        // Auto-rotate the cube if not interacting
        if (!this.isDragging && this.activeMesh) {
            // this.activeMesh.rotation.y += 0.5;
            // Update UI to reflect rotation
            // document.getElementById('inp-rot-y').value = this.activeMesh.rotation.y.toFixed(2);
        }

        // Render
        const stats = this.renderer.render(this.scene, this.camera);

        // Update Stats UI
        document.getElementById('stat-fps').innerText = `FPS: ${this.fps}`;
        document.getElementById('stat-verts').innerText = `Verts: ${stats.verts}`;
        document.getElementById('stat-faces').innerText = `Faces: ${stats.faces}`;

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Bootstrap
window.onload = () => {
    window.app = new App();
};