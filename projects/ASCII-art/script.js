const imageInput = document.getElementById("imageInput");
const asciiOutput = document.getElementById("asciiOutput");
const densitySelect = document.getElementById("density");
const downloadBtn = document.getElementById("downloadBtn");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const densityMap = {
  low: " .:-=+*#%@",
  medium: " .'`^\",:;Il!i~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  high: " .'`^\",:;Il!i~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$█"
};

imageInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      generateASCII(img);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function generateASCII(img) {
  const density = densityMap[densitySelect.value];

  const width = 150;
  const scale = img.height / img.width;
  canvas.width = width;
  canvas.height = width * scale * 0.55;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  let ascii = "";

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const index = (y * imageData.width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];

      const brightness = (r + g + b) / 3;
      const charIndex = Math.floor((brightness / 255) * (density.length - 1));
      ascii += density[charIndex];
    }
    ascii += "\n";
  }

  asciiOutput.textContent = ascii;
}

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([asciiOutput.textContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ascii-art.txt";
  link.click();
});