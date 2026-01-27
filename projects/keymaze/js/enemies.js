window.EnemySystem = class EnemySystem {
    constructor(game) {
        this.game = game;
        this.enemies = [];
    }

    parseLevel(gridState) {
        this.enemies = [];
        gridState.forEach((row, y) => {
            row.forEach((char, x) => {
                if (char === 'M') {
                    // Default horizontal patroller
                    this.enemies.push({ x, y, dir: 1, type: 'H' });
                    // Replace 'M' with '0' so player can move there (but will die if colliding)
                    // Actually, keep 'M' in grid? No, entities should overlay grid.
                    // Let's clear the cell in gridState so it's a valid move target
                    gridState[y][x] = '0';
                }
                if (char === 'V') { // Vertical patroller
                    this.enemies.push({ x, y, dir: 1, type: 'V' });
                    gridState[y][x] = '0';
                }
            });
        });
    }

    update() {
        this.enemies.forEach(e => {
            const nextX = e.x + (e.type === 'H' ? e.dir : 0);
            const nextY = e.y + (e.type === 'V' ? e.dir : 0);

            // Check wall/boundary
            // Collision with ANY non-path? (Walls '1', Hazards 'X', Doors 'D')
            // Let's check pure gridState character
            if (this.isBlocked(nextX, nextY)) {
                e.dir *= -1; // Reverse
            } else {
                e.x = nextX;
                e.y = nextY;
            }
        });
    }

    isBlocked(x, y) {
        if (y < 0 || y >= this.game.gridState.length || x < 0 || x >= this.game.gridState[0].length) return true;
        const t = this.game.gridState[y][x];
        return t === '1' || t === 'D' || t === 'X'; // Enemeis can float over Keys/Switches
    }

    checkCollision(px, py) {
        return this.enemies.some(e => e.x === px && e.y === py);
    }
};
