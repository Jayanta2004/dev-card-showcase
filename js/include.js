function loadHTML(id, file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.log("Error loading file:", file));
}

// Determine base path for navbar and footer
const currentPath = window.location.pathname;
const isInProjects = currentPath.includes('/projects/');
const basePath = isInProjects ? '../' : '';

// Load theme persistence script
function loadThemeScript() {
    const script = document.createElement('script');
    script.src = basePath + 'theme-persistence/theme.js';
    script.onload = () => console.log('Theme persistence loaded');
    document.head.appendChild(script);
}

// Load theme script immediately
loadThemeScript();

// Load navbar and footer
loadHTML("navbar", basePath + "navbar.html", () => {
    document.dispatchEvent(new Event("navbarLoaded"));
});

loadHTML("footer", basePath + "footer.html");
