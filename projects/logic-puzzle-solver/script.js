const input = document.getElementById("numberInput");
const logicType = document.getElementById("logicType");
const solveBtn = document.getElementById("solveBtn");
const resultText = document.getElementById("resultText");
const stepsList = document.getElementById("steps");

solveBtn.addEventListener("click", () => {
  const num = Number(input.value);
  const type = logicType.value;

  stepsList.innerHTML = "";

  if (isNaN(num)) {
    resultText.textContent = "Please enter a valid number.";
    return;
  }

  if (type === "evenOdd") {
    steps("Check remainder when divided by 2");
    if (num % 2 === 0) {
      resultText.textContent = `${num} is Even`;
      steps("Remainder is 0 → Even number");
    } else {
      resultText.textContent = `${num} is Odd`;
      steps("Remainder is not 0 → Odd number");
    }
  }

  if (type === "prime") {
    steps("Check divisibility from 2 to √n");
    let prime = num > 1;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        prime = false;
        steps(`Divisible by ${i} → Not Prime`);
        break;
      }
    }
    if (prime) {
      resultText.textContent = `${num} is a Prime number`;
      steps("No divisors found → Prime");
    } else {
      resultText.textContent = `${num} is NOT a Prime number`;
    }
  }

  if (type === "divisible") {
    steps("Check divisibility by 3 and 5");
    const by3 = num % 3 === 0;
    const by5 = num % 5 === 0;

    resultText.textContent =
      `${num} is ${by3 ? "" : "not "}divisible by 3 and ${by5 ? "" : "not "}divisible by 5`;

    steps(by3 ? "Divisible by 3" : "Not divisible by 3");
    steps(by5 ? "Divisible by 5" : "Not divisible by 5");
  }
});

function steps(text) {
  const li = document.createElement("li");
  li.textContent = text;
  stepsList.appendChild(li);
}
