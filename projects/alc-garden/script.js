        const gardenGrid = document.getElementById('gardenGrid');
        const sunFill = document.getElementById('sunFill');
        
        // Garden plots
        const plants = [
            { seed: '🌰', stages: ['🌰', '🌱', '🌿', '🌳'], name: 'Oak' },
            { seed: '🌻', stages: ['🌻', '🌱', '🌿', '🌻'], name: 'Sunflower' },
            { seed: '🍄', stages: ['🍄', '🌱', '🍄', '🍄'], name: 'Mushroom' },
            { seed: '🌿', stages: ['🌿', '🌱', '🌿', '🌿'], name: 'Herb' }
        ];
        
        let plots = [];
        let sunlight = 70;
        let selectedSeed = 0; // index of plants array
        
        function initGarden() {
            plots = [];
            for (let i = 0; i < 9; i++) {
                plots.push({
                    plantIndex: null,
                    stage: 0,
                    waterLevel: 0
                });
            }
            renderGarden();
        }
        
        function renderGarden() {
            gardenGrid.innerHTML = '';
            
            plots.forEach((plot, index) => {
                const plotDiv = document.createElement('div');
                plotDiv.className = 'plot';
                plotDiv.dataset.index = index;
                
                if (plot.plantIndex !== null) {
                    const plant = plants[plot.plantIndex];
                    const plantSpan = document.createElement('div');
                    plantSpan.className = 'plant';
                    plantSpan.textContent = plant.stages[plot.stage];
                    plotDiv.appendChild(plantSpan);
                    
                    const stageDiv = document.createElement('div');
                    stageDiv.className = 'plot-stage';
                    stageDiv.textContent = `stage ${plot.stage + 1}/4`;
                    plotDiv.appendChild(stageDiv);
                } else {
                    const emptySpan = document.createElement('div');
                    emptySpan.className = 'plant';
                    emptySpan.textContent = '🕳️';
                    plotDiv.appendChild(emptySpan);
                    
                    const stageDiv = document.createElement('div');
                    stageDiv.className = 'plot-stage';
                    stageDiv.textContent = 'empty';
                    plotDiv.appendChild(stageDiv);
                }
                
                plotDiv.addEventListener('click', () => handlePlotClick(index));
                gardenGrid.appendChild(plotDiv);
            });
        }
        
        function handlePlotClick(index) {
            if (plots[index].plantIndex === null) {
                // Plant seed
                plots[index].plantIndex = selectedSeed;
                plots[index].stage = 0;
                plots[index].waterLevel = 2;
            } else {
                // Try to harvest if fully grown
                if (plots[index].stage === 3) {
                    plots[index].plantIndex = null;
                    plots[index].stage = 0;
                }
            }
            renderGarden();
        }
        
        function waterAll() {
            plots.forEach(plot => {
                if (plot.plantIndex !== null) {
                    plot.waterLevel = Math.min(5, plot.waterLevel + 2);
                    
                    // Growth check
                    if (plot.waterLevel >= 3 && sunlight > 30) {
                        if (plot.stage < 3) {
                            plot.stage++;
                            plot.waterLevel = 1;
                        }
                    }
                }
            });
            renderGarden();
        }
        
        function addSun() {
            sunlight = Math.min(100, sunlight + 15);
            sunFill.style.width = sunlight + '%';
            
            // Growth boost
            plots.forEach(plot => {
                if (plot.plantIndex !== null && plot.waterLevel >= 2 && Math.random() > 0.3) {
                    if (plot.stage < 3) {
                        plot.stage++;
                        plot.waterLevel = 1;
                    }
                }
            });
            renderGarden();
        }
        
        // Seed selection via clicking seed inventory
        document.querySelectorAll('.seed-inventory span').forEach((span, index) => {
            span.addEventListener('click', () => {
                selectedSeed = index;
                // Visual feedback
                document.querySelectorAll('.seed-inventory span').forEach(s => s.style.background = 'none');
                span.style.background = '#b8d0a8';
                span.style.borderRadius = '30px';
                span.style.padding = '5px 15px';
            });
        });
        
        document.getElementById('waterBtn').addEventListener('click', waterAll);
        document.getElementById('sunBtn').addEventListener('click', addSun);
        
        // Daily cycle simulation
        setInterval(() => {
            sunlight = Math.max(20, sunlight - 2);
            sunFill.style.width = sunlight + '%';
        }, 5000);
        
        initGarden();