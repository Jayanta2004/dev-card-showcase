const choices = ["rock", "paper", "scissors"];

const clickSound = new Audio("sounds/click.mp3");
const winSound = new Audio("sounds/win.mp3");
const loseSound = new Audio("sounds/lose.mp3");
const drawSound = new Audio("sounds/draw.mp3");

let userScore = Number(localStorage.getItem("userScore")) || 0;
let botScore = Number(localStorage.getItem("botScore")) || 0;

let player1Choice = "";

const resultText = document.getElementById("result");
const userScoreText = document.getElementById("userScore");
const botScoreText = document.getElementById("botScore");
const gameBox = document.querySelector(".panel");
const botLabel = document.getElementById("botLabel");
const oppLabel = document.getElementById("oppLabel");
const userPick = document.getElementById("userPick");
const botPick = document.getElementById("botPick");

userScoreText.innerText = userScore;
botScoreText.innerText = botScore;

function play(choice) {
  clickSound.play();
  gameBox.classList.remove("win", "lose");

  const mode = document.getElementById("mode").value;
  const opponentName = mode === "bot" ? "Bot" : "Player 2";
  botLabel.textContent = opponentName;
  oppLabel.textContent = opponentName;
  userPick.textContent = "...";
  botPick.textContent = "...";

  if (mode === "bot") {
    playBot(choice);
  } else {
    playFriend(choice);
  }
}

function playBot(userChoice) {
  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  userPick.textContent = formatChoice(userChoice);
  botPick.textContent = formatChoice(botChoice);
  decideWinner(userChoice, botChoice, true);
}

function playFriend(choice) {
  if (!player1Choice) {
    player1Choice = choice;
    userPick.textContent = formatChoice(choice);
    resultText.innerText = "Player 2, make your choice!";
  } else {
    botPick.textContent = formatChoice(choice);
    decideWinner(player1Choice, choice, false);
    player1Choice = "";
  }
}

function decideWinner(choice1, choice2, isBot) {
  if (choice1 === choice2) {
    resultText.innerText = `🤝 Draw! Both chose ${choice1}`;
    drawSound.play();
    return;
  }

  const userWins =
    (choice1 === "rock" && choice2 === "scissors") ||
    (choice1 === "paper" && choice2 === "rock") ||
    (choice1 === "scissors" && choice2 === "paper");

  if (userWins) {
    resultText.innerText = `✅ ${choice1} beats ${choice2}`;
    userScore++;
    winSound.play();
    gameBox.classList.add("win");
  } else {
    resultText.innerText = `❌ ${choice2} beats ${choice1}`;
    botScore++;
    loseSound.play();
    gameBox.classList.add("lose");
  }

  userScoreText.innerText = userScore;
  botScoreText.innerText = botScore;

  localStorage.setItem("userScore", userScore);
  localStorage.setItem("botScore", botScore);
}

function resetGame() {
  userScore = 0;
  botScore = 0;
  localStorage.setItem("userScore", "0");
  localStorage.setItem("botScore", "0");
  userScoreText.innerText = 0;
  botScoreText.innerText = 0;
  resultText.innerText = "";
  player1Choice = "";
  userPick.textContent = "-";
  botPick.textContent = "-";
}

function formatChoice(choice) {
  const icons = {
    rock: "🪨 Rock",
    paper: "📄 Paper",
    scissors: "✂️ Scissors"
  };
  return icons[choice] || "-";
}
