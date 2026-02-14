export class LevelGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    generate(type = 'random') {
        const obstacles = [];
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        if (type === 'random') {
            const count = Math.floor(Math.random() * 5) + 3;
            for (let i = 0; i < count; i++) {
                if (Math.random() > 0.5) {
                    obstacles.push({
                        type: 'circle',
                        x: Math.random() * this.width,
                        y: Math.random() * this.height,
                        r: 20 + Math.random() * 80
                    });
                } else {
                    obstacles.push({
                        type: 'rect',
                        x: Math.random() * (this.width - 100),
                        y: Math.random() * (this.height - 100),
                        w: 50 + Math.random() * 200,
                        h: 20 + Math.random() * 100
                    });
                }
            }
        } else if (type === 'symmetry') {
            const cx = this.width / 2;
            const cy = this.height / 2;
            obstacles.push({ type: 'circle', x: cx, y: cy, r: 80 });

            const count = 4;
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const dist = 200;
                obstacles.push({
                    type: 'circle',
                    x: cx + Math.cos(angle) * dist,
                    y: cy + Math.sin(angle) * dist,
                    r: 40
                });
            }
        } else if (type === 'chaos') {
            // Lots of small static noise
            for (let i = 0; i < 20; i++) {
                obstacles.push({
                    type: 'circle',
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    r: 10 + Math.random() * 20
                });
            }
        }

        return obstacles;
    }
}
