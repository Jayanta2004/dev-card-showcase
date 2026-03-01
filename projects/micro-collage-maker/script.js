const collageContainer = document.getElementById("collage-container");
const gridSelect = document.getElementById("grid-select") || document.getElementById("panel-shape");
const imageUpload = document.getElementById("image-upload");
const addTextBtn = document.getElementById("add-text");
const textInput = document.getElementById("text-input");
const exportBtn = document.getElementById("export-collage");

let panels = [];
let dragItem = null;

// Function to create grid panels
function createPanels(gridType) {
  collageContainer.innerHTML = ""; // Clear previous panels
  panels = [];

  let rows = 1, cols = 1;
  if(gridType === "2x2") { rows = 2; cols = 2; }
  else if(gridType === "3x3") { rows = 3; cols = 3; }
  else { rows = 1; cols = 1; } // freeform

  const panelWidth = collageContainer.clientWidth / cols - 15;
  const panelHeight = collageContainer.clientHeight / rows - 15;

  for(let r=0; r<rows; r++){
    for(let c=0; c<cols; c++){
      const panel = document.createElement("div");
      panel.classList.add("panel");
      panel.style.width = panelWidth + "px";
      panel.style.height = panelHeight + "px";
      panel.style.top = r * (panelHeight + 15) + "px";
      panel.style.left = c * (panelWidth + 15) + "px";
      panel.style.position = "absolute";
      collageContainer.appendChild(panel);
      panels.push(panel);
    }
  }
}

// Initialize panels
createPanels("2x2");

// Change grid layout
if(gridSelect){
  gridSelect.addEventListener("change", ()=>{
    const val = gridSelect.value;
    if(val === "2x2" || val === "3x3") createPanels(val);
    else collageContainer.innerHTML = ""; // freeform: empty canvas
  });
}

// Upload Images into Panels
imageUpload.addEventListener("change", (e)=>{
  const files = e.target.files;
  for(let i=0; i<files.length; i++){
    const img = document.createElement("img");
    img.src = URL.createObjectURL(files[i]);
    img.classList.add("image-item");
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.draggable = true;

    // Place inside first empty panel
    for(let panel of panels){
      if(panel.children.length === 0){
        panel.appendChild(img);
        break;
      }
    }
  }
});

// Add Text to Panels
addTextBtn.addEventListener("click", ()=>{
  const textBox = document.createElement("div");
  textBox.classList.add("text-box");
  textBox.textContent = textInput.value;
  textBox.style.top = "10px";
  textBox.style.left = "10px";
  textBox.draggable = true;

  // Place inside first panel
  for(let panel of panels){
    if(panel.children.length < 2){ // limit to 1 image + 1 text
      panel.appendChild(textBox);
      break;
    }
  }
});

// Drag & Drop inside panels
collageContainer.addEventListener("mousedown",(e)=>{
  if(e.target.classList.contains("image-item") || e.target.classList.contains("text-box")){
    dragItem = e.target;
  }
});
document.addEventListener("mousemove",(e)=>{
  if(dragItem){
    const parentRect = dragItem.parentElement.getBoundingClientRect();
    dragItem.style.top = e.clientY - parentRect.top - dragItem.offsetHeight/2 + "px";
    dragItem.style.left = e.clientX - parentRect.left - dragItem.offsetWidth/2 + "px";
  }
});
document.addEventListener("mouseup",()=>{ dragItem = null; });

// Export JSON
exportBtn.addEventListener("click", ()=>{
  const data = panels.map(panel=>{
    return {
      panel: panel.style.top + "," + panel.style.left,
      items: Array.from(panel.children).map(el=>{
        return {
          type: el.className,
          src: el.src || null,
          text: el.textContent || null,
          top: el.style.top,
          left: el.style.left
        };
      })
    };
  });
  const dataStr = "data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify(data,null,2));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download","micro-collage.json");
  dlAnchor.click();
});