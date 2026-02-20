import { EventEmitter } from '../core/EventEmitter.js';
import { Easing } from '../math/Easing.js';

export class InputHandler extends EventEmitter {
    constructor() {
        super();
        this.active = false;
        this.phase = 'IDLE'; // IDLE, AIMING, POWERING, LOCKED

        // Aiming Params ( -1 to 1 )
        this.aimValue = 0;
        this.aimSpeed = 1.2; // Cycles per second approx
        this.aimDirection = 1;

        // Power Params ( 0 to 1 )
        this.powerValue = 0;
        this.powerSpeed = 1.3;
        this.powerDirection = 1;

        this.boundClickHandler = this.handleClick.bind(this);
    }

    enable() {
        if (this.active) return;
        this.active = true;
        this.phase = 'IDLE';
        document.addEventListener('mousedown', this.boundClickHandler);
        document.addEventListener('touchstart', this.boundClickHandler, { passive: false });
        // Key press for space?
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.handleClick(e);
        });
    }

    disable() {
        this.active = false;
        document.removeEventListener('mousedown', this.boundClickHandler);
        document.removeEventListener('touchstart', this.boundClickHandler);
    }

    reset() {
        this.phase = 'IDLE';
        this.aimValue = 0;
        this.powerValue = 0;
    }

    update(dt) {
        if (!this.active) return;

        if (this.phase === 'AIMING') {
            // Oscillate aim
            this.aimValue += this.aimSpeed * this.aimDirection * dt;
            if (this.aimValue > 1) {
                this.aimValue = 1;
                this.aimDirection = -1;
            } else if (this.aimValue < -1) {
                this.aimValue = -1;
                this.aimDirection = 1;
            }
        } else if (this.phase === 'POWERING') {
            // Oscillate power 0 -> 1 -> 0
            this.powerValue += this.powerSpeed * this.powerDirection * dt;
            if (this.powerValue > 1) {
                this.powerValue = 1;
                this.powerDirection = -1;
            } else if (this.powerValue < 0) {
                this.powerValue = 0;
                this.powerDirection = 1;
            }
        }
    }

    handleClick(e) {
        if (e.type === 'touchstart') e.preventDefault();
        if (!this.active) return;

        switch (this.phase) {
            case 'IDLE':
                this.phase = 'AIMING';
                this.emit('phase_change', 'AIMING');
                break;
            case 'AIMING':
                this.phase = 'POWERING';
                this.emit('aim_locked', this.aimValue);
                this.emit('phase_change', 'POWERING');
                break;
            case 'POWERING':
                this.phase = 'LOCKED';
                this.emit('power_locked', this.powerValue);
                this.emit('shoot', { aim: this.aimValue, power: this.powerValue });
                this.disable();
                break;
        }
    }

    getVisuals() {
        return {
            aim: this.aimValue,
            power: this.powerValue,
            phase: this.phase
        };
    }
}
