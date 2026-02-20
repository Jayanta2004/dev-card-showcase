        // Game Data
        const gameData = {
            player: {
                name: "Valiant Knight",
                hp: 100,
                maxHp: 100,
                level: 1,
                xp: 0,
                xpToNextLevel: 50,
                attack: 10,
                defense: 8,
                questionsAnswered: 0
            },
            
            monster: null,
            
            monsters: [
                {
                    name: "Goblin",
                    icon: "fas fa-ghost",
                    baseHp: 50,
                    baseAttack: 8,
                    baseDefense: 3,
                    difficulty: "Easy",
                    questionsToDefeat: 3,
                    xpReward: 20
                },
                {
                    name: "Orc",
                    icon: "fas fa-user-injured",
                    baseHp: 80,
                    baseAttack: 12,
                    baseDefense: 5,
                    difficulty: "Medium",
                    questionsToDefeat: 5,
                    xpReward: 35
                },
                {
                    name: "Dragon",
                    icon: "fas fa-dragon",
                    baseHp: 120,
                    baseAttack: 18,
                    baseDefense: 8,
                    difficulty: "Hard",
                    questionsToDefeat: 7,
                    xpReward: 60
                },
                {
                    name: "Lich",
                    icon: "fas fa-skull",
                    baseHp: 150,
                    baseAttack: 22,
                    baseDefense: 10,
                    difficulty: "Expert",
                    questionsToDefeat: 10,
                    xpReward: 100
                }
            ],
            
            currentQuestions: [],
            currentCorrectAnswer: null,
            gameActive: false,
            currentQuestionIndex: 0,
            questionsRemaining: 0
        };
        
        // Quiz Questions
        const quizQuestions = [
            {
                question: "What is the capital of France?",
                answers: ["London", "Berlin", "Paris", "Madrid"],
                correct: 2
            },
            {
                question: "Which planet is known as the Red Planet?",
                answers: ["Venus", "Mars", "Jupiter", "Saturn"],
                correct: 1
            },
            {
                question: "What is the largest mammal in the world?",
                answers: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
                correct: 1
            },
            {
                question: "Which element has the chemical symbol 'O'?",
                answers: ["Gold", "Oxygen", "Osmium", "Oganesson"],
                correct: 1
            },
            {
                question: "Who painted the Mona Lisa?",
                answers: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
                correct: 1
            },
            {
                question: "What is the smallest country in the world?",
                answers: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
                correct: 1
            },
            {
                question: "Which programming language is known as the language of the web?",
                answers: ["Python", "Java", "JavaScript", "C++"],
                correct: 2
            },
            {
                question: "What is the fastest land animal?",
                answers: ["Lion", "Cheetah", "Pronghorn Antelope", "Quarter Horse"],
                correct: 1
            },
            {
                question: "Which year did World War II end?",
                answers: ["1943", "1945", "1947", "1950"],
                correct: 1
            },
            {
                question: "What is the hardest natural substance on Earth?",
                answers: ["Gold", "Iron", "Diamond", "Platinum"],
                correct: 2
            },
            {
                question: "How many continents are there?",
                answers: ["5", "6", "7", "8"],
                correct: 2
            },
            {
                question: "Which planet is closest to the Sun?",
                answers: ["Venus", "Mercury", "Earth", "Mars"],
                correct: 1
            },
            {
                question: "What is the largest ocean on Earth?",
                answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
                correct: 3
            },
            {
                question: "Who wrote 'Romeo and Juliet'?",
                answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                correct: 1
            },
            {
                question: "What is the square root of 64?",
                answers: ["6", "7", "8", "9"],
                correct: 2
            }
        ];
        
        // DOM Elements
        const playerNameEl = document.getElementById('player-name');
        const playerHpEl = document.getElementById('player-hp');
        const playerHealthBarEl = document.getElementById('player-health-bar');
        const playerLevelEl = document.getElementById('player-level');
        const playerXpEl = document.getElementById('player-xp');
        const playerAttackEl = document.getElementById('player-attack');
        const playerDefenseEl = document.getElementById('player-defense');
        const questionsAnsweredEl = document.getElementById('questions-answered');
        
        const monsterNameEl = document.getElementById('monster-name');
        const monsterIconEl = document.getElementById('monster-icon');
        const monsterHpEl = document.getElementById('monster-hp');
        const monsterHealthBarEl = document.getElementById('monster-health-bar');
        const monsterLevelEl = document.getElementById('monster-level');
        const monsterAttackEl = document.getElementById('monster-attack');
        const monsterDefenseEl = document.getElementById('monster-defense');
        const questionsRemainingEl = document.getElementById('questions-remaining');
        const monsterDifficultyEl = document.getElementById('monster-difficulty');
        
        const questionTextEl = document.getElementById('question-text');
        const answersContainerEl = document.getElementById('answers-container');
        const actionBtnEl = document.getElementById('action-btn');
        const logEntriesEl = document.getElementById('log-entries');
        
        // Initialize the game
        function initGame() {
            updatePlayerUI();
            actionBtnEl.addEventListener('click', handleActionButton);
        }
        
        // Update player UI
        function updatePlayerUI() {
            const p = gameData.player;
            playerNameEl.textContent = p.name;
            playerHpEl.textContent = p.hp;
            playerHealthBarEl.style.width = `${(p.hp / p.maxHp) * 100}%`;
            playerLevelEl.textContent = p.level;
            playerXpEl.textContent = `${p.xp}/${p.xpToNextLevel}`;
            playerAttackEl.textContent = p.attack;
            playerDefenseEl.textContent = p.defense;
            questionsAnsweredEl.textContent = p.questionsAnswered;
        }
        
        // Update monster UI
        function updateMonsterUI() {
            if (!gameData.monster) return;
            
            const m = gameData.monster;
            monsterNameEl.textContent = m.name;
            monsterIconEl.className = m.icon;
            monsterHpEl.textContent = m.hp;
            monsterHealthBarEl.style.width = `${(m.hp / m.maxHp) * 100}%`;
            monsterLevelEl.textContent = m.level;
            monsterAttackEl.textContent = m.attack;
            monsterDefenseEl.textContent = m.defense;
            questionsRemainingEl.textContent = gameData.questionsRemaining;
            monsterDifficultyEl.textContent = m.difficulty;
        }
        
        // Create a new monster
        function createNewMonster() {
            // Select a random monster from the list
            const monsterTemplate = gameData.monsters[Math.floor(Math.random() * gameData.monsters.length)];
            
            // Scale monster stats based on player level
            const levelMultiplier = 1 + (gameData.player.level - 1) * 0.3;
            
            gameData.monster = {
                name: monsterTemplate.name,
                icon: monsterTemplate.icon,
                hp: Math.floor(monsterTemplate.baseHp * levelMultiplier),
                maxHp: Math.floor(monsterTemplate.baseHp * levelMultiplier),
                level: gameData.player.level,
                attack: Math.floor(monsterTemplate.baseAttack * levelMultiplier),
                defense: Math.floor(monsterTemplate.baseDefense * levelMultiplier),
                difficulty: monsterTemplate.difficulty,
                questionsToDefeat: monsterTemplate.questionsToDefeat,
                xpReward: Math.floor(monsterTemplate.xpReward * levelMultiplier)
            };
            
            gameData.questionsRemaining = gameData.monster.questionsToDefeat;
            
            // Log monster appearance
            addLogEntry(`A level ${gameData.monster.level} ${gameData.monster.name} appears!`, "monster");
            addLogEntry(`Defeat it by answering ${gameData.monster.questionsToDefeat} questions correctly!`, "info");
            
            updateMonsterUI();
        }
        
        // Start a new battle
        function startBattle() {
            if (gameData.player.hp <= 0) {
                addLogEntry("You need to heal before starting a new battle!", "info");
                return;
            }
            
            createNewMonster();
            gameData.gameActive = true;
            gameData.currentQuestionIndex = 0;
            
            // Prepare questions for this battle
            prepareQuestions();
            
            // Show first question
            showQuestion();
            
            // Update UI
            actionBtnEl.textContent = "Next Question";
            actionBtnEl.disabled = true;
            
            addLogEntry("Battle started! Answer the question to attack the monster!", "info");
        }
        
        // Prepare questions for the current battle
        function prepareQuestions() {
            // Shuffle questions
            const shuffledQuestions = [...quizQuestions].sort(() => Math.random() - 0.5);
            
            // Select questions for this battle
            gameData.currentQuestions = shuffledQuestions.slice(0, gameData.monster.questionsToDefeat);
        }
        
        // Show the current question
        function showQuestion() {
            if (gameData.currentQuestionIndex >= gameData.currentQuestions.length) {
                // All questions answered, monster defeated
                defeatMonster();
                return;
            }
            
            const question = gameData.currentQuestions[gameData.currentQuestionIndex];
            questionTextEl.textContent = question.question;
            gameData.currentCorrectAnswer = question.correct;
            
            // Clear previous answers
            answersContainerEl.innerHTML = "";
            
            // Create answer buttons
            question.answers.forEach((answer, index) => {
                const button = document.createElement('button');
                button.className = 'answer-btn';
                button.textContent = answer;
                button.addEventListener('click', () => handleAnswerClick(index));
                answersContainerEl.appendChild(button);
            });
            
            // Update UI
            questionsRemainingEl.textContent = gameData.questionsRemaining;
        }
        
        // Handle answer click
        function handleAnswerClick(answerIndex) {
            if (!gameData.gameActive) return;
            
            const answerButtons = document.querySelectorAll('.answer-btn');
            const isCorrect = answerIndex === gameData.currentCorrectAnswer;
            
            // Disable all answer buttons
            answerButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.pointerEvents = 'none';
            });
            
            // Highlight correct and incorrect answers
            answerButtons[gameData.currentCorrectAnswer].classList.add('correct');
            if (!isCorrect) {
                answerButtons[answerIndex].classList.add('incorrect');
            }
            
            // Process the answer
            if (isCorrect) {
                // Player attacks monster
                const damage = calculateDamage(gameData.player.attack, gameData.monster.defense);
                gameData.monster.hp -= damage;
                gameData.monster.hp = Math.max(0, gameData.monster.hp);
                
                // Show damage effect
                showDamageEffect(monsterIconEl, `-${damage}`, "#ff6b6b");
                
                // Update stats
                gameData.player.questionsAnswered++;
                gameData.questionsRemaining--;
                
                // Log the result
                addLogEntry(`Correct! You hit the ${gameData.monster.name} for ${damage} damage!`, "player");
                
                // Check if monster is defeated
                if (gameData.monster.hp <= 0) {
                    defeatMonster();
                    return;
                }
            } else {
                // Monster attacks player
                const damage = calculateDamage(gameData.monster.attack, gameData.player.defense);
                gameData.player.hp -= damage;
                gameData.player.hp = Math.max(0, gameData.player.hp);
                
                // Show damage effect
                showDamageEffect(document.querySelector('.player-icon'), `-${damage}`, "#4bcffa");
                
                // Log the result
                addLogEntry(`Wrong answer! The ${gameData.monster.name} hits you for ${damage} damage!`, "monster");
                
                // Check if player is defeated
                if (gameData.player.hp <= 0) {
                    gameOver();
                    return;
                }
            }
            
            // Move to next question
            gameData.currentQuestionIndex++;
            
            // Update UI
            updatePlayerUI();
            updateMonsterUI();
            
            // Enable next question button
            actionBtnEl.disabled = false;
            actionBtnEl.textContent = "Next Question";
        }
        
        // Calculate damage
        function calculateDamage(attack, defense) {
            const baseDamage = Math.max(1, attack - defense);
            const variance = Math.floor(Math.random() * 5);
            return baseDamage + variance;
        }
        
        // Show damage effect animation
        function showDamageEffect(element, text, color) {
            const damageEl = document.createElement('div');
            damageEl.className = 'damage-effect';
            damageEl.textContent = text;
            damageEl.style.color = color;
            damageEl.style.left = `${element.getBoundingClientRect().left + element.offsetWidth/2}px`;
            damageEl.style.top = `${element.getBoundingClientRect().top}px`;
            
            document.body.appendChild(damageEl);
            
            // Remove element after animation
            setTimeout(() => {
                damageEl.remove();
            }, 1500);
        }
        
        // Handle action button click
        function handleActionButton() {
            if (!gameData.gameActive) {
                // Start a new battle
                startBattle();
            } else {
                // Show next question
                actionBtnEl.disabled = true;
                showQuestion();
            }
        }
        
        // Defeat the monster
        function defeatMonster() {
            if (!gameData.monster) return;
            
            // Award XP
            const xpReward = gameData.monster.xpReward;
            gameData.player.xp += xpReward;
            
            // Log victory
            addLogEntry(`You defeated the ${gameData.monster.name}!`, "player");
            addLogEntry(`You gained ${xpReward} XP!`, "info");
            
            // Check for level up
            checkLevelUp();
            
            // Reset for next battle
            gameData.monster = null;
            gameData.gameActive = false;
            gameData.currentQuestionIndex = 0;
            
            // Update UI
            questionTextEl.textContent = "Monster defeated! Click 'Start Battle' to fight another monster!";
            answersContainerEl.innerHTML = "";
            actionBtnEl.textContent = "Start Battle";
            actionBtnEl.disabled = false;
            
            updatePlayerUI();
        }
        
        // Check if player levels up
        function checkLevelUp() {
            if (gameData.player.xp >= gameData.player.xpToNextLevel) {
                gameData.player.level++;
                gameData.player.xp -= gameData.player.xpToNextLevel;
                gameData.player.xpToNextLevel = Math.floor(gameData.player.xpToNextLevel * 1.5);
                
                // Increase stats
                gameData.player.maxHp += 20;
                gameData.player.hp = gameData.player.maxHp;
                gameData.player.attack += 3;
                gameData.player.defense += 2;
                
                addLogEntry(`Congratulations! You reached level ${gameData.player.level}!`, "info");
                addLogEntry(`Your HP increased to ${gameData.player.maxHp}!`, "info");
                
                return true;
            }
            return false;
        }
        
        // Game over
        function gameOver() {
            addLogEntry("You have been defeated! Game over!", "monster");
            addLogEntry("Click 'Start Battle' to try again with full health.", "info");
            
            // Reset player HP
            gameData.player.hp = gameData.player.maxHp;
            
            // Reset game state
            gameData.monster = null;
            gameData.gameActive = false;
            
            // Update UI
            questionTextEl.textContent = "You were defeated! Click 'Start Battle' to try again.";
            answersContainerEl.innerHTML = "";
            actionBtnEl.textContent = "Start Battle";
            actionBtnEl.disabled = false;
            
            updatePlayerUI();
        }
        
        // Add entry to game log
        function addLogEntry(text, type) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${type}`;
            logEntry.textContent = `> ${text}`;
            
            logEntriesEl.appendChild(logEntry);
            
            // Scroll to bottom
            logEntriesEl.scrollTop = logEntriesEl.scrollHeight;
        }
        
        // Initialize the game when page loads
        window.addEventListener('DOMContentLoaded', initGame);