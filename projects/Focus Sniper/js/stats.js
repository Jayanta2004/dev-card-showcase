// ==================== STATISTICS SYSTEM ====================

const StatsManager = {
    // Core stats
    score: 0,
    shotsTotal: 0,
    shotsHit: 0,
    shotsMissed: 0,
    targetsHit: 0,
    targetsExpired: 0,
    combo: 0,
    maxCombo: 0,
    
    // Focus tracking
    focus: 100,
    maxFocus: 100,
    focusLossRate: 10, // Per second when distracted
    focusRecoveryRate: 15, // Per second when focused
    avgFocus: 100,
    focusSamples: [],
    
    // Time tracking
    timeOnTarget: 0,
    timeOffTarget: 0,
    timeDistracted: 0,
    
    // Achievements
    achievements: [],
    
    // Distraction resistance
    distractionsResisted: 0,
    distractionsClicked: 0,
    
    // Difficulty tracking
    difficulty: 'normal',
    
    // Session data
    sessionStart: 0,
    sessionDuration: 0,

    /**
     * Initialize stats
     */
    init() {
        this.reset();
    },

    /**
     * Reset all stats
     */
    reset() {
        this.score = 0;
        this.shotsTotal = 0;
        this.shotsHit = 0;
        this.shotsMissed = 0;
        this.targetsHit = 0;
        this.targetsExpired = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.focus = 100;
        this.avgFocus = 100;
        this.focusSamples = [];
        this.timeOnTarget = 0;
        this.timeOffTarget = 0;
        this.timeDistracted = 0;
        this.achievements = [];
        this.distractionsResisted = 0;
        this.distractionsClicked = 0;
        this.sessionStart = Date.now();
        this.sessionDuration = 0;
    },

    /**
     * Record a shot
     */
    recordShot(hit, targetData = null) {
        this.shotsTotal++;

        if (hit && targetData) {
            this.shotsHit++;
            this.targetsHit++;
            
            // Add points with combo multiplier
            const basePoints = targetData.points;
            const comboMultiplier = 1 + (this.combo * 0.1);
            const points = Math.floor(basePoints * comboMultiplier);
            
            this.score += points;
            
            // Increase combo
            this.combo++;
            if (this.combo > this.maxCombo) {
                this.maxCombo = this.combo;
            }
            
            // Check for combo achievements
            this.checkComboAchievements();
            
            // Slight focus recovery on hit
            this.modifyFocus(5);
            
        } else {
            this.shotsMissed++;
            
            // Reset combo
            if (this.combo > 0) {
                this.combo = 0;
            }
            
            // Focus penalty for missing
            this.modifyFocus(-10);
        }
    },

    /**
     * Record target expiration
     */
    recordExpiredTarget() {
        this.targetsExpired++;
        this.combo = 0;
        this.modifyFocus(-5);
    },

    /**
     * Modify focus value
     */
    modifyFocus(amount) {
        this.focus = Utils.clamp(this.focus + amount, 0, this.maxFocus);
        this.recordFocusSample();
    },

    /**
     * Set focus value directly
     */
    setFocus(value) {
        this.focus = Utils.clamp(value, 0, this.maxFocus);
        this.recordFocusSample();
    },

    /**
     * Record focus sample for averaging
     */
    recordFocusSample() {
        this.focusSamples.push(this.focus);
        
        // Keep last 100 samples
        if (this.focusSamples.length > 100) {
            this.focusSamples.shift();
        }
        
        // Calculate average
        const sum = this.focusSamples.reduce((a, b) => a + b, 0);
        this.avgFocus = sum / this.focusSamples.length;
    },

    /**
     * Update focus based on player state
     */
    updateFocus(deltaTime, isOnTarget, isDistracted) {
        const deltaSeconds = deltaTime / 1000;
        
        if (isDistracted) {
            // Losing focus due to distraction
            this.modifyFocus(-this.focusLossRate * deltaSeconds);
            this.timeDistracted += deltaTime;
        } else if (isOnTarget) {
            // Recovering focus
            this.modifyFocus(this.focusRecoveryRate * deltaSeconds);
            this.timeOnTarget += deltaTime;
        } else {
            // Neutral - slight recovery
            this.modifyFocus(this.focusRecoveryRate * 0.3 * deltaSeconds);
            this.timeOffTarget += deltaTime;
        }
    },

    /**
     * Record distraction interaction
     */
    recordDistractionClick() {
        this.distractionsClicked++;
        this.modifyFocus(-15);
    },

    /**
     * Record distraction resistance (ignored/closed)
     */
    recordDistractionResisted() {
        this.distractionsResisted++;
        this.modifyFocus(3);
    },

    /**
     * Get accuracy percentage
     */
    getAccuracy() {
        if (this.shotsTotal === 0) return 100;
        return (this.shotsHit / this.shotsTotal) * 100;
    },

    /**
     * Get accuracy affected by focus
     */
    getEffectiveAccuracy() {
        const baseAccuracy = this.getAccuracy();
        const focusMultiplier = this.focus / 100;
        return baseAccuracy * focusMultiplier;
    },

    /**
     * Calculate final score
     */
    calculateFinalScore() {
        let finalScore = this.score;
        
        // Bonus for high accuracy
        const accuracy = this.getAccuracy();
        if (accuracy >= 90) {
            finalScore += 1000;
            this.addAchievement('Sharpshooter', 'Accuracy ≥ 90%');
        } else if (accuracy >= 75) {
            finalScore += 500;
        }
        
        // Bonus for high average focus
        if (this.avgFocus >= 80) {
            finalScore += 500;
            this.addAchievement('Laser Focus', 'Average Focus ≥ 80%');
        }
        
        // Bonus for combo
        if (this.maxCombo >= 10) {
            finalScore += 300;
            this.addAchievement('Combo Master', 'Combo ≥ 10');
        }
        
        // Bonus for distraction resistance
        if (this.distractionsResisted >= 20) {
            finalScore += 400;
            this.addAchievement('Zen Master', 'Resisted 20+ distractions');
        }
        
        return Math.floor(finalScore);
    },

    /**
     * Check for combo achievements
     */
    checkComboAchievements() {
        if (this.combo === 5) {
            this.addAchievement('On Fire', '5x Combo');
        } else if (this.combo === 10) {
            this.addAchievement('Unstoppable', '10x Combo');
        } else if (this.combo === 20) {
            this.addAchievement('Legendary', '20x Combo');
        } else if (this.combo === 50) {
            this.addAchievement('Godlike', '50x Combo');
        }
    },

    /**
     * Add achievement
     */
    addAchievement(title, description) {
        // Check if already unlocked
        if (this.achievements.some(a => a.title === title)) {
            return false;
        }
        
        this.achievements.push({
            title: title,
            description: description,
            timestamp: Date.now()
        });
        
        AudioManager.playAchievement();
        return true;
    },

    /**
     * Get rank based on score
     */
    getRank(finalScore) {
        if (finalScore >= 10000) return 'S+';
        if (finalScore >= 8000) return 'S';
        if (finalScore >= 6000) return 'A+';
        if (finalScore >= 5000) return 'A';
        if (finalScore >= 4000) return 'B+';
        if (finalScore >= 3000) return 'B';
        if (finalScore >= 2000) return 'C+';
        if (finalScore >= 1000) return 'C';
        if (finalScore >= 500) return 'D';
        return 'F';
    },

    /**
     * Get performance rating
     */
    getPerformanceRating() {
        const accuracy = this.getAccuracy();
        const avgFocus = this.avgFocus;
        const resistanceRate = this.distractionsResisted / 
            Math.max(1, this.distractionsResisted + this.distractionsClicked);
        
        const overall = (accuracy + avgFocus + (resistanceRate * 100)) / 3;
        
        if (overall >= 90) return 'Excellent';
        if (overall >= 75) return 'Great';
        if (overall >= 60) return 'Good';
        if (overall >= 45) return 'Fair';
        return 'Poor';
    },

    /**
     * Update session duration
     */
    updateSessionDuration() {
        this.sessionDuration = Date.now() - this.sessionStart;
    },

    /**
     * Get stats summary
     */
    getSummary() {
        this.updateSessionDuration();
        
        return {
            score: this.score,
            finalScore: this.calculateFinalScore(),
            accuracy: this.getAccuracy(),
            avgFocus: this.avgFocus,
            targetsHit: this.targetsHit,
            targetsExpired: this.targetsExpired,
            maxCombo: this.maxCombo,
            distractionsResisted: this.distractionsResisted,
            distractionsClicked: this.distractionsClicked,
            achievements: this.achievements,
            rank: this.getRank(this.calculateFinalScore()),
            performanceRating: this.getPerformanceRating(),
            sessionDuration: this.sessionDuration,
            shotsTotal: this.shotsTotal,
            shotsHit: this.shotsHit,
            shotsMissed: this.shotsMissed
        };
    },

    /**
     * Save high score
     */
    saveHighScore() {
        const currentScore = this.calculateFinalScore();
        const highScore = Utils.loadFromStorage('focusSniper_highScore', 0);
        
        if (currentScore > highScore) {
            Utils.saveToStorage('focusSniper_highScore', currentScore);
            Utils.saveToStorage('focusSniper_highScoreData', this.getSummary());
            return true;
        }
        
        return false;
    },

    /**
     * Get high score
     */
    getHighScore() {
        return Utils.loadFromStorage('focusSniper_highScore', 0);
    },

    /**
     * Get high score data
     */
    getHighScoreData() {
        return Utils.loadFromStorage('focusSniper_highScoreData', null);
    }
};
