// ===== Quiz Builder & Player - Complete Script =====

// State Management
const state = {
    quizzes: [],
    currentQuiz: null,
    currentQuestions: [],
    editingQuizId: null,
    editingQuestionIndex: null,
    // Play state
    playingQuiz: null,
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    startTime: null,
    timerInterval: null,
    questionTimer: 0,
    // Statistics
    leaderboard: [],
    statistics: {
        totalQuizzesPlayed: 0,
        totalCorrect: 0,
        totalWrong: 0,
        categoryStats: {},
        recentActivity: []
    }
};

// ===== Utility Functions =====

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${screenName}Screen`).classList.add('active');
    const navBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => 
        btn.textContent.toLowerCase().includes(screenName) || 
        (screenName === 'home' && btn.textContent.includes('🏠'))
    );
    if (navBtn) navBtn.classList.add('active');
    
    if (screenName === 'home') {
        displayQuizLibrary();
    } else if (screenName === 'leaderboard') {
        updateLeaderboardFilter();
        displayLeaderboard();
    } else if (screenName === 'statistics') {
        displayStatistics();
    }
}

// ===== Quiz Management =====

function displayQuizLibrary() {
    const container = document.getElementById('quizLibrary');
    const filteredQuizzes = filterQuizzes();
    
    if (filteredQuizzes.length === 0) {
        container.innerHTML = '<div class="empty-state">No quizzes found. Create your first quiz!</div>';
        return;
    }
    
    container.innerHTML = filteredQuizzes.map(quiz => `
        <div class="quiz-card" onclick="startQuiz(${quiz.id})">
            <div class="quiz-card-actions" onclick="event.stopPropagation()">
                <button class="quiz-action-btn" onclick="editQuiz(${quiz.id})" title="Edit">✏️</button>
                <button class="quiz-action-btn" onclick="deleteQuiz(${quiz.id})" title="Delete">🗑️</button>
                <button class="quiz-action-btn" onclick="shareQuiz(${quiz.id})" title="Share">📤</button>
            </div>
            <div class="quiz-card-header">
                <div>
                    <div class="quiz-card-category">${quiz.category}</div>
                    <div class="quiz-card-title">${quiz.title}</div>
                </div>
            </div>
            <div class="quiz-card-description">${quiz.description || 'No description'}</div>
            <div class="quiz-card-meta">
                <span>${quiz.questions.length} questions</span>
                <span class="quiz-card-difficulty ${quiz.difficulty}">${quiz.difficulty}</span>
                ${quiz.timeLimit > 0 ? `<span>⏱️ ${quiz.timeLimit}s</span>` : ''}
            </div>
        </div>
    `).join('');
}

function filterQuizzes() {
    let filtered = state.quizzes;
    
    const category = document.getElementById('categoryFilter').value;
    if (category) {
        filtered = filtered.filter(q => q.category === category);
    }
    
    const difficulty = document.getElementById('difficultyFilter').value;
    if (difficulty) {
        filtered = filtered.filter(q => q.difficulty === difficulty);
    }
    
    const search = document.getElementById('searchQuiz').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(q => 
            q.title.toLowerCase().includes(search) || 
            q.description.toLowerCase().includes(search)
        );
    }
    
    return filtered;
}

function clearQuiz() {
    if (confirm('Are you sure you want to clear all fields?')) {
        document.getElementById('quizInfoForm').reset();
        state.currentQuestions = [];
        state.editingQuizId = null;
        displayQuestions();
        showToast('Quiz cleared');
    }
}

function saveQuiz() {
    const title = document.getElementById('quizTitle').value.trim();
    const category = document.getElementById('quizCategory').value;
    const difficulty = document.getElementById('quizDifficulty').value;
    const timeLimit = parseInt(document.getElementById('quizTimeLimit').value) || 0;
    const description = document.getElementById('quizDescription').value.trim();
    
    if (!title || !category) {
        showToast('Please fill in required fields');
        return;
    }
    
    if (state.currentQuestions.length === 0) {
        showToast('Please add at least one question');
        return;
    }
    
    const quiz = {
        id: state.editingQuizId || Date.now(),
        title,
        category,
        difficulty,
        timeLimit,
        description,
        questions: state.currentQuestions,
        createdAt: new Date().toISOString()
    };
    
    if (state.editingQuizId) {
        const index = state.quizzes.findIndex(q => q.id === state.editingQuizId);
        state.quizzes[index] = quiz;
        showToast('Quiz updated!');
    } else {
        state.quizzes.push(quiz);
        showToast('Quiz created!');
    }
    
    saveToLocalStorage();
    clearQuiz();
    showScreen('home');
}

function editQuiz(quizId) {
    const quiz = state.quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    state.editingQuizId = quizId;
    state.currentQuestions = [...quiz.questions];
    
    document.getElementById('quizTitle').value = quiz.title;
    document.getElementById('quizCategory').value = quiz.category;
    document.getElementById('quizDifficulty').value = quiz.difficulty;
    document.getElementById('quizTimeLimit').value = quiz.timeLimit;
    document.getElementById('quizDescription').value = quiz.description;
    
    displayQuestions();
    showScreen('create');
    showToast('Editing quiz');
}

function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        state.quizzes = state.quizzes.filter(q => q.id !== quizId);
        saveToLocalStorage();
        displayQuizLibrary();
        showToast('Quiz deleted');
    }
}

function shareQuiz(quizId) {
    const quiz = state.quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    const json = JSON.stringify(quiz, null, 2);
    navigator.clipboard.writeText(json);
    showToast('Quiz JSON copied to clipboard!');
}

// ===== Question Management =====

function displayQuestions() {
    const container = document.getElementById('questionsList');
    
    if (state.currentQuestions.length === 0) {
        container.innerHTML = '<div class="empty-state">No questions added yet</div>';
        return;
    }
    
    container.innerHTML = state.currentQuestions.map((q, index) => `
        <div class="question-item">
            <div class="question-item-header">
                <div>
                    <span class="question-item-type">${q.type === 'multiple' ? 'Multiple Choice' : q.type === 'truefalse' ? 'True/False' : 'Open-ended'}</span>
                    <span style="margin-left: 10px; color: var(--warning); font-weight: 600;">${q.points} pts</span>
                </div>
                <div class="question-item-actions">
                    <button onclick="editQuestion(${index})">✏️ Edit</button>
                    <button onclick="deleteQuestion(${index})">🗑️ Delete</button>
                </div>
            </div>
            <div class="question-item-text">${index + 1}. ${q.text}</div>
            <div class="question-item-answers">
                ${q.type === 'open' 
                    ? `<div>Correct answer: ${q.correctAnswer}</div>`
                    : q.answers.map((a, i) => `
                        <div class="question-item-answer ${q.correctAnswer === i || q.correctAnswer === a ? 'correct' : ''}">
                            ${q.correctAnswer === i || q.correctAnswer === a ? '✓' : '○'} ${a}
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `).join('');
}

