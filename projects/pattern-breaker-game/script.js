const patternDiv = document.getElementById("pattern")
const optionsDiv = document.getElementById("options")

const scoreEl = document.getElementById("score")
const levelEl = document.getElementById("level")
const streakEl = document.getElementById("streak")

const msg = document.getElementById("message")
const startBtn = document.getElementById("startBtn")

let score = 0
let level = 1
let streak = 0

let correctIndex = 0

startBtn.addEventListener("click", startGame)

function startGame(){

score = 0
level = 1
streak = 0

updateStats()
generateRound()

}

function generatePattern(){

let start = Math.floor(Math.random()*6)+2
let step = Math.floor(Math.random()*4)+1

let pattern = []

for(let i=0;i<5;i++){
pattern.push(start + i*step)
}

correctIndex = Math.floor(Math.random()*5)

pattern[correctIndex] += Math.floor(Math.random()*6)+3

return pattern

}

function generateRound(){

patternDiv.innerHTML=""
optionsDiv.innerHTML=""

let pattern = generatePattern()

pattern.forEach(num => {

let card = document.createElement("div")
card.className="card"
card.textContent=num

patternDiv.appendChild(card)

})

pattern.forEach((num,index)=>{

let option = document.createElement("div")
option.className="option"
option.textContent=num

option.onclick = () => checkAnswer(index)

optionsDiv.appendChild(option)

})

msg.textContent="Find the number that breaks the pattern!"

}

function checkAnswer(index){

let options = document.querySelectorAll(".option")

if(index === correctIndex){

options[index].classList.add("correct")

streak++
score += 10 + streak*2
level++

msg.textContent="Correct!"

}else{

options[index].classList.add("wrong")
options[correctIndex].classList.add("correct")

streak = 0

msg.textContent="Wrong!"

}

updateStats()

setTimeout(generateRound,900)

}

function updateStats(){

scoreEl.textContent = score
levelEl.textContent = level
streakEl.textContent = streak

}