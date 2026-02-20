const wordInput = document.getElementById("wordInput");
const searchBtn = document.getElementById("searchBtn");
const resultBox = document.getElementById("result");
const errorText = document.getElementById("error");

const wordEl = document.getElementById("word");
const phoneticEl = document.getElementById("phonetic");
const meaningEl = document.getElementById("meaning");
const exampleEl = document.getElementById("example");

// Free Dictionary API
const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

async function searchWord(word) {
  try {
    errorText.textContent = "";
    resultBox.classList.add("hidden");

    const response = await fetch(API_URL + word);

    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();
    const entry = data[0];

    wordEl.textContent = entry.word;
    phoneticEl.textContent = entry.phonetic || "";

    const meaning = entry.meanings[0];
    meaningEl.textContent = `Meaning: ${meaning.definitions[0].definition}`;
    exampleEl.textContent = meaning.definitions[0].example
      ? `Example: ${meaning.definitions[0].example}`
      : "";

    resultBox.classList.remove("hidden");
  } catch (error) {
    errorText.textContent = "Word not found. Try another.";
  }
}

searchBtn.addEventListener("click", () => {
  const word = wordInput.value.trim();
  if (word) searchWord(word);
});

wordInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
