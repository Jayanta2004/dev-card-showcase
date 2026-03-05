const rules = [
{
name:"multiply by 2",
check:(n)=>n%2===0
},
{
name:"add 5 pattern",
check:(n)=>n>=5
},
{
name:"multiples of 3",
check:(n)=>n%3===0
},
{
name:"even numbers",
check:(n)=>n%2===0
},
{
name:"square numbers",
check:(n)=>Number.isInteger(Math.sqrt(n))
}
];

let currentRule;

const result = document.getElementById("result");
const log = document.getElementById("log");
const message = document.getElementById("message");

function newGame(){

currentRule = rules[Math.floor(Math.random()*rules.length)];

log.innerHTML="";
message.innerHTML="";
result.innerHTML="";
}

document.getElementById("testBtn").onclick=()=>{

let num = Number(document.getElementById("inputNumber").value);

if(isNaN(num)) return;

let pass = currentRule.check(num);

result.innerText = pass ? "✅ Fits Rule" : "❌ Doesn't Fit";

let li=document.createElement("li");
li.innerText = num + " → " + (pass?"PASS":"FAIL");

log.prepend(li);
};

document.getElementById("guessBtn").onclick=()=>{

let guess = document.getElementById("guessInput").value.toLowerCase();

if(guess.includes(currentRule.name)){
message.innerText="🎉 Correct! You discovered the rule.";
}
else{
message.innerText="❌ Wrong guess. Keep testing.";
}
};

document.getElementById("newGame").onclick=newGame;

newGame();