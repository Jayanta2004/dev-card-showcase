const patternEl = document.getElementById("pattern")
const choicesEl = document.getElementById("choices")
const statusEl = document.getElementById("status")
const scoreEl = document.getElementById("score")
const levelEl = document.getElementById("level")
const streakEl = document.getElementById("streak")
const restartBtn = document.getElementById("restart")

let level = 1
let score = 0
let streak = 0
let correctAnswer = null

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePattern() {
  patternEl.innerHTML = ""
  const start = random(1, 5)
  const step = random(1, level + 1)
  const length = 3 + Math.floor(level / 2)

  const sequence = []
  for (let i = 0; i < length; i++) {
    sequence.push(start + i * step)
  }

  correctAnswer = start + length * step

  sequence.forEach(n => {
    const span = document.createElement("span")
    span.textContent = n
    patternEl.appendChild(span)
  })

  generateChoices()
}

function generateChoices() {
  choicesEl.innerHTML = ""
  const answers = new Set([correctAnswer])

  while (answers.size < 6) {
    answers.add(correctAnswer + random(-5, 5))
  }

  Array.from(answers)
    .sort(() => Math.random() - 0.5)
    .forEach(value => {
      const div = document.createElement("div")
      div.className = "choice"
      div.textContent = value
      div.onclick = () => checkAnswer(value)
      choicesEl.appendChild(div)
    })
}

function checkAnswer(value) {
  if (value === correctAnswer) {
    score += 10
    streak++
    level += streak % 3 === 0 ? 1 : 0
    statusEl.textContent = "Correct!"
    statusEl.className = "status correct"
  } else {
    streak = 0
    statusEl.textContent = "Wrong!"
    statusEl.className = "status wrong"
  }

  updateUI()
  setTimeout(generatePattern, 600)
}

function updateUI() {
  scoreEl.textContent = `Score ${score}`
  levelEl.textContent = `Level ${level}`
  streakEl.textContent = `Streak ${streak}`
}

restartBtn.onclick = () => {
  level = 1
  score = 0
  streak = 0
  updateUI()
  statusEl.textContent = ""
  generatePattern()
}

generatePattern()
