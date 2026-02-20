const stars = document.querySelectorAll(".stars span");
const ratings = document.querySelectorAll(".rating");
const submit = document.getElementById("submit");
const toast = document.getElementById("toast");
const countEl = document.getElementById("count");
const themeToggle = document.getElementById("themeToggle");

let starValue = 0;
let emotion = "";
let count = localStorage.getItem("count") || 0;
countEl.innerText = count;

// ⭐ STAR LOGIC
stars.forEach(star => {
  star.addEventListener("click", () => {
    starValue = star.dataset.value;
    stars.forEach(s => s.classList.remove("active"));
    for (let i = 0; i < starValue; i++) stars[i].classList.add("active");
  });
});

// 😊 EMOTION LOGIC
ratings.forEach(rating => {
  rating.addEventListener("click", () => {
    ratings.forEach(r => r.classList.remove("active"));
    rating.classList.add("active");
    emotion = rating.dataset.value;
  });
});

// 🚀 SUBMIT
submit.addEventListener("click", () => {
  if (!starValue || !emotion) {
    showToast("Please select rating!");
    return;
  }

  count++;
  localStorage.setItem("count", count);
  countEl.innerText = count;

  // 📤 BACKEND READY
  fetch("https://example.com/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stars: starValue,
      emotion: emotion
    })
  }).catch(() => {});

  showToast("Feedback submitted successfully!");
});

// 🔔 TOAST
function showToast(msg) {
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// 🌙 DARK MODE
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.innerText =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
});
