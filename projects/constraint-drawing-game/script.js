const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let constraint = "";
let timer = 30;
let interval;

const objects = ["House","Tree","Cat","Car","Boat","Star","Robot"];
const constraints = [
"Only Straight Lines",
"One Stroke Only",
"Mirror Mode",
"Left Side Only",
"Time Pressure"
];

document.getElementById("start").onclick = startGame;
document.getElementById("clear").onclick = clearCanvas;

canvas.addEventListener("mousedown",startDraw);
canvas.addEventListener("mouseup",stopDraw);
canvas.addEventListener("mousemove",draw);

function startGame(){

let obj = objects[Math.floor(Math.random()*objects.length)];
constraint = constraints[Math.floor(Math.random()*constraints.length)];

document.getElementById("object").innerText=obj;
document.getElementById("constraint").innerText=constraint;

timer = 30;
document.getElementById("timer").innerText="Time: "+timer;

clearInterval(interval);

interval = setInterval(()=>{
timer--;
document.getElementById("timer").innerText="Time: "+timer;

if(timer<=0){
clearInterval(interval);
alert("Time Up!");
}

},1000);

clearCanvas();
}

function startDraw(e){

if(constraint==="One Stroke Only" && ctx.__drawn) return;

drawing=true;

ctx.beginPath();
ctx.moveTo(e.offsetX,e.offsetY);
}

function stopDraw(){
drawing=false;
ctx.__drawn=true;
}

function draw(e){

if(!drawing) return;

let x=e.offsetX;
let y=e.offsetY;

if(constraint==="Left Side Only" && x>250) return;

if(constraint==="Mirror Mode"){
ctx.lineTo(x,y);
ctx.stroke();

ctx.lineTo(canvas.width-x,y);
ctx.stroke();
return;
}

ctx.lineTo(x,y);
ctx.stroke();
}

function clearCanvas(){
ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.__drawn=false;
}