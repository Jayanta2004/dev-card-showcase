window.Game = class Game {
    constructor() {
        console.log('Game Initializing...');
        this.view = new window.View();
        this.audio = new window.AudioSys();
        this.vfx = new window.VFX();
        this.startTimer = this.startTimer.bind(this); // Fix binding

        this.currentLevelIdx = 0;
        this.state = 'START';
        this.playerPos = { x: 0, y: 0 };
        this.input = new window.InputHandler(this);
        this.enemies = new window.EnemySystem(this);

        // V3 State
        this.keysCollected = 0;
        this.totalKeys = 0;
        this.startTime = 0;
        this.timerInterval = null;

        if (!window.LEVELS || window.LEVELS.length === 0) {
            console.error('LEVELS not loaded');
            return;
        }

        this.loadLevel(0);
    }

    startGame() {
        this.view.toggleScreen('start-screen', false);
        this.state = 'PLAYING';
        this.audio.ctx.resume(); // Ensure audio context starts
        this.vfx.screenShake();
        this.startTimer();
    }

    loadLevel(idx) {
        this.stopTimer();

        if (idx >= window.LEVELS.length) {
            this.state = 'VICTORY';
            this.view.toggleScreen('win-screen', false);
            this.view.toggleScreen('final-screen', true);
            this.audio.playWin();
            this.vfx.createParticles(10, 10, '#ffd700', 50);
            return;
        }

        if (idx > 0) this.vfx.startWipe();

        this.currentLevelIdx = idx;
        this.mapData = window.LEVELS[idx]; // Note: Strings are immutable, so we can't edit mapData in place reliably if we want resets.
        // For modifiable state (opening doors), we need to clone or track changes separately.
        // Let's copy mapData to an array of arrays of chars to allow mutation (opening doors)
        this.gridState = this.mapData.map(row => row.split(''));

        // Count Keys & Init Enemies
        this.totalKeys = 0;
        this.keysCollected = 0;

        // Parse Enemies (Removes 'M'/'V' from gridState)
        this.enemies.parseLevel(this.gridState);

        this.gridState.forEach(row => {
            row.forEach(char => { if (char === 'K') this.totalKeys++; });
        });

        // Fog Logic (Level 10 only for now, or all hard levels?)
        // Let's enable fog on levels > 5
        this.view.setFog(idx > 5);

        setTimeout(() => {
            // Need to render from gridState, not mapData (which is strings)
            // Adjust View.renderLevel to accept array of arrays? It effectively splits string so yes.
            // Or we pass gridState.map(row => row.join('')) to match signature?
            // View.renderLevel expects an array of strings.
            this.view.renderLevel(this.gridState.map(r => r.join('')));
            this.view.renderEnemies(this.enemies.enemies);

            this.gridState.forEach((row, y) => {
                row.forEach((char, x) => {
                    if (char === 'S') this.playerPos = { x, y };
                });
            });

            this.view.updatePlayerPos(this.playerPos.x, this.playerPos.y);
            this.view.updateLevelInfo(idx);
            this.view.updateHud('00:00', 0, this.totalKeys);

            this.vfx.createParticles(this.playerPos.x, this.playerPos.y, '#00ffcc', 12);

            // Auto-resume timer if just next level? Or reset?
            // Let's reset timer per level for "Speedrun" feel per split
            if (this.state !== 'START') {
                this.state = 'PLAYING';
                this.startTimer();
            }
        }, idx === 0 ? 0 : 400); // No delay on first load
    }

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const delta = Date.now() - this.startTime;
            const secs = Math.floor(delta / 1000);
            const mins = Math.floor(secs / 60);
            const s = secs % 60;
            const timeStr = `${mins < 10 ? '0' + mins : mins}:${s < 10 ? '0' + s : s}`;
            this.view.updateHud(timeStr, this.keysCollected, this.totalKeys);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }

    movePlayer(dx, dy) {
        if (this.state !== 'PLAYING') return;

        // Sliding Logic: Check if we are currently on Ice?
        // Actually, Input triggers a move. If landing on Ice, we trigger another move automatically.
        this.audio.ctx.resume();
        this.handleMoveStep(dx, dy);
    }

    handleMoveStep(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;

        if (newY < 0 || newY >= this.gridState.length || newX < 0 || newX >= this.gridState[0].length) return;

        const tile = this.gridState[newY][newX];

        // Blockers
        if (tile === '1' || tile === 'G') { // Gate blocks like wall
            if (tile === 'G') this.audio.playBump(); // Gate sound?
            this.vfx.createParticles(newX, newY, '#ff5555', 3);

            // If it's a gate and we have a key? No, Gates are toggled by Switches.
            return;
        }

        if (tile === 'D') {
            if (this.keysCollected > 0) {
                this.keysCollected--;
                this.audio.playDoor();
                this.gridState[newY][newX] = '0';
                this.view.updateCell(newX, newY, '0');
                this.view.updateHud(document.getElementById('timer').textContent, this.keysCollected, this.totalKeys);
            } else {
                this.audio.playBump();
                return;
            }
        }

        // Execute Move
        const prevX = this.playerPos.x;
        const prevY = this.playerPos.y;
        this.playerPos = { x: newX, y: newY };
        this.view.updatePlayerPos(newX, newY);

        // Turn Phase: Update Enemies
        this.enemies.update();
        this.view.renderEnemies(this.enemies.enemies);

        // Check Death (Did we walk into enemy OR enemy walked into us?)
        if (this.enemies.checkCollision(this.playerPos.x, this.playerPos.y)) {
            this.handleDeath(this.playerPos.x, this.playerPos.y);
            return;
        }

        // VFX
        if (tile !== 'I') this.audio.playMove(); // Regular step sound
        else this.audio.playSlide();

        // Hazards
        if (tile === 'X') {
            this.handleDeath(newX, newY);
            return;
        }

        // Collectibles
        if (tile === 'K') {
            this.keysCollected++;
            this.audio.playKey();
            this.gridState[newY][newX] = '0';
            this.view.updateCell(newX, newY, '0');
            this.view.updateHud(document.getElementById('timer').textContent, this.keysCollected, this.totalKeys);
        }

        if (tile === 'O') { // Switch
            this.audio.playKey(); // Click sound
            this.toggleGates();
            // Visual change for switch?
            // Don't remove it, just animate
            this.view.vfx.screenShake();
        }

        // Win
        if (tile === 'E') {
            this.handleWin();
            return;
        }

        // Teleport
        if (tile === 'T') {
            this.audio.playTeleport();
            this.handleTeleport(newX, newY);
            return; // Teleport moves us elsewhere, stop sliding from *here*
        }

        // Ice Slide
        if (tile === 'I') {
            // Slide continuosly in same direction
            // Add small delay for visual slide
            setTimeout(() => {
                if (this.state === 'PLAYING') this.handleMoveStep(dx, dy);
            }, 80); // Fast slide
        }
    }

    toggleGates() {
        // Find all Gates 'G' and Open 'g'? Or remove them?
        // Or walls that become paths?
        // Let's say it toggles "Gate" blocks On/Off.
        // Or better: It opens ALL gates.
        // Logic: Iterate grid. If 'G' -> '0'. If '0' (was G?) -> difficult to track history.
        // Simple: Switch opens Gates permanently.
        this.gridState.forEach((row, y) => {
            row.forEach((char, x) => {
                if (char === 'G') {
                    this.gridState[y][x] = '0';
                    this.view.updateCell(x, y, '0');
                    // Add gate open effect?
                    this.vfx.createParticles(x, y, '#f59e0b', 5);
                }
            });
        });
    }

    handleDeath(x, y) {
        if (this.state === 'DEAD') return; // Prevent double death handling
        this.audio.playDie();
        this.vfx.screenShake();
        this.vfx.createParticles(x, y, '#ef4444', 20);
        this.state = 'DEAD';
        this.stopTimer();
        setTimeout(() => this.restartLevel(), 800);
    }

    handleTeleport(currentX, currentY) {
        // Find OTHER 'T'
        let targetX = -1, targetY = -1;

        for (let y = 0; y < this.gridState.length; y++) {
            for (let x = 0; x < this.gridState[0].length; x++) {
                if (this.gridState[y][x] === 'T' && (x !== currentX || y !== currentY)) {
                    targetX = x;
                    targetY = y;
                    break;
                }
            }
            if (targetX !== -1) break;
        }

        if (targetX !== -1) {
            this.vfx.createParticles(currentX, currentY, '#6366f1', 10);
            this.playerPos = { x: targetX, y: targetY };
            this.view.updatePlayerPos(targetX, targetY);
            this.vfx.createParticles(targetX, targetY, '#6366f1', 10);
        }
    }

    handleWin() {
        this.stopTimer();
        this.state = 'WIN';
        this.audio.playWin();
        this.vfx.createParticles(this.playerPos.x, this.playerPos.y, '#ec4899', 20);
        this.vfx.screenShake();

        setTimeout(() => {
            if (this.state === 'WIN') {
                this.view.toggleScreen('win-screen', true);
            }
        }, 500);
    }

    nextLevel() {
        this.view.toggleScreen('win-screen', false);
        this.loadLevel(this.currentLevelIdx + 1);
    }

    restartLevel() {
        this.view.toggleScreen('win-screen', false);
        this.view.toggleScreen('final-screen', false);
        this.loadLevel(this.currentLevelIdx);
    }

    fullRestart() {
        this.view.toggleScreen('final-screen', false);
        this.loadLevel(0);
    }
};

window.onload = () => {
    if (window.Game) {
        window.game = new window.Game();
    } else {
        console.error('Game class not found');
    }
};
