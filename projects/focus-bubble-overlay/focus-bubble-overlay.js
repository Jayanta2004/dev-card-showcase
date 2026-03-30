// Focus Bubble Overlay - Complete JavaScript Implementation

// ========== State Management ==========
const state = {
    isRunning: false,
    isPaused: false,
    isBreak: false,
    currentTime: 0,
    totalTime: 0,
    sessionCount: 0,
    totalFocusTime: 0,
    currentSession: null,
    animationFrame: null,
    timerInterval: null,
    sessions: []
};

// ========== Settings ==========
let settings = {
    animationType: 'bubbles',
    colorTheme: 'blue',
    animationSpeed: 5,
    overlayOpacity: 95,
    focusDuration: 25,
    breakDuration: 5,
    autoStartBreak: true,
    soundEffects: true,
    ambientSound: 'none',
    notifications: true,
    blockDistractions: false,
    showQuotes: true
};

// ========== Motivational Quotes ==========
const quotes = [
    "Focus is the art of knowing what to ignore.",
    "The secret of getting ahead is getting started.",
    "You don't have to be great to start, but you have to start to be great.",
    "The only way to do great work is to love what you do.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Believe you can and you're halfway there.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Stop wishing. Start doing.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't stop when you're tired. Stop when you're done.",
    "Do something today that your future self will thank you for."
];

// ========== Break Tips ==========
const breakTips = [
    "Stretch your arms and legs",
    "Look away from your screen for 20 seconds",
    "Take a short walk around the room",
    "Drink a glass of water",
    "Do some deep breathing exercises",
    "Close your eyes and relax",
    "Do some neck rolls",
    "Stand up and do some light stretches",
    "Look out the window at something far away",
    "Practice mindful breathing"
];

// ========== Color Themes ==========
const colorThemes = {
    blue: ['#1e3a8a', '#3b82f6', '#60a5fa'],
    purple: ['#581c87', '#a855f7', '#c084fc'],
    green: ['#14532d', '#22c55e', '#86efac'],
    sunset: ['#9a3412', '#f97316', '#fb923c'],
    ocean: ['#164e63', '#06b6d4', '#67e8f9'],
    forest: ['#14532d', '#10b981', '#6ee7b7'],
    lavender: ['#5b21b6', '#a78bfa', '#c4b5fd'],
    midnight: ['#0f172a', '#334155', '#64748b']
};

// ========== Initialization ==========
function init() {
    loadSettings();
    loadStats();
    loadHistory();
    initEventListeners();
    updateDisplay();
    requestNotificationPermission();
    applySettings();
    
    console.log('Focus Bubble Overlay initialized');
}

