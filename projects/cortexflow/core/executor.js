export class Executor {
    constructor(graph) {
        this.graph = graph;
    }

    async execute(startNode) {
        let current = startNode;
        let data = null;

        while (current) {
            this.highlight(current.id);

            data = await current.run(data);

            document.getElementById("resultPanel").innerText =
                "Result: " + data;

            await this.delay(700);

            const nextNodes = this.graph.getNext(current.id);
            current = nextNodes[0];
        }
    }

    highlight(nodeId) {
        document.querySelectorAll(".node-box").forEach(n => {
            n.style.background = "white";
        });

        const nodeEl = document.querySelector(
            `[data-id='${nodeId}']`
        );

        if (nodeEl) {
            nodeEl.style.background = "#fde68a";
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}