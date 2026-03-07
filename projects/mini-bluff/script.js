let score = 0;
let trust = 50;
let bluffsCalled = 0;
let currentNumber;
let currentClaim;
let aiMode = "random";

function startGame() {
  score = 0;
  trust = 50;
  bluffsCalled = 0;

  aiMode = ["honest", "random", "deceptive"]
    [Math.floor(Math.random()*3)];

  nextRound();
}

function nextRound() {
  currentNumber = Math.floor(Math.random() * 20) + 1;

  let isPrime = checkPrime(currentNumber);

  let lieChance = aiMode === "deceptive" ? 0.7 :
                  aiMode === "honest" ? 0.2 : 0.5;

  let willLie = Math.random() < lieChance;

  let claimIsPrime = willLie ? !isPrime : isPrime;

  currentClaim = claimIsPrime;

  document.getElementById("aiClaim").textContent =
    "AI says: The number is PRIME";

  let confidence = Math.random() * 100;
  document.getElementById("confidenceFill").style.width =
    confidence + "%";
}

function believe() {
  let correct = currentClaim === checkPrime(currentNumber);

  if (correct) {
    score += 10;
    trust += 5;
  } else {
    score -= 10;
    trust -= 10;
  }

  updateStats();
  nextRound();
}

function callBluff() {
  let isBluff = currentClaim !== checkPrime(currentNumber);

  if (isBluff) {
    score += 20;
    trust += 10;
    bluffsCalled++;
  } else {
    score -= 20;
    trust -= 15;
  }

  updateStats();
  nextRound();
}

function checkPrime(n) {
  if (n <= 1) return false;
  for (let i = 2; i < n; i++)
    if (n % i === 0) return false;
  return true;
}

function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("trust").textContent = trust;
  document.getElementById("bluffs").textContent = bluffsCalled;
}