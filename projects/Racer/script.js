const scoreDisplay = document.querySelector('.score');
const needle = document.querySelector('.needle');
const speedText = document.querySelector('.speedText');
const nitroBar = document.querySelector('.nitroBar');
const startScreen = document.querySelector('.startScreen');
const road = document.querySelector('.road');
const gameBox = document.querySelector('.game');


let keys = {};
let game = { start:false, roadY:0, timeStage:0 };

let player = {
  x:240,
  baseSpeed:3,
  currentSpeed:3,
  nitroActive:false,
  nitro:100,
  score:0
};

document.addEventListener("keydown", e => keys[e.key]=true);
document.addEventListener("keyup", e => keys[e.key]=false);
document.addEventListener("keydown", e=>{
  if(e.key==="Enter"){
    if(!introPlayed){
      playIntroThenStart();
    }else{
      startGame(e);
    }
  }
});


let introPlayed = false;

function playIntroThenStart(){
  if(introPlayed) return;

  introPlayed = true;

  startScreen.innerHTML = `
    <div class="introCar"></div>
  `;

  setTimeout(()=>{
    startScreen.innerHTML = `
      <h1>2D RACER</h1>
      <p>Press Enter To Start</p>
    `;
  },3000);
}

function startGame(e){
  if(e.key==="Enter"){

    road.innerHTML="";
    startScreen.style.display="none";

    game.start=true;
    game.roadY=0;

    player.currentSpeed=player.baseSpeed;
    player.nitro=100;
    player.score=0;
    player.nitroActive=false;

    let car=document.createElement("div");
    car.classList.add("player");
    car.style.left=player.x+"px";
    car.style.bottom="80px";
    road.appendChild(car);

    for(let i=0;i<4;i++) createEnemy(i*-200);

    createNitroCylinder();

    requestAnimationFrame(loop);
  }
}

function createEnemy(y){
  let e=document.createElement("div");
  e.classList.add("enemy");
  e.style.top=y+"px";
  e.style.left=Math.random()*460+"px";
  road.appendChild(e);
}

function createNitroCylinder(){
  let n=document.createElement("div");
  n.classList.add("nitro");
  n.style.top="-150px";
  n.style.left=Math.random()*460+"px";
  road.appendChild(n);
}

function loop(){
  if(!game.start) return;

  let car=document.querySelector(".player");

  /* NORMAL BASE SPEED */
  player.currentSpeed = player.baseSpeed;

  /* SHIFT BOOST (0.4x only) */
  if(keys["Shift"]){
    player.currentSpeed = player.baseSpeed * 1.4;
  }

  /* NITRO BOOST (3x ONLY) */
  if(player.nitroActive){
    player.currentSpeed = player.baseSpeed * 3;
  }

  /* MOVE CAR LEFT RIGHT */
  if(keys["ArrowLeft"] && player.x>0) player.x-=6;
  if(keys["ArrowRight"] && player.x<470) player.x+=6;

  car.style.left=player.x+"px";

  /* ROAD SCROLL */
  game.roadY+=player.currentSpeed;
  road.style.backgroundPositionY=game.roadY+"px";

  moveEnemies(car);
  moveNitro(car);

  player.score+=player.currentSpeed;
  scoreDisplay.innerText="Score: "+Math.floor(player.score);

  updateSpeedometer(player.currentSpeed);

  requestAnimationFrame(loop);
}

function moveEnemies(car){
  document.querySelectorAll(".enemy").forEach(e=>{
    let y=e.offsetTop+player.currentSpeed-2;
    e.style.top=y+"px";

    if(isCollide(car,e)) endGame();

    if(y>720){
      e.style.top="-200px";
      e.style.left=Math.random()*460+"px";
    }
  });
}

function moveNitro(car){
  let n=document.querySelector(".nitro");
  if(!n) return;

  let y=n.offsetTop+player.currentSpeed-2;
  n.style.top=y+"px";

  if(isCollide(car,n)){
    player.nitroActive=true;
    n.remove();

    setTimeout(()=>{
      player.nitroActive=false;
      createNitroCylinder();
    },3000); // 3 seconds nitro
  }

  if(y>720){
    n.remove();
    createNitroCylinder();
  }
}

function updateSpeedometer(speed){
  let percent=speed/10;
  if(percent>1) percent=1;
  let angle=percent*180-90;
  needle.style.transform=`rotate(${angle}deg)`;
  speedText.innerText=Math.floor(speed*30)+" km/h";
}

/* DAY / AFTERNOON / NIGHT INTERVAL SYSTEM */
setInterval(()=>{
  if(!game.start) return;

  game.timeStage++;

  if(game.timeStage%3===0){
    gameBox.style.background="#87ceeb"; // Day
  }else if(game.timeStage%3===1){
    gameBox.style.background="#ffb347"; // Afternoon
  }else{
    gameBox.style.background="#0f2027"; // Night
  }

},8000); // every 8 seconds change

function isCollide(a,b){
  let r1=a.getBoundingClientRect();
  let r2=b.getBoundingClientRect();
  return !(r1.bottom<r2.top||r1.top>r2.bottom||r1.right<r2.left||r1.left>r2.right);
}

function endGame(){
  game.start=false;
  startScreen.style.display="flex";
  startScreen.innerHTML=`<h1>Game Over</h1>
  <p>Score: ${Math.floor(player.score)}</p>
  <p>Press Enter</p>`;
}