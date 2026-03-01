export class Engine {
    constructor(graph) {
        this.graph = graph;
    }

    run(startNodeId) {
        const startNode = this.graph.nodes.find(n => n.id === startNodeId);
        if (startNode) {
            startNode.run();
        }
    }
}