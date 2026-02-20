window.View = class View {
    constructor() {
        this.grid = document.getElementById('maze-grid');
        this.container = document.getElementById('game-container');
        this.levelDisplay = document.getElementById('level-display');
        this.player = null; // Will be created in renderLevel
        this.cellSize = 40;
        this.gap = 3; // Must match CSS #maze-grid gap
    }

    renderLevel(map) {
        this.grid.innerHTML = '';
        const rows = map.length;
        const cols = map[0].length;

        this.grid.style.gridTemplateColumns = `repeat(${cols}, ${this.cellSize}px)`;
        this.grid.style.gridTemplateRows = `repeat(${rows}, ${this.cellSize}px)`;

        map.forEach((row, y) => {
            row.split('').forEach((char, x) => {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (char === '1') cell.classList.add('wall');
                else cell.classList.add('path');

                if (char === 'S') cell.classList.add('start');
                if (char === 'E') cell.classList.add('exit');
                if (char === 'K') cell.classList.add('key');
                if (char === 'D') cell.classList.add('door');
                if (char === 'X') cell.classList.add('hazard');
                if (char === 'T') cell.classList.add('teleport');
                if (char === 'I') cell.classList.add('ice');
                if (char === 'S') cell.classList.add('switch');
                if (char === 'G') cell.classList.add('gate');

                // Store coordinates for easy access
                cell.dataset.x = x;
                cell.dataset.y = y;

                this.grid.appendChild(cell);
            });
        });

        this.player = document.createElement('div');
        this.player.id = 'player';
        this.grid.appendChild(this.player);

        this.enemyContainer = document.createElement('div');
        this.enemyContainer.id = 'enemy-container';
        this.grid.appendChild(this.enemyContainer);
    }

    renderEnemies(enemies) {
        this.enemyContainer.innerHTML = '';
        enemies.forEach(e => {
            const el = document.createElement('div');
            el.className = 'cell enemy';
            const px = e.x * (this.cellSize + this.gap);
            const py = e.y * (this.cellSize + this.gap);
            el.style.transform = `translate(${px}px, ${py}px)`;
            this.enemyContainer.appendChild(el);
        });
    }

    updatePlayerPos(x, y) {
        if (this.player) {
            const px = x * (this.cellSize + this.gap);
            const py = y * (this.cellSize + this.gap);
            this.player.style.transform = `translate(${px}px, ${py}px)`;

            // Update Fog Mask position
            const cx = px + this.cellSize / 2;
            const cy = py + this.cellSize / 2;
            this.container.style.setProperty('--x', `${cx}px`);
            this.container.style.setProperty('--y', `${cy}px`);
        }
    }

    updateCell(x, y, type) {
        // Find cell by simple index logic since grid is linear
        // const idx = y * Number(this.grid.style.gridTemplateColumns.split(' ').length) + x;
        // Actually, safer to query
        // const cell = this.grid.children[idx]; // idx maps to cell creation order
        // Note: this index logic might be off if I appended player/enemyContainer to grid.
        // Better to select by dataset?
        // Actually, player and enemyContainer are children of grid too.
        // Let's use dataset query selector for safety or just keep them at end?
        // grid.children includes ALL children.
        // Safest: Use querySelector(`div[data-x="${x}"][data-y="${y}"]`)

        const target = this.grid.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        if (target && !target.classList.contains('enemy') && target.id !== 'player') {
            target.className = 'cell path';
            if (type === 'D') target.classList.add('door');
            if (type === 'T') target.classList.add('teleport');
            if (type === 'S') target.classList.add('switch');
            if (type === 'G') target.classList.add('gate');
            if (type === '0') target.classList.remove('wall', 'door', 'key', 'hazard', 'gate'); // Clear

            if (type === 'active') target.classList.add('active'); // For switches
        }
    }

    updateHud(time, keys, totalKeys) {
        document.getElementById('timer').textContent = time;
        document.getElementById('keys').textContent = `${keys}/${totalKeys}`;
    }

    setFog(active) {
        if (active) this.container.classList.add('fog-active');
        else this.container.classList.remove('fog-active');
    }

    updateLevelInfo(levelIdx) {
        if (this.levelDisplay) this.levelDisplay.textContent = levelIdx + 1;
    }

    toggleScreen(id, show) {
        const screen = document.getElementById(id);
        if (!screen) return;
        if (show) screen.classList.add('active');
        else screen.classList.remove('active');
    }

    moveCamera(x, y) {
        // Optional: If game was strictly larger than screen, we'd pan.
        // For now, we center via flexbox on body.
    }
};
