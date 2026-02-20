let secretCode = generateCode();
let attempts = 7;

function generateCode() {
  let code = [];
  while (code.length < 3) {
    let num = Math.floor(Math.random() * 10);
    if (!code.includes(num)) {
      code.push(num);
    }
  }
  return code;
}

function checkGuess() {
  const input = document.getElementById("guessInput").value;
  const feedbackDiv = document.getElementById("feedback");
  const historyDiv = document.getElementById("history");

  // Validation
  if (input.length !== 3 || isNaN(input)) {
    feedbackDiv.textContent = "⚠️ Enter exactly 3 numeric digits.";
    return;
  }

  let guess = input.split("").map(Number);
  let result = [];

  // Logic for indications
  for (let i = 0; i < 3; i++) {
    if (guess[i] === secretCode[i]) {
      result.push("🟢 Correct & Correct Position");
    } 
    else if (secretCode.includes(guess[i])) {
      result.push("🟡 Correct Digit, Wrong Position");
    } 
    else {
      result.push("🔴 Digit Not in Code");
    }
  }

  attempts--;
  document.getElementById("attempts").textContent =
    `Attempts left: ${attempts}`;

  // Display history
  historyDiv.innerHTML += `
    <p>
      <strong>${input}</strong><br>
      Digit 1: ${result[0]}<br>
      Digit 2: ${result[1]}<br>
      Digit 3: ${result[2]}
    </p>
  `;

  // Win condition
  if (result.every(r => r.includes("🟢"))) {
    feedbackDiv.textContent = "🎉 Code Cracked! You win!";
    endGame();
  }
  // Lose condition
  else if (attempts === 0) {
    feedbackDiv.textContent =
      `💥 Game Over! The code was ${secretCode.join("")}`;
    endGame();
  } 
  else {
    feedbackDiv.textContent = "🔍 Analyze the hints and try again.";
  }

  document.getElementById("guessInput").value = "";
}

function endGame() {
  document.getElementById("guessInput").disabled = true;
}
