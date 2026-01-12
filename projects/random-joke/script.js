const jokeText = document.getElementById("joke");
const jokeBtn = document.getElementById("jokeBtn");

// Free public joke API
const jokeAPI = "https://official-joke-api.appspot.com/random_joke";

async function getJoke() {
  try {
    jokeText.textContent = "Thinking of something funny…";

    const response = await fetch(jokeAPI);
    const data = await response.json();

    jokeText.textContent = `${data.setup} — ${data.punchline}`;
  } catch (error) {
    jokeText.textContent = "I failed. Imagine something funny instead.";
  }
}

jokeBtn.addEventListener("click", getJoke);

// Load one joke on page load
getJoke();
