const workspace = document.getElementById("workspace");
const output = document.getElementById("output");

const connectionCanvas = document.getElementById("connectionCanvas");
const ctx = connectionCanvas.getContext("2d");

connectionCanvas.width = window.innerWidth;
connectionCanvas.height = window.innerHeight;

const gridCanvas = document.getElementById("gridCanvas");
const gridCtx = gridCanvas.getContext("2d");

gridCanvas.width = window.innerWidth;
gridCanvas.height = window.innerHeight;

let nodes = [];
let connections = [];

let nodeIdCounter = 0;

let pendingConnection = null;

/* =========================
   NODE CLASS
========================= */

class Node {

constructor(type, x, y) {

this.id = nodeIdCounter++;
this.type = type;
this.x = x;
this.y = y;
this.value = 0;

this.element = document.createElement("div");
this.element.className = "node";

this.element.style.left = x + "px";
this.element.style.top = y + "px";

this.createUI();
workspace.appendChild(this.element);

nodes.push(this);

this.enableDrag();

}

/* =========================
   CREATE NODE UI
========================= */

createUI() {

const header = document.createElement("div");
header.className = "node-header";
header.innerText = this.type;

this.element.appendChild(header);

/* Number input */

if (this.type === "Number") {

const input = document.createElement("input");

input.type = "number";
input.value = 0;

input.addEventListener("input", () => {
this.value = parseFloat(input.value) || 0;
});

this.element.appendChild(input);

}

/* OUTPUT PORT */

this.outputPort = document.createElement("div");
this.outputPort.className = "port output-port";
this.outputPort.style.top = "50%";

this.outputPort.addEventListener("click", (e) => {

e.stopPropagation();

pendingConnection = this;

this.outputPort.style.background = "yellow";

});

this.element.appendChild(this.outputPort);

/* INPUT PORT */

this.inputPort = document.createElement("div");
this.inputPort.className = "port input-port";
this.inputPort.style.top = "50%";

this.inputPort.addEventListener("click", (e) => {

e.stopPropagation();

if (pendingConnection && pendingConnection !== this) {

connections.push({

from: pendingConnection,
to: this

});

pendingConnection.outputPort.style.background = "#00fff2";

pendingConnection = null;

drawConnections();

}

});

this.element.appendChild(this.inputPort);

}

/* =========================
   DRAG SYSTEM (FIXED)
========================= */

enableDrag() {

let offsetX = 0;
let offsetY = 0;
let dragging = false;

this.element.addEventListener("mousedown", (e) => {

if (e.target.classList.contains("port")) return;

dragging = true;

offsetX = e.offsetX;
offsetY = e.offsetY;

});

document.addEventListener("mousemove", (e) => {

if (!dragging) return;

this.x = e.clientX - offsetX;
this.y = e.clientY - offsetY;

this.element.style.left = this.x + "px";
this.element.style.top = this.y + "px";

drawConnections();

});

document.addEventListener("mouseup", () => {

dragging = false;

});

}

}

/* =========================
   DRAW CONNECTIONS
========================= */

function drawConnections() {

ctx.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);

connections.forEach(conn => {

const fromX = conn.from.x + 150;
const fromY = conn.from.y + 30;

const toX = conn.to.x;
const toY = conn.to.y + 30;

ctx.beginPath();

ctx.moveTo(fromX, fromY);

/* curved line */

const midX = (fromX + toX) / 2;

ctx.bezierCurveTo(
midX, fromY,
midX, toY,
toX, toY
);

ctx.strokeStyle = "#00fff2";
ctx.lineWidth = 2;

ctx.stroke();

});

}

/* =========================
   EXECUTE GRAPH
========================= */

function runGraph() {

/* calculate values */

nodes.forEach(node => {

if (node.type === "Add") {

const inputs = connections.filter(c => c.to === node);

node.value = 0;

inputs.forEach(conn => {
node.value += conn.from.value;
});

}

if (node.type === "Multiply") {

const inputs = connections.filter(c => c.to === node);

node.value = inputs.length ? 1 : 0;

inputs.forEach(conn => {
node.value *= conn.from.value;
});

}

});

/* show last node value */

if (nodes.length > 0) {

const lastNode = nodes[nodes.length - 1];

output.innerText = lastNode.value;

}

}

/* =========================
   BUTTON EVENTS
========================= */

document.getElementById("addNumberNode").onclick = () => {

new Node("Number", 100 + Math.random()*200, 100 + Math.random()*200);

};

document.getElementById("addAddNode").onclick = () => {

new Node("Add", 300 + Math.random()*200, 100 + Math.random()*200);

};

document.getElementById("addMultiplyNode").onclick = () => {

new Node("Multiply", 500 + Math.random()*200, 100 + Math.random()*200);

};

document.getElementById("runGraph").onclick = runGraph;

document.getElementById("clearGraph").onclick = () => {

nodes.forEach(n => n.element.remove());

nodes = [];
connections = [];

drawConnections();

output.innerText = "";

};

/* =========================
   GRID BACKGROUND
========================= */

function drawGrid() {

gridCtx.clearRect(0,0,gridCanvas.width,gridCanvas.height);

gridCtx.strokeStyle = "rgba(0,255,242,0.1)";

for (let x = 0; x < gridCanvas.width; x += 40) {

gridCtx.beginPath();
gridCtx.moveTo(x,0);
gridCtx.lineTo(x,gridCanvas.height);
gridCtx.stroke();

}

for (let y = 0; y < gridCanvas.height; y += 40) {

gridCtx.beginPath();
gridCtx.moveTo(0,y);
gridCtx.lineTo(gridCanvas.width,y);
gridCtx.stroke();

}

requestAnimationFrame(drawGrid);

}

drawGrid();
