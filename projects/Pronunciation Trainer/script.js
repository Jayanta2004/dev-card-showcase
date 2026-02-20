const targetWordEl = document.getElementById("targetWord");
const startBtn = document.getElementById("startBtn");
const newWordBtn = document.getElementById("newWordBtn");
const playWordBtn = document.getElementById("playWordBtn");
const resultEl = document.getElementById("result");

const words = [
  "ability","absence","academy","account","achievement","activity","addition","adventure","advice","affection",
  "agreement","airplane","analysis","animal","application","appointment","argument","arrival","artificial","aspect",
  "assignment","association","attempt","attention","attitude","audience","authority","balance","behavior","birthday",
  "boundary","brother","business","calendar","campaign","candidate","capacity","category","celebration","challenge",
  "character","chemistry","choice","citizen","clarity","climate","collection","college","comfort","committee",
  "community","comparison","competition","complaint","complexity","concept","conclusion","confidence","connection","consequence",
  "construction","consumer","content","context","contract","contribution","conversation","cooking","corporation","creation",
  "creative","critical","culture","customer","decision","definition","delivery","department","departure","description",
  "development","difference","difficulty","direction","discussion","distribution","education","effort","election","emotion",
  "employee","encouragement","energy","environment","equipment","establishment","evaluation","example","exception","experience",
  "expression","extension","family","feature","feedback","festival","finance","foundation","friendship","function"
];

function randomWord() {
  const w = words[Math.floor(Math.random() * words.length)];
  targetWordEl.textContent = w;
  resultEl.textContent = "";
}

// Speak the word
function speakWord() {
  const word = targetWordEl.textContent;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.8; // slower for learners
  speechSynthesis.speak(utterance);
}

// Listen to user
function startRecognition() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    const spoken = e.results[0][0].transcript.toLowerCase();
    const target = targetWordEl.textContent.toLowerCase();

    if (spoken === target) {
      resultEl.textContent = `✅ Perfect! You said "${spoken}" correctly.`;
      resultEl.style.color = "#7CFF7C";
    } else {
      resultEl.textContent = `❌ You said "${spoken}". Try again.`;
      resultEl.style.color = "#FF9B9B";
    }
  };

  recognition.start();
}

playWordBtn.addEventListener("click", speakWord);
startBtn.addEventListener("click", startRecognition);
newWordBtn.addEventListener("click", randomWord);

randomWord();
