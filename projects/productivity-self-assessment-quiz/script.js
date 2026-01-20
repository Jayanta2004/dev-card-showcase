// Create animated stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    const starsCount = 150;
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random size between 1-3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // Random animation delay
        star.style.animationDelay = `${Math.random() * 5}s`;
        
        starsContainer.appendChild(star);
    }
}

// Quiz data
const quizData = [
    {
        category: "Study Habits",
        question: "How do you typically approach your study sessions?",
        options: [
            { text: "I plan specific topics and stick to a schedule", score: 4 },
            { text: "I study based on urgency and deadlines", score: 3 },
            { text: "I study whenever I find free time", score: 2 },
            { text: "I often cram right before exams", score: 1 }
        ]
    },
    {
        category: "Focus & Concentration",
        question: "How long can you maintain focus on a single task without distraction?",
        options: [
            { text: "90+ minutes with deep focus", score: 4 },
            { text: "45-60 minutes before needing a break", score: 3 },
            { text: "20-30 minutes before getting distracted", score: 2 },
            { text: "Less than 15 minutes consistently", score: 1 }
        ]
    },
    {
        category: "Break Management",
        question: "How do you typically spend your breaks during study sessions?",
        options: [
            { text: "Short, intentional breaks with stretching or walking", score: 4 },
            { text: "Checking social media or quick snacks", score: 3 },
            { text: "Extended breaks that often become procrastination", score: 2 },
            { text: "I rarely take breaks until I'm exhausted", score: 1 }
        ]
    },
    {
        category: "Sleep Patterns",
        question: "How would you describe your sleep schedule?",
        options: [
            { text: "Consistent 7-9 hours, same bedtime/wake time", score: 4 },
            { text: "Enough hours but irregular schedule", score: 3 },
            { text: "Often sleep-deprived due to late nights", score: 2 },
            { text: "Highly irregular, often less than 6 hours", score: 1 }
        ]
    },
    {
        category: "Task Organization",
        question: "How do you organize your tasks and priorities?",
        options: [
            { text: "I use a system (like to-do lists, planners) daily", score: 4 },
            { text: "I make mental notes or simple lists", score: 3 },
            { text: "I remember tasks as they come to mind", score: 2 },
            { text: "I often forget tasks until last minute", score: 1 }
        ]
    },
    {
        category: "Procrastination",
        question: "How often do you find yourself procrastinating?",
        options: [
            { text: "Rarely - I start tasks well ahead of deadlines", score: 4 },
            { text: "Sometimes - but I catch up before it's critical", score: 3 },
            { text: "Often - I frequently work under pressure", score: 2 },
            { text: "Almost always - it's my default approach", score: 1 }
        ]
    },
    {
        category: "Goal Setting",
        question: "How do you approach setting academic or personal goals?",
        options: [
            { text: "I set specific, measurable goals with deadlines", score: 4 },
            { text: "I have general goals I work toward", score: 3 },
            { text: "I have vague ideas but no concrete plans", score: 2 },
            { text: "I don't really set goals, I just go with the flow", score: 1 }
        ]
    },
    {
        category: "Digital Distractions",
        question: "How do you manage digital distractions (social media, phone, etc.)?",
        options: [
            { text: "I use tools/techniques to block distractions during work", score: 4 },
            { text: "I try to resist but sometimes give in", score: 3 },
            { text: "I'm frequently distracted but try to multitask", score: 2 },
            { text: "I'm constantly interrupted by notifications", score: 1 }
        ]
    },
    {
        category: "Energy Management",
        question: "When do you schedule your most challenging tasks?",
        options: [
            { text: "During my peak energy times (I know my rhythm)", score: 4 },
            { text: "When I have the most time available", score: 3 },
            { text: "Whenever they're due soonest", score: 2 },
            { text: "I don't really schedule tasks based on energy", score: 1 }
        ]
    },
    {
        category: "Self-Care & Balance",
        question: "How do you maintain balance between work and relaxation?",
        options: [
            { text: "I intentionally schedule both work and downtime", score: 4 },
            { text: "I take breaks when I feel overwhelmed", score: 3 },
            { text: "I often work until exhausted, then crash", score: 2 },
            { text: "I struggle to stop working or to start when needed", score: 1 }
        ]
    }
];

// Result categories and messages
const resultCategories = [
    {
        name: "Productivity Explorer",
        minScore: 10,
        maxScore: 20,
        message: "You're beginning your productivity journey! There's significant room for improvement in establishing effective habits. The good news is that small changes can make a big difference. Start by focusing on one or two areas where you'd like to improve.",
        color: "#ff6584"
    },
    {
        name: "Developing Strategist",
        minScore: 21,
        maxScore: 28,
        message: "You have some good habits in place but also areas that need refinement. You're on the right track! With some targeted improvements, you can significantly boost your productivity and reduce stress.",
        color: "#ffa500"
    },
    {
        name: "Balanced Achiever",
        minScore: 29,
        maxScore: 34,
        message: "You have solid productivity habits and good self-awareness. Your approach is generally effective, but there might be specific areas where optimization could help you reach peak performance.",
        color: "#36d97f"
    },
    {
        name: "Productivity Master",
        minScore: 35,
        maxScore: 40,
        message: "Excellent! You have strong, well-developed productivity habits. You understand your rhythms and use effective strategies to manage your time and energy. Continue refining and sharing your techniques!",
        color: "#6c63ff"
    }
];

