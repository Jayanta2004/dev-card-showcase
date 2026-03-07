const canvas = document.getElementById('scene');
        const ctx = canvas.getContext('2d');

        let width, height;
        let particles = [];
        let loadedImages = []; 

        const settings = {
            bgColor: '#ffffff',
            minWind: 1.5,
            maxWind: 18,
            minSize: 16,
            maxSize: 57,
            emitterY: 0.4,       
            emitterSpread: 0.35, 
            gravity: 0.6,
            turbulence: 0.8,
            rotationSpeed: 0,    
            tumbleStrength: 0.4, 
            staticTilt: 0, 
            particleCount: 100
        };

        function createDefaultImage() {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 128; 
            tempCanvas.height = 128;
            const tCtx = tempCanvas.getContext('2d');
            tCtx.scale(2, 2);
            tCtx.beginPath();
            tCtx.moveTo(32, 5);
            tCtx.quadraticCurveTo(5, 32, 32, 59);
            tCtx.quadraticCurveTo(59, 32, 32, 5);
            tCtx.fillStyle = '#e67e22';
            tCtx.fill();
            tCtx.strokeStyle = '#d35400';
            tCtx.lineWidth = 2;
            tCtx.stroke();
            tCtx.beginPath();
            tCtx.moveTo(32, 5);
            tCtx.lineTo(32, 59);
            tCtx.stroke();
            const img = new Image();
            img.src = tempCanvas.toDataURL();
            return img;
        }
        loadedImages.push(createDefaultImage());

        function rotateVector(x, y, z, ax, ay, az) {
            let cos = Math.cos(az);
            let sin = Math.sin(az);
            let x1 = x * cos - y * sin;
            let y1 = x * sin + y * cos;
            let z1 = z;

            cos = Math.cos(ay);
            sin = Math.sin(ay);
            let x2 = x1 * cos + z1 * sin;
            let y2 = y1;
            let z2 = -x1 * sin + z1 * cos;

            cos = Math.cos(ax);
            sin = Math.sin(ax);
            let x3 = x2;
            let y3 = y2 * cos - z2 * sin;
            let z3 = y2 * sin + z2 * cos;

            return { x: x3, y: y3, z: z3 };
        }

        class Particle {
            constructor(initOnScreen = false) {
                this.reset(initOnScreen);
            }

            reset(initOnScreen = false) {
                this.image = loadedImages[Math.floor(Math.random() * loadedImages.length)];
                
                const minS = Math.min(settings.minSize, settings.maxSize);
                const maxS = Math.max(settings.minSize, settings.maxSize);
                this.width = minS + Math.random() * (maxS - minS);
                
                if (this.image.width && this.image.height) {
                    this.height = this.width * (this.image.height / this.image.width);
                } else {
                    this.height = this.width;
                }

                const centerY = height * settings.emitterY;
                const spreadHeight = height * settings.emitterSpread;
                const minY = centerY - (spreadHeight / 2);
                const maxY = centerY + (spreadHeight / 2);
                
                this.y = minY + Math.random() * (maxY - minY);
                this.x = initOnScreen ? Math.random() * width : -this.width - (Math.random() * 200);

                this.windFactor = Math.random(); 
                const sizeFactor = (this.width - minS) / (maxS - minS || 1);
                this.windFactor = 1.0 - (sizeFactor * 0.5 + Math.random() * 0.5); 
                this.windFactor = Math.max(0.1, Math.min(1, this.windFactor));

                this.vx = 0; 
                this.vy = 0; 
                this.waveOffset = Math.random() * Math.PI * 2;
                
                this.angleZ = Math.random() * 360; 
                this.spinZ = (Math.random() - 0.5) * settings.rotationSpeed;

                // --- CHANGED: Initialize at 0 for flat control ---
                this.angleX = 0; 
                this.angleY = 0;
                
                this.spinX = (Math.random() - 0.5) * 0.1;
                this.spinY = (Math.random() - 0.5) * 0.1;
            }

            update() {
                const realMin = Math.min(settings.minWind, settings.maxWind);
                const realMax = Math.max(settings.minWind, settings.maxWind);
                const targetSpeed = realMin + (realMax - realMin) * this.windFactor;

                this.vx += (targetSpeed - this.vx) * 0.1;
                this.x += this.vx;

                const gravityMod = 1.5 - this.windFactor; 
                this.vy += settings.gravity * 0.05 * gravityMod;
                
                const wave = Math.sin(this.x * 0.01 + this.waveOffset);
                this.vy += wave * (settings.turbulence * 0.05);
                this.vy *= 0.98; 
                this.y += this.vy;

                this.angleZ += this.spinZ + (this.vx * 0.002);
                
                if (settings.tumbleStrength > 0) {
                    this.angleX += this.spinX * settings.tumbleStrength;
                    this.angleY += this.spinY * settings.tumbleStrength;
                }

                const buffer = 200;
                if (this.x > width + buffer || this.y > height + buffer || this.y < -buffer) {
                    this.reset(false);
                }
            }

            draw() {
                if (!this.image) return;
                
                // Convert Static Tilt to Radians
                const tiltRad = (settings.staticTilt * Math.PI) / 180;

                // 3D Matrix Projection
                const radZ = this.angleZ; 
                // Add static tilt to the Y angle (Horizontal rotation)
                const vecU = rotateVector(1, 0, 0, this.angleX, this.angleY + tiltRad, radZ);
                const vecV = rotateVector(0, 1, 0, this.angleX, this.angleY + tiltRad, radZ);
                
                ctx.save();
                ctx.translate(this.x, this.y);

                ctx.transform(vecU.x, vecU.y, vecV.x, vecV.y, 0, 0);
                
                ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);

                ctx.restore();
            }
        }

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
        }

        function initParticles() {
            particles = [];
            for(let i=0; i<settings.particleCount; i++){
                particles.push(new Particle(true));
            }
        }

        function animate() {
            ctx.fillStyle = settings.bgColor;
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            requestAnimationFrame(animate);
        }

        function adjustParticleCount() {
            const diff = settings.particleCount - particles.length;
            if (diff > 0) {
                for(let i=0; i<diff; i++) particles.push(new Particle(true));
            } else {
                particles.splice(0, Math.abs(diff));
            }
        }

        // --- UI Logic ---
        const controlsPanel = document.getElementById('controls');
        const hideBtn = document.getElementById('hide-btn');
        const showBtn = document.getElementById('show-btn');

        hideBtn.addEventListener('click', () => {
            controlsPanel.classList.add('hidden');
            showBtn.style.display = 'flex';
        });

        showBtn.addEventListener('click', () => {
            controlsPanel.classList.remove('hidden');
            showBtn.style.display = 'none';
        });

        window.addEventListener('resize', resize);
        
        const uiMap = [
            { id: 'bgColor', prop: 'bgColor', type: 'color' },
            { id: 'minWind', prop: 'minWind', type: 'float', elId: 'val-minWind' },
            { id: 'maxWind', prop: 'maxWind', type: 'float', elId: 'val-maxWind' },
            { id: 'minSize', prop: 'minSize', type: 'float', elId: 'val-minSize', suffix: 'px' }, 
            { id: 'maxSize', prop: 'maxSize', type: 'float', elId: 'val-maxSize', suffix: 'px' },
            { id: 'emitterY', prop: 'emitterY', type: 'pct', elId: 'val-emitY' },
            { id: 'emitterSpread', prop: 'emitterSpread', type: 'pct', elId: 'val-spread' },
            { id: 'gravity', prop: 'gravity', type: 'float', elId: 'val-gravity' },
            { id: 'turbulence', prop: 'turbulence', type: 'float', elId: 'val-turb' },
            { id: 'particleCount', prop: 'particleCount', type: 'int', elId: 'val-count', action: adjustParticleCount },
            { id: 'rotationSpeed', prop: 'rotationSpeed', type: 'float', elId: 'val-rot', action: () => particles.forEach(p => p.spinZ = (Math.random()-0.5)*settings.rotationSpeed) },
            { id: 'tumbleStrength', prop: 'tumbleStrength', type: 'float', elId: 'val-3d' },
            { id: 'staticTilt', prop: 'staticTilt', type: 'int', elId: 'val-tilt', suffix: '°' } // NEW MAPPING
        ];

        uiMap.forEach(conf => {
            const el = document.getElementById(conf.id);
            el.addEventListener('input', e => {
                let val = e.target.value;
                if(conf.type === 'int') val = parseInt(val);
                else if(conf.type === 'float') val = parseFloat(val);
                else if(conf.type === 'pct') val = parseInt(val) / 100;

                settings[conf.prop] = val;

                if(conf.elId) {
                    const displayVal = conf.type === 'pct' ? Math.round(val*100) + '%' : (conf.suffix ? val + conf.suffix : val);
                    document.getElementById(conf.elId).innerText = displayVal;
                }
                if(conf.action) conf.action();
            });
        });

        document.getElementById('fileInput').addEventListener('change', e => {
            const files = e.target.files;
            if (files && files.length > 0) {
                const newImgs = [];
                let loaded = 0;
                for (let i = 0; i < files.length; i++) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        const img = new Image();
                        img.onload = () => {
                            loaded++;
                        };
                        img.src = evt.target.result;
                        newImgs.push(img);
                        if (i === files.length - 1) {
                            setTimeout(() => {
                                loadedImages = newImgs;
                                particles.forEach(p => p.reset(true));
                            }, 200);
                        }
                    };
                    reader.readAsDataURL(files[i]);
                }
            }
        });

        resize(); 
        initParticles();
        animate();