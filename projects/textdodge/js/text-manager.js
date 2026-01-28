/**
 * text-manager.js
 * 
 * Manages the text entities, physics simulations, and rendering.
 * Contains the TextEntity class and the main TextManager controller.
 */

// ==========================================
// Text Entity Class
// ==========================================

class TextEntity {
    /**
     * @param {HTMLElement} element The DOM element representing this word/char
     */
    constructor(element) {
        this.element = element;
        this.id = Utils.generateId();

        // Physical State
        // We use a separate transform position vs actual layout position
        // Layout position (origin) is where it 'wants' to be.
        this.origin = new Vector2(0, 0);
        this.position = new Vector2(0, 0); // Current position relative to origin
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);

        // Target Layout Offset (for Formations)
        this.layoutOffset = new Vector2(0, 0);

        // Physics Properties
        this.mass = AppConfig.physics.mass + (Math.random() * 0.5 - 0.25); // Slight mass variation
        this.stiffness = AppConfig.physics.springStiffness;
        this.damping = AppConfig.physics.springDamping;

        this.isHovered = false;

        // Cache layout
        this.updateLayoutOrigin();
    }

    /**
     * Reads the current DOM position to set the "Home" or "Origin" point.
     * Should be called on resize.
     */
    updateLayoutOrigin() {
        // We calculate origin relative to the viewport
        const center = Utils.getElementCenter(this.element);
        this.origin = center;
    }

    /**
     * Apply a force vector to the entity
     * F = ma -> a = F/m
     * @param {Vector2} force 
     */
    applyForce(force) {
        let f = force.copy();
        f.div(this.mass);
        this.acceleration.add(f);
    }

    /**
     * Update physics for this frame
     */
    update() {
        // 1. Calculate Spring Force (Hooke's Law)
        // Force = -k * displacement
        // Displacement is deviation from (0,0 + layoutOffset)
        // So displacement = position - layoutOffset
        let displacement = Vector2.sub(this.position, this.layoutOffset);
        let springForce = displacement.mult(-this.stiffness);
        this.applyForce(springForce);

        // 2. Calculate Repulsion from Cursor
        if (window.Cursor.isActive) {
            let cursorToEntity = Vector2.sub(this.getGlobalPosition(), window.Cursor.position);
            let dist = cursorToEntity.mag();
            const radius = AppConfig.cursor.interactionRadius;

            if (dist < radius) {
                // Calculate repulsion strength
                // Closer = Stronger. Linear falloff or exponential?
                // normalizedDist: 1 at center, 0 at edge
                let normalizedDist = Utils.mapRange(dist, 0, radius, 1, 0);
                normalizedDist = Math.max(0, normalizedDist);

                // Easing for smoother feel
                let power = Utils.Easing.easeOutQuad(normalizedDist);

                // Direction away from cursor
                let repulsionDir = cursorToEntity.normalize();

                // Add influence from cursor velocity
                // This adds "impact" feel
                let cursorVelImpact = 0; // Placeholder for advanced dot product logic

                let forceMagnitude = power * AppConfig.cursor.maxForce;
                repulsionDir.mult(forceMagnitude);

                this.applyForce(repulsionDir);
                this.isHovered = true;
            } else {
                this.isHovered = false;
            }
        }

        // 3. Update Velocity & Position
        this.velocity.add(this.acceleration);
        this.velocity.mult(AppConfig.physics.friction); // Dumping/Air Resistance
        this.position.add(this.velocity);

        // Reset acceleration
        this.acceleration.mult(0);

        // 4. Sleep check (Optimization)
        // Only sleep if very close to target (layoutOffset)
        // let distToTarget = Vector2.sub(this.position, this.layoutOffset).mag();
        // if (this.velocity.mag() < AppConfig.physics.restThreshold && distToTarget < 0.1) {
        //     this.position = this.layoutOffset.copy();
        //     this.velocity.set(0, 0);
        // }
    }

    /**
     * Render the state to the DOM
     */
    render() {
        // Only update DOM if position is non-zero (optimization)
        // For render, we check absolute difference or simplified check
        // With formations, position might be non-zero always.

        this.element.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;

        // Dynamic Shadow for Depth
        const shadowX = -this.position.x * 0.1;
        const shadowY = -this.position.y * 0.1;

        // Clamp shadow
        const sx = Utils.clamp(shadowX, -20, 20);
        const sy = Utils.clamp(shadowY, -20, 20);
        const blur = Math.abs(this.position.mag()) * 0.05;

        if (AppConfig.entities.colorChangeOnHover && this.isHovered) {
            this.element.style.color = AppConfig.entities.activeColor;
            this.element.style.textShadow = `${sx}px ${sy}px ${blur}px rgba(255, 71, 87, 0.4)`;
        } else {
            // We can check if offset is significant before clearing style?
            // But for smoothness we usually always apply if moved
            if (this.currentFormation !== 'default') {
                this.element.style.color = '#fff'; // Force white in formation
            } else {
                this.element.style.color = '';
            }
            this.element.style.textShadow = `${sx}px ${sy}px ${blur}px rgba(255, 255, 255, 0.05)`;
        }
    }

    /**
     * Get global position (Origin + Offset)
     */
    getGlobalPosition() {
        return Vector2.add(this.origin, this.position);
    }
}

