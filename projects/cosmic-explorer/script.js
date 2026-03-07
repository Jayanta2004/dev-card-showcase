        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
        
        // --- Scene setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x03030c);
        
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 20);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = false;
        document.body.appendChild(renderer.domElement);
        
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.left = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(labelRenderer.domElement);
        
        // --- Controls (custom for flying) ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 1.2;
        controls.maxDistance = 100;
        controls.minDistance = 5;
        controls.keys = {
            LEFT: 'ArrowLeft',
            RIGHT: 'ArrowRight',
            UP: 'ArrowUp',
            BOTTOM: 'ArrowDown'
        };
        
        // We'll use our own movement keys
        const keyState = {
            w: false, a: false, s: false, d: false, q: false, e: false
        };
        
        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW': keyState.w = true; e.preventDefault(); break;
                case 'KeyA': keyState.a = true; e.preventDefault(); break;
                case 'KeyS': keyState.s = true; e.preventDefault(); break;
                case 'KeyD': keyState.d = true; e.preventDefault(); break;
                case 'KeyQ': keyState.q = true; e.preventDefault(); break;
                case 'KeyE': keyState.e = true; e.preventDefault(); break;
            }
        });
        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': keyState.w = false; e.preventDefault(); break;
                case 'KeyA': keyState.a = false; e.preventDefault(); break;
                case 'KeyS': keyState.s = false; e.preventDefault(); break;
                case 'KeyD': keyState.d = false; e.preventDefault(); break;
                case 'KeyQ': keyState.q = false; e.preventDefault(); break;
                case 'KeyE': keyState.e = false; e.preventDefault(); break;
            }
        });
        
        // --- Lighting ---
        const ambient = new THREE.AmbientLight(0x404060);
        scene.add(ambient);
        
        const pointLight = new THREE.PointLight(0xffeedd, 1, 0, 0);
        pointLight.position.set(10, 20, 15);
        scene.add(pointLight);
        
        // --- Starfield (dense) ---
        const starsGeo = new THREE.BufferGeometry();
        const starsCount = 8000;
        const starsPos = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount*3; i+=3) {
            const r = 100 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starsPos[i] = Math.sin(phi) * Math.cos(theta) * r;
            starsPos[i+1] = Math.sin(phi) * Math.sin(theta) * r;
            starsPos[i+2] = Math.cos(phi) * r;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.9 });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);
        
        // --- Nebula effect (faint colored clouds) ---
        const fog = new THREE.FogExp2(0x03030c, 0.002);
        scene.fog = fog;
        
        // --- Create some celestial objects ---
        const objects = [];
        
        // Helper to create a star
        function createStar(name, color, size, pos, type = 'star') {
            const geo = new THREE.SphereGeometry(size, 32, 32);
            const mat = new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(pos.x, pos.y, pos.z);
            scene.add(mesh);
            
            // Glow sprite
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(32,32,0,32,32,32);
            grad.addColorStop(0, `rgba(${(color>>16)&255},${(color>>8)&255},${color&255},1)`);
            grad.addColorStop(0.5, `rgba(${(color>>16)&255},${(color>>8)&255},${color&255},0.3)`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);
            ctx.fillStyle = grad;
            ctx.fillRect(0,0,64,64);
            const spriteMap = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, blending: THREE.AdditiveBlending });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(size*3, size*3, 1);
            sprite.position.copy(pos);
            scene.add(sprite);
            
            // Label
            const div = document.createElement('div');
            div.textContent = name;
            div.style.color = '#fff';
            div.style.background = 'rgba(0,0,0,0.6)';
            div.style.border = '1px solid #aaa';
            div.style.borderRadius = '20px';
            div.style.padding = '2px 12px';
            div.style.fontSize = '14px';
            div.style.backdropFilter = 'blur(4px)';
            const label = new CSS2DObject(div);
            label.position.set(pos.x, pos.y + size + 1.5, pos.z);
            scene.add(label);
            
            objects.push({ mesh, name, type, pos, size });
            return mesh;
        }
        
        // Create a few stars and planets
        createStar('Sirius', 0xaaccff, 1.2, new THREE.Vector3(12, 3, -8));
        createStar('Betelgeuse', 0xff8866, 2.0, new THREE.Vector3(-10, -4, 15));
        createStar('Rigel', 0x88aaff, 1.5, new THREE.Vector3(5, 8, -20));
        createStar('Proxima Centauri', 0xffaa66, 0.9, new THREE.Vector3(18, -2, 10));
        createStar('Vega', 0xcceeff, 1.3, new THREE.Vector3(-15, 5, -12));
        createStar('Altair', 0xffdd99, 1.1, new THREE.Vector3(8, -6, 25));
        
        // Add some random exoplanets (smaller)
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 20;
            const z = (Math.random() - 0.5) * 40;
            const size = 0.3 + Math.random() * 0.4;
            const colors = [0x88aaff, 0xaadd88, 0xccaa88, 0x88ddff];
            const col = colors[Math.floor(Math.random() * colors.length)];
            const geo = new THREE.SphereGeometry(size, 16);
            const mat = new THREE.MeshStandardMaterial({ color: col });
            const planet = new THREE.Mesh(geo, mat);
            planet.position.set(x, y, z);
            scene.add(planet);
            
            // Tiny label for some
            if (i % 3 === 0) {
                const div = document.createElement('div');
                div.textContent = `EXO-${1000+i}`;
                div.style.color = '#ccd';
                div.style.fontSize = '10px';
                div.style.background = 'rgba(0,0,0,0.4)';
                div.style.borderRadius = '10px';
                div.style.padding = '2px 6px';
                const label = new CSS2DObject(div);
                label.position.set(x, y + size + 0.5, z);
                scene.add(label);
            }
            
            objects.push({ mesh: planet, name: `EXO-${1000+i}`, type: 'planet', pos: new THREE.Vector3(x,y,z), size });
        }
        
        // --- Spaceship model (cockpit view indicator) - we don't need a model, but we'll add a small drone to represent player? 
        // Instead, we'll just move the camera.
        
        // --- Target selection (closest object) ---
        let targetIndex = 0;
        
        function updateTargetInfo() {
            if (objects.length === 0) return;
            targetIndex = (targetIndex + 1) % objects.length;
            const obj = objects[targetIndex];
            document.getElementById('target-name').innerText = obj.name;
            document.getElementById('target-type').innerText = obj.type;
            
            const dist = camera.position.distanceTo(obj.pos);
            const ly = (dist / 10).toFixed(2); // scale
            document.getElementById('target-dist').innerText = ly + ' ly';
            
            // bearing (simplified)
            const dir = new THREE.Vector3().subVectors(obj.pos, camera.position).normalize();
            const angle = Math.atan2(dir.x, dir.z) * 180 / Math.PI;
            document.getElementById('target-bearing').innerText = Math.floor(angle + 180) + '°';
        }
        
        setInterval(updateTargetInfo, 3000);
        updateTargetInfo();
        
        // --- Movement speed ---
        let speed = 0.8;
        const speedStep = 0.1;
        document.getElementById('speed-display').innerText = speed.toFixed(1);
        
        window.addEventListener('wheel', (e) => {
            if (e.deltaY < 0) speed = Math.min(3.0, speed + speedStep);
            else speed = Math.max(0.2, speed - speedStep);
            document.getElementById('speed-display').innerText = speed.toFixed(1);
        });
        
        // --- Compass update (fake) ---
        
        // --- Animation loop ---
        function animate() {
            requestAnimationFrame(animate);
            
            // Movement
            const moveSpeed = speed * 0.2;
            const forward = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
            const right = new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
            const up = new THREE.Vector3(0,1,0);
            
            if (keyState.w) camera.position.addScaledVector(forward, moveSpeed);
            if (keyState.s) camera.position.addScaledVector(forward, -moveSpeed);
            if (keyState.a) camera.position.addScaledVector(right, -moveSpeed);
            if (keyState.d) camera.position.addScaledVector(right, moveSpeed);
            if (keyState.q) camera.position.addScaledVector(up, -moveSpeed);
            if (keyState.e) camera.position.addScaledVector(up, moveSpeed);
            
            // Update object count display
            document.getElementById('object-count').innerText = objects.length;
            
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        }
        
        animate();
        
        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });