/**
 * RagdollWeb - Renderer
 * Handles visual rendering of strings, elements, and animations
 */

// ============================================
// RENDERER CONFIGURATION
// ============================================

const RENDERER_CONFIG = {
    // Canvas settings
    STRING_WIDTH: 2,
    STRING_COLOR: 'rgba(99, 102, 241, 0.6)',
    STRING_HIGHLIGHT_COLOR: 'rgba(236, 72, 153, 1)',
    STRING_GLOW_BLUR: 10,

    // Visibility
    STRING_HOVER_DISTANCE: 150,      // Distance to show strings
    STRING_FADE_DISTANCE: 50,        // Distance for fade effect

    // Performance
    RENDER_THROTTLE: 16,             // ms between renders (60fps)
};

// ============================================
// STRING RENDERER CLASS
// ============================================

class StringRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Set canvas size
        this.resize();

        // String data
        this.strings = new Map();

        // Mouse position for proximity effects
        this.mouseX = 0;
        this.mouseY = 0;
    }

    /**
     * Resize canvas to window size
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Register a string for rendering
     */
    registerString(id, anchorX, anchorY, elementX, elementY) {
        this.strings.set(id, {
            start: { x: anchorX, y: anchorY },
            end: { x: elementX, y: elementY },
            visible: false,
            opacity: 0
        });
    }

    /**
     * Update string endpoint position
     */
    updateString(id, elementX, elementY) {
        const string = this.strings.get(id);
        if (string) {
            string.end.x = elementX;
            string.end.y = elementY;
        }
    }

    /**
     * Remove a string from rendering
     */
    removeString(id) {
        this.strings.delete(id);
    }

    /**
     * Update mouse position for proximity effects
     */
    updateMouse(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }

    /**
     * Calculate distance from point to line segment
     */
    distanceToLine(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Render all strings
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render each string
        for (const [id, string] of this.strings) {
            // Calculate distance from mouse to string
            const distance = this.distanceToLine(
                this.mouseX,
                this.mouseY,
                string.start.x,
                string.start.y,
                string.end.x,
                string.end.y
            );

            // Calculate opacity based on distance
            let targetOpacity = 0;
            if (distance < RENDERER_CONFIG.STRING_HOVER_DISTANCE) {
                const fadeStart = RENDERER_CONFIG.STRING_HOVER_DISTANCE;
                const fadeEnd = RENDERER_CONFIG.STRING_FADE_DISTANCE;

                if (distance < fadeEnd) {
                    targetOpacity = 1;
                } else {
                    targetOpacity = 1 - ((distance - fadeEnd) / (fadeStart - fadeEnd));
                }
            }

            // Smooth opacity transition
            string.opacity += (targetOpacity - string.opacity) * 0.2;

            // Only render if visible
            if (string.opacity > 0.01) {
                this.renderString(string, string.opacity, distance < fadeEnd);
            }
        }
    }

    /**
     * Render a single string
     */
    renderString(string, opacity, highlight) {
        const ctx = this.ctx;

        ctx.save();

        // Set line style
        ctx.lineWidth = RENDERER_CONFIG.STRING_WIDTH;
        ctx.lineCap = 'round';

        // Apply glow effect
        if (highlight) {
            ctx.shadowBlur = RENDERER_CONFIG.STRING_GLOW_BLUR * 2;
            ctx.shadowColor = RENDERER_CONFIG.STRING_HIGHLIGHT_COLOR;
            ctx.strokeStyle = RENDERER_CONFIG.STRING_HIGHLIGHT_COLOR.replace('1)', `${opacity})`);
        } else {
            ctx.shadowBlur = RENDERER_CONFIG.STRING_GLOW_BLUR;
            ctx.shadowColor = RENDERER_CONFIG.STRING_COLOR;
            ctx.strokeStyle = RENDERER_CONFIG.STRING_COLOR.replace('0.6)', `${opacity * 0.6})`);
        }

        // Draw line
        ctx.beginPath();
        ctx.moveTo(string.start.x, string.start.y);
        ctx.lineTo(string.end.x, string.end.y);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Get all string data for intersection testing
     */
    getStringData() {
        return this.strings;
    }
}

// ============================================
// ELEMENT RENDERER CLASS
// ============================================

class ElementRenderer {
    constructor() {
        this.elements = new Map();
        this.landedZone = document.getElementById('landed-zone');
    }

