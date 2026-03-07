        const synapseGrid = document.getElementById('synapseGrid');
        const symphonyDisplay = document.getElementById('symphonyDisplay');
        const activeCount = document.getElementById('activeCount');
        const synapseCount = document.getElementById('synapseCount');
        const frequency = document.getElementById('frequency');
        const harmony = document.getElementById('harmony');
        
        let neurons = [];
        let activeNeurons = [];
        
        const musicalNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const musicalWords = ['melody', 'harmony', 'rhythm', 'pulse', 'wave', 'echo', 'resonance'];
        
        function createNeurons() {
            for (let i = 0; i < 15; i++) {
                const neuron = document.createElement('div');
                neuron.className = 'neuron';
                neuron.dataset.index = i;
                neuron.dataset.note = musicalNotes[i % musicalNotes.length];
                neuron.dataset.freq = 220 + i * 20;
                
                // Different symbols for different neurons
                const symbols = ['🧠', '⚡', '🌀', '✨', '💭', '🔮', '🎵', '🎶', '♪', '♫', '🔔', '🎹'];
                neuron.textContent = symbols[i % symbols.length];
                
                neuron.addEventListener('click', () => toggleNeuron(i));
                synapseGrid.appendChild(neuron);
                neurons.push(neuron);
            }
        }
        
        function toggleNeuron(index) {
            const neuron = neurons[index];
            neuron.classList.toggle('active');
            
            if (neuron.classList.contains('active')) {
                activeNeurons.push(index);
            } else {
                activeNeurons = activeNeurons.filter(i => i !== index);
            }
            
            updateStats();
            playNeuralSound(index);
        }
        
        function updateStats() {
            activeCount.textContent = activeNeurons.length;
            
            // Calculate synapses (connections between active neurons)
            const connections = activeNeurons.length * (activeNeurons.length - 1) / 2;
            synapseCount.textContent = connections;
            
            // Update frequency based on active neurons
            const avgFreq = activeNeurons.reduce((sum, i) => sum + parseInt(neurons[i].dataset.freq), 0) / (activeNeurons.length || 1);
            frequency.textContent = (avgFreq / 100).toFixed(1) + 'Hz';
            
            // Harmony calculation
            const harmonyVal = activeNeurons.length / 15;
            harmony.textContent = harmonyVal.toFixed(2);
        }
        
        function playNeuralSound(index) {
            const neuron = neurons[index];
            const note = neuron.dataset.note;
            
            // Visual feedback
            symphonyDisplay.innerHTML = `🎵 Neuron ${index} fires: ${note}<br>⚡ Creating synaptic resonance...`;
            
            // Update display with musical phrase
            if (activeNeurons.length > 1) {
                let phrase = '';
                for (let i = 0; i < activeNeurons.length; i++) {
                    phrase += neurons[activeNeurons[i]].dataset.note + ' ';
                }
                symphonyDisplay.innerHTML = `🎵 Neural melody: ${phrase}<br>🌀 Frequency: ${frequency.textContent}`;
            }
        }
        
        function compose() {
            if (activeNeurons.length === 0) {
                symphonyDisplay.innerHTML = '⚠️ Activate some neurons first...';
                return;
            }
            
            // Generate a musical phrase
            let composition = '';
            for (let i = 0; i < 8; i++) {
                const randomNeuron = activeNeurons[Math.floor(Math.random() * activeNeurons.length)];
                composition += neurons[randomNeuron].dataset.note + ' ';
                
                // Add musical words
                if (i % 3 === 2) {
                    composition += musicalWords[Math.floor(Math.random() * musicalWords.length)] + ' ';
                }
            }
            
            symphonyDisplay.innerHTML = `🎼 Neural Composition:<br>${composition}<br>✨ A symphony of thought`;
        }
        
        function resetNeural() {
            neurons.forEach(n => n.classList.remove('active'));
            activeNeurons = [];
            updateStats();
            symphonyDisplay.innerHTML = '⚡ Neural network reset. Ready for new patterns.';
        }
        
        function randomPattern() {
            resetNeural();
            
            // Activate random neurons
            const numToActivate = 3 + Math.floor(Math.random() * 5);
            for (let i = 0; i < numToActivate; i++) {
                const randomIndex = Math.floor(Math.random() * neurons.length);
                if (!activeNeurons.includes(randomIndex)) {
                    neurons[randomIndex].classList.add('active');
                    activeNeurons.push(randomIndex);
                }
            }
            
            updateStats();
            compose();
        }
        
        document.getElementById('composeBtn').addEventListener('click', compose);
        document.getElementById('resetNeuralBtn').addEventListener('click', resetNeural);
        document.getElementById('randomBtn').addEventListener('click', randomPattern);
        
        createNeurons();
        
        // Simulate neural firing
        setInterval(() => {
            if (activeNeurons.length > 0 && Math.random() > 0.8) {
                const randomNeuron = activeNeurons[Math.floor(Math.random() * activeNeurons.length)];
                playNeuralSound(randomNeuron);
            }
        }, 2000);