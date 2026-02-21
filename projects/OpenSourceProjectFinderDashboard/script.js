const projects = [
  {
    name: "Awesome JavaScript",
    language: "javascript",
    description: "Collection of awesome JS resources",
    url: "https://github.com/sorrycc/awesome-javascript"
  },
  {
    name: "Python Algorithms",
    language: "python",
    description: "Algorithms implemented in Python",
    url: "https://github.com/TheAlgorithms/Python"
  },
  {
    name: "Java Design Patterns",
    language: "java",
    description: "Design patterns in Java",
    url: "https://github.com/iluwatar/java-design-patterns"
  }
];

const container = document.getElementById("projectContainer");
const searchInput = document.getElementById("search");
const filter = document.getElementById("languageFilter");

function renderProjects(list) {
  container.innerHTML = "";

  list.forEach(project => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      <p><strong>${project.language}</strong></p>
      <a href="${project.url}" target="_blank">View Repo</a>
    `;

    container.appendChild(card);
  });
}

function filterProjects() {
  const searchText = searchInput.value.toLowerCase();
  const language = filter.value;

  const filtered = projects.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchText) ||
      p.description.toLowerCase().includes(searchText);

    const matchLanguage =
      language === "all" || p.language === language;

    return matchSearch && matchLanguage;
  });

  renderProjects(filtered);
}

searchInput.addEventListener("input", filterProjects);
filter.addEventListener("change", filterProjects);

renderProjects(projects);