    /**
     * Register an element for rendering
     */
    registerElement(id, element, anchorX, anchorY) {
        this.elements.set(id, {
            element: element,
            anchorX: anchorX,
            anchorY: anchorY,
            state: 'hanging'
        });

        // Set initial state class
        element.classList.add('state-hanging');
    }

    /**
     * Update element position based on physics
     */
    updatePosition(id, position) {
        const elementData = this.elements.get(id);
        if (!elementData) return;

        const element = elementData.element;

        if (elementData.state === 'hanging') {
            // Pendulum motion
            element.style.left = `${position.x}px`;
            element.style.top = `${position.y}px`;
            element.style.transform = `rotate(${position.angle}rad)`;
        } else if (elementData.state === 'falling') {
            // Falling motion
            element.style.left = `${position.x}px`;
            element.style.top = `${position.y}px`;
            element.style.transform = `rotate(${position.rotation}rad)`;

            // Check if landed
            if (position.hasLanded) {
                this.landElement(id);
            }
        }
    }

    /**
     * Transition element to falling state
     */
    startFalling(id) {
        const elementData = this.elements.get(id);
        if (!elementData) return;

        elementData.state = 'falling';
        elementData.element.classList.remove('state-hanging');
        elementData.element.classList.add('state-falling');
    }

    /**
     * Land element in the footer zone
     */
    landElement(id) {
        const elementData = this.elements.get(id);
        if (!elementData) return;

        elementData.state = 'landed';
        const element = elementData.element;

        // Remove from absolute positioning
        element.style.position = 'relative';
        element.style.left = '';
        element.style.top = '';
        element.style.transform = '';

        // Move to landed zone
        this.landedZone.appendChild(element);

        // Update classes
        element.classList.remove('state-falling');
        element.classList.add('state-landed');
    }

    /**
     * Get element state
     */
    getState(id) {
        const elementData = this.elements.get(id);
        return elementData ? elementData.state : null;
    }
}

// ============================================
// RENDER MANAGER
// ============================================

class RenderManager {
    constructor(canvas) {
        this.stringRenderer = new StringRenderer(canvas);
        this.elementRenderer = new ElementRenderer();

        // Animation frame tracking
        this.animationFrameId = null;
        this.isRunning = false;
        this.lastRenderTime = 0;

        // Callbacks
        this.onBeforeRender = null;
        this.onAfterRender = null;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.stringRenderer.resize();
        });
    }

    /**
     * Register an element and its string
     */
    registerElement(id, element, anchorX, anchorY, stringLength) {
        // Calculate initial position
        const rect = element.getBoundingClientRect();
        const elementX = rect.left + rect.width / 2;
        const elementY = rect.top + rect.height / 2;

        // Register with renderers
        this.elementRenderer.registerElement(id, element, anchorX, anchorY);
        this.stringRenderer.registerString(id, anchorX, anchorY, elementX, elementY);

        return { elementX, elementY };
    }

    /**
     * Update element position
     */
    updateElement(id, position) {
        this.elementRenderer.updatePosition(id, position);

        // Update string endpoint if hanging
        if (this.elementRenderer.getState(id) === 'hanging') {
            this.stringRenderer.updateString(id, position.x, position.y);
        }
    }

    /**
     * Cut a string (remove from rendering)
     */
    cutString(id) {
        this.stringRenderer.removeString(id);
        this.elementRenderer.startFalling(id);
    }

    /**
     * Update mouse position for visual effects
     */
    updateMouse(x, y) {
        this.stringRenderer.updateMouse(x, y);
    }

    /**
     * Start render loop
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.renderLoop();
    }

    /**
     * Stop render loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * Main render loop
     */
    renderLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastRenderTime;

        // Throttle rendering to target FPS
        if (deltaTime >= RENDERER_CONFIG.RENDER_THROTTLE) {
            // Pre-render callback
            if (this.onBeforeRender) {
                this.onBeforeRender();
            }

            // Render strings
            this.stringRenderer.render();

            // Post-render callback
            if (this.onAfterRender) {
                this.onAfterRender();
            }

            this.lastRenderTime = currentTime;
        }

        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.renderLoop());
    }

    /**
     * Get string data for interaction testing
     */
    getStringData() {
        return this.stringRenderer.getStringData();
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.RenderManager = RenderManager;
    window.RENDERER_CONFIG = RENDERER_CONFIG;
}