function addQuestion() {
    state.editingQuestionIndex = null;
    document.getElementById('questionModalTitle').textContent = 'Add Question';
    document.getElementById('questionForm').reset();
    document.getElementById('questionPoints').value = 10;
    updateQuestionType();
    document.getElementById('questionModal').classList.add('active');
}

function editQuestion(index) {
    state.editingQuestionIndex = index;
    const question = state.currentQuestions[index];
    
    document.getElementById('questionModalTitle').textContent = 'Edit Question';
    document.getElementById('questionTextInput').value = question.text;
    document.getElementById('questionTypeInput').value = question.type;
    document.getElementById('questionPoints').value = question.points;
    
    updateQuestionType();
    
    if (question.type === 'open') {
        document.getElementById('correctAnswerInput').value = question.correctAnswer;
    } else {
        const answersList = document.getElementById('answersInputList');
        answersList.innerHTML = '';
        question.answers.forEach((answer, i) => {
            addAnswerInput(answer, i === question.correctAnswer);
        });
    }
    
    document.getElementById('questionModal').classList.add('active');
}

function deleteQuestion(index) {
    if (confirm('Delete this question?')) {
        state.currentQuestions.splice(index, 1);
        displayQuestions();
        showToast('Question deleted');
    }
}

function closeQuestionModal() {
    document.getElementById('questionModal').classList.remove('active');
}

