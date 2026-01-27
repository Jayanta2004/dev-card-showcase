function loadHTML(id, file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
        })
        .catch(error => console.log("Error loading file:", file));
}

loadHTML("navbar", "navbar.html", () => {
    document.dispatchEvent(new Event("navbarLoaded"));
});

loadHTML("footer", "footer.html");
