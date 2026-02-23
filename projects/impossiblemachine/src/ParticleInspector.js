export class ParticleInspector {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.selectedParticle = null;

        this.panelWidth = 250;
        this.panelHeight = 300;
        this.x = width - this.panelWidth - 10;
        this.y = 10;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.x = width - this.panelWidth - 10;
    }

    inspect(particle) {
        this.selectedParticle = particle;
    }

    draw() {
        if (!this.selectedParticle) return;

        // Check if particle is dead
        if (this.selectedParticle.energy <= 0) {
            this.selectedParticle = null;
            return;
        }

        const p = this.selectedParticle;
        const dna = p.dna;

        // Background
        this.ctx.fillStyle = 'rgba(20, 20, 20, 0.8)';
        this.ctx.fillRect(this.x, this.y, this.panelWidth, this.panelHeight);

        // Border
        this.ctx.strokeStyle = p.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.x, this.y, this.panelWidth, this.panelHeight);

        // Text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'left';

        let py = this.y + 30;
        const lh = 20; // Line height

        this.ctx.fillText(`Type: ${p.type.toUpperCase()}`, this.x + 10, py); py += lh;
        this.ctx.fillText(`Energy: ${Math.floor(p.energy)}`, this.x + 10, py); py += lh;
        this.ctx.fillText(`Age: ${p.age}`, this.x + 10, py); py += lh * 1.5;

        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText(`-- Physics DNA --`, this.x + 10, py); py += lh;
        this.ctx.fillStyle = '#ddd';

        this.ctx.fillText(`Gravity X: ${dna.gravity.x.toFixed(2)}`, this.x + 10, py); py += lh;
        this.ctx.fillText(`Gravity Y: ${dna.gravity.y.toFixed(2)}`, this.x + 10, py); py += lh;
        this.ctx.fillText(`Restitution: ${dna.restitution.toFixed(2)}`, this.x + 10, py); py += lh;
        this.ctx.fillText(`Friction: ${dna.friction.toFixed(3)}`, this.x + 10, py); py += lh;
        this.ctx.fillText(`Vision: ${Math.floor(dna.perceptionRadius)}`, this.x + 10, py); py += lh;

        // Draw miniature visual
        this.ctx.beginPath();
        this.ctx.arc(this.x + this.panelWidth - 40, this.y + 40, 20, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.fill();
        this.ctx.stroke();
    }
}
