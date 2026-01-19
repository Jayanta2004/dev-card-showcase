// HabitChain - Daily Habit Tracker

// Application State
const appState = {
    habits: [],
    currentHabitId: null,
    currentYear: new Date().getFullYear(),
    theme: 'light',
    selectedDate: new Date().toISOString().split('T')[0],
    checkinStatus: null,
    checkinIntensity: 2
};

// DOM Elements
const themeToggle = document.getElementById('toggle-theme');
const currentDateEl = document.getElementById('current-date');
const addHabitBtn = document.getElementById('add-habit-btn');
const newHabitModal = document.getElementById('new-habit-modal');
const closeNewHabitModal = document.getElementById('close-new-habit-modal');
const cancelNewHabitBtn = document.getElementById('cancel-new-habit');
const createHabitBtn = document.getElementById('create-habit');
const habitsContainer = document.getElementById('habits-container');
const currentHabitNameEl = document.getElementById('current-habit-name');
const viewStatsBtn = document.getElementById('view-stats');
const freezeDayBtn = document.getElementById('freeze-day');
const prevYearBtn = document.getElementById('prev-year');
const nextYearBtn = document.getElementById('next-year');
const currentYearEl = document.getElementById('current-year');
const currentStreakValue = document.getElementById('current-streak-value');
const longestStreakValue = document.getElementById('longest-streak-value');
const consistencyValue = document.getElementById('consistency-value');
const totalDaysValue = document.getElementById('total-days-value');
const streakStartDate = document.getElementById('streak-start-date');
const longestStreakDate = document.getElementById('longest-streak-date');
const completionRate = document.getElementById('completion-rate');
const daysTracked = document.getElementById('days-tracked');
const heatmapGrid = document.getElementById('heatmap-grid');
const monthLabels = document.querySelector('.month-labels');
const todayDateDisplay = document.getElementById('today-date-display');
const streakReminder = document.getElementById('streak-reminder');
const checkinPlaceholder = document.getElementById('checkin-placeholder');
const checkinActive = document.getElementById('checkin-active');
const todayHabitName = document.getElementById('today-habit-name');
const todayHabitTarget = document.getElementById('today-habit-target');
const completionBtns = document.querySelectorAll('.completion-btn');
const intensityOptions = document.getElementById('intensity-options');
const intensitySlider = document.getElementById('intensity-slider');
const dailyNotes = document.getElementById('daily-notes');
const saveCheckinBtn = document.getElementById('save-checkin');
const skipTodayBtn = document.getElementById('skip-today');
const motivationMessage = document.getElementById('motivation-message');
const historyRange = document.getElementById('history-range');
const historyPlaceholder = document.getElementById('history-placeholder');
const historyList = document.getElementById('history-list');
const statsModal = document.getElementById('stats-modal');
const closeStatsModal = document.getElementById('close-stats-modal');
const exportDataBtn = document.getElementById('export-data');
const importDataBtn = document.getElementById('import-data');
const resetDataBtn = document.getElementById('reset-data');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// Initialize the application
function init() {
    // Set current date
    updateCurrentDate();
    
    // Load data from localStorage
    loadAppData();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Render initial UI
    renderHabits();
    updateYearDisplay();
    generateHeatmap();
    updateDailyCheckin();
    updateMotivationMessage();
    
    // If there are habits, select the first one
    if (appState.habits.length > 0 && !appState.currentHabitId) {
        selectHabit(appState.habits[0].id);
    }
}

// Update current date display
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    
    // Update today's date in check-in section
    const todayOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    todayDateDisplay.textContent = now.toLocaleDateString('en-US', todayOptions);
}

