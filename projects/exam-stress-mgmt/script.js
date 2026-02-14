const stressSlider = document.getElementById("stressSlider");
const stressValue = document.getElementById("stressValue");
const progressBar = document.getElementById("progressBar");

const breathingBtn = document.getElementById("breathingBtn");
const breathingText = document.getElementById("breathingText");

const affirmationBtn = document.getElementById("affirmationBtn");
const affirmationText = document.getElementById("affirmationText");

const studyTimerBtn = document.getElementById("studyTimerBtn");
const timerText = document.getElementById("timerText");

let stress = localStorage.getItem("stress") || 50;
stressSlider.value = stress;
updateStress();

stressSlider.oninput = () => {
    stress = stressSlider.value;
    localStorage.setItem("stress", stress);
    updateStress();
};

function updateStress() {
    stressValue.textContent = `Stress Level: ${stress}%`;
    progressBar.style.width = (100 - stress) + "%";
}

/* Breathing Exercise */
breathingBtn.onclick = () => {
    let steps = ["Inhale...", "Hold...", "Exhale..."];
    let i = 0;
    breathingText.textContent = steps[i];

    let interval = setInterval(() => {
        i++;
        if (i >= steps.length) {
            clearInterval(interval);
            breathingText.textContent = "Exercise complete. Feel calmer!";
        } else {
            breathingText.textContent = steps[i];
        }
    }, 3000);
};

/* Affirmations */
const affirmations = [
    "You are capable of great things.",
    "Stay calm and trust your preparation.",
    "Every step forward counts.",
    "You’ve handled challenges before—you can do it again.",
    "Progress, not perfection."
];

affirmationBtn.onclick = () => {
    const msg = affirmations[Math.floor(Math.random() * affirmations.length)];
    affirmationText.textContent = msg;
};

/* Study Timer (25-minute session) */
studyTimerBtn.onclick = () => {
    let time = 25 * 60;
    let interval = setInterval(() => {
        let min = Math.floor(time / 60);
        let sec = time % 60;
        timerText.textContent =
            `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
        time--;

        if (time < 0) {
            clearInterval(interval);
            timerText.textContent = "Break time! 🎉";
        }
    }, 1000);
};
