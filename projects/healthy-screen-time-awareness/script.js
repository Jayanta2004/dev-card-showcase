// Mobile Menu Toggle
document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Screen Time Calculator
document.getElementById('calculateBtn').addEventListener('click', calculateScreenTime);

// Initialize calculator on page load
document.addEventListener('DOMContentLoaded', function() {
    calculateScreenTime();
    setupQuiz();
    setupEffectsExplorer();
    setupChallenges();
});

function calculateScreenTime() {
    const workTime = parseInt(document.getElementById('workScreenTime').value) || 0;
    const leisureTime = parseInt(document.getElementById('leisureScreenTime').value) || 0;
    const socialTime = parseInt(document.getElementById('socialScreenTime').value) || 0;
    
    const totalTime = workTime + leisureTime + socialTime;
    const recommendedTime = 8; // Recommended max for students/developers
    const excessTime = Math.max(0, totalTime - recommendedTime);
    
    // Update display values
    document.getElementById('totalTime').textContent = totalTime;
    document.getElementById('excessTime').textContent = excessTime;
    
    // Calculate and update progress bar
    const percentage = Math.min(100, (totalTime / recommendedTime) * 100);
    document.getElementById('screenTimeProgress').style.width = `${percentage}%`;
    document.getElementById('progressPercentage').textContent = `${Math.round(percentage)}%`;
    
    // Change progress bar color based on percentage
    if (percentage > 100) {
        document.getElementById('screenTimeProgress').style.backgroundColor = 'var(--accent)';
    } else if (percentage > 80) {
        document.getElementById('screenTimeProgress').style.backgroundColor = 'var(--primary-light)';
    } else {
        document.getElementById('screenTimeProgress').style.backgroundColor = 'var(--success)';
    }
    
    // Provide personalized feedback based on screen time
    let feedback = "";
    if (totalTime <= 6) {
        feedback = "Great job! Your screen time is within healthy limits.";
        document.getElementById('recommendedTime').textContent = "✓ Achieved";
    } else if (totalTime <= 8) {
        feedback = "You're close to the recommended limit. Try to reduce leisure screen time.";
        document.getElementById('recommendedTime').textContent = "Nearly There";
    } else {
        feedback = "Your screen time exceeds recommendations. Check our tips section for strategies to reduce it.";
        document.getElementById('recommendedTime').textContent = "Exceeded";
    }
    
    // Show feedback in a subtle way
    const calculatorCard = document.querySelector('#calculator .dashboard-card');
    calculatorCard.style.borderLeft = `5px solid ${totalTime <= 8 ? 'var(--success)' : 'var(--accent)'}`;
}

// Effects Explorer
function setupEffectsExplorer() {
    const effectCards = document.querySelectorAll('.effect-card');
    const effectDetail = document.getElementById('effect-detail');
    
    const effectDetails = {
        'eye-strain': {
            title: 'Eye Strain & Digital Fatigue',
            content: '<p>Staring at screens for prolonged periods causes digital eye strain, characterized by dry eyes, headaches, blurred vision, and neck/shoulder pain. The high-energy visible blue light emitted by screens contributes to these symptoms and may cause long-term retinal damage.</p><p><strong>Prevention:</strong> Follow the 20-20-20 rule (every 20 minutes, look at something 20 feet away for 20 seconds), adjust screen brightness, and use blue light filters.</p>'
        },
        'sleep': {
            title: 'Sleep Disruption',
            content: '<p>Blue light from screens suppresses melatonin production, the hormone that regulates sleep-wake cycles. This can lead to difficulty falling asleep, reduced sleep quality, and daytime fatigue.</p><p><strong>Prevention:</strong> Avoid screens 1-2 hours before bedtime, use night mode settings, and consider wearing blue light blocking glasses in the evening.</p>'
        },
        'posture': {
            title: 'Poor Posture & Musculoskeletal Issues',
            content: '<p>Prolonged screen use often leads to poor ergonomics, resulting in "tech neck," back pain, and repetitive strain injuries. Constantly looking down at devices puts extra pressure on the cervical spine.</p><p><strong>Prevention:</strong> Maintain proper ergonomics (screen at eye level, feet flat on floor), take frequent breaks to stretch, and strengthen core muscles.</p>'
        },
        'focus': {
            title: 'Reduced Focus & Attention Span',
            content: '<p>Constant digital multitasking and notification interruptions can reduce attention span, impair memory formation, and decrease productivity. The brain becomes conditioned to seek constant stimulation.</p><p><strong>Prevention:</strong> Practice single-tasking, use focus timers (like Pomodoro technique), and schedule dedicated deep work periods without interruptions.</p>'
        }
    };
    
    effectCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            effectCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Get effect type from data attribute
            const effectType = this.getAttribute('data-effect');
            
            // Update effect detail section
            if (effectDetails[effectType]) {
                effectDetail.innerHTML = `
                    <h4>${effectDetails[effectType].title}</h4>
                    ${effectDetails[effectType].content}
                `;
                
                // Add fade-in animation
                effectDetail.style.animation = 'none';
                setTimeout(() => {
                    effectDetail.style.animation = 'fadeIn 0.5s ease forwards';
                }, 10);
            }
        });
    });
}

