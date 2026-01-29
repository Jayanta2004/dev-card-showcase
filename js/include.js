function loadHTML(id, file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            initThemeToggle(); // Initialize theme toggle after loading navbar
            if (callback) callback();
        })
        .catch(error => console.log("Error loading file:", file));
    function initThemeToggle() {
        const themeToggleBtn = document.getElementById("themeToggle");
        if (!themeToggleBtn) return;
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "light") {
            document.body.classList.add("light-mode");
            themeToggleBtn.textContent = "🌞";
        }
        else {
            themeToggleBtn.textContent = "🌜";
        }
        themeToggleBtn.addEventListener("click", () => {
            const isLightMode = document.body.classList.toggle("light-mode");
            localStorage.setItem("theme", isLightMode ? "light" : "dark");
            themeToggleBtn.textContent = isLightMode ? "☀️" : "🌙";
        });
    }
}

loadHTML("navbar", "navbar.html", () => {
    document.dispatchEvent(new Event("navbarLoaded"));
});

loadHTML("footer", "footer.html");
