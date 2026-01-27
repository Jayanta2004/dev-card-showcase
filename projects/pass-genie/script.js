function getRandomChar(characters) {
    return characters[Math.floor(Math.random() * characters.length)];
}

function generatePassword() {
    const length = Number(document.getElementById("length").value);
    const useUpper = document.getElementById("uppercase").checked;
    const useLower = document.getElementById("lowercase").checked;
    const useNumbers = document.getElementById("numbers").checked;
    const useSymbols = document.getElementById("symbols").checked;

    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let allChars = "";
    if(useUpper) allChars += upperChars;
    if(useLower) allChars += lowerChars;
    if(useNumbers) allChars += numberChars;
    if(useSymbols) allChars += symbolChars;

    if(allChars === "") {
        alert("Select at least one character type!");
        return;
    }

    let password = "";
    for(let i=0; i<length; i++) {
        password += getRandomChar(allChars);
    }

    document.getElementById("password").value = password;
    checkStrength(password);
}

function checkStrength(pw) {
    let strengthText = "Weak";
    let score = 0;

    if(pw.length >= 8) score++;
    if(/[A-Z]/.test(pw)) score++;
    if(/[a-z]/.test(pw)) score++;
    if(/[0-9]/.test(pw)) score++;
    if(/[^A-Za-z0-9]/.test(pw)) score++;

    if(score >= 4 && pw.length >= 12) strengthText = "Strong";
    else if(score >= 3) strengthText = "Medium";

    document.getElementById("strengthText").textContent = strengthText;
}

document.getElementById("generateBtn").addEventListener("click", generatePassword);

document.getElementById("copyBtn").addEventListener("click", () => {
    const pwInput = document.getElementById("password");
    if(pwInput.value === "") return;
    pwInput.select();
    pwInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(pwInput.value);
    alert("Password copied to clipboard!");
});
