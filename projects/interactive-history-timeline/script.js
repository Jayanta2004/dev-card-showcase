document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const eraElements = document.querySelectorAll('.era');
    const factsText = document.getElementById('facts-text');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptions = document.querySelectorAll('.quiz-option');
    const feedbackText = document.getElementById('feedback-text');
    const nextQuestionBtn = document.getElementById('next-question');
    const currentEraSpan = document.getElementById('current-era');
    const progressItems = document.querySelectorAll('.progress-item');
    const factImages = document.querySelectorAll('.fact-image');
    const resetProgressBtn = document.getElementById('reset-progress');
    const toggleAnimationsBtn = document.getElementById('toggle-animations');
    const aboutFeatureBtn = document.getElementById('about-feature');
    const aboutModal = document.getElementById('about-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Data for each era
    const eraData = {
        ancient: {
            name: "Ancient Era",
            color: "#e74c3c",
            facts: [
                "The Ancient Era spans from approximately 3000 BCE to 500 CE.",
                "This period saw the rise of early civilizations like Mesopotamia, Egypt, the Indus Valley, and Ancient China.",
                "The invention of writing systems (cuneiform, hieroglyphics) revolutionized communication and record-keeping.",
                "Major empires included the Roman Empire, Persian Empire, and Maurya Empire in India.",
                "Philosophical traditions flourished in Greece, India, and China with thinkers like Socrates, Confucius, and Buddha.",
                "Architectural marvels like the Pyramids of Giza, the Parthenon, and the Great Wall of China were constructed."
            ],
            quiz: {
                question: "Which ancient civilization is credited with developing the first known writing system?",
                options: [
                    "Ancient Egypt",
                    "Mesopotamia (Sumerians)",
                    "Indus Valley Civilization",
                    "Ancient China"
                ],
                correct: 2,
                explanation: "The Sumerians of Mesopotamia developed cuneiform around 3400-3300 BCE, which is considered the world's first writing system."
            },
            images: [
                "https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            ]
        },
        medieval: {
            name: "Medieval Era",
            color: "#f39c12",
            facts: [
                "The Medieval Era, also known as the Middle Ages, lasted from approximately 500 CE to 1500 CE.",
                "This period began with the fall of the Western Roman Empire and ended with the Renaissance and Age of Discovery.",
                "Feudalism became the dominant social and economic system in Europe, with lords, vassals, and serfs.",
                "Major events included the Crusades, the Black Death, and the signing of the Magna Carta.",
                "The Islamic Golden Age saw significant advances in science, mathematics, and medicine.",
                "Notable medieval empires included the Byzantine Empire, the Holy Roman Empire, and the Mongol Empire."
            ],
            quiz: {
                question: "What devastating pandemic killed an estimated 30-60% of Europe's population in the 14th century?",
                options: [
                    "The Spanish Flu",
                    "The Justinian Plague",
                    "The Black Death",
                    "The Antonine Plague"
                ],
                correct: 3,
                explanation: "The Black Death, caused by the bubonic plague, devastated Europe from 1347 to 1351, killing an estimated 75-200 million people."
            },
            images: [
                "https://images.unsplash.com/photo-1611269154421-4e2d0f3a4dae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1579546929662-711aa81148cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            ]
        },
        modern: {
            name: "Modern Era",
            color: "#27ae60",
            facts: [
                "The Modern Era began around 1500 CE and continues to the present day.",
                "Key developments include the Renaissance, the Scientific Revolution, and the Enlightenment.",
                "The Industrial Revolution transformed economies from agrarian to industrial, starting in Britain in the late 18th century.",
                "Major events include the World Wars, the Cold War, and the Digital Revolution.",
                "This era saw the rise of democracy, human rights movements, and globalization.",
                "Technological advancements like the internet, smartphones, and AI have dramatically changed daily life in recent decades."
            ],
            quiz: {
                question: "Which 18th century revolution is considered the beginning of the modern political era?",
                options: [
                    "The American Revolution",
                    "The French Revolution",
                    "The Industrial Revolution",
                    "The Glorious Revolution"
                ],
                correct: 2,
                explanation: "The French Revolution (1789-1799) established the principles of liberty, equality, and fraternity, and marked the rise of secular democracy in Europe."
            },
            images: [
                "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            ]
        }
    };
    
    // Current state
    let currentEra = null;
    let animationsEnabled = true;
    let userProgress = {
        ancient: 0,
        medieval: 0,
        modern: 0
    };
    let currentQuizIndex = {
        ancient: 0,
        medieval: 0,
        modern: 0
    };
    
    // Load progress from localStorage
    loadProgress();
    
    // Initialize with animations
    setTimeout(() => {
        eraElements.forEach((era, index) => {
            era.classList.add('scroll-in');
            era.style.animationDelay = `${index * 0.2}s`;
        });
    }, 300);
    
    // Era click handlers - with keyboard support
    eraElements.forEach(era => {
        era.addEventListener('click', function() {
            const eraId = this.getAttribute('data-era');
            selectEra(eraId);
        });
        
        era.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const eraId = this.getAttribute('data-era');
                selectEra(eraId);
            }
        });
    });
    
    // Quiz option click handlers
    quizOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (currentEra && !this.classList.contains('disabled')) {
                checkAnswer(parseInt(this.getAttribute('data-option')));
            }
        });
        
        option.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && !this.classList.contains('disabled')) {
                e.preventDefault();
                if (currentEra) {
                    checkAnswer(parseInt(this.getAttribute('data-option')));
                }
            }
        });
    });
    
    // Next question button
    nextQuestionBtn.addEventListener('click', function() {
        if (currentEra) {
            resetQuiz();
            currentQuizIndex[currentEra] = (currentQuizIndex[currentEra] + 1) % eraData[currentEra].facts.length;
            updateQuiz();
        }
    });
    
    // Reset progress button
    resetProgressBtn.addEventListener('click', resetProgress);
    
    // Toggle animations button
    toggleAnimationsBtn.addEventListener('click', toggleAnimations);
    
    // About feature button
    aboutFeatureBtn.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    
    // Close modal button
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Functions
    function selectEra(eraId) {
        currentEra = eraId;
        
        eraElements.forEach(era => {
            era.classList.remove('active');
            if (era.getAttribute('data-era') === eraId) {
                era.classList.add('active');
                era.style.borderColor = eraData[eraId].color;
                // Add visual feedback
                playEraAnimation(era);
            }
        });
        
        // Update era indicator with animation
        currentEraSpan.textContent = eraData[eraId].name;
        currentEraSpan.style.color = eraData[eraId].color;
        currentEraSpan.style.animation = 'none';
        setTimeout(() => {
            currentEraSpan.style.animation = 'badgePulse 0.6s ease-in-out';
        }, 10);
        
        // Update content
        updateFacts();
        updateQuiz();
        updateImages();
        resetQuiz();
    }
    
    function playEraAnimation(era) {
        const marker = era.querySelector('.marker-icon');
        if (marker) {
            marker.style.animation = 'none';
            setTimeout(() => {
                marker.style.animation = 'correctPulse 0.6s ease-out';
            }, 10);
        }
    }
    
    function updateFacts() {
        const facts = eraData[currentEra].facts;
        const randomFact = facts[currentQuizIndex[currentEra]];
        
        factsText.style.animation = 'none';
        factsText.textContent = '';
        
        setTimeout(() => {
            if (animationsEnabled) {
                typeText(factsText, randomFact, 25);
                factsText.style.animation = 'textFadeIn 0.6s ease-out';
            } else {
                factsText.textContent = randomFact;
                factsText.style.animation = 'textFadeIn 0.3s ease-out';
            }
        }, 10);
    }
    
    function updateQuiz() {
        const quiz = eraData[currentEra].quiz;
        
        quizQuestion.style.animation = 'none';
        quizQuestion.textContent = '';
        
        setTimeout(() => {
            quizQuestion.textContent = quiz.question;
            quizQuestion.style.animation = 'textFadeIn 0.6s ease-out';
        }, 10);
        
        quizOptions.forEach((option, index) => {
            option.textContent = quiz.options[index];
            option.classList.remove('correct', 'incorrect', 'disabled');
            option.disabled = false;
            option.style.animation = `cardSlideIn 0.5s ease-out ${0.1 + index * 0.1}s both`;
        });
        
        feedbackText.textContent = "";
        nextQuestionBtn.classList.add('hidden');
    }
    
    function updateImages() {
        const images = eraData[currentEra].images;
        
        factImages.forEach((imgElement, index) => {
            imgElement.style.animation = 'none';
            setTimeout(() => {
                if (images[index]) {
                    imgElement.style.backgroundImage = `url(${images[index]})`;
                    imgElement.style.animation = `cardSlideIn 0.6s ease-out ${0.2 + index * 0.15}s both`;
                } else {
                    imgElement.style.backgroundImage = '';
                    imgElement.style.backgroundColor = '#ddd';
                }
            }, 10);
        });
    }
    
    function checkAnswer(selectedOption) {
        const correctOption = eraData[currentEra].quiz.correct;
        const explanation = eraData[currentEra].quiz.explanation;
        
        // Disable all options
        quizOptions.forEach(option => {
            option.classList.add('disabled');
            option.disabled = true;
        });
        
        // Mark correct and incorrect answers with animation
        quizOptions.forEach(option => {
            const optionNum = parseInt(option.getAttribute('data-option'));
            if (optionNum === correctOption) {
                option.classList.add('correct');
            } else if (optionNum === selectedOption) {
                option.classList.add('incorrect');
            }
        });
        
        // Show feedback with animation
        feedbackText.style.animation = 'none';
        feedbackText.textContent = '';
        
        setTimeout(() => {
            if (selectedOption === correctOption) {
                feedbackText.textContent = `✓ Correct! ${explanation}`;
                feedbackText.style.color = '#27ae60';
                feedbackText.style.animation = 'feedbackFadeIn 0.6s ease-out';
                
                userProgress[currentEra] = Math.min(100, userProgress[currentEra] + 25);
                updateProgressBars();
                saveProgress();
                
                // Add celebration animation
                celebrateCorrectAnswer();
            } else {
                feedbackText.textContent = `✗ Incorrect. ${explanation}`;
                feedbackText.style.color = '#e74c3c';
                feedbackText.style.animation = 'feedbackFadeIn 0.6s ease-out';
            }
        }, 10);
        
        nextQuestionBtn.classList.remove('hidden');
        nextQuestionBtn.style.animation = 'cardSlideIn 0.5s ease-out 0.3s both';
    }
    
    function celebrateCorrectAnswer() {
        // Create celebration effect
        const confettiPieces = 30;
        for (let i = 0; i < confettiPieces; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '999';
            confetti.style.borderRadius = '50%';
            const colors = ['#e74c3c', '#f39c12', '#27ae60', '#3498db'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.opacity = '0.8';
            
            document.body.appendChild(confetti);
            
            const duration = 1.5 + Math.random() * 0.5;
            confetti.animate([
                { transform: 'translateY(0)', opacity: 1 },
                { transform: `translateY(${window.innerHeight}px) rotateZ(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => confetti.remove();
        }
    }
    
    function resetQuiz() {
        quizOptions.forEach(option => {
            option.classList.remove('correct', 'incorrect', 'disabled');
            option.disabled = false;
        });
        
        feedbackText.textContent = "";
        nextQuestionBtn.classList.add('hidden');
    }
    
    function updateProgressBars() {
        progressItems.forEach(item => {
            const eraClass = item.classList[1];
            const era = eraClass.replace('-progress', '');
            const progress = userProgress[era];
            
            item.setAttribute('data-progress', progress);
            const progressFill = item.querySelector('.progress-fill');
            progressFill.style.width = `${progress}%`;
        });
    }
    
    function resetProgress() {
        if (confirm("🔄 Are you sure you want to reset all progress? This action cannot be undone.")) {
            userProgress = {
                ancient: 0,
                medieval: 0,
                modern: 0
            };
            updateProgressBars();
            saveProgress();
            
            feedbackText.textContent = "✓ Progress has been reset!";
            feedbackText.style.color = '#3498db';
            feedbackText.style.animation = 'feedbackFadeIn 0.6s ease-out';
            
            setTimeout(() => {
                if (currentEra) {
                    feedbackText.textContent = "";
                }
            }, 3000);
        }
    }
    
    function toggleAnimations() {
        animationsEnabled = !animationsEnabled;
        toggleAnimationsBtn.innerHTML = animationsEnabled ? 
            '<i class="fas fa-pause-circle"></i> Disable Animations' : 
            '<i class="fas fa-play-circle"></i> Enable Animations';
        
        feedbackText.textContent = animationsEnabled ? 
            "✓ Animations enabled! Enjoy the interactive experience." : 
            "⚡ Animations disabled. Content loads instantly.";
        feedbackText.style.color = '#3498db';
        feedbackText.style.animation = 'feedbackFadeIn 0.6s ease-out';
        
        setTimeout(() => {
            if (currentEra) {
                feedbackText.textContent = "";
            }
        }, 3000);
    }
    
    function closeModal() {
        aboutModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    function typeText(element, text, speed) {
        element.textContent = "";
        element.classList.remove('typing');
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(timer);
                element.classList.add('typing');
            }
        }, speed);
    }
    
    function saveProgress() {
        localStorage.setItem('historyExplorerProgress', JSON.stringify(userProgress));
    }
    
    function loadProgress() {
        const savedProgress = localStorage.getItem('historyExplorerProgress');
        if (savedProgress) {
            userProgress = JSON.parse(savedProgress);
            updateProgressBars();
        }
    }
    
    // Initialize with Ancient era selected
    selectEra('ancient');
    
    // Add interactivity to the fact images
    factImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            if (currentEra) {
                const eraName = eraData[currentEra].name;
                feedbackText.textContent = `📷 Viewing historical artifact from the ${eraName}...`;
                feedbackText.style.color = '#3498db';
                feedbackText.style.animation = 'feedbackFadeIn 0.4s ease-out';
                
                // Add zoom effect
                img.style.animation = 'none';
                setTimeout(() => {
                    img.style.animation = 'correctPulse 0.4s ease-out';
                }, 10);
                
                setTimeout(() => {
                    if (currentEra) {
                        feedbackText.textContent = "";
                    }
                }, 2500);
            }
        });
        
        img.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                img.click();
            }
        });
    });
});