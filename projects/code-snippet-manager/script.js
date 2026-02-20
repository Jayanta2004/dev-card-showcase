const form = document.getElementById("snippetForm");
const snippetsList = document.getElementById("snippetsList");

let snippets = JSON.parse(localStorage.getItem("snippets")) || [];

// Display snippets on load
displaySnippets();

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const code = document.getElementById("code").value;
  const tags = document.getElementById("tags").value.split(",");

  const snippet = {
    id: Date.now(),
    title,
    code,
    tags
  };

  snippets.push(snippet);
  localStorage.setItem("snippets", JSON.stringify(snippets));

  form.reset();
  displaySnippets();
});

function displaySnippets() {
  snippetsList.innerHTML = "";

  snippets.forEach(snippet => {
    const div = document.createElement("div");
    div.classList.add("snippet");

    div.innerHTML = `
      <h3>${snippet.title}</h3>
      <p class="tags">Tags: ${snippet.tags.join(", ")}</p>
      <pre>${snippet.code}</pre>
      <button class="delete-btn" onclick="deleteSnippet(${snippet.id})">Delete</button>
    `;

    snippetsList.appendChild(div);
  });
}

function deleteSnippet(id) {
  snippets = snippets.filter(snippet => snippet.id !== id);
  localStorage.setItem("snippets", JSON.stringify(snippets));
  displaySnippets();
}
