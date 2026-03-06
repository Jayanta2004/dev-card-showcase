const grid = document.getElementById("hexGrid")
const scoreEl = document.getElementById("score")
const dropBtn = document.getElementById("dropBtn")
const input = document.getElementById("numberInput")

let cells = []
let score = 0

function createGrid(){
grid.innerHTML=""
cells=[]

for(let i=0;i<20;i++){
let cell=document.createElement("div")
cell.classList.add("hex")
cell.dataset.value=0
grid.appendChild(cell)
cells.push(cell)
}
}

function dropNumber(){

let value=parseInt(input.value)

if(!value) return

let empty=cells.filter(c=>c.dataset.value==0)

if(empty.length==0){
alert("Reactor Full!")
return
}

let randomCell=empty[Math.floor(Math.random()*empty.length)]

randomCell.dataset.value=value
randomCell.innerText=value
randomCell.classList.add("active")

checkMerge()
}

function checkMerge(){

for(let i=0;i<cells.length;i++){

for(let j=i+1;j<cells.length;j++){

if(
cells[i].dataset.value!=0 &&
cells[i].dataset.value===cells[j].dataset.value
){

let merged=parseInt(cells[i].dataset.value)*2

cells[i].dataset.value=merged
cells[i].innerText=merged

cells[j].dataset.value=0
cells[j].innerText=""
cells[j].classList.remove("active")

score+=merged
scoreEl.innerText=score

pulse(cells[i])
}
}
}
}

function pulse(cell){

cell.style.transform="scale(1.3)"

setTimeout(()=>{
cell.style.transform="scale(1)"
},200)
}

document.getElementById("reset").onclick=()=>{
score=0
scoreEl.innerText=0
createGrid()
}

dropBtn.onclick=dropNumber

createGrid()