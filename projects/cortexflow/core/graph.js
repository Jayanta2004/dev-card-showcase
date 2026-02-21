export class Graph {
    constructor() {
        this.nodes = [];
        this.connections = [];
    }

    addNode(node) {
        this.nodes.push(node);
    }

    addConnection(from, to) {
        this.connections.push({ from, to });
    }

    getNext(nodeId) {
        return this.connections
            .filter(c => c.from === nodeId)
            .map(c => this.nodes.find(n => n.id === c.to));
    }
}