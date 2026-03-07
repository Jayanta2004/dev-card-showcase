document.getElementById("analyze").onclick = () => {

let code = document.getElementById("codeInput").value;

let loops = (code.match(/for|while/g) || []).length;
let conds = (code.match(/if|else|switch/g) || []).length;
let funcs = (code.match(/function|=>/g) || []).length;

let depth = 0;
let maxDepth = 0;

for(let c of code){

if(c === "{"){
depth++;
maxDepth = Math.max(maxDepth, depth);
}

if(c === "}"){
depth--;
}

}

document.getElementById("loops").innerText = loops;
document.getElementById("conds").innerText = conds;
document.getElementById("funcs").innerText = funcs;
document.getElementById("depth").innerText = maxDepth;

let score = loops*3 + conds*2 + funcs*2 + maxDepth*4;

let percent = Math.min(score*5,100);

document.getElementById("bar").style.width = percent + "%";

let level = "Low";

if(score > 10) level="Medium";
if(score > 20) level="High";

document.getElementById("level").innerText = "Complexity Level: " + level;

};