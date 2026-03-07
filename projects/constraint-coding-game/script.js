const problems = [
  {
    title: "Double a Number",
    desc: "Return the number multiplied by 2.",
    test: (fn) => fn(5) === 10,
    hint: "Use arrow function.",
  },
  {
    title: "Check Even",
    desc: "Return true if number is even.",
    test: (fn) => fn(4) === true && fn(5) === false,
    hint: "Use modulus operator.",
  },
  {
    title: "Reverse String",
    desc: "Return reversed string.",
    test: (fn) => fn("abc") === "cba",
    hint: "Use split, reverse, join.",
  }
];

const constraints = [
  {
    text: "No loops allowed",
    check: (code) => !code.includes("for") && !code.includes("while")
  },
  {
    text: "No if statements",
    check: (code) => !code.includes("if")
  },
  {
    text: "Only 1 line of code",
    check: (code) => code.split("\n").length <= 1
  },
  {
    text: "Only 1 variable allowed",
    check: (code) => (code.match(/let|var|const/g) || []).length <= 1
  }
];

let currentProblem;
let currentConstraint;
let score = 0;
let streak = 0;

function nextChallenge() {
  currentProblem = problems[Math.floor(Math.random() * problems.length)];
  currentConstraint = constraints[Math.floor(Math.random() * constraints.length)];

  document.getElementById("problemTitle").textContent = currentProblem.title;
  document.getElementById("problemDesc").textContent = currentProblem.desc;
  document.getElementById("constraintText").textContent = currentConstraint.text;
  document.getElementById("codeInput").value = "";
  document.getElementById("feedback").textContent = "";
}

function runCode() {
  const code = document.getElementById("codeInput").value;

  if (!currentConstraint.check(code)) {
    document.getElementById("feedback").textContent = "Constraint violated!";
    streak = 0;
    updateStats();
    return;
  }

  try {
    const userFunction = eval(code);

    if (currentProblem.test(userFunction)) {
      score += 10;
      streak++;
      document.getElementById("feedback").textContent = "Success!";
    } else {
      streak = 0;
      document.getElementById("feedback").textContent = "Incorrect Output!";
    }

  } catch {
    streak = 0;
    document.getElementById("feedback").textContent = "Code Error!";
  }

  updateStats();
}

function useHint() {
  score -= 5;
  document.getElementById("feedback").textContent = "Hint: " + currentProblem.hint;
  updateStats();
}

function updateStats() {
  document.getElementById("score").textContent = score;
  document.getElementById("streak").textContent = streak;
}

nextChallenge();