/**
 * Knowledge Decay Tracker - Retention Reinforcement System
 * Issue #6256
 *
 * Features:
 * - Spaced repetition algorithm implementation
 * - Learning decay modeling and retention tracking
 * - Adaptive review scheduling
 * - Analytics and visualization
 */

// Global state and configuration
let knowledgeItems = [];
let currentStudySession = null;
let studyStreak = 0;
let lastStudyDate = null;

// Spaced repetition algorithm constants (simplified SuperMemo SM-2)
const REPETITION_INTERVALS = {
    1: 1,    // 1 day
    2: 6,    // 6 days
    3: 14,   // 14 days
    4: 30,   // 30 days
    5: 60,   // 60 days
    6: 120,  // 120 days
    7: 240   // 240 days
};

const EASE_FACTORS = {
    difficult: 1.3,  // Hard to recall - decrease ease
    good: 2.5,       // Good recall - maintain ease
    easy: 3.0        // Easy recall - increase ease
};

const DIFFICULTY_MULTIPLIERS = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
    expert: 1.6
};

// Forgetting curve parameters (Ebbinghaus model)
const FORGETTING_RATES = {
    easy: 0.1,       // Slower decay for easy material
    medium: 0.15,
    hard: 0.2,
    expert: 0.25     // Faster decay for complex material
};

// DOM elements
const knowledgeForm = document.getElementById('knowledge-form');
const knowledgeList = document.getElementById('knowledge-list');
const generateSampleBtn = document.getElementById('generate-sample');
const filterStatus = document.getElementById('filter-status');
const searchItems = document.getElementById('search-items');
const showRetentionChartBtn = document.getElementById('show-retention-chart');
const showForgettingChartBtn = document.getElementById('show-forgetting-chart');
const exportDataBtn = document.getElementById('export-data');
const analyticsContainer = document.getElementById('analytics-container');
const studySession = document.getElementById('study-session');
const studyActions = document.querySelectorAll('#study-session .study-actions button');

// Initialize the application
function init() {
    loadData();
    setupEventListeners();
    updateDashboard();
    renderKnowledgeList();
    checkForDueReviews();
}

// Event listeners setup
function setupEventListeners() {
    knowledgeForm.addEventListener('submit', addKnowledgeItem);
    generateSampleBtn.addEventListener('click', generateSampleData);
    filterStatus.addEventListener('change', renderKnowledgeList);
    searchItems.addEventListener('input', renderKnowledgeList);
    showRetentionChartBtn.addEventListener('click', showRetentionChart);
    showForgettingChartBtn.addEventListener('click', showForgettingChart);
    exportDataBtn.addEventListener('click', exportLearningData);

    // Study session buttons
    studyActions.forEach(button => {
        button.addEventListener('click', handleStudyResponse);
    });
}

// Update confidence value display
function updateConfidenceValue() {
    const confidence = document.getElementById('confidence').value;
    document.getElementById('confidence-value').textContent = confidence;
}

// Add new knowledge item
function addKnowledgeItem(event) {
    event.preventDefault();

    const item = {
        id: Date.now().toString(),
        topic: document.getElementById('topic').value,
        difficulty: document.getElementById('difficulty').value,
        description: document.getElementById('description').value,
        confidence: parseInt(document.getElementById('confidence').value),
        studyTime: parseInt(document.getElementById('study-time').value),
        dateAdded: new Date(),
        lastReviewed: new Date(),
        nextReview: new Date(),
        easeFactor: 2.5, // Initial ease factor
        repetition: 1,
        retention: 100, // Start at 100% retention
        reviewHistory: []
    };

    // Calculate initial next review date
    item.nextReview = calculateNextReview(item);

    knowledgeItems.push(item);
    saveData();

    // Reset form
    knowledgeForm.reset();
    updateConfidenceValue();

    updateDashboard();
    renderKnowledgeList();
    showNotification('Knowledge item added successfully!', 'success');
}

// Calculate next review date using spaced repetition
function calculateNextReview(item) {
    const interval = REPETITION_INTERVALS[item.repetition] || 1;
    const adjustedInterval = Math.round(interval * item.easeFactor * DIFFICULTY_MULTIPLIERS[item.difficulty]);

    const nextReview = new Date(item.lastReviewed);
    nextReview.setDate(nextReview.getDate() + adjustedInterval);

    return nextReview;
}

