const editor = document.getElementById("editor");
const searchInput = document.getElementById("searchInput");
const themeToggle = document.getElementById("themeToggle");

const addHeadingBtn = document.getElementById("addHeading");
const addTextBtn = document.getElementById("addText");
const addChecklistBtn = document.getElementById("addChecklist");

let state = JSON.parse(localStorage.getItem("synapse-blocks")) || [];

function saveState() {
localStorage.setItem("synapse-blocks", JSON.stringify(state));
}

function generateId() {
return "_" + Math.random().toString(36).substr(2, 9);
}

function createBlock(type, content = "") {
const block = {
id: generateId(),
type,
content
};
state.push(block);
saveState();
render();
}

function deleteBlock(id) {
state = state.filter(block => block.id !== id);
saveState();
render();
}

function updateBlock(id, value) {
state = state.map(block =>
block.id === id ? { ...block, content: value } : block
);
saveState();
}

function render() {
editor.innerHTML = "";

const filtered = state.filter(block =>
block.content.toLowerCase().includes(searchInput.value.toLowerCase())
);

filtered.forEach(block => {
const div = document.createElement("div");
div.className = "block";
div.draggable = true;
div.dataset.id = block.id;

if(block.type === "heading") {
const input = document.createElement("input");
input.type = "text";
input.placeholder = "Heading...";
input.value = block.content;
input.oninput = (e)=>updateBlock(block.id, e.target.value);
div.appendChild(input);
}

if(block.type === "text") {
const textarea = document.createElement("textarea");
textarea.placeholder = "Start typing...";
textarea.value = block.content;
textarea.oninput = (e)=>updateBlock(block.id, e.target.value);
div.appendChild(textarea);
}

if(block.type === "checklist") {
const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.style.marginRight="10px";
div.appendChild(checkbox);

const input = document.createElement("input");
input.type="text";
input.placeholder="Checklist item...";
input.value=block.content;
input.oninput=(e)=>updateBlock(block.id,e.target.value);
div.appendChild(input);
}

const del = document.createElement("button");
del.textContent="Delete";
del.className="delete";
del.onclick=()=>deleteBlock(block.id);
div.appendChild(del);

/* DRAG EVENTS */
div.addEventListener("dragstart", dragStart);
div.addEventListener("dragover", dragOver);
div.addEventListener("drop", drop);
div.addEventListener("dragend", dragEnd);

editor.appendChild(div);
});
}

/* DRAG & DROP */
let dragId = null;

function dragStart(e){
dragId = this.dataset.id;
}

function dragOver(e){
e.preventDefault();
this.classList.add("drag-over");
}

function dragEnd(){
document.querySelectorAll(".block").forEach(b=>b.classList.remove("drag-over"));
}

function drop(e){
e.preventDefault();
const dropId = this.dataset.id;

if(dragId !== dropId){
const fromIndex = state.findIndex(b=>b.id===dragId);
const toIndex = state.findIndex(b=>b.id===dropId);

const moved = state.splice(fromIndex,1)[0];
state.splice(toIndex,0,moved);

saveState();
render();
}
}

/* EVENTS */
addHeadingBtn.onclick=()=>createBlock("heading");
addTextBtn.onclick=()=>createBlock("text");
addChecklistBtn.onclick=()=>createBlock("checklist");

searchInput.oninput=render;

themeToggle.onclick=()=>{
document.body.classList.toggle("dark");
};

document.addEventListener("keydown", e=>{
if(e.key==="Enter" && e.ctrlKey){
createBlock("text");
}
});

render();
