const dogNames = [
  "Buddy", "Max", "Rocky", "Charlie", "Bruno", "Leo", "Milo", "Daisy", "Bella", "Coco"
];

const catNames = [
  "Luna", "Oliver", "Simba", "Chloe", "Nala", "Shadow", "Misty", "Kitty", "Tiger", "Snow"
];

const resultBox = document.getElementById("resultBox");
const petType = document.getElementById("petType");

function generateName() {
  let namesArray = [];

  if (petType.value === "dog") {
    namesArray = dogNames;
  } else if (petType.value === "cat") {
    namesArray = catNames;
  } else {
    namesArray = dogNames.concat(catNames);
  }

  const randomName = namesArray[Math.floor(Math.random() * namesArray.length)];

  resultBox.textContent = "🐾 Your pet name: " + randomName;
  animateResult();
}

function animateResult() {
  resultBox.style.animation = "none";
  resultBox.offsetHeight;
  resultBox.style.animation = "slideUp 0.5s ease";
}
