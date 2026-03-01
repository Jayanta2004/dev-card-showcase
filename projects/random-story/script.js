const generateBtn = document.getElementById("generateBtn");
const storyEl = document.getElementById("story");
const randomMode = document.getElementById("randomMode");
const customMode = document.getElementById("customMode");
const saveBtn = document.getElementById("saveBtn");

let isRandom = true;

randomMode.onclick = () => {
  isRandom = true;
  randomMode.classList.add("active");
  customMode.classList.remove("active");
};

customMode.onclick = () => {
  isRandom = false;
  customMode.classList.add("active");
  randomMode.classList.remove("active");
};

const randomStories = [
  "Once upon a time, a dragon opened a pizza shop in space.",
  "A robot fell in love with a banana in New York.",
  "A cat became president and banned Mondays forever.",
  "A time traveler accidentally invented chocolate rain."
];

function typeWriter(text) {
  storyEl.innerHTML = "";
  let i = 0;
  let interval = setInterval(() => {
    storyEl.innerHTML += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 30);
}

generateBtn.onclick = () => {
  let story = "";

  if (isRandom) {
    story = randomStories[Math.floor(Math.random() * randomStories.length)];
  } else {
    const name = document.getElementById("name").value || "Someone";
    const place = document.getElementById("place").value || "somewhere";
    const object = document.getElementById("object").value || "a mysterious object";
    const adjective = document.getElementById("adjective").value || "strange";

    story = `${name} went to ${place} carrying ${object}. Suddenly, something ${adjective} happened that changed everything forever!`;
  }

  typeWriter(story);
};

saveBtn.onclick = () => {
  const blob = new Blob([storyEl.innerText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "story.txt";
  link.click();
};