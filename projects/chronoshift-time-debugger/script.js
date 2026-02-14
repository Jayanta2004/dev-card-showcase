const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const valueInput = document.getElementById("valueInput");

const saveBtn = document.getElementById("saveState");
const randomBtn = document.getElementById("randomState");
const clearBtn = document.getElementById("clearStates");

const timeline = document.getElementById("timeline");

const viewTitle = document.getElementById("viewTitle");
const viewDesc = document.getElementById("viewDesc");
const viewValue = document.getElementById("viewValue");

const stateNumber = document.getElementById("stateNumber");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");

let states = [];
let currentIndex = -1;
let playing = false;
let playInterval;

function saveState(state) {

const snapshot = {
id: Date.now(),
title: state.title,
desc: state.desc,
value: state.value
};

states.push(snapshot);

currentIndex = states.length - 1;

renderTimeline();

renderState();

}

function renderState() {

if(currentIndex < 0 || !states[currentIndex]) return;

const state = states[currentIndex];

viewTitle.textContent = state.title;
viewDesc.textContent = state.desc;
viewValue.textContent = state.value;

stateNumber.textContent = currentIndex;

highlightNode();

}

function renderTimeline() {

timeline.innerHTML = "";

states.forEach((state, index) => {

const node = document.createElement("div");

node.className = "timeline-node";

node.textContent = `${index} — ${state.title}`;

node.onclick = () => {

currentIndex = index;

renderState();

};

timeline.appendChild(node);

});

}

function highlightNode() {

const nodes = document.querySelectorAll(".timeline-node");

nodes.forEach((node, index) => {

node.classList.toggle("active", index === currentIndex);

});

}

saveBtn.onclick = () => {

saveState({
title:titleInput.value,
desc:descInput.value,
value:valueInput.value
});

};

randomBtn.onclick = () => {

saveState({
title:"Random State",
desc:"Auto generated",
value:Math.floor(Math.random()*1000)
});

};

clearBtn.onclick = () => {

states = [];

currentIndex = -1;

renderTimeline();

};

prevBtn.onclick = () => {

if(currentIndex > 0){

currentIndex--;

renderState();

}

};

nextBtn.onclick = () => {

if(currentIndex < states.length-1){

currentIndex++;

renderState();

}

};

playBtn.onclick = () => {

playing = !playing;

if(playing){

playInterval = setInterval(()=>{

if(currentIndex < states.length-1){

currentIndex++;
renderState();

}

},500);

}else{

clearInterval(playInterval);

}

};

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i=0;i<100;i++){

particles.push({

x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
vx:(Math.random()-0.5)*2,
vy:(Math.random()-0.5)*2

});

}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

particles.forEach(p=>{

p.x+=p.vx;
p.y+=p.vy;

if(p.x<0||p.x>canvas.width)p.vx*=-1;
if(p.y<0||p.y>canvas.height)p.vy*=-1;

ctx.fillStyle="#00fff2";

ctx.fillRect(p.x,p.y,2,2);

});

requestAnimationFrame(animate);

}

animate();
