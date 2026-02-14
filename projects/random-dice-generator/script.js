const dice = document.getElementById("dice");
const rollBtn = document.getElementById("rollBtn");
const resetBtn = document.getElementById("resetBtn");

const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");
const statusEl = document.getElementById("status");
const highScoreEl = document.getElementById("highScore");

const player1Box = document.getElementById("player1");
const player2Box = document.getElementById("player2");

let score1 = 0;
let score2 = 0;
let currentPlayer = 1;
let currentX = 0;
let currentY = 0;
let highScore = localStorage.getItem("highScore") || 0;

highScoreEl.textContent = highScore;

function getRotation(num){
  switch(num){
    case 1: return {x:0,y:0};
    case 2: return {x:0,y:180};
    case 3: return {x:-90,y:0};
    case 4: return {x:90,y:0};
    case 5: return {x:0,y:-90};
    case 6: return {x:0,y:90};
  }
}

rollBtn.addEventListener("click", () => {

  rollBtn.disabled = true;
  statusEl.textContent = "Rolling...";
  dice.classList.add("rolling");

  const random = Math.floor(Math.random()*6)+1;
  const rotation = getRotation(random);

  currentX += 720 + rotation.x;
  currentY += 720 + rotation.y;

  dice.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;

  setTimeout(()=>{

    dice.classList.remove("rolling");

    if(currentPlayer === 1){
      score1 += random;
      score1El.textContent = score1;

      if(score1 >= 20){
        endGame("Player 1 Wins 🎉", player1Box);
        return;
      }

      currentPlayer = 2;
      player1Box.classList.remove("active");
      player2Box.classList.add("active");

    } else {

      score2 += random;
      score2El.textContent = score2;

      if(score2 >= 20){
        endGame("Player 2 Wins 🎉", player2Box);
        return;
      }

      currentPlayer = 1;
      player2Box.classList.remove("active");
      player1Box.classList.add("active");
    }

    statusEl.textContent = `Player ${currentPlayer}'s Turn`;
    rollBtn.disabled = false;

  },1500);
});

function endGame(message, winnerBox){
  statusEl.textContent = message;
  rollBtn.disabled = true;
  winnerBox.classList.add("winner");

  const winnerScore = Math.max(score1, score2);
  if(winnerScore > highScore){
    highScore = winnerScore;
    localStorage.setItem("highScore", highScore);
    highScoreEl.textContent = highScore;
  }
}

resetBtn.addEventListener("click", ()=>{
  score1 = 0;
  score2 = 0;
  currentPlayer = 1;

  score1El.textContent = 0;
  score2El.textContent = 0;

  statusEl.textContent = "Player 1's Turn";
  rollBtn.disabled = false;

  player1Box.classList.add("active");
  player2Box.classList.remove("active");
  player1Box.classList.remove("winner");
  player2Box.classList.remove("winner");
});
