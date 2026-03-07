const board = document.getElementById("board")
const targetList = document.getElementById("targetList")
const scoreEl = document.getElementById("score")
const timeEl = document.getElementById("time")
const hintBtn = document.getElementById("hint")
const restartBtn = document.getElementById("restart")

const objects = ["🔑","📜","💎","🧭","🔍","📷","🪙","📦"]

let hidden=[]
let score=0
let timer=0
let found=0

function startGame(){

board.innerHTML=""
targetList.innerHTML=""
hidden=[]
score=0
found=0
timer=0
scoreEl.textContent=0

let shuffled=[...objects].sort(()=>Math.random()-0.5)
hidden=shuffled.slice(0,4)

hidden.forEach(obj=>{
let item=document.createElement("div")
item.className="object"
item.textContent=obj

item.style.left=Math.random()*450+"px"
item.style.top=Math.random()*350+"px"

item.onclick=()=>{
item.classList.add("found")
score+=10
found++
scoreEl.textContent=score

markFound(obj)

if(found===hidden.length){
alert("🎉 All objects found!")
startGame()
}
}

board.appendChild(item)

let li=document.createElement("li")
li.textContent=obj
li.id="target-"+obj
targetList.appendChild(li)

})
}

function markFound(obj){
let el=document.getElementById("target-"+obj)
if(el) el.style.textDecoration="line-through"
}

hintBtn.onclick=()=>{
if(hidden.length===0) return

let random=hidden[Math.floor(Math.random()*hidden.length)]
alert("Hint: Look for "+random)
}

restartBtn.onclick=startGame

setInterval(()=>{
timer++
timeEl.textContent=timer
},1000)

startGame()