// ========== Local Storage ==========
function saveSettings() {
    try {
        localStorage.setItem('focusBubbleSettings', JSON.stringify(settings));
        localStorage.setItem('focusBubbleStats', JSON.stringify({
            totalFocusTime: state.totalFocusTime,
            sessionCount: state.sessionCount,
            sessions: state.sessions
        }));
        showNotification('Settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Error saving settings', 'error');
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('focusBubbleSettings');
        if (saved) {
            settings = { ...settings, ...JSON.parse(saved) };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function loadStats() {
    try {
        const saved = localStorage.getItem('focusBubbleStats');
        if (saved) {
            const stats = JSON.parse(saved);
            state.totalFocusTime = stats.totalFocusTime || 0;
            state.sessionCount = stats.sessionCount || 0;
            state.sessions = stats.sessions || [];
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ========== Timer Functions ==========
function startSession() {
    if (state.isRunning) return;
    
    state.isRunning = true;
    state.isPaused = false;
    state.isBreak = false;
    state.currentTime = settings.focusDuration * 60;
    state.totalTime = state.currentTime;
    
    state.currentSession = {
        startTime: new Date(),
        duration: settings.focusDuration,
        completed: false
    };
    
    updateUIForRunning();
    showFocusOverlay();
    startTimer();
    playSound('start');
}

function startBreak() {
    state.isBreak = true;
    state.currentTime = settings.breakDuration * 60;
    state.totalTime = state.currentTime;
    
    showBreakOverlay();
    startTimer();
    playSound('break');
    
    if (settings.notifications) {
        showBrowserNotification('Break Time!', 'Time to rest and recharge.');
    }
}

function startTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    state.timerInterval = setInterval(() => {
        if (!state.isPaused) {
            state.currentTime--;
            
            if (state.currentTime <= 0) {
                completeSession();
            } else {
                updateTimerDisplay();
            }
        }
    }, 1000);
}

function pauseTimer() {
    state.isPaused = !state.isPaused;
    
    const pauseBtn = document.getElementById('pause-btn');
    const overlayPauseBtn = document.getElementById('overlay-pause-btn');
    
    if (state.isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        overlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        playSound('pause');
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        overlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playSound('resume');
    }
}

function stopSession() {
    if (confirm('Are you sure you want to stop this session?')) {
        resetTimer();
        hideFocusOverlay();
        hideBreakOverlay();
        playSound('stop');
    }
}

function skipSession() {
    completeSession();
}

function completeSession() {
    clearInterval(state.timerInterval);
    
    if (state.isBreak) {
        // Break completed
        state.isBreak = false;
        hideBreakOverlay();
        resetTimer();
        playSound('complete');
    } else {
        // Focus session completed
        if (state.currentSession) {
            state.currentSession.completed = true;
            state.currentSession.endTime = new Date();
            state.sessions.push(state.currentSession);
            state.sessionCount++;
            state.totalFocusTime += settings.focusDuration;
        }
        
        hideFocusOverlay();
        playSound('complete');
        
        if (settings.notifications) {
            showBrowserNotification('Session Complete!', 'Great work! Time for a break.');
        }
        
        saveSettings();
        updateStats();
        loadHistory();
        
        if (settings.autoStartBreak) {
            setTimeout(startBreak, 1000);
        } else {
            resetTimer();
        }
    }
}

function resetTimer() {
    state.isRunning = false;
    state.isPaused = false;
    state.currentTime = settings.focusDuration * 60;
    state.totalTime = state.currentTime;
    
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
    }
    
    updateUIForStopped();
    updateTimerDisplay();
}

// ========== Display Updates ==========
function updateTimerDisplay() {
    const minutes = Math.floor(state.currentTime / 60);
    const seconds = state.currentTime % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timer-display').textContent = timeStr;
    document.getElementById('overlay-timer').textContent = timeStr;
    document.getElementById('break-timer').textContent = timeStr;
    
    // Update progress circle
    const progress = (state.currentTime / state.totalTime) * 565.48;
    const circle = document.getElementById('timer-progress-circle');
    if (circle) {
        circle.style.strokeDashoffset = 565.48 - progress;
    }
    
    // Update overlay progress bar
    const progressPercent = ((state.totalTime - state.currentTime) / state.totalTime) * 100;
    const progressFill = document.getElementById('overlay-progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progressPercent}%`;
    }
}

function updateUIForRunning() {
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('pause-btn').style.display = 'inline-flex';
    document.getElementById('skip-btn').style.display = 'inline-flex';
    document.getElementById('stop-btn').style.display = 'inline-flex';
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function updateUIForStopped() {
    document.getElementById('start-btn').style.display = 'inline-flex';
    document.getElementById('pause-btn').style.display = 'none';
    document.getElementById('skip-btn').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'none';
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
}

function updateStats() {
    const hours = Math.floor(state.totalFocusTime / 60);
    const minutes = state.totalFocusTime % 60;
    
    document.getElementById('total-time').textContent = `${hours}h ${minutes}m`;
    document.getElementById('session-count').textContent = state.sessionCount;
    document.getElementById('streak-count').textContent = calculateStreak();
    document.getElementById('productivity-score').textContent = calculateProductivity() + '%';
}

function calculateStreak() {
    // Simple streak calculation based on consecutive days
    if (state.sessions.length === 0) return 0;
    
    const today = new Date().toDateString();
    const hasToday = state.sessions.some(s => 
        new Date(s.startTime).toDateString() === today
    );
    
    return hasToday ? Math.min(state.sessions.length, 30) : 0;
}

function calculateProductivity() {
    if (state.sessions.length === 0) return 0;
    
    const completed = state.sessions.filter(s => s.completed).length;
    return Math.round((completed / state.sessions.length) * 100);
}

function updateDisplay() {
    // Update settings display
    document.getElementById('animation-type').value = settings.animationType;
    document.getElementById('color-theme').value = settings.colorTheme;
    document.getElementById('animation-speed').value = settings.animationSpeed;
    document.getElementById('overlay-opacity').value = settings.overlayOpacity;
    document.getElementById('focus-duration').value = settings.focusDuration;
    document.getElementById('break-duration').value = settings.breakDuration;
    document.getElementById('auto-start-break').checked = settings.autoStartBreak;
    document.getElementById('sound-effects').checked = settings.soundEffects;
    document.getElementById('ambient-sound').value = settings.ambientSound;
    document.getElementById('notifications').checked = settings.notifications;
    document.getElementById('block-distractions').checked = settings.blockDistractions;
    document.getElementById('show-quotes').checked = settings.showQuotes;
    
    updateSliderValues();
    updateStats();
}

function updateSliderValues() {
    const speedValue = document.getElementById('speed-value');
    const opacityValue = document.getElementById('opacity-value');
    
    const speedLabels = ['Very Slow', 'Slow', 'Slow', 'Medium', 'Medium', 'Medium', 'Fast', 'Fast', 'Very Fast', 'Ultra Fast'];
    speedValue.textContent = speedLabels[settings.animationSpeed - 1];
    opacityValue.textContent = settings.overlayOpacity + '%';
}

// ========== Overlay Functions ==========
function showFocusOverlay() {
    const overlay = document.getElementById('focus-overlay');
    overlay.classList.add('active');
    
    if (settings.showQuotes) {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('overlay-quote').textContent = `"${quote}"`;
    }
    
    document.getElementById('overlay-label').textContent = 'Stay Focused';
    
    initAnimation();
    updateTimerDisplay();
}

function hideFocusOverlay() {
    const overlay = document.getElementById('focus-overlay');
    overlay.classList.remove('active');
    
    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }
}

function showBreakOverlay() {
    const overlay = document.getElementById('break-overlay');
    overlay.classList.add('active');
    
    const tip = breakTips[Math.floor(Math.random() * breakTips.length)];
    document.getElementById('break-tips').textContent = tip;
    
    updateTimerDisplay();
}

function hideBreakOverlay() {
    const overlay = document.getElementById('break-overlay');
    overlay.classList.remove('active');
}

// ========== Animation System ==========
let canvas, ctx, particles = [];

function initAnimation() {
    canvas = document.getElementById('animation-canvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    particles = [];
    
    // Initialize particles based on animation type
    const particleCount = 50 + (settings.animationSpeed * 5);
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
    }
    
    animate();
}

function createParticle() {
    const colors = colorThemes[settings.colorTheme];
    
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 2,
        vx: (Math.random() - 0.5) * (settings.animationSpeed / 5),
        vy: (Math.random() - 0.5) * (settings.animationSpeed / 5),
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
        pulse: Math.random() * Math.PI * 2
    };
}

function animate() {
    if (!document.getElementById('focus-overlay').classList.contains('active')) {
        return;
    }
    
    ctx.fillStyle = `rgba(0, 0, 0, ${settings.overlayOpacity / 100})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    switch (settings.animationType) {
        case 'bubbles':
            drawBubbles();
            break;
        case 'particles':
            drawParticles();
            break;
        case 'waves':
            drawWaves();
            break;
        case 'aurora':
            drawAurora();
            break;
        case 'stars':
            drawStars();
            break;
        case 'rain':
            drawRain();
            break;
        case 'fireflies':
            drawFireflies();
            break;
        case 'gradient':
            drawGradient();
            break;
    }
    
    state.animationFrame = requestAnimationFrame(animate);
}

function drawBubbles() {
    particles.forEach(p => {
        p.y -= p.vy;
        p.x += Math.sin(p.pulse) * 0.5;
        p.pulse += 0.02;
        
        if (p.y < -p.radius) {
            p.y = canvas.height + p.radius;
            p.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    });
}

function drawParticles() {
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
    });
    
    // Draw connections
    particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 150) * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
    });
}

function drawWaves() {
    const colors = colorThemes[settings.colorTheme];
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        
        for (let x = 0; x <= canvas.width; x += 10) {
            const y = canvas.height / 2 + Math.sin(x * 0.01 + time + i) * 50 * (i + 1);
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        const alpha = (0.3 - i * 0.1).toString(16).padStart(2, '0');
        ctx.fillStyle = `${colors[i]}${alpha}`;
        ctx.fill();
    }
}

function drawAurora() {
    const colors = colorThemes[settings.colorTheme];
    const time = Date.now() * 0.0005 * (settings.animationSpeed / 5);
    
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.3);
        
        for (let x = 0; x <= canvas.width; x += 20) {
            const y = canvas.height * 0.3 + 
                     Math.sin(x * 0.005 + time + i) * 100 +
                     Math.sin(x * 0.01 + time * 2) * 50;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, `${colors[i % colors.length]}40`);
        gradient.addColorStop(1, `${colors[i % colors.length]}00`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function drawStars() {
    particles.forEach(p => {
        p.pulse += 0.05;
        p.alpha = 0.3 + Math.sin(p.pulse) * 0.3;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
        
        // Add sparkle effect
        if (Math.random() > 0.99) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x - p.radius * 2, p.y);
            ctx.lineTo(p.x + p.radius * 2, p.y);
            ctx.moveTo(p.x, p.y - p.radius * 2);
            ctx.lineTo(p.x, p.y + p.radius * 2);
            ctx.stroke();
        }
    });
}

function drawRain() {
    particles.forEach(p => {
        p.y += p.vy * 3;
        
        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + 10);
        ctx.strokeStyle = `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function drawFireflies() {
    particles.forEach(p => {
        p.x += Math.sin(p.pulse) * 2;
        p.y += Math.cos(p.pulse) * 2;
        p.pulse += 0.03;
        p.alpha = 0.5 + Math.sin(p.pulse * 2) * 0.5;
        
        // Keep in bounds
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, `${p.color}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${p.color}00`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

function drawGradient() {
    const colors = colorThemes[settings.colorTheme];
    const time = Date.now() * 0.0001 * (settings.animationSpeed / 5);
    
    const gradient = ctx.createLinearGradient(
        0, 
        0, 
        canvas.width * Math.cos(time), 
        canvas.height * Math.sin(time)
    );
    
    colors.forEach((color, i) => {
        gradient.addColorStop(i / (colors.length - 1), `${color}80`);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ========== Event Listeners ==========
function initEventListeners() {
    // Timer controls
    document.getElementById('start-btn').addEventListener('click', startSession);
    document.getElementById('pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('skip-btn').addEventListener('click', skipSession);
    document.getElementById('stop-btn').addEventListener('click', stopSession);
    
    // Overlay controls
    document.getElementById('overlay-pause-btn').addEventListener('click', pauseTimer);
    document.getElementById('overlay-skip-btn').addEventListener('click', skipSession);
    document.getElementById('overlay-exit-btn').addEventListener('click', stopSession);
    
    // Break controls
    document.getElementById('skip-break-btn').addEventListener('click', () => {
        completeSession();
    });
    document.getElementById('end-break-btn').addEventListener('click', () => {
        completeSession();
    });
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const time = parseInt(btn.dataset.time);
            settings.focusDuration = time;
            document.getElementById('focus-duration').value = time;
            state.currentTime = time * 60;
            state.totalTime = state.currentTime;
            updateTimerDisplay();
        });
    });
    
    // Settings
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        applySettings();
        saveSettings();
    });
    
    document.getElementById('reset-settings-btn').addEventListener('click', resetSettings);
    document.getElementById('preview-animation-btn').addEventListener('click', previewAnimation);
    
    // Sliders
    document.getElementById('animation-speed').addEventListener('input', (e) => {
        settings.animationSpeed = parseInt(e.target.value);
        updateSliderValues();
    });
    
    document.getElementById('overlay-opacity').addEventListener('input', (e) => {
        settings.overlayOpacity = parseInt(e.target.value);
        updateSliderValues();
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && state.isRunning) {
            e.preventDefault();
            pauseTimer();
        }
        if (e.key === 'Escape' && state.isRunning) {
            e.preventDefault();
            stopSession();
        }
    });
}

// ========== Settings Functions ==========
function applySettings() {
    settings.animationType = document.getElementById('animation-type').value;
    settings.colorTheme = document.getElementById('color-theme').value;
    settings.animationSpeed = parseInt(document.getElementById('animation-speed').value);
    settings.overlayOpacity = parseInt(document.getElementById('overlay-opacity').value);
    settings.focusDuration = parseInt(document.getElementById('focus-duration').value);
    settings.breakDuration = parseInt(document.getElementById('break-duration').value);
    settings.autoStartBreak = document.getElementById('auto-start-break').checked;
    settings.soundEffects = document.getElementById('sound-effects').checked;
    settings.ambientSound = document.getElementById('ambient-sound').value;
    settings.notifications = document.getElementById('notifications').checked;
    settings.blockDistractions = document.getElementById('block-distractions').checked;
    settings.showQuotes = document.getElementById('show-quotes').checked;
    
    state.currentTime = settings.focusDuration * 60;
    state.totalTime = state.currentTime;
    
    updateTimerDisplay();
    updateSliderValues();
}

function resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
        settings = {
            animationType: 'bubbles',
            colorTheme: 'blue',
            animationSpeed: 5,
            overlayOpacity: 95,
            focusDuration: 25,
            breakDuration: 5,
            autoStartBreak: true,
            soundEffects: true,
            ambientSound: 'none',
            notifications: true,
            blockDistractions: false,
            showQuotes: true
        };
        
        updateDisplay();
        saveSettings();
    }
}

function previewAnimation() {
    if (!state.isRunning) {
        showFocusOverlay();
        document.getElementById('overlay-label').textContent = 'Preview Mode';
        
        setTimeout(() => {
            hideFocusOverlay();
        }, 5000);
    }
}

// ========== Session History ==========
function loadHistory() {
    const container = document.getElementById('session-history');
    container.innerHTML = '';
    
    if (state.sessions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 40px;">No sessions yet. Start your first focus session!</p>';
        return;
    }
    
    // Show last 10 sessions
    const recentSessions = state.sessions.slice(-10).reverse();
    
    recentSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'session-item';
        
        const startTime = new Date(session.startTime);
        const dateStr = startTime.toLocaleDateString();
        const timeStr = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        item.innerHTML = `
            <div class="session-info">
                <div class="session-icon">
                    <i class="fas fa-${session.completed ? 'check' : 'times'}"></i>
                </div>
                <div class="session-details">
                    <h4>${session.completed ? 'Completed Session' : 'Incomplete Session'}</h4>
                    <p>${dateStr} at ${timeStr}</p>
                </div>
            </div>
            <div class="session-duration">${session.duration} min</div>
        `;
        
        container.appendChild(item);
    });
}

// ========== Notifications ==========
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function requestNotificationPermission() {
    if ('Notification' in window && settings.notifications) {
        Notification.requestPermission();
    }
}

function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '🎯',
            badge: '⏱️'
        });
    }
}

// ========== Sound Effects ==========
function playSound(type) {
    if (!settings.soundEffects) return;
    
    // Using Web Audio API for simple sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch (type) {
        case 'start':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'complete':
            [600, 800, 1000].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                osc.start(audioContext.currentTime + i * 0.15);
                osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
            });
            break;
        case 'pause':
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
    }
}

// ========== Initialize on Load ==========
document.addEventListener('DOMContentLoaded', init);
