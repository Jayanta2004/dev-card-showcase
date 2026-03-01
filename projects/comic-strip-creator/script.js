const themeToggle = document.getElementById("theme-toggle");
const addPanelBtn = document.getElementById("add-panel");
const exportBtn = document.getElementById("export-comic");
const panelsContainer = document.getElementById("panels-container");
const characterSelect = document.getElementById("character-select");
const backgroundSelect = document.getElementById("background-select");
const dialogueInput = document.getElementById("dialogue-input");
const addDialogueBtn = document.getElementById("add-dialogue");

let darkMode = false;
themeToggle.addEventListener("click", () => {
  darkMode = !darkMode;
  document.body.classList.toggle("dark-mode", darkMode);
});

// Add Panel
addPanelBtn.addEventListener("click", () => {
  const panel = document.createElement("div");
  panel.classList.add("panel");
  panelsContainer.appendChild(panel);
});

// Add Character
panelsContainer.addEventListener("click", (e)=>{
  if(e.target.classList.contains("panel")){
    const character = document.createElement("img");
    character.src = `./assets/${characterSelect.value}.png`; // Replace with actual image paths
    character.classList.add("character");
    character.draggable = true;
    e.target.appendChild(character);
  }
});

// Add Dialogue
addDialogueBtn.addEventListener("click", () => {
  const dialogue = document.createElement("div");
  dialogue.classList.add("dialogue");
  dialogue.textContent = dialogueInput.value;
  dialogue.style.top = "10px";
  dialogue.style.left = "10px";
  // Add to last panel for simplicity
  const lastPanel = panelsContainer.lastElementChild;
  if(lastPanel) lastPanel.appendChild(dialogue);
});

// Drag & Drop
let dragItem = null;
panelsContainer.addEventListener("mousedown", (e) => {
  if(e.target.classList.contains("character") || e.target.classList.contains("dialogue")){
    dragItem = e.target;
  }
});
document.addEventListener("mousemove", (e)=>{
  if(dragItem){
    dragItem.style.top = e.offsetY - dragItem.offsetHeight/2 + "px";
    dragItem.style.left = e.offsetX - dragItem.offsetWidth/2 + "px";
  }
});
document.addEventListener("mouseup", ()=>{ dragItem=null; });

// Export Comic (JSON of panels)
exportBtn.addEventListener("click", ()=>{
  const panels = Array.from(document.querySelectorAll(".panel")).map(panel=>{
    return {
      background: backgroundSelect.value, // Simplified, can be enhanced
      characters: Array.from(panel.querySelectorAll(".character")).map(c=>c.src),
      dialogues: Array.from(panel.querySelectorAll(".dialogue")).map(d=>({text:d.textContent, top:d.style.top, left:d.style.left}))
    };
  });
  const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(panels,null,2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download","comic-strip.json");
  dlAnchor.click();
});