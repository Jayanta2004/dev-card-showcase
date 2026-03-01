import { Vector2 } from '../utils/Vector2.js';
import { Logger } from '../utils/Logger.js';
import { Config } from '../core/Config.js';

/**
 * @class InputHandler
 * @description Manages user input (Mouse, Touch).
 * Calculates velocity, speed, and position commands.
 * Dispatches raw input events for the Drawing system to consume.
 */
export class InputHandler {
    /**
     * @param {HTMLElement} targetElement - DOM Element to attach listeners to
     * @param {EventManager} eventManager - System event bus
     */
    constructor(targetElement, eventManager) {
        this.target = targetElement;
        this.events = eventManager;

        this.isDrawing = false;
        this.lastPosition = new Vector2(0, 0);
        this.currentPosition = new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.speed = 0;

        this.boundMouseDown = this.onMouseDown.bind(this);
        this.boundMouseMove = this.onMouseMove.bind(this);
        this.boundMouseUp = this.onMouseUp.bind(this);

        // Touch bindings
        this.boundTouchStart = this.onTouchStart.bind(this);
        this.boundTouchMove = this.onTouchMove.bind(this);
        this.boundTouchEnd = this.onTouchEnd.bind(this);

        this.init();
    }

    init() {
        this.target.addEventListener('mousedown', this.boundMouseDown);
        window.addEventListener('mousemove', this.boundMouseMove);
        window.addEventListener('mouseup', this.boundMouseUp);

        // Passive false for touch to prevent scrolling
        this.target.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        window.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        window.addEventListener('touchend', this.boundTouchEnd);

        Logger.info('InputHandler initialized');
    }

    _updateCoordinates(event) {
        const rect = this.target.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);

        if (clientX === undefined || clientY === undefined) return;

        this.currentPosition = new Vector2(
            clientX - rect.left,
            clientY - rect.top
        );

        // Calculate velocity
        this.velocity = this.currentPosition.sub(this.lastPosition);
        this.speed = this.velocity.mag();

        this.lastPosition = this.currentPosition.clone();
    }

    onMouseDown(event) {
        this.isDrawing = true;
        this._updateCoordinates(event);
        // Reset last pos to avoid jump
        this.lastPosition = this.currentPosition.clone();

        this.events.emit('INPUT_START', {
            position: this.currentPosition,
            time: Date.now()
        });
    }

    onMouseMove(event) {
        if (!this.isDrawing) return;

        this._updateCoordinates(event);

        this.events.emit('INPUT_MOVE', {
            position: this.currentPosition,
            velocity: this.velocity,
            speed: this.speed,
            time: Date.now()
        });
    }

    onMouseUp(event) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        this.events.emit('INPUT_END', {
            position: this.currentPosition,
            time: Date.now()
        });
    }

    // Touch Handlers
    onTouchStart(event) {
        event.preventDefault();
        this.onMouseDown(event);
    }

    onTouchMove(event) {
        event.preventDefault();
        this.onMouseMove(event);
    }

    onTouchEnd(event) {
        this.onMouseUp(event);
    }

    destroy() {
        this.target.removeEventListener('mousedown', this.boundMouseDown);
        window.removeEventListener('mousemove', this.boundMouseMove);
        window.removeEventListener('mouseup', this.boundMouseUp);

        this.target.removeEventListener('touchstart', this.boundTouchStart);
        window.removeEventListener('touchmove', this.boundTouchMove);
        window.removeEventListener('touchend', this.boundTouchEnd);
    }
}
