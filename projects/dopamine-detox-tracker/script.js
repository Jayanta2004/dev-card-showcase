let habits = [];
let streak = 0;

function addHabit() {
    const name = document.getElementById("habitInput").value;
    const limit = parseInt(document.getElementById("limitInput").value);

    if (!name || !limit) return;

    habits.push({ name, limit, used: 0 });
    renderHabits();
}

function renderHabits() {
    const list = document.getElementById("habitList");
    list.innerHTML = "";

    habits.forEach((habit, index) => {
        const div = document.createElement("div");
        div.className = "habit-card";
        div.innerHTML = `
            <strong>${habit.name}</strong><br>
            Limit: ${habit.limit} mins<br>
            Used: <input type="number" onchange="updateUsage(${index}, this.value)">
        `;
        list.appendChild(div);
    });
}

function updateUsage(index, value) {
    habits[index].used = parseInt(value);
    updateClarity();
}

function updateClarity() {
    let controlled = habits.filter(h => h.used <= h.limit).length;
    let total = habits.length;

    const clarity = document.getElementById("clarityStatus");

    if (controlled === total) {
        clarity.innerText = "🟢 Focused";
        streak++;
    } else if (controlled >= total / 2) {
        clarity.innerText = "🟡 Balanced";
    } else {
        clarity.innerText = "🔴 Overstimulated";
        streak = 0;
    }

    document.getElementById("streak").innerText = streak;
}

function saveReflection() {
    const text = document.getElementById("reflectionInput").value;
    localStorage.setItem("reflection", text);
    alert("Reflection saved.");
}