// Calculate current retention percentage
function calculateRetention(item) {
    const daysSinceReview = (new Date() - item.lastReviewed) / (1000 * 60 * 60 * 24);
    const forgettingRate = FORGETTING_RATES[item.difficulty];

    // Simplified exponential decay model
    const retention = Math.max(0, Math.exp(-forgettingRate * daysSinceReview) * 100);
    return Math.round(retention);
}

// Update retention for all items
function updateRetentionLevels() {
    knowledgeItems.forEach(item => {
        item.retention = calculateRetention(item);
    });
    saveData();
}

// Handle study session response
function handleStudyResponse(event) {
    if (!currentStudySession) return;

    const response = event.target.id; // difficult, good, easy
    const item = knowledgeItems.find(item => item.id === currentStudySession.id);

    if (!item) return;

    // Update item based on response
    const oldEaseFactor = item.easeFactor;
    item.easeFactor = Math.max(1.3, oldEaseFactor * EASE_FACTORS[response]);

    if (response === 'difficult') {
        item.repetition = 1; // Reset to beginning
    } else {
        item.repetition = Math.min(7, item.repetition + 1);
    }

    item.lastReviewed = new Date();
    item.nextReview = calculateNextReview(item);
    item.retention = 100; // Reset retention after review

    // Record review history
    item.reviewHistory.push({
        date: new Date(),
        response: response,
        retentionBefore: item.retention,
        easeFactor: item.easeFactor
    });

    saveData();
    updateDashboard();
    renderKnowledgeList();

    // End study session
    endStudySession();

    showNotification(`Review completed! Next review: ${formatDate(item.nextReview)}`, 'success');
}

// Start study session with next due item
function startStudySession() {
    updateRetentionLevels();

    const dueItems = knowledgeItems.filter(item => {
        return item.nextReview <= new Date() && item.retention < 90;
    }).sort((a, b) => a.retention - b.retention); // Prioritize items with lowest retention

    if (dueItems.length === 0) {
        showNotification('No items due for review right now!', 'info');
        return;
    }

    currentStudySession = dueItems[0];
    renderStudySession();
    studySession.style.display = 'block';
    studySession.scrollIntoView({ behavior: 'smooth' });
}

// End study session
function endStudySession() {
    currentStudySession = null;
    studySession.style.display = 'none';
}

// Render study session
function renderStudySession() {
    if (!currentStudySession) return;

    const item = knowledgeItems.find(item => item.id === currentStudySession.id);
    if (!item) return;

    document.getElementById('study-topic').textContent = item.topic;
    document.getElementById('study-description').textContent = item.description;
    document.getElementById('study-difficulty').textContent = `Difficulty: ${item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}`;
    document.getElementById('study-retention').textContent = `Current Retention: ${item.retention}%`;
}

