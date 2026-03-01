const editor = document.getElementById("cssEditor");
const frame = document.getElementById("previewFrame");
const errorStatus = document.getElementById("errorStatus");
const autoSaveStatus = document.getElementById("autoSaveStatus");

const baseHTML = `
<!DOCTYPE html>
<html>
<head>
<style id="liveStyles"></style>
</head>
<body>
<h1>Hello World</h1>
<p>Edit the CSS to style this content.</p>
<button>Sample Button</button>
</body>
</html>
`;

frame.srcdoc = baseHTML;

editor.value = localStorage.getItem("cssCode") || `
body {
  text-align: center;
  margin-top: 50px;
}
h1 {
  color: blue;
}
`;

updateCSS();

editor.addEventListener("input", () => {
  updateCSS();
  localStorage.setItem("cssCode", editor.value);
  autoSaveStatus.textContent = "Auto-saved ✔";
});

function updateCSS() {
  try {
    frame.contentDocument.getElementById("liveStyles").innerHTML = editor.value;
    errorStatus.textContent = "No Errors";
    errorStatus.style.color = "lightgreen";
  } catch (e) {
    errorStatus.textContent = "CSS Error";
    errorStatus.style.color = "red";
  }
}

function setDevice(device) {
  if (device === "desktop") {
    frame.style.width = "100%";
    frame.style.height = "100%";
  } else if (device === "tablet") {
    frame.style.width = "768px";
    frame.style.height = "90%";
  } else if (device === "mobile") {
    frame.style.width = "375px";
    frame.style.height = "80%";
  }
}

function toggleTheme() {
  document.body.classList.toggle("light");
  if (document.body.classList.contains("light")) {
    document.body.style.background = "#f4f4f4";
    document.body.style.color = "#000";
  } else {
    document.body.style.background = "#0f0f1a";
    document.body.style.color = "#fff";
  }
}

function downloadCSS() {
  const blob = new Blob([editor.value], { type: "text/css" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "styles.css";
  link.click();
}