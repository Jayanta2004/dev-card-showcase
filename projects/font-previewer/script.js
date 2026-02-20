const textArea = document.getElementById("previewText");
const sizeSlider = document.getElementById("size");
const spacingSlider = document.getElementById("spacing");
const fontCards = document.querySelectorAll(".font-card");
const themeToggle = document.getElementById("themeToggle");

/* Live font size control */
sizeSlider.addEventListener("input", () => {
  textArea.style.fontSize = sizeSlider.value + "px";
});

/* Live letter spacing control */
spacingSlider.addEventListener("input", () => {
  textArea.style.letterSpacing = spacingSlider.value + "px";
});

/* Apply font on card click */
fontCards.forEach(card => {
  card.addEventListener("click", () => {
    fontCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    const font = card.dataset.font;
    textArea.style.fontFamily = font;
  });
});

fontCards.forEach(card => {
  card.style.fontFamily = card.dataset.font;
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
});
