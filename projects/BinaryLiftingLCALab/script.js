let adj = [];
let depth = [];
let parent = [];
let up = [];
let LOG;
let n;

function buildTree() {
  const edges = document.getElementById("edgesInput")
    .value.trim().split("\n");

  n = 0;
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

  depth = Array(n).fill(0);
  parent = Array(n).fill(-1);

  LOG = Math.ceil(Math.log2(n));
  up = Array.from({ length: n }, () => Array(LOG).fill(-1));

  dfs(0, -1);

  for (let j = 1; j < LOG; j++) {
    for (let i = 0; i < n; i++) {
      if (up[i][j - 1] !== -1) {
        up[i][j] = up[up[i][j - 1]][j - 1];
      }
    }
  }

  renderTable();
  document.getElementById("result").innerText = "Binary Lifting Table Built!";
}

function dfs(u, p) {
  parent[u] = p;
  up[u][0] = p;

  for (let v of adj[u]) {
    if (v === p) continue;
    depth[v] = depth[u] + 1;
    dfs(v, u);
  }
}

function lift(u, k) {
  for (let i = 0; i < LOG; i++) {
    if (k & (1 << i)) {
      u = up[u][i];
      if (u === -1) break;
    }
  }
  return u;
}

function queryLCA() {
  let u = parseInt(document.getElementById("nodeU").value);
  let v = parseInt(document.getElementById("nodeV").value);

  if (depth[u] < depth[v]) [u, v] = [v, u];

  u = lift(u, depth[u] - depth[v]);

  if (u === v) {
    document.getElementById("result").innerText = `LCA = ${u}`;
    return;
  }

  for (let i = LOG - 1; i >= 0; i--) {
    if (up[u][i] !== up[v][i]) {
      u = up[u][i];
      v = up[v][i];
    }
  }

  document.getElementById("result").innerText =
    `LCA = ${parent[u]}`;
}

function queryKth() {
  let node = parseInt(document.getElementById("kNode").value);
  let k = parseInt(document.getElementById("kValue").value);

  let ancestor = lift(node, k);

  document.getElementById("result").innerText =
    ancestor !== -1 ? `${k}-th ancestor = ${ancestor}` : "No such ancestor";
}

function renderTable() {
  const container = document.getElementById("tableContainer");
  container.innerHTML = "";

  let table = document.createElement("table");

  let header = document.createElement("tr");
  header.innerHTML = "<th>Node</th>";
  for (let j = 0; j < LOG; j++) {
    header.innerHTML += `<th>2^${j}</th>`;
  }
  table.appendChild(header);

  for (let i = 0; i < n; i++) {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${i}</td>`;
    for (let j = 0; j < LOG; j++) {
      row.innerHTML += `<td>${up[i][j]}</td>`;
    }
    table.appendChild(row);
  }

  container.appendChild(table);
}