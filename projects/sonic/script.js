        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  SONIC WEAVE
        //  concept: a 2D grid of threads (warp and weft) that is deformed by
        //  real-time audio input. each thread responds to different frequency
        //  bands, creating a woven tapestry that dances to sound.
        //  uses microphone with fallback oscillator.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- setup scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0715);
        scene.fog = new THREE.FogExp2(0x0a0715, 0.008);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(25, 15, 30);
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

        const light1 = new THREE.PointLight(0x9f7aff, 1.4, 60);
        light1.position.set(10, 15, 15);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff9f7a, 1.0, 60);
        light2.position.set(-10, 10, 20);
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
        const starMat = new THREE.PointsMaterial({ color: 0xaa99ee, size: 0.22, transparent: true, blending: THREE.AdditiveBlending });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- weave parameters ---
        const gridSize = 64; // 64x64 grid of points
        const spacing = 0.8;
        const totalPoints = gridSize * gridSize;
        
        // create a grid of points (warp and weft will be lines through these points)
        const points = [];
        const baseY = 0;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = (i - gridSize/2) * spacing;
                const z = (j - gridSize/2) * spacing;
                points.push(new THREE.Vector3(x, baseY, z));
            }
        }

        // create warp threads (along i, constant j)
        const warpLines = [];
        const warpMaterial = new THREE.LineBasicMaterial({ color: 0xaa88ff, transparent: true, opacity: 0.25 });
        
        for (let j = 0; j < gridSize; j++) {
            const linePoints = [];
            for (let i = 0; i < gridSize; i++) {
                const idx = i * gridSize + j;
                linePoints.push(points[idx].clone());
            }
            const geo = new THREE.BufferGeometry().setFromPoints(linePoints);
            const line = new THREE.Line(geo, warpMaterial);
            scene.add(line);
            warpLines.push(line);
        }

        // create weft threads (along j, constant i)
        const weftLines = [];
        const weftMaterial = new THREE.LineBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.25 });
        
        for (let i = 0; i < gridSize; i++) {
            const linePoints = [];
            for (let j = 0; j < gridSize; j++) {
                const idx = i * gridSize + j;
                linePoints.push(points[idx].clone());
            }
            const geo = new THREE.BufferGeometry().setFromPoints(linePoints);
            const line = new THREE.Line(geo, weftMaterial);
            scene.add(line);
            weftLines.push(line);
        }

        // add glowing nodes at intersections
        const nodeGeo = new THREE.BufferGeometry();
        const nodePositions = new Float32Array(totalPoints * 3);
        for (let i = 0; i < totalPoints; i++) {
            nodePositions[i*3] = points[i].x;
            nodePositions[i*3+1] = points[i].y;
            nodePositions[i*3+2] = points[i].z;
        }
        nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
        const nodeMat = new THREE.PointsMaterial({ color: 0xffccaa, size: 0.12, transparent: true, blending: THREE.AdditiveBlending });
        const nodes = new THREE.Points(nodeGeo, nodeMat);
        scene.add(nodes);

        // --- audio setup ---
        let audioContext = null;
        let analyser = null;
        let source = null;
        let isAudioReady = false;
        let audioData = null;
        let mode = 0; // 0: warp, 1: weft, 2: both
        
        const modeNames = ["warp", "weft", "both"];
        const modeBtn = document.getElementById('weave-mode');
        modeBtn.addEventListener('click', () => {
            mode = (mode + 1) % 3;
            modeBtn.innerHTML = `𓋴 mode: ${modeNames[mode]}`;
        });

        const micBtn = document.getElementById('mic-toggle');
        const warningDiv = document.createElement('div');
        warningDiv.className = 'warning-mic';
        warningDiv.style.display = 'none';
        warningDiv.innerText = '🎤 click to enable microphone';
        document.body.appendChild(warningDiv);

        async function initAudio() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 128;
                analyser.smoothingTimeConstant = 0.7;
                
                source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                
                if (audioContext.state === 'suspended') await audioContext.resume();
                
                isAudioReady = true;
                audioData = new Uint8Array(analyser.frequencyBinCount);
                micBtn.innerHTML = '🎤 mic active';
                warningDiv.style.display = 'none';
            } catch (err) {
                // fallback oscillator
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 128;
                
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = 120;
                gain.gain.value = 0.3;
                osc.connect(gain);
                gain.connect(analyser);
                osc.start();
                
                isAudioReady = true;
                audioData = new Uint8Array(analyser.frequencyBinCount);
                micBtn.innerHTML = '🎤 synth mode';
                warningDiv.style.display = 'none';
            }
        }

        micBtn.addEventListener('click', () => {
            if (!isAudioReady) initAudio();
        });

        setTimeout(() => {
            if (!isAudioReady) warningDiv.style.display = 'block';
        }, 2000);

        // --- animation ---
        const clock = new THREE.Clock();
        const freqEl = document.getElementById('freq-val');

        function animate() {
            const delta = clock.getDelta();
            const elapsed = performance.now() / 1000;

            if (isAudioReady && analyser && audioData) {
                analyser.getByteFrequencyData(audioData);
                
                // get average of different bands
                const lowBand = (audioData[1] + audioData[2] + audioData[3]) / 3 / 255;
                const midBand = (audioData[10] + audioData[11] + audioData[12]) / 3 / 255;
                const highBand = (audioData[20] + audioData[21] + audioData[22]) / 3 / 255;
                
                const avgFreq = (lowBand + midBand + highBand) / 3;
                freqEl.textContent = avgFreq.toFixed(2);

                // update warp lines (vertical threads)
                warpLines.forEach((line, j) => {
                    const positions = line.geometry.attributes.position.array;
                    for (let i = 0; i < gridSize; i++) {
                        const idx = i * gridSize + j;
                        const baseX = (i - gridSize/2) * spacing;
                        const baseZ = (j - gridSize/2) * spacing;
                        
                        // displacement based on frequency bands
                        let offsetY = 0;
                        if (mode === 0 || mode === 2) {
                            offsetY += Math.sin(elapsed * 5 + i * 0.5) * lowBand * 4;
                            offsetY += Math.cos(elapsed * 3 + j * 0.3) * midBand * 3;
                        }
                        if (mode === 1 || mode === 2) {
                            offsetY += Math.sin(elapsed * 4 + j * 0.4) * highBand * 3;
                        }
                        
                        positions[i*3] = baseX;
                        positions[i*3+1] = offsetY;
                        positions[i*3+2] = baseZ;
                    }
                    line.geometry.attributes.position.needsUpdate = true;
                });

                // update weft lines (horizontal threads)
                weftLines.forEach((line, i) => {
                    const positions = line.geometry.attributes.position.array;
                    for (let j = 0; j < gridSize; j++) {
                        const idx = i * gridSize + j;
                        const baseX = (i - gridSize/2) * spacing;
                        const baseZ = (j - gridSize/2) * spacing;
                        
                        let offsetY = 0;
                        if (mode === 0 || mode === 2) {
                            offsetY += Math.sin(elapsed * 4 + i * 0.4) * lowBand * 3;
                            offsetY += Math.cos(elapsed * 6 + j * 0.5) * midBand * 4;
                        }
                        if (mode === 1 || mode === 2) {
                            offsetY += Math.sin(elapsed * 5 + j * 0.3) * highBand * 3;
                        }
                        
                        positions[j*3] = baseX;
                        positions[j*3+1] = offsetY;
                        positions[j*3+2] = baseZ;
                    }
                    line.geometry.attributes.position.needsUpdate = true;
                });

                // update node positions
                const nodePos = nodes.geometry.attributes.position.array;
                for (let i = 0; i < gridSize; i++) {
                    for (let j = 0; j < gridSize; j++) {
                        const idx = i * gridSize + j;
                        const baseX = (i - gridSize/2) * spacing;
                        const baseZ = (j - gridSize/2) * spacing;
                        
                        let offsetY = 0;
                        if (mode === 0 || mode === 2) {
                            offsetY += Math.sin(elapsed * 5 + i * 0.5) * lowBand * 4;
                            offsetY += Math.cos(elapsed * 3 + j * 0.3) * midBand * 3;
                        }
                        if (mode === 1 || mode === 2) {
                            offsetY += Math.sin(elapsed * 4 + j * 0.4) * highBand * 3;
                        }
                        
                        nodePos[idx*3] = baseX;
                        nodePos[idx*3+1] = offsetY;
                        nodePos[idx*3+2] = baseZ;
                    }
                }
                nodes.geometry.attributes.position.needsUpdate = true;
            }

            // rotate stars
            stars.rotation.y += 0.0002;

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();

        // resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // light shifts
        setInterval(() => {
            const t = performance.now() / 2000;
            light1.color.setHSL(0.68 + Math.sin(t)*0.06, 0.8, 0.6);
            light2.color.setHSL(0.92 + Math.cos(t*1.2)*0.05, 0.9, 0.6);
        }, 200);