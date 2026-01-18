// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Game data - array of cases with scenarios, questions, options, and explanations
    const cases = [
        {
            id: 1,
            title: "The Locked Room Mystery",
            difficulty: "Beginner",
            scenario: "Detective Miller arrives at the mansion of the late Professor Aris. The professor was found dead in his study, which was locked from the inside. The only key was found on his desk. There are no hidden passages, and the windows are sealed shut. Security footage shows that no one entered or left the study all day. The detective concludes that the professor must have died by suicide, despite no suicide note being found and the professor having no history of depression.",
            clues: [
                "The room was locked from the inside with no other exits",
                "The only key was found inside the room on the desk",
                "Security footage shows no one entered or left",
                "No suicide note was found",
                "The professor had booked a vacation for the following week"
            ],
            question: "What is the incorrect assumption or logical fallacy in Detective Miller's conclusion?",
            options: [
                { id: "a", text: "Assuming suicide is the only possible explanation (False Dilemma)", isCorrect: true },
                { id: "b", text: "Ignoring the security footage (Ignoring Evidence)" },
                { id: "c", text: "Believing the room was actually locked (Questionable Premise)" },
                { id: "d", text: "Assuming the professor was murdered (Hasty Generalization)" }
            ],
            explanation: "The detective commits a <strong>False Dilemma</strong> fallacy by assuming that because no one could have entered or left, the only remaining possibility is suicide. However, there are other possibilities: the professor could have died of natural causes, or the footage could have been tampered with. The detective also ignores the lack of a suicide note and the upcoming vacation, which contradict the suicide theory.",
            hint: "Consider whether the evidence necessarily leads to the conclusion, or if there are alternative explanations."
        },
        {
            id: 2,
            title: "The Jewel Heist",
            difficulty: "Intermediate",
            scenario: "The Crimson Ruby was stolen from the museum last night. Security guard Rodriguez reports seeing a tall man in a black hoodie fleeing the scene. The police arrest a tall man named Jack who owns a black hoodie and has a prior conviction for theft. The prosecutor argues that Jack must be the thief because he matches the description and has a criminal history.",
            clues: [
                "A tall man in a black hoodie was seen fleeing",
                "Jack is tall and owns a black hoodie",
                "Jack has a prior theft conviction",
                "The museum's alarm system was disabled from inside",
                "Two other tall men with theft records live in the area"
            ],
            question: "What logical fallacy is the prosecutor committing?",
            options: [
                { id: "a", text: "Appealing to authority (Argument from Authority)" },
                { id: "b", text: "Assuming correlation equals causation (Post Hoc)" },
                { id: "c", text: "Making a hasty generalization from limited evidence", isCorrect: true },
                { id: "d", text: "Using circular reasoning (Begging the Question)" }
            ],
            explanation: "The prosecutor commits a <strong>Hasty Generalization</strong> fallacy by concluding Jack is the thief based on limited evidence. While Jack matches the description and has a criminal history, this doesn't prove he committed this specific crime. Other individuals also match the description and have similar histories, showing the evidence is insufficient for a definitive conclusion.",
            hint: "Ask yourself if the evidence presented is enough to draw a definitive conclusion, or if more information is needed."
        },
        {
            id: 3,
            title: "The Corporate Espionage",
            difficulty: "Advanced",
            scenario: "Tech company AlphaSoft experiences a major data breach. CEO Reynolds immediately blames their competitor, BetaCorp, because BetaCorp recently hired a former AlphaSoft employee who had access to the breached data. Reynolds argues that since the breach happened after the employee left, and BetaCorp benefits from the breach, BetaCorp must be responsible.",
            clues: [
                "Data breach occurred two weeks after the employee left",
                "BetaCorp hired the former AlphaSoft employee",
                "BetaCorp stands to benefit from the breach",
                "No direct evidence links BetaCorp to the breach",
                "Security logs show the breach originated from an unknown IP address"
            ],
            question: "Which logical fallacy does CEO Reynolds's argument contain?",
            options: [
                { id: "a", text: "False cause (Post Hoc Ergo Propter Hoc)", isCorrect: true },
                { id: "b", text: "Appeal to emotion (Argumentum ad Passiones)" },
                { id: "c", text: "Slippery slope fallacy" },
                { id: "d", text: "Ad hominem attack" }
            ],
            explanation: "This is a classic <strong>Post Hoc Ergo Propter Hoc</strong> (false cause) fallacy. Reynolds assumes that because the breach happened after the employee left for BetaCorp, the employee's move must have caused the breach. However, correlation does not equal causation. The breach could have been caused by many other factors, and there's no direct evidence linking BetaCorp to the breach.",
            hint: "Remember that just because event B happened after event A doesn't mean A caused B."
        },
        {
            id: 4,
            title: "The Election Poll",
            difficulty: "Intermediate",
            scenario: "A political pollster surveys 100 people at a conservative rally and finds that 85% support Candidate Smith. The pollster concludes that Candidate Smith has 85% support nationwide and will win the election in a landslide.",
            clues: [
                "Survey conducted at a conservative rally",
                "Sample size of 100 people",
                "85% support for Candidate Smith in the survey",
                "National voter population is 150 million",
                "Previous elections show rallies don't represent the broader electorate"
            ],
            question: "What is the flaw in the pollster's reasoning?",
            options: [
                { id: "a", text: "Biased sample (Sampling Fallacy)", isCorrect: true },
                { id: "b", text: "Appeal to tradition" },
                { id: "c", text: "Straw man argument" },
                { id: "d", text: "Red herring distraction" }
            ],
            explanation: "This is a <strong>Sampling Fallacy</strong> (biased sample). The pollster surveyed people at a conservative rally, who are likely already biased toward the conservative candidate. This sample doesn't represent the broader electorate, which includes people of all political views. Generalizing from this biased sample to the entire population is logically flawed.",
            hint: "Consider whether the people surveyed are representative of the entire group being discussed."
        },
        {
            id: 5,
            title: "The Superstition Trial",
            difficulty: "Advanced",
            scenario: "In a small village, whenever the old oak tree loses its leaves early, a harsh winter follows. This year, the tree lost its leaves early in October. Mayor Thompson argues that since the tree lost its leaves early, they must prepare for an extremely harsh winter and allocate extra funds for snow removal.",
            clues: [
                "Tree lost leaves early in October",
                "In past years, early leaf loss preceded harsh winters",
                "No scientific connection between leaf loss and winter severity",
                "Meteorologists predict a mild winter this year",
                "The tree is diseased, which may cause early leaf loss"
            ],
            question: "What type of flawed reasoning is the mayor using?",
            options: [
                { id: "a", text: "Appeal to nature" },
                { id: "b", text: "Anecdotal evidence fallacy" },
                { id: "c", text: "False cause based on correlation", isCorrect: true },
                { id: "d", text: "Bandwagon fallacy" }
            ],
            explanation: "The mayor commits a <strong>False Cause</strong> fallacy based on correlation. While early leaf loss and harsh winters have coincided in the past, there's no evidence of a causal relationship. The tree might be diseased this year, or the correlation might be coincidental. Making important budget decisions based on this superstition rather than meteorological data is logically flawed.",
            hint: "Correlation does not imply causation. Two things happening together doesn't mean one causes the other."
        }
    ];

    // Game state
    let currentCaseIndex = 0;
    let selectedOption = null;
    let isAnswered = false;
    let score = {
        solved: 0,
        attempted: 0,
        streak: 0,
        bestStreak: 0
    };

    // DOM elements
    const caseNumberElement = document.getElementById('case-number');
    const difficultyElement = document.getElementById('difficulty-level');
    const caseTitleElement = document.getElementById('case-title');
    const caseScenarioElement = document.getElementById('case-scenario');
    const questionTextElement = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const hintButton = document.getElementById('hint-button');
    const hintTextElement = document.getElementById('hint-text');
    const submitButton = document.getElementById('submit-button');
    const nextButton = document.getElementById('next-button');
    const resetButton = document.getElementById('reset-button');
    const resultsContent = document.getElementById('results-content');
    const fallacyExplanation = document.getElementById('fallacy-explanation');
    const progressFill = document.getElementById('progress-fill');
    const currentCaseElement = document.getElementById('current-case');
    const totalCasesElement = document.getElementById('total-cases');
    const solvedCountElement = document.getElementById('solved-count');
    const accuracyRateElement = document.getElementById('accuracy-rate');
    const streakCountElement = document.getElementById('streak-count');
    
    // Stats modal elements
    const statsModal = document.getElementById('stats-modal');
    const showStatsButton = document.getElementById('show-stats');
    const closeStatsButton = document.getElementById('close-stats');
    const statTotalElement = document.getElementById('stat-total');
    const statCorrectElement = document.getElementById('stat-correct');
    const statBestStreakElement = document.getElementById('stat-best-streak');
    const statAverageTimeElement = document.getElementById('stat-average-time');
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const soundToggle = document.getElementById('toggle-sound');

    // Initialize game
    function initGame() {
        // Load saved score from localStorage
        const savedScore = localStorage.getItem('logicDetectiveScore');
        if (savedScore) {
            score = JSON.parse(savedScore);
        }
        
        // Load theme preference
        const theme = localStorage.getItem('logicDetectiveTheme');
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Theme';
        }
        
        // Load sound preference
        const soundEnabled = localStorage.getItem('logicDetectiveSound');
        if (soundEnabled === 'false') {
            soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i> Sound';
        }
        
        totalCasesElement.textContent = cases.length;
        updateScoreDisplay();
        loadCase(currentCaseIndex);
        updateProgressBar();
        
        // Set up event listeners
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        // Hint button
        hintButton.addEventListener('click', function() {
            hintTextElement.classList.toggle('show');
        });

        // Submit button
        submitButton.addEventListener('click', submitAnswer);

        // Next button
        nextButton.addEventListener('click', function() {
            if (currentCaseIndex < cases.length - 1) {
                currentCaseIndex++;
                loadCase(currentCaseIndex);
                resetQuestion();
                updateProgressBar();
            } else {
                // If last case, loop back to first
                currentCaseIndex = 0;
                loadCase(currentCaseIndex);
                resetQuestion();
                updateProgressBar();
            }
        });

        // Reset button
        resetButton.addEventListener('click', function() {
            resetQuestion();
        });

        // Stats modal
        showStatsButton.addEventListener('click', function(e) {
            e.preventDefault();
            showStatsModal();
        });

        closeStatsButton.addEventListener('click', function() {
            statsModal.classList.remove('show');
        });

        // Theme toggle
        themeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleTheme();
        });

        // Sound toggle
        soundToggle.addEventListener('click', function(e) {
            e.preventDefault();
            toggleSound();
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === statsModal) {
                statsModal.classList.remove('show');
            }
        });
    }

    // Load a specific case
    function loadCase(index) {
        const currentCase = cases[index];
        
        // Update case info
        caseNumberElement.textContent = String(currentCase.id).padStart(3, '0');
        difficultyElement.textContent = currentCase.difficulty;
        caseTitleElement.textContent = currentCase.title;
        currentCaseElement.textContent = currentCase.id;
        
        // Build scenario text with clues
        let scenarioHTML = `<p>${currentCase.scenario}</p>`;
        scenarioHTML += `<p><strong>Clues:</strong></p>`;
        scenarioHTML += `<ul>`;
        currentCase.clues.forEach(clue => {
            scenarioHTML += `<li>${clue}</li>`;
        });
        scenarioHTML += `</ul>`;
        
        caseScenarioElement.innerHTML = scenarioHTML;
        
        // Update question
        questionTextElement.textContent = currentCase.question;
        
        // Clear and rebuild options
        optionsContainer.innerHTML = '';
        currentCase.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.id = `option-${option.id}`;
            optionElement.dataset.optionId = option.id;
            optionElement.innerHTML = `<span class="option-letter">${option.id.toUpperCase()}</span>. ${option.text}`;
            
            optionElement.addEventListener('click', function() {
                if (!isAnswered) {
                    selectOption(option.id);
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
        
        // Update hint
        hintTextElement.querySelector('p').textContent = currentCase.hint;
        hintTextElement.classList.remove('show');
        
        // Reset results content
        resultsContent.innerHTML = '<p>Submit your answer to see the investigation report.</p>';
        fallacyExplanation.innerHTML = '';
        
        // Update status badge
        const statusBadge = document.querySelector('.status-badge');
        statusBadge.textContent = 'Unsolved';
        statusBadge.style.backgroundColor = 'var(--warning-color)';
        
        // Update evidence board
        updateEvidenceBoard(currentCase.clues);
    }

    // Update evidence board with current case clues
    function updateEvidenceBoard(clues) {
        const evidenceItems = document.querySelector('.evidence-items');
        evidenceItems.innerHTML = '';
        
        clues.forEach(clue => {
            // Take first 2-3 words from clue for evidence item
            const words = clue.split(' ').slice(0, 3).join(' ');
            const evidenceItem = document.createElement('div');
            evidenceItem.className = 'evidence-item';
            evidenceItem.textContent = words;
            evidenceItems.appendChild(evidenceItem);
        });
    }

    // Select an option
    function selectOption(optionId) {
        // Remove selected class from all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        const selectedOptionElement = document.getElementById(`option-${optionId}`);
        selectedOptionElement.classList.add('selected');
        
        selectedOption = optionId;
        submitButton.disabled = false;
    }

    // Submit answer
    function submitAnswer() {
        if (!selectedOption || isAnswered) return;
        
        const currentCase = cases[currentCaseIndex];
        const selectedOptionObj = currentCase.options.find(opt => opt.id === selectedOption);
        const isCorrect = selectedOptionObj.isCorrect || false;
        
        // Mark answer as answered
        isAnswered = true;
        
        // Update score
        score.attempted++;
        if (isCorrect) {
            score.solved++;
            score.streak++;
            if (score.streak > score.bestStreak) {
                score.bestStreak = score.streak;
            }
            
            // Update status badge
            const statusBadge = document.querySelector('.status-badge');
            statusBadge.textContent = 'Solved';
            statusBadge.style.backgroundColor = 'var(--success-color)';
            
            // Play success sound if enabled
            if (isSoundEnabled()) {
                playSuccessSound();
            }
        } else {
            score.streak = 0;
            
            // Play error sound if enabled
            if (isSoundEnabled()) {
                playErrorSound();
            }
        }
        
        // Save score to localStorage
        localStorage.setItem('logicDetectiveScore', JSON.stringify(score));
        
        // Update score display
        updateScoreDisplay();
        
        // Show correct/incorrect on options
        document.querySelectorAll('.option').forEach(optionElement => {
            const optionId = optionElement.dataset.optionId;
            const optionObj = currentCase.options.find(opt => opt.id === optionId);
            
            if (optionObj.isCorrect) {
                optionElement.classList.add('correct');
            } else if (optionId === selectedOption) {
                optionElement.classList.add('incorrect');
            }
        });
        
        // Update results content
        if (isCorrect) {
            resultsContent.innerHTML = `<p><i class="fas fa-check-circle" style="color: var(--success-color); margin-right: 10px;"></i><strong>Case Solved!</strong> Your analysis is correct. The detective's reasoning contains a logical flaw.</p>`;
        } else {
            resultsContent.innerHTML = `<p><i class="fas fa-times-circle" style="color: var(--accent-color); margin-right: 10px;"></i><strong>Incorrect Analysis.</strong> Your answer doesn't identify the correct logical fallacy. Let's examine the reasoning more carefully.</p>`;
        }
        
        // Show explanation
        fallacyExplanation.innerHTML = `<h4>Logical Analysis:</h4><p>${currentCase.explanation}</p>`;
        
        // Highlight the correct answer in the explanation
        const correctOption = currentCase.options.find(opt => opt.isCorrect);
        fallacyExplanation.innerHTML += `<p><strong>Correct answer:</strong> ${correctOption.text}</p>`;
    }

    // Reset question state
    function resetQuestion() {
        selectedOption = null;
        isAnswered = false;
        
        // Remove selection and result classes from options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Reset results content
        resultsContent.innerHTML = '<p>Submit your answer to see the investigation report.</p>';
        fallacyExplanation.innerHTML = '';
        
        // Reset status badge
        const statusBadge = document.querySelector('.status-badge');
        statusBadge.textContent = 'Unsolved';
        statusBadge.style.backgroundColor = 'var(--warning-color)';
        
        // Hide hint
        hintTextElement.classList.remove('show');
    }

    // Update score display
    function updateScoreDisplay() {
        solvedCountElement.textContent = score.solved;
        
        const accuracy = score.attempted > 0 ? Math.round((score.solved / score.attempted) * 100) : 0;
        accuracyRateElement.textContent = `${accuracy}%`;
        
        streakCountElement.textContent = score.streak;
    }

    // Update progress bar
    function updateProgressBar() {
        const progressPercentage = ((currentCaseIndex + 1) / cases.length) * 100;
        progressFill.style.width = `${progressPercentage}%`;
    }

    // Show stats modal
    function showStatsModal() {
        statTotalElement.textContent = score.attempted;
        statCorrectElement.textContent = score.solved;
        statBestStreakElement.textContent = score.bestStreak;
        
        // Calculate average time (placeholder - would need timer implementation)
        statAverageTimeElement.textContent = "45s";
        
        statsModal.classList.add('show');
    }

    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('logicDetectiveTheme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i> Theme';
        } else {
            localStorage.setItem('logicDetectiveTheme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i> Theme';
        }
    }

    // Toggle sound
    function toggleSound() {
        const soundEnabled = isSoundEnabled();
        
        if (soundEnabled) {
            localStorage.setItem('logicDetectiveSound', 'false');
            soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i> Sound';
        } else {
            localStorage.setItem('logicDetectiveSound', 'true');
            soundToggle.innerHTML = '<i class="fas fa-volume-up"></i> Sound';
        }
    }

    // Check if sound is enabled
    function isSoundEnabled() {
        const soundEnabled = localStorage.getItem('logicDetectiveSound');
        return soundEnabled !== 'false'; // Default to true if not set
    }

    // Play success sound
    function playSuccessSound() {
        // In a real implementation, you would play an actual sound
        console.log("Playing success sound");
    }

    // Play error sound
    function playErrorSound() {
        // In a real implementation, you would play an actual sound
        console.log("Playing error sound");
    }

    // Initialize the game
    initGame();
});