function updateQuestionType() {
    const type = document.getElementById('questionTypeInput').value;
    const answersSection = document.getElementById('answersSection');
    const correctAnswerSection = document.getElementById('correctAnswerSection');
    
    if (type === 'open') {
        answersSection.style.display = 'none';
        correctAnswerSection.style.display = 'block';
    } else {
        answersSection.style.display = 'block';
        correctAnswerSection.style.display = 'none';
        
        const answersList = document.getElementById('answersInputList');
        if (answersList.children.length === 0) {
            if (type === 'truefalse') {
                addAnswerInput('True', true);
                addAnswerInput('False', false);
            } else {
                addAnswerInput('', true);
                addAnswerInput('', false);
            }
        }
    }
}

function addAnswerInput(value = '', isCorrect = false) {
    const container = document.getElementById('answersInputList');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'answer-input-group';
    div.innerHTML = `
        <input type="text" placeholder="Answer option" value="${value}" required>
        <input type="radio" name="correctAnswer" ${isCorrect ? 'checked' : ''} title="Correct answer">
        <button type="button" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

document.getElementById('questionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const text = document.getElementById('questionTextInput').value.trim();
    const type = document.getElementById('questionTypeInput').value;
    const points = parseInt(document.getElementById('questionPoints').value);
    
    if (!text) {
        showToast('Please enter question text');
        return;
    }
    
    const question = { text, type, points };
    
    if (type === 'open') {
        question.correctAnswer = document.getElementById('correctAnswerInput').value.trim();
        question.answers = [];
        if (!question.correctAnswer) {
            showToast('Please enter correct answer');
            return;
        }
    } else {
        const answerInputs = document.querySelectorAll('#answersInputList .answer-input-group');
        question.answers = Array.from(answerInputs).map(group => 
            group.querySelector('input[type="text"]').value.trim()
        );
        
        const correctRadio = document.querySelector('#answersInputList input[type="radio"]:checked');
        if (!correctRadio) {
            showToast('Please select correct answer');
            return;
        }
        
        question.correctAnswer = Array.from(answerInputs).indexOf(correctRadio.closest('.answer-input-group'));
        
        if (question.answers.some(a => !a)) {
            showToast('Please fill all answer options');
            return;
        }
    }
    
    if (state.editingQuestionIndex !== null) {
        state.currentQuestions[state.editingQuestionIndex] = question;
        showToast('Question updated');
    } else {
        state.currentQuestions.push(question);
        showToast('Question added');
    }
    
    displayQuestions();
    closeQuestionModal();
});

// ===== Export/Import =====

function exportQuiz() {
    const formValid = document.getElementById('quizTitle').value.trim() && 
                     document.getElementById('quizCategory').value &&
                     state.currentQuestions.length > 0;
    
    if (!formValid) {
        showToast('Please complete the quiz before exporting');
        return;
    }
    
    const quiz = {
        title: document.getElementById('quizTitle').value.trim(),
        category: document.getElementById('quizCategory').value,
        difficulty: document.getElementById('quizDifficulty').value,
        timeLimit: parseInt(document.getElementById('quizTimeLimit').value) || 0,
        description: document.getElementById('quizDescription').value.trim(),
        questions: state.currentQuestions
    };
    
    const json = JSON.stringify(quiz, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title.replace(/[^a-z0-9]/gi, '_')}.json`;
    a.click();
    
    showToast('Quiz exported!');
}

