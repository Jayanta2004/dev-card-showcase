const components = document.querySelectorAll(".component");
const canvas = document.getElementById("canvas");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

let draggedType = "";

// Drag start
components.forEach(comp => {
  comp.addEventListener("dragstart", () => {
    draggedType = comp.dataset.type;
  });
});

// Allow drop
canvas.addEventListener("dragover", e => {
  e.preventDefault();
});

// Drop
canvas.addEventListener("drop", () => {
  const el = createElement(draggedType);
  canvas.appendChild(el);
});

// Create element
function createElement(type) {
  let div = document.createElement("div");
  div.className = "element";
  div.setAttribute("draggable", "true");

  if (type === "text") {
    div.textContent = "Editable Text";
    div.contentEditable = true;
  }

  if (type === "button") {
    div.innerHTML = "<button>Click Me</button>";
  }

  if (type === "image") {
    div.innerHTML = "<img src='https://via.placeholder.com/150'>";
  }

  if (type === "card") {
    div.innerHTML = "<h3>Card Title</h3><p>Card content</p>";
    div.contentEditable = true;
  }

  // Delete button
  const del = document.createElement("span");
  del.textContent = "✖";
  del.className = "delete-btn";
  del.onclick = () => div.remove();

  div.appendChild(del);

  return div;
}

// Save layout
saveBtn.addEventListener("click", () => {
  localStorage.setItem("layout", canvas.innerHTML);
  alert("Layout Saved!");
});

// Load layout
window.onload = () => {
  const saved = localStorage.getItem("layout");
  if (saved) canvas.innerHTML = saved;
};

// Clear
clearBtn.addEventListener("click", () => {
  canvas.innerHTML = "<p class='hint'>Drop elements here 👇</p>";
  localStorage.removeItem("layout");
});
