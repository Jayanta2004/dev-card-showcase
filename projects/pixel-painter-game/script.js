const board=document.getElementById("board")
const colorPicker=document.getElementById("colorPicker")
const gridSize=document.getElementById("gridSize")

let currentColor=colorPicker.value
let erase=false

colorPicker.oninput=()=>{
currentColor=colorPicker.value
erase=false
}

document.getElementById("eraser").onclick=()=>{
erase=true
}

function createGrid(size){

board.innerHTML=""

board.style.gridTemplateColumns=`repeat(${size},1fr)`
board.style.gridTemplateRows=`repeat(${size},1fr)`

for(let i=0;i<size*size;i++){

let pixel=document.createElement("div")
pixel.className="pixel"

pixel.onmousedown=()=>{
pixel.style.background=erase?"#020617":currentColor
saveCanvas()
}

board.appendChild(pixel)
}

loadCanvas()
}

gridSize.onchange=()=>{
createGrid(gridSize.value)
}

document.getElementById("clear").onclick=()=>{
document.querySelectorAll(".pixel").forEach(p=>{
p.style.background="#020617"
})
localStorage.removeItem("pixelArt")
}

document.getElementById("download").onclick=()=>{

let data=[]

document.querySelectorAll(".pixel").forEach(p=>{
data.push(p.style.background)
})

let link=document.createElement("a")
link.download="pixel-art.txt"
link.href="data:text/plain,"+data.join(",")
link.click()

}

function saveCanvas(){

let data=[]

document.querySelectorAll(".pixel").forEach(p=>{
data.push(p.style.background)
})

localStorage.setItem("pixelArt",JSON.stringify(data))
}

function loadCanvas(){

let data=JSON.parse(localStorage.getItem("pixelArt"))

if(!data) return

document.querySelectorAll(".pixel").forEach((p,i)=>{
p.style.background=data[i]
})
}

createGrid(16)