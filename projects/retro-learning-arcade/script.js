/* ===================================
   RETRO LEARNING ARCADE - GAME LOGIC
   =================================== */

// Game state variables
let totalScore = 0;
let coins = 5;
let currentGame = null;
let gameActive = false;

// Math game variables
let mathScore = 0;
let mathTimer = 30;
let mathInterval = null;
let mathDifficulty = 1;
let mathConsecutiveCorrect = 0;

// Logic game variables
let logicScore = 0;
let currentPuzzle = 0;

const logicPuzzles = [
    {
        question: "If all roses are flowers and some flowers fade quickly, which statement must be true?",
        options: [
            "All roses fade quickly",
            "Some roses fade quickly",
            "No roses fade quickly",
            "Some flowers that fade quickly are roses"
        ],
        correct: 3
    },
    {
        question: "A train leaves Station A at 9:00 AM heading east at 60 mph. Another train leaves Station B at 9:30 AM heading west at 75 mph. The stations are 300 miles apart. When will they meet?",
        options: [
            "10:30 AM",
            "11:00 AM",
            "11:30 AM",
            "12:00 PM"
        ],
        correct: 1
    },
    {
        question: "If all programmers love coffee, and some gamers are programmers, which statement must be true?",
        options: [
            "All gamers love coffee",
            "Some gamers love coffee",
            "No gamers love coffee",
            "Some coffee lovers are not programmers"
        ],
        correct: 1
    },
    {
        question: "Three people check into a hotel room that costs $30. They each contribute $10. Later the clerk realizes the room should only cost $25. He gives the bellboy $5 to return. The bellboy keeps $2 and gives $1 back to each person. So each person paid $9, totaling $27, and the bellboy has $2, making $29. Where is the missing dollar?",
        options: [
            "There's an accounting error in the question",
            "The hotel clerk kept it",
            "The bellboy should have returned $3",
            "The $27 includes the $2 the bellboy kept"
        ],
        correct: 3
    },
    {
        question: "If some A are B, and all B are C, which statement must be true?",
        options: [
            "All A are C",
            "Some A are C",
            "No A are C",
            "All C are A"
        ],
        correct: 1
    }
];

// Traffic game variables
let trafficScore = 0;
let trafficLevel = 1;

const trafficQuestions = [
    {
        question: "What does a red traffic light mean?",
        options: [
            "Slow down and proceed with caution",
            "Stop and wait for green light",
            "Speed up to clear the intersection",
            "Prepare to stop"
        ],
        correct: 1
    },
    {
        question: "What does a yellow traffic light mean?",
        options: [
            "Speed up to beat the red light",
            "Stop if it's safe to do so",
            "Ignore it, it's about to turn green",
            "Proceed with caution"
        ],
        correct: 1
    },
    {
        question: "What does a green arrow signal mean?",
        options: [
            "You may proceed in the direction of the arrow",
            "All traffic must stop",
            "Caution, road work ahead",
            "Merge left"
        ],
        correct: 0
    },
    {
        question: "What should you do when you see a pedestrian crossing sign?",
        options: [
            "Speed up to cross before pedestrians",
            "Slow down and be prepared to stop",
            "Honk to alert pedestrians",
            "Ignore it if no pedestrians are visible"
        ],
        correct: 1
    },
    {
        question: "What does a flashing red traffic light mean?",
        options: [
            "Proceed with caution",
            "Treat it as a stop sign",
            "The traffic light is broken",
            "Right turn only"
        ],
        correct: 1
    }
];

// DOM element references
const totalScoreElement = document.getElementById('totalScore');
const coinCountElement = document.getElementById('coinCount');

// Game screens
const gameSelectionScreen = document.getElementById('gameSelection');
const mathGameScreen = document.getElementById('mathGame');
const logicGameScreen = document.getElementById('logicGame');
const trafficGameScreen = document.getElementById('trafficGame');
const scoreScreen = document.getElementById('scoreScreen');

// Game selection elements
const gameCards = document.querySelectorAll('.game-card');
const playBtn = document.getElementById('playBtn');

// Math game elements
const mathQuestionElement = document.getElementById('mathQuestion');
const mathOptionsElement = document.getElementById('mathOptions');
const mathTimerElement = document.getElementById('mathTimer');
const mathScoreElement = document.getElementById('mathScore');
const mathRestartBtn = document.getElementById('mathRestart');
const mathToMenuBtn = document.getElementById('mathToMenu');

// Logic game elements
const puzzleTextElement = document.getElementById('puzzleText');
const logicOptionsElement = document.getElementById('logicOptions');
const puzzleNumElement = document.getElementById('puzzleNum');
const logicScoreElement = document.getElementById('logicScore');
const logicNextBtn = document.getElementById('logicNext');
const logicToMenuBtn = document.getElementById('logicToMenu');