// Render knowledge items list
function renderKnowledgeList() {
    const filter = filterStatus.value;
    const searchTerm = searchItems.value.toLowerCase();

    updateRetentionLevels();

    let filteredItems = knowledgeItems.filter(item => {
        // Search filter
        if (searchTerm && !item.topic.toLowerCase().includes(searchTerm) &&
            !item.description.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Status filter
        switch (filter) {
            case 'new':
                return item.repetition === 1;
            case 'learning':
                return item.repetition > 1 && item.repetition < 4;
            case 'review':
                return item.nextReview <= new Date();
            case 'mastered':
                return item.repetition >= 6;
            default:
                return true;
        }
    });

    // Sort by next review date
    filteredItems.sort((a, b) => a.nextReview - b.nextReview);

    if (filteredItems.length === 0) {
        knowledgeList.innerHTML = '<div class="no-data"><p>No knowledge items match your filters.</p></div>';
        return;
    }

    const html = filteredItems.map(item => `
        <div class="knowledge-item ${getItemStatusClass(item)}">
            <div class="item-header">
                <h3>${item.topic}</h3>
                <div class="item-meta">
                    <span class="difficulty ${item.difficulty}">${item.difficulty}</span>
                    <span class="retention">Retention: ${item.retention}%</span>
                </div>
            </div>
            <p class="item-description">${item.description}</p>
            <div class="item-stats">
                <div class="stat">
                    <span class="stat-label">Repetitions:</span>
                    <span class="stat-value">${item.repetition}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Last Review:</span>
                    <span class="stat-value">${formatDate(item.lastReviewed)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Next Review:</span>
                    <span class="stat-value">${formatDate(item.nextReview)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Ease Factor:</span>
                    <span class="stat-value">${item.easeFactor.toFixed(1)}</span>
                </div>
            </div>
            <div class="item-actions">
                <button onclick="startReview('${item.id}')" class="btn btn-small btn-primary">📖 Review Now</button>
                <button onclick="editItem('${item.id}')" class="btn btn-small btn-secondary">✏️ Edit</button>
                <button onclick="deleteItem('${item.id}')" class="btn btn-small btn-danger">🗑️ Delete</button>
            </div>
        </div>
    `).join('');

    knowledgeList.innerHTML = html;
}

// Get CSS class for item status
function getItemStatusClass(item) {
    if (item.nextReview <= new Date()) return 'due';
    if (item.retention < 50) return 'low-retention';
    if (item.repetition >= 6) return 'mastered';
    return 'normal';
}

// Update dashboard statistics
function updateDashboard() {
    updateRetentionLevels();

    const totalItems = knowledgeItems.length;
    const dueToday = knowledgeItems.filter(item => {
        const today = new Date();
        const itemDate = new Date(item.nextReview);
        return itemDate.toDateString() === today.toDateString();
    }).length;

    const avgRetention = totalItems > 0 ?
        Math.round(knowledgeItems.reduce((sum, item) => sum + item.retention, 0) / totalItems) : 0;

    // Calculate study streak
    updateStudyStreak();

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('due-today').textContent = dueToday;
    document.getElementById('avg-retention').textContent = `${avgRetention}%`;
    document.getElementById('study-streak').textContent = studyStreak;

    renderUpcomingReviews();
}

// Update study streak
function updateStudyStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

    if (lastStudyDate === today) {
        // Already studied today
        return;
    } else if (lastStudyDate === yesterday) {
        // Studied yesterday, continue streak
        studyStreak++;
        lastStudyDate = today;
    } else {
        // Streak broken or first study
        studyStreak = 1;
        lastStudyDate = today;
    }

    localStorage.setItem('studyStreak', studyStreak);
    localStorage.setItem('lastStudyDate', lastStudyDate);
}

// Render upcoming reviews
function renderUpcomingReviews() {
    const upcoming = knowledgeItems
        .filter(item => item.nextReview > new Date())
        .sort((a, b) => a.nextReview - b.nextReview)
        .slice(0, 5);

    if (upcoming.length === 0) {
        document.getElementById('upcoming-reviews').innerHTML = '<p class="no-data">No upcoming reviews scheduled.</p>';
        return;
    }

    const html = upcoming.map(item => `
        <div class="upcoming-item">
            <div class="upcoming-topic">${item.topic}</div>
            <div class="upcoming-date">${formatDate(item.nextReview)}</div>
            <div class="upcoming-retention">Retention: ${item.retention}%</div>
        </div>
    `).join('');

    document.getElementById('upcoming-reviews').innerHTML = html;
}

// Check for due reviews and show notification
function checkForDueReviews() {
    const dueItems = knowledgeItems.filter(item => item.nextReview <= new Date());
    if (dueItems.length > 0) {
        showNotification(`${dueItems.length} item(s) due for review!`, 'warning');
    }
}

// Generate sample data for demonstration
function generateSampleData() {
    const sampleItems = [
        {
            topic: "Machine Learning Basics",
            difficulty: "medium",
            description: "Supervised vs unsupervised learning, training/validation/test sets, overfitting concepts",
            confidence: 8,
            studyTime: 45
        },
        {
            topic: "Calculus Derivatives",
            difficulty: "hard",
            description: "Power rule, product rule, chain rule, implicit differentiation",
            confidence: 6,
            studyTime: 60
        },
        {
            topic: "Spanish Verb Conjugation",
            difficulty: "easy",
            description: "Present tense -ar, -er, -ir verbs, irregular verbs: ser, estar, ir",
            confidence: 9,
            studyTime: 30
        },
        {
            topic: "Quantum Physics Principles",
            difficulty: "expert",
            description: "Wave-particle duality, uncertainty principle, quantum entanglement",
            confidence: 4,
            studyTime: 90
        },
        {
            topic: "Data Structures",
            difficulty: "medium",
            description: "Arrays, linked lists, stacks, queues, trees, hash tables",
            confidence: 7,
            studyTime: 50
        }
    ];

    sampleItems.forEach(sample => {
        const item = {
            id: Date.now().toString() + Math.random(),
            ...sample,
            dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
            lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
            easeFactor: 2.0 + Math.random() * 1.0,
            repetition: Math.floor(Math.random() * 5) + 1,
            retention: Math.floor(Math.random() * 100),
            reviewHistory: []
        };

        item.nextReview = calculateNextReview(item);
        knowledgeItems.push(item);
    });

    saveData();
    updateDashboard();
    renderKnowledgeList();
    showNotification('Sample data generated successfully!', 'success');
}

