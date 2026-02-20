const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const resultDiv = document.getElementById("result");
const analyzeBtn = document.getElementById("analyzeBtn");

let animationId;

function randomProbability() {
    return Math.floor(Math.random() * 100);
}

analyzeBtn.addEventListener("click", analyze);

function analyze() {
    const question = document.getElementById("question").value.trim();
    if (!question) return;

    cancelAnimationFrame(animationId);

    resultDiv.textContent = "Analyzing...";
    resultDiv.style.color = "#00ffcc";
    resultDiv.classList.add("pulse");

    const probability = randomProbability();

    animateGraph(probability);
    playBeep();

    setTimeout(() => {
        resultDiv.classList.remove("pulse");

        if (probability > 65) {
            resultDiv.textContent = `⚠️ Deception Detected (${probability}% suspicious)`;
            resultDiv.style.color = "#ff4444";
        } else {
            resultDiv.textContent = `✅ Truth Likely (${probability}% confidence)`;
            resultDiv.style.color = "#00ffcc";
        }
    }, 2000);
}

function animateGraph(target) {
    let progress = 0;
    let values = [];

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = "#00ffcc";
        ctx.lineWidth = 2;

        values.push(Math.random() * 40 + progress);

        if (values.length > canvas.width) {
            values.shift();
        }

        for (let i = 0; i < values.length; i++) {
            let y = canvas.height - values[i];
            ctx.lineTo(i, y);
        }

        ctx.stroke();

        if (progress < target) {
            progress += 2;
            animationId = requestAnimationFrame(draw);
        }
    }

    values = [];
    draw();
}

function playBeep() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.2);
}
