const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const lintBtn = document.getElementById("lintBtn");
const fixBtn = document.getElementById("fixBtn");
const errorsDiv = document.getElementById("errors");
const issueCount = document.getElementById("issueCount");

editor.addEventListener("input", () => {
  renderMarkdown();
  lintMarkdown();
});

lintBtn.addEventListener("click", lintMarkdown);
fixBtn.addEventListener("click", autoFix);

function renderMarkdown() {
  let text = editor.value;
  text = text
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
    .replace(/\*(.*?)\*/gim, "<i>$1</i>")
    .replace(/\n$/gim, "<br />");

  preview.innerHTML = text;
}

function lintMarkdown() {
  const lines = editor.value.split("\n");
  errorsDiv.innerHTML = "";
  let count = 0;

  lines.forEach((line, index) => {

    // Rule 1: Space after #
    if (document.getElementById("ruleHeadingSpace").checked) {
      if (/^#+[^ ]/.test(line)) {
        addError(index, "Missing space after #");
        count++;
      }
    }

    // Rule 2: Trailing spaces
    if (document.getElementById("ruleTrailingSpace").checked) {
      if (/\s+$/.test(line)) {
        addError(index, "Trailing spaces not allowed");
        count++;
      }
    }

    // Rule 3: List space
    if (document.getElementById("ruleListSpace").checked) {
      if (/^[-*][^ ]/.test(line)) {
        addError(index, "Missing space after list marker");
        count++;
      }
    }

  });

  issueCount.textContent = `${count} Issues`;
}

function addError(line, message) {
  const div = document.createElement("div");
  div.textContent = `Line ${line + 1}: ${message}`;
  errorsDiv.appendChild(div);
}

function autoFix() {
  let lines = editor.value.split("\n");

  lines = lines.map(line => {
    line = line.replace(/^(#+)([^ ])/g, "$1 $2");
    line = line.replace(/^([-*])([^ ])/g, "$1 $2");
    return line.trimEnd();
  });

  editor.value = lines.join("\n");
  renderMarkdown();
  lintMarkdown();
}