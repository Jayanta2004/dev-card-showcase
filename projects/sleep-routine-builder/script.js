const routineInput = document.getElementById("routineInput");
const routineList = document.getElementById("routineList");
const sleepTimeEl = document.getElementById("sleepTime");
const wakeTimeEl = document.getElementById("wakeTime");
const insightEl = document.getElementById("insight");

let routines = JSON.parse(localStorage.getItem("routines")) || [];

function saveData() {
    localStorage.setItem("routines", JSON.stringify(routines));
}

function renderRoutines() {
    routineList.innerHTML = "";
    routines.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        routineList.appendChild(li);
    });
}

function addRoutine() {
    const text = routineInput.value.trim();
    if (!text) return;

    routines.push(text);
    routineInput.value = "";
    saveData();
    renderRoutines();
    updateInsight();
}

function updateInsight() {
    const sleep = sleepTimeEl.value;
    const wake = wakeTimeEl.value;

    if (!sleep || !wake) {
        insightEl.textContent = "Set sleep and wake time for insights.";
        return;
    }

    insightEl.textContent =
        `Great! A consistent routine with ${routines.length} habits improves sleep quality and reduces stress. 🌿`;
}

sleepTimeEl.addEventListener("change", updateInsight);
wakeTimeEl.addEventListener("change", updateInsight);

renderRoutines();
