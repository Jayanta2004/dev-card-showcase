// ---------- STACK ----------
let stack = [];

function pushStack() {
  const val = stackInput.value;
  if (!val) return;
  stack.push(val);
  stackInput.value = "";
  renderStack();
}

function popStack() {
  stack.pop();
  renderStack();
}

function renderStack() {
  stackDiv.innerHTML = "";
  [...stack].reverse().forEach(v => stackDiv.appendChild(block(v)));
}

// ---------- HEAP ----------
let heap = [];

function addHeap() {
  const val = heapInput.value;
  if (!val) return;
  heap.push(val);
  heapInput.value = "";
  renderHeap();
}

function deleteHeap() {
  heap.pop();
  renderHeap();
}

function renderHeap() {
  heapDiv.innerHTML = "";
  heap.forEach(v => heapDiv.appendChild(block(v)));
}

// ---------- LRU CACHE ----------
const CACHE_SIZE = 4;
let lru = [];

function addLRU() {
  const val = lruInput.value;
  if (!val) return;

  if (lru.includes(val)) {
    lru = lru.filter(v => v !== val);
  } else if (lru.length >= CACHE_SIZE) {
    lru.shift();
  }
  lru.push(val);
  lruInput.value = "";
  renderLRU();
}

function deleteLRU() {
  lru.shift();
  renderLRU();
}

function renderLRU() {
  lruDiv.innerHTML = "";
  lru.forEach(v => lruDiv.appendChild(block(v)));
}

// ---------- FIFO CACHE ----------
let fifo = [];

function addFIFO() {
  const val = fifoInput.value;
  if (!val) return;

  if (fifo.length >= CACHE_SIZE) {
    fifo.shift();
  }
  fifo.push(val);
  fifoInput.value = "";
  renderFIFO();
}

function deleteFIFO() {
  fifo.shift();
  renderFIFO();
}

function renderFIFO() {
  fifoDiv.innerHTML = "";
  fifo.forEach(v => fifoDiv.appendChild(block(v)));
}

// ---------- UTILS ----------
const stackDiv = document.getElementById("stack");
const heapDiv = document.getElementById("heap");
const lruDiv = document.getElementById("lru");
const fifoDiv = document.getElementById("fifo");

function block(text) {
  const div = document.createElement("div");
  div.className = "block";
  div.innerText = text;
  return div;
}
