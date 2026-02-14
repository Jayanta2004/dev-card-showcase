document.addEventListener('DOMContentLoaded', () => {
    const titleScreen = document.getElementById('title-screen');
    const gameScreen = document.getElementById('game-screen');
    const scoreScreen = document.getElementById('score-screen');
    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const timeLeftEl = document.getElementById('time-left');
    const finalScoreEl = document.getElementById('final-score');

    let currentGame = null;
    let currentQuestionIndex = 0;
    let score = 0;
    let timer = null;
    let timeLeft = 30;

    const mathQuestions = [
        { question: "What is 5 + 7?", options: ["10", "11", "12", "13"], answer: "12" },
        { question: "What is 15 - 8?", options: ["6", "7", "8", "9"], answer: "7" },
        { question: "What is 3 * 4?", options: ["10", "11", "12", "13"], answer: "12" },
        { question: "What is 20 / 5?", options: ["3", "4", "5", "6"], answer: "4" },
        { question: "What is 9 + 6?", options: ["14", "15", "16", "17"], answer: "15" }
    ];

    const logicQuestions = [
        { question: "What has keys but can't open locks?", options: ["Piano", "Door", "Car", "House"], answer: "Piano" },
        { question: "What comes once in a minute, twice in a moment, but never in a thousand years?", options: ["M", "O", "N", "T"], answer: "M" },
        { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", options: ["Echo", "Wind", "Voice", "Sound"], answer: "Echo" },
        { question: "The more you take, the more you leave behind. What am I?", options: ["Footsteps", "Time", "Money", "Food"], answer: "Footsteps" },
        { question: "What has a head, a tail, is brown, and has no legs?", options: ["Snake", "Penny", "Dog", "Cat"], answer: "Penny" }
    ];

    const trafficQuestions = [
        { question: "What does a red traffic light mean?", options: ["Go", "Stop", "Slow down", "Yield"], answer: "Stop" },
        { question: "What is the speed limit in a residential area?", options: ["25 mph", "35 mph", "45 mph", "55 mph"], answer: "25 mph" },
        { question: "When can you make a U-turn?", options: ["At any intersection", "Only where permitted", "On highways", "In parking lots"], answer: "Only where permitted" },
        { question: "What should you do at a yield sign?", options: ["Stop completely", "Slow down and yield", "Speed up", "Ignore it"], answer: "Slow down and yield" },
        { question: "What does a flashing yellow light mean?", options: ["Stop", "Go", "Caution", "No turn"], answer: "Caution" }
    ];

    document.getElementById('math-game-btn').addEventListener('click', () => startGame('math'));
    document.getElementById('logic-game-btn').addEventListener('click', () => startGame('logic'));
    document.getElementById('traffic-game-btn').addEventListener('click', () => startGame('traffic'));
    document.getElementById('restart-btn').addEventListener('click', restart);

    function startGame(gameType) {
        currentGame = gameType;
        currentQuestionIndex = 0;
        score = 0;
        titleScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        loadQuestion();
    }

    function loadQuestion() {
        const questions = getQuestions();
        if (currentQuestionIndex >= questions.length) {
            showScore();
            return;
        }
        const q = questions[currentQuestionIndex];
        questionEl.textContent = q.question;
        optionsEl.innerHTML = '';
        q.options.forEach(option => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.classList.add('option-btn');
            btn.addEventListener('click', () => selectAnswer(option, q.answer));
            optionsEl.appendChild(btn);
        });
        timeLeft = 30;
        timeLeftEl.textContent = timeLeft;
        startTimer();
    }

    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            timeLeftEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                nextQuestion();
            }
        }, 1000);
    }

    function selectAnswer(selected, correct) {
        clearInterval(timer);
        if (selected === correct) {
            score += 10;
        }
        nextQuestion();
    }

    function nextQuestion() {
        currentQuestionIndex++;
        loadQuestion();
    }

    function showScore() {
        gameScreen.classList.add('hidden');
        scoreScreen.classList.remove('hidden');
        finalScoreEl.textContent = `Your Score: ${score} / 50`;
    }

    function restart() {
        scoreScreen.classList.add('hidden');
        titleScreen.classList.remove('hidden');
    }

    function getQuestions() {
        switch (currentGame) {
            case 'math': return mathQuestions;
            case 'logic': return logicQuestions;
            case 'traffic': return trafficQuestions;
        }
    }
});