// Traffic game elements
const roadElement = document.getElementById('road');
const trafficQuestionElement = document.getElementById('trafficQuestion');
const trafficOptionsElement = document.getElementById('trafficOptions');
const trafficLevelElement = document.getElementById('trafficLevel');
const trafficScoreElement = document.getElementById('trafficScore');
const trafficStartBtn = document.getElementById('trafficStart');
const trafficToMenuBtn = document.getElementById('trafficToMenu');

// Score screen elements
const finalScoreElement = document.getElementById('finalScore');
const scoreMessageElement = document.getElementById('scoreMessage');
const playAgainBtn = document.getElementById('playAgain');
const scoreToMenuBtn = document.getElementById('scoreToMenu');

/* ===================================
   INITIALIZATION
   =================================== */

function init() {
    // Game card selection
    gameCards.forEach(card => {
        card.addEventListener('click', selectGame);
    });
    
    // Play button
    playBtn.addEventListener('click', startGame);
    
    // Math game buttons
    mathRestartBtn.addEventListener('click', restartMathGame);
    mathToMenuBtn.addEventListener('click', returnToMenu);
    
    // Logic game buttons
    logicNextBtn.addEventListener('click', nextLogicPuzzle);
    logicToMenuBtn.addEventListener('click', returnToMenu);
    
    // Traffic game buttons
    trafficStartBtn.addEventListener('click', startTrafficGame);
    trafficToMenuBtn.addEventListener('click', returnToMenu);
    
    // Score screen buttons
    playAgainBtn.addEventListener('click', playAgain);
    scoreToMenuBtn.addEventListener('click', returnToMenu);
    
    // Set default active game
    gameCards[0].click();
    
    // Update UI
    updateUI();
}

// Select game
function selectGame() {
    if (gameActive) return;
    
    gameCards.forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    
    currentGame = this.getAttribute('data-game');
    const gameTitle = this.querySelector('.game-title').textContent;
    playBtn.textContent = `INSERT COIN & PLAY`;
}

// Update UI elements
function updateUI() {
    totalScoreElement.textContent = String(totalScore).padStart(5, '0');
    coinCountElement.textContent = coins;
}

/* ===================================
   GAME FLOW
   =================================== */

// Start a game
function startGame() {
    if (coins <= 0) {
        playBtn.textContent = 'NO COINS! EARN MORE!';
        return;
    }
    
    if (!currentGame) {
        alert("Please select a game first!");
        return;
    }
    
    coins--;
    gameActive = true;
    
    // Hide all screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected game screen
    switch(currentGame) {
        case 'math':
            startMathGame();
            mathGameScreen.classList.add('active');
            break;
        case 'logic':
            startLogicGame();
            logicGameScreen.classList.add('active');
            break;
        case 'traffic':
            startTrafficSetup();
            trafficGameScreen.classList.add('active');
            break;
    }
    
    updateUI();
}

// Return to menu
function returnToMenu() {
    clearInterval(mathInterval);
    
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    gameSelectionScreen.classList.add('active');
    gameActive = false;
    playBtn.textContent = 'INSERT COIN & PLAY';
}

/* ===================================
   MATH BLASTER GAME
   =================================== */

function startMathGame() {
    mathScore = 0;
    mathTimer = 30;
    mathDifficulty = 1;
    mathConsecutiveCorrect = 0;
    mathScoreElement.textContent = mathScore;
    mathTimerElement.textContent = mathTimer;
    
    generateMathQuestion();
    
    // Start timer
    clearInterval(mathInterval);
    mathInterval = setInterval(() => {
        mathTimer--;
        mathTimerElement.textContent = mathTimer;
        
        // Difficulty increases at certain times
        if (mathTimer === 15) {
            mathDifficulty = 2;
        } else if (mathTimer === 5) {
            mathDifficulty = 3;
        }
        
        if (mathTimer <= 0) {
            endMathGame();
        }
    }, 1000);
}

function generateMathQuestion() {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, correctAnswer;
    
    // Adjust difficulty
    const maxNum = 30 + (mathDifficulty * 20);
    
    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            correctAnswer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxNum) + 20;
            num2 = Math.floor(Math.random() * num1) + 1;
            correctAnswer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * (10 + mathDifficulty * 5)) + 1;
            num2 = Math.floor(Math.random() * (10 + mathDifficulty * 5)) + 1;
            correctAnswer = num1 * num2;
            break;
        case '÷':
            num2 = Math.floor(Math.random() * (10 + mathDifficulty)) + 1;
            correctAnswer = Math.floor(Math.random() * 15) + 1;
            num1 = num2 * correctAnswer;
            break;
    }
    
    mathQuestionElement.textContent = `${num1} ${operation} ${num2} = ?`;
    
    // Generate options
    const options = [correctAnswer];
    
    // Add 3 wrong answers
    while (options.length < 4) {
        let wrongAnswer;
        if (operation === '÷') {
            wrongAnswer = Math.floor(Math.random() * 30) + 1;
        } else {
            wrongAnswer = correctAnswer + (Math.floor(Math.random() * 30) - 15);
        }
        
        if (wrongAnswer !== correctAnswer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);
    
    // Clear previous options
    mathOptionsElement.innerHTML = '';
    
    // Create option buttons
    options.forEach((option, index) => {
        const button = document.createElement('div');
        button.className = 'option';
        button.textContent = option;
        button.addEventListener('click', () => checkMathAnswer(option === correctAnswer));
        mathOptionsElement.appendChild(button);
    });
}

