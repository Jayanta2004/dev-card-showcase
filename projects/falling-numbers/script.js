const gameArea = document.getElementById("game-area");
const basket = document.getElementById("basket");

let score = 0;
let combo = 1;
let highscore = localStorage.getItem("highscore") || 0;
let timer = 60;

let gameInterval;
let dropSpeed = 1500;
let gameRunning = false;

document.getElementById("highscore").textContent = highscore;

document.addEventListener("mousemove",(e)=>{
const rect = gameArea.getBoundingClientRect();
let x = e.clientX - rect.left - 40;

if(x < 0) x = 0;
if(x > gameArea.offsetWidth - 80) x = gameArea.offsetWidth - 80;

basket.style.left = x + "px";
});

function startGame(level){

if(gameRunning) return;

score = 0;
combo = 1;
timer = 60;

updateHUD();

if(level === "easy") dropSpeed = 1500;
if(level === "medium") dropSpeed = 1000;
if(level === "hard") dropSpeed = 700;

gameRunning = true;

gameInterval = setInterval(createNumber, dropSpeed);
countdown();
}

function createNumber(){

const num = document.createElement("div");
num.classList.add("number");

const value = Math.floor(Math.random()*10);
num.textContent = value;

num.style.left = Math.random()*(gameArea.offsetWidth-30)+"px";
num.style.top = "0px";

gameArea.appendChild(num);

let fall = setInterval(()=>{

if(!gameRunning){
clearInterval(fall);
return;
}

num.style.top = num.offsetTop + 5 + "px";

if(checkCatch(num,value)){
clearInterval(fall);
num.remove();
}

if(num.offsetTop > gameArea.offsetHeight){
combo = 1;
updateHUD();
clearInterval(fall);
num.remove();
}

},30);
}

function checkCatch(num,value){

const basketRect = basket.getBoundingClientRect();
const numRect = num.getBoundingClientRect();

if(
numRect.bottom >= basketRect.top &&
numRect.left < basketRect.right &&
numRect.right > basketRect.left
){

score += value * combo;
combo++;

updateHUD();
return true;
}

return false;
}

function updateHUD(){

document.getElementById("score").textContent = score;
document.getElementById("combo").textContent = combo;
document.getElementById("timer").textContent = timer;
}

function countdown(){

let t = setInterval(()=>{

if(!gameRunning){
clearInterval(t);
return;
}

timer--;
updateHUD();

if(timer<=0){

clearInterval(t);
endGame();

}

},1000);
}

function pauseGame(){

gameRunning = !gameRunning;

}

function restartGame(){

location.reload();

}

function endGame(){

gameRunning = false;
clearInterval(gameInterval);

if(score > highscore){
localStorage.setItem("highscore",score);
}

alert("Game Over! Score: "+score);
}