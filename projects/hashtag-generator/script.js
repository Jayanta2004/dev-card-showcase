const captionInput = document.getElementById("captionInput");
const charCount = document.getElementById("charCount");
const generateBtn = document.getElementById("generateBtn");
const trendingTags = document.getElementById("trendingTags");
const nicheTags = document.getElementById("nicheTags");
const broadTags = document.getElementById("broadTags");
const strengthBar = document.getElementById("strengthBar");
const copyAll = document.getElementById("copyAll");

captionInput.addEventListener("input", () => {
  charCount.textContent = captionInput.value.length;
});

generateBtn.addEventListener("click", generateHashtags);

function generateHashtags() {
  const text = captionInput.value.toLowerCase();
  const words = text.split(/\s+/).filter(word => word.length > 3);

  trendingTags.innerHTML = "";
  nicheTags.innerHTML = "";
  broadTags.innerHTML = "";

  let allTags = [];

  words.slice(0, 5).forEach(word => {
    const tag = "#" + word.replace(/[^a-z0-9]/g, "");
    allTags.push(tag);
  });

  const trending = allTags.map(tag => tag + "trending");
  const niche = allTags.map(tag => tag + "community");
  const broad = allTags.map(tag => tag);

  displayTags(trending, trendingTags);
  displayTags(niche, nicheTags);
  displayTags(broad, broadTags);

  updateStrength(allTags.length);
}

function displayTags(tags, container) {
  tags.forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    container.appendChild(span);
  });
}

function updateStrength(count) {
  const percentage = Math.min(count * 20, 100);
  strengthBar.style.width = percentage + "%";

  if (percentage < 40) strengthBar.style.background = "#ef4444";
  else if (percentage < 70) strengthBar.style.background = "#f59e0b";
  else strengthBar.style.background = "#22c55e";
}

copyAll.addEventListener("click", () => {
  const tags = [...document.querySelectorAll(".tag")]
    .map(tag => tag.textContent)
    .join(" ");
  navigator.clipboard.writeText(tags);
});