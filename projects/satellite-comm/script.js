        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
        
        // --- Scene setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x04061a);
        
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(12, 4, 16);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
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
        controls.autoRotateSpeed = 0.5;
        controls.maxDistance = 30;
        controls.minDistance = 8;
        
        // --- Lighting ---
        const ambient = new THREE.AmbientLight(0x404068);
        scene.add(ambient);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 15, 10);
        scene.add(dirLight);
        
        const backLight = new THREE.DirectionalLight(0x4466aa, 0.5);
        backLight.position.set(-10, -5, -10);
        scene.add(backLight);
        
        // --- Stars ---
        const starsGeo = new THREE.BufferGeometry();
        const starsCount = 3000;
        const starsPos = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount*3; i+=3) {
            const r = 80 + Math.random()*50;
            const theta = Math.random() * Math.PI*2;
            const phi = Math.acos(2*Math.random()-1);
            starsPos[i] = Math.sin(phi)*Math.cos(theta)*r;
            starsPos[i+1] = Math.sin(phi)*Math.sin(theta)*r;
            starsPos[i+2] = Math.cos(phi)*r;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        const starsMat = new THREE.PointsMaterial({color: 0xffffff, size: 0.2});
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);
        
        // --- Earth sphere ---
        const texLoader = new THREE.TextureLoader();
        const earthMap = texLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const earthSpec = texLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
        const earthNorm = texLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
        const cloudMap = texLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
        
        const earthGeo = new THREE.SphereGeometry(5, 80, 80);
        const earthMat = new THREE.MeshPhongMaterial({ map: earthMap, specularMap: earthSpec, specular: 0x333333, normalMap: earthNorm });
        const earth = new THREE.Mesh(earthGeo, earthMat);
        earth.rotation.y = 4.5;
        scene.add(earth);
        
        const cloudGeo = new THREE.SphereGeometry(5.03, 80, 80);
        const cloudMat = new THREE.MeshPhongMaterial({ map: cloudMap, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
        const clouds = new THREE.Mesh(cloudGeo, cloudMat);
        clouds.rotation.y = 4.5;
        scene.add(clouds);
        
        // --- Atmosphere glow ---
        const atmosGeo = new THREE.SphereGeometry(5.15, 64, 64);
        const atmosMat = new THREE.MeshPhongMaterial({ color: 0x3377cc, transparent: true, opacity: 0.1, side: THREE.BackSide });
        const atmos = new THREE.Mesh(atmosGeo, atmosMat);
        scene.add(atmos);
        
        // --- Ground station data (name, lat, lon, color) ---
        const stations = [
            { name: 'NAIROBI', lat: -1.28, lon: 36.82, color: '#ff4d4d', id: 0 },
            { name: 'SANTIAGO', lat: -33.45, lon: -70.67, color: '#ffaa33', id: 1 },
            { name: 'PERTH', lat: -31.95, lon: 115.86, color: '#33ccff', id: 2 },
            { name: 'TOKYO', lat: 35.68, lon: 139.76, color: '#d4af37', id: 3 },
            { name: 'LONDON', lat: 51.51, lon: -0.13, color: '#88cc88', id: 4 },
            { name: 'CAPE CANAVERAL', lat: 28.39, lon: -80.60, color: '#c07a5b', id: 5 }
        ];
        
        // Store station objects and their labels/dots
        const stationMeshes = [];
        const stationPositions = [];
        
        // Function to convert lat/lon to Vector3 (radius 5.1 to be slightly above surface)
        function latLonToPos(lat, lon, r = 5.15) {
            const phi = (90 - lat) * Math.PI/180;
            const theta = lon * Math.PI/180;
            return new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.cos(phi),
                r * Math.sin(phi) * Math.sin(theta)
            );
        }
        
        // Create station markers (glowing dots + CSS2D labels)
        stations.forEach(s => {
            const pos = latLonToPos(s.lat, s.lon, 5.15);
            stationPositions.push(pos.clone().normalize().multiplyScalar(5.15));
            
            // Glowing dot
            const dotGeo = new THREE.SphereGeometry(0.12, 16);
            const dotMat = new THREE.MeshStandardMaterial({ color: s.color, emissive: s.color, emissiveIntensity: 0.8 });
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.copy(pos);
            scene.add(dot);
            stationMeshes.push(dot);
            
            // CSS label
            const div = document.createElement('div');
            div.textContent = s.name;
            div.style.color = 'white';
            div.style.background = `rgba(20,20,40,0.8)`;
            div.style.border = `2px solid ${s.color}`;
            div.style.borderRadius = '30px';
            div.style.padding = '4px 16px';
            div.style.fontSize = '14px';
            div.style.fontWeight = '600';
            div.style.backdropFilter = 'blur(4px)';
            div.style.boxShadow = `0 0 20px ${s.color}`;
            div.style.whiteSpace = 'nowrap';
            
            const label = new CSS2DObject(div);
            label.position.copy(pos.clone().multiplyScalar(1.02)); // slightly outward
            scene.add(label);
        });
        
        // --- Satellite (with beams) ---
        const satGroup = new THREE.Group();
        
        // Main body
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, emissive: 0x335577 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = Math.PI/2;
        satGroup.add(body);
        
        // Solar panels
        const panelGeo = new THREE.BoxGeometry(1.2, 0.1, 0.4);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x222233, emissive: 0x111122 });
        const panelLeft = new THREE.Mesh(panelGeo, panelMat);
        panelLeft.position.set(-1.0, 0, 0);
        satGroup.add(panelLeft);
        
        const panelRight = new THREE.Mesh(panelGeo, panelMat);
        panelRight.position.set(1.0, 0, 0);
        satGroup.add(panelRight);
        
        // Antenna
        const antennaGeo = new THREE.SphereGeometry(0.2);
        const antennaMat = new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0x552200 });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(0, 0.3, 0.5);
        satGroup.add(antenna);
        
        scene.add(satGroup);
        
        // Satellite CSS label
        const satDiv = document.createElement('div');
        satDiv.textContent = '🛰️ GSAT-19';
        satDiv.style.background = '#1f2a44';
        satDiv.style.color = '#ffcc88';
        satDiv.style.border = '2px solid #ffaa33';
        satDiv.style.borderRadius = '30px';
        satDiv.style.padding = '2px 18px';
        satDiv.style.fontWeight = 'bold';
        satDiv.style.fontSize = '15px';
        satDiv.style.boxShadow = '0 0 30px #ffaa33';
        const satLabel = new CSS2DObject(satDiv);
        satLabel.position.set(0, 1.2, 0);
        satGroup.add(satLabel);
        
        // --- Data links (lines from satellite to active stations) ---
        const linkLines = [];
        const linkCount = 3; // we will manage 3 active links
        
        for (let i = 0; i < 3; i++) {
            const geo = new THREE.BufferGeometry();
            const mat = new THREE.LineBasicMaterial({ color: 0x33ccff, transparent: true, opacity: 0.5 });
            const line = new THREE.Line(geo, mat);
            scene.add(line);
            linkLines.push(line);
        }
        
        // --- Additional "beam" cones for active stations (effect) ---
        const beamCones = [];
        for (let i = 0; i < 3; i++) {
            const coneGeo = new THREE.ConeGeometry(0.25, 1.2, 8);
            const coneMat = new THREE.MeshStandardMaterial({ color: 0x44aaff, emissive: 0x224488, transparent: true, opacity: 0.3 });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.visible = false;
            scene.add(cone);
            beamCones.push(cone);
        }
        
        // --- Satellite orbit parameters ---
        let orbitTime = 0;
        const speed = 0.005;
        const satRadius = 6.2; // altitude ~1.2 above earth
        const inclination = 0.4;
        const nodeLong = 2.1;
        
        // Track active stations (randomly selected)
        let activeIndices = [0, 1, 2]; // Nairobi, Santiago, Perth initially
        
        // Update HTML links
        function updateCommLinksUI() {
            const container = document.getElementById('comm-links-container');
            container.innerHTML = '';
            const active = activeIndices.map(i => stations[i]);
            const allStations = [...stations];
            
            // Show 3 active, then 2 idle
            active.forEach(s => {
                const div = document.createElement('div');
                div.className = 'comm-link active';
                div.style.borderLeftColor = '#2ecc71';
                div.innerHTML = `<span>🔴 ${s.name}</span> <span style="flex:1; text-align:right; font-family: monospace;">⬆️ ${(Math.random()*2+1.5).toFixed(1)} Gbps</span>`;
                container.appendChild(div);
            });
            
            // Add two idle (next in line)
            const idleStations = stations.filter(s => !activeIndices.includes(s.id)).slice(0,2);
            idleStations.forEach(s => {
                const div = document.createElement('div');
                div.className = 'comm-link idle';
                div.style.borderLeftColor = '#7f8c8d';
                const mins = Math.floor(Math.random()*15+3);
                div.innerHTML = `<span>⚪ ${s.name}</span> <span style="flex:1; text-align:right;">(next pass ${mins}m)</span>`;
                container.appendChild(div);
            });
            
            document.getElementById('active-links').innerText = active.length;
            document.getElementById('latency').innerText = Math.floor(Math.random()*30+105);
        }
        updateCommLinksUI();
        
        // Change active stations every few seconds (simulate handover)
        setInterval(() => {
            // rotate active stations
            activeIndices = [(activeIndices[0]+1)%stations.length, (activeIndices[1]+2)%stations.length, (activeIndices[2]+3)%stations.length];
            // ensure unique (simplistic)
            activeIndices = [...new Set(activeIndices)].slice(0,3);
            while(activeIndices.length < 3) {
                activeIndices.push((activeIndices.length+4)%stations.length);
            }
            updateCommLinksUI();
        }, 8000);
        
        // --- Animation loop ---
        function animate() {
            requestAnimationFrame(animate);
            
            orbitTime += speed;
            
            // Satellite position in inclined orbit
            const satX = satRadius * Math.cos(orbitTime);
            const satY = satRadius * Math.sin(orbitTime) * Math.sin(inclination);
            const satZ = satRadius * Math.sin(orbitTime) * Math.cos(inclination);
            
            // Rotate node
            const rotMatrix = new THREE.Matrix4().makeRotationY(nodeLong);
            const satPos = new THREE.Vector3(satX, satY, satZ).applyMatrix4(rotMatrix);
            satGroup.position.copy(satPos);
            
            // Point satellite's antenna toward earth (approx)
            satGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), satPos.clone().normalize().negate());
            
            // Update link lines and beams to active stations
            const activePositions = activeIndices.map(idx => stationPositions[idx]);
            
            // Sort by distance to satellite (just for visual interest)
            const sorted = activePositions.map((pos, i) => ({ pos, dist: satPos.distanceTo(pos), idx: activeIndices[i] }))
                                .sort((a,b) => a.dist - b.dist);
            
            for (let i = 0; i < linkLines.length; i++) {
                if (i < sorted.length) {
                    const points = [satPos, sorted[i].pos];
                    const geo = new THREE.BufferGeometry().setFromPoints(points);
                    linkLines[i].geometry.dispose();
                    linkLines[i].geometry = geo;
                    linkLines[i].visible = true;
                    // color based on station
                    const station = stations.find(s => s.id === sorted[i].idx);
                    if (station) {
                        linkLines[i].material.color.setHex(new THREE.Color(station.color).getHex());
                        linkLines[i].material.opacity = 0.7;
                    }
                    
                    // Update beam cone
                    if (i < beamCones.length) {
                        beamCones[i].visible = true;
                        // Position cone at station, pointing to satellite
                        const dir = satPos.clone().sub(sorted[i].pos).normalize();
                        const conePos = sorted[i].pos.clone().add(dir.clone().multiplyScalar(0.6)); // midpoint-ish
                        beamCones[i].position.copy(conePos);
                        
                        const quat = new THREE.Quaternion();
                        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
                        beamCones[i].quaternion.copy(quat);
                        
                        // scale a bit with distance
                        const dist = satPos.distanceTo(sorted[i].pos);
                        beamCones[i].scale.set(1, dist * 0.8, 1);
                    }
                } else {
                    linkLines[i].visible = false;
                    if (i < beamCones.length) beamCones[i].visible = false;
                }
            }
            
            // Rotate clouds slowly
            clouds.rotation.y += 0.0002;
            
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        }
        
        animate();
        
        // --- Resize ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });