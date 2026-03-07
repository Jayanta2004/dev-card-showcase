let x, y, velocityY, gravity, jumping;
let keys = {};
let speed = 5;

document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

function updatePlayer(){
  if(keys["ArrowRight"]) x += speed;
  if(keys["ArrowLeft"]) x -= speed;

  if((keys["Space"] || keys["ArrowUp"]) && !jumping){
    velocityY = -15;
    jumping = true;
  }

  velocityY += gravity;
  y -= velocityY;

  if(y < 80){
    y = 80;
    velocityY = 0;
    jumping = false;
  }

  mario.style.left = x + "px";
  mario.style.bottom = y + "px";
}