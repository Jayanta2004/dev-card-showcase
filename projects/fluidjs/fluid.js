class FluidSimulation {
    constructor(canvas, resolution = 128) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resolution = resolution;
        this.cellSize = 1;
        
        this.velocityX = [];
        this.velocityY = [];
        this.velocityX0 = [];
        this.velocityY0 = [];
        this.density = [];
        this.density0 = [];
        this.curl = [];
        
        this.dt = 0.1;
        this.diffusion = 0.0001;
        this.viscosity = 0.0001;
        this.fadeSpeed = 0.98;
        this.vorticity = 0.3;
        
        this.colorMode = 'rainbow';
        this.densityMultiplier = 1;
        this.brushSize = 3;
        
        this.particleSystem = [];
        this.maxParticles = 3000;
        this.showParticles = true;
        this.showVelocity = false;
        this.performanceMode = false;
        this.bloomEnabled = true;
        this.trailMode = false;
        this.diffusionAmount = 0.0001;
        
        this.init();
    }
    
    init() {
        const size = this.resolution * this.resolution;
        for (let i = 0; i < size; i++) {
            this.velocityX[i] = 0;
            this.velocityY[i] = 0;
            this.velocityX0[i] = 0;
            this.velocityY0[i] = 0;
            this.density[i] = 0;
            this.density0[i] = 0;
            this.curl[i] = 0;
        }
        this.particleSystem = [];
    }
    
    index(x, y) {
        x = Math.max(0, Math.min(this.resolution - 1, Math.floor(x)));
        y = Math.max(0, Math.min(this.resolution - 1, Math.floor(y)));
        return x + y * this.resolution;
    }
    
    addDensity(x, y, amount) {
        const idx = this.index(x, y);
        this.density[idx] += amount * this.densityMultiplier;
    }
    
    addVelocity(x, y, amountX, amountY) {
        const idx = this.index(x, y);
        this.velocityX[idx] += amountX;
        this.velocityY[idx] += amountY;
    }
    
    addParticle(x, y, vx, vy) {
        if (this.particleSystem.length < this.maxParticles && this.showParticles) {
            this.particleSystem.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                life: 1.0,
                size: Math.random() * 2 + 1
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particleSystem.length - 1; i >= 0; i--) {
            const p = this.particleSystem[i];
            
            const gridX = Math.floor((p.x / this.canvas.width) * this.resolution);
            const gridY = Math.floor((p.y / this.canvas.height) * this.resolution);
            const idx = this.index(gridX, gridY);
            
            p.vx = this.velocityX[idx] * 5;
            p.vy = this.velocityY[idx] * 5;
            
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.01;
            
            if (p.life <= 0 || p.x < 0 || p.x > this.canvas.width || p.y < 0 || p.y > this.canvas.height) {
                this.particleSystem.splice(i, 1);
            }
        }
    }
    
    calculateCurl() {
        for (let j = 1; j < this.resolution - 1; j++) {
            for (let i = 1; i < this.resolution - 1; i++) {
                const dvdx = this.velocityY[this.index(i + 1, j)] - this.velocityY[this.index(i - 1, j)];
                const dudy = this.velocityX[this.index(i, j + 1)] - this.velocityX[this.index(i, j - 1)];
                this.curl[this.index(i, j)] = dvdx - dudy;
            }
        }
    }
    
    applyVorticity() {
        for (let j = 1; j < this.resolution - 1; j++) {
            for (let i = 1; i < this.resolution - 1; i++) {
                const idx = this.index(i, j);
                const curlHere = this.curl[idx];
                
                const curlGradX = Math.abs(this.curl[this.index(i + 1, j)]) - Math.abs(this.curl[this.index(i - 1, j)]);
                const curlGradY = Math.abs(this.curl[this.index(i, j + 1)]) - Math.abs(this.curl[this.index(i, j - 1)]);
                
                const len = Math.sqrt(curlGradX * curlGradX + curlGradY * curlGradY) + 0.00001;
                
                const normX = curlGradX / len;
                const normY = curlGradY / len;
                
                this.velocityX[idx] += normY * curlHere * this.vorticity * this.dt;
                this.velocityY[idx] -= normX * curlHere * this.vorticity * this.dt;
            }
        }
    }
    
    diffuse(b, x, x0, diff, dt) {
        const a = dt * diff * (this.resolution - 2) * (this.resolution - 2);
        this.linearSolve(b, x, x0, a, 1 + 6 * a);
    }
    
    linearSolve(b, x, x0, a, c) {
        const cRecip = 1.0 / c;
        const iterations = this.performanceMode ? 2 : 4;
        for (let iter = 0; iter < iterations; iter++) {
            for (let j = 1; j < this.resolution - 1; j++) {
                for (let i = 1; i < this.resolution - 1; i++) {
                    const idx = this.index(i, j);
                    x[idx] = (x0[idx] + a * (
                        x[this.index(i + 1, j)] +
                        x[this.index(i - 1, j)] +
                        x[this.index(i, j + 1)] +
                        x[this.index(i, j - 1)]
                    )) * cRecip;
                }
            }
            this.setBounds(b, x);
        }
    }
    
    project(velocX, velocY, p, div) {
        for (let j = 1; j < this.resolution - 1; j++) {
            for (let i = 1; i < this.resolution - 1; i++) {
                const idx = this.index(i, j);
                div[idx] = -0.5 * (
                    velocX[this.index(i + 1, j)] -
                    velocX[this.index(i - 1, j)] +
                    velocY[this.index(i, j + 1)] -
                    velocY[this.index(i, j - 1)]
                ) / this.resolution;
                p[idx] = 0;
            }
        }
        
        this.setBounds(0, div);
        this.setBounds(0, p);
        this.linearSolve(0, p, div, 1, 6);
        
        for (let j = 1; j < this.resolution - 1; j++) {
            for (let i = 1; i < this.resolution - 1; i++) {
                const idx = this.index(i, j);
                velocX[idx] -= 0.5 * (p[this.index(i + 1, j)] - p[this.index(i - 1, j)]) * this.resolution;
                velocY[idx] -= 0.5 * (p[this.index(i, j + 1)] - p[this.index(i, j - 1)]) * this.resolution;
            }
        }
        
        this.setBounds(1, velocX);
        this.setBounds(2, velocY);
    }
    
    advect(b, d, d0, velocX, velocY, dt) {
        const dtx = dt * (this.resolution - 2);
        const dty = dt * (this.resolution - 2);
        
        for (let j = 1; j < this.resolution - 1; j++) {
            for (let i = 1; i < this.resolution - 1; i++) {
                let x = i - dtx * velocX[this.index(i, j)];
                let y = j - dty * velocY[this.index(i, j)];
                
                x = Math.max(0.5, Math.min(this.resolution - 1.5, x));
                y = Math.max(0.5, Math.min(this.resolution - 1.5, y));
                
                const i0 = Math.floor(x);
                const i1 = i0 + 1;
                const j0 = Math.floor(y);
                const j1 = j0 + 1;
                
                const s1 = x - i0;
                const s0 = 1 - s1;
                const t1 = y - j0;
                const t0 = 1 - t1;
                
                d[this.index(i, j)] =
                    s0 * (t0 * d0[this.index(i0, j0)] + t1 * d0[this.index(i0, j1)]) +
                    s1 * (t0 * d0[this.index(i1, j0)] + t1 * d0[this.index(i1, j1)]);
            }
        }
        
        this.setBounds(b, d);
    }
    
    setBounds(b, x) {
        for (let i = 1; i < this.resolution - 1; i++) {
            x[this.index(i, 0)] = b === 2 ? -x[this.index(i, 1)] : x[this.index(i, 1)];
            x[this.index(i, this.resolution - 1)] = b === 2 ? -x[this.index(i, this.resolution - 2)] : x[this.index(i, this.resolution - 2)];
        }
        
        for (let j = 1; j < this.resolution - 1; j++) {
            x[this.index(0, j)] = b === 1 ? -x[this.index(1, j)] : x[this.index(1, j)];
            x[this.index(this.resolution - 1, j)] = b === 1 ? -x[this.index(this.resolution - 2, j)] : x[this.index(this.resolution - 2, j)];
        }
        
        x[this.index(0, 0)] = 0.5 * (x[this.index(1, 0)] + x[this.index(0, 1)]);
        x[this.index(0, this.resolution - 1)] = 0.5 * (x[this.index(1, this.resolution - 1)] + x[this.index(0, this.resolution - 2)]);
        x[this.index(this.resolution - 1, 0)] = 0.5 * (x[this.index(this.resolution - 2, 0)] + x[this.index(this.resolution - 1, 1)]);
        x[this.index(this.resolution - 1, this.resolution - 1)] = 0.5 * (x[this.index(this.resolution - 2, this.resolution - 1)] + x[this.index(this.resolution - 1, this.resolution - 2)]);
    }
    
    step() {
        if (!this.performanceMode) {
            this.calculateCurl();
            this.applyVorticity();
        }
        
        this.diffuse(1, this.velocityX0, this.velocityX, this.viscosity, this.dt);
        this.diffuse(2, this.velocityY0, this.velocityY, this.viscosity, this.dt);
        
        this.project(this.velocityX0, this.velocityY0, this.velocityX, this.velocityY);
        
        this.advect(1, this.velocityX, this.velocityX0, this.velocityX0, this.velocityY0, this.dt);
        this.advect(2, this.velocityY, this.velocityY0, this.velocityX0, this.velocityY0, this.dt);
        
        this.project(this.velocityX, this.velocityY, this.velocityX0, this.velocityY0);
        
        this.diffuse(0, this.density0, this.density, this.diffusionAmount, this.dt);
        this.advect(0, this.density, this.density0, this.velocityX, this.velocityY, this.dt);
        
        if (!this.trailMode) {
            this.fadeDensity();
        }
        
        if (this.showParticles && !this.performanceMode) {
            this.updateParticles();
        }
    }
    
    fadeDensity() {
        for (let i = 0; i < this.density.length; i++) {
            this.density[i] *= this.fadeSpeed;
        }
    }
    
    getColor(density, x, y) {
        const d = Math.min(1, density / 100);
        
        switch(this.colorMode) {
            case 'rainbow':
                const hue = ((x + y) * 0.5 + Date.now() * 0.00005) % 360;
                return this.hslToRgb(hue, 100, 50, d);
            
            case 'blue':
                return `rgba(58, 134, 255, ${d})`;
            
            case 'fire':
                const fireR = Math.floor(255 * d);
                const fireG = Math.floor(100 * d);
                return `rgba(${fireR}, ${fireG}, 0, ${d})`;
            
            case 'purple':
                return `rgba(131, 56, 236, ${d})`;
            
            case 'green':
                return `rgba(6, 255, 165, ${d})`;
            
            case 'cyan':
                return `rgba(0, 255, 255, ${d})`;
            
            case 'mono':
                return `rgba(255, 255, 255, ${d})`;
            
            case 'custom':
                const time = Date.now() * 0.001;
                const customR = Math.floor((Math.sin(time) * 0.5 + 0.5) * 255 * d);
                const customG = Math.floor((Math.sin(time + 2) * 0.5 + 0.5) * 255 * d);
                const customB = Math.floor((Math.sin(time + 4) * 0.5 + 0.5) * 255 * d);
                return `rgba(${customR}, ${customG}, ${customB}, ${d})`;
            
            default:
                return `rgba(255, 255, 255, ${d})`;
        }
    }
    
    hslToRgb(h, s, l, a) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;
        
        if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
        else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
        else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
        else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
        else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
        else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }
        
        return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round((b + m) * 255)}, ${a})`;
    }
    
    render() {
        if (!this.trailMode) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        const scaleX = this.canvas.width / this.resolution;
        const scaleY = this.canvas.height / this.resolution;
        
        const step = this.performanceMode ? 2 : 1;
        
        for (let j = 0; j < this.resolution; j += step) {
            for (let i = 0; i < this.resolution; i += step) {
                const idx = this.index(i, j);
                const d = this.density[idx];
                
                if (d > 0.1) {
                    this.ctx.fillStyle = this.getColor(d, i, j);
                    this.ctx.fillRect(i * scaleX, j * scaleY, (scaleX * step) + 1, (scaleY * step) + 1);
                    
                    if (this.bloomEnabled && d > 50 && !this.performanceMode) {
                        this.ctx.globalAlpha = 0.3;
                        this.ctx.filter = 'blur(8px)';
                        this.ctx.fillRect(i * scaleX - 4, j * scaleY - 4, (scaleX * step) + 8, (scaleY * step) + 8);
                        this.ctx.filter = 'none';
                        this.ctx.globalAlpha = 1;
                    }
                }
            }
        }
        
        if (this.showVelocity) {
            this.renderVelocityField();
        }
        
        if (this.showParticles && !this.performanceMode) {
            this.renderParticles();
        }
    }
    
    renderVelocityField() {
        const step = 8;
        const scale = 10;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let j = step; j < this.resolution - step; j += step) {
            for (let i = step; i < this.resolution - step; i += step) {
                const idx = this.index(i, j);
                const vx = this.velocityX[idx] * scale;
                const vy = this.velocityY[idx] * scale;
                
                const x = (i / this.resolution) * this.canvas.width;
                const y = (j / this.resolution) * this.canvas.height;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + vx, y + vy);
                this.ctx.stroke();
            }
        }
    }
    
    renderParticles() {
        for (const p of this.particleSystem) {
            const alpha = p.life * 0.6;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    clear() {
        this.init();
    }
    
    setViscosity(value) {
        this.viscosity = value;
    }
    
    setDensityMultiplier(value) {
        this.densityMultiplier = value;
    }
    
    setColorMode(mode) {
        this.colorMode = mode;
    }
    
    setBrushSize(size) {
        this.brushSize = size;
    }
    
    setFadeSpeed(speed) {
        this.fadeSpeed = speed;
    }
    
    setBloomEnabled(enabled) {
        this.bloomEnabled = enabled;
    }
    
    setTrailMode(enabled) {
        this.trailMode = enabled;
    }
    
    setDiffusion(value) {
        this.diffusionAmount = value;
    }
    
    applyPreset(preset) {
        switch(preset) {
            case 'smoke':
                this.setViscosity(0.1);
                this.setDensityMultiplier(0.8);
                this.setFadeSpeed(0.985);
                this.setColorMode('mono');
                this.setDiffusion(0.0005);
                break;
            case 'water':
                this.setViscosity(0.05);
                this.setDensityMultiplier(1.5);
                this.setFadeSpeed(0.99);
                this.setColorMode('blue');
                this.setDiffusion(0.0001);
                break;
            case 'lava':
                this.setViscosity(0.5);
                this.setDensityMultiplier(2);
                this.setFadeSpeed(0.975);
                this.setColorMode('fire');
                this.setDiffusion(0.00005);
                break;
            case 'neon':
                this.setViscosity(0.02);
                this.setDensityMultiplier(1.8);
                this.setFadeSpeed(0.995);
                this.setColorMode('rainbow');
                this.setDiffusion(0.0002);
                break;
        }
    }
    
    setShowParticles(show) {
        this.showParticles = show;
        if (!show) {
            this.particleSystem = [];
        }
    }
    
    setShowVelocity(show) {
        this.showVelocity = show;
    }
    
    setPerformanceMode(enabled) {
        this.performanceMode = enabled;
        if (enabled) {
            this.particleSystem = [];
        }
    }
}
