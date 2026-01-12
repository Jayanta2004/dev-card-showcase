const memeImage = document.getElementById("memeImage");
const memeTitle = document.getElementById("memeTitle");
const generateBtn = document.getElementById("generateBtn");

// Free meme API
const memeAPI = "https://meme-api.com/gimme";

async function generateMeme() {
  try {
    const response = await fetch(memeAPI);
    const data = await response.json();

    memeImage.src = data.url;
    memeTitle.textContent = data.title;
  } catch (error) {
    memeTitle.textContent = "Meme machine broke. Try again.";
  }
}

generateBtn.addEventListener("click", generateMeme);

// Load a meme on first visit
generateMeme();
