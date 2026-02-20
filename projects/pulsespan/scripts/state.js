/**
 * State Management System
 * Implements a Pub/Sub pattern for reactive UI updates
 */

class StateManager {
    constructor() {
        // Initial State
        this.data = {
            tasks: [],
            currentEnergy: 50,
            view: 'dashboard',
            filter: 'all',
            // Simulated hourly energy forecast (0-23h)
            energyCurve: this.generateDailyEnergyCurve(),
            lastUpdated: Date.now(),

            // New Features State
            energyDebt: 0, // Burnout tracker
            flowStreak: 0, // Gamification
            currentVibe: 'any', // Creative, Logical, Social
            activeFocusSession: null, // { taskId, startTime, duration }

            // Wave 2 Features
            xp: 0,
            level: 1,
            brainDump: '',
            velocityHistory: [] // [{time:ts, count:1}, ...]
        };

        this.listeners = [];
        this.loadFromStorage();
    }

    /**
     * Generate a default circadian rhythm curve
     */
    generateDailyEnergyCurve() {
        const curve = [];
        for (let i = 0; i < 24; i++) {
            // Simple model: Low at night, rise morning, dip afternoon, secondary peak evening
            let level = 30; // base sleep level

            if (i >= 6 && i < 12) {
                // Morning rise
                level = 30 + ((i - 6) / 6) * 60;
            } else if (i >= 12 && i < 15) {
                // Post-lunch dip
                level = 90 - ((i - 12) / 3) * 40;
            } else if (i >= 15 && i < 20) {
                // Afternoon recovery
                level = 50 + ((i - 15) / 5) * 30;
            } else if (i >= 20) {
                // Evening wind down
                level = 80 - ((i - 20) / 4) * 60;
            }

            // Add some randomness
            level += (Math.random() * 10 - 5);
            level = Math.max(10, Math.min(100, level));

            curve.push({ hour: i, level: Math.round(level) });
        }
        return curve;
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners
     * @param {string} action Type of change
     */
    notify(action) {
        this.listeners.forEach(listener => listener(this.data, action));
        this.saveToStorage();
    }

    // --- Actions ---

    addTask(task) {
        const newTask = {
            id: Utils.generateId(),
            createdAt: Date.now(),
            status: 'pending', // pending, completed
            vibe: 'any', // Default
            ...task
        };
        this.data.tasks.push(newTask);
        this.notify('TASK_ADDED');
        return newTask;
    }

    removeTask(id) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== id);
        this.notify('TASK_REMOVED');
    }

    updateTaskStatus(id, status) {
        const task = this.data.tasks.find(t => t.id === id);
        if (task) {
            // Gamification Logic: Check if it was a good match before completing
            if (status === 'completed' && task.status !== 'completed') {
                const matchScore = Scheduler.calculateSuitability(task, this.data.currentEnergy);
                this.handleTaskCompletion(task, matchScore);
            }

            task.status = status;
            this.notify('TASK_UPDATED');
        }
    }

    handleTaskCompletion(task, score) {
        // Feature 5: Flow Streak (Multiply if score > 70)
        if (score >= 70) {
            this.data.flowStreak += 1;
        } else {
            this.data.flowStreak = 0; // Reset if you force mismatch
        }

        // Feature 10: RPG Leveling
        // Base XP = 10. Multiplier based on score.
        const xpGain = Math.floor(10 * (score / 50));
        this.addXP(xpGain);

        // Feature 9: Velocity Pulse
        this.data.velocityHistory.push({ time: Date.now(), xp: xpGain });
        // Clean up old history (>1 hour)
        const hourAgo = Date.now() - 3600000;
        this.data.velocityHistory = this.data.velocityHistory.filter(h => h.time > hourAgo);

        // Feature 2: Energy Debt Logic
        // If High Energy Task done at Low Energy -> Increase Debt
        if (task.energy === 'high' && this.data.currentEnergy < 40) {
            this.data.energyDebt = Math.min(100, this.data.energyDebt + 15);
        } else if (task.energy === 'low') {
            // Low energy tasks help recover debt slightly ("productive rest")
            this.data.energyDebt = Math.max(0, this.data.energyDebt - 5);
        }

        this.notify('STATS_UPDATED');
    }

    addXP(amount) {
        this.data.xp += amount;
        // Simple Level Formula: Level * 100 XP required
        const req = this.data.level * 100;
        if (this.data.xp >= req) {
            this.data.xp -= req;
            this.data.level += 1;
            this.notify('LEVEL_UP');
        }
    }

    updateBrainDump(text) {
        this.data.brainDump = text;
        // No auto notify on every keystroke usually, but for local storage save:
        this.saveToStorage();
    }

    setVibe(vibe) {
        this.data.currentVibe = vibe;
        this.notify('VIBE_CHANGED');
    }

    startFocusSession(taskId) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            this.data.activeFocusSession = {
                taskId,
                startTime: Date.now(),
                originalDuration: task.duration
            };
            this.notify('FOCUS_STARTED');
        }
    }

    endFocusSession() {
        this.data.activeFocusSession = null;
        this.notify('FOCUS_ENDED');
    }

    rescheduleTask(taskId, newHour) {
        // Feature 3: Smart Reschedule (Just a conceptual shift for now, or move to end of list)
        // In a real app we'd change a 'scheduledTime'. Here we'll just bump it down via a 'delay' flag or similar?
        // Let's actually add a specific 'scheduledHour' if we want real power, 
        // but for this constraints-based app, we'll just toggle a 'snoozed' state or similar.
        // Better: We won't modify the task structure too much, just notify.
        this.notify('TASK_RESCHEDULED');
    }

    setEnergyLevel(level) {
        this.data.currentEnergy = parseInt(level, 10);

        // Update the current hour in the curve to reflect manual input real-time
        const currentHour = new Date().getHours();
        if (this.data.energyCurve[currentHour]) {
            // Blend manual input into the curve gently
            this.data.energyCurve[currentHour].level = this.data.currentEnergy;

            // Smooth out next few hours
            if (this.data.energyCurve[currentHour + 1]) {
                this.data.energyCurve[currentHour + 1].level = (this.data.energyCurve[currentHour + 1].level + this.data.currentEnergy) / 2;
            }
        }

        this.notify('ENERGY_CHANGED');
    }

    setView(viewName) {
        this.data.view = viewName;
        this.notify('VIEW_CHANGED');
    }

    setFilter(filterType) {
        this.data.filter = filterType;
        this.notify('FILTER_CHANGED');
    }

    // --- Persistence ---

    saveToStorage() {
        localStorage.setItem('pulseplan_state', JSON.stringify(this.data));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('pulseplan_state');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Merge to ensure schema updates don't break
                this.data = { ...this.data, ...parsed };

                // Regenerate curve if it's a new day
                const lastDate = new Date(this.data.lastUpdated).getDate();
                const today = new Date().getDate();
                if (lastDate !== today) {
                    this.data.energyCurve = this.generateDailyEnergyCurve();
                }

                this.data.lastUpdated = Date.now();
            } catch (e) {
                console.warn('Failed to load state', e);
            }
        }
    }
}

// Global Singleton
window.State = new StateManager();
