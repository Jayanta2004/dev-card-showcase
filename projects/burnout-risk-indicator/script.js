
        // Create stars in the background
        function createStars() {
            const starsContainer = document.getElementById('stars');
            const starCount = 150;
            
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.classList.add('star');
                
                // Random position and size
                const size = Math.random() * 3;
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                const delay = Math.random() * 3;
                
                star.style.width = `${size}px`;
                star.style.height = `${size}px`;
                star.style.left = `${x}%`;
                star.style.top = `${y}%`;
                star.style.animationDelay = `${delay}s`;
                
                starsContainer.appendChild(star);
            }
        }
        
        // Update slider value displays
        function setupSliders() {
            const sliders = document.querySelectorAll('.slider');
            sliders.forEach(slider => {
                const valueDisplay = document.getElementById(`${slider.id}Value`);
                
                // Set initial value
                updateSliderValue(slider, valueDisplay);
                
                // Update on change
                slider.addEventListener('input', () => {
                    updateSliderValue(slider, valueDisplay);
                });
            });
        }
        
        function updateSliderValue(slider, valueDisplay) {
            if (slider.id === 'screenTime') {
                valueDisplay.textContent = `${slider.value} hrs`;
            } else if (slider.id === 'sleepDuration') {
                valueDisplay.textContent = `${slider.value} hrs`;
            } else {
                valueDisplay.textContent = slider.value;
            }
        }
        
        // Setup break frequency selection
        function setupBreakOptions() {
            const breakOptions = document.querySelectorAll('.break-option');
            breakOptions.forEach(option => {
                option.addEventListener('click', () => {
                    // Remove selected class from all options
                    breakOptions.forEach(opt => opt.classList.remove('selected'));
                    // Add selected class to clicked option
                    option.classList.add('selected');
                });
            });
        }
        
        // Setup stress emoji selection
        function setupStressEmojis() {
            const stressEmojis = document.querySelectorAll('.stress-emoji');
            const stressSlider = document.getElementById('stressLevel');
            
            stressEmojis.forEach(emoji => {
                emoji.addEventListener('click', () => {
                    const level = emoji.getAttribute('data-level');
                    stressSlider.value = level;
                    document.getElementById('stressLevelValue').textContent = level;
                    
                    // Update emoji selection
                    stressEmojis.forEach(e => e.classList.remove('selected'));
                    emoji.classList.add('selected');
                });
            });
            
            // Update emoji selection when slider changes
            stressSlider.addEventListener('input', () => {
                const level = stressSlider.value;
                stressEmojis.forEach(e => e.classList.remove('selected'));
                
                // Find closest emoji to current slider value
                let closestEmoji = null;
                let minDiff = Infinity;
                
                stressEmojis.forEach(e => {
                    const emojiLevel = parseInt(e.getAttribute('data-level'));
                    const diff = Math.abs(emojiLevel - level);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestEmoji = e;
                    }
                });
                
                if (closestEmoji) {
                    closestEmoji.classList.add('selected');
                }
            });
            
            // Initialize with the middle emoji selected
            stressEmojis[2].classList.add('selected');
        }
        
        // Calculate burnout risk
        function calculateBurnoutRisk() {
            // Get values from inputs
            const screenTime = parseInt(document.getElementById('screenTime').value);
            const sleepDuration = parseInt(document.getElementById('sleepDuration').value);
            const stressLevel = parseInt(document.getElementById('stressLevel').value);
            
            // Get break frequency value
            const breakOption = document.querySelector('.break-option.selected');
            const breakFrequency = breakOption.getAttribute('data-value');
            
            // Calculate score (0-100)
            let score = 0;
            
            // Screen time scoring (more time = higher risk)
            if (screenTime <= 4) score += 10;
            else if (screenTime <= 8) score += 30;
            else if (screenTime <= 12) score += 60;
            else score += 80;
            
            // Sleep duration scoring (less sleep = higher risk)
            if (sleepDuration >= 8) score += 10;
            else if (sleepDuration >= 7) score += 20;
            else if (sleepDuration >= 6) score += 40;
            else if (sleepDuration >= 5) score += 60;
            else score += 80;
            
            // Break frequency scoring
            if (breakFrequency === 'frequent') score += 10;
            else if (breakFrequency === 'regular') score += 30;
            else score += 60;
            
            // Stress level scoring
            score += (stressLevel * 4);
            
            // Normalize to 0-100
            score = Math.min(100, Math.max(0, score));
            
            return score;
        }
        
        // Determine risk level based on score
        function getRiskLevel(score) {
            if (score <= 33) return 'low';
            if (score <= 66) return 'moderate';
            return 'high';
        }
        
        // Get result text and description based on risk level
        function getResultDetails(riskLevel) {
            const results = {
                low: {
                    text: "Mission Optimal",
                    description: "Your cosmic energy levels are well-balanced! You're maintaining healthy habits that protect against burnout. Keep up the stellar work!",
                    tips: [
                        "Continue taking regular breaks during work sessions",
                        "Maintain your healthy sleep schedule",
                        "Keep screen time within reasonable limits",
                        "Practice mindfulness or meditation to maintain low stress"
                    ]
                },
                moderate: {
                    text: "Mission Warning",
                    description: "Your cosmic energy is showing some fluctuations. There are areas where you could improve to prevent burnout. Consider adjusting your mission parameters.",
                    tips: [
                        "Try the Pomodoro technique: 25 min work, 5 min break",
                        "Aim for 7-8 hours of sleep per night",
                        "Reduce screen time before bed for better sleep",
                        "Incorporate short walks or stretching into your day",
                        "Practice deep breathing when feeling stressed"
                    ]
                },
                high: {
                    text: "Mission Critical",
                    description: "Warning! Your cosmic energy is depleting rapidly. It's time to prioritize self-care and make changes to avoid burnout. Your mission depends on it!",
                    tips: [
                        "Schedule regular digital detox periods",
                        "Prioritize sleep - aim for 7-9 hours nightly",
                        "Set strict boundaries for work/leisure time",
                        "Consider talking to a professional about stress management",
                        "Incorporate daily physical activity, even just 10-15 minutes",
                        "Practice saying 'no' to non-essential commitments"
                    ]
                }
            };
            
            return results[riskLevel];
        }
        
        // Update astronaut visual based on risk level
        function updateAstronaut(riskLevel) {
            const astronaut = document.getElementById('astronaut');
            
            // Remove all risk classes
            astronaut.classList.remove('healthy', 'warning', 'danger');
            
            // Add appropriate class
            if (riskLevel === 'low') {
                astronaut.classList.add('healthy');
            } else if (riskLevel === 'moderate') {
                astronaut.classList.add('warning');
            } else {
                astronaut.classList.add('danger');
            }
            
            // Add pulse animation
            astronaut.classList.add('pulse');
            
            // Remove pulse after animation completes
            setTimeout(() => {
                astronaut.classList.remove('pulse');
            }, 2000);
        }
        
        // Update tips list
        function updateTips(tips) {
            const tipsList = document.getElementById('tipsList');
            tipsList.innerHTML = '';
            
            tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                tipsList.appendChild(li);
            });
            
            // Show tips section
            document.getElementById('missionTips').style.display = 'block';
        }
        
        // Launch analysis when button is clicked
        function setupAnalysisButton() {
            const launchBtn = document.getElementById('launchBtn');
            
            launchBtn.addEventListener('click', () => {
                // Calculate risk
                const score = calculateBurnoutRisk();
                const riskLevel = getRiskLevel(score);
                const resultDetails = getResultDetails(riskLevel);
                
                // Update result display
                document.getElementById('resultText').textContent = resultDetails.text;
                document.getElementById('resultDescription').textContent = resultDetails.description;
                
                // Update risk meter
                document.getElementById('riskLevel').style.width = `${score}%`;
                
                // Update astronaut
                updateAstronaut(riskLevel);
                
                // Update tips
                updateTips(resultDetails.tips);
                
                // Add some fun visual feedback
                launchBtn.innerHTML = '<i class="fas fa-check"></i> ANALYSIS COMPLETE';
                launchBtn.style.background = 'linear-gradient(90deg, var(--planet-green), var(--astronaut-blue))';
                
                setTimeout(() => {
                    launchBtn.innerHTML = '<i class="fas fa-redo"></i> RE-ANALYZE MISSION';
                    launchBtn.style.background = 'linear-gradient(90deg, var(--nebula-purple), var(--astronaut-blue))';
                }, 3000);
            });
        }
        
        // Initialize everything when page loads
        document.addEventListener('DOMContentLoaded', () => {
            createStars();
            setupSliders();
            setupBreakOptions();
            setupStressEmojis();
            setupAnalysisButton();
        });
    