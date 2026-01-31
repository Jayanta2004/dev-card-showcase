// Workout Planner JavaScript
class WorkoutPlanner {
    constructor() {
        this.exerciseDatabase = this.getExerciseDatabase();
        this.workouts = this.loadWorkouts();
        this.sessions = this.loadSessions();
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCharts();
        this.displayWorkouts();
        this.updateStats();
    }

    getExerciseDatabase() {
        return {
            "push-ups": {
                name: "Push-ups",
                category: "Upper Body",
                caloriesPerRep: 0.5,
                defaultSets: 3,
                defaultReps: 10,
                description: "Classic bodyweight exercise for chest and triceps"
            },
            "squats": {
                name: "Squats",
                category: "Lower Body",
                caloriesPerRep: 0.8,
                defaultSets: 3,
                defaultReps: 12,
                description: "Fundamental lower body exercise targeting quads and glutes"
            },
            "plank": {
                name: "Plank",
                category: "Core",
                caloriesPerMinute: 3,
                defaultSets: 3,
                defaultDuration: 30,
                description: "Isometric core exercise for abdominal strength"
            },
            "burpees": {
                name: "Burpees",
                category: "Full Body",
                caloriesPerRep: 1.2,
                defaultSets: 3,
                defaultReps: 8,
                description: "High-intensity full body exercise"
            },
            "pull-ups": {
                name: "Pull-ups",
                category: "Upper Body",
                caloriesPerRep: 1.0,
                defaultSets: 3,
                defaultReps: 6,
                description: "Upper body pulling exercise for back and biceps"
            },
            "lunges": {
                name: "Lunges",
                category: "Lower Body",
                caloriesPerRep: 0.6,
                defaultSets: 3,
                defaultReps: 10,
                description: "Unilateral lower body exercise for balance and strength"
            },
            "mountain-climbers": {
                name: "Mountain Climbers",
                category: "Core/Cardio",
                caloriesPerMinute: 8,
                defaultSets: 3,
                defaultDuration: 30,
                description: "Dynamic core exercise with cardio benefits"
            },
            "deadlifts": {
                name: "Deadlifts",
                category: "Full Body",
                caloriesPerRep: 1.5,
                defaultSets: 3,
                defaultReps: 8,
                description: "Compound posterior chain exercise"
            },
            "bench-press": {
                name: "Bench Press",
                category: "Upper Body",
                caloriesPerRep: 0.7,
                defaultSets: 3,
                defaultReps: 10,
                description: "Classic chest pressing exercise"
            },
            "bicep-curls": {
                name: "Bicep Curls",
                category: "Upper Body",
                caloriesPerRep: 0.3,
                defaultSets: 3,
                defaultReps: 12,
                description: "Isolation exercise for biceps"
            },
            "crunches": {
                name: "Crunches",
                category: "Core",
                caloriesPerRep: 0.2,
                defaultSets: 3,
                defaultReps: 15,
                description: "Abdominal crunch exercise"
            },
            "jumping-jacks": {
                name: "Jumping Jacks",
                category: "Cardio",
                caloriesPerMinute: 10,
                defaultSets: 3,
                defaultDuration: 60,
                description: "Classic cardio warm-up exercise"
            }
        };
    }

