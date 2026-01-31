import { CONSTANTS } from './constants.js';
import { GameLoop } from './core/GameLoop.js';
import { EventEmitter } from './core/EventEmitter.js';
import { PhysicsEngine } from './engine/PhysicsEngine.js';
import { Renderer } from './engine/Renderer.js';
import { Ball } from './entities/Ball.js';
import { Goalkeeper } from './entities/Goalkeeper.js';
import { InputHandler } from './input/InputHandler.js';
import { UIManager } from './ui/UIManager.js';
import { GameState } from './game/GameState.js';
import { AIBrain } from './ai/AIBrain.js';
import { Vector3 } from './math/Vector3.js';
import { ParticleSystem } from './engine/ParticleSystem.js';

class Game {
    constructor() {
        this.state = new GameState();
        this.physics = new PhysicsEngine();
        this.renderer = new Renderer('game-canvas');
        this.ui = new UIManager();
        this.input = new InputHandler();
        this.loop = new GameLoop(this.update.bind(this));
        this.events = new EventEmitter();
        this.ai = new AIBrain();
        this.particles = new ParticleSystem();

        this.ball = new Ball();
        this.keeper = new Goalkeeper();

        this.phase = CONSTANTS.STATES.MENU;
        this.shotResultProcessed = false;

        // Shake timer
        this.shakeTimer = 0;

        this.init();
    }

    init() {
        this.ui.onStart(() => this.startGame());
        this.ui.onRestart(() => this.startGame());

        this.input.on('shoot', (data) => this.handlePlayerShot(data));
        this.input.on('phase_change', (phase) => {
            if (phase === 'AIMING') this.ui.setInstruction('Tap to Lock Direction');
            if (phase === 'POWERING') this.ui.setInstruction('Tap to Shoot');
        });

        this.loop.start();
    }

    startGame() {
        this.state.reset();
        this.ui.initDots(CONSTANTS.GAME.TOTAL_ROUNDS);
        this.ui.updateScore(0, 0, 1);
        this.ui.startGame();
        this.startRound();
    }

    startRound() {
        this.ball.reset();
        this.keeper.reset();
        this.shotResultProcessed = false;

        if (this.state.turn === 'PLAYER') {
            this.phase = CONSTANTS.STATES.AIMING;
            this.input.reset();
            this.input.enable();
            this.ui.showControls(true);
            this.ui.setInstruction('Tap to Start');
        } else {
            this.phase = CONSTANTS.STATES.AIMING;
            this.ui.showControls(false);
            this.ui.setInstruction('CPU Shooting...');
            this.performCpuShot();
        }
    }

    handlePlayerShot(data) {
        // Tuned for better "Feel"
        const velocityZ = 24 + (data.power * 12); // Faster base speed (24-36 m/s)
        const velocityX = data.aim * 8;
        const velocityY = 4 + (data.power * 6); // More loft (4-10 m/s)

        const shotVector = new Vector3(velocityX, velocityY, velocityZ);
        const spin = new Vector3(data.aim * -15, 0, 0); // More curve

        this.ball.applyImpulse(shotVector, spin);
        this.phase = CONSTANTS.STATES.FLIGHT;

        const aiDecision = this.ai.processShot(shotVector, data.power);

        setTimeout(() => {
            const targetX = (shotVector.x / shotVector.z) * CONSTANTS.FIELD.GOAL_Z;
            const error = (1 - aiDecision.targetLimit) * 2;
            const actualDiveX = targetX + (Math.random() * error - error / 2);

            const divePower = Math.min(1.0, Math.abs(actualDiveX) / 3);
            let diveDir = new Vector3(0, 0, 0);
            diveDir.x = actualDiveX > 0 ? 1 : -1;

            this.keeper.startDive(diveDir, divePower);

        }, aiDecision.delay);
    }

