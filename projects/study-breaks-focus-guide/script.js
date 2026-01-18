// Timer functionality
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startTimer');
const pauseBtn = document.getElementById('pauseTimer');
const resetBtn = document.getElementById('resetTimer');
const shortBreakBtn = document.getElementById('shortBreak');
const longBreakBtn = document.getElementById('longBreak');
const progressRing = document.querySelector('.progress-ring-circle');

let timer;
let isRunning = false;
let timeLeft = 25 * 60; // 25 minutes in seconds
let totalTime = 25 * 60;
let isBreak = false;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress ring
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (timeLeft / totalTime) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

function startTimer() {
    if (isRunning) return;
    
    isRunning = true;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Running...';
    startBtn.disabled = true;
    
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            isRunning = false;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Focus Session';
            startBtn.disabled = false;
            
            // Play notification sound
            playNotification();
            
            // Show alert
            if (isBreak) {
                alert("Break time is over! Time to get back to work.");
                setFocusTime();
            } else {
                alert("Time's up! Take a break.");
                setShortBreak();
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timer);
    isRunning = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    startBtn.disabled = false;
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Start Focus Session';
    startBtn.disabled = false;
    
    if (isBreak) {
        setShortBreak();
    } else {
        setFocusTime();
    }
}

function setFocusTime() {
    isBreak = false;
    timeLeft = 25 * 60;
    totalTime = 25 * 60;
    updateDisplay();
    document.querySelector('.timer-header h2').innerHTML = '<i class="fas fa-clock"></i> Focus Time';
    document.querySelector('.timer-header p').textContent = 'Work for 25 minutes, then take a 5-minute break.';
}

function setShortBreak() {
    isBreak = true;
    timeLeft = 5 * 60;
    totalTime = 5 * 60;
    updateDisplay();
    document.querySelector('.timer-header h2').innerHTML = '<i class="fas fa-coffee"></i> Short Break';
    document.querySelector('.timer-header p').textContent = 'Take a 5-minute break to recharge.';
}

function setLongBreak() {
    isBreak = true;
    timeLeft = 15 * 60;
    totalTime = 15 * 60;
    updateDisplay();
    document.querySelector('.timer-header h2').innerHTML = '<i class="fas fa-utensils"></i> Long Break';
    document.querySelector('.timer-header p').textContent = 'Take a 15-minute break after completing 4 focus sessions.';
}

function playNotification() {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

// Event listeners for timer
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
shortBreakBtn.addEventListener('click', setShortBreak);
longBreakBtn.addEventListener('click', setLongBreak);

// Tab functionality
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show active tab content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${tabId}-tab`) {
                content.classList.add('active');
            }
        });
    });
});

// Card entrance animation
const cards = document.querySelectorAll('.card');

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

cards.forEach(card => {
    observer.observe(card);
});

// Initialize display
updateDisplay();