// Load application data from localStorage
function loadAppData() {
    // Load theme preference
    const savedTheme = localStorage.getItem('habitChainTheme');
    if (savedTheme === 'dark') {
        enableDarkTheme();
    }
    
    // Load habits
    const savedHabits = localStorage.getItem('habitChainHabits');
    if (savedHabits) {
        appState.habits = JSON.parse(savedHabits);
    } else {
        // Initialize with sample habits
        initializeSampleHabits();
    }
    
    // Load current habit selection
    const savedCurrentHabit = localStorage.getItem('habitChainCurrentHabit');
    if (savedCurrentHabit) {
        appState.currentHabitId = savedCurrentHabit;
    }
}

// Initialize with sample habits
function initializeSampleHabits() {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Generate sample data for the past year
    const sampleData = {};
    let currentDate = new Date(oneYearAgo);
    
    while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // 70% completion rate
        if (Math.random() > 0.3) {
            // 80% of completions are full, 20% are partial
            if (Math.random() > 0.2) {
                sampleData[dateStr] = {
                    status: 'completed',
                    intensity: Math.floor(Math.random() * 4) + 1,
                    notes: Math.random() > 0.7 ? 'Felt great today!' : ''
                };
            } else {
                sampleData[dateStr] = {
                    status: 'partial',
                    intensity: Math.floor(Math.random() * 2) + 1,
                    notes: Math.random() > 0.8 ? 'Short session today' : ''
                };
            }
        } else {
            sampleData[dateStr] = {
                status: 'missed',
                intensity: 0,
                notes: Math.random() > 0.9 ? 'Was busy today' : ''
            };
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    appState.habits = [
        {
            id: 'habit-1',
            name: 'Morning Meditation',
            category: 'mindfulness',
            color: '#10b981',
            difficulty: 3,
            target: '10 minutes',
            createdAt: new Date().toISOString(),
            history: sampleData,
            streakFreezes: 3
        },
        {
            id: 'habit-2',
            name: 'Daily Reading',
            category: 'learning',
            color: '#3b82f6',
            difficulty: 2,
            target: '30 pages',
            createdAt: new Date().toISOString(),
            history: {},
            streakFreezes: 5
        },
        {
            id: 'habit-3',
            name: 'Evening Workout',
            category: 'health',
            color: '#ef4444',
            difficulty: 4,
            target: '45 minutes',
            createdAt: new Date().toISOString(),
            history: {},
            streakFreezes: 2
        }
    ];
    
    saveAppData();
}

// Save application data to localStorage
function saveAppData() {
    localStorage.setItem('habitChainTheme', appState.theme);
    localStorage.setItem('habitChainHabits', JSON.stringify(appState.habits));
    localStorage.setItem('habitChainCurrentHabit', appState.currentHabitId);
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Habit management
    addHabitBtn.addEventListener('click', () => newHabitModal.style.display = 'flex');
    closeNewHabitModal.addEventListener('click', () => newHabitModal.style.display = 'none');
    cancelNewHabitBtn.addEventListener('click', () => newHabitModal.style.display = 'none');
    createHabitBtn.addEventListener('click', createNewHabit);
    
    // Year navigation
    prevYearBtn.addEventListener('click', () => {
        appState.currentYear--;
        updateYearDisplay();
        generateHeatmap();
    });
    
    nextYearBtn.addEventListener('click', () => {
        appState.currentYear++;
        updateYearDisplay();
        generateHeatmap();
    });
    
    // Daily check-in
    completionBtns.forEach(btn => {
        btn.addEventListener('click', handleCompletionSelection);
    });
    
    intensitySlider.addEventListener('input', handleIntensityChange);
    saveCheckinBtn.addEventListener('click', saveDailyCheckin);
    skipTodayBtn.addEventListener('click', skipToday);
    
    // Stats modal
    viewStatsBtn.addEventListener('click', () => statsModal.style.display = 'flex');
    closeStatsModal.addEventListener('click', () => statsModal.style.display = 'none');
    
    // Data management
    exportDataBtn.addEventListener('click', exportData);
    importDataBtn.addEventListener('click', importData);
    resetDataBtn.addEventListener('click', resetData);
    
    // History filter
    historyRange.addEventListener('change', updateHistory);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newHabitModal) {
            newHabitModal.style.display = 'none';
        }
        if (e.target === statsModal) {
            statsModal.style.display = 'none';
        }
    });
    
    // Setup difficulty options
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-option').forEach(opt => {
                opt.classList.remove('active');
            });
            option.classList.add('active');
            document.getElementById('habit-difficulty').value = option.getAttribute('data-level');
        });
    });
    
    // Setup color options
    document.querySelectorAll('.color-option').forEach(color => {
        color.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(c => {
                c.classList.remove('active');
            });
            color.classList.add('active');
            document.getElementById('habit-color').value = color.getAttribute('data-color');
        });
    });
    
    // Setup reminder checkbox
    document.getElementById('habit-reminder').addEventListener('change', (e) => {
        document.getElementById('reminder-time').disabled = !e.target.checked;
    });
}