function importQuiz() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const quiz = JSON.parse(event.target.result);
                
                document.getElementById('quizTitle').value = quiz.title || '';
                document.getElementById('quizCategory').value = quiz.category || '';
                document.getElementById('quizDifficulty').value = quiz.difficulty || 'medium';
                document.getElementById('quizTimeLimit').value = quiz.timeLimit || 0;
                document.getElementById('quizDescription').value = quiz.description || '';
                state.currentQuestions = quiz.questions || [];
                
                displayQuestions();
                showToast('Quiz imported!');
            } catch (error) {
                showToast('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// ===== Quiz Play =====

function startQuiz(quizId) {
    const quiz = state.quizzes.find(q => q.id === quizId);
    if (!quiz || !quiz.questions.length) return;
    
    state.playingQuiz = quiz;
    state.currentQuestionIndex = 0;
    state.answers = [];
    state.score = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.startTime = Date.now();
    state.questionTimer = 0;
    
    // Setup quiz header
    document.getElementById('playQuizTitle').textContent = quiz.title;
    document.getElementById('playQuizCategory').textContent = quiz.category;
    document.getElementById('playQuizDifficulty').textContent = quiz.difficulty;
    document.getElementById('totalQuestions').textContent = quiz.questions.length;
    
    // Start timer
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(updateTimer, 1000);
    
    showQuestion();
    showScreen('play');
}

function showQuestion() {
    const quiz = state.playingQuiz;
    const question = quiz.questions[state.currentQuestionIndex];
    const answered = state.answers[state.currentQuestionIndex] !== undefined;
    
    // Update progress
    document.getElementById('currentQuestionNum').textContent = state.currentQuestionIndex + 1;
    document.getElementById('progressFill').style.width = 
        `${((state.currentQuestionIndex + 1) / quiz.questions.length) * 100}%`;
    
    // Update question
    document.getElementById('questionType').textContent = 
        question.type === 'multiple' ? 'Multiple Choice' : 
        question.type === 'truefalse' ? 'True/False' : 'Open-ended';
    document.getElementById('questionPoints').textContent = `${question.points} Points`;
    document.getElementById('questionText').textContent = question.text;
    
    // Display answers
    const container = document.getElementById('answersContainer');
    container.innerHTML = '';
    
    if (question.type === 'open') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'answer-input';
        input.placeholder = 'Type your answer here';
        input.disabled = answered;
        if (answered) {
            input.value = state.answers[state.currentQuestionIndex].userAnswer;
        }
        container.appendChild(input);
    } else {
        question.answers.forEach((answer, index) => {
            const div = document.createElement('div');
            div.className = 'answer-option';
            div.textContent = answer;
            div.dataset.index = index;
            
            if (answered) {
                div.classList.add('disabled');
                const userAnswer = state.answers[state.currentQuestionIndex];
                if (userAnswer.selectedIndex === index) {
                    div.classList.add(userAnswer.correct ? 'correct' : 'wrong');
                }
                if (index === question.correctAnswer && !userAnswer.correct) {
                    div.classList.add('correct');
                }
            } else {
                div.onclick = () => selectAnswer(index);
            }
            
            container.appendChild(div);
        });
    }
    
    // Update buttons
    document.getElementById('prevBtn').disabled = state.currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = state.currentQuestionIndex === quiz.questions.length - 1;
    document.getElementById('submitAnswerBtn').style.display = answered ? 'none' : 'inline-block';
    
    // Show/hide feedback
    const feedback = document.getElementById('feedbackMessage');
    feedback.classList.remove('show', 'correct', 'wrong');
    if (answered) {
        const ans = state.answers[state.currentQuestionIndex];
        feedback.textContent = ans.correct ? 
            `✓ Correct! +${question.points} points` : 
            `✗ Wrong. Correct answer: ${question.type === 'open' ? question.correctAnswer : question.answers[question.correctAnswer]}`;
        feedback.classList.add('show', ans.correct ? 'correct' : 'wrong');
    }
    
    // Update score display
    document.getElementById('currentScore').textContent = state.score;
    document.getElementById('correctCount').textContent = state.correctCount;
    document.getElementById('wrongCount').textContent = state.wrongCount;
}

function selectAnswer(index) {
    document.querySelectorAll('.answer-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.querySelector(`.answer-option[data-index="${index}"]`).classList.add('selected');
}

function submitAnswer() {
    const quiz = state.playingQuiz;
    const question = quiz.questions[state.currentQuestionIndex];
    
    let userAnswer, selectedIndex, correct;
    
    if (question.type === 'open') {
        userAnswer = document.querySelector('.answer-input').value.trim();
        if (!userAnswer) {
            showToast('Please enter an answer');
            return;
        }
        correct = userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
    } else {
        const selected = document.querySelector('.answer-option.selected');
        if (!selected) {
            showToast('Please select an answer');
            return;
        }
        selectedIndex = parseInt(selected.dataset.index);
        correct = selectedIndex === question.correctAnswer;
    }
    
    // Calculate score with time bonus
    let points = 0;
    if (correct) {
        points = question.points;
        // Time bonus: +5% points per second under 10 seconds
        if (quiz.timeLimit > 0 && state.questionTimer < 10) {
            const bonus = Math.floor(points * 0.05 * (10 - state.questionTimer));
            points += bonus;
        }
        state.correctCount++;
    } else {
        state.wrongCount++;
    }
    
    state.score += points;
    state.answers[state.currentQuestionIndex] = {
        userAnswer,
        selectedIndex,
        correct,
        points
    };
    
    showQuestion();
    
    // Auto-advance to next if not last question
    if (state.currentQuestionIndex < quiz.questions.length - 1) {
        setTimeout(() => nextQuestion(), 1500);
    } else {
        setTimeout(() => finishQuiz(), 1500);
    }
}

function previousQuestion() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        showQuestion();
    }
}

