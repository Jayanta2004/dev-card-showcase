const SIZE = 25;
let baseArray = [];

const bubbleContainer = document.getElementById("bubble");
const selectionContainer = document.getElementById("selection");
const insertionContainer = document.getElementById("insertion");

function randomArray() {
  return Array.from({ length: SIZE }, () =>
    Math.floor(Math.random() * 180) + 20
  );
}

function render(container, arr, active = []) {
  container.innerHTML = "";
  arr.forEach((val, i) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${val}px`;
    if (active.includes(i)) bar.style.background = "#ef4444";
    container.appendChild(bar);
  });
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/* ---------- Bubble Sort ---------- */
async function bubbleSort(arr, container) {
  let a = [...arr];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
      render(container, a, [j, j + 1]);
      await sleep(40);
    }
  }
  render(container, a);
}

/* ---------- Selection Sort ---------- */
async function selectionSort(arr, container) {
  let a = [...arr];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[min]) min = j;
      render(container, a, [min, j]);
      await sleep(40);
    }
    [a[i], a[min]] = [a[min], a[i]];
  }
  render(container, a);
}

/* ---------- Insertion Sort ---------- */
async function insertionSort(arr, container) {
  let a = [...arr];
  for (let i = 1; i < a.length; i++) {
    let key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
      render(container, a, [j + 1]);
      await sleep(40);
    }
    a[j + 1] = key;
  }
  render(container, a);
}

/* ---------- Controls ---------- */
function generate() {
  baseArray = randomArray();
  render(bubbleContainer, baseArray);
  render(selectionContainer, baseArray);
  render(insertionContainer, baseArray);
}

document.getElementById("generate").addEventListener("click", generate);

document.getElementById("start").addEventListener("click", () => {
  bubbleSort(baseArray, bubbleContainer);
  selectionSort(baseArray, selectionContainer);
  insertionSort(baseArray, insertionContainer);
});

generate();