function loadHTML(id, file, callback) {
    fetch(file)
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;

            if (id === "navbar") {
                initNavbar();
                initThemeToggle();
            }

            if (callback) callback();
        })
        .catch(err => console.error("Error loading file:", file, err));
}

function initNavbar() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", () => {
        navLinks.classList.toggle("active");
    });
}

function initThemeToggle() {
    const themeToggleBtn = document.getElementById("themeToggle");
    if (!themeToggleBtn) return;

    const body = document.body;

    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
        themeToggleBtn.textContent = "☀️";
    }

    themeToggleBtn.addEventListener("click", () => {
        const isLight = body.classList.toggle("light-mode");
        localStorage.setItem("theme", isLight ? "light" : "dark");
        themeToggleBtn.textContent = isLight ? "☀️" : "🌙";
    });
}

loadHTML("navbar", "navbar.html");
loadHTML("footer", "footer.html");
