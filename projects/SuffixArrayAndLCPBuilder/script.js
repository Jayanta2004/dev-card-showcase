let text = "";
let suffixArray = [];
let lcp = [];

function buildSuffixArray() {
  text = document.getElementById("textInput").value;
  let n = text.length;

  let rank = [];
  let tmp = [];

  suffixArray = Array.from({ length: n }, (_, i) => i);

  for (let i = 0; i < n; i++) {
    rank[i] = text.charCodeAt(i);
  }

  for (let k = 1; k < n; k *= 2) {
    suffixArray.sort((a, b) => {
      if (rank[a] !== rank[b]) return rank[a] - rank[b];
      let ra = a + k < n ? rank[a + k] : -1;
      let rb = b + k < n ? rank[b + k] : -1;
      return ra - rb;
    });

    tmp[suffixArray[0]] = 0;
    for (let i = 1; i < n; i++) {
      tmp[suffixArray[i]] =
        tmp[suffixArray[i - 1]] +
        (compareSuffix(suffixArray[i - 1], suffixArray[i], k, rank) ? 1 : 0);
    }

    for (let i = 0; i < n; i++) rank[i] = tmp[i];
  }

  buildLCP();
  renderTable();
}

function compareSuffix(a, b, k, rank) {
  if (rank[a] !== rank[b]) return true;
  let ra = a + k < text.length ? rank[a + k] : -1;
  let rb = b + k < text.length ? rank[b + k] : -1;
  return ra !== rb;
}

function buildLCP() {
  let n = text.length;
  lcp = Array(n).fill(0);
  let rankPos = Array(n);

  for (let i = 0; i < n; i++) {
    rankPos[suffixArray[i]] = i;
  }

  let h = 0;
  for (let i = 0; i < n; i++) {
    if (rankPos[i] > 0) {
      let j = suffixArray[rankPos[i] - 1];
      while (
        i + h < n &&
        j + h < n &&
        text[i + h] === text[j + h]
      ) {
        h++;
      }
      lcp[rankPos[i]] = h;
      if (h > 0) h--;
    }
  }
}

function renderTable() {
  const container = document.getElementById("tableContainer");
  container.innerHTML = "";

  let table = document.createElement("table");
  table.innerHTML =
    "<tr><th>Index</th><th>Suffix</th><th>LCP</th></tr>";

  for (let i = 0; i < suffixArray.length; i++) {
    let row = document.createElement("tr");
    row.innerHTML =
      `<td>${suffixArray[i]}</td>
       <td>${text.substring(suffixArray[i])}</td>
       <td>${lcp[i]}</td>`;
    table.appendChild(row);
  }

  container.appendChild(table);
  document.getElementById("result").innerText =
    "Suffix Array & LCP Built!";
}

function searchPattern() {
  let pattern = document.getElementById("patternInput").value;
  let n = text.length;

  let left = 0;
  let right = n - 1;
  let foundIndex = -1;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    let suffix = text.substring(suffixArray[mid]);

    if (suffix.startsWith(pattern)) {
      foundIndex = mid;
      break;
    }

    if (suffix < pattern) left = mid + 1;
    else right = mid - 1;
  }

  if (foundIndex !== -1) {
    document.getElementById("result").innerText =
      `Pattern found at index ${suffixArray[foundIndex]}`;
  } else {
    document.getElementById("result").innerText =
      "Pattern not found";
  }
}