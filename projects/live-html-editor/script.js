const editor = document.getElementById("htmlEditor");
const frame = document.getElementById("previewFrame");
const deviceFrame = document.querySelector(".device-frame");

editor.value = localStorage.getItem("htmlCode") || `
<!DOCTYPE html>
<html>
<head>
  <title>Sample</title>
</head>
<body>
  <h1>Hello World</h1>
  <p>Edit this HTML and see live preview.</p>
  <button>Click Me</button>
</body>
</html>
`;

updatePreview();

editor.addEventListener("input", () => {
  updatePreview();
  localStorage.setItem("htmlCode", editor.value);
});

function updatePreview() {
  frame.srcdoc = editor.value;
}

function setDevice(device) {
  if (device === "desktop") {
    deviceFrame.style.width = "100%";
    deviceFrame.style.height = "100%";
  } else if (device === "tablet") {
    deviceFrame.style.width = "768px";
    deviceFrame.style.height = "90%";
  } else if (device === "mobile") {
    deviceFrame.style.width = "375px";
    deviceFrame.style.height = "80%";
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    frame.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function downloadHTML() {
  const blob = new Blob([editor.value], { type: "text/html" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "index.html";
  link.click();
}

function resetEditor() {
  localStorage.removeItem("htmlCode");
  location.reload();
}