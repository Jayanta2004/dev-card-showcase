const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const cleanBtn = document.getElementById("cleanBtn");
const totalLinesEl = document.getElementById("totalLines");
const uniqueLinesEl = document.getElementById("uniqueLines");
const removedLinesEl = document.getElementById("removedLines");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

cleanBtn.addEventListener("click", () => {
  const caseSensitive = document.getElementById("caseSensitive").checked;
  const ignoreSpaces = document.getElementById("ignoreSpaces").checked;

  let lines = inputText.value.split("\n");
  totalLinesEl.textContent = lines.length;

  const seen = new Set();
  const result = [];

  lines.forEach(line => {
    let processed = line;

    if (ignoreSpaces) {
      processed = processed.trim().replace(/\s+/g, " ");
    }

    if (!caseSensitive) {
      processed = processed.toLowerCase();
    }

    if (!seen.has(processed)) {
      seen.add(processed);
      result.push(line);
    }
  });

  outputText.value = result.join("\n");

  uniqueLinesEl.textContent = result.length;
  removedLinesEl.textContent = lines.length - result.length;
});

copyBtn.addEventListener("click", () => {
  outputText.select();
  document.execCommand("copy");
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([outputText.value], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cleaned-lines.txt";
  link.click();
});