    setupEventListeners() {
        // Exercise search
        document.getElementById('exerciseSearch').addEventListener('input', (e) => {
            this.showExerciseSuggestions(e.target.value);
        });

        // Add exercise button
        document.getElementById('addExerciseBtn').addEventListener('click', () => {
            this.addExerciseToWorkout();
        });

        // Form submission
        document.getElementById('workoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveWorkout();
        });
    }

    showExerciseSuggestions(query) {
        const suggestionsDiv = document.getElementById('exerciseSuggestions');
        if (query.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const matches = Object.keys(this.exerciseDatabase).filter(exercise =>
            exercise.toLowerCase().includes(query.toLowerCase()) ||
            this.exerciseDatabase[exercise].name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        if (matches.length === 0) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        suggestionsDiv.innerHTML = matches.map(exercise => `
            <div class="suggestion-item" data-exercise="${exercise}">
                ${this.exerciseDatabase[exercise].name} - ${this.exerciseDatabase[exercise].category}
            </div>
        `).join('');

        suggestionsDiv.style.display = 'block';

        // Add click listeners to suggestions
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('exerciseSearch').value = item.dataset.exercise;
                suggestionsDiv.style.display = 'none';
            });
        });
    }

    addExerciseToWorkout() {
        const exerciseInput = document.getElementById('exerciseSearch');
        const exerciseName = exerciseInput.value.toLowerCase().trim();

        if (!exerciseName || !this.exerciseDatabase[exerciseName]) {
            alert('Please select a valid exercise from the suggestions.');
            return;
        }

        const exercise = this.exerciseDatabase[exerciseName];
        const exerciseList = document.getElementById('exerciseList');

        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        exerciseItem.innerHTML = `
            <div class="exercise-info">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-details">
                    <span>Sets: <input type="number" value="${exercise.defaultSets}" min="1" max="10"></span>
                    ${exercise.caloriesPerRep ?
                        `<span>Reps: <input type="number" value="${exercise.defaultReps}" min="1" max="100"></span>` :
                        `<span>Duration: <input type="number" value="${exercise.defaultDuration}" min="10" max="300"> sec</span>`
                    }
                </div>
            </div>
            <button class="remove-btn" onclick="workoutPlanner.removeExercise(this)">×</button>
        `;

        exerciseList.appendChild(exerciseItem);
        exerciseInput.value = '';
    }

    removeExercise(button) {
        button.parentElement.remove();
    }

    calculateWorkoutCalories(exercises) {
        let totalCalories = 0;
        exercises.forEach(exercise => {
            const sets = parseInt(exercise.sets) || 0;
            if (exercise.caloriesPerRep) {
                const reps = parseInt(exercise.reps) || 0;
                totalCalories += exercise.caloriesPerRep * sets * reps;
            } else {
                const duration = parseInt(exercise.duration) || 0;
                totalCalories += exercise.caloriesPerMinute * (duration / 60) * sets;
            }
        });
        return Math.round(totalCalories);
    }

    saveWorkout() {
        const workoutName = document.getElementById('workoutName').value.trim();
        if (!workoutName) {
            alert('Please enter a workout name.');
            return;
        }

        const exerciseItems = document.querySelectorAll('.exercise-item');
        if (exerciseItems.length === 0) {
            alert('Please add at least one exercise.');
            return;
        }

        const exercises = [];
        exerciseItems.forEach(item => {
            const inputs = item.querySelectorAll('input');
            const exerciseName = item.querySelector('.exercise-name').textContent;
            const exerciseKey = Object.keys(this.exerciseDatabase).find(key =>
                this.exerciseDatabase[key].name === exerciseName
            );

            if (exerciseKey) {
                const exercise = this.exerciseDatabase[exerciseKey];
                const exerciseData = {
                    name: exercise.name,
                    category: exercise.category,
                    sets: parseInt(inputs[0].value) || exercise.defaultSets
                };

                if (exercise.caloriesPerRep) {
                    exerciseData.reps = parseInt(inputs[1].value) || exercise.defaultReps;
                    exerciseData.caloriesPerRep = exercise.caloriesPerRep;
                } else {
                    exerciseData.duration = parseInt(inputs[1].value) || exercise.defaultDuration;
                    exerciseData.caloriesPerMinute = exercise.caloriesPerMinute;
                }

                exercises.push(exerciseData);
            }
        });

        const workout = {
            id: Date.now(),
            name: workoutName,
            exercises: exercises,
            createdAt: new Date().toISOString(),
            estimatedCalories: this.calculateWorkoutCalories(exercises)
        };

        this.workouts.push(workout);
        this.saveWorkouts();
        this.displayWorkouts();

        // Reset form
        document.getElementById('workoutForm').reset();
        document.getElementById('exerciseList').innerHTML = '';

        alert('Workout plan saved successfully!');
    }

    startWorkout(workoutId) {
        const workout = this.workouts.find(w => w.id === workoutId);
        if (!workout) return;

        const session = {
            id: Date.now(),
            workoutId: workoutId,
            workoutName: workout.name,
            startTime: new Date().toISOString(),
            exercises: workout.exercises.map(ex => ({ ...ex, completed: false })),
            caloriesBurned: 0
        };

        // For demo purposes, mark as completed immediately
        session.endTime = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
        session.caloriesBurned = workout.estimatedCalories;
        session.completed = true;

        this.sessions.push(session);
        this.saveSessions();
        this.updateCharts();
        this.updateStats();

        alert(`Workout "${workout.name}" completed! ${session.caloriesBurned} calories burned.`);
    }

    displayWorkouts() {
        const workoutsList = document.getElementById('workoutsList');

        if (this.workouts.length === 0) {
            workoutsList.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No workout plans yet. Create your first workout above!</p>';
            return;
        }

        workoutsList.innerHTML = this.workouts.map(workout => `
            <div class="workout-card">
                <div class="workout-header">
                    <div class="workout-title">${workout.name}</div>
                    <div class="workout-meta">${workout.exercises.length} exercises</div>
                </div>
                <div class="workout-exercises">
                    ${workout.exercises.slice(0, 3).map(ex => `
                        <div class="exercise-summary">${ex.sets} × ${ex.name}</div>
                    `).join('')}
                    ${workout.exercises.length > 3 ? `<div class="exercise-summary">+${workout.exercises.length - 3} more...</div>` : ''}
                </div>
                <div class="workout-stats">
                    <span>~${workout.estimatedCalories} cal</span>
                    <span>${this.calculateWorkoutDuration(workout)} min</span>
                </div>
                <button class="start-workout-btn" onclick="workoutPlanner.startWorkout(${workout.id})">
                    Start Workout
                </button>
            </div>
        `).join('');
    }

    calculateWorkoutDuration(workout) {
        let totalMinutes = 0;
        workout.exercises.forEach(exercise => {
            if (exercise.duration) {
                totalMinutes += (exercise.duration * exercise.sets) / 60;
            } else {
                // Estimate 45 seconds per rep + 60 seconds rest between sets
                totalMinutes += (exercise.reps * exercise.sets * 0.75 + exercise.sets * 1);
            }
        });
        return Math.round(totalMinutes);
    }

    updateCharts() {
        const weeklyData = this.getWeeklyData();
        const ctx = document.getElementById('caloriesChart').getContext('2d');

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weeklyData.labels,
                datasets: [{
                    label: 'Calories Burned',
                    data: weeklyData.calories,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }

    getWeeklyData() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const calories = new Array(7).fill(0);

        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));

        this.sessions.forEach(session => {
            const sessionDate = new Date(session.endTime);
            const dayDiff = Math.floor((sessionDate - startOfWeek) / (1000 * 60 * 60 * 24));

            if (dayDiff >= 0 && dayDiff < 7) {
                calories[dayDiff] += session.caloriesBurned;
            }
        });

        return { labels: days, calories: calories };
    }

    updateStats() {
        const weeklyData = this.getWeeklyData();
        const totalCalories = weeklyData.calories.reduce((sum, cal) => sum + cal, 0);
        const workoutCount = this.sessions.filter(session => {
            const sessionDate = new Date(session.endTime);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate >= weekAgo;
        }).length;

        const avgSession = workoutCount > 0 ? Math.round(totalCalories / workoutCount / 60) : 0;

        document.getElementById('weeklyWorkouts').textContent = workoutCount;
        document.getElementById('totalCalories').textContent = totalCalories;
        document.getElementById('avgSession').textContent = `${avgSession} min`;
    }

    saveWorkouts() {
        localStorage.setItem('workoutPlans', JSON.stringify(this.workouts));
    }

    loadWorkouts() {
        const saved = localStorage.getItem('workoutPlans');
        return saved ? JSON.parse(saved) : [];
    }

    saveSessions() {
        localStorage.setItem('workoutSessions', JSON.stringify(this.sessions));
    }

    loadSessions() {
        const saved = localStorage.getItem('workoutSessions');
        return saved ? JSON.parse(saved) : [];
    }
}

// Initialize the app
const workoutPlanner = new WorkoutPlanner();