function checkMathAnswer(isCorrect) {
    if (!gameActive) return;
    
    if (isCorrect) {
        mathConsecutiveCorrect++;
        mathScore += 100;
        
        // Bonus for time left
        if (mathTimer > 20) {
            mathScore += 50;
        } else if (mathTimer > 10) {
            mathScore += 25;
        }
        
        // Combo bonus
        if (mathConsecutiveCorrect > 1) {
            mathScore += mathConsecutiveCorrect * 10;
        }
        
        mathScoreElement.textContent = mathScore;
        generateMathQuestion();
    } else {
        mathConsecutiveCorrect = 0;
        mathScore = Math.max(0, mathScore - 50);
        mathScoreElement.textContent = mathScore;
    }
}

function restartMathGame() {
    if (coins <= 0) {
        alert("OUT OF COINS!");
        return;
    }
    coins--;
    startMathGame();
    updateUI();
}

function endMathGame() {
    clearInterval(mathInterval);
    gameActive = false;
    totalScore += mathScore;
    showScoreScreen(mathScore, "MATH BLASTER COMPLETE!");
}

/* ===================================
   LOGIC PUZZLER GAME
   =================================== */

function startLogicGame() {
    logicScore = 0;
    currentPuzzle = 0;
    logicScoreElement.textContent = logicScore;
    loadLogicPuzzle();
}

function loadLogicPuzzle() {
    const puzzle = logicPuzzles[currentPuzzle];
    puzzleTextElement.textContent = puzzle.question;
    puzzleNumElement.textContent = currentPuzzle + 1;
    
    // Clear previous options
    logicOptionsElement.innerHTML = '';
    
    // Create option buttons
    puzzle.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'puzzle-option';
        optionElement.textContent = `${index + 1}. ${option}`;
        optionElement.addEventListener('click', () => checkLogicAnswer(index));
        logicOptionsElement.appendChild(optionElement);
    });
    
    logicScoreElement.textContent = logicScore;
}

function checkLogicAnswer(selectedIndex) {
    if (!gameActive) return;
    
    const puzzle = logicPuzzles[currentPuzzle];
    const options = logicOptionsElement.querySelectorAll('.puzzle-option');
    
    // Disable all options
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // Mark correct and incorrect
    if (selectedIndex === puzzle.correct) {
        options[selectedIndex].style.backgroundColor = 'rgba(0, 100, 0, 0.8)';
        options[selectedIndex].style.borderLeft = '4px solid var(--retro-green)';
        logicScore += 200;
        
        logicNextBtn.style.display = 'block';
    } else {
        options[selectedIndex].style.backgroundColor = 'rgba(100, 0, 0, 0.8)';
        options[selectedIndex].style.borderLeft = '4px solid #ff0000';
        options[puzzle.correct].style.backgroundColor = 'rgba(0, 100, 0, 0.8)';
        options[puzzle.correct].style.borderLeft = '4px solid var(--retro-green)';
        
        setTimeout(() => {
            logicNextBtn.style.display = 'block';
        }, 500);
    }
    
    logicScoreElement.textContent = logicScore;
}

function nextLogicPuzzle() {
    currentPuzzle++;
    logicNextBtn.style.display = 'none';
    
    if (currentPuzzle >= logicPuzzles.length) {
        endLogicGame();
    } else {
        loadLogicPuzzle();
    }
}

function endLogicGame() {
    gameActive = false;
    totalScore += logicScore;
    
    let message = "LOGIC COMPLETE!";
    if (logicScore >= 900) {
        message = "MASTER LOGICIAN!";
    } else if (logicScore >= 700) {
        message = "LOGIC EXPERT!";
    }
    
    showScoreScreen(logicScore, message);
}

/* ===================================
   TRAFFIC RULES RACE GAME
   =================================== */

