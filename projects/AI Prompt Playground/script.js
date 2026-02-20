// ======= DOM ELEMENTS =======
const promptInput = document.getElementById("promptInput");
const generateBtn = document.getElementById("generateBtn");
const outputContainer = document.getElementById("outputContainer");
const favContainer = document.getElementById("favContainer");
const setApiBtn = document.getElementById("setApiBtn");
const themeBtn = document.getElementById("themeBtn");

// ======= Load API Key =======
let apiKey = localStorage.getItem("geminiKey") || "";

// ======= Button Actions =======
setApiBtn.onclick = () => {
  const key = prompt("Enter your Gemini API Key:");
  if (key) {
    apiKey = key.trim();
    localStorage.setItem("geminiKey", apiKey);
    alert("API Key saved!");
  }
};

themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

// ======= GoogleGenAI Client for Browser =======
class GoogleGenAI {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this.model = "gemini-1.5-flash"; // update if needed
  }

  async generateContent({ contents }) {
    if (!this.apiKey) throw new Error("API key not set");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: contents }] }] }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Gemini API not reachable. Check your API key or enable API in Google Cloud."
      );
    }

    const data = await res.json();
    return {
      text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response",
    };
  }
}

// ======= Mock AI Fallback =======
function mockAI(prompt) {
  const samples = [
    `Story: Once upon a time, ${prompt} changed everything...`,
    `Joke: Why did ${prompt} cross the road? To become legendary!`,
    `Motivation: Even "${prompt}" can shape your future.`,
    `Creative twist on "${prompt}" in a magical world!`,
  ];
  return samples[Math.floor(Math.random() * samples.length)];
}

// ======= Create Output Card =======
function createCard(text, container) {
  const card = document.createElement("div");
  card.className = "card";

  const p = document.createElement("p");
  p.textContent = text;

  const tools = document.createElement("div");
  tools.className = "tools";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "⭐";
  saveBtn.onclick = () => createCard(text, favContainer);

  const copyBtn = document.createElement("button");
  copyBtn.textContent = "📋";
  copyBtn.onclick = () => navigator.clipboard.writeText(text);

  tools.append(saveBtn, copyBtn);
  card.append(p, tools);
  container.prepend(card);
}

// ======= Generate Button Click =======
generateBtn.onclick = async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  let text;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.generateContent({ contents: prompt });
      text = response.text;
    } catch (err) {
      text = mockAI(prompt); // fallback if API fails
      console.error(err);
    }
  } else {
    text = mockAI(prompt);
  }

  createCard(text, outputContainer);
  promptInput.value = "";
};
