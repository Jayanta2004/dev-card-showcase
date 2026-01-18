const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

let mode = "piano";
const activeNotes = new Map();

const freqMap = {
  C: 261.63, "C#": 277.18,
  D: 293.66, "D#": 311.13,
  E: 329.63,
  F: 349.23, "F#": 369.99,
  G: 392.0, "G#": 415.3,
  A: 440.0, "A#": 466.16,
  B: 493.88
};

function createVoice(freq) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;

  let attack = 0.02, decay = 0.2, sustain = 0.4, release = 0.6;
  let type = "sine";

  switch (mode) {
    case "piano":  type="sine";     attack=.01; decay=.25; sustain=.3;  release=.6; break;
    case "drum":   type="triangle"; attack=.001;decay=.08; sustain=.01; release=.1; break;
    case "synth":  type="sawtooth"; attack=.05; decay=.2;  sustain=.6;  release=.8; break;
    case "guitar": type="triangle"; attack=.01; decay=.3;  sustain=.35; release=.9; break;
    case "flute":  type="sine";     attack=.15; decay=.2;  sustain=.7;  release=1.2;break;
  }

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(1, now + attack);
  gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);

  osc.connect(gain).connect(audioCtx.destination);
  osc.start();

  return { osc, gain, release };
}

function noteOn(note) {
  if (activeNotes.has(note)) return;
  const voice = createVoice(freqMap[note]);
  activeNotes.set(note, voice);
}

function noteOff(note) {
  const v = activeNotes.get(note);
  if (!v) return;
  const now = audioCtx.currentTime;
  v.gain.gain.cancelScheduledValues(now);
  v.gain.gain.setValueAtTime(v.gain.gain.value, now);
  v.gain.gain.linearRampToValueAtTime(0.001, now + v.release);
  v.osc.stop(now + v.release + 0.05);
  activeNotes.delete(note);
}

const keys = document.querySelectorAll(".key");

keys.forEach(k => {
  const note = k.dataset.note;

  k.addEventListener("mousedown", () => {
    noteOn(note);
    k.classList.add("active");
  });

  k.addEventListener("mouseup", () => {
    noteOff(note);
    k.classList.remove("active");
  });

  k.addEventListener("mouseleave", () => {
    noteOff(note);
    k.classList.remove("active");
  });
});

document.addEventListener("keydown", e => {
  const k = [...keys].find(x => x.dataset.key === e.key.toLowerCase());
  if (k) {
    noteOn(k.dataset.note);
    k.classList.add("active");
  }
});

document.addEventListener("keyup", e => {
  const k = [...keys].find(x => x.dataset.key === e.key.toLowerCase());
  if (k) {
    noteOff(k.dataset.note);
    k.classList.remove("active");
  }
});

document.querySelectorAll(".modes button").forEach(btn => {
  btn.onclick = () => {
    document.querySelector(".modes .active").classList.remove("active");
    btn.classList.add("active");
    mode = btn.dataset.mode;
  };
});
