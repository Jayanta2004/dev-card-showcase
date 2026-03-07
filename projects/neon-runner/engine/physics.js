import { player, lanes } from "../entities/player.js"
import { gameSpeed } from "../game.js"

export let velocity = 0
export let acceleration = 0.4
export let maxSpeed = 20
export let friction = 0.96

export function updatePhysics(){

applyAcceleration()

applyFriction()

updateLaneMovement()

updateNitro()

}

function applyAcceleration(){

velocity += acceleration

if(velocity > maxSpeed){
velocity = maxSpeed
}

}

function applyFriction(){

velocity *= friction

}

function updateLaneMovement(){

const targetLaneX = lanes[player.lane]

const diff = targetLaneX - player.x

player.x += diff * 0.12

player.tilt = diff * 0.002

}

function updateNitro(){

if(player.nitro > 0 && player.boosting){

velocity += 1.2

player.nitro -= 0.6

if(player.nitro < 0){
player.nitro = 0
player.boosting = false
}

}

}

export function getSpeed(){

return velocity + gameSpeed

}

export function resetPhysics(){

velocity = 0

}