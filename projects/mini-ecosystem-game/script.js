const canvas = document.getElementById("game")
const ctx = canvas.getContext("2d")

const plantCountEl = document.getElementById("plantCount")
const herbCountEl = document.getElementById("herbCount")
const predCountEl = document.getElementById("predCount")

let plants = []
let herbivores = []
let predators = []

function randomPos(){

return {
x:Math.random()*480,
y:Math.random()*380
}

}

function growPlant(){

plants.push({
...randomPos(),
size:6
})

}

setInterval(growPlant,1000)

function addHerbivore(){

herbivores.push({
...randomPos(),
size:10,
energy:100
})

}

function addPredator(){

predators.push({
...randomPos(),
size:12,
energy:120
})

}

function move(creature){

creature.x += (Math.random()-0.5)*2
creature.y += (Math.random()-0.5)*2

}

function update(){

herbivores.forEach(h=>{

move(h)

plants.forEach((p,i)=>{

if(
Math.abs(h.x-p.x)<10 &&
Math.abs(h.y-p.y)<10
){

plants.splice(i,1)
h.energy+=20

}

})

h.energy-=0.1

})

predators.forEach(pr=>{

move(pr)

herbivores.forEach((h,i)=>{

if(
Math.abs(pr.x-h.x)<12 &&
Math.abs(pr.y-h.y)<12
){

herbivores.splice(i,1)
pr.energy+=40

}

})

pr.energy-=0.2

})

herbivores = herbivores.filter(h=>h.energy>0)
predators = predators.filter(p=>p.energy>0)

updateStats()

}

function updateStats(){

plantCountEl.textContent = plants.length
herbCountEl.textContent = herbivores.length
predCountEl.textContent = predators.length

}

function draw(){

ctx.clearRect(0,0,500,400)

// plants
ctx.fillStyle="#38a169"
plants.forEach(p=>{
ctx.fillRect(p.x,p.y,p.size,p.size)
})

// herbivores
ctx.fillStyle="#3182ce"
herbivores.forEach(h=>{
ctx.fillRect(h.x,h.y,h.size,h.size)
})

// predators
ctx.fillStyle="#e53e3e"
predators.forEach(p=>{
ctx.fillRect(p.x,p.y,p.size,p.size)
})

}

function gameLoop(){

update()
draw()

requestAnimationFrame(gameLoop)

}

gameLoop()