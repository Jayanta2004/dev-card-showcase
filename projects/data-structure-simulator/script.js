document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let structure = "stack";
let data = [];

const logPanel = document.getElementById("log");

function log(message) {
  const div = document.createElement("div");
  div.textContent = message;
  logPanel.prepend(div);
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (structure === "stack") drawStack();
  if (structure === "queue") drawQueue();
  if (structure === "list") drawList();
  if (structure === "tree") drawTree();
}

function drawStack() {
  data.forEach((val,i) => {
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(200, canvas.height - (i+1)*50, 100, 40);
    ctx.fillStyle = "white";
    ctx.fillText(val, 240, canvas.height - (i+1)*50 + 25);
  });
}

function drawQueue() {
  data.forEach((val,i) => {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(100 + i*120, 200, 100, 50);
    ctx.fillStyle = "white";
    ctx.fillText(val, 140 + i*120, 230);
  });
}

function drawList() {
  data.forEach((val,i) => {
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(100 + i*140, 200, 100, 50);
    ctx.fillStyle = "white";
    ctx.fillText(val, 140 + i*140, 230);

    if (i < data.length-1) {
      ctx.beginPath();
      ctx.moveTo(200 + i*140, 225);
      ctx.lineTo(240 + i*140, 225);
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  });
}

function drawTree() {
  function drawNode(val,x,y,offset) {
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(x,y,25,0,Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(val,x-5,y+5);
  }

  data.forEach((val,i) => {
    let level = Math.floor(Math.log2(i+1));
    let pos = i - (2**level -1);
    let gap = canvas.width / (2**(level+1));
    let x = gap + pos * gap*2;
    let y = 80 + level*80;
    drawNode(val,x,y);
  });
}

document.getElementById("structureSelect").addEventListener("change", e => {
  structure = e.target.value;
  data = [];
  log("Switched to " + structure);
  draw();
});

document.getElementById("insertBtn").addEventListener("click", () => {
  const val = document.getElementById("valueInput").value;
  if (!val) return;

  if (structure === "queue") data.push(val);
  else if (structure === "stack") data.push(val);
  else if (structure === "list") data.push(val);
  else if (structure === "tree") data.push(val);

  log("Inserted " + val);
  draw();
});

document.getElementById("removeBtn").addEventListener("click", () => {
  if (data.length === 0) return;

  let removed;
  if (structure === "queue") removed = data.shift();
  else removed = data.pop();

  log("Removed " + removed);
  draw();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  data = [];
  log("Cleared structure");
  draw();
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

draw();

});