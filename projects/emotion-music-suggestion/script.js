const suggestions = {
  happy: "Try upbeat pop or dance music 🎉",
  calm: "Lo-fi or instrumental works best 🌊",
  sad: "Soft acoustic or piano 🎹",
  focused: "Ambient or white noise 🎧"
};

function suggest(emotion) {
  document.getElementById("result").innerText =
    suggestions[emotion] || "";
}