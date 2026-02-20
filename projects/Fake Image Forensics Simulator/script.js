const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const elaBtn = document.getElementById("elaBtn");
const noiseBtn = document.getElementById("noiseBtn");
const compressBtn = document.getElementById("compressBtn");
const resetBtn = document.getElementById("resetBtn");

let originalImage = null;

upload.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    img.src = URL.createObjectURL(file);
});

/* ============================
   Error Level Analysis (Fake)
============================ */

elaBtn.addEventListener("click", function() {
    if (!originalImage) return;

    let imgData = new ImageData(
        new Uint8ClampedArray(originalImage.data),
        originalImage.width,
        originalImage.height
    );

    for (let i = 0; i < imgData.data.length; i += 4) {
        let diff = Math.abs(
            imgData.data[i] - (Math.floor(imgData.data[i] / 10) * 10)
        );

        imgData.data[i] = diff * 20;     // Red
        imgData.data[i + 1] = diff * 5;  // Green
        imgData.data[i + 2] = diff * 2;  // Blue
    }

    ctx.putImageData(imgData, 0, 0);
});

/* ============================
   Noise Map
============================ */

noiseBtn.addEventListener("click", function() {
    if (!originalImage) return;

    let imgData = new ImageData(
        new Uint8ClampedArray(originalImage.data),
        originalImage.width,
        originalImage.height
    );

    for (let i = 0; i < imgData.data.length; i += 4) {
        let gray = (imgData.data[i] +
                    imgData.data[i+1] +
                    imgData.data[i+2]) / 3;

        let noise = Math.abs(gray - 128);

        imgData.data[i] = noise * 2;
        imgData.data[i+1] = noise * 2;
        imgData.data[i+2] = noise * 2;
    }

    ctx.putImageData(imgData, 0, 0);
});

/* ============================
   Compression Heatmap
============================ */

compressBtn.addEventListener("click", function() {
    if (!originalImage) return;

    let imgData = new ImageData(
        new Uint8ClampedArray(originalImage.data),
        originalImage.width,
        originalImage.height
    );

    for (let i = 0; i < imgData.data.length; i += 4) {
        let block = (Math.floor(i / 4) % 16);

        let intensity = block * 10;

        imgData.data[i] = intensity;       // Red
        imgData.data[i+1] = 0;             // Green
        imgData.data[i+2] = 255 - intensity; // Blue
    }

    ctx.putImageData(imgData, 0, 0);
});

/* ============================
   Reset
============================ */

resetBtn.addEventListener("click", function() {
    if (originalImage) {
        ctx.putImageData(originalImage, 0, 0);
    }
});
