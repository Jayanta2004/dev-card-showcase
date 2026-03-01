let arr = [];
let queries = [];
let blockSize;
let currentL = 0;
let currentR = -1;
let freq = {};
let distinctCount = 0;

function initialize() {
  arr = document.getElementById("arrayInput")
    .value.split(",")
    .map(Number);

  renderArray();
}

function renderArray(l = -1, r = -1) {
  const container = document.getElementById("arrayContainer");
  container.innerHTML = "";

  arr.forEach((val, idx) => {
    let div = document.createElement("div");
    div.className = "element";
    div.innerText = val;

    if (idx >= l && idx <= r) {
      div.classList.add("active");
    }

    container.appendChild(div);
  });
}

function processQueries() {
  const rawQueries = document.getElementById("queriesInput")
    .value.trim().split("\n");

  queries = rawQueries.map((line, index) => {
    let [l, r] = line.split(" ").map(Number);
    return { l, r, index };
  });

  blockSize = Math.floor(Math.sqrt(arr.length));

  queries.sort((a, b) => {
    let blockA = Math.floor(a.l / blockSize);
    let blockB = Math.floor(b.l / blockSize);
    if (blockA !== blockB) return blockA - blockB;
    return a.r - b.r;
  });

  document.getElementById("orderContainer").innerHTML =
    "<div class='query-order'>Processing Order: " +
    queries.map(q => `[${q.l},${q.r}]`).join(" → ") +
    "</div>";

  freq = {};
  distinctCount = 0;
  currentL = 0;
  currentR = -1;

  processStep(0);
}

function processStep(i) {
  if (i >= queries.length) {
    document.getElementById("info").innerText =
      "All queries processed!";
    return;
  }

  let { l, r } = queries[i];

  while (currentL > l) add(--currentL);
  while (currentR < r) add(++currentR);
  while (currentL < l) remove(currentL++);
  while (currentR > r) remove(currentR--);

  renderArray(currentL, currentR);

  document.getElementById("info").innerText =
    `Query [${l},${r}] → Distinct Elements = ${distinctCount}`;

  setTimeout(() => processStep(i + 1), 1500);
}

function add(index) {
  let value = arr[index];
  freq[value] = (freq[value] || 0) + 1;
  if (freq[value] === 1) distinctCount++;
}

function remove(index) {
  let value = arr[index];
  freq[value]--;
  if (freq[value] === 0) distinctCount--;
}