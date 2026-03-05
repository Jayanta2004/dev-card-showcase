const shapes = ["Circle","Square","Triangle"];
const colors = ["Red","Blue","Green"];
const numbers = ["1","2","3"];

let secret = {};
let attempts = 6;

const feedback = document.getElementById("feedback");
const history = document.getElementById("history");

function generateSecret(){
secret = {
shape: shapes[Math.floor(Math.random()*shapes.length)],
color: colors[Math.floor(Math.random()*colors.length)],
number: numbers[Math.floor(Math.random()*numbers.length)]
};
}

generateSecret();

document.getElementById("guessBtn").onclick = () => {

const shape = document.getElementById("shape").value;
const color = document.getElementById("color").value;
const number = document.getElementById("number").value;

if(!shape || !color || !number){
feedback.textContent = "Select all options!";
return;
}

let clues = [];

if(shape === secret.shape) clues.push("Correct Shape");
else clues.push("Wrong Shape");

if(color === secret.color) clues.push("Correct Color");
else clues.push("Wrong Color");

if(number === secret.number) clues.push("Correct Number");
else clues.push("Wrong Number");

const li = document.createElement("li");
li.textContent = `${shape}, ${color}, ${number} → ${clues.join(", ")}`;
history.appendChild(li);

attempts--;

if(shape === secret.shape && color === secret.color && number === secret.number){
feedback.textContent = "🎉 You solved it!";
return;
}

if(attempts === 0){
feedback.textContent = `❌ Puzzle Failed! Answer: ${secret.shape}, ${secret.color}, ${secret.number}`;
return;
}

feedback.textContent = `Clues: ${clues.join(" | ")} | Attempts left: ${attempts}`;

};

document.getElementById("restart").onclick = () => {
history.innerHTML="";
attempts = 6;
feedback.textContent="";
generateSecret();
};