document.addEventListener("DOMContentLoaded", () => {

const canvas = document.getElementById("gitCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * 0.7;
canvas.height = 600;

let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;

let commits = [];
let branches = { main: null };
let currentBranch = "main";
let detachedHEAD = false;

const colors = ["#6366f1","#22c55e","#f59e0b","#ef4444","#8b5cf6"];
let branchColorMap = { main: colors[0] };

function log(msg) {
  const div = document.createElement("div");
  div.textContent = msg;
  document.getElementById("log").prepend(div);
}

function worldToScreen(x,y) {
  return {
    x: x * scale + offsetX,
    y: y * scale + offsetY
  };
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  commits.forEach(commit => {

    if (commit.parents) {
      commit.parents.forEach(parent => {
        const p1 = worldToScreen(commit.x, commit.y);
        const p2 = worldToScreen(parent.x, parent.y);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = branchColorMap[commit.branch];
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  });

  commits.forEach(commit => {

    const p = worldToScreen(commit.x, commit.y);

    ctx.beginPath();
    ctx.arc(p.x, p.y, 12*scale, 0, Math.PI*2);
    ctx.fillStyle = branchColorMap[commit.branch];
    ctx.shadowBlur = commit.branch === currentBranch ? 20 : 0;
    ctx.shadowColor = branchColorMap[commit.branch];
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "white";
    ctx.font = `${10*scale}px Inter`;
    ctx.fillText(commit.branch, p.x + 15, p.y - 10);
  });

  if (branches[currentBranch] && !detachedHEAD) {
    const p = worldToScreen(branches[currentBranch].x, branches[currentBranch].y);
    ctx.fillStyle = "#fff";
    ctx.fillText("HEAD → " + currentBranch, p.x + 20, p.y + 20);
  }
}

function createCommit(message, branch, parents) {

  const parent = branches[branch];

  const newCommit = {
    message,
    branch,
    parents: parents || (parent ? [parent] : []),
    x: parent ? parent.x + 100 : 100,
    y: Object.keys(branches).indexOf(branch) * 120 + 100
  };

  commits.push(newCommit);
  branches[branch] = newCommit;

  log(branch + ": " + message);
  draw();
}

document.getElementById("commitBtn").onclick = () => {
  const msg = document.getElementById("commitMessage").value || "Commit";
  createCommit(msg, currentBranch);
};

document.getElementById("branchBtn").onclick = () => {
  const name = prompt("Branch name?");
  if (!name) return;

  branches[name] = branches[currentBranch];
  branchColorMap[name] = colors[Object.keys(branchColorMap).length % colors.length];
  currentBranch = name;
  log("Created branch " + name);
  draw();
};

document.getElementById("checkoutBtn").onclick = () => {
  const name = prompt("Checkout branch?");
  if (branches[name]) {
    currentBranch = name;
    detachedHEAD = false;
    log("Checked out " + name);
    draw();
  }
};

document.getElementById("mergeBtn").onclick = () => {
  const name = prompt("Merge branch into current?");
  if (!branches[name] || name === currentBranch) return;

  createCommit("Merge " + name, currentBranch,
    [branches[currentBranch], branches[name]]);

  log("Merged " + name + " into " + currentBranch);
};

document.getElementById("resetRepo").onclick = () => {
  commits = [];
  branches = { main: null };
  branchColorMap = { main: colors[0] };
  currentBranch = "main";
  detachedHEAD = false;
  document.getElementById("log").innerHTML = "";
  draw();
};

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
};

// PAN
canvas.addEventListener("mousedown", e => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
});

canvas.addEventListener("mousemove", e => {
  if (isDragging) {
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    draw();
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

// ZOOM
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const zoomIntensity = 0.1;
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.5, scale), 2);
  draw();
});

draw();

});