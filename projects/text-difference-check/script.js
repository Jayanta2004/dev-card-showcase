const textA = document.getElementById("textA");
const textB = document.getElementById("textB");
const diffResult = document.getElementById("diffResult");

const addedEl = document.getElementById("added");
const removedEl = document.getElementById("removed");
const similarityEl = document.getElementById("similarity");

const ignoreCase = document.getElementById("ignoreCase");
const ignoreSpace = document.getElementById("ignoreSpace");
const themeToggle = document.getElementById("themeToggle");

function normalize(text) {
  let t = text;
  if (ignoreCase.checked) t = t.toLowerCase();
  if (ignoreSpace.checked) t = t.replace(/\s+/g, " ");
  return t;
}

function diffLines(a, b) {
  const A = normalize(a).split("\n");
  const B = normalize(b).split("\n");

  const max = Math.max(A.length, B.length);
  let added = 0, removed = 0, same = 0;
  let html = "";

  for (let i = 0; i < max; i++) {
    if (A[i] === B[i]) {
      if (A[i] !== undefined) {
        same++;
        html += `<div class="diff-line same">  ${A[i]}</div>`;
      }
    } else {
      if (A[i] !== undefined) {
        removed++;
        html += `<div class="diff-line del">- ${A[i]}</div>`;
      }
      if (B[i] !== undefined) {
        added++;
        html += `<div class="diff-line add">+ ${B[i]}</div>`;
      }
    }
  }

  const total = added + removed + same || 1;
  const similarity = Math.round((same / total) * 100);

  addedEl.textContent = `+ Added: ${added}`;
  removedEl.textContent = `- Removed: ${removed}`;
  similarityEl.textContent = `Similarity: ${similarity}%`;

  diffResult.innerHTML = html;
}

[textA, textB, ignoreCase, ignoreSpace].forEach(el =>
  el.addEventListener("input", () => diffLines(textA.value, textB.value))
);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});
