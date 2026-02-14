const battery = document.getElementById("battery");
const status = document.getElementById("status");

battery.addEventListener("input", () => {
  if (battery.value > 70) status.textContent = "Let's socialize 😄";
  else if (battery.value > 30) status.textContent = "Only close people 🫠";
  else status.textContent = "Do not talk to me 🚫";
});