        (function() {
            // ---------- GENETIC ART GALLERY ----------
            // Evolves images using genetic algorithm with neural style transfer
            
            const galleryCanvas = document.getElementById('galleryCanvas');
            const genomeCanvas = document.getElementById('genomeCanvas');
            const selectionCanvas = document.getElementById('selectionCanvas');
            
            const ctxGallery = galleryCanvas.getContext('2d');
            const ctxGenome = genomeCanvas.getContext('2d');
            const ctxSelection = selectionCanvas.getContext('2d');

            let width, height;
            let time = 0;

            // genetic parameters
            let mutationRate = 0.03;
            let crossoverRate = 0.7;
            let populationSize = 24;
            
            // population
            let population = [];
            let fitness = [];
            let generation = 0;
            let bestIndividual = null;
            let bestFitness = 0;

            // art styles
            const styles = [
                'abstract expressionism',
                'cubist portrait',
                'impressionist landscape',
                'surrealist dream',
                'color field painting',
                'geometric abstraction',
                'biomorphic form',
                'neural hallucination'
            ];

            // UI elements
            const mutationDisplay = document.getElementById('mutationDisplay');
            const crossoverDisplay = document.getElementById('crossoverDisplay');
            const populationDisplay = document.getElementById('populationDisplay');
            const genCount = document.getElementById('genCount');
            const bestFitnessSpan = document.getElementById('bestFitness');
            const fitnessBar = document.getElementById('fitnessBar');
            const masterpieceDesc = document.getElementById('masterpieceDesc');
            
            // sliders
            const mutationSlider = document.getElementById('mutationSlider');
            const mutationHandle = document.getElementById('mutationHandle');
            const mutationFill = document.getElementById('mutationFill');
            
            const crossoverSlider = document.getElementById('crossoverSlider');
            const crossoverHandle = document.getElementById('crossoverHandle');
            const crossoverFill = document.getElementById('crossoverFill');
            
            const populationSlider = document.getElementById('populationSlider');
            const populationHandle = document.getElementById('populationHandle');
            const populationFill = document.getElementById('populationFill');

            // individual class (genome = array of genes)
            class Individual {
                constructor(genes = null) {
                    if (genes) {
                        this.genes = genes.slice();
                    } else {
                        // random genome: [r,g,b patterns, shapes, textures]
                        this.genes = new Array(64);
                        for (let i = 0; i < 64; i++) {
                            this.genes[i] = Math.random();
                        }
                    }
                }
                
                mutate(rate) {
                    for (let i = 0; i < this.genes.length; i++) {
                        if (Math.random() < rate) {
                            // gaussian mutation
                            this.genes[i] += (Math.random() - 0.5) * 0.3;
                            this.genes[i] = Math.max(0, Math.min(1, this.genes[i]));
                        }
                    }
                }
                
                crossover(other, rate) {
                    if (Math.random() > rate) return [this, other];
                    
                    let child1Genes = new Array(64);
                    let child2Genes = new Array(64);
                    
                    // uniform crossover
                    for (let i = 0; i < 64; i++) {
                        if (Math.random() < 0.5) {
                            child1Genes[i] = this.genes[i];
                            child2Genes[i] = other.genes[i];
                        } else {
                            child1Genes[i] = other.genes[i];
                            child2Genes[i] = this.genes[i];
                        }
                    }
                    
                    return [new Individual(child1Genes), new Individual(child2Genes)];
                }
            }

            // resize
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                galleryCanvas.width = width;
                galleryCanvas.height = height;
                genomeCanvas.width = width;
                genomeCanvas.height = height;
                selectionCanvas.width = width;
                selectionCanvas.height = height;
                
                initPopulation();
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // slider interactions
            function setupSliders() {
                // mutation slider
                function updateMutationFromEvent(e) {
                    const rect = mutationSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    mutationRate = val * 0.2; // 0 to 0.2
                    mutationDisplay.innerText = mutationRate.toFixed(3);
                    mutationFill.style.width = (val * 100) + '%';
                    mutationHandle.style.left = (val * 100) + '%';
                }
                
                mutationHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateMutationFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                mutationSlider.addEventListener('click', (e) => {
                    updateMutationFromEvent(e);
                });
                
                // crossover slider
                function updateCrossoverFromEvent(e) {
                    const rect = crossoverSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    crossoverRate = val;
                    crossoverDisplay.innerText = crossoverRate.toFixed(2);
                    crossoverFill.style.width = (val * 100) + '%';
                    crossoverHandle.style.left = (val * 100) + '%';
                }
                
                crossoverHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateCrossoverFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                crossoverSlider.addEventListener('click', (e) => {
                    updateCrossoverFromEvent(e);
                });
                
                // population slider
                function updatePopulationFromEvent(e) {
                    const rect = populationSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    populationSize = Math.floor(8 + val * 56); // 8 to 64
                    populationDisplay.innerText = populationSize;
                    populationFill.style.width = (val * 100) + '%';
                    populationHandle.style.left = (val * 100) + '%';
                    
                    initPopulation();
                }
                
                populationHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updatePopulationFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                populationSlider.addEventListener('click', (e) => {
                    updatePopulationFromEvent(e);
                });
            }
            setupSliders();

            // initialize population
            function initPopulation() {
                population = [];
                for (let i = 0; i < populationSize; i++) {
                    population.push(new Individual());
                }
                fitness = new Array(populationSize).fill(0);
                generation = 0;
                genCount.innerText = generation;
            }

            // fitness function (aesthetic measure)
            function calculateFitness(ind) {
                let genes = ind.genes;
                
                // aesthetic metrics:
                // 1. color diversity
                let rMean = 0, gMean = 0, bMean = 0;
                for (let i = 0; i < 16; i++) {
                    rMean += genes[i*3];
                    gMean += genes[i*3+1];
                    bMean += genes[i*3+2];
                }
                rMean /= 16;
                gMean /= 16;
                bMean /= 16;
                
                let colorVar = 0;
                for (let i = 0; i < 16; i++) {
                    colorVar += Math.pow(genes[i*3] - rMean, 2);
                    colorVar += Math.pow(genes[i*3+1] - gMean, 2);
                    colorVar += Math.pow(genes[i*3+2] - bMean, 2);
                }
                
                // 2. symmetry
                let symmetry = 0;
                for (let i = 0; i < 32; i++) {
                    symmetry += Math.abs(genes[i] - genes[63-i]);
                }
                symmetry = 1 - symmetry / 32;
                
                // 3. complexity (entropy-like)
                let complexity = 0;
                for (let i = 0; i < 63; i++) {
                    complexity += Math.abs(genes[i+1] - genes[i]);
                }
                complexity = complexity / 63;
                
                // weighted combination
                let fitness = 0.4 * colorVar + 0.3 * symmetry + 0.3 * complexity;
                
                return Math.min(1, fitness);
            }

            // evaluate population
            function evaluatePopulation() {
                let totalFitness = 0;
                bestFitness = 0;
                
                for (let i = 0; i < populationSize; i++) {
                    fitness[i] = calculateFitness(population[i]);
                    totalFitness += fitness[i];
                    
                    if (fitness[i] > bestFitness) {
                        bestFitness = fitness[i];
                        bestIndividual = population[i];
                    }
                }
                
                bestFitnessSpan.innerText = Math.round(bestFitness * 100) + '%';
                fitnessBar.style.width = (bestFitness * 100) + '%';
                
                return totalFitness;
            }

            // selection (tournament)
            function selectParent() {
                let tournamentSize = 3;
                let best = null;
                let bestFit = -1;
                
                for (let i = 0; i < tournamentSize; i++) {
                    let idx = Math.floor(Math.random() * populationSize);
                    if (fitness[idx] > bestFit) {
                        bestFit = fitness[idx];
                        best = population[idx];
                    }
                }
                
                return best;
            }

            // evolve one generation
            function evolve() {
                evaluatePopulation();
                
                let newPopulation = [];
                
                // elitism (keep best 2)
                let sorted = population.map((ind, i) => ({ ind, fitness: fitness[i] }))
                                       .sort((a, b) => b.fitness - a.fitness);
                
                newPopulation.push(sorted[0].ind);
                newPopulation.push(sorted[1].ind);
                
                // fill rest with offspring
                while (newPopulation.length < populationSize) {
                    let parent1 = selectParent();
                    let parent2 = selectParent();
                    
                    let [child1, child2] = parent1.crossover(parent2, crossoverRate);
                    
                    child1.mutate(mutationRate);
                    child2.mutate(mutationRate);
                    
                    newPopulation.push(child1);
                    if (newPopulation.length < populationSize) {
                        newPopulation.push(child2);
                    }
                }
                
                population = newPopulation;
                generation++;
                genCount.innerText = generation;
                
                // update description
                let styleIdx = Math.floor(bestFitness * styles.length);
                masterpieceDesc.innerText = '🖼️ ' + styles[styleIdx] + ' #' + generation;
            }

            // render individual to canvas
            function renderIndividual(ind, ctx, offsetX, offsetY, size) {
                let genes = ind.genes;
                let cellSize = size / 8;
                
                for (let i = 0; i < 8; i++) {
                    for (let j = 0; j < 8; j++) {
                        let idx = (i * 8 + j) * 4;
                        if (idx + 3 >= genes.length) continue;
                        
                        let r = genes[idx] * 255;
                        let g = genes[idx+1] * 255;
                        let b = genes[idx+2] * 255;
                        let a = genes[idx+3] * 255;
                        
                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a/255})`;
                        ctx.fillRect(offsetX + j * cellSize, offsetY + i * cellSize, cellSize, cellSize);
                    }
                }
            }

            // draw gallery
            function drawGallery() {
                ctxGallery.clearRect(0, 0, width, height);
                
                // draw best individual large
                if (bestIndividual) {
                    let size = Math.min(width, height) * 0.6;
                    let x = (width - size) / 2;
                    let y = (height - size) / 2;
                    
                    renderIndividual(bestIndividual, ctxGallery, x, y, size);
                    
                    // draw frame
                    ctxGallery.strokeStyle = '#ffaaff80';
                    ctxGallery.lineWidth = 4;
                    ctxGallery.strokeRect(x-2, y-2, size+4, size+4);
                }
                
                // draw small thumbnails of population
                let thumbSize = 60;
                let cols = Math.floor(width / (thumbSize + 10));
                let startX = 20;
                let startY = height - thumbSize - 40;
                
                for (let i = 0; i < Math.min(populationSize, cols); i++) {
                    let x = startX + i * (thumbSize + 10);
                    let y = startY;
                    
                    renderIndividual(population[i], ctxGallery, x, y, thumbSize);
                    
                    // fitness indicator
                    ctxGallery.fillStyle = '#ffffff80';
                    ctxGallery.font = '10px monospace';
                    ctxGallery.fillText((fitness[i]*100).toFixed(0) + '%', x+5, y+thumbSize-5);
                }
            }

            // draw genome visualization
            function drawGenome() {
                ctxGenome.clearRect(0, 0, width, height);
                
                if (!bestIndividual) return;
                
                // draw genome as heatmap
                let genes = bestIndividual.genes;
                let cellW = width / 64;
                
                for (let i = 0; i < 64; i++) {
                    let val = genes[i];
                    let x = i * cellW;
                    
                    ctxGenome.fillStyle = `rgba(${val*255}, ${val*255}, 255, 0.5)`;
                    ctxGenome.fillRect(x, height/2 - 50, cellW-1, 100);
                }
                
                // draw fitness graph
                ctxGenome.beginPath();
                ctxGenome.strokeStyle = '#ffaaff';
                ctxGenome.lineWidth = 2;
                
                for (let i = 0; i < populationSize; i++) {
                    let x = i * (width / populationSize);
                    let y = height - 100 - fitness[i] * 100;
                    
                    if (i === 0) ctxGenome.moveTo(x, y);
                    else ctxGenome.lineTo(x, y);
                }
                ctxGenome.stroke();
            }

            // draw selection pressure
            function drawSelection() {
                ctxSelection.clearRect(0, 0, width, height);
                
                // draw evolutionary timeline
                ctxSelection.strokeStyle = '#b07eff40';
                ctxSelection.lineWidth = 1;
                
                for (let i = 0; i < 10; i++) {
                    let y = height * i / 10;
                    ctxSelection.beginPath();
                    ctxSelection.moveTo(0, y);
                    ctxSelection.lineTo(width, y);
                    ctxSelection.strokeStyle = `rgba(200, 100, 255, ${0.1})`;
                    ctxSelection.stroke();
                }
                
                // selection arrows
                for (let i = 0; i < 5; i++) {
                    let x = width/2 + Math.sin(time + i) * 200;
                    let y = height/3 + i * 50;
                    
                    ctxSelection.beginPath();
                    ctxSelection.moveTo(x, y);
                    ctxSelection.lineTo(x-20, y+20);
                    ctxSelection.lineTo(x+20, y+20);
                    ctxSelection.closePath();
                    ctxSelection.fillStyle = `rgba(255, 100, 255, ${0.1})`;
                    ctxSelection.fill();
                }
            }

            // animation loop
            function animate() {
                time += 0.02;
                
                // evolve every few frames
                if (Math.floor(time * 10) % 3 === 0) {
                    evolve();
                }
                
                drawGallery();
                drawGenome();
                drawSelection();
                
                requestAnimationFrame(animate);
            }
            animate();

            // initial evaluation
            evaluatePopulation();
        })();