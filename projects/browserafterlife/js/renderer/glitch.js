
export class GlitchPass {
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.frame = 0;
    }

    apply(intensity = 0) {
        this.frame++;
        if (intensity <= 0) return;

        // random chance to trigger heavy glitch vs subtle
        if (Math.random() > 0.95) intensity *= 2;

        const w = this.canvas.width;
        const h = this.canvas.height;

        // 1. Color Channel Shift (Chromatic Aberration)
        if (intensity > 0.2) {
            const shift = Math.floor(intensity * 10);
            const imageData = this.ctx.getImageData(0, 0, w, h);
            const data = imageData.data;
            const copy = new Uint8ClampedArray(data);

            for (let i = 0; i < data.length; i += 4) {
                // R stays, G shifts, B shifts more
                if (i + 4 * shift < data.length) {
                    data[i + 1] = copy[i + 1 + 4 * shift]; // G
                }
                if (i + 8 * shift < data.length) {
                    data[i + 2] = copy[i + 2 + 8 * shift]; // B
                }
            }
            this.ctx.putImageData(imageData, 0, 0);
        }

        // 2. Scanline Displacement (Horizontal Tearing)
        if (Math.random() < intensity) {
            const numSlices = Math.floor(Math.random() * 5) + 1;
            for (let i = 0; i < numSlices; i++) {
                const sliceH = Math.floor(Math.random() * 50) + 10;
                const sliceY = Math.floor(Math.random() * (h - sliceH));
                const offsetX = (Math.random() - 0.5) * intensity * 100;

                // Draw slice shifted
                this.ctx.drawImage(
                    this.canvas,
                    0, sliceY, w, sliceH,
                    offsetX, sliceY, w, sliceH
                );
            }
        }

        // 3. Digital Noise / Grain
        if (intensity > 0.5) {
            const grainCanvas = document.createElement('canvas');
            grainCanvas.width = w;
            grainCanvas.height = h;
            const gCtx = grainCanvas.getContext('2d');
            const pixels = gCtx.createImageData(w, h);

            for (let i = 0; i < pixels.data.length; i += 4) {
                if (Math.random() > 0.8) {
                    const val = Math.random() * 255;
                    pixels.data[i] = val;
                    pixels.data[i + 1] = val;
                    pixels.data[i + 2] = val;
                    pixels.data[i + 3] = 40; // Alpha
                }
            }
            gCtx.putImageData(pixels, 0, 0);

            this.ctx.save();
            this.ctx.globalCompositeOperation = 'overlay';
            this.ctx.drawImage(grainCanvas, 0, 0);
            this.ctx.restore();
        }

        // 4. Invert Flashes
        if (intensity > 0.8 && Math.random() > 0.9) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'difference';
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, w, h);
            this.ctx.restore();
        }
    }

    // Pixel Sorting (Expensive, run rarely)
    pixelSort() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const img = this.ctx.getImageData(0, 0, w, h);
        const d = img.data;

        // Sort rows based on brightness?
        for (let y = 0; y < h; y += 2) {
            if (Math.random() > 0.2) continue;

            const rowStart = y * w * 4;
            const rowEnd = (y + 1) * w * 4;
            const width = Math.floor(Math.random() * w);
            const startX = Math.floor(Math.random() * (w - width));

            // Extract segment
            // ... actually native JS sort on pixel arrays is slow in loop.
            // Simpler approach: Smear
            const index = (y * w + startX) * 4;
            const r = d[index];
            const g = d[index + 1];
            const b = d[index + 2];

            for (let x = startX; x < startX + width && x < w; x++) {
                const i = (y * w + x) * 4;
                d[i] = r; d[i + 1] = g; d[i + 2] = b;
            }
        }
        this.ctx.putImageData(img, 0, 0);
    }
}
