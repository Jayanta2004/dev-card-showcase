const TABLE_SIZE = 8;
let table = Array.from({ length: TABLE_SIZE }, () => []);

const tableDiv = document.getElementById("table");
const result = document.getElementById("result");

function hash(key) {
  return key.length % TABLE_SIZE;
}

function render(activeIndex = -1, activeKey = "") {
  tableDiv.innerHTML = "";

  table.forEach((bucket, i) => {
    const bucketDiv = document.createElement("div");
    bucketDiv.className = "bucket";

    const title = document.createElement("div");
    title.className = "bucket-title";
    title.textContent = `Index ${i}`;
    bucketDiv.appendChild(title);

    const chain = document.createElement("div");
    chain.className = "chain";

    bucket.forEach(item => {
      const span = document.createElement("span");
      span.className = "item";
      if (i === activeIndex && item === activeKey) {
        span.classList.add("active");
      }
      span.textContent = item;
      chain.appendChild(span);
    });

    bucketDiv.appendChild(chain);
    tableDiv.appendChild(bucketDiv);
  });
}

function insertKey(key) {
  const idx = hash(key);
  if (!table[idx].includes(key)) {
    table[idx].push(key);
    result.textContent = `Result: Inserted "${key}" at index ${idx}`;
  } else {
    result.textContent = `Result: "${key}" already exists`;
  }
  render(idx, key);
}

function searchKey(key) {
  const idx = hash(key);
  if (table[idx].includes(key)) {
    result.textContent = `Result: Found "${key}" at index ${idx}`;
    render(idx, key);
  } else {
    result.textContent = `Result: "${key}" not found`;
    render();
  }
}

function deleteKey(key) {
  const idx = hash(key);
  const pos = table[idx].indexOf(key);

  if (pos !== -1) {
    table[idx].splice(pos, 1);
    result.textContent = `Result: Deleted "${key}" from index ${idx}`;
    render();
  } else {
    result.textContent = `Result: "${key}" not found`;
  }
}

/* ---------- Events ---------- */

document.getElementById("insertBtn").addEventListener("click", () => {
  const key = document.getElementById("keyInput").value.trim();
  if (key) insertKey(key);
});

document.getElementById("searchBtn").addEventListener("click", () => {
  const key = document.getElementById("keyInput").value.trim();
  if (key) searchKey(key);
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const key = document.getElementById("keyInput").value.trim();
  if (key) deleteKey(key);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  table = Array.from({ length: TABLE_SIZE }, () => []);
  render();
  result.textContent = "Result: Table Reset";
});

render();