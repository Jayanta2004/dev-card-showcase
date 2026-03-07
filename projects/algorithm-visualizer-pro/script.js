const visualizer = document.getElementById("visualizer");
const generateBtn = document.getElementById("generate");
const startBtn = document.getElementById("start");
const sizeSlider = document.getElementById("size");
const speedSlider = document.getElementById("speed");
const algorithmSelect = document.getElementById("algorithm");
const complexityText = document.getElementById("complexityText");

let array = [];
let delay = 50;

function generateArray() {
  array = [];
  visualizer.innerHTML = "";
  for (let i = 0; i < sizeSlider.value; i++) {
    const value = Math.floor(Math.random() * 300) + 20;
    array.push(value);
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = value + "px";
    visualizer.appendChild(bar);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function bubbleSort() {
  complexityText.textContent = "O(n²)";
  const bars = document.getElementsByClassName("bar");

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      bars[j].classList.add("active");
      bars[j+1].classList.add("active");

      if (array[j] > array[j+1]) {
        [array[j], array[j+1]] = [array[j+1], array[j]];
        bars[j].style.height = array[j] + "px";
        bars[j+1].style.height = array[j+1] + "px";
      }

      await sleep(delay);
      bars[j].classList.remove("active");
      bars[j+1].classList.remove("active");
    }
  }
}

async function quickSort(start=0, end=array.length-1) {
  complexityText.textContent = "O(n log n)";
  if (start >= end) return;

  let index = await partition(start, end);
  await quickSort(start, index - 1);
  await quickSort(index + 1, end);
}

async function partition(start, end) {
  const bars = document.getElementsByClassName("bar");
  let pivot = array[end];
  let i = start;

  for (let j = start; j < end; j++) {
    bars[j].classList.add("active");
    if (array[j] < pivot) {
      [array[i], array[j]] = [array[j], array[i]];
      bars[i].style.height = array[i] + "px";
      bars[j].style.height = array[j] + "px";
      i++;
    }
    await sleep(delay);
    bars[j].classList.remove("active");
  }

  [array[i], array[end]] = [array[end], array[i]];
  bars[i].style.height = array[i] + "px";
  bars[end].style.height = array[end] + "px";

  return i;
}

async function mergeSort(start=0, end=array.length-1) {
  complexityText.textContent = "O(n log n)";
  if (start >= end) return;

  const mid = Math.floor((start + end) / 2);
  await mergeSort(start, mid);
  await mergeSort(mid+1, end);
  await merge(start, mid, end);
}

async function merge(start, mid, end) {
  const bars = document.getElementsByClassName("bar");
  const left = array.slice(start, mid+1);
  const right = array.slice(mid+1, end+1);

  let i = 0, j = 0, k = start;

  while (i < left.length && j < right.length) {
    bars[k].classList.add("active");

    if (left[i] <= right[j]) {
      array[k] = left[i++];
    } else {
      array[k] = right[j++];
    }

    bars[k].style.height = array[k] + "px";
    await sleep(delay);
    bars[k].classList.remove("active");
    k++;
  }

  while (i < left.length) {
    array[k] = left[i++];
    bars[k].style.height = array[k] + "px";
    k++;
  }

  while (j < right.length) {
    array[k] = right[j++];
    bars[k].style.height = array[k] + "px";
    k++;
  }
}

startBtn.addEventListener("click", async () => {
  delay = 101 - speedSlider.value;

  if (algorithmSelect.value === "bubble") await bubbleSort();
  if (algorithmSelect.value === "quick") await quickSort();
  if (algorithmSelect.value === "merge") await mergeSort();
});

generateBtn.addEventListener("click", generateArray);

generateArray();