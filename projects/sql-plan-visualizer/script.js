const queryInput=document.getElementById("queryInput")
const runBtn=document.getElementById("runBtn")
const planContainer=document.getElementById("planContainer")

runBtn.onclick=generatePlan

function generatePlan(){

const query=queryInput.value.toLowerCase()

planContainer.innerHTML=""

const steps=[]

if(query.includes("select")){

steps.push("Table Scan")

}

if(query.includes("where")){

steps.push("Filter")

}

if(query.includes("join")){

steps.push("Join Operation")

}

if(query.includes("group by")){

steps.push("Aggregation")

}

if(query.includes("order by")){

steps.push("Sorting")

}

if(query.includes("limit")){

steps.push("Limit")

}

for(let step of steps){

const node=document.createElement("div")

node.className="node"

node.textContent=step

planContainer.appendChild(node)

}

}