const queueList = document.getElementById("queueList")
const currentEl = document.getElementById("current")
const servedEl = document.getElementById("served")
const avgEl = document.getElementById("avg")

let queue = []
let ticket = 1
let served = 0
let totalWait = 0

document.getElementById("newTicket").onclick = () => {

queue.push({
id: ticket,
time: Date.now()
})

ticket++

renderQueue()

}

document.getElementById("serveNext").onclick = () => {

if(queue.length === 0) return

let next = queue.shift()

let wait = (Date.now() - next.time)/1000

totalWait += wait
served++

currentEl.textContent = "Ticket " + next.id
servedEl.textContent = served
avgEl.textContent = (totalWait/served).toFixed(1)

renderQueue()

}

document.getElementById("reset").onclick = () => {

queue=[]
ticket=1
served=0
totalWait=0

currentEl.textContent="None"
servedEl.textContent="0"
avgEl.textContent="0"

renderQueue()

}

function renderQueue(){

queueList.innerHTML=""

queue.forEach(t=>{

let li=document.createElement("li")
li.textContent="Ticket "+t.id

queueList.appendChild(li)

})

}