// Show retention chart
function showRetentionChart() {
    analyticsContainer.classList.remove('hidden');

    const ctx = document.getElementById('retention-chart').getContext('2d');

    // Group items by difficulty
    const difficultyGroups = {
        easy: [],
        medium: [],
        hard: [],
        expert: []
    };

    knowledgeItems.forEach(item => {
        if (difficultyGroups[item.difficulty]) {
            difficultyGroups[item.difficulty].push(item);
        }
    });

    // Create chart data
    const datasets = Object.entries(difficultyGroups).map(([difficulty, items]) => {
        const data = items.map(item => ({
            x: (new Date() - item.lastReviewed) / (1000 * 60 * 60 * 24), // Days since review
            y: item.retention
        }));

        return {
            label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
            data: data,
            borderColor: getDifficultyColor(difficulty),
            backgroundColor: getDifficultyColor(difficulty, 0.1),
            fill: false,
            tension: 0.4
        };
    });

    new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Retention Curves by Difficulty Level'
                },
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Days Since Last Review'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Retention (%)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Show forgetting patterns chart
function showForgettingChart() {
    analyticsContainer.classList.remove('hidden');

    const ctx = document.getElementById('retention-chart').getContext('2d');

    // Generate theoretical forgetting curves
    const days = Array.from({length: 30}, (_, i) => i + 1);
    const datasets = Object.entries(FORGETTING_RATES).map(([difficulty, rate]) => ({
        label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        data: days.map(day => ({ x: day, y: Math.max(0, Math.exp(-rate * day) * 100) })),
        borderColor: getDifficultyColor(difficulty),
        backgroundColor: getDifficultyColor(difficulty, 0.1),
        fill: false,
        tension: 0.4
    }));

    new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Theoretical Forgetting Curves (Ebbinghaus Model)'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Days'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Retention (%)'
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Get color for difficulty level
function getDifficultyColor(difficulty, alpha = 1) {
    const colors = {
        easy: `rgba(34, 197, 94, ${alpha})`,
        medium: `rgba(251, 191, 36, ${alpha})`,
        hard: `rgba(239, 68, 68, ${alpha})`,
        expert: `rgba(147, 51, 234, ${alpha})`
    };
    return colors[difficulty] || `rgba(156, 163, 175, ${alpha})`;
}

// Export learning data
function exportLearningData() {
    const data = {
        knowledgeItems,
        studyStreak,
        lastStudyDate,
        exportDate: new Date()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Learning data exported successfully!', 'success');
}

// Utility functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function showNotification(message, type = 'info') {
    // Simple notification - could be enhanced with a proper notification system
    alert(`${type.toUpperCase()}: ${message}`);
}

// Start review for specific item
function startReview(itemId) {
    const item = knowledgeItems.find(item => item.id === itemId);
    if (!item) return;

    currentStudySession = item;
    renderStudySession();
    studySession.style.display = 'block';
    studySession.scrollIntoView({ behavior: 'smooth' });
}

// Edit item (simplified - just shows alert for now)
function editItem(itemId) {
    showNotification('Edit functionality would be implemented here', 'info');
}

// Delete item
function deleteItem(itemId) {
    if (confirm('Are you sure you want to delete this knowledge item?')) {
        knowledgeItems = knowledgeItems.filter(item => item.id !== itemId);
        saveData();
        updateDashboard();
        renderKnowledgeList();
        showNotification('Item deleted successfully', 'success');
    }
}

// Data persistence
function saveData() {
    localStorage.setItem('knowledgeItems', JSON.stringify(knowledgeItems));
    localStorage.setItem('studyStreak', studyStreak);
    localStorage.setItem('lastStudyDate', lastStudyDate);
}

function loadData() {
    const savedItems = localStorage.getItem('knowledgeItems');
    if (savedItems) {
        knowledgeItems = JSON.parse(savedItems).map(item => ({
            ...item,
            dateAdded: new Date(item.dateAdded),
            lastReviewed: new Date(item.lastReviewed),
            nextReview: new Date(item.nextReview)
        }));
    }

    studyStreak = parseInt(localStorage.getItem('studyStreak')) || 0;
    lastStudyDate = localStorage.getItem('lastStudyDate');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);