// Interactive Science Experiment Simulator
const form = document.getElementById('experiment-form');
const expName = document.getElementById('exp-name');
const expDesc = document.getElementById('exp-desc');
const expDuration = document.getElementById('exp-duration');
const experimentArea = document.getElementById('experiment-area');
const expTitle = document.getElementById('exp-title');
const expDescription = document.getElementById('exp-description');
const runBtn = document.getElementById('run-btn');
const shareBtn = document.getElementById('share-btn');
const dataChart = document.getElementById('data-chart');

let experiment = null;
let data = [];
let interval = null;

form.addEventListener('submit', e => {
    e.preventDefault();
    experiment = {
        name: expName.value,
        desc: expDesc.value,
        duration: parseInt(expDuration.value)
    };
    expTitle.textContent = experiment.name;
    expDescription.textContent = experiment.desc;
    experimentArea.style.display = 'block';
    data = [];
    renderChart();
});

runBtn.addEventListener('click', () => {
    if (!experiment) return;
    data = [];
    renderChart();
    let t = 0;
    runBtn.disabled = true;
    interval = setInterval(() => {
        t++;
        // Simulate experiment data (random for demo)
        const value = Math.round(50 + 30 * Math.sin(t / 2) + Math.random() * 10);
        data.push({ t, value });
        renderChart();
        if (t >= experiment.duration) {
            clearInterval(interval);
            runBtn.disabled = false;
        }
    }, 1000);
});

shareBtn.addEventListener('click', () => {
    if (!experiment) return;
    const shareText = `Experiment: ${experiment.name}\nDescription: ${experiment.desc}\nData: ${JSON.stringify(data)}`;
    navigator.clipboard.writeText(shareText);
    alert('Experiment details copied to clipboard!');
});

dataChart.width = 400;
dataChart.height = 150;

function renderChart() {
    const ctx = dataChart.getContext('2d');
    ctx.clearRect(0, 0, dataChart.width, dataChart.height);
    ctx.strokeStyle = '#1976d2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, i) => {
        const x = (i / (experiment ? experiment.duration : 10)) * dataChart.width;
        const y = dataChart.height - (point.value / 100) * dataChart.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Draw axes
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, dataChart.height);
    ctx.lineTo(dataChart.width, dataChart.height);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, dataChart.height);
    ctx.stroke();
    // Draw points
    ctx.fillStyle = '#ffb300';
    data.forEach((point, i) => {
        const x = (i / (experiment ? experiment.duration : 10)) * dataChart.width;
        const y = dataChart.height - (point.value / 100) * dataChart.height;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}
