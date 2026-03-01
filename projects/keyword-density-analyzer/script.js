const textInput = document.getElementById("textInput");
const totalWordsEl = document.getElementById("totalWords");
const uniqueWordsEl = document.getElementById("uniqueWords");
const readingTimeEl = document.getElementById("readingTime");
const keywordList = document.getElementById("keywordList");
const customKeywordInput = document.getElementById("customKeyword");
const filterStopwordsCheckbox = document.getElementById("filterStopwords");

const stopwords = ["the", "is", "in", "at", "of", "and", "a", "to", "for", "on", "with"];

textInput.addEventListener("input", analyzeText);
customKeywordInput.addEventListener("input", analyzeText);
filterStopwordsCheckbox.addEventListener("change", analyzeText);

function analyzeText() {
  let text = textInput.value.toLowerCase();
  let words = text.match(/\b\w+\b/g) || [];

  if (filterStopwordsCheckbox.checked) {
    words = words.filter(word => !stopwords.includes(word));
  }

  const totalWords = words.length;
  const wordCounts = {};

  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  const sortedWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  totalWordsEl.textContent = totalWords;
  uniqueWordsEl.textContent = Object.keys(wordCounts).length;
  readingTimeEl.textContent = Math.ceil(totalWords / 200) + " min";

  renderKeywords(sortedWords, totalWords);
}

function renderKeywords(sortedWords, totalWords) {
  keywordList.innerHTML = "";

  sortedWords.forEach(([word, count]) => {
    const density = ((count / totalWords) * 100).toFixed(2);

    const div = document.createElement("div");
    div.classList.add("keyword-item");

    div.innerHTML = `
      <strong>${word}</strong> (${density}%)
      <div class="progress">
        <div class="progress-bar" style="width:${density}%"></div>
      </div>
    `;

    keywordList.appendChild(div);
  });

  highlightCustomKeyword();
}

function highlightCustomKeyword() {
  const keyword = customKeywordInput.value.toLowerCase();
  if (!keyword) return;

  const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
  textInput.value = textInput.value.replace(regex, match => match.toUpperCase());
}

function copyReport() {
  navigator.clipboard.writeText(keywordList.innerText);
  alert("Report copied!");
}

analyzeText();