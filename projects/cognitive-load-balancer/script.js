function calculateLoad() {
    const complexity = parseInt(document.getElementById("complexity").value);
    const pressure = parseInt(document.getElementById("pressure").value);
    const multitask = parseInt(document.getElementById("multitask").value);

    const score = (complexity + pressure + multitask) / 3;

    const resultBox = document.getElementById("result");
    const statusText = resultBox.querySelector("h2");
    const adviceText = document.getElementById("advice");

    resultBox.classList.remove("low", "medium", "high");

    if (score <= 4) {
        resultBox.classList.add("low");
        statusText.textContent = "Status: Low Load";
        adviceText.textContent = "You are in a relaxed cognitive state. Good time for learning.";
    } 
    else if (score <= 7) {
        resultBox.classList.add("medium");
        statusText.textContent = "Status: Optimal Load";
        adviceText.textContent = "You are in a productive state. Maintain focus.";
    } 
    else {
        resultBox.classList.add("high");
        statusText.textContent = "Status: Overloaded";
        adviceText.textContent = "High stress detected. Consider taking a short break.";
    }
}
