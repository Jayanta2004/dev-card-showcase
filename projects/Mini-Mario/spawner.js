let obstacles = [];
let coins = [];
let spawnX = 800;

function spawnObstacle(){
  let type = Math.floor(Math.random()*3);
  let obstacle;

  if(type === 0){
    obstacle = document.createElement("div");
    obstacle.className = "spike";
  } else if(type === 1){
    obstacle = document.createElement("div");
    obstacle.className = "pipe";
  } else {
    obstacle = document.createElement("div");
    obstacle.className = "enemy";
  }

  obstacle.style.left = spawnX + "px";
  world.appendChild(obstacle);
  obstacles.push(obstacle);

  const coin = document.createElement("div");
  coin.className = "coin";
  coin.style.left = (spawnX + 20) + "px";
  coin.style.bottom = "200px";
  world.appendChild(coin);
  coins.push(coin);

  spawnX += 400 + Math.random()*300;
}