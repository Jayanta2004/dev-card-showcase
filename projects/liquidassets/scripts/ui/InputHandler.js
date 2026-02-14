import { Vector2 } from '../fluid/Vector2.js';

export class InputHandler {
    constructor(canvas, simulation) {
        this.canvas = canvas;
        this.sim = simulation;

        this.isDragging = false;
        this.draggedDrain = null;
        this.dragOffset = new Vector2();

        this.initEvents();
    }

    initEvents() {
        // Bind methods to preserve 'this'
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scroll
            const touch = e.touches[0];
            this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }, { passive: false });

        window.addEventListener('touchend', this.onMouseUp.bind(this));
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return new Vector2(
            e.clientX - rect.left,
            e.clientY - rect.top
        );
    }

    onMouseDown(e) {
        const mPos = this.getMousePos(e);

        // Check if clicking a drain
        // Iterate backwards to catch top interactions first
        for (let i = this.sim.drains.length - 1; i >= 0; i--) {
            const drain = this.sim.drains[i];
            if (drain.contains(mPos.x, mPos.y)) {
                this.isDragging = true;
                this.draggedDrain = drain;
                drain.isDragging = true;

                // Calculate offset so center doesn't snap to mouse
                this.dragOffset.set(drain.pos.x - mPos.x, drain.pos.y - mPos.y);
                return;
            }
        }

        // If not drain, maybe interaction force with fluid? (Optional feature)
    }

    onMouseMove(e) {
        if (!this.isDragging || !this.draggedDrain) return;

        const mPos = this.getMousePos(e);

        // Update drain position
        this.draggedDrain.pos.x = mPos.x + this.dragOffset.x;
        this.draggedDrain.pos.y = mPos.y + this.dragOffset.y;

        // Clamp to screen
        // this.draggedDrain.pos.x = Math.max(this.draggedDrain.radius, Math.min(this.sim.width - this.draggedDrain.radius, this.draggedDrain.pos.x));
        // this.draggedDrain.pos.y = Math.max(this.draggedDrain.radius, Math.min(this.sim.height - this.draggedDrain.radius, this.draggedDrain.pos.y));
    }

    onMouseUp(e) {
        if (this.draggedDrain) {
            this.draggedDrain.isDragging = false;
        }
        this.isDragging = false;
        this.draggedDrain = null;
    }
}
