// mental-agility-score.js

let task1Results = { correct: 0, total: 0, times: [] };
let task2Results = { correct: 0, total: 0, times: [] };
let task3Results = { correct: 0, total: 0, times: [] };

let currentTask1Trial = 0;
let currentTask2Trial = 0;
let currentTask3Trial = 0;

const colors = ['red', 'blue', 'green', 'yellow'];
const colorNames = ['RED', 'BLUE', 'GREEN', 'YELLOW'];

const operations = ['Add 2', 'Subtract 1', 'Multiply by 2', 'Divide by 2'];
const categories = ['Animal or Not?', 'Food or Not?', 'Color or Not?', 'Number or Not?'];

const items = {
    'Animal or Not?': ['Cat', 'Dog', 'Car', 'Tree', 'Elephant', 'Chair'],
    'Food or Not?': ['Apple', 'Pizza', 'Rock', 'Bread', 'Stone', 'Cake'],
    'Color or Not?': ['Red', 'Blue', 'Table', 'Green', 'Chair', 'Yellow'],
    'Number or Not?': ['5', 'Ten', '7', 'House', '3', 'Book']
};

const answers = {
    'Animal or Not?': ['yes', 'yes', 'no', 'no', 'yes', 'no'],
    'Food or Not?': ['yes', 'yes', 'no', 'yes', 'no', 'yes'],
    'Color or Not?': ['yes', 'yes', 'no', 'yes', 'no', 'yes'],
    'Number or Not?': ['yes', 'no', 'yes', 'no', 'yes', 'no']
};

// Task 1: Color-Word Challenge
document.getElementById('startTask1').addEventListener('click', startTask1);

function startTask1() {
    task1Results = { correct: 0, total: 0, times: [] };
    currentTask1Trial = 0;
    document.getElementById('task1Result').textContent = '';
    runTask1Trial();
}

function runTask1Trial() {
    if (currentTask1Trial >= 10) {
        endTask1();
        return;
    }

    const colorIndex = Math.floor(Math.random() * colors.length);
    const nameIndex = Math.floor(Math.random() * colorNames.length);

    const stimulus = document.getElementById('stimulus');
    stimulus.textContent = colorNames[nameIndex];
    stimulus.style.color = colors[colorIndex];

    const startTime = Date.now();

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = () => {
            const endTime = Date.now();
            const reactionTime = endTime - startTime;
            const selectedColor = btn.dataset.color;
            const correct = selectedColor === colors[colorIndex];

            task1Results.correct += correct ? 1 : 0;
            task1Results.total++;
            task1Results.times.push(reactionTime);

            document.getElementById('task1Result').textContent = correct ? 'Correct!' : 'Incorrect!';
            document.getElementById('task1Result').className = correct ? 'result correct' : 'result incorrect';

            currentTask1Trial++;
            setTimeout(runTask1Trial, 1000);
        };
    });
}

function endTask1() {
    const accuracy = (task1Results.correct / task1Results.total) * 100;
    const avgTime = task1Results.times.reduce((a, b) => a + b, 0) / task1Results.times.length;
    document.getElementById('task1Result').textContent = `Task 1 Complete! Accuracy: ${accuracy.toFixed(1)}%, Avg Time: ${avgTime.toFixed(0)}ms`;
    checkAllTasksComplete();
}

// Task 2: Number Operation Switch
document.getElementById('startTask2').addEventListener('click', startTask2);

function startTask2() {
    task2Results = { correct: 0, total: 0, times: [] };
    currentTask2Trial = 0;
    document.getElementById('task2Result').textContent = '';
    runTask2Trial();
}

function runTask2Trial() {
    if (currentTask2Trial >= 15) {
        endTask2();
        return;
    }

    let ruleIndex = Math.floor(Math.random() * operations.length);
    if (currentTask2Trial > 0 && Math.random() < 0.3) { // 30% chance to switch rule
        ruleIndex = (ruleIndex + 1) % operations.length;
    }

    const rule = operations[ruleIndex];
    document.getElementById('rule').textContent = `Rule: ${rule}`;

    let number = Math.floor(Math.random() * 20) + 1;
    document.getElementById('numberStimulus').textContent = number;

    let correctAnswer;
    switch (rule) {
        case 'Add 2': correctAnswer = number + 2; break;
        case 'Subtract 1': correctAnswer = number - 1; break;
        case 'Multiply by 2': correctAnswer = number * 2; break;
        case 'Divide by 2': correctAnswer = Math.floor(number / 2); break;
    }

    const startTime = Date.now();

    document.getElementById('submitAnswer').onclick = () => {
        const userAnswer = parseInt(document.getElementById('answerInput').value);
        const endTime = Date.now();
        const reactionTime = endTime - startTime;

        const correct = userAnswer === correctAnswer;
        task2Results.correct += correct ? 1 : 0;
        task2Results.total++;
        task2Results.times.push(reactionTime);

        document.getElementById('task2Result').textContent = correct ? 'Correct!' : `Incorrect! Answer was ${correctAnswer}`;
        document.getElementById('task2Result').className = correct ? 'result correct' : 'result incorrect';

        document.getElementById('answerInput').value = '';
        currentTask2Trial++;
        setTimeout(runTask2Trial, 1500);
    };
}

