const inputUrl = document.getElementById("inputUrl");
const outputUrl = document.getElementById("outputUrl");
const encodeBtn = document.getElementById("encodeBtn");
const decodeBtn = document.getElementById("decodeBtn");
const copyBtn = document.getElementById("copyBtn");
const charCount = document.getElementById("charCount");

// Update character count
inputUrl.addEventListener("input", () => {
    charCount.textContent = `${inputUrl.value.length} characters`;
});

encodeBtn.addEventListener("click", () => {
    if (inputUrl.value.trim() === "") return;
    outputUrl.value = encodeURIComponent(inputUrl.value);
});

decodeBtn.addEventListener("click", () => {
    if (inputUrl.value.trim() === "") return;
    try {
        outputUrl.value = decodeURIComponent(inputUrl.value);
    } catch (error) {
        outputUrl.value = "Invalid URL encoding!";
    }
});

copyBtn.addEventListener("click", () => {
    if (outputUrl.value.trim() === "") return;
    outputUrl.select();
    navigator.clipboard.writeText(outputUrl.value);
    alert("Copied to clipboard!");
});