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
        const btn = document.getElementById("themeToggle");
        if (!btn) return;

        const savedTheme = localStorage.getItem("theme") || "dark";
        document.body.setAttribute("data-theme", savedTheme);

        btn.textContent = savedTheme === "light" ? "🌞" : "🌙";

        btn.addEventListener("click", () => {
            const current = document.body.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";

            document.body.setAttribute("data-theme", next);
            localStorage.setItem("theme", next);
            btn.textContent = next === "light" ? "🌞" : "🌙";
        });
        }

}

loadHTML("navbar", "navbar.html", () => {
    document.dispatchEvent(new Event("navbarLoaded"));
});

loadHTML("footer", "footer.html");
