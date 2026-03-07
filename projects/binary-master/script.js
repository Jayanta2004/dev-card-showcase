const bits = 5;

const bitRow = document.getElementById("bitRow");
const weights = document.getElementById("weights");
const valueEl = document.getElementById("value");
const targetEl = document.getElementById("target");
const scoreEl = document.getElementById("score");

let state = new Array(bits).fill(0);
let target = 0;
let score = 0;

function createBits(){

bitRow.innerHTML="";
weights.innerHTML="";

for(let i=bits-1;i>=0;i--){

const bit=document.createElement("div");
bit.className="bit";
bit.innerText="0";

bit.onclick=()=>{
state[i]=state[i]?0:1;
bit.innerText=state[i];
bit.classList.toggle("active");
updateValue();
};

bitRow.appendChild(bit);

const w=document.createElement("div");
w.innerText=2**i;
weights.appendChild(w);

}

}

function updateValue(){

let value=0;

for(let i=0;i<bits;i++){

if(state[i]) value+=2**i;

}

valueEl.innerText=value;

}

function newTarget(){

target=Math.floor(Math.random()*31)+1;
targetEl.innerText=target;

state.fill(0);
updateValue();

document.querySelectorAll(".bit").forEach(b=>{
b.innerText="0";
b.classList.remove("active");
});

}

document.getElementById("check").onclick=()=>{

let val=parseInt(valueEl.innerText);

if(val===target){

score+=10;
scoreEl.innerText=score;
alert("Correct!");
newTarget();

}else{

alert("Not correct!");

}

};

document.getElementById("new").onclick=newTarget;

createBits();
newTarget();