// Quiz Functionality
function setupQuiz() {
    const quizOptions = document.querySelectorAll('.quiz-option');
    const submitBtn = document.getElementById('submitQuizBtn');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const quizResults = document.getElementById('quizResults');
    
    // Initialize all options
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from siblings
            const siblings = this.parentElement.querySelectorAll('.quiz-option');
            siblings.forEach(sibling => sibling.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
        });
    });
    
    // Submit quiz button
    submitBtn.addEventListener('click', function() {
        let score = 0;
        const selectedOptions = document.querySelectorAll('.quiz-option.selected');
        
        if (selectedOptions.length < 2) {
            alert('Please answer all questions before submitting.');
            return;
        }
        
        // Calculate score
        selectedOptions.forEach(option => {
            score += parseInt(option.getAttribute('data-value'));
        });
        
        // Update results display
        document.getElementById('quizScore').textContent = score;
        
        // Calculate percentage
        const percentage = Math.round((score / 6) * 100);
        document.getElementById('wellnessPercentage').textContent = `${percentage}%`;
        document.getElementById('wellnessProgress').style.width = `${percentage}%`;
        
        // Provide feedback based on score
        let feedback = '';
        if (score >= 5) {
            feedback = 'Excellent! You have very healthy screen-time habits. Keep up the good work and consider sharing your strategies with others.';
            document.getElementById('wellnessProgress').style.backgroundColor = 'var(--success)';
        } else if (score >= 3) {
            feedback = 'You have moderately healthy habits. There are some areas for improvement. Check our tips section for strategies to enhance your digital well-being.';
            document.getElementById('wellnessProgress').style.backgroundColor = 'var(--primary-light)';
        } else {
            feedback = 'Your screen-time habits need attention. Excessive screen time can impact your health and productivity. Explore our tips and challenges to develop healthier digital habits.';
            document.getElementById('wellnessProgress').style.backgroundColor = 'var(--accent)';
        }
        
        document.getElementById('quizFeedback').textContent = feedback;
        
        // Show results with animation
        quizResults.style.display = 'block';
        quizResults.style.animation = 'fadeIn 0.8s ease forwards';
        
        // Scroll to results
        quizResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
    // Start quiz button in hero section
    startQuizBtn.addEventListener('click', function() {
        document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
    });
}

// Challenge Tracker
function setupChallenges() {
    const challengeCheckboxes = document.querySelectorAll('.challenge-checkbox');
    const completedChallengesElement = document.getElementById('completedChallenges');
    const challengeProgressBar = document.getElementById('challengeProgress');
    
    challengeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            const challenge = this.closest('.challenge');
            
            // Toggle completion state
            if (challenge.classList.contains('completed')) {
                challenge.classList.remove('completed');
            } else {
                challenge.classList.add('completed');
                
                // Add completion animation
                this.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    this.style.animation = '';
                }, 500);
            }
            
            // Update progress
            updateChallengeProgress();
        });
    });
    
    function updateChallengeProgress() {
        const completedChallenges = document.querySelectorAll('.challenge.completed').length;
        const totalChallenges = document.querySelectorAll('.challenge').length;
        const percentage = (completedChallenges / totalChallenges) * 100;
        
        completedChallengesElement.textContent = completedChallenges;
        challengeProgressBar.style.width = `${percentage}%`;
        
        // Change color based on progress
        if (percentage >= 70) {
            challengeProgressBar.style.backgroundColor = 'var(--success)';
        } else if (percentage >= 40) {
            challengeProgressBar.style.backgroundColor = 'var(--primary)';
        } else {
            challengeProgressBar.style.backgroundColor = 'var(--accent)';
        }
    }
    
    // Initialize progress
    updateChallengeProgress();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                document.querySelector('.nav-links').style.display = 'none';
            }
            
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add fade-in animation to cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe all dashboard cards
document.querySelectorAll('.dashboard-card').forEach(card => {
    observer.observe(card);
});
