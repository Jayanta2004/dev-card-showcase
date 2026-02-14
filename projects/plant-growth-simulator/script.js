const stages = ["🌱", "🌿", "🌸"];
let index = 0;

function water() {
  if (index < stages.length - 1) {
    index++;
    document.getElementById("stage").innerText = stages[index];
    document.getElementById("text").innerText = "Growing nicely 🌼";
  } else {
    document.getElementById("text").innerText = "Your plant is fully grown 🌸";
  }
}