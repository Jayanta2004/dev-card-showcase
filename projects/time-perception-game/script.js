let startTime;
let targetTime;
let historyList = document.getElementById("history");

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const result = document.getElementById("result");

startBtn.onclick = () => {

targetTime = parseInt(document.getElementById("level").value);
startTime = Date.now();

result.innerHTML = "";
document.getElementById("status").innerHTML = "Feel the time...";

startBtn.disabled = true;
stopBtn.disabled = false;
};

stopBtn.onclick = () => {

let endTime = Date.now();
let elapsed = endTime - startTime;

let diff = Math.abs(targetTime - elapsed) / 1000;

let rating = "";

if(diff <= 0.2) rating = "🏆 Perfect!";
else if(diff <= 0.5) rating = "🔥 Great!";
else if(diff <= 1) rating = "👍 Good!";
else rating = "😅 Try Again";

result.innerHTML =
`Target: ${targetTime/1000}s <br>
Your Time: ${(elapsed/1000).toFixed(2)}s <br>
Difference: ${diff.toFixed(2)}s <br>
${rating}`;

let li = document.createElement("li");
li.textContent = `Target ${targetTime/1000}s → You: ${(elapsed/1000).toFixed(2)}s`;
historyList.prepend(li);

startBtn.disabled = false;
stopBtn.disabled = true;
document.getElementById("status").innerHTML = "Press Start Again";
};