const keys = document.querySelectorAll(".key");
const totalStrokesEl = document.getElementById("totalStrokes");
const mostFrequentEl = document.getElementById("mostFrequent");
const maxCountEl = document.getElementById("maxCount");
const resetBtn = document.getElementById("resetBtn");

const keyMap = {};
let totalStrokes = 0;

keys.forEach(key => {
    keyMap[key.dataset.key] = {
        count: 0,
        element: key
    };
});

document.addEventListener("keydown", (e) => {
    let pressedKey = e.key;

    if (pressedKey === " ") pressedKey = " ";
    if (pressedKey.length === 1) pressedKey = pressedKey.toLowerCase();

    if (!keyMap[pressedKey]) return;

    keyMap[pressedKey].count++;
    totalStrokes++;

    updateHeat(keyMap[pressedKey]);
    updateStats();
});

function updateHeat(keyData) {
    const count = keyData.count;
    let heatLevel = 1;

    if (count > 5) heatLevel = 2;
    if (count > 15) heatLevel = 3;
    if (count > 30) heatLevel = 4;

    keyData.element.setAttribute("data-heat", heatLevel);
}

function updateStats() {
    totalStrokesEl.textContent = totalStrokes;

    let maxKey = "-";
    let maxCount = 0;

    for (const key in keyMap) {
        if (keyMap[key].count > maxCount) {
            maxCount = keyMap[key].count;
            maxKey = key === " " ? "Space" : key.toUpperCase();
        }
    }

    mostFrequentEl.textContent = maxKey;
    maxCountEl.textContent = maxCount;
}

resetBtn.addEventListener("click", () => {
    totalStrokes = 0;

    for (const key in keyMap) {
        keyMap[key].count = 0;
        keyMap[key].element.removeAttribute("data-heat");
    }

    totalStrokesEl.textContent = "0";
    mostFrequentEl.textContent = "-";
    maxCountEl.textContent = "0";
});
