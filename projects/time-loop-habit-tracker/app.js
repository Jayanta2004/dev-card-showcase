// Time-Loop Habit Tracker Logic
// Track habits in repeating cycles, visualize progress as loops and spirals

const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitsList = document.getElementById('habits-list');
const spiralSVG = document.getElementById('spiral-visual');

let habits = JSON.parse(localStorage.getItem('loopHabits')) || [];

function renderHabits() {
    habitsList.innerHTML = '';
    habits.forEach((habit, idx) => {
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit';
        habitDiv.innerHTML = `
            <span>${habit.name}</span>
            <span class="loop-progress">Cycle: ${habit.cycle} | Progress: ${habit.progress}/${habit.length}</span>
            <button class="mark-done" onclick="markDone(${idx})">Mark Done</button>
        `;
        habitsList.appendChild(habitDiv);
    });
    renderSpiral();
}

window.markDone = function(idx) {
    if (habits[idx].progress < habits[idx].length) {
        habits[idx].progress += 1;
        if (habits[idx].progress === habits[idx].length) {
            habits[idx].cycle += 1;
            habits[idx].progress = 0;
        }
        localStorage.setItem('loopHabits', JSON.stringify(habits));
        renderHabits();
    }
}

habitForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = habitInput.value.trim();
    if (!name) return;
    habits.push({ name, cycle: 1, progress: 0, length: 7 }); // Default cycle length: 7
    localStorage.setItem('loopHabits', JSON.stringify(habits));
    habitInput.value = '';
    renderHabits();
});

function renderSpiral() {
    spiralSVG.innerHTML = '';
    const width = spiralSVG.width.baseVal.value;
    const height = spiralSVG.height.baseVal.value;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2 - 20;
    let colors = ['#4caf50', '#2196f3', '#ff4081', '#ff9800', '#9c27b0'];
    habits.forEach((habit, idx) => {
        let spiralPath = '';
        let turns = habit.cycle;
        let points = habit.length * turns;
        let angleStep = 2 * Math.PI / habit.length;
        for (let i = 0; i < points; i++) {
            let angle = i * angleStep;
            let radius = maxRadius * (i / points);
            let x = centerX + Math.cos(angle) * radius;
            let y = centerY + Math.sin(angle) * radius;
            if (i === 0) {
                spiralPath += `M ${x} ${y} `;
            } else {
                spiralPath += `L ${x} ${y} `;
            }
        }
        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', spiralPath);
        path.setAttribute('stroke', colors[idx % colors.length]);
        path.setAttribute('stroke-width', 4);
        path.setAttribute('fill', 'none');
        spiralSVG.appendChild(path);
        // Progress marker
        let progressAngle = habit.progress * angleStep;
        let progressRadius = maxRadius * (habit.progress / points);
        let px = centerX + Math.cos(progressAngle) * progressRadius;
        let py = centerY + Math.sin(progressAngle) * progressRadius;
        let marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        marker.setAttribute('cx', px);
        marker.setAttribute('cy', py);
        marker.setAttribute('r', 8);
        marker.setAttribute('fill', colors[idx % colors.length]);
        spiralSVG.appendChild(marker);
    });
}

renderHabits();
