const input = document.getElementById("calcInput");
const buttons = document.querySelectorAll(".buttons button");
const historyList = document.getElementById("historyList");
const themeToggle = document.getElementById("themeToggle");

let history = [];

/* Evaluate expression safely */
function evaluateExpression(expr) {
  try {
    expr = expr.replace(/÷/g, "/").replace(/×/g, "*");
    expr = expr.replace(/√/g, "Math.sqrt");
    expr = expr.replace(/\^/g, "**");
    return Function(`return ${expr}`)();
  } catch {
    return "Error";
  }
}

/* Update history UI */
function addHistory(item) {
  history.unshift(item);
  if (history.length > 5) history.pop();

  historyList.innerHTML = "";
  history.forEach(h => {
    const li = document.createElement("li");
    li.textContent = h;
    historyList.appendChild(li);
  });
}

/* Handle button clicks */
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.dataset.value;

    if (val === "=") {
      const result = evaluateExpression(input.value);
      addHistory(`${input.value} = ${result}`);
      input.value = result;
    } else if (val === "C") {
      input.value = "";
    } else {
      input.value += val;
    }
  });
});

/* Theme toggle */
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});
