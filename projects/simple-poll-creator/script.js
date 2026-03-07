const optionsDiv = document.getElementById("options")
const addOptionBtn = document.getElementById("addOption")
const createPollBtn = document.getElementById("createPoll")
const pollArea = document.getElementById("pollArea")

let optionCount = 2

function addOptionField(){

const input = document.createElement("input")
input.placeholder = "Option " + optionCount
input.className = "optionInput"

optionsDiv.appendChild(input)

optionCount++

}

addOptionBtn.onclick = addOptionField

addOptionField()
addOptionField()

createPollBtn.onclick = () => {

const question = document.getElementById("questionInput").value
const optionInputs = document.querySelectorAll(".optionInput")

let options = []

optionInputs.forEach(input=>{
if(input.value.trim() !== ""){
options.push({
text:input.value,
votes:0
})
}
})

renderPoll(question, options)

}

function renderPoll(question, options){

pollArea.innerHTML = ""

const q = document.createElement("h2")
q.textContent = question

pollArea.appendChild(q)

options.forEach((opt,i)=>{

const div = document.createElement("div")
div.className = "option"

const btn = document.createElement("button")
btn.textContent = opt.text

const bar = document.createElement("div")
bar.className = "bar"

btn.onclick = ()=>{

opt.votes++

updateBars()

}

div.appendChild(btn)
div.appendChild(bar)

pollArea.appendChild(div)

})

function updateBars(){

const total = options.reduce((sum,o)=>sum+o.votes,0)

const bars = document.querySelectorAll(".bar")

options.forEach((opt,i)=>{

const percent = total ? (opt.votes/total)*100 : 0

bars[i].style.width = percent + "%"

})

}

}