
export class Medium {
    constructor(ctx, element, onGesture) {
        this.ctx = ctx; // Main canvas context for drawing trails
        this.element = element; // Element to attach listeners to
        this.callback = onGesture;

        this.isDrawing = false;
        this.points = [];

        this.init();
    }

    init() {
        // Use right click for "magic" gestures
        this.element.addEventListener('contextmenu', e => e.preventDefault());

        this.element.addEventListener('mousedown', (e) => {
            if (e.button === 2) this.startStroke(e);
        });
        window.addEventListener('mousemove', (e) => this.addPoint(e)); // Window for drag out
        window.addEventListener('mouseup', () => this.endStroke());
    }

    startStroke(e) {
        this.isDrawing = true;
        this.points = [{ x: e.clientX, y: e.clientY }];
    }

    addPoint(e) {
        if (!this.isDrawing) return;
        this.points.push({ x: e.clientX, y: e.clientY });

        // Visual feedback immediate
        // We rely on main loop to render the trail from this.points?
        // No, let's allow access to points or render immediately on overlay
    }

    endStroke() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (this.points.length > 20) {
            const gesture = this.recognize();
            if (gesture) {
                console.log("Cast Spell:", gesture);
                this.callback(gesture);
            }
        }
    }

    recognize() {
        // 1. Bounding Box check
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const ratio = width / height;

        // 2. Start/End Distance
        const start = this.points[0];
        const end = this.points[this.points.length - 1];
        const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

        // Circle Detection (End is close to Start, and Aspect Ratio ~ 1)
        if (dist < (width + height) / 4 && ratio > 0.8 && ratio < 1.2) {
            return 'CIRCLE';
        }

        // Line (Horizontal)
        if (ratio > 3 && height < 50) return 'LINE_H';

        // Line (Vertical)
        if (ratio < 0.3 && width < 50) return 'LINE_V';

        // Lightning (Zig Zag - changes in X direction direction?)
        // Count inflection points

        return null;
    }

    draw(ctx) {
        if (!this.isDrawing || this.points.length < 2) return;

        ctx.save();
        ctx.strokeStyle = '#a0ffe0';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#a0ffe0';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            // Smoothing
            // ctx.lineTo(this.points[i].x, this.points[i].y);

            const xc = (this.points[i].x + this.points[i - 1].x) / 2;
            const yc = (this.points[i].y + this.points[i - 1].y) / 2;
            ctx.quadraticCurveTo(this.points[i - 1].x, this.points[i - 1].y, xc, yc);
        }
        ctx.lineTo(this.points[this.points.length - 1].x, this.points[this.points.length - 1].y);
        ctx.stroke();
        ctx.restore();
    }
}