// Theme management
function toggleTheme() {
    if (appState.theme === 'light') {
        enableDarkTheme();
    } else {
        enableLightTheme();
    }
    saveAppData();
}

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    appState.theme = 'dark';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
}

function enableLightTheme() {
    document.body.classList.remove('dark-theme');
    appState.theme = 'light';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
}

// Habit management
function renderHabits() {
    habitsContainer.innerHTML = '';
    
    if (appState.habits.length === 0) {
        habitsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-plus-circle"></i>
                <p>Add your first habit to start tracking!</p>
            </div>
        `;
        return;
    }
    
    appState.habits.forEach(habit => {
        const streakInfo = calculateStreak(habit);
        const completionRate = calculateCompletionRate(habit);
        
        const habitCard = document.createElement('div');
        habitCard.className = `habit-card ${habit.id === appState.currentHabitId ? 'active' : ''}`;
        habitCard.innerHTML = `
            <div class="habit-card-header">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-streak">
                    <i class="fas fa-fire"></i>
                    <span>${streakInfo.current} days</span>
                </div>
            </div>
            <div class="habit-details">
                <span class="habit-category">${habit.category}</span>
                <div class="habit-progress">
                    <div class="habit-progress-fill" style="width: ${completionRate}%"></div>
                </div>
            </div>
        `;
        
        habitCard.addEventListener('click', () => selectHabit(habit.id));
        habitsContainer.appendChild(habitCard);
    });
}

function selectHabit(habitId) {
    appState.currentHabitId = habitId;
    renderHabits();
    updateDashboard();
    generateHeatmap();
    updateDailyCheckin();
    updateHistory();
    
    // Enable controls
    viewStatsBtn.disabled = false;
    freezeDayBtn.disabled = false;
    
    saveAppData();
}

function createNewHabit() {
    const name = document.getElementById('habit-name').value.trim();
    const category = document.getElementById('habit-category').value;
    const difficulty = parseInt(document.getElementById('habit-difficulty').value);
    const target = document.getElementById('habit-target').value.trim();
    const color = document.getElementById('habit-color').value;
    
    if (!name) {
        showToast('Please enter a habit name');
        return;
    }
    
    const newHabit = {
        id: 'habit-' + Date.now(),
        name: name,
        category: category,
        color: color,
        difficulty: difficulty,
        target: target || '',
        createdAt: new Date().toISOString(),
        history: {},
        streakFreezes: 5 // Start with 5 freezes
    };
    
    appState.habits.push(newHabit);
    saveAppData();
    renderHabits();
    selectHabit(newHabit.id);
    
    newHabitModal.style.display = 'none';
    
    // Reset form
    document.getElementById('habit-name').value = '';
    document.getElementById('habit-target').value = '';
    
    showToast(`Created new habit: ${name}`);
}

// Dashboard updates
function updateDashboard() {
    const habit = getCurrentHabit();
    if (!habit) return;
    
    currentHabitNameEl.textContent = habit.name;
    
    const streakInfo = calculateStreak(habit);
    const completionInfo = calculateCompletionRate(habit, 30);
    const totalDays = calculateTotalDays(habit);
    
    // Update streak stats
    currentStreakValue.textContent = `${streakInfo.current} days`;
    longestStreakValue.textContent = `${streakInfo.longest} days`;
    consistencyValue.textContent = `${completionInfo.rate}%`;
    totalDaysValue.textContent = totalDays;
    
    // Update streak details
    if (streakInfo.current > 0) {
        const startDate = new Date(streakInfo.startDate);
        streakStartDate.textContent = `Started ${formatDate(startDate)}`;
    } else {
        streakStartDate.textContent = 'Start tracking to begin!';
    }
    
    if (streakInfo.longest > 0) {
        const longestDate = new Date(streakInfo.longestEndDate);
        longestStreakDate.textContent = `Ended ${formatDate(longestDate)}`;
    } else {
        longestStreakDate.textContent = 'Your record will appear here';
    }
    
    completionRate.textContent = `Last 30 days: ${completionInfo.rate}%`;
    daysTracked.textContent = `Days completed this year`;
    
    // Update motivation message
    updateMotivationMessage();
}

function getCurrentHabit() {
    return appState.habits.find(h => h.id === appState.currentHabitId);
}

function calculateStreak(habit) {
    const today = new Date();
    const history = habit.history || {};
    
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakStart = null;
    let longestStreakEnd = null;
    
    let tempStreak = 0;
    let currentDate = new Date(today);
    
    // Calculate current streak
    while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const entry = history[dateStr];
        
        if (entry && (entry.status === 'completed' || entry.status === 'partial')) {
            tempStreak++;
            if (currentStreakStart === null) {
                currentStreakStart = new Date(currentDate);
            }
        } else {
            // Check if we can use a freeze day
            if (habit.streakFreezes > 0 && entry && entry.status === 'freeze') {
                tempStreak++;
                habit.streakFreezes--;
            } else {
                break;
            }
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
        
        // Limit to 2 years for performance
        const twoYearsAgo = new Date(today);
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        if (currentDate < twoYearsAgo) break;
    }
    
    currentStreak = tempStreak;
    
    // Calculate longest streak
    const dates = Object.keys(history).sort();
    let longestTemp = 0;
    let currentLongestEnd = null;
    
    for (const dateStr of dates) {
        const entry = history[dateStr];
        
        if (entry.status === 'completed' || entry.status === 'partial') {
            longestTemp++;
            currentLongestEnd = dateStr;
        } else {
            if (longestTemp > longestStreak) {
                longestStreak = longestTemp;
                longestStreakEnd = currentLongestEnd;
            }
            longestTemp = 0;
        }
    }
    
    // Check last streak
    if (longestTemp > longestStreak) {
        longestStreak = longestTemp;
        longestStreakEnd = currentLongestEnd;
    }
    
    return {
        current: currentStreak,
        longest: longestStreak,
        startDate: currentStreakStart,
        longestEndDate: longestStreakEnd
    };
}

function calculateCompletionRate(habit, days = 365) {
    const today = new Date();
    const history = habit.history || {};
    
    let completed = 0;
    let total = 0;
    
    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const entry = history[dateStr];
        if (entry) {
            total++;
            if (entry.status === 'completed') completed += 1;
            else if (entry.status === 'partial') completed += 0.5;
        }
    }
    
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
        rate: rate,
        completed: completed,
        total: total
    };
}

function calculateTotalDays(habit) {
    const history = habit.history || {};
    let total = 0;
    
    for (const dateStr in history) {
        const entry = history[dateStr];
        if (entry.status === 'completed' || entry.status === 'partial') {
            total++;
        }
    }
    
    return total;
}

// Year navigation
function updateYearDisplay() {
    currentYearEl.textContent = appState.currentYear;
    prevYearBtn.disabled = appState.currentYear <= new Date().getFullYear() - 10;
    nextYearBtn.disabled = appState.currentYear >= new Date().getFullYear();
}

// Heatmap generation
function generateHeatmap() {
    // Clear existing heatmap
    heatmapGrid.innerHTML = '';
    monthLabels.innerHTML = '';
    
    const habit = getCurrentHabit();
    if (!habit) {
        heatmapGrid.innerHTML = '<div class="empty-heatmap">Select a habit to see your progress</div>';
        return;
    }
    
    const history = habit.history || {};
    const year = appState.currentYear;
    
    // Generate month labels
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let month = 0; month < 12; month++) {
        const monthLabel = document.createElement('div');
        monthLabel.className = 'month-label';
        monthLabel.textContent = monthNames[month];
        monthLabels.appendChild(monthLabel);
    }
    
    // Calculate first day of year
    const firstDay = new Date(year, 0, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust to start on Monday (GitHub style)
    let offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Create empty cells for offset
    for (let i = 0; i < offset; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty';
        heatmapGrid.appendChild(emptyCell);
    }
    
    // Create cells for each day of the year
    const daysInYear = isLeapYear(year) ? 366 : 365;
    const today = new Date();
    const isCurrentYear = year === today.getFullYear();
    
    for (let day = 0; day < daysInYear; day++) {
        const currentDate = new Date(year, 0, day + 1);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        
        // Check if this is today
        const isToday = isCurrentYear && 
                       currentDate.getDate() === today.getDate() &&
                       currentDate.getMonth() === today.getMonth();
        
        // Get habit entry for this day
        const entry = history[dateStr];
        let level = 0;
        let valueText = 'No entry';
        
        if (entry) {
            if (entry.status === 'completed') {
                level = entry.intensity || 4;
                valueText = 'Completed';
            } else if (entry.status === 'partial') {
                level = entry.intensity || 2;
                valueText = 'Partial';
            } else if (entry.status === 'missed') {
                level = 0;
                valueText = 'Missed';
            } else if (entry.status === 'freeze') {
                level = 0;
                valueText = 'Freeze day used';
            }
        }
        
        cell.classList.add(`level-${level}`);
        if (isToday) cell.classList.add('today');
        
        // Add tooltip data
        const displayDate = currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        cell.setAttribute('data-date', displayDate);
        cell.setAttribute('data-value', valueText);
        
        // Add click handler to view/edit entry
        cell.addEventListener('click', () => {
            if (entry) {
                showDayDetails(dateStr, entry);
            }
        });
        
        heatmapGrid.appendChild(cell);
    }
}

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function showDayDetails(dateStr, entry) {
    // In a real implementation, this would show a modal with day details
    console.log(`Day details for ${dateStr}:`, entry);
    showToast(`Viewing entry for ${formatDate(new Date(dateStr))}`);
}

// Daily check-in
function updateDailyCheckin() {
    const habit = getCurrentHabit();
    const today = new Date().toISOString().split('T')[0];
    
    if (!habit) {
        checkinPlaceholder.style.display = 'flex';
        checkinActive.style.display = 'none';
        return;
    }
    
    checkinPlaceholder.style.display = 'none';
    checkinActive.style.display = 'block';
    
    todayHabitName.textContent = habit.name;
    todayHabitTarget.textContent = habit.target ? `Did you ${habit.name.toLowerCase()} (${habit.target}) today?` : `Did you ${habit.name.toLowerCase()} today?`;
    
    // Check if today is already logged
    const todayEntry = habit.history[today];
    if (todayEntry) {
        // Show existing entry
        appState.checkinStatus = todayEntry.status;
        appState.checkinIntensity = todayEntry.intensity || 2;
        
        // Update UI to show existing entry
        completionBtns.forEach(btn => {
            const value = parseFloat(btn.getAttribute('data-value'));
            btn.classList.remove('active');
            
            if ((value === 0 && todayEntry.status === 'missed') ||
                (value === 0.5 && todayEntry.status === 'partial') ||
                (value === 1 && todayEntry.status === 'completed')) {
                btn.classList.add('active');
            }
        });
        
        if (todayEntry.status === 'completed' || todayEntry.status === 'partial') {
            intensityOptions.style.display = 'block';
            intensitySlider.value = todayEntry.intensity || 2;
        } else {
            intensityOptions.style.display = 'none';
        }
        
        dailyNotes.value = todayEntry.notes || '';
        
        saveCheckinBtn.textContent = 'Update Entry';
        streakReminder.textContent = 'Entry already logged for today';
    } else {
        // Reset for new entry
        appState.checkinStatus = null;
        appState.checkinIntensity = 2;
        
        completionBtns.forEach(btn => btn.classList.remove('active'));
        intensityOptions.style.display = 'none';
        dailyNotes.value = '';
        
        saveCheckinBtn.textContent = 'Save Today\'s Entry';
        
        // Update streak reminder
        const streakInfo = calculateStreak(habit);
        if (streakInfo.current > 0) {
            streakReminder.textContent = `Don't break your ${streakInfo.current}-day streak!`;
        } else {
            streakReminder.textContent = 'Start your streak today!';
        }
    }
}

