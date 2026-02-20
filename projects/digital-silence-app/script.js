        // App state variables
        let focusTimer = 0;
        let isTracking = false;
        let isPaused = false;
        let timerInterval = null;
        let lastInteractionTime = Date.now();
        
        // Statistics
        let stats = {
            todayTime: 452, // in seconds (for demo)
            longestSession: 2721, // in seconds (for demo)
            interruptions: 8,
            avgFocus: 1122, // in seconds (for demo)
            sessions: []
        };
        
        // DOM Elements
        const timerDisplay = document.getElementById('timer');
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const todayTimeEl = document.getElementById('todayTime');
        const longestSessionEl = document.getElementById('longestSession');
        const interruptionsEl = document.getElementById('interruptions');
        const avgFocusEl = document.getElementById('avgFocus');
        const chartBar = document.getElementById('chartBar');
        const currentStreakEl = document.getElementById('currentStreak');
        const bestTimeEl = document.getElementById('bestTime');
        const interruptionRateEl = document.getElementById('interruptionRate');
        
        // Initialize the app
        function initApp() {
            updateStatsDisplay();
            generateChart();
            updateInsights();
            
            // Set up event listeners for controls
            startBtn.addEventListener('click', startTracking);
            pauseBtn.addEventListener('click', pauseTracking);
            resetBtn.addEventListener('click', resetTracking);
            
            // Set up event listeners for user interaction detection
            document.addEventListener('mousemove', handleUserInteraction);
            document.addEventListener('keydown', handleUserInteraction);
            document.addEventListener('click', handleUserInteraction);
        }
        
        // Start tracking focus time
        function startTracking() {
            if (isTracking) return;
            
            isTracking = true;
            isPaused = false;
            lastInteractionTime = Date.now();
            
            timerInterval = setInterval(updateTimer, 1000);
            
            statusDot.className = 'status-dot active';
            statusText.textContent = 'Focusing';
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            
            // Add a new session to stats
            stats.sessions.push({
                start: Date.now(),
                end: null,
                duration: 0
            });
        }
        
        // Pause tracking
        function pauseTracking() {
            if (!isTracking || isPaused) return;
            
            isPaused = true;
            clearInterval(timerInterval);
            
            statusDot.className = 'status-dot inactive';
            statusText.textContent = 'Paused';
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        }
        
        // Resume tracking (if paused)
        function resumeTracking() {
            if (!isTracking || !isPaused) return;
            
            isPaused = false;
            lastInteractionTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
            
            statusDot.className = 'status-dot active';
            statusText.textContent = 'Focusing';
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
        
        // Reset tracking
        function resetTracking() {
            clearInterval(timerInterval);
            isTracking = false;
            isPaused = false;
            focusTimer = 0;
            
            updateTimerDisplay();
            
            statusDot.className = 'status-dot inactive';
            statusText.textContent = 'Not Tracking';
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        }
        
        // Update the timer every second
        function updateTimer() {
            const currentTime = Date.now();
            const timeDiff = Math.floor((currentTime - lastInteractionTime) / 1000);
            
            // If user has interacted recently, reset the timer
            if (timeDiff < 1) {
                focusTimer = 0;
                stats.interruptions++;
                updateStatsDisplay();
            } else {
                focusTimer = timeDiff;
                
                // Update the current session duration
                if (stats.sessions.length > 0) {
                    const currentSession = stats.sessions[stats.sessions.length - 1];
                    currentSession.duration = focusTimer;
                    
                    // Update longest session if needed
                    if (focusTimer > stats.longestSession) {
                        stats.longestSession = focusTimer;
                    }
                }
            }
            
            updateTimerDisplay();
            updateInsights();
        }
        
        // Handle user interaction (mouse move, key press, click)
        function handleUserInteraction() {
            lastInteractionTime = Date.now();
            
            // If tracking and not paused, log an interruption
            if (isTracking && !isPaused) {
                stats.interruptions++;
                interruptionsEl.textContent = stats.interruptions;
            }
            
            // If paused and user interacts, resume tracking
            if (isPaused) {
                resumeTracking();
            }
        }
        
        // Format seconds to HH:MM:SS
        function formatTime(seconds) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // Update timer display
        function updateTimerDisplay() {
            timerDisplay.textContent = formatTime(focusTimer);
        }
        
        // Update statistics display
        function updateStatsDisplay() {
            todayTimeEl.textContent = formatTime(stats.todayTime + focusTimer);
            longestSessionEl.textContent = formatTime(stats.longestSession);
            interruptionsEl.textContent = stats.interruptions;
            avgFocusEl.textContent = formatTime(stats.avgFocus);
        }
        
        // Generate chart for focus pattern
        function generateChart() {
            chartBar.innerHTML = '';
            
            // Generate sample data for the chart (in a real app, this would come from actual tracking)
            const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM'];
            const focusData = [30, 45, 20, 15, 40, 55, 35, 25]; // in minutes
            
            const maxFocus = Math.max(...focusData);
            
            hours.forEach((hour, index) => {
                const column = document.createElement('div');
                const height = (focusData[index] / maxFocus) * 100;
                
                column.className = 'chart-column';
                column.style.height = `${height}%`;
                column.title = `${focusData[index]} minutes focused`;
                
                const label = document.createElement('div');
                label.className = 'chart-label';
                label.textContent = hour;
                
                column.appendChild(label);
                chartBar.appendChild(column);
            });
        }
        
        // Update insights based on current data
        function updateInsights() {
            // Current streak in minutes
            const currentStreakMinutes = Math.floor(focusTimer / 60);
            currentStreakEl.textContent = currentStreakMinutes === 1 ? '1 minute' : `${currentStreakMinutes} minutes`;
            
            // Best time in minutes
            const bestTimeMinutes = Math.floor(stats.longestSession / 60);
            bestTimeEl.textContent = bestTimeMinutes === 1 ? '1 minute' : `${bestTimeMinutes} minutes`;
            
            // Interruption rate (average minutes between interruptions)
            const avgFocusMinutes = Math.floor(stats.avgFocus / 60);
            interruptionRateEl.textContent = avgFocusMinutes === 1 ? '1 minute' : `${avgFocusMinutes} minutes`;
        }
        
        // Initialize the app when the page loads
        window.addEventListener('DOMContentLoaded', initApp);