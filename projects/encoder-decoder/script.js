const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const method = document.getElementById("method");
const shiftInput = document.getElementById("shift");

// Encode Function
function encodeText() {
    let text = inputText.value;
    let selected = method.value;

    if (!text) return alert("Enter some text!");

    switch (selected) {
        case "base64":
            outputText.value = btoa(text);
            break;

        case "binary":
            outputText.value = text.split("")
                .map(char => char.charCodeAt(0).toString(2))
                .join(" ");
            break;

        case "hex":
            outputText.value = text.split("")
                .map(char => char.charCodeAt(0).toString(16))
                .join(" ");
            break;

        case "caesar":
            let shift = parseInt(shiftInput.value) || 3;
            outputText.value = caesarCipher(text, shift);
            break;
    }
}

// Decode Function
function decodeText() {
    let text = inputText.value;
    let selected = method.value;

    if (!text) return alert("Enter some text!");

    switch (selected) {
        case "base64":
            outputText.value = atob(text);
            break;

        case "binary":
            outputText.value = text.split(" ")
                .map(bin => String.fromCharCode(parseInt(bin, 2)))
                .join("");
            break;

        case "hex":
            outputText.value = text.split(" ")
                .map(hex => String.fromCharCode(parseInt(hex, 16)))
                .join("");
            break;

        case "caesar":
            let shift = parseInt(shiftInput.value) || 3;
            outputText.value = caesarCipher(text, -shift);
            break;
    }
}

// Caesar Cipher
function caesarCipher(str, shift) {
    return str.replace(/[a-z]/gi, char => {
        const start = char <= "Z" ? 65 : 97;
        return String.fromCharCode(
            (char.charCodeAt(0) - start + shift + 26) % 26 + start
        );
    });
}

// Copy to Clipboard
function copyOutput() {
    outputText.select();
    document.execCommand("copy");
    alert("Copied to clipboard!");
}

// Theme Toggle
document.getElementById("toggleTheme").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

// File Upload
document.getElementById("fileInput").addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            inputText.value = e.target.result;
        };
        reader.readAsText(file);
    }
});