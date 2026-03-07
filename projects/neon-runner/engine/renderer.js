import { ctx } from "../game.js"

import { drawCity } from "../effects/cityBackground.js"
import { drawRoad } from "../effects/neonRoad.js"
import { drawParticles } from "../effects/particles.js"

import { drawPlayer } from "../entities/player.js"
import { drawObstacles } from "../entities/obstacle.js"
import { drawCoins } from "../entities/coin.js"

let shakeTime = 0
let shakeIntensity = 0

export function clearScreen(){

ctx.clearRect(0,0,window.innerWidth,window.innerHeight)

}

export function renderFrame(){

applyCameraShake()

drawCity()

drawRoad()

drawCoins()

drawObstacles()

drawPlayer()

drawParticles()

resetCamera()

}

function applyCameraShake(){

if(shakeTime > 0){

shakeTime--

const dx = (Math.random() - 0.5) * shakeIntensity
const dy = (Math.random() - 0.5) * shakeIntensity

ctx.save()
ctx.translate(dx,dy)

}

}

function resetCamera(){

if(shakeTime > 0){

ctx.restore()

}

}

export function triggerScreenShake(intensity,duration){

shakeIntensity = intensity
shakeTime = duration

}

export function neonGlow(color,blur){

ctx.shadowColor = color
ctx.shadowBlur = blur

}

export function disableGlow(){

ctx.shadowBlur = 0

}