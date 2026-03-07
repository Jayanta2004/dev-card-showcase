const fields = ["name","title","summary","experience","education","skills"];
const resume = document.getElementById("resume");
const accentColor = document.getElementById("accentColor");
const photoUpload = document.getElementById("photoUpload");

fields.forEach(field => {
  const input = document.getElementById(field);
  const preview = document.getElementById("preview" + field.charAt(0).toUpperCase() + field.slice(1));

  input.addEventListener("input", () => {
    preview.textContent = input.value;
    saveData();
  });
});

accentColor.addEventListener("input", () => {
  resume.style.setProperty("--accent", accentColor.value);
  saveData();
});

photoUpload.addEventListener("change", e => {
  const reader = new FileReader();
  reader.onload = () => {
    const img = document.getElementById("profilePhoto");
    img.src = reader.result;
    img.style.display = "block";
    saveData();
  };
  reader.readAsDataURL(e.target.files[0]);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  window.print();
});

function saveData() {
  const data = {};
  fields.forEach(f => data[f] = document.getElementById(f).value);
  data.color = accentColor.value;
  localStorage.setItem("resumeData", JSON.stringify(data));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("resumeData"));
  if (!data) return;
  fields.forEach(f => {
    document.getElementById(f).value = data[f] || "";
    document.getElementById("preview" + f.charAt(0).toUpperCase() + f.slice(1)).textContent = data[f] || "";
  });
  if (data.color) {
    accentColor.value = data.color;
    resume.style.setProperty("--accent", data.color);
  }
}

loadData();