class Maze {
    constructor(size) {
        this.size = size;
        this.grid = [];
        this.player = { x: 0, y: 0 };
        this.exit = { x: size - 1, y: size - 1 };
        this.path = []; // for hint
        this.initGrid();
        this.generateMaze();
    }

    initGrid() {
        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.grid[y][x] = {
                    walls: { top: true, right: true, bottom: true, left: true },
                    visited: false
                };
            }
        }
    }

    generateMaze() {
        const stack = [];
        let current = { x: 0, y: 0 };
        this.grid[0][0].visited = true;
        this.path.push({ x: 0, y: 0 });

        do {
            const neighbors = this.getUnvisitedNeighbors(current);
            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                stack.push(current);
                this.removeWall(current, next);
                current = next;
                this.grid[current.y][current.x].visited = true;
                this.path.push(current);
            } else if (stack.length > 0) {
                current = stack.pop();
            }
        } while (stack.length > 0);
    }

    getUnvisitedNeighbors(cell) {
        const neighbors = [];
        const { x, y } = cell;
        if (x > 0 && !this.grid[y][x - 1].visited) neighbors.push({ x: x - 1, y });
        if (x < this.size - 1 && !this.grid[y][x + 1].visited) neighbors.push({ x: x + 1, y });
        if (y > 0 && !this.grid[y - 1][x].visited) neighbors.push({ x, y: y - 1 });
        if (y < this.size - 1 && !this.grid[y + 1][x].visited) neighbors.push({ x, y: y + 1 });
        return neighbors;
    }

    removeWall(current, next) {
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        if (dx === 1) {
            this.grid[current.y][current.x].walls.right = false;
            this.grid[next.y][next.x].walls.left = false;
        } else if (dx === -1) {
            this.grid[current.y][current.x].walls.left = false;
            this.grid[next.y][next.x].walls.right = false;
        } else if (dy === 1) {
            this.grid[current.y][current.x].walls.bottom = false;
            this.grid[next.y][next.x].walls.top = false;
        } else if (dy === -1) {
            this.grid[current.y][current.x].walls.top = false;
            this.grid[next.y][next.x].walls.bottom = false;
        }
    }

    canMove(x, y, direction) {
        if (direction === 'up' && !this.grid[y][x].walls.top) return true;
        if (direction === 'right' && !this.grid[y][x].walls.right) return true;
        if (direction === 'down' && !this.grid[y][x].walls.bottom) return true;
        if (direction === 'left' && !this.grid[y][x].walls.left) return true;
        return false;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('mazeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.cellSize = 0;
        this.maze = null;
        this.timer = 0;
        this.timerInterval = null;
        this.gameWon = false;
        this.hintShown = false;

        this.init();
        this.bindEvents();
    }

    init() {
        this.generateMaze();
    }

    generateMaze() {
        const size = parseInt(document.getElementById('difficulty').value);
        this.cellSize = Math.min(600 / size, 40);
        this.canvas.width = this.cellSize * size;
        this.canvas.height = this.cellSize * size;
        this.maze = new Maze(size);
        this.resetGame();
        this.draw();
    }

    resetGame() {
        this.maze.player = { x: 0, y: 0 };
        this.timer = 0;
        this.gameWon = false;
        this.hintShown = false;
        this.updateStatus('Ready to play!');
        this.stopTimer();
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMaze();
        this.drawPlayer();
        this.drawExit();
        if (this.hintShown) {
            this.drawHint();
        }
    }

    drawMaze() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        for (let y = 0; y < this.maze.size; y++) {
            for (let x = 0; x < this.maze.size; x++) {
                const cell = this.maze.grid[y][x];
                const px = x * this.cellSize;
                const py = y * this.cellSize;

                if (cell.walls.top) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(px + this.cellSize, py);
                    this.ctx.stroke();
                }
                if (cell.walls.right) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(px + this.cellSize, py);
                    this.ctx.lineTo(px + this.cellSize, py + this.cellSize);
                    this.ctx.stroke();
                }
                if (cell.walls.bottom) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py + this.cellSize);
                    this.ctx.lineTo(px + this.cellSize, py + this.cellSize);
                    this.ctx.stroke();
                }
                if (cell.walls.left) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(px, py + this.cellSize);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawPlayer() {
        this.ctx.fillStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.arc(
            this.maze.player.x * this.cellSize + this.cellSize / 2,
            this.maze.player.y * this.cellSize + this.cellSize / 2,
            this.cellSize / 3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    drawExit() {
        this.ctx.fillStyle = '#44ff44';
        this.ctx.fillRect(
            this.maze.exit.x * this.cellSize + 5,
            this.maze.exit.y * this.cellSize + 5,
            this.cellSize - 10,
            this.cellSize - 10
        );
    }

    drawHint() {
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        for (let i = 0; i < this.maze.path.length - 1; i++) {
            const current = this.maze.path[i];
            const next = this.maze.path[i + 1];
            this.ctx.moveTo(
                current.x * this.cellSize + this.cellSize / 2,
                current.y * this.cellSize + this.cellSize / 2
            );
            this.ctx.lineTo(
                next.x * this.cellSize + this.cellSize / 2,
                next.y * this.cellSize + this.cellSize / 2
            );
        }
        this.ctx.stroke();
    }

    movePlayer(direction) {
        if (this.gameWon) return;

        const { x, y } = this.maze.player;
        let newX = x, newY = y;

        switch (direction) {
            case 'up': newY--; break;
            case 'right': newX++; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
        }

        if (newX >= 0 && newX < this.maze.size && newY >= 0 && newY < this.maze.size &&
            this.maze.canMove(x, y, direction)) {
            this.maze.player.x = newX;
            this.maze.player.y = newY;
            this.startTimer();
            this.checkWin();
            this.draw();
        }
    }

    checkWin() {
        if (this.maze.player.x === this.maze.exit.x && this.maze.player.y === this.maze.exit.y) {
            this.gameWon = true;
            this.stopTimer();
            this.updateStatus(`🎉 You won in ${this.formatTime(this.timer)}!`);
        }
    }

    startTimer() {
        if (!this.timerInterval) {
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateTimer();
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimer() {
        document.getElementById('timer').textContent = `Time: ${this.formatTime(this.timer)}`;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    updateStatus(message) {
        document.getElementById('status').textContent = message;
    }

    showHint() {
        this.hintShown = true;
        this.draw();
        setTimeout(() => {
            this.hintShown = false;
            this.draw();
        }, 2000);
    }

    bindEvents() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateMaze());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());

        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp': e.preventDefault(); this.movePlayer('up'); break;
                case 'ArrowRight': e.preventDefault(); this.movePlayer('right'); break;
                case 'ArrowDown': e.preventDefault(); this.movePlayer('down'); break;
                case 'ArrowLeft': e.preventDefault(); this.movePlayer('left'); break;
                case 'r': case 'R': this.resetGame(); break;
                case 'h': case 'H': this.showHint(); break;
            }
        });
    }
}

new Game();