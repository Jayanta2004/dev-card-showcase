const video = document.getElementById("video");
const resultText = document.getElementById("result");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");

let stream = null;
let scanning = false;
let barcodeDetector = null;

// Check browser support
if ("BarcodeDetector" in window) {
  barcodeDetector = new BarcodeDetector({
    formats: [
      "qr_code",
      "ean_13",
      "ean_8",
      "code_128",
      "code_39",
      "upc_a",
      "upc_e"
    ]
  });
} else {
  resultText.textContent = "Barcode scanning not supported in this browser.";
}

async function startScanner() {
  if (!barcodeDetector || scanning) return;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    video.srcObject = stream;
    scanning = true;
    scanLoop();
  } catch (err) {
    resultText.textContent = "Camera access denied.";
  }
}

async function scanLoop() {
  if (!scanning) return;

  try {
    const barcodes = await barcodeDetector.detect(video);
    if (barcodes.length > 0) {
      const code = barcodes[0].rawValue;
      resultText.textContent = `Detected: ${code}`;
      stopScanner();
      return;
    }
  } catch (err) {
    console.error(err);
  }

  requestAnimationFrame(scanLoop);
}

function stopScanner() {
  scanning = false;

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }

  video.srcObject = null;
}

startBtn.addEventListener("click", startScanner);
stopBtn.addEventListener("click", stopScanner);
