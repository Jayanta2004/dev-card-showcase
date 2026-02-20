let adj = [];
let parent = [];
let depth = [];
let heavy = [];
let head = [];
let pos = [];
let subtree = [];
let baseArray = [];
let segTree = [];
let curPos = 0;
let n;

function buildHLD() {
  const edges = document.getElementById("edgesInput")
    .value.trim().split("\n");

  n = 0;
  adj = [];
  edges.forEach(line => {
    let [u, v] = line.split(" ").map(Number);
    n = Math.max(n, u, v);
  });
  n++;

  adj = Array.from({ length: n }, () => []);

  edges.forEach(line => {
    let [u, v] = line.split(" ").map(Number);
    adj[u].push(v);
    adj[v].push(u);
  });

  parent = Array(n).fill(-1);
  depth = Array(n).fill(0);
  heavy = Array(n).fill(-1);
  head = Array(n).fill(0);
  pos = Array(n).fill(0);
  subtree = Array(n).fill(0);
  baseArray = Array(n).fill(1); // Node value = 1
  segTree = Array(4 * n).fill(0);
  curPos = 0;

  dfs(0);
  decompose(0, 0);
  buildSegTree(1, 0, n - 1);

  renderTree();
  document.getElementById("result").innerText = "HLD Built Successfully!";
}

function dfs(u, p = -1) {
  subtree[u] = 1;
  parent[u] = p;

  let maxSize = 0;

  for (let v of adj[u]) {
    if (v === p) continue;
    depth[v] = depth[u] + 1;
    dfs(v, u);
    subtree[u] += subtree[v];

    if (subtree[v] > maxSize) {
      maxSize = subtree[v];
      heavy[u] = v;
    }
  }
}

function decompose(u, h) {
  head[u] = h;
  pos[u] = curPos++;
  baseArray[pos[u]] = 1;

  if (heavy[u] !== -1) {
    decompose(heavy[u], h);
  }

  for (let v of adj[u]) {
    if (v !== parent[u] && v !== heavy[u]) {
      decompose(v, v);
    }
  }
}

function buildSegTree(node, start, end) {
  if (start === end) {
    segTree[node] = baseArray[start];
  } else {
    let mid = Math.floor((start + end) / 2);
    buildSegTree(node * 2, start, mid);
    buildSegTree(node * 2 + 1, mid + 1, end);
    segTree[node] = segTree[node * 2] + segTree[node * 2 + 1];
  }
}

function querySegTree(node, start, end, l, r) {
  if (r < start || end < l) return 0;
  if (l <= start && end <= r) return segTree[node];

  let mid = Math.floor((start + end) / 2);
  return querySegTree(node * 2, start, mid, l, r) +
         querySegTree(node * 2 + 1, mid + 1, end, l, r);
}

function queryPath() {
  let u = parseInt(document.getElementById("uNode").value);
  let v = parseInt(document.getElementById("vNode").value);

  let result = 0;

  while (head[u] !== head[v]) {
    if (depth[head[u]] < depth[head[v]]) {
      [u, v] = [v, u];
    }
    result += querySegTree(1, 0, n - 1, pos[head[u]], pos[u]);
    u = parent[head[u]];
  }

  if (depth[u] > depth[v]) {
    [u, v] = [v, u];
  }

  result += querySegTree(1, 0, n - 1, pos[u], pos[v]);

  document.getElementById("result").innerText =
    `Path Sum = ${result}`;

  highlightPath(u, v);
}

function highlightPath(u, v) {
  document.querySelectorAll(".node").forEach(n =>
    n.classList.remove("highlight")
  );

  let visited = new Set();

  while (head[u] !== head[v]) {
    if (depth[head[u]] < depth[head[v]]) {
      [u, v] = [v, u];
    }
    let cur = u;
    while (cur !== parent[head[u]]) {
      visited.add(cur);
      cur = parent[cur];
    }
    u = parent[head[u]];
  }

  let cur = u;
  while (cur !== parent[v]) {
    visited.add(cur);
    cur = parent[cur];
  }

  visited.forEach(node =>
    document.getElementById("node-" + node)?.classList.add("highlight")
  );
}

function renderTree() {
  const container = document.getElementById("treeContainer");
  container.innerHTML = "";

  for (let i = 0; i < n; i++) {
    let div = document.createElement("div");
    div.className = "node";
    div.id = "node-" + i;
    div.innerText = i;
    container.appendChild(div);
  }
}