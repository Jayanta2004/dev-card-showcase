const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/*  STARS  */
const stars = [];
for(let i=0;i<200;i++){
  stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.5});
}

/*  GUN  */
const gun = document.getElementById("gun");
let gunX = window.innerWidth/2-25;
const gunY = window.innerHeight-210;
gun.style.left = gunX+"px";

/*  BULLETS  */
const bullets = [];

/*  ASTEROIDS  */
const asteroids = [];

/*  KEYS  */
const keys = {left:false,right:false};

/*  GAME SETTINGS  */
const GUN_SPEED = 3;      
const BULLET_WIDTH = 6;   
const BULLET_SPEED = 8;
const ASTEROID_MIN_SPEED = 0.5;
const ASTEROID_MAX_SPEED = 1.2;
const ASTEROID_INTERVAL = 3000;

/*  DRAW STARS  */
function drawStars(){
  ctx.fillStyle="white";
  stars.forEach(s=>{
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fill();
  });
}

/*  CREATE ASTEROID  */
function createAsteroid(){
  asteroids.push({
    x: Math.random()*canvas.width,
    y: -30,
    r: Math.random()*15+10,
    speed: Math.random()*(ASTEROID_MAX_SPEED-ASTEROID_MIN_SPEED) + ASTEROID_MIN_SPEED
  });
}

/*  SHOOT  */
function shoot(){
  bullets.push({x:gunX+25, y:gunY, speed:BULLET_SPEED});
}

/*  GAME LOOP  */
function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Stars
  drawStars();

  // Gun movement
  if(keys.left) gunX -= GUN_SPEED;
  if(keys.right) gunX += GUN_SPEED;
  gunX = Math.max(0, Math.min(canvas.width-50, gunX));
  gun.style.left = gunX+"px";

  // Bullets
  bullets.forEach((b,i)=>{
    b.y -= b.speed;
    ctx.fillStyle="red";
    ctx.fillRect(b.x - BULLET_WIDTH/2, b.y, BULLET_WIDTH, 10);
    if(b.y<0) bullets.splice(i,1);
  });

  // Asteroids
  asteroids.forEach((a,ai)=>{
    a.y += a.speed;
    ctx.fillStyle="#777";
    ctx.beginPath();
    ctx.arc(a.x,a.y,a.r,0,Math.PI*2);
    ctx.fill();

    // Collision with bullets
    bullets.forEach((b,bi)=>{
      if(Math.hypot(a.x-b.x, a.y-b.y)<a.r){
        asteroids.splice(ai,1);
        bullets.splice(bi,1);
      }
    });

    // Earth collision
    if(a.y > canvas.height-180){
      alert("🌍 Earth Destroyed!");
      asteroids.length=0;
      bullets.length=0;
    }
  });

  requestAnimationFrame(update);
}

/*  KEYBOARD CONTROLS    */
document.addEventListener("keydown",e=>{
  if(e.key==="ArrowLeft") keys.left=true;
  if(e.key==="ArrowRight") keys.right=true;
  if(e.key==="Enter") shoot();
});
document.addEventListener("keyup",e=>{
  if(e.key==="ArrowLeft") keys.left=false;
  if(e.key==="ArrowRight") keys.right=false;
});

/*  SPAWN ASTEROIDS  */
setInterval(createAsteroid, ASTEROID_INTERVAL);

/*  START GAME  */
update();

/*  HANDLE WINDOW RESIZE  */
window.onresize = ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};