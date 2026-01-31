function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const body = document.body;
  const savedTheme = localStorage.getItem("theme") || "dark";

  body.setAttribute("data-theme", savedTheme);
  btn.textContent = savedTheme === "light" ? "🌞" : "🌙";

  btn.onclick = () => {
    const current = body.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    body.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    btn.textContent = next === "light" ? "🌞" : "🌙";
  };
}

function loadHTML(id, file, callback) {
  fetch(file)
    .then(res => res.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;

      if (id === "navbar") {
        lucide.createIcons();
        initThemeToggle(); // ✅ ONLY place this is called
      }

      if (callback) callback();
    })
    .catch(err => console.error("Error loading", file, err));
}

loadHTML("navbar", "navbar.html");
loadHTML("footer", "footer.html");
