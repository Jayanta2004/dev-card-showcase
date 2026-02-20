const canvas = document.getElementById("canvas");
const svg = document.getElementById("lines");
const addBtn = document.getElementById("addConceptBtn");
const connectBtn = document.getElementById("connectBtn");
const input = document.getElementById("conceptInput");

let concepts = [];
let selected = [];
let connections = [];

function randomPosition() {
    return {
        x: Math.random() * (canvas.clientWidth - 120) + 20,
        y: Math.random() * (canvas.clientHeight - 60) + 20
    };
}

function createConcept(name) {
    const pos = randomPosition();

    const div = document.createElement("div");
    div.className = "concept";
    div.textContent = name;
    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";

    div.onclick = () => toggleSelect(div);

    canvas.appendChild(div);
    concepts.push(div);
}

function toggleSelect(el) {
    el.classList.toggle("selected");

    if (selected.includes(el)) {
        selected = selected.filter(e => e !== el);
    } else {
        selected.push(el);
    }
}

function connectConcepts() {
    if (selected.length !== 2) return;

    connections.push([selected[0], selected[1]]);
    selected.forEach(el => el.classList.remove("selected"));
    selected = [];

    drawConnections();
}

function drawConnections() {
    svg.innerHTML = "";

    connections.forEach(([a, b]) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const x1 = rectA.left + rectA.width / 2 - canvasRect.left;
        const y1 = rectA.top + rectA.height / 2 - canvasRect.top;
        const x2 = rectB.left + rectB.width / 2 - canvasRect.left;
        const y2 = rectB.top + rectB.height / 2 - canvasRect.top;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "#38bdf8");
        line.setAttribute("stroke-width", "2");

        svg.appendChild(line);
    });
}

addBtn.onclick = () => {
    const name = input.value.trim();
    if (!name) return;

    createConcept(name);
    input.value = "";
};

connectBtn.onclick = connectConcepts;
