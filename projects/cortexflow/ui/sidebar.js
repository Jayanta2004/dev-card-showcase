import { InputNode } from "../nodes/inputNode.js";
import { TransformNode } from "../nodes/transformNode.js";
import { LogNode } from "../nodes/logNode.js";

export class Sidebar {
    constructor(graph, canvas, executor) {
        this.graph = graph;
        this.executor = executor;
        this.sidebar = document.getElementById("sidebar");
    }

    init() {
        this.sidebar.innerHTML = `
            <h3>Nodes</h3>
            <button id="addInput">Input</button>
            <button id="addTransform">Transform</button>
            <button id="addLog">Log</button>
            <hr>
            <button id="runFlow">Run Flow</button>
        `;

        document.getElementById("addInput").onclick = () =>
            this.addNode(new InputNode());

        document.getElementById("addTransform").onclick = () =>
            this.addNode(new TransformNode());

        document.getElementById("addLog").onclick = () =>
            this.addNode(new LogNode());

        document.getElementById("runFlow").onclick = () => {
            if (this.graph.nodes.length > 0) {
                this.executor.execute(this.graph.nodes[0]);
            }
        };
    }

    addNode(nodeInstance) {
        this.graph.addNode(nodeInstance);

        const nodeEl = document.createElement("div");
        nodeEl.classList.add("node-box");
        nodeEl.innerText = nodeInstance.type;
        nodeEl.setAttribute("data-id", nodeInstance.id);

        nodeEl.style.left = nodeInstance.x + "px";
        nodeEl.style.top = nodeInstance.y + "px";

        document.getElementById("flowArea").appendChild(nodeEl);

        // AUTO CONNECT sequentially
        if (this.graph.nodes.length > 1) {
            const prev =
                this.graph.nodes[this.graph.nodes.length - 2];
            this.graph.addConnection(prev.id, nodeInstance.id);
        }

        let offsetX, offsetY;

        nodeEl.onmousedown = (e) => {
            offsetX = e.offsetX;
            offsetY = e.offsetY;

            document.onmousemove = (e) => {
                nodeEl.style.left = (e.pageX - offsetX) + "px";
                nodeEl.style.top = (e.pageY - offsetY) + "px";

                nodeInstance.x = parseInt(nodeEl.style.left);
                nodeInstance.y = parseInt(nodeEl.style.top);
            };

            document.onmouseup = () => {
                document.onmousemove = null;
            };
        };
    }
}