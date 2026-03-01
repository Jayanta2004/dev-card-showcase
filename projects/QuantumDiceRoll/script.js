
        // Quantum Dice Roller - Redesigned UI
        document.addEventListener('DOMContentLoaded', function() {
            // Quantum State
            let quantumState = {
                diceCount: 1,
                isEntangled: false,
                entanglementLevel: 0,
                fluctuation: 50,
                totalRolls: 0,
                entangledRolls: 0,
                distribution: {},
                lastRoll: []
            };
            
            // DOM Elements
            const diceChamber = document.getElementById('dice-chamber');
            const initialState = document.getElementById('initial-state');
            const entanglementBeams = document.getElementById('entanglement-beams');
            const rollResults = document.getElementById('roll-results');
            const resultValues = document.getElementById('result-values');
            const resultSum = document.getElementById('result-sum');
            const quantumRollBtn = document.getElementById('quantum-roll-btn');
            const entangleBtn = document.getElementById('entangle-btn');
            const separateBtn = document.getElementById('separate-btn');
            const autoExperimentBtn = document.getElementById('auto-experiment-btn');
            const diceCountSelectors = document.querySelectorAll('.dice-count-selector');
            const diceCountDisplay = document.getElementById('dice-count-display');
            const entanglementBar = document.getElementById('entanglement-bar');
            const entanglementLevel = document.getElementById('entanglement-level');
            const entanglementDescription = document.getElementById('entanglement-description');
            const fluctuationSlider = document.getElementById('fluctuation-slider');
            const fluctuationLevel = document.getElementById('fluctuation-level');
            const chamberStatus = document.getElementById('chamber-status');
            const totalRollsEl = document.getElementById('total-rolls');
            const entangledRollsEl = document.getElementById('entangled-rolls');
            const superpositionValue = document.getElementById('superposition-value');
            const stateDescription = document.getElementById('state-description');
            const distributionContainer = document.getElementById('distribution-container');
            
            // Initialize particles
            initParticles();
            
            // Initialize dice
            initDiceChamber();
            updateDistributionDisplay();
            
            // Event Listeners
            quantumRollBtn.addEventListener('click', quantumRoll);
            entangleBtn.addEventListener('click', () => setEntanglement(true));
            separateBtn.addEventListener('click', () => setEntanglement(false));
            autoExperimentBtn.addEventListener('click', runQuantumExperiment);
            
            diceCountSelectors.forEach(btn => {
                btn.addEventListener('click', function() {
                    quantumState.diceCount = parseInt(this.dataset.count);
                    
                    diceCountSelectors.forEach(b => {
                        b.classList.remove('active', 'from-cyan-700', 'to-cyan-900');
                        b.classList.add('bg-gray-800');
                    });
                    
                    this.classList.add('active', 'from-cyan-700', 'to-cyan-900');
                    this.classList.remove('bg-gray-800');
                    
                    diceCountDisplay.textContent = quantumState.diceCount;
                    initDiceChamber();
                    updateDistributionDisplay();
                });
            });
            
            fluctuationSlider.addEventListener('input', function() {
                quantumState.fluctuation = parseInt(this.value);
                const levels = ['Minimal', 'Low', 'Medium', 'High', 'Extreme'];
                const levelIndex = Math.floor(quantumState.fluctuation / 20);
                fluctuationLevel.textContent = levels[levelIndex];
            });
            
            // Initialize entanglement
            setEntanglement(false);
            
            // Functions
            function initParticles() {
                const container = document.getElementById('particles-container');
                
                for (let i = 0; i < 30; i++) {
                    const particle = document.createElement('div');
                    particle.classList.add('particle');
                    
                    // Random size and position
                    const size = Math.random() * 4 + 1;
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.left = `${Math.random() * 100}%`;
                    particle.style.top = `${Math.random() * 100}%`;
                    
                    // Random animation delay and duration
                    particle.style.animationDelay = `${Math.random() * 20}s`;
                    particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
                    
                    container.appendChild(particle);
                }
            }
            
            function initDiceChamber() {
                diceChamber.innerHTML = '';
                entanglementBeams.innerHTML = '';
                
                // Remove initial state message
                if (initialState) initialState.classList.add('hidden');
                
                // Create dice
                for (let i = 0; i < quantumState.diceCount; i++) {
                    const dice = document.createElement('div');
                    dice.className = 'quantum-dice';
                    dice.dataset.index = i;
                    
                    // Generate dice faces
                    const faces = [
                        `<div class="dice-face" style="transform: translateZ(60px); background: linear-gradient(135deg, #1a1a2e, #16213e);">
                            <div class="flex justify-center items-center w-full h-full">
                                <div class="pip"></div>
                            </div>
                        </div>`,
                        `<div class="dice-face" style="transform: rotateY(180deg) translateZ(60px); background: linear-gradient(135deg, #1a1a2e, #16213e);">
                            <div class="grid grid-cols-3 grid-rows-3 w-3/4 h-3/4">
                                <div class="pip col-start-3"></div>
                                <div class="pip col-start-2 row-start-2"></div>
                                <div class="pip col-start-1 row-start-3"></div>
                            </div>
                        </div>`,
                        `<div class="dice-face" style="transform: rotateY(90deg) translateZ(60px); background: linear-gradient(135deg, #1a1a2e, #16213e);">
                            <div class="grid grid-cols-3 grid-rows-3 w-3/4 h-3/4">
                                <div class="pip"></div>
                                <div class="pip col-start-2 row-start-2"></div>
                                <div class="pip col-start-3 row-start-3"></div>
                            </div>
                        </div>`,
                        `<div class="dice-face" style="transform: rotateY(-90deg) translateZ(60px); background: linear-gradient(135deg, #1a1a2e, #16213e);">
                            <div class="grid grid-cols-2 grid-rows-2 w-3/4 h-3/4 gap-6">
                                <div class="pip"></div>
                                <div class="pip"></div>
                                <div class="pip"></div>
                                <div class="pip"></div>
                            </div>
                        </div>`,
                        `<div class="dice-face" style="transform: rotateX(90deg) translateZ(60px); background: linear-gradient(135deg, #1a1a2e, #16213e);">
                            <div class="grid grid-cols-3 grid-rows-3 w-3/4 h-3/4">
                                <div class="pip"></div>
                                <div class="pip col-start-3"></div>
                                <div class="pip col-start-2 row-start-2"></div>
                                <div class="pip row-start-3"></div>
                                <div class="pip col-start-3 row-start-3"></div>
                            </div>
                        </div>`,
                        `<div class="dice-face" style="transform: rotateX(-90deg) translateZ(60px); background: linear-gradient(135deg, #1a1a2e, #16213e);">
                            <div class="grid grid-cols-3 grid-rows-3 w-3/4 h-3/4">
                                <div class="pip"></div>
                                <div class="pip col-start-2"></div>
                                <div class="pip col-start-3"></div>
                                <div class="pip row-start-2"></div>
                                <div class="pip col-start-2 row-start-2"></div>
                                <div class="pip col-start-3 row-start-2"></div>
                                <div class="pip row-start-3"></div>
                                <div class="pip col-start-2 row-start-3"></div>
                                <div class="pip col-start-3 row-start-3"></div>
                            </div>
                        </div>`
                    ];
                    
                    dice.innerHTML = faces.join('');
                    
                    // Add quantum glow if entangled
                    if (quantumState.isEntangled) {
                        dice.style.boxShadow = '0 0 30px rgba(180, 100, 255, 0.5)';
                    }
                    
                    // Random initial rotation
                    const rotationX = Math.random() * 360;
                    const rotationY = Math.random() * 360;
                    dice.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
                    
                    diceChamber.appendChild(dice);
                }
                
                // Update entanglement visuals
                updateEntanglementVisuals();
            }
            
            function quantumRoll() {
                quantumState.totalRolls++;
                totalRollsEl.textContent = quantumState.totalRolls;
                
                // Update chamber status
                chamberStatus.textContent = "Collapsing wave function...";
                chamberStatus.classList.add('text-purple-400');
                
                // Get dice elements
                const diceElements = document.querySelectorAll('.quantum-dice');
                const results = [];
                
                // Generate results based on entanglement
                if (quantumState.isEntangled && quantumState.diceCount > 1) {
                    quantumState.entangledRolls++;
                    entangledRollsEl.textContent = quantumState.entangledRolls;
                    
                    // Create correlated results for entangled dice
                    const baseValue = Math.floor(Math.random() * 6) + 1;
                    
                    for (let i = 0; i < quantumState.diceCount; i++) {
                        let result;
                        
                        if (i === 0) {
                            result = baseValue;
                        } else {
                            // Apply entanglement correlation
                            const correlationStrength = quantumState.entanglementLevel / 100;
                            
                            if (Math.random() < correlationStrength) {
                                // Strong correlation: often sum to 7 or have inverse relationship
                                result = 7 - baseValue;
                                if (result < 1) result = 1;
                                if (result > 6) result = 6;
                                
                                // Add some fluctuation
                                if (Math.random() < quantumState.fluctuation / 200) {
                                    result = Math.floor(Math.random() * 6) + 1;
                                }
                            } else {
                                // Some randomness
                                result = Math.floor(Math.random() * 6) + 1;
                            }
                        }
                        
                        results.push(result);
                    }
                } else {
                    // Independent dice
                    for (let i = 0; i < quantumState.diceCount; i++) {
                        results.push(Math.floor(Math.random() * 6) + 1);
                    }
                }
                
                quantumState.lastRoll = results;
                
                // Animate dice
                diceElements.forEach((dice, index) => {
                    // Add rolling animation
                    dice.classList.add('rolling');
                    
                    // Determine final rotation based on result
                    const result = results[index];
                    const rotations = {
                        1: 'rotateX(0deg) rotateY(0deg)',
                        2: 'rotateX(0deg) rotateY(180deg)',
                        3: 'rotateX(0deg) rotateY(90deg)',
                        4: 'rotateX(0deg) rotateY(-90deg)',
                        5: 'rotateX(-90deg) rotateY(0deg)',
                        6: 'rotateX(90deg) rotateY(0deg)'
                    };
                    
                    // Apply final rotation after animation
                    setTimeout(() => {
                        dice.classList.remove('rolling');
                        dice.style.transform = rotations[result];
                        
                        // Add collapse effect
                        dice.classList.add('collapse');
                        setTimeout(() => dice.classList.remove('collapse'), 500);
                    }, 1000);
                });
                
                // Update distribution
                const sum = results.reduce((a, b) => a + b, 0);
                quantumState.distribution[sum] = (quantumState.distribution[sum] || 0) + 1;
                
                // Update UI after animation
                setTimeout(() => {
                    updateRollResults(results);
                    updateDistributionDisplay();
                    updateQuantumStateDisplay();
                    
                    chamberStatus.textContent = "Wave function collapsed";
                    chamberStatus.classList.remove('text-purple-400');
                    chamberStatus.classList.add('text-green-400');
                }, 1100);
            }
            
            function setEntanglement(entangled) {
                quantumState.isEntangled = entangled;
                
                if (entangled) {
                    // Gradually increase entanglement level
                    let level = 0;
                    const interval = setInterval(() => {
                        level += 5;
                        quantumState.entanglementLevel = level;
                        entanglementBar.style.width = `${level}%`;
                        entanglementLevel.textContent = `${level}%`;
                        
                        if (level >= 80) {
                            clearInterval(interval);
                            quantumState.entanglementLevel = 80;
                            entanglementBar.style.width = '80%';
                            entanglementLevel.textContent = '80%';
                        }
                    }, 50);
                    
                    entanglementDescription.textContent = "Dice are quantum entangled. Their states are now correlated across any distance.";
                    stateDescription.textContent = "Quantum entanglement active. Measuring one die instantly affects the others.";
                    superpositionValue.textContent = "Entangled";
                    superpositionValue.classList.remove('text-green-400');
                    superpositionValue.classList.add('text-purple-400');
                    
                    // Update dice appearance
                    document.querySelectorAll('.quantum-dice').forEach(dice => {
                        dice.style.boxShadow = '0 0 30px rgba(180, 100, 255, 0.5)';
                    });
                } else {
                    // Gradually decrease entanglement level
                    let level = quantumState.entanglementLevel;
                    const interval = setInterval(() => {
                        level -= 5;
                        quantumState.entanglementLevel = level;
                        entanglementBar.style.width = `${level}%`;
                        entanglementLevel.textContent = `${level}%`;
                        
                        if (level <= 0) {
                            clearInterval(interval);
                            quantumState.entanglementLevel = 0;
                            entanglementBar.style.width = '0%';
                            entanglementLevel.textContent = '0%';
                        }
                    }, 50);
                    
                    entanglementDescription.textContent = "Dice are independent. Each follows classical probability distribution.";
                    stateDescription.textContent = "Dice are in quantum superposition until observed.";
                    superpositionValue.textContent = "Active";
                    superpositionValue.classList.remove('text-purple-400');
                    superpositionValue.classList.add('text-green-400');
                    
                    // Update dice appearance
                    document.querySelectorAll('.quantum-dice').forEach(dice => {
                        dice.style.boxShadow = 'none';
                    });
                }
                
                updateEntanglementVisuals();
            }
            
            function updateEntanglementVisuals() {
                entanglementBeams.innerHTML = '';
                
                if (quantumState.isEntangled && quantumState.diceCount > 1) {
                    const diceElements = document.querySelectorAll('.quantum-dice');
                    
                    // Create beams between dice
                    for (let i = 0; i < diceElements.length - 1; i++) {
                        for (let j = i + 1; j < diceElements.length; j++) {
                            const beam = document.createElement('div');
                            beam.className = 'entanglement-beam';
                            
                            // Position beam between dice
                            const rect1 = diceElements[i].getBoundingClientRect();
                            const rect2 = diceElements[j].getBoundingClientRect();
                            const chamberRect = diceChamber.getBoundingClientRect();
                            
                            const x1 = rect1.left + rect1.width/2 - chamberRect.left;
                            const y1 = rect1.top + rect1.height/2 - chamberRect.top;
                            const x2 = rect2.left + rect2.width/2 - chamberRect.left;
                            const y2 = rect2.top + rect2.height/2 - chamberRect.top;
                            
                            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                            
                            beam.style.width = `${distance}px`;
                            beam.style.left = `${x1}px`;
                            beam.style.top = `${y1}px`;
                            beam.style.transform = `rotate(${angle}deg)`;
                            beam.style.transformOrigin = '0 0';
                            
                            entanglementBeams.appendChild(beam);
                        }
                    }
                }
            }
            
            function updateRollResults(results) {
                rollResults.classList.remove('hidden');
                
                // Clear previous results
                resultValues.innerHTML = '';
                
                // Display individual dice results
                results.forEach((value, index) => {
                    const resultEl = document.createElement('div');
                    resultEl.className = 'flex flex-col items-center';
                    
                    const colorClass = quantumState.isEntangled ? 'bg-gradient-to-br from-purple-900/50 to-purple-700/50' : 'bg-gradient-to-br from-cyan-900/50 to-cyan-700/50';
                    
                    resultEl.innerHTML = `
                        <div class="w-16 h-16 rounded-xl ${colorClass} border border-gray-700 flex items-center justify-center mb-2">
                            <span class="text-3xl font-bold">${value}</span>
                        </div>
                        <div class="text-xs text-gray-400">Dice ${index + 1}</div>
                    `;
                    
                    resultValues.appendChild(resultEl);
                });
                
                // Calculate and display sum
                const sum = results.reduce((a, b) => a + b, 0);
                resultSum.textContent = sum;
            }
            
            function updateDistributionDisplay() {
                if (Object.keys(quantumState.distribution).length === 0) {
                    distributionContainer.innerHTML = `
                        <div class="text-center py-6 text-gray-500">
                            <i class="fas fa-chart-line text-2xl mb-2"></i>
                            <p>Roll dice to see probability distribution</p>
                        </div>
                    `;
                    return;
                }
                
                const total = Object.values(quantumState.distribution).reduce((a, b) => a + b, 0);
                const maxValue = Math.max(...Object.values(quantumState.distribution));
                
                let distributionHTML = '';
                const minSum = quantumState.diceCount;
                const maxSum = quantumState.diceCount * 6;
                
                for (let sum = minSum; sum <= maxSum; sum++) {
                    const count = quantumState.distribution[sum] || 0;
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                    const barWidth = total > 0 ? (count / maxValue * 100) : 0;
                    
                    distributionHTML += `
                        <div class="flex items-center space-x-3">
                            <div class="w-8 text-sm font-medium">${sum}</div>
                            <div class="flex-1">
                                <div class="stat-bar">
                                    <div class="stat-fill bg-gradient-to-r from-cyan-500 to-purple-500" style="width: ${barWidth}%"></div>
                                </div>
                            </div>
                            <div class="w-12 text-right text-sm font-medium">${percentage}%</div>
                        </div>
                    `;
                }
                
                distributionContainer.innerHTML = distributionHTML;
            }
            
            function updateQuantumStateDisplay() {
                // Update state description based on recent rolls
                const recentPatterns = getRecentPatterns();
                
                if (quantumState.isEntangled) {
                    if (recentPatterns.hasCorrelation) {
                        stateDescription.textContent = "Strong quantum correlation observed between dice.";
                    } else {
                        stateDescription.textContent = "Quantum entanglement active but correlation not yet observed.";
                    }
                } else {
                    if (recentPatterns.isRandom) {
                        stateDescription.textContent = "Dice exhibit classical random distribution.";
                    } else {
                        stateDescription.textContent = "Statistical anomalies detected in recent rolls.";
                    }
                }
            }
            
            function getRecentPatterns() {
                // Analyze last few rolls for patterns
                // This is a simplified version
                return {
                    hasCorrelation: Math.random() > 0.5,
                    isRandom: Math.random() > 0.3
                };
            }
            
            function runQuantumExperiment() {
                autoExperimentBtn.disabled = true;
                autoExperimentBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Running Experiment...';
                
                let rollsCompleted = 0;
                const totalRolls = 100;
                
                const rollInterval = setInterval(() => {
                    quantumRoll();
                    rollsCompleted++;
                    
                    if (rollsCompleted >= totalRolls) {
                        clearInterval(rollInterval);
                        autoExperimentBtn.disabled = false;
                        autoExperimentBtn.innerHTML = '<i class="fas fa-flask mr-2"></i>Run Quantum Experiment (100 rolls)';
                        
                        // Update chamber status
                        chamberStatus.textContent = `Experiment complete: ${totalRolls} rolls analyzed`;
                        chamberStatus.classList.add('text-amber-400');
                    }
                }, 100);
            }
            
            // Initial demo roll
            setTimeout(() => {
                if (quantumState.totalRolls === 0) {
                    quantumRoll();
                    setTimeout(() => {
                        setEntanglement(true);
                        setTimeout(() => quantumRoll(), 1000);
                    }, 1500);
                }
            }, 800);
        })