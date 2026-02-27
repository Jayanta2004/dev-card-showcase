export class Serializer {
    static export(graph) {
        return JSON.stringify({
            nodes: graph.nodes,
            connections: graph.connections
        });
    }

    static import(data, graph) {
        const parsed = JSON.parse(data);
        graph.nodes = parsed.nodes;
        graph.connections = parsed.connections;
    }
}