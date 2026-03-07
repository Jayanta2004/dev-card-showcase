const canvas = document.getElementById("canvas");
const clearBtn = document.getElementById("clearBtn");
const svg = document.getElementById("connections");

let connections = [];
let selectedNodeForConnection = null;
let nodes = [];
let dragNode = null;
let offsetX = 0;
let offsetY = 0;

/* Load Saved */

window.addEventListener("load", () => {
  const saved = JSON.parse(localStorage.getItem("thoughtNodes")) || [];
  saved.forEach(n => createNode(n.x, n.y, n.text, n.theme));
});
/* Save */

function saveNodes() {
  const data = nodes.map(n => ({
    x: parseInt(n.style.left),
    y: parseInt(n.style.top),
    text: n.querySelector("input").value,
    theme: n.dataset.theme || "default"
  }));
  localStorage.setItem("thoughtNodes", JSON.stringify(data));
}

/* Create Node */

function createNode(x, y, text = "New Idea", theme = "default")  {
  const node = document.createElement("div");
  node.classList.add("idea-node");
  node.style.left = x + "px";
  node.style.top = y + "px";

  node.dataset.theme = theme;

if (theme !== "default") {
  node.classList.add(`theme-${theme}`);
}

  const input = document.createElement("input");
  input.value = text;

  node.appendChild(input);
  canvas.appendChild(node);
  nodes.push(node);

  node.addEventListener("mousedown", (e) => {
    dragNode = node;
    node.classList.add("dragging");
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    e.stopPropagation();
  });

  // Double click to delete
  node.addEventListener("dblclick", () => {
    node.classList.add("removing");

    setTimeout(() => {
        node.remove();
        nodes = nodes.filter(n => n !== node);
        saveNodes();
    }, 250);
  });

  // Click to activate
node.addEventListener("click", (e) => {
  e.stopPropagation();

  nodes.forEach(n => n.classList.remove("active"));
  node.classList.add("active");
});

// Right click to change color
node.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  const themes = ["blue", "green", "yellow", "purple"];
  let current = node.dataset.theme || "default";

  let nextIndex = themes.indexOf(current) + 1;
  if (nextIndex >= themes.length) nextIndex = 0;

  const nextTheme = themes[nextIndex];

  node.classList.remove(
    "theme-blue",
    "theme-green",
    "theme-yellow",
    "theme-purple"
  );

  node.classList.add(`theme-${nextTheme}`);
  node.dataset.theme = nextTheme;

  saveNodes();
});

// Shift + Click to connect nodes
node.addEventListener("click", (e) => {
  if (!e.shiftKey) return;

  e.stopPropagation();

  if (!selectedNodeForConnection) {
    selectedNodeForConnection = node;
    node.classList.add("active");
  } else {
    if (selectedNodeForConnection !== node) {
      createConnection(selectedNodeForConnection, node);
    }

    selectedNodeForConnection.classList.remove("active");
    selectedNodeForConnection = null;
  }
});

  input.addEventListener("input", saveNodes);

  saveNodes();
}


canvas.addEventListener("click", () => {
  nodes.forEach(n => n.classList.remove("active"));
}); 

function createConnection(nodeA, nodeB) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
  line.classList.add("connection-line");

  svg.appendChild(line);

  connections.push({ nodeA, nodeB, line });

  updateConnections();
}

function updateConnections() {
  connections.forEach(conn => {
    const rectA = conn.nodeA.getBoundingClientRect();
    const rectB = conn.nodeB.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();

    const x1 = rectA.left + rectA.width / 2 - canvasRect.left;
    const y1 = rectA.top + rectA.height / 2 - canvasRect.top;
    const x2 = rectB.left + rectB.width / 2 - canvasRect.left;
    const y2 = rectB.top + rectB.height / 2 - canvasRect.top;

    const dx = Math.abs(x2 - x1) * 0.4;

    const pathData = `
      M ${x1} ${y1}
      C ${x1 + dx} ${y1},
        ${x2 - dx} ${y2},
        ${x2} ${y2}
    `;

    conn.line.setAttribute("d", pathData);
  });
}

/* Click to Create */

canvas.addEventListener("click", (e) => {
  if (e.target !== canvas) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  createNode(x, y);
});

/* Drag Move */

document.addEventListener("mousemove", (e) => {
  if (!dragNode) return;

  const rect = canvas.getBoundingClientRect();
  dragNode.style.left = e.clientX - rect.left - offsetX + "px";
  dragNode.style.top = e.clientY - rect.top - offsetY + "px";
  updateConnections();
});

/* Drag End */

document.addEventListener("mouseup", () => {
  if (dragNode) {
    dragNode.classList.remove("dragging");
    saveNodes();
  }
  dragNode = null;
});

/* Clear */

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("thoughtNodes");
  nodes.forEach(n => n.remove());
  nodes = [];
});