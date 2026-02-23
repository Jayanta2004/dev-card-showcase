        class QuantumState {
            constructor(nQubits) {
                this.nQubits = nQubits;
                this.dim = Math.pow(2, nQubits);
                this.state = new Array(this.dim).fill(0);
                this.state[0] = 1; // Start with |0...0⟩
                this.phases = new Array(this.dim).fill(0);
            }

            applyGate(gate, targets, controls = []) {
                switch(gate) {
                    case 'H': this.hadamard(targets[0]); break;
                    case 'X': this.pauliX(targets[0]); break;
                    case 'Y': this.pauliY(targets[0]); break;
                    case 'Z': this.pauliZ(targets[0]); break;
                    case 'CNOT': this.cnot(targets[0], targets[1]); break;
                    case 'M': return this.measure(targets[0]);
                }
                this.normalize();
            }

            hadamard(qubit) {
                const newState = new Array(this.dim).fill(0);
                const step = 1 << qubit;
                
                for (let i = 0; i < this.dim; i++) {
                    if ((i & step) === 0) {
                        const i1 = i;
                        const i2 = i | step;
                        const a = this.state[i1];
                        const b = this.state[i2];
                        
                        newState[i1] = (a + b) / Math.sqrt(2);
                        newState[i2] = (a - b) / Math.sqrt(2);
                    }
                }
                
                this.state = newState;
            }

            pauliX(qubit) {
                const step = 1 << qubit;
                for (let i = 0; i < this.dim; i++) {
                    if (i & step) {
                        const j = i ^ step;
                        [this.state[i], this.state[j]] = [this.state[j], this.state[i]];
                    }
                }
            }

            pauliY(qubit) {
                const step = 1 << qubit;
                for (let i = 0; i < this.dim; i++) {
                    if (i & step) {
                        const j = i ^ step;
                        [this.state[i], this.state[j]] = [this.state[j], this.state[i]];
                        this.state[j] *= -1;
                    }
                }
            }

            pauliZ(qubit) {
                const step = 1 << qubit;
                for (let i = 0; i < this.dim; i++) {
                    if (i & step) {
                        this.state[i] *= -1;
                    }
                }
            }

            cnot(control, target) {
                const controlMask = 1 << control;
                const targetMask = 1 << target;
                
                for (let i = 0; i < this.dim; i++) {
                    if (i & controlMask) {
                        const j = i ^ targetMask;
                        [this.state[i], this.state[j]] = [this.state[j], this.state[i]];
                    }
                }
            }

            measure(qubit) {
                // Calculate probability of |1⟩
                let prob1 = 0;
                const mask = 1 << qubit;
                
                for (let i = 0; i < this.dim; i++) {
                    if (i & mask) {
                        prob1 += Math.pow(this.state[i], 2);
                    }
                }
                
                // Random measurement
                const result = Math.random() < prob1 ? 1 : 0;
                
                // Collapse state
                const newState = new Array(this.dim).fill(0);
                let norm = 0;
                
                for (let i = 0; i < this.dim; i++) {
                    if (((i & mask) ? 1 : 0) === result) {
                        newState[i] = this.state[i];
                        norm += Math.pow(this.state[i], 2);
                    }
                }
                
                norm = Math.sqrt(norm);
                for (let i = 0; i < this.dim; i++) {
                    this.state[i] = newState[i] / norm;
                }
                
                return result;
            }

            normalize() {
                let norm = 0;
                for (let i = 0; i < this.dim; i++) {
                    norm += Math.pow(this.state[i], 2);
                }
                norm = Math.sqrt(norm);
                
                if (norm > 0) {
                    for (let i = 0; i < this.dim; i++) {
                        this.state[i] /= norm;
                    }
                }
            }

            getProbabilities() {
                return this.state.map(amp => Math.pow(amp, 2));
            }
        }

        class QuantumCircuit {
            constructor() {
                this.nQubits = 3;
                this.state = new QuantumState(this.nQubits);
                this.gates = [];
                this.measurements = [];
            }

            addGate(gate, qubit, control = null) {
                this.gates.push({
                    type: gate,
                    qubit: qubit,
                    control: control,
                    time: this.gates.length
                });
            }

            removeGate(index) {
                this.gates.splice(index, 1);
            }

            run() {
                for (let gate of this.gates) {
                    if (gate.type === 'CNOT') {
                        this.state.applyGate('CNOT', [gate.control, gate.qubit]);
                    } else {
                        this.state.applyGate(gate.type, [gate.qubit]);
                    }
                }
            }

            step() {
                if (this.currentStep < this.gates.length) {
                    const gate = this.gates[this.currentStep];
                    if (gate.type === 'CNOT') {
                        this.state.applyGate('CNOT', [gate.control, gate.qubit]);
                    } else {
                        this.state.applyGate(gate.type, [gate.qubit]);
                    }
                    this.currentStep++;
                }
            }

            reset() {
                this.state = new QuantumState(this.nQubits);
                this.currentStep = 0;
            }

            measureAll() {
                const results = [];
                for (let i = 0; i < this.nQubits; i++) {
                    results.push(this.state.measure(i));
                }
                return results;
            }
        }

        // Initialize circuit
        const circuit = new QuantumCircuit();
        let draggedGate = null;

        function renderCircuit() {
            const grid = document.getElementById('circuitGrid');
            grid.innerHTML = '';
            
            for (let q = 0; q < circuit.nQubits; q++) {
                const line = document.createElement('div');
                line.className = 'qubit-line';
                
                line.innerHTML = `
                    <div class="qubit-label">q${q}</div>
                    <div class="gate-container" id="qubit-${q}" ondrop="drop(event, ${q})" ondragover="allowDrop(event)"></div>
                `;
                
                grid.appendChild(line);
            }
            
            // Place gates
            circuit.gates.forEach((gate, index) => {
                const container = document.getElementById(`qubit-${gate.qubit}`);
                if (container) {
                    const gateEl = createGateElement(gate, index);
                    container.appendChild(gateEl);
                }
            });
        }

        function createGateElement(gate, index) {
            const div = document.createElement('div');
            div.className = `gate ${getGateClass(gate.type)}`;
            div.textContent = gate.type;
            div.setAttribute('data-index', index);
            
            if (gate.type === 'CNOT') {
                const dot = document.createElement('div');
                dot.className = 'control-dot';
                div.appendChild(dot);
                
                const target = document.createElement('div');
                target.className = 'target-x';
                target.innerHTML = '⊕';
                div.appendChild(target);
            }
            
            div.onclick = () => removeGate(index);
            
            return div;
        }

        function getGateClass(type) {
            switch(type) {
                case 'H': return 'hadamard';
                case 'X': return 'pauli-x';
                case 'Y': return 'pauli-y';
                case 'Z': return 'pauli-z';
                case 'CNOT': return 'cnot';
                case 'M': return 'measure';
                default: return '';
            }
        }

        function renderState() {
            const viz = document.getElementById('stateVisualization');
            const probs = circuit.state.getProbabilities();
            
            viz.innerHTML = '';
            
            for (let i = 0; i < probs.length; i++) {
                const state = document.createElement('div');
                state.className = 'state-amp';
                
                const basis = '|' + i.toString(2).padStart(circuit.nQubits, '0') + '⟩';
                const prob = (probs[i] * 100).toFixed(1);
                
                state.innerHTML = `
                    <div class="state-label">
                        <span>${basis}</span>
                        <span>${prob}%</span>
                    </div>
                    <div class="amp-bar">
                        <div class="amp-fill" style="width: ${prob}%"></div>
                        <div class="amp-phase">${circuit.state.phases[i].toFixed(2)}π</div>
                    </div>
                `;
                
                viz.appendChild(state);
            }
            
            // Update probability chart
            const chart = document.getElementById('probChart');
            chart.innerHTML = '';
            
            probs.forEach((prob, i) => {
                const bar = document.createElement('div');
                bar.className = 'prob-bar';
                bar.style.height = (prob * 100) + 'px';
                
                const label = document.createElement('div');
                label.className = 'prob-label';
                label.textContent = i.toString(2).padStart(circuit.nQubits, '0');
                
                bar.appendChild(label);
                chart.appendChild(bar);
            });
            
            // Update measurement result
            const result = document.getElementById('measurementResult');
            const maxProbIndex = probs.indexOf(Math.max(...probs));
            result.textContent = '|' + maxProbIndex.toString(2).padStart(circuit.nQubits, '0') + '⟩';
            
            // Update Bloch sphere (simplified)
            updateBlochSphere();
        }

        function updateBlochSphere() {
            const canvas = document.getElementById('sphereCanvas');
            const ctx = canvas.getContext('2d');
            
            // Draw Bloch sphere representation for first qubit
            const theta = Math.acos(2 * circuit.state.state[0] - 1);
            const phi = circuit.state.phases[0];
            
            ctx.clearRect(0, 0, 200, 200);
            
            // Draw sphere
            ctx.beginPath();
            ctx.arc(100, 100, 80, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(96, 239, 255, 0.3)';
            ctx.stroke();
            
            // Draw axes
            ctx.beginPath();
            ctx.moveTo(100, 20);
            ctx.lineTo(100, 180);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(20, 100);
            ctx.lineTo(180, 100);
            ctx.stroke();
            
            // Draw state vector
            const x = 100 + 80 * Math.sin(theta) * Math.cos(phi);
            const y = 100 - 80 * Math.cos(theta);
            
            ctx.beginPath();
            ctx.moveTo(100, 100);
            ctx.lineTo(x, y);
            ctx.strokeStyle = '#00ff87';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = '#60efff';
            ctx.fill();
        }

        function addQubit() {
            if (circuit.nQubits < 5) {
                circuit.nQubits++;
                circuit.state = new QuantumState(circuit.nQubits);
                renderCircuit();
                renderState();
            }
        }

        function removeQubit() {
            if (circuit.nQubits > 1) {
                circuit.nQubits--;
                circuit.state = new QuantumState(circuit.nQubits);
                circuit.gates = circuit.gates.filter(g => g.qubit < circuit.nQubits);
                renderCircuit();
                renderState();
            }
        }

        function allowDrop(ev) {
            ev.preventDefault();
        }

        function drag(ev) {
            draggedGate = ev.target.getAttribute('data-gate');
            ev.dataTransfer.setData('text', draggedGate);
        }

        function drop(ev, qubit) {
            ev.preventDefault();
            const gate = ev.dataTransfer.getData('text');
            
            if (gate === 'CNOT' && circuit.nQubits > 1) {
                // For CNOT, we need to select control qubit
                const control = prompt('Enter control qubit (0-' + (circuit.nQubits-1) + '):', '0');
                if (control !== null && control >= 0 && control < circuit.nQubits) {
                    circuit.addGate(gate, qubit, parseInt(control));
                }
            } else {
                circuit.addGate(gate, qubit);
            }
            
            renderCircuit();
        }

        function removeGate(index) {
            circuit.gates.splice(index, 1);
            renderCircuit();
        }

        function runCircuit() {
            circuit.run();
            renderState();
        }

        function stepCircuit() {
            circuit.step();
            renderState();
        }

        function resetCircuit() {
            circuit.reset();
            renderState();
        }

        function measureAll() {
            const results = circuit.measureAll();
            alert('Measurement results: ' + results.join(''));
            renderState();
        }

        // Initialize
        renderCircuit();
        renderState();

        // Add CSS for drag and drop
        const style = document.createElement('style');
        style.textContent = `
            .gate-container {
                min-height: 60px;
                border: 2px dashed rgba(96, 239, 255, 0.3);
                border-radius: 10px;
            }
        `;
        document.head.appendChild(style);