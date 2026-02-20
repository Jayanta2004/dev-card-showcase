/**
 * ========================================
 * GLASSBOUND - Physics Engine
 * Crack propagation and physics simulation
 * ========================================
 */

/**
 * Physics-based crack propagation system
 */
class CrackPhysics {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cracks = [];
        this.stressPoints = [];
        this.crackSegments = [];
        this.propagationSpeed = 200; // pixels per second
        this.branchProbability = 0.3;
        this.maxBranchAngle = Math.PI / 3;
        this.minCrackLength = 20;
        this.maxCrackLength = 150;
        this.dampingFactor = 0.95;
        
        this.setupCanvas();
    }
    
    /**
     * Setup canvas dimensions
     */
    setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    /**
     * Add a stress point that affects crack propagation
     */
    addStressPoint(x, y, intensity = 1.0) {
        this.stressPoints.push({
            x,
            y,
            intensity,
            radius: 100 * intensity,
            decay: 0.98
        });
    }
    
    /**
     * Calculate stress field at a given point
     */
    calculateStressField(x, y) {
        let totalStress = 0;
        let stressVector = { x: 0, y: 0 };
        
        this.stressPoints.forEach(point => {
            const dx = x - point.x;
            const dy = y - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < point.radius) {
                const stress = point.intensity * (1 - distance / point.radius);
                totalStress += stress;
                
                // Add directional component
                const angle = Math.atan2(dy, dx);
                stressVector.x += Math.cos(angle) * stress;
                stressVector.y += Math.sin(angle) * stress;
            }
        });
        
        return {
            magnitude: totalStress,
            direction: Math.atan2(stressVector.y, stressVector.x),
            vector: stressVector
        };
    }
    
    /**
     * Create a new crack from an impact point
     */
    createCrack(x, y, intensity = 1.0, initialAngle = null) {
        // Add stress point at impact
        this.addStressPoint(x, y, intensity);
        
        // Create main crack with random or specified angle
        const angle = initialAngle !== null ? initialAngle : Math.random() * Math.PI * 2;
        const length = this.minCrackLength + Math.random() * (this.maxCrackLength - this.minCrackLength);
        
        const crack = {
            startX: x,
            startY: y,
            endX: x + Math.cos(angle) * length * intensity,
            endY: y + Math.sin(angle) * length * intensity,
            angle: angle,
            intensity: intensity,
            width: 1 + intensity * 2,
            opacity: 0.8 + intensity * 0.2,
            segments: [],
            branches: [],
            active: true,
            progress: 0,
            speed: this.propagationSpeed * (0.8 + Math.random() * 0.4)
        };
        
        // Generate crack path with segments
        this.generateCrackPath(crack);
        
        // Add to cracks array
        this.cracks.push(crack);
        
        // Create branches based on intensity
        const branchCount = Math.floor(intensity * 3 * (1 + Math.random()));
        for (let i = 0; i < branchCount; i++) {
            if (Math.random() < this.branchProbability) {
                this.createBranch(crack, Math.random());
            }
        }
        
        return crack;
    }
    
    /**
     * Generate crack path with realistic segmentation
     */
    generateCrackPath(crack) {
        const dx = crack.endX - crack.startX;
        const dy = crack.endY - crack.startY;
        const totalLength = Math.sqrt(dx * dx + dy * dy);
        const segmentCount = Math.ceil(totalLength / 10);
        
        let currentX = crack.startX;
        let currentY = crack.startY;
        let currentAngle = crack.angle;
        
        for (let i = 0; i < segmentCount; i++) {
            const t = (i + 1) / segmentCount;
            const segmentLength = totalLength / segmentCount;
            
            // Add some randomness to angle for natural look
            const angleVariation = (Math.random() - 0.5) * 0.2;
            currentAngle += angleVariation;
            
            // Calculate stress influence
            const nextX = currentX + Math.cos(currentAngle) * segmentLength;
            const nextY = currentY + Math.sin(currentAngle) * segmentLength;
            const stress = this.calculateStressField(nextX, nextY);
            
            // Adjust angle based on stress field
            if (stress.magnitude > 0.1) {
                currentAngle += (stress.direction - currentAngle) * 0.1;
            }
            
            crack.segments.push({
                x1: currentX,
                y1: currentY,
                x2: nextX,
                y2: nextY,
                width: crack.width * (1 - t * 0.3),
                opacity: crack.opacity * (1 - t * 0.2),
                progress: 0
            });
            
            currentX = nextX;
            currentY = nextY;
        }
    }
    
    /**
     * Create a branch from an existing crack
     */
    createBranch(parentCrack, position) {
        const segmentIndex = Math.floor(position * parentCrack.segments.length);
        if (segmentIndex >= parentCrack.segments.length) return;
        
        const segment = parentCrack.segments[segmentIndex];
        const branchX = segment.x1 + (segment.x2 - segment.x1) * 0.5;
        const branchY = segment.y1 + (segment.y2 - segment.y1) * 0.5;
        
        const baseAngle = Math.atan2(segment.y2 - segment.y1, segment.x2 - segment.x1);
        const branchAngle = baseAngle + (Math.random() - 0.5) * this.maxBranchAngle;
        const branchLength = (this.minCrackLength + Math.random() * 50) * 0.6;
        
        const branch = {
            startX: branchX,
            startY: branchY,
            endX: branchX + Math.cos(branchAngle) * branchLength,
            endY: branchY + Math.sin(branchAngle) * branchLength,
            angle: branchAngle,
            intensity: parentCrack.intensity * 0.7,
            width: parentCrack.width * 0.6,
            opacity: parentCrack.opacity * 0.8,
            segments: [],
            active: true,
            progress: 0,
            speed: parentCrack.speed * 0.8
        };
        
        this.generateCrackPath(branch);
        parentCrack.branches.push(branch);
        
        // Recursively create sub-branches with lower probability
        if (Math.random() < this.branchProbability * 0.5 && branch.intensity > 0.3) {
            this.createBranch(branch, Math.random());
        }
    }
    
    /**
     * Update crack propagation physics
     */
    update(deltaTime) {
        // Update stress point decay
        this.stressPoints = this.stressPoints.filter(point => {
            point.intensity *= point.decay;
            point.radius *= point.decay;
            return point.intensity > 0.01;
        });
        
        // Update active cracks
        this.cracks.forEach(crack => {
            if (crack.active) {
                this.updateCrackProgress(crack, deltaTime);
            }
            
            // Update branches
            crack.branches.forEach(branch => {
                if (branch.active) {
                    this.updateCrackProgress(branch, deltaTime);
                }
            });
        });
    }
    
    /**
     * Update individual crack progress
     */
    updateCrackProgress(crack, deltaTime) {
        crack.progress = Math.min(1, crack.progress + (crack.speed * deltaTime) / 1000);
        
        // Update segment progress
        const targetSegment = Math.floor(crack.progress * crack.segments.length);
        crack.segments.forEach((segment, index) => {
            if (index <= targetSegment) {
                segment.progress = Math.min(1, segment.progress + deltaTime / 100);
            }
        });
        
        if (crack.progress >= 1) {
            crack.active = false;
        }
    }
    
    /**
     * Render all cracks to canvas
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Render all cracks
        this.cracks.forEach(crack => {
            this.renderCrack(crack);
            
            // Render branches
            crack.branches.forEach(branch => {
                this.renderCrack(branch);
            });
        });
    }
    
    /**
     * Render individual crack
     */
    renderCrack(crack) {
        this.ctx.save();
        
        crack.segments.forEach(segment => {
            if (segment.progress > 0) {
                // Calculate visible portion of segment
                const visibleLength = segment.progress;
                const x2 = segment.x1 + (segment.x2 - segment.x1) * visibleLength;
                const y2 = segment.y1 + (segment.y2 - segment.y1) * visibleLength;
                
                // Draw crack shadow
                this.ctx.strokeStyle = `rgba(0, 0, 0, ${segment.opacity * 0.3})`;
                this.ctx.lineWidth = segment.width + 1;
                this.ctx.lineCap = 'round';
                this.ctx.beginPath();
                this.ctx.moveTo(segment.x1 + 1, segment.y1 + 1);
                this.ctx.lineTo(x2 + 1, y2 + 1);
                this.ctx.stroke();
                
                // Draw main crack line
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${segment.opacity})`;
                this.ctx.lineWidth = segment.width;
                this.ctx.shadowBlur = 3;
                this.ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
                this.ctx.beginPath();
                this.ctx.moveTo(segment.x1, segment.y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                
                // Draw highlight
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${segment.opacity * 0.5})`;
                this.ctx.lineWidth = segment.width * 0.4;
                this.ctx.shadowBlur = 0;
                this.ctx.beginPath();
                this.ctx.moveTo(segment.x1, segment.y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        });
        
        this.ctx.restore();
    }
    
    /**
     * Calculate total crack coverage
     */
    getCrackCoverage() {
        let totalLength = 0;
        const maxArea = this.width * this.height;
        
        this.cracks.forEach(crack => {
            crack.segments.forEach(segment => {
                const dx = segment.x2 - segment.x1;
                const dy = segment.y2 - segment.y1;
                totalLength += Math.sqrt(dx * dx + dy * dy) * segment.progress;
            });
            
            crack.branches.forEach(branch => {
                branch.segments.forEach(segment => {
                    const dx = segment.x2 - segment.x1;
                    const dy = segment.y2 - segment.y1;
                    totalLength += Math.sqrt(dx * dx + dy * dy) * segment.progress * 0.5;
                });
            });
        });
        
        // Estimate coverage as percentage
        const estimatedCoverage = (totalLength * 2) / Math.sqrt(maxArea);
        return Math.min(1, estimatedCoverage);
    }
    
    /**
     * Get number of active cracks
     */
    getActiveCrackCount() {
        let count = this.cracks.filter(c => c.active).length;
        this.cracks.forEach(crack => {
            count += crack.branches.filter(b => b.active).length;
        });
        return count;
    }
    
    /**
     * Clear all cracks
     */
    clear() {
        this.cracks = [];
        this.stressPoints = [];
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    
    /**
     * Resize canvas
     */
    resize() {
        this.setupCanvas();
    }
}

/**
 * Vector mathematics utilities
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }
    
    subtract(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }
    
    multiply(scalar) {
        return new Vector2D(this.x * scalar, this.y * scalar);
    }
    
    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
        const mag = this.magnitude();
        return mag > 0 ? new Vector2D(this.x / mag, this.y / mag) : new Vector2D(0, 0);
    }
    
    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    
    angle() {
        return Math.atan2(this.y, this.x);
    }
    
    static fromAngle(angle, magnitude = 1) {
        return new Vector2D(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }
    
    static distance(v1, v2) {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * Particle system for break effects
 */
class ParticleSystem {
    constructor(container) {
        this.container = container;
        this.particles = [];
        this.gravity = new Vector2D(0, 0.5);
    }
    
    /**
     * Create explosion of particles
     */
    explode(x, y, count = 50, intensity = 1.0) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (2 + Math.random() * 8) * intensity;
            const velocity = Vector2D.fromAngle(angle, speed);
            
            const particle = {
                position: new Vector2D(x, y),
                velocity: velocity,
                acceleration: new Vector2D(0, 0),
                life: 1.0,
                decay: 0.015 + Math.random() * 0.01,
                size: 2 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
                opacity: 0.8 + Math.random() * 0.2,
                color: this.randomGlassColor()
            };
            
            this.particles.push(particle);
        }
    }
    
    /**
     * Generate random glass-like color
     */
    randomGlassColor() {
        const colors = [
            'rgba(255, 255, 255, ',
            'rgba(200, 220, 255, ',
            'rgba(220, 240, 255, ',
            'rgba(240, 250, 255, '
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Update all particles
     */
    update() {
        this.particles = this.particles.filter(particle => {
            // Apply physics
            particle.velocity = particle.velocity.add(this.gravity);
            particle.position = particle.position.add(particle.velocity);
            particle.rotation += particle.rotationSpeed;
            particle.life -= particle.decay;
            
            return particle.life > 0;
        });
    }
    
    /**
     * Render particles to DOM
     */
    render() {
        // Clear existing particles
        this.container.innerHTML = '';
        
        // Create DOM elements for particles
        this.particles.forEach(particle => {
            const el = document.createElement('div');
            el.className = 'particle';
            el.style.left = `${particle.position.x}px`;
            el.style.top = `${particle.position.y}px`;
            el.style.width = `${particle.size}px`;
            el.style.height = `${particle.size}px`;
            el.style.opacity = particle.opacity * particle.life;
            el.style.transform = `rotate(${particle.rotation}rad)`;
            el.style.background = particle.color + (particle.opacity * particle.life) + ')';
            this.container.appendChild(el);
        });
    }
    
    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.container.innerHTML = '';
    }
}

