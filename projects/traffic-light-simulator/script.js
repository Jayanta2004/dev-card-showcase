const lights = {
red: document.querySelector(".red"),
yellow: document.querySelector(".yellow"),
green: document.querySelector(".green")
}

const countEl = document.getElementById("count")

let state = "red"
let timer = 5
let autoMode = true

function updateLights(){

Object.values(lights).forEach(l=>l.classList.remove("active"))

lights[state].classList.add("active")

}

function cycle(){

if(!autoMode) return

timer--
countEl.textContent = timer

if(timer <= 0){

if(state==="red"){
state="green"
timer=5
}
else if(state==="green"){
state="yellow"
timer=2
}
else{
state="red"
timer=5
}

updateLights()

}

}

setInterval(cycle,1000)

document.getElementById("auto").onclick=()=>{
autoMode=true
}

document.getElementById("redBtn").onclick=()=>{
autoMode=false
state="red"
updateLights()
}

document.getElementById("yellowBtn").onclick=()=>{
autoMode=false
state="yellow"
updateLights()
}

document.getElementById("greenBtn").onclick=()=>{
autoMode=false
state="green"
updateLights()
}

document.getElementById("pedestrian").onclick=()=>{

autoMode=false

state="red"
updateLights()

setTimeout(()=>{
state="green"
autoMode=true
updateLights()
},4000)

}

updateLights()