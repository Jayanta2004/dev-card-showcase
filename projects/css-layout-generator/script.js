document.addEventListener("DOMContentLoaded", () => {

const preview = document.getElementById("previewContainer");
const layoutMode = document.getElementById("layoutMode");
const direction = document.getElementById("direction");
const justify = document.getElementById("justify");
const align = document.getElementById("align");
const gap = document.getElementById("gap");
const columns = document.getElementById("columns");
const cssOutput = document.getElementById("cssOutput");

const addBoxBtn = document.getElementById("addBox");
const removeBoxBtn = document.getElementById("removeBox");
const themeToggle = document.getElementById("themeToggle");
const copyBtn = document.getElementById("copyBtn");

let boxCount = 3;

function updateLayout() {

  preview.style.transition = "all 0.4s ease";

  if (layoutMode.value === "flex") {
    preview.style.display = "flex";
    preview.style.flexDirection = direction.value;
    preview.style.justifyContent = justify.value;
    preview.style.alignItems = align.value;
    preview.style.gap = gap.value + "px";
  } else {
    preview.style.display = "grid";
    preview.style.gridTemplateColumns =
      `repeat(${columns.value}, 1fr)`;
    preview.style.gap = gap.value + "px";
  }

  generateCSS();
}

function generateCSS() {
  let css = `.container {\n`;

  if (layoutMode.value === "flex") {
    css += `  display: flex;\n`;
    css += `  flex-direction: ${direction.value};\n`;
    css += `  justify-content: ${justify.value};\n`;
    css += `  align-items: ${align.value};\n`;
  } else {
    css += `  display: grid;\n`;
    css += `  grid-template-columns: repeat(${columns.value}, 1fr);\n`;
  }

  css += `  gap: ${gap.value}px;\n`;
  css += `}`;

  cssOutput.textContent = css;
}

addBoxBtn.addEventListener("click", () => {
  boxCount++;
  const div = document.createElement("div");
  div.classList.add("box");
  div.textContent = boxCount;
  preview.appendChild(div);
});

removeBoxBtn.addEventListener("click", () => {
  if (preview.lastElementChild) {
    preview.removeChild(preview.lastElementChild);
    boxCount--;
  }
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(cssOutput.textContent);
});

[layoutMode, direction, justify, align, gap, columns]
.forEach(control => control.addEventListener("input", updateLayout));

updateLayout();

});