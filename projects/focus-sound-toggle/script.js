const button = document.getElementById("toggleBtn");
const audio = document.getElementById("audio");
const statusText = document.getElementById("status");

audio.volume = 1.0; // 🔊 max volume
let isPlaying = false;

button.addEventListener("click", async () => {
  try {
    if (!isPlaying) {
      await audio.play(); // MUST be inside click
      isPlaying = true;
      button.innerText = "Pause Sound";
      statusText.innerText = "Sound is ON";
      console.log("Audio playing");
    } else {
      audio.pause();
      isPlaying = false;
      button.innerText = "Play Sound";
      statusText.innerText = "Sound is OFF";
      console.log("Audio paused");
    }
  } catch (err) {
    console.error("Playback error:", err);
    alert("Sound blocked. Try desktop Chrome.");
  }
});