function generateMood() {
  const moods = [
    { text: "Happy", emoji: "😄", color: "#FFE066" },
    { text: "Calm", emoji: "😌", color: "#A0E7E5" },
    { text: "Focused", emoji: "🎯", color: "#B4F8C8" },
    { text: "Energetic", emoji: "⚡", color: "#FFAEBC" },
    { text: "Creative", emoji: "🎨", color: "#D5AAFF" }
  ];

  const randomMood = moods[Math.floor(Math.random() * moods.length)];

  document.getElementById("moodEmoji").textContent = randomMood.emoji;
  document.getElementById("moodText").textContent = randomMood.text;
  document.getElementById("moodDisplay").style.backgroundColor =
    randomMood.color;
}