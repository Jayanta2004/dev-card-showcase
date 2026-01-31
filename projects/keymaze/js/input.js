window.InputHandler = class InputHandler {
    constructor(game) {
        this.game = game;
        console.log('InputHandler attached');
        window.addEventListener('keydown', (e) => this.handleKey(e));
    }

    handleKey(e) {
        const key = e.key.toLowerCase();

        // prevent default scrolling for arrows/space
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
            e.preventDefault();
        }

        if (this.game.state === 'START' && key) {
            this.game.startGame();
            return;
        }

        if (this.game.state === 'WIN' && key === ' ') {
            this.game.nextLevel();
            return;
        }

        if (this.game.state === 'GAMEOVER' && key === 'r') { // Not really used yet but good to have
            this.game.restartLevel();
            return;
        }

        if (this.game.state === 'VICTORY' && key === 'r') {
            this.game.fullRestart();
            return;
        }

        // Always allow restart
        if (key === 'r') {
            this.game.restartLevel();
            return;
        }

        if (this.game.state === 'PLAYING') {
            let dx = 0;
            let dy = 0;

            if (key === 'arrowup' || key === 'w') dy = -1;
            else if (key === 'arrowdown' || key === 's') dy = 1;
            else if (key === 'arrowleft' || key === 'a') dx = -1;
            else if (key === 'arrowright' || key === 'd') dx = 1;

            if (dx !== 0 || dy !== 0) {
                this.game.movePlayer(dx, dy);
            }
        }
    }
}
