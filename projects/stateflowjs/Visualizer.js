/**
 * Visualizer.js - Canvas rendering and interaction handling
 */

class Visualizer {
    constructor(canvas, fsm) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.fsm = fsm;
        this.selectedFrom = null;
        this.mode = 'state';
        this.hoveredState = null;
        this.stateIdCounter = 0;
        this.stateRadius = 45;

        this.activeAnimations = [];
        this.lastFrameTime = 0;
        
        // Start animation loop
        requestAnimationFrame(this.animateLoop.bind(this));
    }

    /**
     * Main animation loop
     */
    animateLoop(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        if (this.activeAnimations.length > 0) {
            this.updateAnimations(deltaTime);
            this.draw();
        }

        requestAnimationFrame(this.animateLoop.bind(this));
    }

    /**
     * Update active animations
     */
    updateAnimations(deltaTime) {
        this.activeAnimations = this.activeAnimations.filter(anim => {
            anim.progress += deltaTime / anim.duration;
            return anim.progress < 1;
        });
    }

    /**
     * Start a transition animation
     */
    animateTransition(fromId, toId) {
        this.activeAnimations.push({
            from: fromId,
            to: toId,
            progress: 0,
            duration: 600, // ms
            color: '#ec4899' // Pink accent
        });
        
        // Force immediate redraw to start animation
        this.draw();
    }

    /**
     * Handle mouse movement for hover effects
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoveredState = this.getStateAt(x, y);
        this.draw();
    }

    /**
     * Handle canvas clicks based on current mode
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedState = this.getStateAt(x, y);

        if (this.mode === 'state') {
            this.handleStateMode(x, y, clickedState);
        } else if (this.mode === 'transition') {
            this.handleTransitionMode(clickedState);
        } else if (this.mode === 'simulate') {
            this.handleSimulateMode(clickedState);
        } else if (this.mode === 'delete') {
            this.handleDeleteMode(clickedState);
        }

        this.draw();
    }

    /**
     * Handle state creation
     */
    handleStateMode(x, y, clickedState) {
        if (!clickedState) {
            const name = document.getElementById('stateName').value.trim() || `S${this.stateIdCounter}`;
            const type = document.getElementById('stateType').value;

            // Only one initial state allowed
            if (type === 'initial') {
                Array.from(this.fsm.states.values()).forEach(s => {
                    if (s.type === 'initial') s.type = 'normal';
                });
            }

            this.fsm.addState(this.stateIdCounter++, name, type, x, y);
            document.getElementById('stateName').value = '';
        }
    }

    /**
     * Handle transition creation
     */
    handleTransitionMode(clickedState) {
        if (clickedState) {
            if (!this.selectedFrom) {
                this.selectedFrom = clickedState;
            } else {
                const event = prompt('Enter event name for this transition:');
                if (event && event.trim()) {
                    this.fsm.addTransition(this.selectedFrom, clickedState, event.trim());
                }
                this.selectedFrom = null;
            }
        }
    }

    /**
     * Handle simulation mode - set active state
     */
    handleSimulateMode(clickedState) {
        if (clickedState && this.fsm.currentState !== clickedState) {
            this.fsm.currentState = clickedState;
        }
    }

    /**
     * Handle delete mode
     */
    handleDeleteMode(clickedState) {
        if (clickedState) {
            const stateName = this.fsm.states.get(clickedState).name;
            if (confirm(`Delete state "${stateName}"?`)) {
                this.fsm.removeState(clickedState);
            }
        }
    }

    /**
     * Get state at coordinates
     */
    getStateAt(x, y) {
        for (let [id, state] of this.fsm.states) {
            const dx = x - state.x;
            const dy = y - state.y;
            if (dx * dx + dy * dy <= this.stateRadius * this.stateRadius) {
                return id;
            }
        }
        return null;
    }

    /**
     * Main draw function
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw transitions first (so they appear behind states)
        this.fsm.transitions.forEach(t => {
            const from = this.fsm.states.get(t.from);
            const to = this.fsm.states.get(t.to);
            if (from && to) {
                this.drawTransition(from, to, t.event);
            }
        });

        // Draw animations (particles moving along transitions)
        this.drawAnimations();

        // Draw states
        this.fsm.states.forEach(state => {
            this.drawState(state);
        });

        // Draw selection indicator for transition mode
        if (this.selectedFrom !== null) {
            const state = this.fsm.states.get(this.selectedFrom);
            this.ctx.strokeStyle = '#6366f1';
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([8, 8]);
            this.ctx.beginPath();
            this.ctx.arc(state.x, state.y, this.stateRadius + 10, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    /**
     * Draw transition animations
     */
    drawAnimations() {
        this.activeAnimations.forEach(anim => {
            const from = this.fsm.states.get(anim.from);
            const to = this.fsm.states.get(anim.to);
            
            if (!from || !to) return;

            let x, y;

            if (from.id === to.id) {
                // Self-loop animation
                const loopRadius = 35;
                const loopX = from.x;
                const loopY = from.y - this.stateRadius - loopRadius;
                const angle = 0.2 + (Math.PI - 0.4) * anim.progress; // Start to end of arc
                
                x = loopX + Math.cos(angle) * loopRadius;
                y = loopY + Math.sin(angle) * loopRadius;
            } else {
                // Linear interpolation
                x = from.x + (to.x - from.x) * anim.progress;
                y = from.y + (to.y - from.y) * anim.progress;
            }

            // Draw glowing particle
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            this.ctx.fillStyle = anim.color;
            this.ctx.fill();

            // Glow effect
            this.ctx.shadowColor = anim.color;
            this.ctx.shadowBlur = 15;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        });
    }

    /**
     * Draw subtle grid background
     */
    drawGrid() {
        const gridSize = 40;
        this.ctx.strokeStyle = '#334155'; // Darker grid for new theme
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Draw a single state
     */
    drawState(state) {
        const isActive = this.fsm.currentState === state.id;
        const isHovered = this.hoveredState === state.id;

        // Outer glow for active state
        if (isActive) {
            const gradient = this.ctx.createRadialGradient(
                state.x, state.y, this.stateRadius - 10,
                state.x, state.y, this.stateRadius + 30
            );
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(state.x, state.y, this.stateRadius + 30, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Main circle background
        this.ctx.beginPath();
        this.ctx.arc(state.x, state.y, this.stateRadius, 0, Math.PI * 2);
        
        // Modern gradients
        const gradient = this.ctx.createLinearGradient(
            state.x - this.stateRadius, state.y - this.stateRadius,
            state.x + this.stateRadius, state.y + this.stateRadius
        );

        if (isActive) {
            gradient.addColorStop(0, '#059669');
            gradient.addColorStop(1, '#10b981');
            this.ctx.strokeStyle = '#34d399';
            this.ctx.lineWidth = 3;
        } else if (state.type === 'initial') {
            gradient.addColorStop(0, '#d97706');
            gradient.addColorStop(1, '#f59e0b');
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 3;
        } else if (state.type === 'final') {
            gradient.addColorStop(0, '#dc2626');
            gradient.addColorStop(1, '#ef4444');
            this.ctx.strokeStyle = '#fca5a5';
            this.ctx.lineWidth = 3;
        } else {
            gradient.addColorStop(0, '#475569');
            gradient.addColorStop(1, '#64748b');
            this.ctx.strokeStyle = isHovered ? '#94a3b8' : '#334155';
            this.ctx.lineWidth = 2;
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.stroke();

        // Double circle for final states
        if (state.type === 'final') {
            this.ctx.beginPath();
            this.ctx.arc(state.x, state.y, this.stateRadius - 6, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // State name
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.font = '600 14px "Inter", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(state.name, state.x, state.y);

        // Initial state arrow
        if (state.type === 'initial') {
            this.drawInitialArrow(state.x, state.y);
        }
    }

    /**
     * Draw arrow pointing to initial state
     */
    drawInitialArrow(x, y) {
        const arrowStartX = x - this.stateRadius - 35;
        const arrowEndX = x - this.stateRadius - 8;

        this.ctx.beginPath();
        this.ctx.moveTo(arrowStartX, y);
        this.ctx.lineTo(arrowEndX, y);
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Arrowhead
        this.ctx.beginPath();
        this.ctx.moveTo(arrowEndX, y);
        this.ctx.lineTo(arrowEndX - 8, y - 6);
        this.ctx.lineTo(arrowEndX - 8, y + 6);
        this.ctx.closePath();
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fill();
    }

    /**
     * Draw transition between states
     */
    drawTransition(from, to, event) {
        const isSelfLoop = from.id === to.id;

        if (isSelfLoop) {
            this.drawSelfLoop(from, event);
        } else {
            this.drawArrow(from, to, event);
        }
    }

    /**
     * Draw self-loop transition
     */
    drawSelfLoop(state, event) {
        const loopRadius = 35;
        const loopX = state.x;
        const loopY = state.y - this.stateRadius - loopRadius;

        this.ctx.beginPath();
        this.ctx.arc(loopX, loopY, loopRadius, 0.2, Math.PI - 0.2);
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Arrowhead
        const arrowAngle = Math.PI - 0.2;
        const arrowX = loopX + Math.cos(arrowAngle) * loopRadius;
        const arrowY = loopY + Math.sin(arrowAngle) * loopRadius;
        
        this.ctx.beginPath();
        this.ctx.moveTo(arrowX, arrowY);
        this.ctx.lineTo(arrowX - 8, arrowY - 6);
        this.ctx.lineTo(arrowX - 5, arrowY + 2);
        this.ctx.closePath();
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fill();

        // Event label
        this.drawLabel(event, loopX, loopY - loopRadius - 8);
    }

    /**
     * Draw arrow transition between two different states
     */
    drawArrow(from, to, event) {
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const startX = from.x + Math.cos(angle) * this.stateRadius;
        const startY = from.y + Math.sin(angle) * this.stateRadius;
        const endX = to.x - Math.cos(angle) * this.stateRadius;
        const endY = to.y - Math.sin(angle) * this.stateRadius;

        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw arrowhead
        const arrowSize = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fill();

        // Event label
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        this.drawLabel(event, midX, midY);
    }

    /**
     * Draw styled label for events
     */
    drawLabel(text, x, y) {
        const padding = 6;
        this.ctx.font = '500 12px "JetBrains Mono", monospace';
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        
        // Background capsule
        this.ctx.fillStyle = '#1e293b';
        this.ctx.beginPath();
        this.ctx.roundRect(x - textWidth/2 - padding, y - 10, textWidth + padding * 2, 20, 6);
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Text
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
    }

    /**
     * Change interaction mode
     */
    setMode(mode) {
        this.mode = mode;
        this.selectedFrom = null;
        this.draw();
    }
}