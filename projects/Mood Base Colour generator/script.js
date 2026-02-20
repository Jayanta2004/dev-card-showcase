const moods = {
  happy: {
    bg: "linear-gradient(135deg, #facc15, #fb7185)",
    colors: ["#FDE047", "#FDBA74", "#FB7185", "#F472B6", "#F59E0B"]
  },
  calm: {
    bg: "linear-gradient(135deg, #22d3ee, #38bdf8)",
    colors: ["#67E8F9", "#38BDF8", "#22D3EE", "#0EA5E9", "#7DD3FC"]
  },
  energetic: {
    bg: "linear-gradient(135deg, #f97316, #f43f5e)",
    colors: ["#F97316", "#FB7185", "#EF4444", "#FACC15", "#F43F5E"]
  },
  sad: {
    bg: "linear-gradient(135deg, #1e293b, #475569)",
    colors: ["#CBD5E1", "#94A3B8", "#64748B", "#475569", "#1E293B"]
  },
  creative: {
    bg: "linear-gradient(135deg, #a78bfa, #22c55e)",
    colors: ["#A78BFA", "#F472B6", "#22C55E", "#38BDF8", "#FACC15"]
  }
};

const colorContainer = document.getElementById("colors");

document.querySelectorAll(".moods button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".moods button")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    const mood = moods[btn.dataset.mood];
    document.body.style.background = mood.bg;
    colorContainer.innerHTML = "";

    mood.colors.forEach(c => {
      const div = document.createElement("div");
      div.className = "color-box";
      div.style.background = c;

      const span = document.createElement("span");
      span.textContent = c;

      div.appendChild(span);
      div.onclick = () => {
        navigator.clipboard.writeText(c);
        span.textContent = "Copied!";
        setTimeout(() => (span.textContent = c), 800);
      };

      colorContainer.appendChild(div);
    });
  });
});
