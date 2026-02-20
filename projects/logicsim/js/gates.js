const GateLogic = {
    configs: {
        INPUT: { inputCount: 0, outputCount: 1 },
        OUTPUT: { inputCount: 1, outputCount: 0 },
        AND: { inputCount: 2, outputCount: 1 },
        OR: { inputCount: 2, outputCount: 1 },
        NOT: { inputCount: 1, outputCount: 1 },
        NAND: { inputCount: 2, outputCount: 1 },
        NOR: { inputCount: 2, outputCount: 1 },
        XOR: { inputCount: 2, outputCount: 1 }
    },

    getGateConfig(type) {
        return this.configs[type] || { inputCount: 0, outputCount: 0 };
    },

    evaluate(gate) {
        if (gate.type === 'INPUT') {
            return gate.value;
        }

        if (gate.type === 'OUTPUT') {
            return gate.inputs[0]?.value ?? false;
        }

        const inputs = gate.inputs.map(input => input.value ?? false);
        
        switch (gate.type) {
            case 'AND':
                return inputs[0] && inputs[1];
            case 'OR':
                return inputs[0] || inputs[1];
            case 'NOT':
                return !inputs[0];
            case 'NAND':
                return !(inputs[0] && inputs[1]);
            case 'NOR':
                return !(inputs[0] || inputs[1]);
            case 'XOR':
                return inputs[0] !== inputs[1];
            default:
                return false;
        }
    },

    propagate() {
        const processed = new Set();
        const queue = [];

        State.gates.forEach(gate => {
            if (gate.type === 'INPUT') {
                queue.push(gate.id);
            }
        });

        while (queue.length > 0) {
            const gateId = queue.shift();
            if (processed.has(gateId)) continue;
            
            const gate = State.gates.get(gateId);
            if (!gate) continue;

            if (gate.type !== 'INPUT') {
                const allInputsReady = gate.inputs.every(input => {
                    if (input.connections.length === 0) return true;
                    const conn = State.connections.get(input.connections[0]);
                    if (!conn) return true;
                    const sourceGate = State.gates.get(conn.fromGateId);
                    return sourceGate && processed.has(sourceGate.id);
                });

                if (!allInputsReady) {
                    queue.push(gateId);
                    continue;
                }

                gate.inputs.forEach((input, idx) => {
                    if (input.connections.length > 0) {
                        const conn = State.connections.get(input.connections[0]);
                        if (conn) {
                            const sourceGate = State.gates.get(conn.fromGateId);
                            if (sourceGate) {
                                const sourceOutput = sourceGate.outputs[conn.fromPortIndex];
                                input.value = sourceOutput.value;
                            }
                        }
                    }
                });
            }

            const outputValue = this.evaluate(gate);
            gate.value = outputValue;
            
            gate.outputs.forEach(output => {
                output.value = outputValue;
            });

            processed.add(gateId);

            gate.outputs.forEach(output => {
                output.connections.forEach(connId => {
                    const conn = State.connections.get(connId);
                    if (conn) {
                        queue.push(conn.toGateId);
                    }
                });
            });
        }
    }
};
