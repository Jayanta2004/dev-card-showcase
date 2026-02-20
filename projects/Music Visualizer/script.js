const audio = document.getElementById("audio");
const fileInput = document.getElementById("audioFile");
const playBtn = document.getElementById("playBtn");
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 420;

let audioContext, analyser, source;
let isPlaying = false;

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    audio.src = URL.createObjectURL(file);
  }
});

playBtn.addEventListener("click", () => {
  if (!audioContext) setupAudio();

  if (isPlaying) {
    audio.pause();
    playBtn.textContent = "▶ Play";
  } else {
    audio.play();
    playBtn.textContent = "⏸ Pause";
    animate();
  }
  isPlaying = !isPlaying;
});

function setupAudio() {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
}

function animate() {
  requestAnimationFrame(animate);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 1.6;
  let x = 0;

  dataArray.forEach((value, i) => {
    const barHeight = value * 1.4;

    const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
    gradient.addColorStop(0, "#00f5ff");
    gradient.addColorStop(0.5, "#ff00ff");
    gradient.addColorStop(1, "#ffffff");

    ctx.fillStyle = gradient;
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#ff00ff";

    ctx.fillRect(
      x,
      canvas.height - barHeight,
      barWidth,
      barHeight
    );

    x += barWidth + 3;
  });
}

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
});
