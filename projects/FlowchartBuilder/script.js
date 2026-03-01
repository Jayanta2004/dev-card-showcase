const canvas = document.getElementById("canvas");
const clearBtn = document.getElementById("clearBtn");

let selectedType = "Process";
let nodes = [];
let selectedNode = null;

document.querySelectorAll("[data-type]").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedType = btn.dataset.type;
  });
});

canvas.addEventListener("click", (e) => {
  if (e.target !== canvas) return;

  const node = document.createElement("div");
  node.className = "node";
  node.textContent = selectedType;
  node.style.left = `${e.clientX - 60}px`;
  node.style.top = `${e.clientY - 40}px`;

  makeDraggable(node);

  canvas.appendChild(node);
  nodes.push(node);
});

function makeDraggable(el) {
  let offsetX, offsetY, dragging = false;

  el.addEventListener("mousedown", (e) => {
    dragging = true;
    selectedNode = el;
    el.classList.add("active");
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    el.classList.remove("active");
  });

  el.addEventListener("dblclick", () => {
    const text = prompt("Edit node text:", el.textContent);
    if (text) el.textContent = text;
  });
}

clearBtn.addEventListener("click", () => {
  nodes.forEach(n => n.remove());
  nodes = [];
});