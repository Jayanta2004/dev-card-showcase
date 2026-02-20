const accentBtn = document.getElementById("accentBtn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

const colors = ["#ff3b3b", "#00ffcc", "#ffcc00", "#6c5ce7", "#00b894"];
let index = 0;

accentBtn.addEventListener("click", () => {
  index = (index + 1) % colors.length;
  document.documentElement.style.setProperty("--accent", colors[index]);
  modal.style.display = "block";
});

closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});
