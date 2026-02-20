document.addEventListener('DOMContentLoaded', function() {
    const workoutForm = document.getElementById('workoutForm');
    const muscleStatusGrid = document.getElementById('muscleStatusGrid');
    const workoutTable = document.getElementById('workoutTable');
    const recoveryChartCanvas = document.getElementById('recoveryChart');

    // Stats elements
    const totalWorkoutsEl = document.getElementById('totalWorkouts');
    const workoutsThisWeekEl = document.getElementById('workoutsThisWeek');
    const mostTrainedEl = document.getElementById('mostTrained');
    const recoveryScoreEl = document.getElementById('recoveryScore');

    let workouts = JSON.parse(localStorage.getItem('muscleRecoveryWorkouts')) || [];
    let chart;

    // Recovery times in hours
    const RECOVERY_TIMES = {
        light: 36,      // 24-48h average
        moderate: 60,   // 48-72h average
        heavy: 84,      // 72-96h average
        'very-heavy': 108 // 96+h average
    };

    // Muscle groups
    const MUSCLE_GROUPS = [
        'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
        'quads', 'hamstrings', 'calves', 'glutes', 'core', 'full-body'
    ];

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    function saveWorkouts() {
        localStorage.setItem('muscleRecoveryWorkouts', JSON.stringify(workouts));
    }

    function getRecoveryHours(intensity) {
        return RECOVERY_TIMES[intensity] || 36;
    }

    function getMuscleStatus(lastWorkoutDate, intensity) {
        if (!lastWorkoutDate) return { status: 'rested', hoursLeft: 0, timeUntilReady: 'Ready now' };

        const now = new Date();
        const workoutDate = new Date(lastWorkoutDate);
        const hoursSinceWorkout = (now - workoutDate) / (1000 * 60 * 60);
        const recoveryHours = getRecoveryHours(intensity);
        const hoursLeft = Math.max(0, recoveryHours - hoursSinceWorkout);

        if (hoursLeft === 0) {
            return { status: 'rested', hoursLeft: 0, timeUntilReady: 'Ready now' };
        } else if (hoursLeft <= 24) {
            return { status: 'ready-soon', hoursLeft, timeUntilReady: `${Math.ceil(hoursLeft)}h left` };
        } else if (hoursLeft <= recoveryHours * 1.5) {
            return { status: 'recovering', hoursLeft, timeUntilReady: `${Math.ceil(hoursLeft)}h left` };
        } else {
            return { status: 'overtrained', hoursLeft, timeUntilReady: 'Overtrained' };
        }
    }

    function getMuscleGroupData() {
        const muscleData = {};

        // Initialize all muscle groups
        MUSCLE_GROUPS.forEach(muscle => {
            muscleData[muscle] = { lastWorkout: null, intensity: null };
        });

        // Find the most recent workout for each muscle group
        workouts.forEach(workout => {
            workout.muscles.forEach(muscle => {
                if (!muscleData[muscle].lastWorkout ||
                    new Date(workout.date) > new Date(muscleData[muscle].lastWorkout)) {
                    muscleData[muscle] = {
                        lastWorkout: workout.date,
                        intensity: workout.intensity
                    };
                }
            });
        });

        return muscleData;
    }

    function renderMuscleStatus() {
        const muscleData = getMuscleGroupData();

        const muscleLabels = {
            chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
            biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
            quads: 'Quads', hamstrings: 'Hamstrings', calves: 'Calves',
            glutes: 'Glutes', core: 'Core', 'full-body': 'Full Body'
        };

        const html = MUSCLE_GROUPS.map(muscle => {
            const data = muscleData[muscle];
            const status = getMuscleStatus(data.lastWorkout, data.intensity);

            return `
                <div class="muscle-status-card">
                    <div class="muscle-name">${muscleLabels[muscle]}</div>
                    <div class="status-indicator status-${status.status}">${status.status.replace('-', ' ')}</div>
                    <div class="recovery-time">${status.timeUntilReady}</div>
                </div>
            `;
        }).join('');

        muscleStatusGrid.innerHTML = html;
    }

    function calculateStats() {
        if (workouts.length === 0) {
            totalWorkoutsEl.textContent = '--';
            workoutsThisWeekEl.textContent = '--';
            mostTrainedEl.textContent = '--';
            recoveryScoreEl.textContent = '--%';
            return;
        }

        const totalWorkouts = workouts.length;

        // Workouts this week
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisWeek = workouts.filter(w => new Date(w.date) >= weekAgo).length;

        // Most trained muscle group
        const muscleCount = {};
        workouts.forEach(workout => {
            workout.muscles.forEach(muscle => {
                muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
            });
        });
        const mostTrained = Object.entries(muscleCount)
            .sort(([,a], [,b]) => b - a)[0];

        // Recovery score (percentage of muscle groups that are rested or ready soon)
        const muscleData = getMuscleGroupData();
        const totalMuscles = MUSCLE_GROUPS.length;
        const recoveredMuscles = MUSCLE_GROUPS.filter(muscle => {
            const status = getMuscleStatus(muscleData[muscle].lastWorkout, muscleData[muscle].intensity);
            return status.status === 'rested' || status.status === 'ready-soon';
        }).length;
        const recoveryScore = Math.round((recoveredMuscles / totalMuscles) * 100);

        totalWorkoutsEl.textContent = totalWorkouts;
        workoutsThisWeekEl.textContent = thisWeek;
        mostTrainedEl.textContent = mostTrained ? mostTrained[0] : 'None';
        recoveryScoreEl.textContent = `${recoveryScore}%`;
    }

    function formatMuscles(muscles) {
        const labels = {
            chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
            biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
            quads: 'Quads', hamstrings: 'Hamstrings', calves: 'Calves',
            glutes: 'Glutes', core: 'Core', 'full-body': 'Full Body'
        };
        return muscles.map(m => `<span class="muscle-tag">${labels[m]}</span>`).join(' ');
    }

    function renderWorkoutTable() {
        if (workouts.length === 0) {
            workoutTable.innerHTML = '<p>No workouts logged yet. Start tracking your muscle recovery!</p>';
            return;
        }

        // Sort workouts by date (newest first)
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Intensity</th>
                    <th>Muscle Groups</th>
                    <th>Exercises</th>
                    <th>Notes</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${workouts.map((workout, index) => `
                    <tr>
                        <td>${new Date(workout.date).toLocaleDateString()}</td>
                        <td><span class="intensity-badge intensity-${workout.intensity}">${workout.intensity.replace('-', ' ')}</span></td>
                        <td><div class="muscle-tags">${formatMuscles(workout.muscles)}</div></td>
                        <td>${workout.exercises || '-'}</td>
                        <td>${workout.notes || '-'}</td>
                        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        workoutTable.innerHTML = '';
        workoutTable.appendChild(table);

        // Add delete event listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (confirm('Are you sure you want to delete this workout?')) {
                    workouts.splice(index, 1);
                    saveWorkouts();
                    renderWorkoutTable();
                    renderMuscleStatus();
                    calculateStats();
                    updateChart();
                }
            });
        });
    }

    function updateChart() {
        if (workouts.length === 0) {
            if (chart) chart.destroy();
            return;
        }

        const muscleData = getMuscleGroupData();
        const muscleLabels = {
            chest: 'Chest', back: 'Back', shoulders: 'Shoulders',
            biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
            quads: 'Quads', hamstrings: 'Hamstrings', calves: 'Calves',
            glutes: 'Glutes', core: 'Core', 'full-body': 'Full Body'
        };

        const labels = MUSCLE_GROUPS.map(m => muscleLabels[m]);
        const recoveryHours = MUSCLE_GROUPS.map(muscle => {
            const data = muscleData[muscle];
            const status = getMuscleStatus(data.lastWorkout, data.intensity);
            return status.hoursLeft;
        });

        if (chart) chart.destroy();

        chart = new Chart(recoveryChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Hours Until Ready',
                    data: recoveryHours,
                    backgroundColor: recoveryHours.map(hours => {
                        if (hours === 0) return '#4CAF50';
                        if (hours <= 24) return '#2196F3';
                        if (hours <= 72) return '#FF9800';
                        return '#F44336';
                    }),
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours Until Ready'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    workoutForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const date = document.getElementById('date').value;
        const intensity = document.getElementById('intensity').value;

        // Get selected muscle groups
        const muscleCheckboxes = document.querySelectorAll('.muscle-checkbox input[type="checkbox"]:checked');
        const muscles = Array.from(muscleCheckboxes).map(cb => cb.value);

        if (muscles.length === 0) {
            alert('Please select at least one muscle group.');
            return;
        }

        const exercises = document.getElementById('exercises').value.trim();
        const notes = document.getElementById('notes').value.trim();

        const newWorkout = {
            date,
            intensity,
            muscles,
            exercises,
            notes
        };

        workouts.push(newWorkout);
        saveWorkouts();

        // Reset form
        workoutForm.reset();
        document.getElementById('date').valueAsDate = new Date();

        // Update UI
        calculateStats();
        renderMuscleStatus();
        renderWorkoutTable();
        updateChart();
    });

    // Initial render
    calculateStats();
    renderMuscleStatus();
    renderWorkoutTable();
    updateChart();
});