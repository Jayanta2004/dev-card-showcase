        class LSystem {
            constructor() {
                this.canvas = document.getElementById('lsystem-canvas');
                this.ctx = this.canvas.getContext('2d');
                this.resizeCanvas();
                
                // L-system parameters
                this.axiom = 'X';
                this.rules = {
                    'F': 'FF',
                    'X': 'F[+X][-X]FX',
                    'Y': 'F[+Y]FY'
                };
                
                this.generations = 5;
                this.angle = 25 * Math.PI / 180;
                this.length = 10;
                this.thickness = 2;
                this.randomness = 0;
                
                this.currentString = '';
                this.generation = 0;
                
                this.generate();
                window.addEventListener('resize', () => this.resizeCanvas());
            }

            resizeCanvas() {
                this.canvas.width = window.innerWidth * 0.66;
                this.canvas.height = window.innerHeight;
                this.draw();
            }

            generate() {
                let current = this.axiom;
                
                for (let i = 0; i < this.generations; i++) {
                    let next = '';
                    for (let char of current) {
                        if (this.rules[char]) {
                            next += this.rules[char];
                        } else {
                            next += char;
                        }
                    }
                    current = next;
                }
                
                this.currentString = current;
                this.generation = this.generations;
                
                this.updateStats();
                this.draw();
            }

            draw() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Start from bottom center
                const startX = this.canvas.width / 2;
                const startY = this.canvas.height - 50;
                
                this.ctx.save();
                this.ctx.translate(startX, startY);
                this.ctx.rotate(-Math.PI / 2); // Point upward
                
                const stack = [];
                let branchCount = 0;
                
                for (let char of this.currentString) {
                    switch(char) {
                        case 'F':
                        case 'X':
                        case 'Y':
                            // Draw forward
                            const currentLength = this.length * (1 + (Math.random() - 0.5) * this.randomness / 50);
                            
                            this.ctx.beginPath();
                            this.ctx.moveTo(0, 0);
                            this.ctx.lineTo(0, -currentLength);
                            
                            // Color based on depth and randomness
                            const greenValue = 100 + Math.floor(Math.random() * 100);
                            const brownValue = 50 + Math.floor(Math.random() * 50);
                            
                            if (stack.length > 3) {
                                this.ctx.strokeStyle = `rgb(50, ${greenValue}, 50)`;
                            } else {
                                this.ctx.strokeStyle = `rgb(${brownValue}, ${brownValue/2}, 20)`;
                            }
                            
                            this.ctx.lineWidth = Math.max(1, this.thickness * (1 - stack.length * 0.1));
                            this.ctx.stroke();
                            
                            this.ctx.translate(0, -currentLength);
                            branchCount++;
                            break;
                            
                        case '+':
                            // Turn right
                            let angleRight = this.angle * (1 + (Math.random() - 0.5) * this.randomness / 50);
                            this.ctx.rotate(angleRight);
                            break;
                            
                        case '-':
                            // Turn left
                            let angleLeft = -this.angle * (1 + (Math.random() - 0.5) * this.randomness / 50);
                            this.ctx.rotate(angleLeft);
                            break;
                            
                        case '[':
                            // Push state
                            stack.push({
                                x: this.ctx.getTransform().e,
                                y: this.ctx.getTransform().f,
                                rotation: this.ctx.getTransform().a,
                                thickness: this.thickness
                            });
                            break;
                            
                        case ']':
                            // Pop state
                            const state = stack.pop();
                            if (state) {
                                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                                this.ctx.translate(state.x, state.y);
                                this.ctx.rotate(Math.atan2(state.rotation, 1));
                            }
                            break;
                    }
                }
                
                this.ctx.restore();
                
                // Update branch count
                document.getElementById('branch-count').textContent = branchCount;
                
                // Update display
                document.getElementById('current-string').textContent = 
                    `Generation ${this.generation}: ${this.currentString.substring(0, 50)}...`;
            }

            updateStats() {
                document.getElementById('string-length').textContent = this.currentString.length;
                document.getElementById('current-gen').textContent = this.generation;
                document.getElementById('depth').textContent = this.generations;
                
                // Calculate approximate fractal dimension
                const dim = 1.5 + Math.random() * 0.3; // Simplified
                document.getElementById('fractal-dim').textContent = dim.toFixed(2);
                
                // Determine complexity
                const complexity = this.currentString.length > 5000 ? 'High' :
                                  this.currentString.length > 1000 ? 'Medium' : 'Low';
                document.getElementById('complexity').textContent = `Complexity: ${complexity}`;
            }

            setRules(axiom, rules) {
                this.axiom = axiom;
                this.rules = rules;
                this.generate();
            }

            setGenerations(gen) {
                this.generations = gen;
                document.getElementById('gen-val').textContent = gen;
                this.generate();
            }

            setAngle(angle) {
                this.angle = angle * Math.PI / 180;
                document.getElementById('angle-val').textContent = angle;
                this.draw();
            }

            setLength(length) {
                this.length = length;
                document.getElementById('length-val').textContent = length;
                this.draw();
            }

            setThickness(thickness) {
                this.thickness = thickness;
                document.getElementById('thickness-val').textContent = thickness;
                this.draw();
            }

            setRandomness(random) {
                this.randomness = random;
                document.getElementById('random-val').textContent = random;
                this.draw();
            }

            evolve() {
                // Slight mutations to rules
                const mutations = ['F', 'X', 'Y', '+', '-', '[', ']'];
                
                for (let key in this.rules) {
                    let rule = this.rules[key];
                    if (Math.random() < 0.3) {
                        // Add a random mutation
                        const pos = Math.floor(Math.random() * rule.length);
                        const mutation = mutations[Math.floor(Math.random() * mutations.length)];
                        rule = rule.substring(0, pos) + mutation + rule.substring(pos);
                    }
                    if (Math.random() < 0.2 && rule.length > 1) {
                        // Delete a character
                        const pos = Math.floor(Math.random() * rule.length);
                        rule = rule.substring(0, pos) + rule.substring(pos + 1);
                    }
                    this.rules[key] = rule;
                }
                
                // Update input fields
                document.getElementById('rule-f').value = this.rules['F'] || '';
                document.getElementById('rule-x').value = this.rules['X'] || '';
                document.getElementById('rule-y').value = this.rules['Y'] || '';
                
                this.generate();
            }

            randomize() {
                // Randomize all parameters
                this.generations = Math.floor(Math.random() * 5) + 3;
                this.angle = (Math.random() * 60 + 15) * Math.PI / 180;
                this.length = Math.random() * 20 + 5;
                this.thickness = Math.random() * 5 + 1;
                this.randomness = Math.random() * 30;
                
                // Random rules
                const symbols = ['F', 'X', 'Y', '+', '-', '[', ']'];
                const ruleLength = Math.floor(Math.random() * 8) + 3;
                
                for (let key in this.rules) {
                    let rule = '';
                    for (let i = 0; i < ruleLength; i++) {
                        rule += symbols[Math.floor(Math.random() * symbols.length)];
                    }
                    this.rules[key] = rule;
                }
                
                // Update UI
                document.getElementById('generations').value = this.generations;
                document.getElementById('angle').value = Math.round(this.angle * 180 / Math.PI);
                document.getElementById('length').value = Math.round(this.length);
                document.getElementById('thickness').value = Math.round(this.thickness);
                document.getElementById('random').value = Math.round(this.randomness);
                
                document.getElementById('rule-f').value = this.rules['F'];
                document.getElementById('rule-x').value = this.rules['X'];
                document.getElementById('rule-y').value = this.rules['Y'];
                
                this.generate();
            }

            loadPreset(type) {
                const presets = {
                    tree: {
                        axiom: 'X',
                        rules: { 'F': 'FF', 'X': 'F[+X][-X]FX' },
                        angle: 25,
                        generations: 5,
                        length: 10,
                        thickness: 2
                    },
                    fern: {
                        axiom: 'X',
                        rules: { 'F': 'FF', 'X': 'F[+X][-X]FX', 'Y': 'F[+Y]FY' },
                        angle: 20,
                        generations: 6,
                        length: 8,
                        thickness: 1
                    },
                    bush: {
                        axiom: 'F',
                        rules: { 'F': 'F[+F][-F]F' },
                        angle: 30,
                        generations: 4,
                        length: 12,
                        thickness: 3
                    },
                    flower: {
                        axiom: 'X',
                        rules: { 'F': 'FF', 'X': 'F[+X][-X][*X]' },
                        angle: 36,
                        generations: 4,
                        length: 15,
                        thickness: 2
                    },
                    dragon: {
                        axiom: 'FX',
                        rules: { 'X': 'X+YF+', 'Y': '-FX-Y' },
                        angle: 90,
                        generations: 8,
                        length: 8,
                        thickness: 1
                    },
                    sierpinski: {
                        axiom: 'A',
                        rules: { 'A': 'B-A-B', 'B': 'A+B+A' },
                        angle: 60,
                        generations: 6,
                        length: 10,
                        thickness: 1
                    }
                };
                
                const preset = presets[type];
                if (preset) {
                    this.axiom = preset.axiom;
                    this.rules = preset.rules;
                    this.angle = preset.angle * Math.PI / 180;
                    this.length = preset.length;
                    this.thickness = preset.thickness;
                    this.generations = preset.generations;
                    
                    // Update UI
                    document.getElementById('axiom').value = this.axiom;
                    document.getElementById('rule-f').value = this.rules['F'] || '';
                    document.getElementById('rule-x').value = this.rules['X'] || '';
                    document.getElementById('rule-y').value = this.rules['Y'] || '';
                    document.getElementById('generations').value = this.generations;
                    document.getElementById('angle').value = preset.angle;
                    document.getElementById('length').value = this.length;
                    document.getElementById('thickness').value = this.thickness;
                    
                    document.getElementById('plant-name').textContent = 
                        type.charAt(0).toUpperCase() + type.slice(1);
                    
                    this.generate();
                }
                
                // Update active button
                document.querySelectorAll('.preset-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                event.target.classList.add('active');
            }

            save() {
                // Save current plant as PNG
                const dataURL = this.canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `lsystem-${Date.now()}.png`;
                link.href = dataURL;
                link.click();
            }
        }

        // Initialize L-system
        const lsys = new LSystem();

        // Global control functions
        function generatePlant() {
            // Update rules from input
            lsys.axiom = document.getElementById('axiom').value;
            lsys.rules = {
                'F': document.getElementById('rule-f').value,
                'X': document.getElementById('rule-x').value,
                'Y': document.getElementById('rule-y').value
            };
            lsys.generate();
        }

        function evolvePlant() {
            lsys.evolve();
        }

        function randomizePlant() {
            lsys.randomize();
        }

        function savePlant() {
            lsys.save();
        }

        function loadPreset(type) {
            lsys.loadPreset(type);
        }

        // Slider controls
        document.getElementById('generations').addEventListener('input', (e) => {
            lsys.setGenerations(parseInt(e.target.value));
        });

        document.getElementById('angle').addEventListener('input', (e) => {
            lsys.setAngle(parseInt(e.target.value));
        });

        document.getElementById('length').addEventListener('input', (e) => {
            lsys.setLength(parseInt(e.target.value));
        });

        document.getElementById('thickness').addEventListener('input', (e) => {
            lsys.setThickness(parseInt(e.target.value));
        });

        document.getElementById('random').addEventListener('input', (e) => {
            lsys.setRandomness(parseInt(e.target.value));
        });

        // Initialize with tree preset
        lsys.loadPreset('tree');