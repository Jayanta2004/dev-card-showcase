// Collaborative canvas logic
let drawing = false;
let brushColor = "#000000";
let brushSize = 5;
let gallery = [];
let feedbacks = [];

const canvas = document.getElementById("artCanvas");
const ctx = canvas.getContext("2d");
const brushColorInput = document.getElementById("brushColor");
const brushSizeInput = document.getElementById("brushSize");
const clearCanvasBtn = document.getElementById("clearCanvas");
const saveArtBtn = document.getElementById("saveArt");
const canvasSection = document.getElementById("canvasSection");
const feedbackSection = document.getElementById("feedbackSection");
const gallerySection = document.getElementById("gallerySection");
const canvasBtn = document.getElementById("canvasBtn");
const feedbackBtn = document.getElementById("feedbackBtn");
const galleryBtn = document.getElementById("galleryBtn");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackInput = document.getElementById("feedbackInput");
const feedbackList = document.getElementById("feedbackList");
const galleryList = document.getElementById("galleryList");

function showSection(section) {
  canvasSection.style.display = section === "canvas" ? "block" : "none";
  feedbackSection.style.display = section === "feedback" ? "block" : "none";
  gallerySection.style.display = section === "gallery" ? "block" : "none";
}

canvasBtn.addEventListener("click", () => showSection("canvas"));
feedbackBtn.addEventListener("click", () => {
  showSection("feedback");
  renderFeedbacks();
});
galleryBtn.addEventListener("click", () => {
  showSection("gallery");
  renderGallery();
});

// Canvas drawing events
canvas.addEventListener("mousedown", e => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener("mousemove", e => {
  if (!drawing) return;
  ctx.strokeStyle = brushColor;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
});
canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.beginPath();
});
canvas.addEventListener("mouseleave", () => {
  drawing = false;
  ctx.beginPath();
});

brushColorInput.addEventListener("input", e => {
  brushColor = e.target.value;
});
brushSizeInput.addEventListener("input", e => {
  brushSize = parseInt(e.target.value);
});
clearCanvasBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});
saveArtBtn.addEventListener("click", () => {
  const artData = canvas.toDataURL();
  gallery.push({ img: artData, date: new Date().toLocaleString() });
  renderGallery();
  alert("Artwork saved to gallery!");
});

// Feedback logic
feedbackForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = feedbackInput.value.trim();
  if (!text) return;
  feedbacks.push({ text, date: new Date().toLocaleString() });
  renderFeedbacks();
  feedbackForm.reset();
});

function renderFeedbacks() {
  feedbackList.innerHTML = "";
  feedbacks.slice().reverse().forEach(fb => {
    const card = document.createElement("div");
    card.className = "feedback-card";
    card.innerHTML = `
      <div>${fb.text}</div>
      <div style="font-size:0.9rem;color:#4a4e69;">${fb.date}</div>
    `;
    feedbackList.appendChild(card);
  });
}

function renderGallery() {
  galleryList.innerHTML = "";
  gallery.slice().reverse().forEach(art => {
    const card = document.createElement("div");
    card.className = "gallery-art";
    card.innerHTML = `
      <img src="${art.img}" alt="Artwork">
      <div style="font-size:0.9rem;color:#4a4e69;">${art.date}</div>
    `;
    galleryList.appendChild(card);
  });
}

// Initial render
showSection("canvas");
