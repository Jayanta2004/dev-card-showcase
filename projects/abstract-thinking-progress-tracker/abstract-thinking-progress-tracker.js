// abstract-thinking-progress-tracker.js

let exercises = JSON.parse(localStorage.getItem('abstractExercises')) || [];
let currentExercise = null;
let timerInterval = null;
let startTime = null;

// Exercise prompts for abstract thinking
const exercisePrompts = [
    {
        type: "Pattern Recognition",
        prompt: "Look at the sequence: 2, 4, 8, 16, ? What number comes next and why? Think about the relationship between each number."
    },
    {
        type: "Analogical Reasoning",
        prompt: "Complete the analogy: Tree is to Forest as Book is to ________. Explain your reasoning for why this makes sense."
    },
    {
        type: "Conceptual Thinking",
        prompt: "If you could invent a new color that doesn't exist in our visible spectrum, what would it be called and what would it represent? Describe its properties."
    },
    {
        type: "Creative Problem Solving",
        prompt: "Imagine you're stranded on a deserted island with only a mirror, a rope, and a knife. How could you signal for help? Think of multiple creative solutions."
    },
    {
        type: "Abstract Categorization",
        prompt: "Group these words into categories: cloud, bicycle, airplane, rain, motorcycle, helicopter, snow, car. What categories did you create and why?"
    },
    {
        type: "Hypothetical Reasoning",
        prompt: "If gravity suddenly reversed for 5 minutes, what would happen to the world? Think about both immediate and long-term effects."
    },
    {
        type: "Symbolic Thinking",
        prompt: "What does the phrase 'time is a thief' mean to you? Interpret it in multiple ways and explain your interpretations."
    },
    {
        type: "Paradox Resolution",
        prompt: "Resolve this paradox: 'This sentence is false.' How can you make sense of a statement that contradicts itself?"
    },
    {
        type: "Metaphorical Thinking",
        prompt: "Create a metaphor for 'learning.' For example, 'Learning is like...' Explain why this metaphor fits."
    },
    {
        type: "Systems Thinking",
        prompt: "How does changing the temperature of water affect its state? Think about the relationships between temperature, energy, and molecular movement."
    }
];

function generateExercise() {
    const randomIndex = Math.floor(Math.random() * exercisePrompts.length);
    const exercise = exercisePrompts[randomIndex];

    document.getElementById('promptText').textContent = exercise.prompt;
    document.getElementById('exerciseType').textContent = exercise.type;
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('completeBtn').disabled = true;

    currentExercise = {
        id: Date.now(),
        type: exercise.type,
        prompt: exercise.prompt,
        startTime: null,
        endTime: null,
        duration: 0,
        difficultyRating: 5,
        performanceRating: 5,
        notes: ''
    };
}

function startExercise() {
    if (currentExercise) {
        startTime = new Date();
        currentExercise.startTime = startTime.toISOString();

        document.getElementById('startBtn').disabled = true;
        document.getElementById('completeBtn').disabled = false;

        timerInterval = setInterval(updateTimer, 1000);
    }
}

function updateTimer() {
    if (!startTime) return;

    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    document.getElementById('timerDisplay').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('elapsedTime').textContent =
        `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`;
}

function completeExercise() {
    if (!currentExercise) return;

    clearInterval(timerInterval);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // seconds

    currentExercise.endTime = endTime.toISOString();
    currentExercise.duration = duration;
    currentExercise.difficultyRating = parseInt(document.getElementById('difficultyRating').value);
    currentExercise.performanceRating = parseInt(document.getElementById('performanceRating').value);
    currentExercise.notes = document.getElementById('notes').value.trim();

    exercises.push(currentExercise);

    // Keep only last 50 exercises
    if (exercises.length > 50) {
        exercises = exercises.slice(-50);
    }

    localStorage.setItem('abstractExercises', JSON.stringify(exercises));

    // Reset UI
    resetUI();
    updateStats();
    updateChart();
    updateHistory();
}

function resetUI() {
    document.getElementById('generateBtn').disabled = false;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('completeBtn').disabled = true;
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('elapsedTime').textContent = '0:00';
    document.getElementById('exerciseType').textContent = '-';
    document.getElementById('promptText').textContent = 'Click "Generate Exercise" to start your abstract thinking session.';
    document.getElementById('difficultyRating').value = '5';
    document.getElementById('performanceRating').value = '5';
    document.getElementById('difficultyValue').textContent = '5';
    document.getElementById('performanceValue').textContent = '5';
    document.getElementById('notes').value = '';

    currentExercise = null;
    startTime = null;
}

function updateStats() {
    if (exercises.length === 0) {
        document.getElementById('avgPerformance').textContent = '0/10';
        document.getElementById('totalExercises').textContent = '0';
        document.getElementById('improvementTrend').textContent = '0%';
        document.getElementById('bestPerformance').textContent = '0/10';
        return;
    }

    const performances = exercises.map(e => e.performanceRating);
    const avgPerformance = (performances.reduce((a, b) => a + b, 0) / performances.length).toFixed(1);
    const bestPerformance = Math.max(...performances);

    document.getElementById('avgPerformance').textContent = `${avgPerformance}/10`;
    document.getElementById('totalExercises').textContent = exercises.length;
    document.getElementById('bestPerformance').textContent = `${bestPerformance}/10`;

    // Calculate improvement trend (comparing first half vs second half)
    const midPoint = Math.floor(exercises.length / 2);
    if (midPoint > 0) {
        const firstHalf = exercises.slice(0, midPoint).map(e => e.performanceRating);
        const secondHalf = exercises.slice(midPoint).map(e => e.performanceRating);

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        const improvement = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
        document.getElementById('improvementTrend').textContent = `${improvement > 0 ? '+' : ''}${improvement}%`;
    } else {
        document.getElementById('improvementTrend').textContent = '0%';
    }
}

function updateChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');

    // Sort exercises by date
    const sortedExercises = exercises.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    const labels = sortedExercises.map(e => new Date(e.startTime).toLocaleDateString());
    const performanceData = sortedExercises.map(e => e.performanceRating);
    const difficultyData = sortedExercises.map(e => e.difficultyRating);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance Rating',
                data: performanceData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Difficulty Rating',
                data: difficultyData,
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Abstract Thinking Progress Over Time'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Rating (1-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

function updateHistory() {
    const history = document.getElementById('exercisesHistory');
    history.innerHTML = '';

    // Show last 10 exercises
    const recentExercises = exercises.slice(-10).reverse();

    recentExercises.forEach(exercise => {
        const item = document.createElement('div');
        item.className = 'exercise-entry';

        const startDate = new Date(exercise.startTime).toLocaleString();
        const duration = formatDuration(exercise.duration);

        item.innerHTML = `
            <h4>${exercise.type} - ${startDate}</h4>
            <p><strong>Performance:</strong> <span class="performance">${exercise.performanceRating}/10</span></p>
            <p><strong>Difficulty:</strong> <span class="difficulty">${exercise.difficultyRating}/10</span></p>
            <p><strong>Time:</strong> <span class="time">${duration}</span></p>
            ${exercise.notes ? `<p><strong>Notes:</strong> ${exercise.notes}</p>` : ''}
        `;

        history.appendChild(item);
    });
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update rating display values
document.getElementById('difficultyRating').addEventListener('input', function() {
    document.getElementById('difficultyValue').textContent = this.value;
});

document.getElementById('performanceRating').addEventListener('input', function() {
    document.getElementById('performanceValue').textContent = this.value;
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateStats();
    updateChart();
    updateHistory();
});