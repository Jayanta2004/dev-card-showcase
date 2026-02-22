        const moodDatabase = {
            happy: {
                emoji: '😊',
                colors: ['#FFD700', '#FFA500', '#FF69B4'],
                quote: 'Happiness is not something ready-made. It comes from your own actions.',
                energy: 90,
                calm: 60,
                creativity: 80
            },
            calm: {
                emoji: '😌',
                colors: ['#87CEEB', '#98FB98', '#DDA0DD'],
                quote: 'Calmness is the cradle of power.',
                energy: 30,
                calm: 95,
                creativity: 70
            },
            energetic: {
                emoji: '⚡',
                colors: ['#FF4500', '#FF8C00', '#FFD700'],
                quote: 'Energy and persistence conquer all things.',
                energy: 95,
                calm: 20,
                creativity: 85
            },
            dreamy: {
                emoji: '🌙',
                colors: ['#4B0082', '#8A2BE2', '#9370DB'],
                quote: 'Dream as if you\'ll live forever, live as if you\'ll die today.',
                energy: 40,
                calm: 80,
                creativity: 95
            },
            ocean: {
                emoji: '🌊',
                colors: ['#006994', '#40E0D0', '#7FFFD4'],
                quote: 'Be like water, my friend.',
                energy: 60,
                calm: 85,
                creativity: 75
            },
            sunset: {
                emoji: '🌅',
                colors: ['#FF6B6B', '#FFE66D', '#FF8C42'],
                quote: 'Every sunset brings the promise of a new dawn.',
                energy: 70,
                calm: 75,
                creativity: 90
            },
            mysterious: {
                emoji: '🌫️',
                colors: ['#2C3E50', '#8E44AD', '#34495E'],
                quote: 'The most beautiful thing we can experience is the mysterious.',
                energy: 50,
                calm: 70,
                creativity: 85
            },
            romantic: {
                emoji: '❤️',
                colors: ['#FF1493', '#FF69B4', '#FFB6C1'],
                quote: 'Love is composed of a single soul inhabiting two bodies.',
                energy: 75,
                calm: 65,
                creativity: 80
            }
        };

        function analyzeMood() {
            const input = document.getElementById('moodInput').value.toLowerCase();
            
            if (!input) {
                alert('Please describe your mood first!');
                return;
            }

            // Simple mood analysis based on keywords
            let detectedMoods = [];
            let primaryMood = null;

            // Check for mood keywords
            for (let [mood, data] of Object.entries(moodDatabase)) {
                if (input.includes(mood)) {
                    detectedMoods.push({mood, ...data});
                    if (!primaryMood) primaryMood = mood;
                }
            }

            // If no direct match, do fuzzy matching
            if (detectedMoods.length === 0) {
                const words = input.split(' ');
                for (let word of words) {
                    for (let [mood, data] of Object.entries(moodDatabase)) {
                        if (mood.includes(word) || word.includes(mood)) {
                            detectedMoods.push({mood, ...data});
                            if (!primaryMood) primaryMood = mood;
                            break;
                        }
                    }
                }
            }

            // If still no match, assign random mood
            if (detectedMoods.length === 0) {
                const moods = Object.keys(moodDatabase);
                primaryMood = moods[Math.floor(Math.random() * moods.length)];
                detectedMoods = [{
                    mood: primaryMood,
                    ...moodDatabase[primaryMood]
                }];
            }

            // Add complementary moods
            if (detectedMoods.length === 1) {
                const complementaryMoods = getComplementaryMoods(primaryMood);
                complementaryMoods.forEach(mood => {
                    if (!detectedMoods.find(m => m.mood === mood)) {
                        detectedMoods.push({
                            mood: mood,
                            ...moodDatabase[mood]
                        });
                    }
                });
            }

            // Limit to 3 moods
            detectedMoods = detectedMoods.slice(0, 3);
            
            renderMoodBoard(detectedMoods);
            updateCurrentMood(detectedMoods[0]);
            generateSuggestions(input);
        }

        function getComplementaryMoods(mood) {
            const moodPairs = {
                happy: ['energetic', 'romantic'],
                calm: ['dreamy', 'ocean'],
                energetic: ['happy', 'sunset'],
                dreamy: ['mysterious', 'calm'],
                ocean: ['calm', 'mysterious'],
                sunset: ['romantic', 'happy'],
                mysterious: ['dreamy', 'ocean'],
                romantic: ['sunset', 'happy']
            };
            return moodPairs[mood] || ['calm', 'happy'];
        }

        function renderMoodBoard(moods) {
            const board = document.getElementById('moodBoard');
            
            board.innerHTML = moods.map(mood => `
                <div class="mood-card" onclick="selectMood('${mood.mood}')">
                    <div class="mood-emoji">${mood.emoji}</div>
                    <div class="mood-title">${mood.mood.charAt(0).toUpperCase() + mood.mood.slice(1)}</div>
                    <div class="mood-colors">
                        ${mood.colors.map(color => 
                            `<div class="color-dot" style="background: ${color}"></div>`
                        ).join('')}
                    </div>
                    <div class="mood-quote">"${mood.quote}"</div>
                </div>
            `).join('');
        }

        function selectMood(mood) {
            updateCurrentMood({
                mood,
                ...moodDatabase[mood]
            });
        }

        function updateCurrentMood(mood) {
            // Update sphere color with gradient
            const sphere = document.getElementById('moodSphere');
            const gradient = `linear-gradient(135deg, ${mood.colors[0]}, ${mood.colors[1]})`;
            sphere.style.background = gradient;

            // Update metrics
            document.getElementById('energyFill').style.width = `${mood.energy}%`;
            document.getElementById('calmFill').style.width = `${mood.calm}%`;
            document.getElementById('creativityFill').style.width = `${mood.creativity}%`;

            // Animate sphere
            sphere.style.animation = 'none';
            sphere.offsetHeight; // Trigger reflow
            sphere.style.animation = 'pulse 3s infinite';
        }

        function generateSuggestions(input) {
            const suggestions = [
                'Play some lo-fi music',
                'Take a deep breath',
                'Write in your journal',
                'Go for a walk',
                'Call a friend',
                'Draw something',
                'Meditate for 5 minutes',
                'Drink some water',
                'Stretch your body',
                'Listen to ocean sounds'
            ];

            // Shuffle and pick 4 random suggestions
            const shuffled = suggestions.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 4);

            const suggestionsContainer = document.getElementById('suggestions');
            suggestionsContainer.innerHTML = selected.map(suggestion => 
                `<div class="suggestion-chip" onclick="alert('Great idea! ${suggestion}')">${suggestion}</div>`
            ).join('');
        }

        // Add some example moods as placeholders
        const exampleMoods = ['happy', 'calm', 'energetic'];
        renderMoodBoard(exampleMoods.map(mood => ({
            mood,
            ...moodDatabase[mood]
        })));

        // Allow Enter key to submit
        document.getElementById('moodInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                analyzeMood();
            }
        });

        // Add floating particles effect
        function createParticles() {
            const container = document.querySelector('.mood-container');
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.style.position = 'absolute';
                particle.style.width = '5px';
                particle.style.height = '5px';
                particle.style.background = 'rgba(255, 255, 255, 0.3)';
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animation = `float ${5 + Math.random() * 10}s infinite`;
                particle.style.animationDelay = Math.random() * 5 + 's';
                container.appendChild(particle);
            }
        }

        // Add float animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% {
                    transform: translateY(0) translateX(0);
                    opacity: 0.3;
                }
                25% {
                    transform: translateY(-20px) translateX(10px);
                    opacity: 0.6;
                }
                50% {
                    transform: translateY(-30px) translateX(-10px);
                    opacity: 0.8;
                }
                75% {
                    transform: translateY(-20px) translateX(10px);
                    opacity: 0.6;
                }
            }
        `;
        document.head.appendChild(style);

        // Initialize particles
        createParticles();