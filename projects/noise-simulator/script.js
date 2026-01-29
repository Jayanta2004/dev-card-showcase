function setMode(type) {
  const modes = {
    rain: ["#0ea5e9", "Soft rain falling outside 🌧"],
    library: ["#facc15", "Quiet pages turning 📚"],
    night: ["#020617", "Calm midnight silence 🌌"]
  };

  document.body.style.background = modes[type][0];
  desc.innerText = modes[type][1];
}