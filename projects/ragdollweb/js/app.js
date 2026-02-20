/**
 * RagdollWeb - Main Application Controller
 * Coordinates all systems and manages application lifecycle
 */

// ============================================
// APPLICATION CONFIGURATION
// ============================================

const APP_CONFIG = {
    // Element spacing
    ELEMENT_SPACING: 120,            // Horizontal spacing between elements
    TOP_MARGIN: 50,                  // Top margin for anchor points

    // Footer
    FOOTER_HEIGHT: 200,              // Approximate footer height

    // Debug mode
    DEBUG_MODE: false,               // Show debug info

    // Performance monitoring
    ENABLE_STATS: true,              // Track performance stats
};

// ============================================
// APPLICATION CLASS
// ============================================

class RagdollWebApp {
    constructor() {
        // Get DOM elements
        this.canvas = document.getElementById('string-canvas');
        this.container = document.getElementById('hanging-container');
        this.footer = document.getElementById('collision-footer');
        this.particleContainer = document.getElementById('particle-container');
        this.debugInfo = document.getElementById('debug-info');

        // Initialize systems
        this.physicsManager = new PhysicsManager();
        this.renderManager = new RenderManager(this.canvas);
        this.interactionManager = new InteractionManager(this.particleContainer);

        // Element tracking
        this.elements = new Map();
        this.elementIdCounter = 0;

        // State
        this.isInitialized = false;
        this.isPaused = false;

        // Performance stats
        this.stats = {
            totalElements: 0,
            hangingElements: 0,
            fallenElements: 0,
            fps: 60
        };
    }

    /**
     * Initialize the application
     */
    init() {
        if (this.isInitialized) return;

        console.log('🎪 Initializing RagdollWeb...');

        // Setup all hanging elements
        this.setupElements();

        // Setup event listeners
        this.setupEventListeners();

        // Setup interaction callback
        this.interactionManager.onStringCut = (id, point) => {
            this.handleStringCut(id, point);
        };

        // Setup render callbacks
        this.renderManager.onBeforeRender = () => {
            this.updatePhysics();
        };

        // Start render loop
        this.renderManager.start();

        // Show debug info if enabled
        if (APP_CONFIG.DEBUG_MODE) {
            this.debugInfo.style.display = 'block';
            this.startStatsUpdate();
        }

        this.isInitialized = true;
        console.log('✅ RagdollWeb initialized successfully!');
        console.log(`📊 Total elements: ${this.stats.totalElements}`);
    }

