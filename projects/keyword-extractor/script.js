const extractBtn = document.getElementById("extractBtn");
const resetBtn = document.getElementById("resetBtn");
const textInput = document.getElementById("textInput");
const keywordsEl = document.getElementById("keywords");

extractBtn.onclick = () => {
  const text = textInput.value.trim();
  if (!text) return alert("Please enter some text!");

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/);

  const freq = {};
  words.forEach(word => {
    if (word.length > 2) freq[word] = (freq[word] || 0) + 1;
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  keywordsEl.innerHTML = "";

  sorted.forEach(([word, count]) => {
    const span = document.createElement("span");
    span.textContent = word;
    span.classList.add("keyword");
    span.style.backgroundColor = `hsl(${Math.random()*360},70%,50%)`;
    keywordsEl.appendChild(span);
  });
};

resetBtn.onclick = () => {
  textInput.value = "";
  keywordsEl.innerHTML = "";
};
