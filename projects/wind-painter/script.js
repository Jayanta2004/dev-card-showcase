const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let leaves=[];
let windX=0;
let windY=0;
let score=0;
let windPower=1;
let running=false;

const target={
  x:250,
  y:200,
  radius:40,
  fill:0
};

let keys={};

document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);

function createLeaf(){
  leaves.push({
    x:Math.random()*500,
    y:-20,
    size:10+Math.random()*10,
    vx:0,
    vy:1+Math.random()*2
  });
}

function drawTarget(){
  ctx.beginPath();
  ctx.arc(target.x,target.y,target.radius,0,Math.PI*2);
  ctx.strokeStyle="#15803d";
  ctx.lineWidth=3;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(target.x,target.y,target.radius*(target.fill/100),0,Math.PI*2);
  ctx.fillStyle="rgba(34,197,94,0.5)";
  ctx.fill();
  ctx.closePath();
}

function drawLeaves(){
  leaves.forEach(l=>{
    ctx.beginPath();
    ctx.arc(l.x,l.y,l.size,0,Math.PI*2);
    ctx.fillStyle="#84cc16";
    ctx.fill();
    ctx.closePath();
  });
}

function updateWind(){
  windX=0;
  windY=0;
  if(keys["ArrowLeft"]) windX=-windPower;
  if(keys["ArrowRight"]) windX=windPower;
  if(keys["ArrowUp"]) windY=-windPower;
  if(keys["ArrowDown"]) windY=windPower;
}

function updateLeaves(){
  for(let i=leaves.length-1;i>=0;i--){
    const l=leaves[i];
    l.vx+=windX*0.1;
    l.vy+=windY*0.1;
    l.x+=l.vx;
    l.y+=l.vy;

    if(l.y>canvas.height+20){
      leaves.splice(i,1);
    }

    const dx=l.x-target.x;
    const dy=l.y-target.y;
    const dist=Math.sqrt(dx*dx+dy*dy);

    if(dist<target.radius){
      leaves.splice(i,1);
      score++;
      target.fill+=5;
      document.getElementById("score").innerText=score;

      if(target.fill>=100){
        winGame();
      }
    }
  }
}

function drawBackground(){
  ctx.fillStyle="rgba(240,253,244,0.6)";
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function gameLoop(){
  if(!running) return;

  drawBackground();
  updateWind();
  drawTarget();
  drawLeaves();
  updateLeaves();

  requestAnimationFrame(gameLoop);
}

function startGame(){
  leaves=[];
  score=0;
  target.fill=0;
  running=true;
  document.getElementById("score").innerText=0;
  document.getElementById("msg").innerText="Guide leaves into target 🎯";

  setInterval(()=>{
    if(running){
      createLeaf();
    }
  },800);

  gameLoop();
}

function winGame(){
  running=false;
  document.getElementById("msg").innerText="🎉 You painted the circle!";
}