// audio-react.js
// Subtle audio reactivity for GradientFlow

const AudioReact = (() => {
  let enabled = false;
  let audioCtx, analyser, dataArray;
  let lastLevel = 0;

  function setup() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
    });
  }

  function getLevel() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
    return sum / dataArray.length / 255;
  }

  function toggle() {
    enabled = !enabled;
    if (enabled) setup();
  }

  function isEnabled() {
    return enabled;
  }

  function update() {
    if (!enabled) return 0;
    lastLevel = getLevel();
    return lastLevel;
  }

  return {
    toggle,
    isEnabled,
    update
  };
})();