/**
 * Glass integrity calculator
 */
class IntegritySystem {
    constructor(initialIntegrity = 100) {
        this.integrity = initialIntegrity;
        this.maxIntegrity = initialIntegrity;
        this.damageHistory = [];
        this.criticalThreshold = 30;
        this.warningThreshold = 60;
    }
    
    /**
     * Apply damage to integrity
     */
    applyDamage(amount, position = null) {
        this.integrity = Math.max(0, this.integrity - amount);
        
        this.damageHistory.push({
            amount,
            position,
            timestamp: Date.now(),
            integrity: this.integrity
        });
        
        // Keep only recent history
        if (this.damageHistory.length > 100) {
            this.damageHistory.shift();
        }
        
        return this.integrity;
    }
    
    /**
     * Get integrity as percentage
     */
    getPercentage() {
        return (this.integrity / this.maxIntegrity) * 100;
    }
    
    /**
     * Check if integrity is critical
     */
    isCritical() {
        return this.integrity <= this.criticalThreshold;
    }
    
    /**
     * Check if integrity is in warning range
     */
    isWarning() {
        return this.integrity <= this.warningThreshold && !this.isCritical();
    }
    
    /**
     * Check if glass is broken
     */
    isBroken() {
        return this.integrity <= 0;
    }
    
    /**
     * Get damage rate (damage per second)
     */
    getDamageRate() {
        if (this.damageHistory.length < 2) return 0;
        
        const recent = this.damageHistory.slice(-10);
        const timeSpan = (recent[recent.length - 1].timestamp - recent[0].timestamp) / 1000;
        const totalDamage = recent.reduce((sum, entry) => sum + entry.amount, 0);
        
        return timeSpan > 0 ? totalDamage / timeSpan : 0;
    }
    
    /**
     * Reset integrity
     */
    reset() {
        this.integrity = this.maxIntegrity;
        this.damageHistory = [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CrackPhysics, Vector2D, ParticleSystem, IntegritySystem };
}