function handleCompletionSelection(e) {
    const value = parseFloat(e.currentTarget.getAttribute('data-value'));
    
    // Update active button
    completionBtns.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    // Update status
    if (value === 0) appState.checkinStatus = 'missed';
    else if (value === 0.5) appState.checkinStatus = 'partial';
    else if (value === 1) appState.checkinStatus = 'completed';
    
    // Show/hide intensity slider
    if (value === 0.5 || value === 1) {
        intensityOptions.style.display = 'block';
    } else {
        intensityOptions.style.display = 'none';
    }
}

function handleIntensityChange(e) {
    appState.checkinIntensity = parseInt(e.target.value);
}

function saveDailyCheckin() {
    const habit = getCurrentHabit();
    if (!habit || !appState.checkinStatus) {
        showToast('Please select a completion status');
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Create or update entry
    habit.history[today] = {
        status: appState.checkinStatus,
        intensity: appState.checkinStatus !== 'missed' ? appState.checkinIntensity : 0,
        notes: dailyNotes.value.trim(),
        timestamp: new Date().toISOString()
    };
    
    saveAppData();
    updateDashboard();
    generateHeatmap();
    updateDailyCheckin();
    updateHistory();
    
    showToast(`Saved ${appState.checkinStatus} entry for today`);
}

function skipToday() {
    const habit = getCurrentHabit();
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Mark as missed
    habit.history[today] = {
        status: 'missed',
        intensity: 0,
        notes: 'Skipped for today',
        timestamp: new Date().toISOString()
    };
    
    saveAppData();
    updateDashboard();
    generateHeatmap();
    updateDailyCheckin();
    updateHistory();
    
    showToast('Marked as missed for today');
}

// Motivation messages
function updateMotivationMessage() {
    const habit = getCurrentHabit();
    if (!habit) {
        motivationMessage.innerHTML = `
            <i class="fas fa-quote-left"></i>
            <span>"Don't break the chain!" - Jerry Seinfeld</span>
            <i class="fas fa-quote-right"></i>
        `;
        return;
    }
    
    const streakInfo = calculateStreak(habit);
    const messages = [
        "Consistency is key. Keep going!",
        "Every day counts. You've got this!",
        "The chain grows stronger with every day.",
        "Small habits lead to big changes.",
        "Your future self will thank you.",
        "Don't break the chain!",
        "Progress, not perfection.",
        "One day at a time.",
        "The hardest part is starting. You've already done that!",
        "Every X on the calendar is a victory."
    ];
    
    if (streakInfo.current === 0) {
        messages.push("Start your streak today!");
        messages.push("Day one or one day? You decide.");
    } else if (streakInfo.current < 7) {
        messages.push(`Keep it up! ${streakInfo.current} days strong.`);
        messages.push("First week is the hardest. You're doing great!");
    } else if (streakInfo.current < 30) {
        messages.push(`Amazing! ${streakInfo.current} days in a row.`);
        messages.push("You're building a solid foundation!");
    } else if (streakInfo.current < 100) {
        messages.push(`Incredible! ${streakInfo.current}-day streak.`);
        messages.push("You're making this a true habit!");
    } else {
        messages.push(`Legendary! ${streakInfo.current} days straight.`);
        messages.push("You're an inspiration!");
    }
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    motivationMessage.innerHTML = `
        <i class="fas fa-quote-left"></i>
        <span>"${randomMessage}"</span>
        <i class="fas fa-quote-right"></i>
    `;
}

// History
function updateHistory() {
    const habit = getCurrentHabit();
    if (!habit) {
        historyPlaceholder.style.display = 'flex';
        historyList.style.display = 'none';
        return;
    }
    
    const range = historyRange.value;
    const history = habit.history || {};
    
    // Get dates within range
    const today = new Date();
    const dates = Object.keys(history).sort().reverse();
    
    let filteredDates = dates;
    if (range !== 'all') {
        const days = parseInt(range);
        const cutoff = new Date(today);
        cutoff.setDate(cutoff.getDate() - days);
        
        filteredDates = dates.filter(dateStr => {
            const date = new Date(dateStr);
            return date >= cutoff;
        });
    }
    
    if (filteredDates.length === 0) {
        historyPlaceholder.style.display = 'flex';
        historyList.style.display = 'none';
        return;
    }
    
    historyPlaceholder.style.display = 'none';
    historyList.style.display = 'block';
    historyList.innerHTML = '';
    
    filteredDates.forEach(dateStr => {
        const entry = history[dateStr];
        const date = new Date(dateStr);
        
        const historyDay = document.createElement('div');
        historyDay.className = 'history-day';
        
        // Format date
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Status indicator
        let statusText = '';
        let statusClass = '';
        let intensityDisplay = '';
        
        switch (entry.status) {
            case 'completed':
                statusText = '✓';
                statusClass = 'completed';
                intensityDisplay = ` • Level ${entry.intensity}/4`;
                break;
            case 'partial':
                statusText = '~';
                statusClass = 'partial';
                intensityDisplay = ` • Level ${entry.intensity}/4`;
                break;
            case 'missed':
                statusText = '✗';
                statusClass = 'missed';
                break;
            case 'freeze':
                statusText = '❄️';
                statusClass = 'freeze';
                break;
        }
        
        historyDay.innerHTML = `
            <div class="history-date">${formattedDate}</div>
            <div class="history-status">
                <div class="status-indicator ${statusClass}">${statusText}</div>
                <div class="history-intensity">
                    <i class="fas fa-bolt"></i>
                    <span>${entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}${intensityDisplay}</span>
                </div>
            </div>
            <div class="history-notes">${entry.notes || ''}</div>
        `;
        
        historyList.appendChild(historyDay);
    });
}

// Data management
function exportData() {
    const data = {
        habits: appState.habits,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitchain-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (!data.habits || !Array.isArray(data.habits)) {
                    throw new Error('Invalid backup file format');
                }
                
                if (confirm('This will replace all current habits. Are you sure?')) {
                    appState.habits = data.habits;
                    appState.currentHabitId = null;
                    
                    saveAppData();
                    renderHabits();
                    updateDashboard();
                    generateHeatmap();
                    updateDailyCheckin();
                    
                    showToast('Data imported successfully');
                }
            } catch (error) {
                console.error('Import error:', error);
                showToast('Error importing data: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetData() {
    if (confirm('This will permanently delete all habits and data. Are you sure?')) {
        localStorage.clear();
        location.reload();
    }
}

// Utility functions
function formatDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);