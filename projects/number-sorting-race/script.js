const container = document.getElementById("numbers");
const timeEl = document.getElementById("time");
const movesEl = document.getElementById("moves");
const progressBar = document.getElementById("progress-bar");
const restartBtn = document.getElementById("restart");

let numbers = [];
let moves = 0;
let time = 0;
let timer;
let dragged = null;

function init() {
  container.innerHTML = "";
  numbers = shuffle([1,2,3,4,5,6,7,8]);
  moves = 0;
  time = 0;

  movesEl.textContent = moves;
  timeEl.textContent = time;
  progressBar.style.width = "0%";

  clearInterval(timer);
  timer = setInterval(() => {
    time++;
    timeEl.textContent = time;
  }, 1000);

  numbers.forEach(n => {
    const el = document.createElement("div");
    el.className = "number";
    el.textContent = n;
    el.draggable = true;

    el.addEventListener("dragstart", () => {
      dragged = el;
      el.classList.add("dragging");
    });

    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      check();
    });

    el.addEventListener("dragover", e => e.preventDefault());

    el.addEventListener("drop", () => {
      if (dragged !== el) {
        [dragged.textContent, el.textContent] =
        [el.textContent, dragged.textContent];
        moves++;
        movesEl.textContent = moves;
        updateProgress();
      }
    });

    container.appendChild(el);
  });
}

function check() {
  const current = [...container.children].map(e => +e.textContent);
  const sorted = [...current].sort((a,b)=>a-b);

  if (JSON.stringify(current) === JSON.stringify(sorted)) {
    clearInterval(timer);
    document.querySelector(".game").classList.add("win-flash");
    setTimeout(() => {
      alert(`🏆 Sorted in ${time}s with ${moves} moves`);
      document.querySelector(".game").classList.remove("win-flash");
    }, 300);
  }
}

function updateProgress() {
  const current = [...container.children].map(e => +e.textContent);
  let correct = 0;
  for (let i = 0; i < current.length; i++) {
    if (current[i] === i + 1) correct++;
  }
  progressBar.style.width = (correct / current.length) * 100 + "%";
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

restartBtn.addEventListener("click", init);
init();
