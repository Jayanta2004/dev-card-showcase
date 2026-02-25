        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- setup scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a18);
        scene.fog = new THREE.FogExp2(0x0a0a18, 0.008);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(22, 12, 28);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.4;
        controls.enableZoom = true;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.target.set(0, 0, 0);

        // --- lighting ---
        const ambient = new THREE.AmbientLight(0x40406b);
        scene.add(ambient);

        const light1 = new THREE.PointLight(0x7f9fff, 1.4, 50);
        light1.position.set(10, 15, 12);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff9f7f, 1.0, 50);
        light2.position.set(-10, 8, 18);
        scene.add(light2);

        // stars
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 120 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            starPos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r;
            starPos[i*3+2] = Math.cos(phi) * r;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xaabbff, size: 0.2, transparent: true, blending: THREE.AdditiveBlending });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- tensegrity parameters ---
        // icosahedron-based tensegrity sphere: 30 struts, 60 cables
        const radius = 8;
        
        // generate vertices of an icosahedron
        const phi = (1 + Math.sqrt(5)) / 2;
        const icosaVertices = [
            new THREE.Vector3(-1,  phi, 0).normalize(),
            new THREE.Vector3( 1,  phi, 0).normalize(),
            new THREE.Vector3(-1, -phi, 0).normalize(),
            new THREE.Vector3( 1, -phi, 0).normalize(),
            new THREE.Vector3(0, -1,  phi).normalize(),
            new THREE.Vector3(0,  1,  phi).normalize(),
            new THREE.Vector3(0, -1, -phi).normalize(),
            new THREE.Vector3(0,  1, -phi).normalize(),
            new THREE.Vector3( phi, 0, -1).normalize(),
            new THREE.Vector3( phi, 0,  1).normalize(),
            new THREE.Vector3(-phi, 0, -1).normalize(),
            new THREE.Vector3(-phi, 0,  1).normalize()
        ].map(v => v.multiplyScalar(radius));

        // struts: pairs of vertices (simplified tensegrity structure)
        const strutPairs = [
            [0, 5], [0, 7], [0, 8], [0, 9], [0, 11],
            [1, 5], [1, 7], [1, 8], [1, 9], [1, 11],
            [2, 4], [2, 6], [2, 8], [2, 9], [2, 10],
            [3, 4], [3, 6], [3, 8], [3, 9], [3, 10],
            [4, 5], [4, 10], [4, 11],
            [5, 6], [5, 7],
            [6, 7], [6, 10], [6, 11],
            [7, 8], [7, 9],
            [8, 10], [8, 11],
            [9, 10], [9, 11],
            [10, 11]
        ];

        // create struts (rigid compression members) - thicker, glowing
        const strutGroup = new THREE.Group();
        const struts = [];
        
        strutPairs.forEach(([a, b]) => {
            const start = icosaVertices[a];
            const end = icosaVertices[b];
            
            // create a cylinder between points
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            
            const cylinderGeo = new THREE.CylinderGeometry(0.2, 0.2, length, 6);
            const cylinderMat = new THREE.MeshStandardMaterial({
                color: 0xffaa88,
                emissive: 0x442200,
                roughness: 0.3,
                metalness: 0.2
            });
            const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
            
            // position at midpoint and orient
            const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            cylinder.position.copy(mid);
            
            cylinder.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.clone().normalize()
            );
            
            strutGroup.add(cylinder);
            struts.push(cylinder);
        });
        scene.add(strutGroup);

        // create cables (tension members) - thinner, transparent
        const cableGroup = new THREE.Group();
        const cables = [];
        
        // generate all edges of the icosahedron (simplified - just for visual)
        const cablePairs = [];
        for (let i = 0; i < icosaVertices.length; i++) {
            for (let j = i+1; j < icosaVertices.length; j++) {
                // add cable if distance is less than threshold (tensegrity connectivity)
                const dist = icosaVertices[i].distanceTo(icosaVertices[j]);
                if (dist < radius * 1.8) {
                    cablePairs.push([i, j]);
                }
            }
        }
        
        cablePairs.forEach(([a, b]) => {
            const start = icosaVertices[a];
            const end = icosaVertices[b];
            
            const points = [start.clone(), end.clone()];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({ 
                color: 0x88aaff,
                transparent: true,
                opacity: 0.3
            });
            const line = new THREE.Line(geo, mat);
            cableGroup.add(line);
            cables.push(line);
        });
        scene.add(cableGroup);

        // add glowing nodes at vertices
        const nodeGeo = new THREE.BufferGeometry();
        const nodePositions = new Float32Array(icosaVertices.length * 3);
        icosaVertices.forEach((v, i) => {
            nodePositions[i*3] = v.x;
            nodePositions[i*3+1] = v.y;
            nodePositions[i*3+2] = v.z;
        });
        nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
        const nodeMat = new THREE.PointsMaterial({ color: 0xffccaa, size: 0.4, transparent: true, blending: THREE.AdditiveBlending });
        const nodes = new THREE.Points(nodeGeo, nodeMat);
        scene.add(nodes);

        // --- dynamics: gentle oscillation ---
        let spinEnabled = true;
        let time = 0;
        
        document.getElementById('perturb').addEventListener('click', () => {
            // add random perturbation to strut positions
            struts.forEach(strut => {
                strut.position.x += (Math.random() - 0.5) * 1.5;
                strut.position.y += (Math.random() - 0.5) * 1.5;
                strut.position.z += (Math.random() - 0.5) * 1.5;
            });
        });
        
        document.getElementById('toggle-spin').addEventListener('click', (e) => {
            spinEnabled = !spinEnabled;
            controls.autoRotate = spinEnabled;
            e.target.innerHTML = spinEnabled ? '◉ spin' : '◉ spin (off)';
        });

        // tension display
        const tensionEl = document.getElementById('tension-val');

        // animation loop
        const clock = new THREE.Clock();

        function animate() {
            const delta = clock.getDelta();
            time += delta;

            // breathe and oscillate
            const pulse = 1 + Math.sin(time * 3) * 0.02;
            const phase = time * 2;
            
            // update strut colors and positions slightly
            struts.forEach((strut, i) => {
                // slight color shift
                const hue = 0.05 + Math.sin(phase + i) * 0.02;
                strut.material.color.setHSL(hue, 0.9, 0.6);
                
                // tiny movement
                strut.rotation.x += Math.sin(phase + i) * 0.001;
                strut.rotation.y += Math.cos(phase + i*2) * 0.001;
            });
            
            // update cable opacity
            cables.forEach((cable, i) => {
                cable.material.opacity = 0.2 + Math.sin(phase + i) * 0.1;
            });
            
            // update tension display
            const tension = (0.7 + Math.sin(time * 2) * 0.2).toFixed(2);
            tensionEl.textContent = tension;

            // rotate stars
            stars.rotation.y += 0.0002;

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();

        // resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // light shifts
        setInterval(() => {
            const t = performance.now() / 2000;
            light1.color.setHSL(0.58 + Math.sin(t)*0.05, 0.8, 0.6);
            light2.color.setHSL(0.92 + Math.cos(t*1.2)*0.05, 0.9, 0.6);
        }, 200);