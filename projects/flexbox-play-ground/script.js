const flexContainer = document.getElementById("flexContainer");
const resetBtn = document.getElementById("resetBtn");

function updateFlex(property, value) {
  flexContainer.style[property] = value;
}

// Direction buttons
document.querySelectorAll(".dir-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    updateFlex("flexDirection", btn.dataset.value);
    document.querySelectorAll(".dir-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Justify buttons
document.querySelectorAll(".justify-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    updateFlex("justifyContent", btn.dataset.value);
    document.querySelectorAll(".justify-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Align buttons
document.querySelectorAll(".align-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    updateFlex("alignItems", btn.dataset.value);
    document.querySelectorAll(".align-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Wrap buttons
document.querySelectorAll(".wrap-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    updateFlex("flexWrap", btn.dataset.value);
    document.querySelectorAll(".wrap-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Reset
resetBtn.addEventListener("click", () => {
  updateFlex("flexDirection", "row");
  updateFlex("justifyContent", "flex-start");
  updateFlex("alignItems", "stretch");
  updateFlex("flexWrap", "nowrap");

  document.querySelectorAll("button").forEach(b => b.classList.remove("active"));
});