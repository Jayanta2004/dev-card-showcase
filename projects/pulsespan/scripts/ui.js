/**
 * UI Renderer
 * Handles all DOM updates and Canvas visualizations
 */
const UI = {
    elements: {
        energyDisplay: document.getElementById('energy-value-display'),
        energyStateText: document.getElementById('energy-state-text'),
        energySlider: document.getElementById('energy-slider'),
        sliderTrack: document.querySelector('.slider-track-fill'),
        taskList: document.getElementById('task-list'),
        recContent: document.getElementById('rec-task-content'),
        canvas: document.getElementById('energy-canvas'),
        clock: document.getElementById('clock'),
        date: document.getElementById('date'),
        modal: document.getElementById('add-task-modal'),
        addTaskForm: document.getElementById('add-task-form'),
        // Feature Refs
        burnoutFill: document.getElementById('burnout-fill'),
        burnoutValue: document.getElementById('burnout-value'),
        streakValue: document.getElementById('streak-value'),
        vibeSelect: document.getElementById('vibe-select'),
        focusOverlay: document.getElementById('focus-overlay'),
        focusTimerDisplay: document.getElementById('focus-timer-display'),
        focusTaskTitle: document.getElementById('focus-task-title'),
        focusProgressCircle: document.querySelector('.progress-ring__circle'),

        // Wave 2 Refs
        btnSonicFocus: document.getElementById('btn-sonic-focus'),
        rpgLevel: document.getElementById('rpg-level'),
        rpgXP: document.getElementById('rpg-xp'),
        velocityCanvas: document.getElementById('velocity-canvas'),
        brainDump: document.getElementById('brain-dump-input'),
        perceivedTime: document.getElementById('perceived-time')
    },

    focusTimer: null,

    init: () => {
        UI.resizeCanvas();
        window.addEventListener('resize', UI.resizeCanvas);
        UI.startClock();

        // Setup Progress Ring
        const circle = UI.elements.focusProgressCircle;
        if (circle) {
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference;
        }

        // Feature 11: Circadian Theme Sync check
        UI.checkCircadianTheme();
        setInterval(UI.checkCircadianTheme, 600000); // Check every 10 mins
    },

    checkCircadianTheme: () => {
        const hour = new Date().getHours();
        const root = document.documentElement;
        // Night mode (after 8pm or before 6am) - Shift colors slightly
        if (hour >= 20 || hour < 6) {
            root.style.setProperty('--bg-app', '#000000');
            root.style.setProperty('--brand-primary', '#7000FF'); // Deep Violet
        } else {
            root.style.setProperty('--bg-app', '#050505');
            root.style.setProperty('--brand-primary', '#58A6FF'); // Day Blue
        }
    },

    startClock: () => {
        const update = () => {
            const now = new Date();
            UI.elements.clock.textContent = Utils.formatTime(now);
            UI.elements.date.textContent = Utils.getCurrentDateStr();

            // Focus Timer Logic
            if (window.State && window.State.data.activeFocusSession) {
                UI.updateFocusTimer(window.State.data.activeFocusSession);
            }
        };
        update();
        setInterval(update, 1000);
    },

    updateFocusTimer: (session) => {
        const elapsed = (Date.now() - session.startTime) / 1000;
        const totalSeconds = session.originalDuration * 60;
        const remaining = Math.max(0, totalSeconds - elapsed);

        const m = Math.floor(remaining / 60);
        const s = Math.floor(remaining % 60);
        UI.elements.focusTimerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

        // Update Circle
        const circle = UI.elements.focusProgressCircle;
        const radius = circle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (remaining / totalSeconds) * circumference;
        circle.style.strokeDashoffset = offset;

        if (remaining <= 0) {
            UI.elements.focusTimerDisplay.style.color = 'var(--energy-low)'; // Done
        }
    },

    resizeCanvas: () => {
        const parent = UI.elements.canvas.parentElement;
        UI.elements.canvas.width = parent.clientWidth;
        UI.elements.canvas.height = parent.clientHeight;

        const vParent = UI.elements.velocityCanvas ? UI.elements.velocityCanvas.parentElement : null;
        if (vParent && UI.elements.velocityCanvas) {
            UI.elements.velocityCanvas.width = vParent.clientWidth;
            UI.elements.velocityCanvas.height = vParent.clientHeight;
        }

        // Redraw if state exists
        if (window.State) {
            UI.renderEnergyCurve(window.State.data.energyCurve, window.State.data.currentEnergy);
            UI.renderVelocity(window.State.data.velocityHistory);
        }
    },

    update: (state, action) => {
        console.log('UI Update:', action);

        // 1. Update Energy Display
        UI.elements.energyDisplay.textContent = state.currentEnergy + '%';
        UI.elements.energyStateText.textContent = Utils.getEnergyStateText(state.currentEnergy);
        UI.elements.energySlider.value = state.currentEnergy;
        UI.elements.sliderTrack.style.width = state.currentEnergy + '%';

        // Feature 2: Burnout
        UI.elements.burnoutValue.textContent = state.energyDebt + '%';
        UI.elements.burnoutFill.style.width = state.energyDebt + '%';

        // Feature 5: Streak
        UI.elements.streakValue.textContent = state.flowStreak;

        // Feature 10: RPG Stats
        UI.elements.rpgLevel.textContent = state.level;
        UI.elements.rpgXP.textContent = state.xp;

        // Feature 8: Brain Dump (only update if different to avoid cursor jump)
        if (document.activeElement !== UI.elements.brainDump) {
            UI.elements.brainDump.value = state.brainDump || '';
        }

        // Feature 9: Velocity Pulse
        UI.renderVelocity(state.velocityHistory);

        // Feature 1: Focus Overlay State
        if (state.activeFocusSession) {
            UI.elements.focusOverlay.classList.add('active');
            const task = state.tasks.find(t => t.id === state.activeFocusSession.taskId);
            if (task) UI.elements.focusTaskTitle.textContent = task.title;
        } else {
            UI.elements.focusOverlay.classList.remove('active');
        }

        // 2. Render Canvas
        UI.renderEnergyCurve(state.energyCurve, state.currentEnergy);

        // 3. Render Tasks and Rec
        let visibleTasks = Scheduler.sortTasks(state.tasks, state.currentEnergy);
        if (state.filter !== 'all') {
            visibleTasks = visibleTasks.filter(t => t.energy === state.filter);
        }
        UI.renderTaskList(visibleTasks);

        const recommendation = Scheduler.getRecommendedTask(state.tasks, state.currentEnergy);
        UI.renderRecommendation(recommendation, state.currentEnergy);
    },

    renderTaskList: (tasks) => {
        const container = UI.elements.taskList;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🍃</div>
                    <p>No tasks. Time to recharge.</p>
                </div>`;
            return;
        }

        // Simple reconcile: clear and rebuild for now (performance is fine for <100 items)
        container.innerHTML = '';

        tasks.forEach(task => {
            const el = document.createElement('div');
            el.className = 'task-item';
            el.dataset.id = task.id;
            el.dataset.energy = task.energy;

            el.innerHTML = `
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <div class="task-meta">
                        <span>⚡ ${task.energy}</span>
                        ${task.vibe !== 'any' ? `<span>${task.vibe === 'creative' ? '🎨' : task.vibe === 'logic' ? '🧠' : '💬'}</span>` : ''}
                        <span>⏱ ${Utils.formatDuration(task.duration)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon task-focus-btn" title="Enter Focus Mode">🎯</button>
                    <button class="btn-icon task-reschedule-btn" title="Smart Reschedule">🕒</button>
                    <button class="btn-icon task-complete-btn" title="Complete">✔</button>
                    <button class="btn-icon task-delete-btn" title="Delete">🗑</button>
                </div>
            `;

            // Add listeners directly to avoid delegation complexity for now
            // Feature 1: Start Focus
            el.querySelector('.task-focus-btn').onclick = (e) => {
                e.stopPropagation();
                window.State.startFocusSession(task.id);
            };

            // Feature 3: Smart Reschedule
            el.querySelector('.task-reschedule-btn').onclick = (e) => {
                e.stopPropagation();
                const bestTime = Scheduler.findBestSlotFor(task.energy);
                alert(`Smart Suggestion: This task matches your energy best at ${bestTime}. (Projected Shift)`);
                // In full version this moves it physically
            };

            el.querySelector('.task-complete-btn').onclick = (e) => {
                e.stopPropagation();
                // Get button position for confetti
                const rect = e.target.getBoundingClientRect();
                if (window.Visuals) Visuals.spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);

                window.State.updateTaskStatus(task.id, 'completed');
            };
            el.querySelector('.task-delete-btn').onclick = (e) => {
                e.stopPropagation();
                window.State.removeTask(task.id);
            };

            container.appendChild(el);
        });
    },

    // Feature 7: Perceived Time Calculation
    renderRecommendation: (task, energy) => {
        const container = UI.elements.recContent;
        const ptDisplay = UI.elements.perceivedTime;

        if (!task) {
            container.innerHTML = '<div class="placeholder-text">Add tasks to get suggestions</div>';
            if (ptDisplay) ptDisplay.textContent = '';
            return;
        }

        // Logic: Low Energy makes time feel slower (tasks feel longer)
        // High Energy makes time fly (flow state)
        const dilation = energy < 30 ? 1.5 : energy > 70 ? 0.7 : 1.0;
        const perceivedMins = Math.round(task.duration * dilation);

        if (ptDisplay) {
            ptDisplay.textContent = `Feels like ${perceivedMins}m`;
        }

        const warningClass = task.warning ? 'warning-state' : '';
        const warningMsg = task.warning ? '<div style="color:var(--energy-high); font-size:0.8rem; margin-top:8px;">⚠️ Energy Mismatch</div>' : '';

        container.innerHTML = `
            <div class="task-item active-recommendation ${warningClass}" data-energy="${task.energy}" style="width:100%; border:none;">
                <div class="task-info">
                    <h4>${task.title}</h4>
                    <div class="task-meta">
                        <span>Match Score: ${task.score}%</span>
                        ${task.vibe !== 'any' ? `<span>${task.vibe === 'creative' ? '🎨' : task.vibe === 'logic' ? '🧠' : '💬'}</span>` : ''}
                        <span>⏱ ${Utils.formatDuration(task.duration)}</span>
                    </div>
                     ${warningMsg}
                </div>
                <div class="task-actions" style="opacity:1">
                     <button class="btn btn-primary task-start-btn" style="padding: 4px 12px; font-size: 0.8rem;">Start</button>
                </div>
            </div>
        `;

        const startBtn = container.querySelector('.task-start-btn');
        if (startBtn) {
            startBtn.onclick = () => {
                window.State.startFocusSession(task.id);
            };
        }
    },

    renderVelocity: (history) => {
        const cvs = UI.elements.velocityCanvas;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        const w = cvs.width;
        const h = cvs.height;

        ctx.clearRect(0, 0, w, h);

        if (!history || history.length < 2) return;

        ctx.beginPath();
        const now = Date.now();
        const duration = 3600000; // 1 hr window

        history.forEach((point, i) => {
            const timeDiff = now - point.time;
            const x = w - (timeDiff / duration) * w;
            const y = h - (point.xp / 20) * h; // Scale XP to height (approx max 20 per entry)

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.strokeStyle = '#3FB950';
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    renderEnergyCurve: (curveData, currentEnergy) => {
        const ctx = UI.elements.canvas.getContext('2d');
        const width = UI.elements.canvas.width;
        const height = UI.elements.canvas.height;

        // Clear
        ctx.clearRect(0, 0, width, height);

        if (!curveData || curveData.length === 0) return;

        // Configuration
        const padding = 20;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Helper to map X (hour) and Y (level)
        const getX = (hour) => padding + (hour / 23) * chartWidth;
        const getY = (level) => height - padding - (level / 100) * chartHeight;

        // Draw Gradient Area
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(88, 166, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(88, 166, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(curveData[0].level));

        // Smooth curve
        for (let i = 0; i < curveData.length - 1; i++) {
            const p0 = curveData[i];
            const p1 = curveData[i + 1];
            const midX = (getX(p0.hour) + getX(p1.hour)) / 2;
            const midY = (getY(p0.level) + getY(p1.level)) / 2;
            ctx.quadraticCurveTo(getX(p0.hour), getY(p0.level), midX, midY);
        }

        const last = curveData[curveData.length - 1];
        ctx.lineTo(getX(last.hour), getY(last.level));
        ctx.lineTo(getX(last.hour), height);
        ctx.lineTo(getX(0), height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw Line
        ctx.beginPath();
        ctx.moveTo(getX(0), getY(curveData[0].level));
        for (let i = 0; i < curveData.length - 1; i++) {
            const p0 = curveData[i];
            const p1 = curveData[i + 1];
            const midX = (getX(p0.hour) + getX(p1.hour)) / 2;
            const midY = (getY(p0.level) + getY(p1.level)) / 2;
            ctx.quadraticCurveTo(getX(p0.hour), getY(p0.level), midX, midY);
        }
        ctx.strokeStyle = '#58A6FF';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Current Time Indicator
        const now = new Date();
        const currentHourFloat = now.getHours() + now.getMinutes() / 60;
        const curX = getX(currentHourFloat);
        const curY = getY(currentEnergy);

        // Vertical Line
        ctx.beginPath();
        ctx.moveTo(curX, padding);
        ctx.lineTo(curX, height - padding);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Current Point
        ctx.beginPath();
        ctx.arc(curX, curY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(curX, curY, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
    }
};

window.UI = UI;
