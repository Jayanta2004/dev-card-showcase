let arr = [];
let tree = [];
let n;

function buildTree() {
  arr = document.getElementById("arrayInput").value
    .split(",")
    .map(Number);

  n = arr.length;
  tree = new Array(4 * n).fill(0);

  build(1, 0, n - 1);
  renderTree();
  document.getElementById("result").innerText = "Tree Built Successfully!";
}

function build(node, start, end) {
  if (start === end) {
    tree[node] = arr[start];
  } else {
    let mid = Math.floor((start + end) / 2);
    build(2 * node, start, mid);
    build(2 * node + 1, mid + 1, end);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }
}

function updateValue() {
  let index = parseInt(document.getElementById("updateIndex").value);
  let value = parseInt(document.getElementById("updateValue").value);

  update(1, 0, n - 1, index, value);
  renderTree();
  document.getElementById("result").innerText = `Updated index ${index}`;
}

function update(node, start, end, idx, val) {
  if (start === end) {
    arr[idx] = val;
    tree[node] = val;
  } else {
    let mid = Math.floor((start + end) / 2);
    if (idx <= mid) update(2 * node, start, mid, idx, val);
    else update(2 * node + 1, mid + 1, end, idx, val);

    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }
}

function rangeQuery() {
  let l = parseInt(document.getElementById("queryLeft").value);
  let r = parseInt(document.getElementById("queryRight").value);

  let sum = query(1, 0, n - 1, l, r);
  document.getElementById("result").innerText =
    `Sum from ${l} to ${r} = ${sum}`;

  highlightRange(l, r);
}

function query(node, start, end, l, r) {
  if (r < start || end < l) return 0;
  if (l <= start && end <= r) return tree[node];

  let mid = Math.floor((start + end) / 2);
  return (
    query(2 * node, start, mid, l, r) +
    query(2 * node + 1, mid + 1, end, l, r)
  );
}

function renderTree() {
  const container = document.getElementById("treeContainer");
  container.innerHTML = "";

  let level = 1;
  let index = 1;

  while (index < 2 * n) {
    let levelDiv = document.createElement("div");
    levelDiv.className = "tree-level";

    for (let i = 0; i < level && index < tree.length; i++) {
      if (tree[index] !== 0) {
        let nodeDiv = document.createElement("div");
        nodeDiv.className = "node";
        nodeDiv.innerText = tree[index];
        nodeDiv.id = "node-" + index;
        levelDiv.appendChild(nodeDiv);
      }
      index++;
    }

    container.appendChild(levelDiv);
    level *= 2;
  }
}

function highlightRange(l, r) {
  document.querySelectorAll(".node").forEach(n => 
    n.classList.remove("highlight")
  );

  for (let i = l; i <= r; i++) {
    let leafIndex = findLeafIndex(1, 0, n - 1, i);
    document
      .getElementById("node-" + leafIndex)
      ?.classList.add("highlight");
  }
}

function findLeafIndex(node, start, end, idx) {
  if (start === end) return node;
  let mid = Math.floor((start + end) / 2);
  if (idx <= mid)
    return findLeafIndex(2 * node, start, mid, idx);
  else
    return findLeafIndex(2 * node + 1, mid + 1, end, idx);
}
