const input = document.getElementById("barcodeInput");
const typeSelect = document.getElementById("barcodeType");
const generateBtn = document.getElementById("generateBtn");
const barcodeSvg = document.getElementById("barcode");

generateBtn.addEventListener("click", () => {
  const value = input.value.trim();
  const format = typeSelect.value;

  if (!value) {
    alert("Please enter a value to generate a barcode.");
    return;
  }

  try {
    JsBarcode(barcodeSvg, value, {
      format: format,
      lineColor: "#000",
      width: 2,
      height: 80,
      displayValue: true
    });
  } catch (error) {
    alert("Invalid input for selected barcode type.");
  }
});