function endTask2() {
    const accuracy = (task2Results.correct / task2Results.total) * 100;
    const avgTime = task2Results.times.reduce((a, b) => a + b, 0) / task2Results.times.length;
    document.getElementById('task2Result').textContent = `Task 2 Complete! Accuracy: ${accuracy.toFixed(1)}%, Avg Time: ${avgTime.toFixed(0)}ms`;
    checkAllTasksComplete();
}

// Task 3: Category Switch
document.getElementById('startTask3').addEventListener('click', startTask3);

function startTask3() {
    task3Results = { correct: 0, total: 0, times: [] };
    currentTask3Trial = 0;
    document.getElementById('task3Result').textContent = '';
    runTask3Trial();
}

function runTask3Trial() {
    if (currentTask3Trial >= 12) {
        endTask3();
        return;
    }

    let ruleIndex = Math.floor(Math.random() * categories.length);
    if (currentTask3Trial > 0 && Math.random() < 0.4) { // 40% chance to switch rule
        ruleIndex = (ruleIndex + 1) % categories.length;
    }

    const rule = categories[ruleIndex];
    document.getElementById('categoryRule').textContent = `Rule: ${rule}`;

    const itemIndex = Math.floor(Math.random() * items[rule].length);
    const item = items[rule][itemIndex];
    const correctAnswer = answers[rule][itemIndex];

    document.getElementById('itemStimulus').textContent = item;

    const startTime = Date.now();

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.onclick = () => {
            const endTime = Date.now();
            const reactionTime = endTime - startTime;
            const selectedCategory = btn.dataset.category;
            const correct = selectedCategory === correctAnswer;

            task3Results.correct += correct ? 1 : 0;
            task3Results.total++;
            task3Results.times.push(reactionTime);

            document.getElementById('task3Result').textContent = correct ? 'Correct!' : 'Incorrect!';
            document.getElementById('task3Result').className = correct ? 'result correct' : 'result incorrect';

            currentTask3Trial++;
            setTimeout(runTask3Trial, 1200);
        };
    });
}

function endTask3() {
    const accuracy = (task3Results.correct / task3Results.total) * 100;
    const avgTime = task3Results.times.reduce((a, b) => a + b, 0) / task3Results.times.length;
    document.getElementById('task3Result').textContent = `Task 3 Complete! Accuracy: ${accuracy.toFixed(1)}%, Avg Time: ${avgTime.toFixed(0)}ms`;
    checkAllTasksComplete();
}

function checkAllTasksComplete() {
    if (task1Results.total > 0 && task2Results.total > 0 && task3Results.total > 0) {
        document.getElementById('calculateScore').style.display = 'block';
    }
}

document.getElementById('calculateScore').addEventListener('click', calculateAgilityScore);

function calculateAgilityScore() {
    // Calculate weighted score: Accuracy 60%, Speed 40%
    const task1Accuracy = task1Results.correct / task1Results.total;
    const task1AvgTime = task1Results.times.reduce((a, b) => a + b, 0) / task1Results.times.length;
    const task1Speed = Math.max(0, 1 - (task1AvgTime - 500) / 1500); // Normalize speed

    const task2Accuracy = task2Results.correct / task2Results.total;
    const task2AvgTime = task2Results.times.reduce((a, b) => a + b, 0) / task2Results.times.length;
    const task2Speed = Math.max(0, 1 - (task2AvgTime - 1000) / 3000);

    const task3Accuracy = task3Results.correct / task3Results.total;
    const task3AvgTime = task3Results.times.reduce((a, b) => a + b, 0) / task3Results.times.length;
    const task3Speed = Math.max(0, 1 - (task3AvgTime - 800) / 2000);

    const overallAccuracy = (task1Accuracy + task2Accuracy + task3Accuracy) / 3;
    const overallSpeed = (task1Speed + task2Speed + task3Speed) / 3;

    const agilityScore = (overallAccuracy * 60 + overallSpeed * 40) * 10; // Scale to 0-100

    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreLabel = document.getElementById('scoreLabel');
    const scoreBreakdown = document.getElementById('scoreBreakdown');

    scoreNumber.textContent = agilityScore.toFixed(1);

    let label = '';
    if (agilityScore >= 80) {
        label = 'Excellent Agility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
    } else if (agilityScore >= 60) {
        label = 'Good Agility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
    } else if (agilityScore >= 40) {
        label = 'Moderate Agility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
    } else {
        label = 'Low Agility';
        scoreDisplay.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
    }

    scoreLabel.textContent = label;

    scoreBreakdown.innerHTML = `
        <strong>Breakdown:</strong><br>
        Task 1 (Color-Word): ${task1Accuracy.toFixed(2)*100}% accuracy, ${(task1AvgTime/1000).toFixed(1)}s avg time<br>
        Task 2 (Number Ops): ${task2Accuracy.toFixed(2)*100}% accuracy, ${(task2AvgTime/1000).toFixed(1)}s avg time<br>
        Task 3 (Categories): ${task3Accuracy.toFixed(2)*100}% accuracy, ${(task3AvgTime/1000).toFixed(1)}s avg time<br>
        <br>
        <em>Score = (Accuracy × 0.6 + Speed × 0.4) × 10</em>
    `;

    scoreDisplay.style.display = 'block';
}