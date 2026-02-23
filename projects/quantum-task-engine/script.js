const field = document.getElementById("quantumField");
const stateCount = document.getElementById("stateCount");
const entangleCount = document.getElementById("entangleCount");

let tasks = [];
let entanglements = [];

let idCounter = 0;

class QuantumTask{

constructor(text){

this.id = idCounter++;

this.text = text;

this.state = "superposition";

this.x = Math.random()*600;
this.y = Math.random()*400;

this.entangledWith = [];

this.createElement();

}

createElement(){

this.el = document.createElement("div");

this.el.className = "task superposition";

this.el.innerText = this.text;

this.el.style.left = this.x+"px";
this.el.style.top = this.y+"px";

this.el.onclick = ()=> this.observe();

this.enableDrag();

field.appendChild(this.el);

}

observe(){

if(this.state==="collapsed") return;

this.state="observed";

this.updateVisual();

this.triggerEntangled();

updateStats();

}

collapse(){

this.state="collapsed";

this.updateVisual();

updateStats();

}

updateVisual(){

this.el.className="task "+this.state;

if(this.entangledWith.length>0)
this.el.classList.add("entangled");

}

enableDrag(){

let offsetX, offsetY;

this.el.onmousedown = (e)=>{

offsetX = e.offsetX;
offsetY = e.offsetY;

document.onmousemove=(e2)=>{

this.x=e2.clientX-offsetX;
this.y=e2.clientY-offsetY;

this.el.style.left=this.x+"px";
this.el.style.top=this.y+"px";

drawEntanglements();

};

document.onmouseup=()=>{

document.onmousemove=null;

};

};

}

triggerEntangled(){

this.entangledWith.forEach(id=>{

let target=tasks.find(t=>t.id===id);

if(target.state==="superposition")
target.observe();

});

}

}

function createTask(){

let input=document.getElementById("taskInput");

if(!input.value) return;

let task=new QuantumTask(input.value);

tasks.push(task);

input.value="";

updateStats();

}

function observeAll(){

tasks.forEach(t=>{

if(t.state==="superposition")
t.observe();

});

}

function collapseAll(){

tasks.forEach(t=>{

if(t.state!=="collapsed")
t.collapse();

});

}

function entangleRandom(){

if(tasks.length<2) return;

let a=tasks[Math.floor(Math.random()*tasks.length)];
let b=tasks[Math.floor(Math.random()*tasks.length)];

if(a.id===b.id) return;

a.entangledWith.push(b.id);
b.entangledWith.push(a.id);

entanglements.push([a.id,b.id]);

a.updateVisual();
b.updateVisual();

updateStats();

drawEntanglements();

}

function updateStats(){

stateCount.innerText=tasks.length;
entangleCount.innerText=entanglements.length;

}

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.zIndex = "-1";


function drawEntanglements(){

ctx.clearRect(0,0,canvas.width,canvas.height);

entanglements.forEach(pair=>{

let a=tasks.find(t=>t.id===pair[0]);
let b=tasks.find(t=>t.id===pair[1]);

ctx.beginPath();

ctx.moveTo(a.x+50,a.y+20);
ctx.lineTo(b.x+50,b.y+20);

ctx.strokeStyle="magenta";
ctx.stroke();

});

}

function animateBackground(){

ctx.fillStyle="rgba(0,0,0,0.2)";
ctx.fillRect(0,0,canvas.width,canvas.height);

for(let i=0;i<50;i++){

ctx.fillStyle="cyan";

ctx.fillRect(
Math.random()*canvas.width,
Math.random()*canvas.height,
2,2);

}

requestAnimationFrame(animateBackground);

}

animateBackground();