// ==========================================
// Text Manager System
// ==========================================

class TextManagerSystem {
    constructor() {
        this.entities = [];
        this.initialized = false;
        this.resizeTimer = null;
        this.currentFormation = 'default';
        this.debugCanvas = null;
        this.ctx = null;
    }

    init() {
        console.log('Initializing Text Manager...');

        // 1. Process Text Splitting
        this.processDodgeText();

        // 2. Collect Entities
        const nodes = document.querySelectorAll('.word, .char');
        nodes.forEach(node => {
            const entity = new TextEntity(node);
            this.entities.push(entity);
        });

        // 3. Setup Debug Canvas
        if (AppConfig.rendering.enableDebugOverlay) {
            this.setupDebugCanvas();
        }

        // 4. Listeners
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                this.recalculateOrigins();
                if (this.debugCanvas) this.resizeDebugCanvas();
            }, 200);
        });

        // Formation Controls
        window.addEventListener('keydown', (e) => {
            if (e.key === '1') this.setFormation('default');
            if (e.key === '2') this.setFormation('grid');
            if (e.key === '3') this.setFormation('circle');
            if (e.key === '4') this.setFormation('scatter');
        });

        console.log('TextManager Ready. Press 1-4 for formations.');

        this.initialized = true;
    }

    /**
     * Helper to split .dodge-text elements if they aren't already wrapped
     */
    processDodgeText() {
        const targets = document.querySelectorAll('.dodge-text[data-split="true"]');
        targets.forEach(el => {
            Utils.splitTextToChars(el, 'char');
        });
        this.generateBackgroundGrid();
    }

    generateBackgroundGrid() {
        const gridContainer = document.getElementById('grid');
        if (!gridContainer) return;
        gridContainer.innerHTML = '';

        const cols = AppConfig.grid.cols;
        const rows = AppConfig.grid.rows;

        for (let i = 0; i < cols * rows; i++) {
            const dot = document.createElement('div');
            dot.className = 'word grid-dot';
            dot.textContent = '•';
            dot.style.opacity = Math.random() * 0.15 + 0.05;
            gridContainer.appendChild(dot);
        }
    }

    setFormation(type) {
        if (this.currentFormation === type) return;
        this.currentFormation = type;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const count = this.entities.length;

        this.entities.forEach((entity, index) => {
            let target = new Vector2(0, 0);

            switch (type) {
                case 'default':
                    // Target is 0,0 relative to origin
                    target.set(0, 0);
                    break;

                case 'grid':
                    const cols = Math.ceil(Math.sqrt(count));
                    const spacing = 40;
                    const col = index % cols;
                    const row = Math.floor(index / cols);

                    const gridX = centerX + (col - cols / 2) * spacing;
                    const gridY = centerY + (row - cols / 2) * spacing;
                    const gridPos = new Vector2(gridX, gridY);

                    target = Vector2.sub(gridPos, entity.origin);
                    break;

                case 'circle':
                    const angle = (index / count) * Math.PI * 2;
                    const radius = 250;
                    const circX = centerX + Math.cos(angle) * radius;
                    const circY = centerY + Math.sin(angle) * radius;
                    const circPos = new Vector2(circX, circY);
                    target = Vector2.sub(circPos, entity.origin);
                    break;

                case 'scatter':
                    // Random scatter within viewport
                    const randX = Math.random() * (window.innerWidth - 100) + 50;
                    const randY = Math.random() * (window.innerHeight - 100) + 50;
                    const randPos = new Vector2(randX, randY);
                    target = Vector2.sub(randPos, entity.origin);
                    break;
            }

            entity.layoutOffset = target;

            // Randomize damping slightly differently for move effect
            entity.damping = 0.8 + Math.random() * 0.1;
        });
    }

    setupDebugCanvas() {
        this.debugCanvas = document.createElement('canvas');
        this.debugCanvas.id = 'debug-overlay';
        this.debugCanvas.style.position = 'fixed';
        this.debugCanvas.style.top = '0';
        this.debugCanvas.style.left = '0';
        this.debugCanvas.style.width = '100%';
        this.debugCanvas.style.height = '100%';
        this.debugCanvas.style.pointerEvents = 'none';
        this.debugCanvas.style.zIndex = '9999';
        document.body.appendChild(this.debugCanvas);

        this.ctx = this.debugCanvas.getContext('2d');
        this.resizeDebugCanvas();
    }

    resizeDebugCanvas() {
        if (!this.debugCanvas) return;
        this.debugCanvas.width = window.innerWidth;
        this.debugCanvas.height = window.innerHeight;
    }

    recalculateOrigins() {
        // Reprocess grid? Or just update entities?
        // If resize, origin DOM positions change.
        this.entities.forEach(entity => entity.updateLayoutOrigin());
        // Re-apply formation?
        if (this.currentFormation !== 'default') {
            // Reset to default then re-apply to get new center math
            const savedFormation = this.currentFormation;
            this.currentFormation = null; // force update
            this.setFormation(savedFormation);
        }
    }

    update() {
        if (!this.initialized) return;

        this.entities.forEach(entity => {
            entity.update();
        });
    }

    render() {
        if (!this.initialized) return;

        this.entities.forEach(entity => {
            entity.render();
        });

        if (AppConfig.rendering.enableDebugOverlay && this.ctx) {
            this.renderDebug();
        }
    }

    renderDebug() {
        this.ctx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
        this.ctx.lineWidth = 1;

        this.entities.forEach(entity => {
            const globalPos = entity.getGlobalPosition();

            if (entity.position.mag() > 1) {
                this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.beginPath();
                this.ctx.moveTo(entity.origin.x, entity.origin.y);
                this.ctx.lineTo(globalPos.x, globalPos.y);
                this.ctx.stroke();

                this.ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
                this.ctx.beginPath();
                this.ctx.moveTo(globalPos.x, globalPos.y);
                this.ctx.lineTo(globalPos.x + entity.velocity.x * 10, globalPos.y + entity.velocity.y * 10);
                this.ctx.stroke();
            }
        });

        if (window.Cursor.isActive) {
            const cPos = window.Cursor.position;
            this.ctx.beginPath();
            this.ctx.arc(cPos.x, cPos.y, AppConfig.cursor.interactionRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.stroke();
        }
    }
}

window.TextManager = new TextManagerSystem();
