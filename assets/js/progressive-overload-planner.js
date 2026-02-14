let workouts = JSON.parse(localStorage.getItem('progressiveOverloadData')) || [];
let goals = JSON.parse(localStorage.getItem('progressiveOverloadGoals')) || [];

function logWorkout() {
    const exercise = document.getElementById('exercise').value.trim();
    const weight = parseFloat(document.getElementById('weight').value);
    const reps = parseInt(document.getElementById('reps').value);
    const sets = parseInt(document.getElementById('sets').value);
    const date = document.getElementById('workoutDate').value;

    if (!exercise || isNaN(weight) || isNaN(reps) || isNaN(sets) || !date) {
        alert('Please fill in all fields');
        return;
    }

    const workout = {
        id: Date.now(),
        exercise: exercise,
        weight: weight,
        reps: reps,
        sets: sets,
        date: date
    };

    workouts.push(workout);
    localStorage.setItem('progressiveOverloadData', JSON.stringify(workouts));

    updateExercises();
    updateStats();
    clearLogForm();
}

function setGoal() {
    const exercise = document.getElementById('goalExercise').value;
    const targetWeight = parseFloat(document.getElementById('targetWeight').value);
    const targetReps = parseInt(document.getElementById('targetReps').value);
    const progressionRate = parseFloat(document.getElementById('progressionRate').value);
    const weeksToGoal = parseInt(document.getElementById('weeksToGoal').value);

    if (!exercise || isNaN(targetWeight) || isNaN(targetReps) || isNaN(progressionRate) || isNaN(weeksToGoal)) {
        alert('Please fill in all fields');
        return;
    }

    // Remove existing goal for this exercise
    goals = goals.filter(g => g.exercise !== exercise);

    const goal = {
        exercise: exercise,
        targetWeight: targetWeight,
        targetReps: targetReps,
        progressionRate: progressionRate / 100, // Convert to decimal
        weeksToGoal: weeksToGoal,
        startDate: new Date().toISOString().split('T')[0]
    };

    goals.push(goal);
    localStorage.setItem('progressiveOverloadGoals', JSON.stringify(goals));

    updateExercises();
    updateStats();
    updateAlerts();
    clearGoalForm();
}

function updateExercises() {
    const exercises = [...new Set(workouts.map(w => w.exercise))];

    const selects = ['goalExercise', 'scheduleExercise', 'graphExercise'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Exercise</option>';
        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise;
            option.textContent = exercise;
            select.appendChild(option);
        });
    });
}

function displaySchedule() {
    const exercise = document.getElementById('scheduleExercise').value;
    if (!exercise) {
        document.getElementById('scheduleDisplay').innerHTML = '';
        return;
    }

    const goal = goals.find(g => g.exercise === exercise);
    if (!goal) {
        document.getElementById('scheduleDisplay').innerHTML = '<p>No goal set for this exercise.</p>';
        return;
    }

    const exerciseWorkouts = workouts.filter(w => w.exercise === exercise).sort((a, b) => new Date(a.date) - new Date(b.date));
    const currentMax = exerciseWorkouts.length > 0 ? Math.max(...exerciseWorkouts.map(w => w.weight)) : 0;

    let scheduleHTML = '<div class="schedule-item"><strong>Current Max:</strong> ' + currentMax + ' lbs</div>';

    let currentWeight = currentMax;
    const startDate = new Date(goal.startDate);

    for (let week = 1; week <= goal.weeksToGoal; week++) {
        const weekDate = new Date(startDate);
        weekDate.setDate(startDate.getDate() + (week - 1) * 7);

        currentWeight = currentWeight * (1 + goal.progressionRate);

        const isMilestone = [Math.floor(goal.weeksToGoal * 0.25), Math.floor(goal.weeksToGoal * 0.5), Math.floor(goal.weeksToGoal * 0.75), goal.weeksToGoal].includes(week);

        scheduleHTML += '<div class="schedule-item' + (isMilestone ? ' milestone' : '') + '">' +
            '<div class="schedule-date">' + weekDate.toLocaleDateString() + '</div>' +
            '<div class="schedule-details">Week ' + week + ': ' + currentWeight.toFixed(1) + ' lbs × ' + goal.targetReps + ' reps</div>' +
            '</div>';
    }

    document.getElementById('scheduleDisplay').innerHTML = scheduleHTML;
}

