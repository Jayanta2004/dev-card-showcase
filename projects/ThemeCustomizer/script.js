const body = document.body;
const toggleBtn = document.getElementById("darkToggle");
const colorPicker = document.getElementById("colorPicker");
const fontSlider = document.getElementById("fontSlider");


// LOAD SAVED SETTINGS
window.onload = () => {
    const dark = localStorage.getItem("darkMode");
    const color = localStorage.getItem("primaryColor");
    const font = localStorage.getItem("fontSize");

    if (dark === "true") body.classList.add("dark");
    if (color) document.documentElement.style.setProperty("--primary", color);
    if (font) document.documentElement.style.setProperty("--fontSize", font + "px");

    colorPicker.value = color || "#4a90e2";
    fontSlider.value = font || 16;
};


// DARK MODE TOGGLE
toggleBtn.onclick = () => {
    body.classList.toggle("dark");
    localStorage.setItem("darkMode", body.classList.contains("dark"));
};


// COLOR CHANGE
colorPicker.oninput = (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty("--primary", color);
    localStorage.setItem("primaryColor", color);
};


// FONT SIZE CHANGE
fontSlider.oninput = (e) => {
    const size = e.target.value;
    document.documentElement.style.setProperty("--fontSize", size + "px");
    localStorage.setItem("fontSize", size);
};