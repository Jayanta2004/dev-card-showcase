const characters = [
  "a brave knight",
  "a curious robot",
  "an adventurous kid",
  "a clever fox",
  "a time traveler",
  "a lost astronaut"
];

const places = [
  "in a mysterious forest",
  "inside a haunted castle",
  "on a distant planet",
  "under the ocean",
  "in a magical school",
  "inside a secret laboratory"
];

const actions = [
  "found a hidden treasure",
  "opened a forbidden door",
  "met a strange creature",
  "solved an ancient puzzle",
  "saved the world",
  "discovered a secret map"
];

const charEl = document.getElementById("character");
const placeEl = document.getElementById("place");
const actionEl = document.getElementById("action");
const storyOutput = document.getElementById("storyOutput");

function randomItem(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function animate(el){
  el.classList.remove("spin");
  void el.offsetWidth;
  el.classList.add("spin");
}

function spinStory(){
  const character = randomItem(characters);
  const place = randomItem(places);
  const action = randomItem(actions);

  charEl.textContent = character;
  placeEl.textContent = place;
  actionEl.textContent = action;

  animate(charEl);
  animate(placeEl);
  animate(actionEl);

  storyOutput.textContent =
    `Once upon a time, ${character} ${place} and ${action}.`;
}

document.getElementById("spinBtn").onclick = spinStory;