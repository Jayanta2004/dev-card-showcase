export class FlowCanvas {
    constructor(graph) {
        this.graph = graph;
        this.canvas = document.getElementById("flowCanvas");
        this.ctx = this.canvas.getContext("2d");
    }

    init() {
        this.canvas.width = window.innerWidth - 250;
        this.canvas.height = window.innerHeight;
        this.draw();
    }
    

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.graph.connections.forEach(conn => {
            const fromNode = this.graph.nodes.find(n => n.id === conn.from);
            const toNode = this.graph.nodes.find(n => n.id === conn.to);

            this.ctx.beginPath();
            this.ctx.moveTo(fromNode.x + 50, fromNode.y + 20);
            this.ctx.lineTo(toNode.x, toNode.y + 20);
            this.ctx.stroke();
        });

        requestAnimationFrame(() => this.draw());
    }
}