    performCpuShot() {
        setTimeout(() => {
            const aim = (Math.random() * 2) - 1;
            const power = 0.5 + (Math.random() * 0.4);

            const velocityZ = 22 + (power * 10);
            const velocityX = aim * 7;
            const velocityY = 3 + (power * 4);

            this.ball.applyImpulse(new Vector3(velocityX, velocityY, velocityZ), new Vector3(aim * -5, 0, 0));
            this.phase = CONSTANTS.STATES.FLIGHT;

            const keeperReaction = 300;
            setTimeout(() => {
                const targetX = (velocityX / velocityZ) * CONSTANTS.FIELD.GOAL_Z;
                let diveDir = new Vector3(0, 0, 0);
                if (Math.random() > 0.3) {
                    diveDir.x = targetX > 0 ? 1 : -1;
                    this.keeper.startDive(diveDir, Math.abs(targetX) / 3);
                } else {
                    diveDir.x = targetX > 0 ? -1 : 1;
                    this.keeper.startDive(diveDir, 0.8);
                }
            }, keeperReaction);

        }, 2000);
    }

    update(dt) {
        this.physics.update(this.ball, dt);
        this.keeper.update(dt);
        this.particles.update(dt);

        // Shake
        if (this.shakeTimer > 0) {
            this.renderer.camera.applyShake(this.shakeTimer * 0.5);
            this.shakeTimer -= dt;
        } else {
            this.renderer.camera.resetShake();
        }

        if (this.phase === CONSTANTS.STATES.AIMING || this.phase === CONSTANTS.STATES.POWERING) {
            this.input.update(dt);
            const visuals = this.input.getVisuals();
            this.ui.updateAim(visuals.aim);
            this.ui.updatePower(visuals.power);
        }

        if (this.phase === CONSTANTS.STATES.FLIGHT && !this.shotResultProcessed) {
            const goalCollision = this.physics.checkGoalCollision(this.ball);
            const keeperSave = this.physics.checkKeeperCollision(this.ball, this.keeper);

            if (keeperSave) {
                this.handleRoundEnd('SAVE');
            } else if (goalCollision === 'GOAL') {
                this.handleRoundEnd('GOAL');
            } else if (goalCollision === 'MISS' || goalCollision === 'POST' || goalCollision === 'CROSSBAR') {
                if (this.ball.position.z > CONSTANTS.FIELD.GOAL_Z + 1 || this.ball.isStatic) {
                    this.handleRoundEnd('MISS');
                }
            }
        }

        this.renderer.render({
            ball: this.ball,
            keeper: this.keeper,
            particles: this.particles.getActiveParticles()
        });
    }

    handleRoundEnd(result) {
        this.shotResultProcessed = true;
        this.phase = CONSTANTS.STATES.ROUND_OVER;
        const shooter = this.state.turn;

        let displayResult = result;
        if (result === 'SAVE') displayResult = 'SAVED'; // Cleaner text

        let type = 'neutral';
        if (shooter === 'PLAYER' && result === 'GOAL') type = 'good';
        else if (shooter === 'CPU' && result !== 'GOAL') type = 'good';
        else type = 'bad';

        this.ui.showFeedback(displayResult, type);
        this.state.recordResult(shooter, result);
        this.ui.updateDots(this.state.playerHistory, this.state.cpuHistory);
        this.ui.updateScore(this.state.playerScore, this.state.cpuScore, this.state.currentRound);

        if (shooter === 'PLAYER') {
            this.ai.notifyShotResult(0, 0, result);
        }

        // Visuals
        if (result === 'GOAL') {
            this.particles.emit(this.ball.position, 50, 'GOAL');
            this.shakeTimer = 0.5; // Shake camera
        } else if (result === 'POST' || result === 'CROSSBAR') {
            this.particles.emit(this.ball.position, 20, 'HIT');
        }

        setTimeout(() => {
            const next = this.state.nextTurn();
            if (this.state.matchOver) {
                this.phase = CONSTANTS.STATES.GAME_OVER;
                this.ui.showGameOver(this.state.playerScore, this.state.cpuScore, this.state.winner === 'PLAYER');
            } else {
                this.startRound();
            }
        }, 3000);
    }
}

window.game = new Game();
