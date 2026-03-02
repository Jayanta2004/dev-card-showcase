        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
        
        // --- Scene setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x030005);
        
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, 25);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = false;
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.2;
        document.body.appendChild(renderer.domElement);
        
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.left = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(labelRenderer.domElement);
        
        // --- Controls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
        controls.enableZoom = true;
        controls.maxDistance = 50;
        controls.minDistance = 10;
        
        // --- Lighting ---
        const ambient = new THREE.AmbientLight(0x402030);
        scene.add(ambient);
        
        const pointLight = new THREE.PointLight(0xff8866, 1, 30);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        
        // --- Starfield (dense) ---
        const starsGeo = new THREE.BufferGeometry();
        const starsCount = 6000;
        const starsPos = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount*3; i+=3) {
            const r = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starsPos[i] = Math.sin(phi) * Math.cos(theta) * r;
            starsPos[i+1] = Math.sin(phi) * Math.sin(theta) * r;
            starsPos[i+2] = Math.cos(phi) * r;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, transparent: true });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);
        
        // --- Black hole (event horizon) ---
        const horizonGeo = new THREE.SphereGeometry(2.5, 64, 64);
        const horizonMat = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            emissive: 0x220000,
            roughness: 0.1,
            metalness: 0.9
        });
        const horizon = new THREE.Mesh(horizonGeo, horizonMat);
        horizon.position.set(0, 0, 0);
        scene.add(horizon);
        
        // --- Accretion disk (particle system) ---
        const diskParticles = 15000;
        const diskGeo = new THREE.BufferGeometry();
        const diskPositions = new Float32Array(diskParticles * 3);
        const diskColors = new Float32Array(diskParticles * 3);
        
        for (let i = 0; i < diskParticles; i++) {
            // Random radius from 3 to 8
            const r = 3 + Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            // Flattened in y, with slight thickness
            const y = (Math.random() - 0.5) * 0.8 * Math.exp(-(r-3)/2);
            
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            
            diskPositions[i*3] = x;
            diskPositions[i*3+1] = y;
            diskPositions[i*3+2] = z;
            
            // Color based on radius and temperature
            const t = (r - 3) / 5; // 0 inner hot, 1 outer cooler
            const rColor = 1.0 - t * 0.7;
            const gColor = 0.6 - t * 0.4;
            const bColor = 0.2 + t * 0.3;
            
            diskColors[i*3] = rColor;
            diskColors[i*3+1] = gColor;
            diskColors[i*3+2] = bColor;
        }
        
        diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
        diskGeo.setAttribute('color', new THREE.BufferAttribute(diskColors, 3));
        
        const diskMat = new THREE.PointsMaterial({ 
            size: 0.12,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
        
        const disk = new THREE.Points(diskGeo, diskMat);
        scene.add(disk);
        
        // --- Inner hot plasma (glow) ---
        const innerGlowGeo = new THREE.SphereGeometry(2.8, 32, 32);
        const innerGlowMat = new THREE.MeshBasicMaterial({ 
            color: 0xff5500,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
        });
        const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
        scene.add(innerGlow);
        
        // --- Photon sphere (translucent) ---
        const photonGeo = new THREE.SphereGeometry(3.7, 48, 48);
        const photonMat = new THREE.MeshPhongMaterial({
            color: 0xffaa66,
            emissive: 0x442200,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
            wireframe: true
        });
        const photonSphere = new THREE.Mesh(photonGeo, photonMat);
        scene.add(photonSphere);
        
        // --- Relativistic jet (particle stream) ---
        const jetParticles = 4000;
        const jetGeo = new THREE.BufferGeometry();
        const jetPositions = new Float32Array(jetParticles * 3);
        
        for (let i = 0; i < jetParticles; i++) {
            // Upward jet
            const r = Math.random() * 15;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * r * 0.3;
            const z = Math.sin(angle) * r * 0.3;
            const y = 2.5 + Math.random() * 12;
            
            jetPositions[i*3] = x;
            jetPositions[i*3+1] = y;
            jetPositions[i*3+2] = z;
        }
        jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
        const jetMat = new THREE.PointsMaterial({ color: 0xffaa88, size: 0.15, blending: THREE.AdditiveBlending });
        const jet = new THREE.Points(jetGeo, jetMat);
        scene.add(jet);
        
        // Downward jet (mirror)
        const jetDownGeo = new THREE.BufferGeometry();
        const jetDownPositions = new Float32Array(jetParticles * 3);
        for (let i = 0; i < jetParticles; i++) {
            const r = Math.random() * 15;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * r * 0.3;
            const z = Math.sin(angle) * r * 0.3;
            const y = -2.5 - Math.random() * 12;
            
            jetDownPositions[i*3] = x;
            jetDownPositions[i*3+1] = y;
            jetDownPositions[i*3+2] = z;
        }
        jetDownGeo.setAttribute('position', new THREE.BufferAttribute(jetDownPositions, 3));
        const jetDownMat = new THREE.PointsMaterial({ color: 0xffaa88, size: 0.15, blending: THREE.AdditiveBlending });
        const jetDown = new THREE.Points(jetDownGeo, jetDownMat);
        scene.add(jetDown);
        
        // --- Gravitational lensing effect (distorted background stars) - we can add a few moving sprites? Not easily done in realtime.
        // Instead, we'll add a few glowing rings
        for (let i = 0; i < 3; i++) {
            const ringGeo = new THREE.TorusGeometry(3.0 + i*0.5, 0.05, 16, 64);
            const ringMat = new THREE.MeshStandardMaterial({ color: 0xff8866, emissive: 0x331100 });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.z = i * 0.5;
            scene.add(ring);
        }
        
        // --- Animate ---
        let time = 0;
        
        function animate() {
            requestAnimationFrame(animate);
            
            time += 0.005;
            
            // Rotate accretion disk
            disk.rotation.y += 0.002;
            disk.rotation.x = 0.2;
            
            // Rotate photon sphere
            photonSphere.rotation.y += 0.001;
            photonSphere.rotation.x = 0.1;
            
            // Pulse inner glow
            innerGlow.material.opacity = 0.15 + Math.sin(time * 3) * 0.05;
            
            // Update displays
            document.getElementById('temp-display').innerText = (12 + Math.sin(time)*0.5).toFixed(1) + ' MK';
            document.getElementById('jet-power').innerText = (4.5 + Math.sin(time*2)*0.3).toFixed(1) + 'e36 W';
            document.getElementById('jet-speed').innerText = (0.87 + Math.sin(time*1.5)*0.02).toFixed(2) + 'c';
            
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