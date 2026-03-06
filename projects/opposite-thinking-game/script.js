const wordEl = document.getElementById("word");
const options = document.querySelectorAll(".opt");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const modeEl = document.getElementById("mode");

let score = 0;
let time = 10;
let interval;
let correct = "";

const pairs = {
hot:"cold",
big:"small",
up:"down",
happy:"sad",
light:"dark",
fast:"slow"
};

const words = Object.keys(pairs);

document.getElementById("start").onclick = startGame;

function startGame(){

score = 0;
time = 10;

nextRound();

clearInterval(interval);

interval = setInterval(()=>{
time--;
timerEl.innerText="Time: "+time;

if(time<=0){
clearInterval(interval);
alert("Game Over! Score: "+score);
}

},1000);
}

function nextRound(){

let word = words[Math.floor(Math.random()*words.length)];
let opposite = pairs[word];

wordEl.innerText = word.toUpperCase();

let trap = Math.random() < 0.3;

if(trap){
modeEl.innerText="Mode: SAME (Trap)";
correct = word;
}
else{
modeEl.innerText="Mode: Opposite";
correct = opposite;
}

let choices = [word, opposite];

while(choices.length<4){
choices.push(words[Math.floor(Math.random()*words.length)]);
}

choices.sort(()=>Math.random()-0.5);

options.forEach((btn,i)=>{
btn.innerText=choices[i];

btn.onclick=()=>{
if(btn.innerText===correct){
score++;
scoreEl.innerText="Score: "+score;
}

nextRound();
};
});
}