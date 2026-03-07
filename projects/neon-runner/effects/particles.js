import { ctx } from "../game.js"

export const particles = []

export function updateParticles(){

// spawn particles
if(Math.random() < 0.35){

particles.push({

x: window.innerWidth/2 + (Math.random()*700 - 350),
y: window.innerHeight,

vx: (Math.random()-0.5)*1.5,
vy: -Math.random()*6 - 2,

life: 60

})

}


// update particles
for(let p of particles){

p.x += p.vx
p.y += p.vy

p.life--

}


// remove dead particles
for(let i = particles.length-1; i>=0; i--){

if(particles[i].life <= 0){
particles.splice(i,1)
}

}

}



export function drawParticles(){

ctx.fillStyle = "#00ffff"

ctx.shadowBlur = 12
ctx.shadowColor = "#00ffff"

for(let p of particles){

ctx.fillRect(
p.x,
p.y,
3,
8
)

}

ctx.shadowBlur = 0

}