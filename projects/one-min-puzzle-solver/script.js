const puzzleEl = document.getElementById("puzzle")
const answerInput = document.getElementById("answer")
const scoreEl = document.getElementById("score")
const timeEl = document.getElementById("time")

let score=0
let time=60
let currentAnswer=""

function randomPuzzle(){

let type=Math.floor(Math.random()*3)

if(type===0){

let a=Math.floor(Math.random()*20)
let b=Math.floor(Math.random()*20)

puzzleEl.innerText=`Solve: ${a} + ${b}`
currentAnswer=(a+b).toString()

}

else if(type===1){

let words=["planet","rocket","orbit","galaxy"]

let word=words[Math.floor(Math.random()*words.length)]

let scrambled=word.split('').sort(()=>0.5-Math.random()).join('')

puzzleEl.innerText=`Unscramble: ${scrambled}`
currentAnswer=word

}

else{

let n=Math.floor(Math.random()*10)

puzzleEl.innerText=`Next number: ${n}, ${n+2}, ${n+4}, ?`
currentAnswer=(n+6).toString()

}
}

document.getElementById("submit").onclick=()=>{

let ans=answerInput.value.trim()

if(ans==currentAnswer){

score+=10
scoreEl.innerText=score

}

answerInput.value=""

randomPuzzle()
}

document.getElementById("start").onclick=()=>{

score=0
time=60

scoreEl.innerText=0
timeEl.innerText=60

randomPuzzle()

let timer=setInterval(()=>{

time--

timeEl.innerText=time

if(time<=0){

clearInterval(timer)

alert("Mission Complete! Score: "+score)

}

},1000)
}