    /**
     * Setup all hanging elements
     */
    setupElements() {
        const hangingElements = document.querySelectorAll('.hanging-element');
        const windowWidth = window.innerWidth;
        const containerWidth = this.container.offsetWidth;

        hangingElements.forEach((element, index) => {
            // Generate unique ID
            const id = `element-${this.elementIdCounter++}`;

            // Get string length from data attribute
            const stringLength = parseInt(element.dataset.stringLength) || 150;

            // Calculate anchor position (evenly distributed across top)
            const spacing = windowWidth / (hangingElements.length + 1);
            const anchorX = spacing * (index + 1);
            const anchorY = APP_CONFIG.TOP_MARGIN;

            // Register with render manager
            const initialPos = this.renderManager.registerElement(
                id,
                element,
                anchorX,
                anchorY,
                stringLength
            );

            // Add to physics simulation
            this.physicsManager.addPendulum(
                id,
                element,
                stringLength,
                anchorX,
                anchorY
            );

            // Track element
            this.elements.set(id, {
                element: element,
                anchorX: anchorX,
                anchorY: anchorY,
                stringLength: stringLength,
                state: 'hanging'
            });

            this.stats.totalElements++;
            this.stats.hangingElements++;
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mouse events for interaction
        document.addEventListener('mousemove', (e) => {
            this.interactionManager.handleMouseMove(e);
            this.renderManager.updateMouse(e.clientX, e.clientY);
            this.physicsManager.updateMouse(e.clientX, e.clientY);
        });

        document.addEventListener('mousedown', (e) => {
            this.interactionManager.handleMouseDown(e);
        });

        document.addEventListener('mouseup', (e) => {
            this.interactionManager.handleMouseUp(e);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Prevent context menu on right click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Update physics simulation
     */
    updatePhysics() {
        if (this.isPaused) return;

        // Get footer position for collision detection
        const footerRect = this.footer.getBoundingClientRect();
        const footerY = footerRect.top;

        // Update physics
        this.physicsManager.update(footerY);

        // Check for string cuts
        const stringData = this.renderManager.getStringData();
        this.interactionManager.checkStringCuts(stringData);

        // Update element positions
        for (const [id, elementData] of this.elements) {
            const position = this.physicsManager.getPosition(id);
            if (position) {
                this.renderManager.updateElement(id, position);
            }
        }

        // Update stats
        if (APP_CONFIG.ENABLE_STATS) {
            const physicsStats = this.physicsManager.getStats();
            this.stats.fps = physicsStats.fps;
            this.stats.hangingElements = physicsStats.hangingElements;
            this.stats.fallenElements = this.stats.totalElements - physicsStats.activeElements;
        }
    }

    /**
     * Handle string cut event
     */
    handleStringCut(id, intersectionPoint) {
        const elementData = this.elements.get(id);
        if (!elementData || elementData.state !== 'hanging') return;

        console.log(`✂️ String cut for element: ${id}`);

        // Update state
        elementData.state = 'falling';

        // Cut in physics simulation
        this.physicsManager.cutPendulum(id);

        // Remove string from rendering
        this.renderManager.cutString(id);

        // Create visual feedback at cut point if available
        if (intersectionPoint) {
            this.interactionManager.particleSystem.createImpactWave(
                intersectionPoint.x,
                intersectionPoint.y
            );
        }

        // Update stats
        this.stats.hangingElements--;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate positions if needed
        console.log('🔄 Window resized');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyPress(event) {
        switch (event.key.toLowerCase()) {
            case 'd':
                // Toggle debug mode
                this.toggleDebug();
                break;
            case 'p':
                // Toggle pause
                this.togglePause();
                break;
            case 'r':
                // Reset (reload page)
                if (event.ctrlKey || event.metaKey) {
                    location.reload();
                }
                break;
            case 'h':
                // Show help
                this.showHelp();
                break;
        }
    }

    /**
     * Toggle debug mode
     */
    toggleDebug() {
        APP_CONFIG.DEBUG_MODE = !APP_CONFIG.DEBUG_MODE;
        this.debugInfo.style.display = APP_CONFIG.DEBUG_MODE ? 'block' : 'none';

        if (APP_CONFIG.DEBUG_MODE) {
            this.startStatsUpdate();
        }

        console.log(`🐛 Debug mode: ${APP_CONFIG.DEBUG_MODE ? 'ON' : 'OFF'}`);
    }

    /**
     * Toggle pause
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log(`⏸️ Paused: ${this.isPaused}`);
    }

    /**
     * Show help message
     */
    showHelp() {
        console.log(`
🎪 RagdollWeb - Controls
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖱️  Drag across strings to cut them
⌨️  D - Toggle debug info
⌨️  P - Toggle pause
⌨️  H - Show this help
⌨️  Ctrl+R - Reset (reload page)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
    }

    /**
     * Update debug stats display
     */
    startStatsUpdate() {
        setInterval(() => {
            if (!APP_CONFIG.DEBUG_MODE) return;

            document.getElementById('fps-counter').textContent = this.stats.fps;
            document.getElementById('active-count').textContent = this.stats.hangingElements;
            document.getElementById('fallen-count').textContent = this.stats.fallenElements;
        }, 100);
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.renderManager.stop();
        this.interactionManager.particleSystem.cleanup();
        console.log('🛑 RagdollWeb destroyed');
    }
}

// ============================================
// INITIALIZATION
// ============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    // Create and initialize app
    window.ragdollApp = new RagdollWebApp();
    window.ragdollApp.init();

    // Show welcome message
    console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║         🎪 RAGDOLLWEB 🎪              ║
║                                       ║
║   Physics-Based Interactive Website   ║
║                                       ║
║   Drag across strings to cut them!    ║
║   Press 'H' for help                  ║
║                                       ║
╚═══════════════════════════════════════╝
    `);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Request fullscreen mode
 */
function requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

/**
 * Exit fullscreen mode
 */
function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
    window.requestFullscreen = requestFullscreen;
    window.exitFullscreen = exitFullscreen;
}
