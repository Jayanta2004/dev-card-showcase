const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");
const codeEditor = document.getElementById("codeEditor");
const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");

runBtn.addEventListener("click", () => {
  try {
    const userCode = codeEditor.value;

    // create function dynamically
    const runner = new Function(
      userCode + "; return solve;"
    );

    const solve = runner();
    const result = solve(inputBox.value);

    outputBox.value = result;
  } catch (err) {
    outputBox.value = "Error: " + err.message;
  }
});

resetBtn.addEventListener("click", () => {
  location.reload();
});