function drawProgressGraph() {
    const exercise = document.getElementById('graphExercise').value;
    if (!exercise) return;

    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const exerciseWorkouts = workouts.filter(w => w.exercise === exercise).sort((a, b) => new Date(a.date) - new Date(b.date));

    if (exerciseWorkouts.length === 0) return;

    const padding = 60;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;

    const weights = exerciseWorkouts.map(w => w.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const weightRange = maxWeight - minWeight || 1;

    const dates = exerciseWorkouts.map(w => new Date(w.date));
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();

        const weight = maxWeight - (weightRange / 5) * i;
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText(weight.toFixed(0) + ' lbs', padding - 50, y + 5);
    }

    // Draw data points
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();

    exerciseWorkouts.forEach((workout, index) => {
        const x = padding + ((new Date(workout.date) - minDate) / dateRange) * chartWidth;
        const y = padding + ((maxWeight - workout.weight) / weightRange) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.stroke();

    // Draw goal line if exists
    const goal = goals.find(g => g.exercise === exercise);
    if (goal) {
        ctx.strokeStyle = '#28a745';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();

        const startWeight = weights[0] || 0;
        const startX = padding;
        const startY = padding + ((maxWeight - startWeight) / weightRange) * chartHeight;

        const endWeight = goal.targetWeight;
        const endX = canvas.width - padding;
        const endY = padding + ((maxWeight - endWeight) / weightRange) * chartHeight;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alertsDisplay');
    alertsContainer.innerHTML = '';

    goals.forEach(goal => {
        const exerciseWorkouts = workouts.filter(w => w.exercise === goal.exercise);
        const currentMax = exerciseWorkouts.length > 0 ? Math.max(...exerciseWorkouts.map(w => w.weight)) : 0;

        const progress = (currentMax / goal.targetWeight) * 100;
        const milestones = [25, 50, 75, 100];

        milestones.forEach(milestone => {
            const achieved = progress >= milestone;
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item' + (achieved ? ' achieved' : ' upcoming');
            alertItem.innerHTML = '<strong>' + goal.exercise + ' - ' + milestone + '% Goal</strong><br>' +
                (achieved ? 'Achieved! ' : 'Target: ') + (goal.targetWeight * milestone / 100).toFixed(1) + ' lbs';
            alertsContainer.appendChild(alertItem);
        });
    });
}

function updateStats() {
    const totalWorkouts = workouts.length;
    const totalExercises = new Set(workouts.map(w => w.exercise)).size;
    const activeGoals = goals.length;
    const upcomingMilestones = goals.reduce((count, goal) => {
        const exerciseWorkouts = workouts.filter(w => w.exercise === goal.exercise);
        const currentMax = exerciseWorkouts.length > 0 ? Math.max(...exerciseWorkouts.map(w => w.weight)) : 0;
        const progress = (currentMax / goal.targetWeight) * 100;
        return count + [25, 50, 75, 100].filter(m => progress < m).length;
    }, 0);

    document.getElementById('totalWorkouts').textContent = totalWorkouts;
    document.getElementById('totalExercises').textContent = totalExercises;
    document.getElementById('activeGoals').textContent = activeGoals;
    document.getElementById('upcomingMilestones').textContent = upcomingMilestones;
}

function clearLogForm() {
    document.getElementById('exercise').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('reps').value = '';
    document.getElementById('sets').value = '';
    document.getElementById('workoutDate').value = '';
}

function clearGoalForm() {
    document.getElementById('goalExercise').value = '';
    document.getElementById('targetWeight').value = '';
    document.getElementById('targetReps').value = '';
    document.getElementById('progressionRate').value = '';
    document.getElementById('weeksToGoal').value = '';
}

// Initialize
updateExercises();
updateStats();
updateAlerts();