// Improvement tips based on score ranges
const improvementTips = [
    "Try the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break",
    "Establish a consistent sleep schedule, even on weekends",
    "Create a dedicated study space free from distractions",
    "Use a planner or digital app to track tasks and deadlines",
    "Practice saying 'no' to non-essential commitments during study periods",
    "Break large projects into smaller, manageable tasks",
    "Schedule your most challenging work during your peak energy times",
    "Take regular movement breaks to maintain focus and reduce fatigue",
    "Review your goals weekly and adjust as needed",
    "Limit social media use during study sessions with app blockers",
    "Practice mindfulness or meditation to improve concentration",
    "Keep a 'worry list' for distracting thoughts to address later"
];

// Quiz state
let currentQuestion = 0;
let score = 0;
let userAnswers = [];

// DOM elements
const startSection = document.getElementById('start-section');
const questionsSection = document.getElementById('questions-section');
const resultsSection = document.getElementById('results-section');
const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const restartBtn = document.getElementById('restart-btn');
const questionText = document.getElementById('question-text');
const questionCategory = document.getElementById('question-category');
const optionsContainer = document.getElementById('options-container');
const currentQuestionElement = document.getElementById('current-question');
const progressFill = document.getElementById('progress-fill');
const progressPercent = document.getElementById('progress-percent');
const finalScore = document.getElementById('final-score');
const resultCategory = document.getElementById('result-category');
const resultMessage = document.getElementById('result-message');
const tipsList = document.getElementById('tips-list');

// Initialize the quiz
function initQuiz() {
    createStars();
    loadQuestion();
    
    // Event listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    restartBtn.addEventListener('click', restartQuiz);
}

// Start the quiz
function startQuiz() {
    startSection.classList.remove('active');
    questionsSection.classList.add('active');
    updateProgress();
}

// Load current question
function loadQuestion() {
    const question = quizData[currentQuestion];
    
    questionText.textContent = question.question;
    questionCategory.textContent = question.category;
    currentQuestionElement.textContent = currentQuestion + 1;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Create new options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        
        // Check if this option was previously selected
        if (userAnswers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        
        optionElement.innerHTML = `
            <div class="option-icon">${String.fromCharCode(65 + index)}</div>
            <div class="option-text">${option.text}</div>
        `;
        
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });
    
    // Update button states
    prevBtn.disabled = currentQuestion === 0;
    
    // Update progress
    updateProgress();
}

// Select an option
function selectOption(optionIndex) {
    // Remove selected class from all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => option.classList.remove('selected'));
    
    // Add selected class to clicked option
    options[optionIndex].classList.add('selected');
    
    // Store the answer
    userAnswers[currentQuestion] = optionIndex;
}

// Go to next question
function nextQuestion() {
    // Check if an option is selected
    if (userAnswers[currentQuestion] === undefined) {
        alert("Please select an answer before proceeding.");
        return;
    }
    
    // Update score based on selected answer
    const selectedOptionIndex = userAnswers[currentQuestion];
    score += quizData[currentQuestion].options[selectedOptionIndex].score;
    
    // Move to next question or show results
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        loadQuestion();
    } else {
        showResults();
    }
}

// Go to previous question
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        loadQuestion();
    }
}

// Update progress bar
function updateProgress() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = Math.round(progress);
}

// Show results
function showResults() {
    questionsSection.classList.remove('active');
    resultsSection.classList.add('active');
    
    // Calculate final score
    const maxScore = quizData.length * 4;
    const percentage = Math.round((score / maxScore) * 100);
    
    // Animate the score display
    animateValue(finalScore, 0, percentage, 1500);
    
    // Determine result category
    let category = resultCategories[0];
    for (const cat of resultCategories) {
        if (score >= cat.minScore && score <= cat.maxScore) {
            category = cat;
            break;
        }
    }
    
    // Update result category and message
    resultCategory.textContent = category.name;
    resultCategory.style.color = category.color;
    resultMessage.textContent = category.message;
    
    // Generate personalized tips
    generateImprovementTips(percentage);
}

// Animate value counter
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Generate improvement tips based on score
function generateImprovementTips(scorePercentage) {
    tipsList.innerHTML = '';
    
    // Select 4 tips based on score (lower scores get more basic tips)
    let tipIndices = [];
    if (scorePercentage < 50) {
        // Lower score: basic foundational tips
        tipIndices = [0, 1, 2, 3];
    } else if (scorePercentage < 75) {
        // Medium score: intermediate tips
        tipIndices = [2, 4, 6, 8];
    } else {
        // High score: advanced optimization tips
        tipIndices = [5, 7, 9, 10];
    }
    
    // Add the tips to the list
    tipIndices.forEach(index => {
        const tip = improvementTips[index];
        const li = document.createElement('li');
        li.innerHTML = `<span class="tip-icon"><i class="fas fa-star"></i></span> <span>${tip}</span>`;
        tipsList.appendChild(li);
    });
}

// Restart the quiz
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    
    resultsSection.classList.remove('active');
    startSection.classList.add('active');
    
    // Reset result display
    finalScore.textContent = "00";
    resultCategory.textContent = "Calculating...";
    resultMessage.textContent = "Your personalized productivity analysis is being prepared...";
}

// Initialize the quiz when page loads
document.addEventListener('DOMContentLoaded', initQuiz);
