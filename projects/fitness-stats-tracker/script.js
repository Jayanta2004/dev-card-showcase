let stats = JSON.parse(localStorage.getItem("fitnessStats")) || [];

updateDashboard();

function addStats() {
    const steps = Number(document.getElementById("steps").value);
    const workout = Number(document.getElementById("workout").value);
    const water = Number(document.getElementById("water").value);

    if (!steps && !workout && !water) return;

    const calories = Math.floor(steps * 0.04 + workout * 6);

    const entry = {
        date: new Date().toLocaleDateString(),
        steps,
        workout,
        water,
        calories
    };

    stats.push(entry);
    localStorage.setItem("fitnessStats", JSON.stringify(stats));

    clearInputs();
    updateDashboard();
}

function updateDashboard() {
    let totalSteps = 0;
    let totalWorkout = 0;
    let totalWater = 0;
    let totalCalories = 0;

    stats.forEach(s => {
        totalSteps += s.steps;
        totalWorkout += s.workout;
        totalWater += s.water;
        totalCalories += s.calories;
    });

    document.getElementById("totalSteps").innerText = totalSteps;
    document.getElementById("totalWorkout").innerText = totalWorkout;
    document.getElementById("totalWater").innerText = totalWater.toFixed(1);
    document.getElementById("calories").innerText = totalCalories;

    renderHistory();
}

function renderHistory() {
    const history = document.getElementById("history");
    history.innerHTML = "";

    stats.slice().reverse().forEach(s => {
        const li = document.createElement("li");
        li.innerText =
            `${s.date} • ${s.steps} steps • ${s.workout} min • ${s.water}L • 🔥 ${s.calories} cal`;
        history.appendChild(li);
    });
}

function clearInputs() {
    document.getElementById("steps").value = "";
    document.getElementById("workout").value = "";
    document.getElementById("water").value = "";
}
