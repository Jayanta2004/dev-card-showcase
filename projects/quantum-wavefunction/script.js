        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  QUANTUM WAVEFUNCTION
        //  concept: visualize the probability density of a quantum particle
        //  in a 2D potential well. the wavefunction evolves according to
        //  the time-dependent Schrödinger equation (simplified). particles
        //  appear where probability is high, creating a dynamic cloud.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- setup scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x070314);
        scene.fog = new THREE.FogExp2(0x070314, 0.006);

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
        controls.autoRotateSpeed = 0.3;
        controls.enableZoom = true;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.target.set(0, 0, 0);

        // --- lighting ---
        const ambient = new THREE.AmbientLight(0x40406b);
        scene.add(ambient);

        const light1 = new THREE.PointLight(0x6f9fff, 1.2, 60);
        light1.position.set(10, 15, 15);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff6f9f, 0.9, 60);
        light2.position.set(-10, 10, 20);
        scene.add(light2);

        // stars
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 150 + Math.random() * 150;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            starPos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r;
            starPos[i*3+2] = Math.cos(phi) * r;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0x99aaff, size: 0.22, transparent: true, blending: THREE.AdditiveBlending });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- quantum grid parameters ---
        const gridWidth = 64;
        const gridHeight = 64;
        const spacing = 0.4;
        const totalCells = gridWidth * gridHeight;
        
        // wavefunction (real and imaginary parts)
        const psiReal = new Float32Array(totalCells);
        const psiImag = new Float32Array(totalCells);
        
        // probability density |ψ|²
        const prob = new Float32Array(totalCells);
        
        // potential V(x,y) - default harmonic oscillator
        const potential = new Float32Array(totalCells);
        
        // initialize wavefunction as Gaussian wavepacket
        const centerX = gridWidth / 2;
        const centerY = gridHeight / 2;
        const width = 8.0;
        
        for (let i = 0; i < gridWidth; i++) {
            for (let j = 0; j < gridHeight; j++) {
                const idx = i * gridHeight + j;
                const dx = (i - centerX) * spacing;
                const dy = (j - centerY) * spacing;
                
                // Gaussian wavepacket with initial momentum
                const r2 = (dx*dx + dy*dy) / (width*width);
                const amplitude = Math.exp(-r2);
                const phase = dx * 1.5; // initial momentum in x direction
                
                psiReal[idx] = amplitude * Math.cos(phase);
                psiImag[idx] = amplitude * Math.sin(phase);
                
                // harmonic oscillator potential
                potential[idx] = 0.5 * (dx*dx + dy*dy) * 0.3;
            }
        }

        // particle system to visualize probability density
        const particleCount = 4096;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);
        
        // create particles initially randomly distributed according to prob
        function resampleParticles() {
            // compute probability
            let maxProb = 0;
            for (let i = 0; i < totalCells; i++) {
                prob[i] = psiReal[i]*psiReal[i] + psiImag[i]*psiImag[i];
                if (prob[i] > maxProb) maxProb = prob[i];
            }
            
            // normalize and sample
            const cumulative = [];
            let sum = 0;
            for (let i = 0; i < totalCells; i++) {
                prob[i] /= maxProb; // normalize to 0-1
                sum += prob[i];
                cumulative[i] = sum;
            }
            
            for (let p = 0; p < particleCount; p++) {
                // random sample from cumulative distribution
                const r = Math.random() * sum;
                let idx = 0;
                while (idx < totalCells - 1 && cumulative[idx] < r) idx++;
                
                const i = Math.floor(idx / gridHeight);
                const j = idx % gridHeight;
                
                // add small random offset within cell
                const x = (i - gridWidth/2) * spacing + (Math.random() - 0.5) * spacing * 0.8;
                const y = (j - gridHeight/2) * spacing + (Math.random() - 0.5) * spacing * 0.8;
                const z = 0;
                
                particlePositions[p*3] = x;
                particlePositions[p*3+1] = y;
                particlePositions[p*3+2] = z;
                
                // color based on local phase or probability
                const hue = 0.6 + prob[idx] * 0.3;
                const col = new THREE.Color().setHSL(hue, 0.9, 0.6);
                particleColors[p*3] = col.r;
                particleColors[p*3+1] = col.g;
                particleColors[p*3+2] = col.b;
            }
        }
        
        resampleParticles();

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
        
        const particleMat = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });
        
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // add a faint grid to represent potential
        const gridHelper = new THREE.GridHelper(30, 30, 0x4466aa, 0x224466);
        gridHelper.position.y = -2;
        scene.add(gridHelper);

        // --- quantum evolution (simplified Schrödinger) ---
        function evolveWavefunction(dt) {
            // very simplified: phase rotation based on potential and laplacian
            // (not physically accurate but creates nice visual patterns)
            const newReal = new Float32Array(totalCells);
            const newImag = new Float32Array(totalCells);
            
            const D = 0.1; // diffusion coefficient
            
            for (let i = 1; i < gridWidth-1; i++) {
                for (let j = 1; j < gridHeight-1; j++) {
                    const idx = i * gridHeight + j;
                    
                    // discrete laplacian
                    const lapReal = 
                        psiReal[(i-1)*gridHeight + j] + psiReal[(i+1)*gridHeight + j] +
                        psiReal[i*gridHeight + j-1] + psiReal[i*gridHeight + j+1] -
                        4 * psiReal[idx];
                    
                    const lapImag = 
                        psiImag[(i-1)*gridHeight + j] + psiImag[(i+1)*gridHeight + j] +
                        psiImag[i*gridHeight + j-1] + psiImag[i*gridHeight + j+1] -
                        4 * psiImag[idx];
                    
                    // kinetic term (laplacian) + potential
                    const kineticReal = D * lapImag;
                    const kineticImag = -D * lapReal;
                    
                    const potentialTermReal = -potential[idx] * psiImag[idx];
                    const potentialTermImag = potential[idx] * psiReal[idx];
                    
                    newReal[idx] = psiReal[idx] + dt * (kineticReal + potentialTermReal);
                    newImag[idx] = psiImag[idx] + dt * (kineticImag + potentialTermImag);
                    
                    // simple boundary condition: zero at edges
                    if (i === 0 || i === gridWidth-1 || j === 0 || j === gridHeight-1) {
                        newReal[idx] = 0;
                        newImag[idx] = 0;
                    }
                }
            }
            
            // copy back
            for (let i = 0; i < totalCells; i++) {
                psiReal[i] = newReal[i];
                psiImag[i] = newImag[i];
            }
            
            // renormalize (simple)
            let norm = 0;
            for (let i = 0; i < totalCells; i++) {
                norm += psiReal[i]*psiReal[i] + psiImag[i]*psiImag[i];
            }
            norm = Math.sqrt(norm / totalCells);
            for (let i = 0; i < totalCells; i++) {
                psiReal[i] /= norm;
                psiImag[i] /= norm;
            }
        }

        // UI
        let potentialType = 0; // 0: harmonic, 1: infinite well
        document.getElementById('collapse').addEventListener('click', () => {
            // simulate measurement: randomly collapse to a position
            resampleParticles();
            
            // also reset wavefunction to a narrow Gaussian around a random point
            const collapseX = Math.floor(Math.random() * gridWidth);
            const collapseY = Math.floor(Math.random() * gridHeight);
            
            for (let i = 0; i < gridWidth; i++) {
                for (let j = 0; j < gridHeight; j++) {
                    const idx = i * gridHeight + j;
                    const dx = (i - collapseX) * spacing;
                    const dy = (j - collapseY) * spacing;
                    const r2 = (dx*dx + dy*dy) / 2.0;
                    const amplitude = Math.exp(-r2);
                    
                    psiReal[idx] = amplitude;
                    psiImag[idx] = 0;
                }
            }
            
            // renormalize
            let norm = 0;
            for (let i = 0; i < totalCells; i++) {
                norm += psiReal[i]*psiReal[i];
            }
            norm = Math.sqrt(norm / totalCells);
            for (let i = 0; i < totalCells; i++) {
                psiReal[i] /= norm;
            }
        });
        
        document.getElementById('potential').addEventListener('click', () => {
            potentialType = (potentialType + 1) % 2;
            document.getElementById('potential').innerHTML = potentialType === 0 ? '⬡ harmonic' : '⬡ infinite well';
            
            // reset potential
            for (let i = 0; i < gridWidth; i++) {
                for (let j = 0; j < gridHeight; j++) {
                    const idx = i * gridHeight + j;
                    const dx = (i - gridWidth/2) * spacing;
                    const dy = (j - gridHeight/2) * spacing;
                    
                    if (potentialType === 0) {
                        // harmonic oscillator
                        potential[idx] = 0.5 * (dx*dx + dy*dy) * 0.3;
                    } else {
                        // infinite square well (zero inside, high at edges)
                        potential[idx] = 0;
                        if (i < 5 || i > gridWidth-5 || j < 5 || j > gridHeight-5) {
                            potential[idx] = 10;
                        }
                    }
                }
            }
        });

        // --- animation loop ---
        const clock = new THREE.Clock();
        const probEl = document.getElementById('prob-val');

        function animate() {
            const delta = clock.getDelta();
            
            // evolve wavefunction
            evolveWavefunction(0.05);
            
            // update particle positions based on new probability
            // (simplified: move particles slowly toward high probability regions)
            const posAttr = particles.geometry.attributes.position;
            const posArray = posAttr.array;
            
            // compute current probability
            let maxProb = 0;
            for (let i = 0; i < totalCells; i++) {
                prob[i] = psiReal[i]*psiReal[i] + psiImag[i]*psiImag[i];
                if (prob[i] > maxProb) maxProb = prob[i];
            }
            
            // move particles
            for (let p = 0; p < particleCount; p++) {
                // find nearest grid cell
                const px = posArray[p*3];
                const py = posArray[p*3+1];
                
                const i = Math.floor(px / spacing + gridWidth/2);
                const j = Math.floor(py / spacing + gridHeight/2);
                
                if (i >= 0 && i < gridWidth && j >= 0 && j < gridHeight) {
                    const idx = i * gridHeight + j;
                    const targetProb = prob[idx] / maxProb;
                    
                    // drift toward higher probability
                    if (Math.random() < targetProb * 0.1) {
                        // small random step
                        posArray[p*3] += (Math.random() - 0.5) * spacing * 0.3;
                        posArray[p*3+1] += (Math.random() - 0.5) * spacing * 0.3;
                    }
                }
            }
            
            posAttr.needsUpdate = true;
            
            // update probability display
            let avgProb = 0;
            for (let i = 0; i < 100; i++) avgProb += prob[i * 100];
            probEl.textContent = (avgProb / 100).toFixed(2);
            
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