function nextQuestion() {
    if (state.currentQuestionIndex < state.playingQuiz.questions.length - 1) {
        state.currentQuestionIndex++;
        state.questionTimer = 0;
        showQuestion();
    }
}

function updateTimer() {
    state.questionTimer++;
    const totalSeconds = Math.floor((Date.now() - state.startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    document.getElementById('quizTimer').textContent = 
        `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Check time limit
    if (state.playingQuiz.timeLimit > 0 && totalSeconds >= state.playingQuiz.timeLimit) {
        finishQuiz();
    }
}

function finishQuiz() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    
    const quiz = state.playingQuiz;
    const timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
    const totalQuestions = quiz.questions.length;
    const accuracy = (state.correctCount / totalQuestions * 100).toFixed(1);
    
    // Display results
    document.getElementById('finalScore').textContent = state.score;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
    document.getElementById('timeTaken').textContent = `${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`;
    document.getElementById('correctAnswers').textContent = `${state.correctCount}/${totalQuestions}`;
    
    // Results breakdown
    const breakdown = document.getElementById('resultsBreakdown');
    breakdown.innerHTML = quiz.questions.map((q, i) => {
        const ans = state.answers[i];
        if (!ans) return '';
        return `
            <div class="breakdown-item ${ans.correct ? 'correct' : 'wrong'}">
                <span>Q${i + 1}: ${q.text.substring(0, 50)}...</span>
                <span>${ans.correct ? '✓' : '✗'} ${ans.points} pts</span>
            </div>
        `;
    }).join('');
    
    // Update statistics
    updateStatistics(quiz, accuracy, timeTaken);
    
    showScreen('results');
}

function retakeQuiz() {
    if (state.playingQuiz) {
        startQuiz(state.playingQuiz.id);
    }
}

document.getElementById('nameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('playerName').value.trim();
    if (!name) return;
    
    const entry = {
        name,
        quiz: state.playingQuiz.title,
        quizId: state.playingQuiz.id,
        score: state.score,
        accuracy: (state.correctCount / state.playingQuiz.questions.length * 100).toFixed(1),
        date: new Date().toISOString()
    };
    
    state.leaderboard.push(entry);
    state.leaderboard.sort((a, b) => b.score - a.score);
    
    saveToLocalStorage();
    showToast('Score submitted to leaderboard!');
    document.getElementById('playerName').value = '';
});

// ===== Leaderboard =====

function updateLeaderboardFilter() {
    const select = document.getElementById('leaderboardQuizFilter');
    select.innerHTML = '<option value="">All Quizzes</option>';
    
    // Get unique quizzes from leaderboard
    const uniqueQuizzes = [...new Set(state.leaderboard.map(e => e.quiz))];
    uniqueQuizzes.forEach(quiz => {
        const option = document.createElement('option');
        option.value = quiz;
        option.textContent = quiz;
        select.appendChild(option);
    });
}

function displayLeaderboard() {
    const container = document.getElementById('leaderboardTable');
    const filter = document.getElementById('leaderboardQuizFilter').value;
    
    let entries = state.leaderboard;
    if (filter) {
        entries = entries.filter(e => e.quiz === filter);
    }
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-state">No leaderboard entries yet</div>';
        return;
    }
    
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            ${entries.map((entry, index) => {
                let rankClass = 'regular';
                if (index === 0) rankClass = 'gold';
                else if (index === 1) rankClass = 'silver';
                else if (index === 2) rankClass = 'bronze';
                
                return `
                    <tr>
                        <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
                        <td><strong>${entry.name}</strong></td>
                        <td>${entry.quiz}</td>
                        <td><strong>${entry.score}</strong></td>
                        <td>${entry.accuracy}%</td>
                        <td>${new Date(entry.date).toLocaleDateString()}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
    
    container.innerHTML = '';
    container.appendChild(table);
}

function clearLeaderboard() {
    if (confirm('Are you sure you want to clear all leaderboard entries?')) {
        state.leaderboard = [];
        saveToLocalStorage();
        displayLeaderboard();
        showToast('Leaderboard cleared');
    }
}

// ===== Statistics =====

function updateStatistics(quiz, accuracy, timeTaken) {
    state.statistics.totalQuizzesPlayed++;
    state.statistics.totalCorrect += state.correctCount;
    state.statistics.totalWrong += state.wrongCount;
    
    // Category stats
    if (!state.statistics.categoryStats[quiz.category]) {
        state.statistics.categoryStats[quiz.category] = {
            played: 0,
            correct: 0,
            total: 0
        };
    }
    state.statistics.categoryStats[quiz.category].played++;
    state.statistics.categoryStats[quiz.category].correct += state.correctCount;
    state.statistics.categoryStats[quiz.category].total += quiz.questions.length;
    
    // Recent activity
    state.statistics.recentActivity.unshift({
        quiz: quiz.title,
        category: quiz.category,
        score: state.score,
        accuracy,
        date: new Date().toISOString()
    });
    
    if (state.statistics.recentActivity.length > 10) {
        state.statistics.recentActivity.pop();
    }
    
    saveToLocalStorage();
}

function displayStatistics() {
    const stats = state.statistics;
    
    // Overall stats
    document.getElementById('totalQuizzesPlayed').textContent = stats.totalQuizzesPlayed;
    document.getElementById('totalCorrect').textContent = stats.totalCorrect;
    document.getElementById('totalWrong').textContent = stats.totalWrong;
    
    const totalAnswers = stats.totalCorrect + stats.totalWrong;
    const avgAccuracy = totalAnswers > 0 ? (stats.totalCorrect / totalAnswers * 100).toFixed(1) : 0;
    document.getElementById('averageAccuracy').textContent = `${avgAccuracy}%`;
    
    // Category performance
    const categoryContainer = document.getElementById('categoryStats');
    if (Object.keys(stats.categoryStats).length === 0) {
        categoryContainer.innerHTML = '<div class="empty-state">No category data yet</div>';
    } else {
        categoryContainer.innerHTML = Object.entries(stats.categoryStats).map(([category, data]) => {
            const accuracy = (data.correct / data.total * 100).toFixed(1);
            return `
                <div class="category-stat-item">
                    <span class="category-stat-name">${category} (${data.played} quizzes)</span>
                    <span class="category-stat-accuracy">${accuracy}%</span>
                </div>
            `;
        }).join('');
    }
    
    // Difficulty chart
    drawDifficultyChart();
    
    // Recent activity
    const activityContainer = document.getElementById('recentActivity');
    if (stats.recentActivity.length === 0) {
        activityContainer.innerHTML = '<div class="empty-state">No recent activity</div>';
    } else {
        activityContainer.innerHTML = stats.recentActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-quiz">${activity.quiz}</div>
                <div class="activity-meta">
                    ${activity.category} • Score: ${activity.score} • Accuracy: ${activity.accuracy}% • 
                    ${new Date(activity.date).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }
}

function drawDifficultyChart() {
    const canvas = document.getElementById('difficultyChart');
    const ctx = canvas.getContext('2d');
    
    // Calculate difficulty stats from leaderboard
    const difficultyStats = { easy: 0, medium: 0, hard: 0 };
    state.leaderboard.forEach(entry => {
        const quiz = state.quizzes.find(q => q.id === entry.quizId);
        if (quiz) {
            difficultyStats[quiz.difficulty] = (difficultyStats[quiz.difficulty] || 0) + 1;
        }
    });
    
    const data = [difficultyStats.easy, difficultyStats.medium, difficultyStats.hard];
    const labels = ['Easy', 'Medium', 'Hard'];
    const colors = ['#10b981', '#f59e0b', '#ef4444'];
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (data.every(d => d === 0)) {
        ctx.fillStyle = '#999';
        ctx.textAlign = 'center';
        ctx.font = '16px Arial';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const maxValue = Math.max(...data, 1);
    const barWidth = 80;
    const spacing = 60;
    const startX = 80;
    const chartHeight = canvas.height - 80;
    
    // Draw bars
    data.forEach((value, index) => {
        const x = startX + (barWidth + spacing) * index;
        const barHeight = (value / maxValue) * chartHeight;
        const y = canvas.height - 40 - barHeight;
        
        // Bar
        ctx.fillStyle = colors[index];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Label
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 20);
        
        // Value
        ctx.fillText(value, x + barWidth / 2, y - 10);
    });
}

// ===== LocalStorage =====

function saveToLocalStorage() {
    localStorage.setItem('quizBuilderData', JSON.stringify({
        quizzes: state.quizzes,
        leaderboard: state.leaderboard,
        statistics: state.statistics
    }));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('quizBuilderData');
    if (saved) {
        const data = JSON.parse(saved);
        state.quizzes = data.quizzes || [];
        state.leaderboard = data.leaderboard || [];
        state.statistics = data.statistics || {
            totalQuizzesPlayed: 0,
            totalCorrect: 0,
            totalWrong: 0,
            categoryStats: {},
            recentActivity: []
        };
    }
}

// ===== Initialization =====

function init() {
    loadFromLocalStorage();
    displayQuizLibrary();
    
    // Add sample quizzes if none exist
    if (state.quizzes.length === 0) {
        state.quizzes = [
            {
                id: Date.now(),
                title: 'Sample Quiz: General Knowledge',
                category: 'general',
                difficulty: 'easy',
                timeLimit: 0,
                description: 'Test your general knowledge with these questions',
                questions: [
                    {
                        text: 'What is the capital of France?',
                        type: 'multiple',
                        points: 10,
                        answers: ['London', 'Berlin', 'Paris', 'Madrid'],
                        correctAnswer: 2
                    },
                    {
                        text: 'Is the Earth flat?',
                        type: 'truefalse',
                        points: 10,
                        answers: ['True', 'False'],
                        correctAnswer: 1
                    }
                ],
                createdAt: new Date().toISOString()
            }
        ];
        saveToLocalStorage();
        displayQuizLibrary();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
