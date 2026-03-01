const svg = document.getElementById("canvas");
let n = 12;
let adj = [];
let removed = [];
let size = [];
let parent = [];
let level = [];
let positions = {};

const colors = ["#22c55e","#38bdf8","#f59e0b","#ef4444","#a78bfa","#14b8a6"];

function generateTree() {
    adj = Array.from({ length: n }, () => []);
    removed = Array(n).fill(false);
    level = Array(n).fill(-1);

    for (let i = 1; i < n; i++) {
        let p = Math.floor(Math.random() * i);
        adj[i].push(p);
        adj[p].push(i);
    }

    layoutTree();
    drawTree();
    document.getElementById("output").innerText = "Random tree generated.";
}

function layoutTree() {
    positions = {};
    let x = 80;

    function dfs(u, p, depth) {
        positions[u] = { x: x, y: 70 + depth * 80 };
        x += 70;
        for (let v of adj[u])
            if (v !== p)
                dfs(v, u, depth + 1);
    }

    dfs(0, -1, 0);
}

function drawTree() {
    svg.innerHTML = "";

    // edges
    for (let u = 0; u < n; u++) {
        for (let v of adj[u]) {
            if (u < v) drawEdge(u, v);
        }
    }

    // nodes
    for (let i = 0; i < n; i++) drawNode(i);
}

function drawEdge(u, v) {
    const line = document.createElementNS("http://www.w3.org/2000/svg","line");
    line.setAttribute("x1", positions[u].x);
    line.setAttribute("y1", positions[u].y);
    line.setAttribute("x2", positions[v].x);
    line.setAttribute("y2", positions[v].y);
    line.setAttribute("class","edge");
    svg.appendChild(line);
}

function drawNode(i) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx", positions[i].x);
    circle.setAttribute("cy", positions[i].y);
    circle.setAttribute("r", 18);
    circle.setAttribute("class","node");
    circle.setAttribute("fill", level[i] === -1 ? "#334155" : colors[level[i] % colors.length]);
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg","text");
    text.setAttribute("x", positions[i].x);
    text.setAttribute("y", positions[i].y+4);
    text.setAttribute("text-anchor","middle");
    text.setAttribute("fill","white");
    text.textContent = i;
    svg.appendChild(text);
}

function calcSize(u, p) {
    size[u] = 1;
    for (let v of adj[u])
        if (v !== p && !removed[v])
            size[u] += calcSize(v, u);
    return size[u];
}

function findCentroid(u, p, total) {
    for (let v of adj[u])
        if (v !== p && !removed[v] && size[v] > total/2)
            return findCentroid(v, u, total);
    return u;
}

function build(u, depth) {
    let total = calcSize(u, -1);
    let c = findCentroid(u, -1, total);

    level[c] = depth;
    removed[c] = true;
    drawTree();

    for (let v of adj[c])
        if (!removed[v])
            build(v, depth+1);
}

function decompose() {
    removed.fill(false);
    level.fill(-1);
    build(0,0);
    document.getElementById("output").innerText =
        "Centroid decomposition completed (colors = levels).";
}

function clearAll() {
    svg.innerHTML="";
    document.getElementById("output").innerText="Cleared.";
}