function startTrafficSetup() {
    trafficScore = 0;
    trafficLevel = 1;
    trafficScoreElement.textContent = trafficScore;
    trafficLevelElement.textContent = trafficLevel;
    
    // Create road visualization
    roadElement.innerHTML = '';
    
    // Add lanes
    for (let i = 1; i <= 3; i++) {
        const lane = document.createElement('div');
        lane.className = 'lane';
        lane.style.top = `${i * 50}px`;
        roadElement.appendChild(lane);
    }
    
    // Add traffic light
    const trafficLight = document.createElement('div');
    trafficLight.className = 'traffic-light';
    roadElement.appendChild(trafficLight);
    
    const redLight = document.createElement('div');
    redLight.className = 'light red';
    trafficLight.appendChild(redLight);
    
    const yellowLight = document.createElement('div');
    yellowLight.className = 'light yellow';
    trafficLight.appendChild(yellowLight);
    
    const greenLight = document.createElement('div');
    greenLight.className = 'light green';
    trafficLight.appendChild(greenLight);
    
    // Load first question
    loadTrafficQuestion();
}

function loadTrafficQuestion() {
    const question = trafficQuestions[trafficLevel - 1];
    trafficQuestionElement.textContent = question.question;
    
    // Clear previous options
    trafficOptionsElement.innerHTML = '';
    
    // Create option buttons
    question.options.forEach((option, index) => {
        const button = document.createElement('div');
        button.className = 'option';
        button.textContent = option;
        button.addEventListener('click', () => checkTrafficAnswer(index, question.correct));
        trafficOptionsElement.appendChild(button);
    });
}

function startTrafficGame() {
    gameActive = true;
    trafficStartBtn.style.display = 'none';
    
    // Activate traffic light sequence
    const lights = document.querySelectorAll('.light');
    lights[0].classList.add('active'); // Red light
    
    setTimeout(() => {
        lights[0].classList.remove('active');
        lights[1].classList.add('active'); // Yellow light
        
        setTimeout(() => {
            lights[1].classList.remove('active');
            lights[2].classList.add('active'); // Green light
        }, 1000);
    }, 2000);
}

function checkTrafficAnswer(selectedIndex, correctIndex) {
    if (!gameActive) return;
    
    const options = trafficOptionsElement.querySelectorAll('.option');
    
    // Disable all options
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // Mark correct and incorrect
    if (selectedIndex === correctIndex) {
        options[selectedIndex].style.backgroundColor = 'rgba(0, 100, 0, 0.8)';
        options[selectedIndex].style.borderColor = 'var(--retro-green)';
        trafficScore += 150;
        
        // Add level bonus
        trafficScore += trafficLevel * 25;
        
        trafficScoreElement.textContent = trafficScore;
        
        // Next level
        setTimeout(() => {
            trafficLevel++;
            
            if (trafficLevel > trafficQuestions.length) {
                endTrafficGame();
            } else {
                trafficLevelElement.textContent = trafficLevel;
                loadTrafficQuestion();
                trafficStartBtn.style.display = 'block';
                trafficStartBtn.textContent = 'NEXT LEVEL';
                
                // Reset traffic light
                const lights = document.querySelectorAll('.light');
                lights.forEach(light => light.classList.remove('active'));
            }
        }, 1500);
    } else {
        options[selectedIndex].style.backgroundColor = 'rgba(100, 0, 0, 0.8)';
        options[selectedIndex].style.borderColor = '#ff0000';
        options[correctIndex].style.backgroundColor = 'rgba(0, 100, 0, 0.8)';
        options[correctIndex].style.borderColor = 'var(--retro-green)';
        
        // End game on wrong answer
        setTimeout(() => {
            endTrafficGame();
        }, 1500);
    }
}

function endTrafficGame() {
    gameActive = false;
    totalScore += trafficScore;
    
    let message = "TRAFFIC COMPLETE!";
    if (trafficLevel === trafficQuestions.length + 1) {
        message = "TRAFFIC MASTER!";
    } else if (trafficLevel >= 4) {
        message = "GREAT DRIVER!";
    }
    
    showScoreScreen(trafficScore, message);
}

/* ===================================
   SCORE SCREEN
   =================================== */

function showScoreScreen(score, message) {
    // Hide all screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show score screen
    scoreScreen.classList.add('active');
    
    // Update score screen
    finalScoreElement.textContent = score;
    scoreMessageElement.textContent = message;
    
    // Earn coins based on performance
    if (score >= 1000) {
        coins += 3;
    } else if (score >= 500) {
        coins += 2;
    } else if (score >= 200) {
        coins += 1;
    }
    
    updateUI();
}

function playAgain() {
    scoreScreen.classList.remove('active');
    gameSelectionScreen.classList.add('active');
    gameActive = false;
    playBtn.textContent = 'INSERT COIN & PLAY';
}

/* ===================================
   START APPLICATION
   =================================== */

window.addEventListener('DOMContentLoaded', init);
