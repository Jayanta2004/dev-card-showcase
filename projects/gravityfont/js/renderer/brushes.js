/**
 * GravityFont - Brush System
 * Defines different ways to render the connections and particles of soft bodies.
 */

class BrushSystem {
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.currentBrush = 'neon';
    }

    /**
     * Renders a constraint using the active brush.
     */
    drawConstraint(c, brushName = this.currentBrush) {
        switch (brushName) {
            case 'neon': this.drawNeon(c); break;
            case 'sketch': this.drawSketch(c); break;
            case 'dotted': this.drawDotted(c); break;
            case 'organic': this.drawOrganic(c); break;
            default: this.drawDefault(c); break;
        }
    }

    drawDefault(c) {
        this.ctx.beginPath();
        this.ctx.moveTo(c.p1.position.x, c.p1.position.y);
        this.ctx.lineTo(c.p2.position.x, c.p2.position.y);
        this.ctx.strokeStyle = c.color;
        this.ctx.lineWidth = c.thickness;
        this.ctx.stroke();
    }

    drawNeon(c) {
        // Multi-pass glow effect
        this.ctx.beginPath();
        this.ctx.moveTo(c.p1.position.x, c.p1.position.y);
        this.ctx.lineTo(c.p2.position.x, c.p2.position.y);

        // Outer glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = c.p1.color;
        this.ctx.strokeStyle = c.p1.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Inner core
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();
    }

    drawSketch(c) {
        const dx = c.p2.position.x - c.p1.position.x;
        const dy = c.p2.position.y - c.p1.position.y;
        const midX = (c.p1.position.x + c.p2.position.x) / 2;
        const midY = (c.p1.position.y + c.p2.position.y) / 2;

        // Draw multiple jittery lines to simulate hand-drawn sketch
        for (let i = 0; i < 3; i++) {
            const offsetX = (Math.random() - 0.5) * 4;
            const offsetY = (Math.random() - 0.5) * 4;

            this.ctx.beginPath();
            this.ctx.moveTo(c.p1.position.x + offsetX, c.p1.position.y + offsetY);
            this.ctx.quadraticCurveTo(
                midX + (Math.random() - 0.5) * 8,
                midY + (Math.random() - 0.5) * 8,
                c.p2.position.x + offsetX,
                c.p2.position.y + offsetY
            );
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
        }
    }

    drawDotted(c) {
        this.ctx.setLineDash([2, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(c.p1.position.x, c.p1.position.y);
        this.ctx.lineTo(c.p2.position.x, c.p2.position.y);
        this.ctx.strokeStyle = c.p1.color;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawOrganic(c) {
        // Thicker in the middle, thinner at ends
        const dx = c.p2.position.x - c.p1.position.x;
        const dy = c.p2.position.y - c.p1.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return;

        const angle = Math.atan2(dy, dx);
        const perpX = Math.cos(angle + Math.PI / 2);
        const perpY = Math.sin(angle + Math.PI / 2);

        this.ctx.beginPath();
        this.ctx.fillStyle = c.p1.color;

        // Draw a diamond/leaf shape along the constraint
        this.ctx.moveTo(c.p1.position.x, c.p1.position.y);
        this.ctx.lineTo(
            c.p1.position.x + dx * 0.5 + perpX * 3,
            c.p1.position.y + dy * 0.5 + perpY * 3
        );
        this.ctx.lineTo(c.p2.position.x, c.p2.position.y);
        this.ctx.lineTo(
            c.p1.position.x + dx * 0.5 - perpX * 3,
            c.p1.position.y + dy * 0.5 - perpY * 3
        );
        this.ctx.closePath();
        this.ctx.fill();
    }
}
