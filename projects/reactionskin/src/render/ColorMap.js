/**
 * Advanced Color Mapping for Reaction Diffusion
 */
export class ColorMap {
    constructor() {
        // Multi-stop color gradient
        // Concentrations close to 0 are background
        // Concentrations close to 1 are peak B
        this.stops = [
            { pos: 0.0, r: 5, g: 5, b: 10 },    // Background (Deep Black-Blue)
            { pos: 0.1, r: 20, g: 40, b: 80 },    // Low B (Faint Blue)
            { pos: 0.3, r: 0, g: 150, b: 255 },   // Mid B (Cyan)
            { pos: 0.6, r: 200, g: 50, b: 255 },   // High B (Magenta/Purple)
            { pos: 1.0, r: 255, g: 255, b: 255 }    // Peak B (White)
        ];
    }

    /**
     * Get RGB for a value between 0 and 1
     */
    getColor(v) {
        v = Math.max(0, Math.min(1, v));

        for (let i = 0; i < this.stops.length - 1; i++) {
            const start = this.stops[i];
            const end = this.stops[i + 1];

            if (v >= start.pos && v <= end.pos) {
                const t = (v - start.pos) / (end.pos - start.pos);
                return {
                    r: Math.floor(start.r + (end.r - start.r) * t),
                    g: Math.floor(start.g + (end.g - start.g) * t),
                    b: Math.floor(start.b + (end.b - start.b) * t)
                };
            }
        }

        const last = this.stops[this.stops.length - 1];
        return { r: last.r, g: last.g, b: last.b };
    }
}
