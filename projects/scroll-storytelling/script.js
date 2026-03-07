const panels = document.querySelectorAll(".glass");
const heroContent = document.querySelector(".hero-content");
const progressBar = document.querySelector(".progress-bar");
const zoomImg = document.querySelector(".zoom-img");

function revealPanels() {
  const trigger = window.innerHeight * 0.85;

  panels.forEach(panel => {
    const top = panel.getBoundingClientRect().top;
    if (top < trigger) {
      panel.classList.add("visible");
    }
  });
}

function heroTransform() {
  const scrollY = window.scrollY;
  const scale = 1 - scrollY * 0.0003;
  const opacity = 1 - scrollY * 0.001;

  heroContent.style.transform =
    `scale(${scale}) translateY(${scrollY * 0.3}px)`;
  heroContent.style.opacity = opacity;
}

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  progressBar.style.width = progress + "%";
}

function imageZoom() {
  if (!zoomImg) return;

  const rect = zoomImg.getBoundingClientRect();
  const trigger = window.innerHeight * 0.9;

  if (rect.top < trigger) {
    zoomImg.style.transform = "scale(1)";
  }
}

function backgroundShift() {
  const scrollY = window.scrollY;
  const hue = 220 + scrollY * 0.03;
  document.body.style.background = `hsl(${hue}, 60%, 97%)`;
}

window.addEventListener("scroll", () => {
  revealPanels();
  heroTransform();
  updateProgress();
  imageZoom();
  backgroundShift();
});

revealPanels();
updateProgress();