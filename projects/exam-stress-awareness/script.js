// Create twinkling stars in background
function createStars() {
    const starsCount = 100;
    const body = document.body;
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random size between 1-3px
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random position
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        
        // Random animation delay
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        body.appendChild(star);
    }
}

// Planet click interaction
const planets = document.querySelectorAll('.planet');
planets.forEach(planet => {
    planet.addEventListener('click', () => {
        // Close other planets
        planets.forEach(p => {
            if (p !== planet && p.classList.contains('active')) {
                p.classList.remove('active');
            }
        });
        
        // Toggle current planet
        planet.classList.toggle('active');
    });
});

// Breathing exercise
const breathingCircle = document.querySelector('.breathing-circle');
const breathText = document.querySelector('.breath-text');
const startButton = document.getElementById('startBreathing');

let breathingActive = false;
let breathStep = 0;
let breathInterval;

const breathSteps = [
    { text: "INHALE (4)", duration: 4000 },
    { text: "HOLD (7)", duration: 7000 },
    { text: "EXHALE (8)", duration: 8000 },
    { text: "HOLD (4)", duration: 4000 }
];

function startBreathing() {
    if (breathingActive) {
        clearInterval(breathInterval);
        startButton.textContent = "Start Breathing Exercise";
        breathText.textContent = "INHALE (4)";
        breathingActive = false;
        return;
    }
    
    breathingActive = true;
    startButton.textContent = "Stop Breathing Exercise";
    breathStep = 0;
    
    breathText.textContent = breathSteps[0].text;
    
    breathInterval = setInterval(() => {
        breathStep = (breathStep + 1) % breathSteps.length;
        breathText.textContent = breathSteps[breathStep].text;
    }, 19000); // Total cycle duration
    
    // Visual feedback
    breathingCircle.style.animation = "breathe 8s infinite ease-in-out";
}

startButton.addEventListener('click', startBreathing);

// Stress checker
const stressItems = document.querySelectorAll('.stress-item');
const checkerResult = document.getElementById('checkerResult');
let selectedSymptoms = [];

stressItems.forEach(item => {
    item.addEventListener('click', () => {
        const symptom = item.getAttribute('data-value');
        
        if (item.classList.contains('selected')) {
            item.classList.remove('selected');
            selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        } else {
            item.classList.add('selected');
            selectedSymptoms.push(symptom);
        }
        
        updateResultMessage();
    });
});

function updateResultMessage() {
    const count = selectedSymptoms.length;
    
    if (count === 0) {
        checkerResult.textContent = "Select any symptoms you're experiencing.";
        checkerResult.style.color = "var(--text-light)";
    } else if (count <= 2) {
        checkerResult.textContent = "Mild stress indicators. Try the breathing exercise above.";
        checkerResult.style.color = "var(--calm-green)";
    } else if (count <= 4) {
        checkerResult.textContent = "Moderate stress. Consider talking to someone and using the 'Emergency Boosters'.";
        checkerResult.style.color = "var(--star-yellow)";
    } else {
        checkerResult.textContent = "Higher stress levels. Please reach out to a counselor or trusted adult.";
        checkerResult.style.color = "var(--comet-pink)";
    }
}

// Auto-open first planet on load
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    document.getElementById('planet1').classList.add('active');
});
