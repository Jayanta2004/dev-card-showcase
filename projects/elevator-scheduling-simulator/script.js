const floorsDiv = document.getElementById("floors")
const elevator = document.getElementById("elevator")

const currentFloorEl = document.getElementById("currentFloor")
const directionEl = document.getElementById("direction")
const queueEl = document.getElementById("queue")

let currentFloor = 1
let queue = []
let moving = false

const floorHeight = 60

for(let i=5;i>=1;i--){

const btn = document.createElement("button")
btn.textContent = "Floor "+i
btn.className = "floor-btn"

btn.onclick = ()=>{

if(!queue.includes(i)){
queue.push(i)
updateQueue()
moveElevator()
}

}

floorsDiv.appendChild(btn)

}

function updateQueue(){
queueEl.textContent = queue.join(" → ")
}

function moveElevator(){

if(moving || queue.length === 0) return

moving = true

let target = queue.shift()

let direction = target > currentFloor ? "Up ↑" : "Down ↓"

directionEl.textContent = direction

let interval = setInterval(()=>{

if(currentFloor === target){

clearInterval(interval)

directionEl.textContent = "Idle"
moving = false

updateQueue()

moveElevator()

return
}

if(currentFloor < target){
currentFloor++
}else{
currentFloor--
}

currentFloorEl.textContent = currentFloor

elevator.style.bottom = (currentFloor-1)*floorHeight + "px"

},1000)

}

updateQueue()