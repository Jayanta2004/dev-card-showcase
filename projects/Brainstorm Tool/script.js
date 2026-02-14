const canvas = document.getElementById("canvas");
const svg = document.getElementById("connections");
const exportWrapper = document.getElementById("export-wrapper");

let nodes = [];
let connections = [];
let connectStart = null;
let scale = 1;

/* ================= NODE FUNCTIONS ================= */

function addNode(x = 300, y = 200, text = "New Idea", color = null) {
  const node = document.createElement("div");
  node.className = "node";
  node.contentEditable = true;
  node.innerText = text;
  node.style.left = x + "px";
  node.style.top = y + "px";

  if (color) node.style.background = color;

  canvas.appendChild(node);
  nodes.push(node);

  node.onmousedown = e => dragNode(e, node);
  node.onclick = e => selectNode(e, node);

  saveState();
}

function dragNode(e, node) {
  let offsetX = e.offsetX;
  let offsetY = e.offsetY;

  function move(ev) {
    node.style.left = (ev.pageX / scale - offsetX) + "px";
    node.style.top = (ev.pageY / scale - offsetY) + "px";
    redrawLines();
  }

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", move);
    saveState();
  }, { once: true });
}

/* ================= CONNECT NODES ================= */

function connectMode() {
  connectStart = null;
  alert("Click two nodes to connect them");
}

function selectNode(e, node) {
  if (!connectStart) {
    connectStart = node;
  } else {
    if (connectStart !== node) {
      connectNodes(connectStart, node);
      connectStart = null;
    }
  }
}

function connectNodes(a, b) {
  connections.push({ from: a, to: b });
  redrawLines();
  saveState();
}

/* ================= DRAW LINES ================= */

function redrawLines() {
  svg.innerHTML = "";
  const canvasRect = canvas.getBoundingClientRect();

  connections.forEach(c => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    const r1 = c.from.getBoundingClientRect();
    const r2 = c.to.getBoundingClientRect();

    // relative to canvas container
    const x1 = (r1.left + r1.width / 2) - canvasRect.left;
    const y1 = (r1.top + r1.height / 2) - canvasRect.top;
    const x2 = (r2.left + r2.width / 2) - canvasRect.left;
    const y2 = (r2.top + r2.height / 2) - canvasRect.top;

    line.setAttribute("x1", x1 / scale);
    line.setAttribute("y1", y1 / scale);
    line.setAttribute("x2", x2 / scale);
    line.setAttribute("y2", y2 / scale);
    line.classList.add("line");

    svg.appendChild(line);
  });
}

/* ================= STORAGE ================= */

function saveState() {
  const data = {
    nodes: nodes.map(n => ({
      x: n.style.left,
      y: n.style.top,
      text: n.innerText,
      color: n.style.background
    })),
    connections: connections.map(c => ({
      from: nodes.indexOf(c.from),
      to: nodes.indexOf(c.to)
    }))
  };
  localStorage.setItem("mindmap", JSON.stringify(data));
}

function loadState() {
  const data = JSON.parse(localStorage.getItem("mindmap"));
  if (!data) return;

  canvas.innerHTML = "";
  svg.innerHTML = "";
  nodes = [];
  connections = [];

  data.nodes.forEach(n =>
    addNode(parseInt(n.x), parseInt(n.y), n.text, n.color)
  );

  data.connections.forEach(c =>
    connectNodes(nodes[c.from], nodes[c.to])
  );
}

loadState();

/* ================= EXPORT / IMPORT ================= */

function exportJSON() {
  const blob = new Blob([localStorage.getItem("mindmap")], { type: "application/json" });
  download(blob, "mindmap.json");
}

function importJSON() {
  document.getElementById("importFile").click();
}

document.getElementById("importFile").onchange = e => {
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("mindmap", reader.result);
    location.reload();
  };
  reader.readAsText(e.target.files[0]);
};

function exportPNG() {
  html2canvas(exportWrapper).then(canvasImg => {
    canvasImg.toBlob(blob => download(blob, "mindmap.png"));
  });
}

function download(blob, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

/* ================= ZOOM ================= */

document.addEventListener("wheel", e => {
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.4, scale), 2);
  exportWrapper.style.transform = `scale(${scale})`;
  redrawLines();
});

function newProject() {
  if (!confirm("Are you sure you want to start a new project? This will clear all nodes and connections.")) {
    return;
  }

  // Clear nodes and connections
  nodes = [];
  connections = [];
  canvas.innerHTML = "";
  svg.innerHTML = "";

  // Clear LocalStorage
  localStorage.removeItem("mindmap");
}
