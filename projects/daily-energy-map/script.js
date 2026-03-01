// Initialize hourly energy (0-100)
let energyLevels = Array(24).fill(50);
const svg = document.getElementById("energy-circle");
const inputsGrid = document.getElementById("inputs-grid");
const avgEnergyEl = document.getElementById("avg-energy");
const peakHourEl = document.getElementById("peak-hour");
const lowHourEl = document.getElementById("low-hour");

// Generate sliders for each hour
for(let h=0; h<24; h++){
    const label = document.createElement("label");
    label.innerHTML = `${h}:00
        <input type="range" min="0" max="100" value="50" data-hour="${h}">
    `;
    inputsGrid.appendChild(label);
}

// Update energy when slider changes
inputsGrid.addEventListener("input", e=>{
    if(e.target.tagName === "INPUT"){
        const hour = e.target.dataset.hour;
        energyLevels[hour] = parseInt(e.target.value);
        drawEnergyCircle();
        updateSummary();
        updateChart();
    }
});

// Draw the circular energy map
function drawEnergyCircle(){
    svg.innerHTML = "";
    const center = 200;
    const radius = 150;

    for(let h=0; h<24; h++){
        const angle = (h/24)*2*Math.PI - Math.PI/2;
        const x = center + Math.cos(angle)*radius;
        const y = center + Math.sin(angle)*radius;
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 12);
        circle.setAttribute("fill", getColor(energyLevels[h]));
        svg.appendChild(circle);
    }
}

// Map energy to color
function getColor(level){
    if(level < 35) return "#f44336"; // low
    if(level < 70) return "#ffeb3b"; // medium
    return "#4caf50"; // high
}

// Update summary
function updateSummary(){
    const avg = Math.round(energyLevels.reduce((a,b)=>a+b,0)/24);
    avgEnergyEl.innerText = avg;
    const peak = energyLevels.indexOf(Math.max(...energyLevels));
    const low = energyLevels.indexOf(Math.min(...energyLevels));
    peakHourEl.innerText = peak + ":00";
    lowHourEl.innerText = low + ":00";
}

// Weekly chart using Chart.js
const ctx = document.getElementById("weeklyEnergyChart").getContext('2d');
let weeklyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        datasets:[{
            label: "Average Energy",
            data: [50,60,55,70,65,60,75],
            borderColor:"#4caf50",
            backgroundColor:"rgba(76,175,80,0.2)",
            tension:0.3
        }]
    },
    options: { responsive:true, plugins:{legend:{display:true}}, scales:{y:{beginAtZero:true, max:100}} }
});

function updateChart(){
    weeklyChart.data.datasets[0].data = [50,60,55,70,65,60,75]; // static example
    weeklyChart.update();
}

// Initial render
drawEnergyCircle();
updateSummary();

// Dark/light toggle
document.getElementById("toggle-mode").addEventListener("click", ()=>{
    document.body.classList.toggle("dark-mode");
});