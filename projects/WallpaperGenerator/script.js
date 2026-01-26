const wallpaper = document.getElementById("wallpaper");
const generateBtn = document.getElementById("generate");
const downloadBtn = document.getElementById("download");
const colorCode = document.getElementById("colorCode");

function randomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

function generateWallpaper() {
  const c1 = randomColor();
  const c2 = randomColor();
  const angle = Math.floor(Math.random() * 360);

  const gradient = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
  wallpaper.style.background = gradient;
  colorCode.textContent = gradient;
}

generateBtn.addEventListener("click", generateWallpaper);

downloadBtn.addEventListener("click", () => {
  html2canvas(wallpaper).then(canvas => {
    const link = document.createElement("a");
    link.download = "wallpaper.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});
