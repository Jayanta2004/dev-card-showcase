function checkCollision(){
  for(let o of obstacles){
    let ox = parseInt(o.style.left);
    let ow = o.offsetWidth;
    let oh = o.offsetHeight;
    let oy = 80;

    if(
      x+40 > ox &&
      x < ox+ow &&
      y < oy+oh &&
      y+50 > oy
    ){
      endGame();
      return;
    }
  }

  coins.forEach(c=>{
    if(c.style.display !== "none"){
      let cx = parseInt(c.style.left);
      let cy = parseInt(c.style.bottom);

      if(Math.abs(x-cx)<30 && Math.abs(y-cy)<40){
        c.style.display = "none";
        score += 10;
        hud.innerText = "Score: " + score;
      }
    }
  });
}