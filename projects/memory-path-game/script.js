const sky = document.getElementById("sky")
const startBtn = document.getElementById("start")
const levelText = document.getElementById("level")

let stars=[]
let path=[]
let player=[]
let level=1
let clickable=false

function createStars(){

sky.innerHTML=""
stars=[]

for(let i=0;i<12;i++){

let star=document.createElement("div")
star.classList.add("star")

star.style.left=Math.random()*380+"px"
star.style.top=Math.random()*380+"px"

star.dataset.index=i

star.onclick=()=>clickStar(i)

sky.appendChild(star)

stars.push(star)
}
}

function startGame(){

path=[]
player=[]
clickable=false

for(let i=0;i<level+2;i++){
path.push(Math.floor(Math.random()*stars.length))
}

showPath()
}

function showPath(){

let i=0

let interval=setInterval(()=>{

let star=stars[path[i]]

star.classList.add("active")

setTimeout(()=>star.classList.remove("active"),400)

i++

if(i>=path.length){
clearInterval(interval)
clickable=true
}

},600)
}

function clickStar(i){

if(!clickable) return

stars[i].classList.add("active")

setTimeout(()=>stars[i].classList.remove("active"),200)

player.push(i)

if(player[player.length-1]!==path[player.length-1]){

alert("Wrong constellation!")
level=1
levelText.innerText="Level 1"
return
}

if(player.length===path.length){

level++
levelText.innerText="Level "+level

setTimeout(startGame,800)
}
}

startBtn.onclick=startGame

createStars()