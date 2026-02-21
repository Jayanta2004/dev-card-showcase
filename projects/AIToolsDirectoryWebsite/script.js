const tools = [
  {
    name: "ChatGPT",
    category: "writing",
    description: "AI assistant for writing, coding, and learning.",
    link: "https://chat.openai.com"
  },
  {
    name: "Midjourney",
    category: "image",
    description: "Generate stunning AI images from text prompts.",
    link: "https://www.midjourney.com"
  },
  {
    name: "GitHub Copilot",
    category: "coding",
    description: "AI pair programmer for developers.",
    link: "https://github.com/features/copilot"
  },
  {
    name: "Notion AI",
    category: "productivity",
    description: "AI-powered writing and productivity assistant.",
    link: "https://www.notion.so/product/ai"
  }
];

const container = document.getElementById("toolsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function renderTools(list) {
  container.innerHTML = "";

  list.forEach(tool => {
    const card = document.createElement("div");
    card.className = "tool-card";

    card.innerHTML = `
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <p><strong>Category:</strong> ${tool.category}</p>
      <a href="${tool.link}" target="_blank">Visit Tool →</a>
    `;

    container.appendChild(card);
  });
}

function filterTools() {
  const searchText = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  const filtered = tools.filter(tool => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchText) ||
      tool.description.toLowerCase().includes(searchText);

    const matchesCategory =
      category === "all" || tool.category === category;

    return matchesSearch && matchesCategory;
  });

  renderTools(filtered);
}

searchInput.addEventListener("input", filterTools);
categoryFilter.addEventListener("change", filterTools);

renderTools(tools);