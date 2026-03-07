        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
        
        // --- Scene setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x001020);
        scene.fog = new THREE.FogExp2(0x001020, 0.015);
        
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        camera.position.set(5, 5, 15);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
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
        
        // --- Controls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.maxDistance = 40;
        controls.minDistance = 5;
        
        // --- Lighting (dim, blue) ---
        const ambient = new THREE.AmbientLight(0x103050);
        scene.add(ambient);
        
        const pointLight = new THREE.PointLight(0x336688, 0.8, 30);
        pointLight.position.set(2, 3, 5);
        scene.add(pointLight);
        
        // --- Underwater particles (sediment/microbes) ---
        const partGeo = new THREE.BufferGeometry();
        const partCount = 2000;
        const partPos = new Float32Array(partCount * 3);
        for (let i = 0; i < partCount*3; i+=3) {
            partPos[i] = (Math.random() - 0.5) * 50;
            partPos[i+1] = (Math.random() - 0.5) * 30;
            partPos[i+2] = (Math.random() - 0.5) * 50;
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
        const partMat = new THREE.PointsMaterial({ color: 0x88aacc, size: 0.1, transparent: true, opacity: 0.3 });
        const particles = new THREE.Points(partGeo, partMat);
        scene.add(particles);
        
        // --- Seafloor (a large flat plane with some bumps) ---
        const floorGeo = new THREE.PlaneGeometry(60, 60, 40, 40);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x224466, emissive: 0x112233, wireframe: false, flatShading: true });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -5;
        scene.add(floor);
        
        // Add some rocks
        for (let i = 0; i < 30; i++) {
            const rockGeo = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.5);
            const rockMat = new THREE.MeshStandardMaterial({ color: 0x446688, emissive: 0x112233 });
            const rock = new THREE.Mesh(rockGeo, rockMat);
            rock.position.x = (Math.random() - 0.5) * 25;
            rock.position.z = (Math.random() - 0.5) * 25;
            rock.position.y = -5 + rockGeo.parameters.radius * 0.8;
            rock.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
            scene.add(rock);
        }
        
        // --- Hydrothermal vent (smoker) ---
        const ventGroup = new THREE.Group();
        ventGroup.position.set(8, -4, 6);
        
        // Vent base
        const baseGeo = new THREE.CylinderGeometry(0.8, 1.2, 2, 6);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x885522 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = -1;
        ventGroup.add(base);
        
        // Smoke particles
        const smokeGeo = new THREE.BufferGeometry();
        const smokeCount = 300;
        const smokePos = new Float32Array(smokeCount * 3);
        for (let i = 0; i < smokeCount; i++) {
            smokePos[i*3] = (Math.random() - 0.5) * 1.5;
            smokePos[i*3+1] = Math.random() * 4;
            smokePos[i*3+2] = (Math.random() - 0.5) * 1.5;
        }
        smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePos, 3));
        const smokeMat = new THREE.PointsMaterial({ color: 0x886644, size: 0.15, transparent: true, blending: THREE.AdditiveBlending });
        const smoke = new THREE.Points(smokeGeo, smokeMat);
        ventGroup.add(smoke);
        
        scene.add(ventGroup);
        
        // Vent label
        const ventDiv = document.createElement('div');
        ventDiv.textContent = '🌋 hydrothermal vent';
        ventDiv.style.color = '#ddaa88';
        ventDiv.style.background = 'rgba(20,10,5,0.7)';
        ventDiv.style.borderRadius = '20px';
        ventDiv.style.padding = '2px 12px';
        ventDiv.style.fontSize = '12px';
        const ventLabel = new CSS2DObject(ventDiv);
        ventLabel.position.set(8, -1, 6);
        scene.add(ventLabel);
        
        // --- Bioluminescent creatures (glowing particles) ---
        const bioGeo = new THREE.BufferGeometry();
        const bioCount = 400;
        const bioPos = new Float32Array(bioCount * 3);
        const bioColors = new Float32Array(bioCount * 3);
        for (let i = 0; i < bioCount; i++) {
            bioPos[i*3] = (Math.random() - 0.5) * 30;
            bioPos[i*3+1] = (Math.random() - 0.5) * 15;
            bioPos[i*3+2] = (Math.random() - 0.5) * 30;
            
            // Random pastel colors
            bioColors[i*3] = 0.8 + Math.random() * 0.5;
            bioColors[i*3+1] = 0.5 + Math.random() * 0.5;
            bioColors[i*3+2] = 0.8 + Math.random() * 0.5;
        }
        bioGeo.setAttribute('position', new THREE.BufferAttribute(bioPos, 3));
        bioGeo.setAttribute('color', new THREE.BufferAttribute(bioColors, 3));
        const bioMat = new THREE.PointsMaterial({ size: 0.2, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending });
        const bio = new THREE.Points(bioGeo, bioMat);
        scene.add(bio);
        
        // --- Submarine model (simple) ---
        const subGroup = new THREE.Group();
        
        // Hull
        const hullGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 8);
        const hullMat = new THREE.MeshStandardMaterial({ color: 0xcc6600 });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.rotation.x = Math.PI/2;
        hull.position.y = 0;
        subGroup.add(hull);
        
        // Conning tower
        const towerGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.0, 6);
        const towerMat = new THREE.MeshStandardMaterial({ color: 0xaa5533 });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = 0.8;
        tower.position.z = 0.2;
        subGroup.add(tower);
        
        // Light
        const lightGeo = new THREE.SphereGeometry(0.2);
        const lightMat = new THREE.MeshStandardMaterial({ color: 0xffdd99, emissive: 0x442200 });
        const light = new THREE.Mesh(lightGeo, lightMat);
        light.position.z = 1.5;
        subGroup.add(light);
        
        subGroup.position.set(0, 0, 0);
        scene.add(subGroup);
        
        // Sub label
        const subDiv = document.createElement('div');
        subDiv.textContent = '🚤 ALVIN-2';
        subDiv.style.background = '#332211';
        subDiv.style.color = '#ffaa66';
        subDiv.style.border = '2px solid #cc6600';
        subDiv.style.borderRadius = '20px';
        subDiv.style.padding = '2px 12px';
        const subLabel = new CSS2DObject(subDiv);
        subLabel.position.set(0, 2.0, 0);
        subGroup.add(subLabel);
        
        // --- Animate ---
        let time = 0;
        
        function animate() {
            requestAnimationFrame(animate);
            
            time += 0.01;
            
            // Float submarine gently
            subGroup.position.y = Math.sin(time * 0.5) * 0.2;
            subGroup.rotation.z = Math.sin(time * 0.3) * 0.05;
            subGroup.rotation.x = Math.sin(time * 0.4) * 0.03;
            
            // Rotate particles
            particles.rotation.y += 0.0002;
            
            // Animate smoke
            const positions = smoke.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i+=3) {
                positions[i] += 0.02; // rise
                if (positions[i] > 4) positions[i] = 0;
            }
            smoke.geometry.attributes.position.needsUpdate = true;
            
            // Update depth display
            const depth = 3820 + Math.sin(time) * 20;
            document.getElementById('depth-display').innerText = Math.floor(depth);
            document.getElementById('pressure-display').innerText = Math.floor(depth * 0.1013);
            document.getElementById('temp-display').innerText = (2.4 + Math.sin(time*0.3)*0.2).toFixed(1);
            
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