const files = document.querySelectorAll(".file");
const unlockBtn = document.getElementById("unlockBtn");
const codeInput = document.getElementById("codeInput");
const message = document.getElementById("message");

const SECRET_CODE = "0420"; // You could randomize this

// Restore progress
if (localStorage.getItem("escaped") === "true") {
    message.textContent = "🚪 You've already escaped!";
}

// File click behavior
files.forEach(file => {
    file.addEventListener("click", () => {
        alert(file.dataset.content);
    });
});

// Console hint
console.log("%c🔎 Curious mind detected.", "color: lime;");
console.log("%cThe code might be:", "color: cyan;");
console.log("%c0 4 2 0", "color: yellow; font-size: 16px;");

// Unlock logic
unlockBtn.addEventListener("click", tryUnlock);

codeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        tryUnlock();
    }
});

function tryUnlock() {
    if (codeInput.value === SECRET_CODE) {
        message.textContent = "🎉 Door unlocked! You escaped!";
        localStorage.setItem("escaped", "true");
        document.body.style.background = "#002200";
    } else {
        message.textContent = "❌ Incorrect code.";
        document.body.style.background = "#220000";
        setTimeout(() => {
            document.body.style.background = "#0d1117";
        }, 500);
    }
}

// Hidden keyboard shortcut (bonus clue)
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "h") {
        alert("Hidden clue: The console always knows more than it says...");
    }
});
