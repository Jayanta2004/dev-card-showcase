class PortalBallApp {
    constructor() {
        this.windowId = this.detectWindowId();
        this.canvas = null;
        this.ctx = null;
        this.physics = null;
        this.windowTracker = null;
        this.syncManager = null;
        this.ballState = null;
        this.portalEffects = null;
        this.animationFrameId = null;
        this.isRunning = false;
        this.window2Reference = null;
        this.otherWindowState = null;
        this.lastUpdateTime = 0;
    }

    detectWindowId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || (window.location.pathname.includes('window2') ? 'window2' : 'window1');
    }

    initialize() {
        this.setupCanvas();
        this.initializeModules();
        this.setupEventListeners();
        this.setupUI();
        this.start();
    }

    setupCanvas() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        if (this.ballState && !this.ballState.isActive) {
            this.ballState.reset(this.canvas.width, this.canvas.height);
        }
    }

    initializeModules() {
        this.physics = new PhysicsEngine();
        this.physics.initialize();

        this.windowTracker = new WindowTracker(this.windowId);
        this.windowTracker.initialize();

        this.syncManager = new SyncManager(this.windowId);
        this.syncManager.initialize();

        this.ballState = new BallState(20);
        this.ballState.initialize(this.canvas.width, this.canvas.height);

        this.portalEffects = new PortalEffects(this.canvas, this.windowId);
        this.portalEffects.initialize();

        this.setupSyncCallbacks();
    }

    setupSyncCallbacks() {
        this.syncManager.onConnection((connected) => {
            this.updateConnectionStatus(connected);

            if (this.windowId === 'window1') {
                const launchButton = document.getElementById('launchBall');
                if (launchButton) {
                    launchButton.disabled = !connected;
                }
            }
        });

        this.syncManager.onTransfer((transferData) => {
            this.handleIncomingTransfer(transferData);
        });

        this.windowTracker.onUpdate((state) => {
            this.otherWindowState = state;
        });
    }

    setupEventListeners() {
        if (this.windowId === 'window1') {
            const openWindow2Btn = document.getElementById('openWindow2');
            if (openWindow2Btn) {
                openWindow2Btn.addEventListener('click', () => {
                    this.openSecondWindow();
                });
            }

            const launchBallBtn = document.getElementById('launchBall');
            if (launchBallBtn) {
                launchBallBtn.addEventListener('click', () => {
                    if (!this.ballState.isActive) {
                        this.launchBall();
                    }
                });
            }
        } else {
            // In Window 2, disable/hide the "Open Window 2" button
            const openWindow2Btn = document.getElementById('openWindow2');
            if (openWindow2Btn) {
                openWindow2Btn.style.display = 'none';
            }
        }

        const resetBtn = document.getElementById('resetBall');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetBall();
            });
        }

        this.canvas.addEventListener('click', (event) => {
            if (!this.ballState.isActive && this.syncManager.isConnected) {
                this.launchBallTowards(event.clientX, event.clientY);
            }
        });
    }

    setupUI() {
        this.updateUILabels();
        this.updateConnectionStatus(false);
    }

    updateUILabels() {
        const container = document.querySelector('.window-container');
        if (container) {
            container.id = this.windowId;
        }

        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel && this.windowId === 'window2') {
            controlPanel.classList.add('secondary');
        }

        const label = document.querySelector('.window-label');
        if (label) {
            label.textContent = this.windowId === 'window1' ? 'Window 1' : 'Window 2';
        }

        const title = document.querySelector('title');
        if (title) {
            title.textContent = `PortalBall - ${this.windowId === 'window1' ? 'Window 1' : 'Window 2'}`;
        }
    }

    openSecondWindow() {
        const width = 600;
        const height = 600;
        const left = window.screenX + window.outerWidth + 10;
        const top = window.screenY;

        // Use index.html for both windows, just pass the ID as a parameter
        this.window2Reference = window.open(
            'index.html?id=window2',
            'PortalBall_Window2',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (this.window2Reference) {
            const openBtn = document.getElementById('openWindow2');
            if (openBtn) {
                const btnText = openBtn.querySelector('.btn-text');
                if (btnText) {
                    btnText.textContent = 'Window 2 Opened';
                }
                openBtn.disabled = true;
            }
        } else {
            alert('Pop-up blocked! Please allow pop-ups for this site to open Window 2.');
        }
    }

    launchBall() {
        if (this.ballState.isActive) return;

        const velocity = this.physics.createRandomVelocity(200, 400);
        this.ballState.launch(velocity);
        this.portalEffects.clearTrail();
    }

    launchBallTowards(targetX, targetY) {
        if (this.ballState.isActive) return;

        const dx = targetX - this.ballState.position.x;
        const dy = targetY - this.ballState.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = 500;
            const velocity = {
                vx: (dx / distance) * speed,
                vy: (dy / distance) * speed
            };
            this.ballState.launch(velocity);
            this.portalEffects.clearTrail();
        }
    }

    resetBall() {
        this.ballState.reset(this.canvas.width, this.canvas.height);
        this.portalEffects.reset();
        this.updateStats();
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (!statusElement) return;

        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');

        if (connected) {
            indicator.classList.remove('disconnected');
            indicator.classList.add('connected');
            text.textContent = 'Connected';
        } else {
            indicator.classList.remove('connected');
            indicator.classList.add('disconnected');
            text.textContent = this.windowId === 'window1' ? 'Waiting for Window 2' : 'Waiting for Connection';
        }
    }

    updateStats() {
        const velocityDisplay = document.getElementById('velocityDisplay');
        const positionDisplay = document.getElementById('positionDisplay');
        const transferCountDisplay = document.getElementById('transferCount');

        if (velocityDisplay) {
            const velocity = this.ballState.getVelocityMagnitude();
            velocityDisplay.textContent = velocity.toFixed(1);
        }

        if (positionDisplay) {
            positionDisplay.textContent = `${Math.round(this.ballState.position.x)}, ${Math.round(this.ballState.position.y)}`;
        }

        if (transferCountDisplay) {
            transferCountDisplay.textContent = this.ballState.transferCount.toString();
        }
    }

    handleIncomingTransfer(transferData) {
        if (transferData.targetWindowId === this.windowId) {
            const entryPosition = this.calculateEntryPosition(transferData);

            transferData.position = entryPosition.position;
            transferData.entryEdge = entryPosition.edge;

            this.ballState.applyTransferData(transferData);
            // Redundant: incrementTransferCount() removed as it is handled by the sender and applied in applyTransferData
            this.portalEffects.handleReceive(transferData);
        }
    }

    calculateEntryPosition(transferData) {
        const bounds = {
            width: this.canvas.width,
            height: this.canvas.height
        };

        let position = { x: 0, y: 0 };
        let edge = '';

        switch (transferData.exitEdge) {
            case 'right':
                position.x = this.ballState.radius;
                position.y = transferData.position.y;
                edge = 'left';
                break;
            case 'left':
                position.x = bounds.width - this.ballState.radius;
                position.y = transferData.position.y;
                edge = 'right';
                break;
            case 'bottom':
                position.x = transferData.position.x;
                position.y = this.ballState.radius;
                edge = 'top';
                break;
            case 'top':
                position.x = transferData.position.x;
                position.y = bounds.height - this.ballState.radius;
                edge = 'bottom';
                break;
        }

        position.x = Math.max(this.ballState.radius, Math.min(bounds.width - this.ballState.radius, position.x));
        position.y = Math.max(this.ballState.radius, Math.min(bounds.height - this.ballState.radius, position.y));

        return { position, edge };
    }

    checkForTransfer() {
        const bounds = {
            width: this.canvas.width,
            height: this.canvas.height
        };

        const transferCheck = this.physics.shouldTransferToOtherWindow(
            this.ballState.position,
            this.ballState.radius,
            bounds
        );

        if (transferCheck.transfer && this.syncManager.isConnected) {
            const targetWindowId = this.windowId === 'window1' ? 'window2' : 'window1';
            const transferData = this.ballState.createTransferData(transferCheck.edge, targetWindowId);

            this.syncManager.broadcastTransfer(transferData);
            this.portalEffects.handleTransfer(transferData);

            this.ballState.hide();
            this.ballState.stop();
            return true;
        }
        return false;
    }

    update(timestamp) {
        const deltaTime = this.physics.calculateDeltaTime(timestamp);

        if (this.ballState.isActive && this.ballState.isVisible) {
            // Check for transfer BEFORE physics integration and collision handling
            if (this.checkForTransfer()) {
                return;
            }

            let velocity = this.physics.applyGravity(this.ballState.velocity, deltaTime);
            velocity = this.physics.applyFriction(velocity);

            let position = this.physics.updatePosition(this.ballState.position, velocity, deltaTime);

            const bounds = {
                width: this.canvas.width,
                height: this.canvas.height
            };

            const collisions = this.physics.checkCollision(position, this.ballState.radius, bounds);

            if (collisions.top || collisions.bottom || collisions.left || collisions.right) {
                const result = this.physics.handleBounce(
                    position,
                    velocity,
                    this.ballState.radius,
                    bounds,
                    collisions
                );
                position = result.position;
                velocity = result.velocity;

                const edge = collisions.top ? 'top' : collisions.bottom ? 'bottom' :
                    collisions.left ? 'left' : 'right';
                this.portalEffects.activatePortalEdge(edge);
            }

            this.ballState.updatePosition(position);
            this.ballState.updateVelocity(velocity);

            if (this.physics.isStationary(velocity)) {
                this.ballState.stop();
            }
        }

        this.updateStats();
    }

    render(timestamp) {
        this.portalEffects.clear();

        const deltaTime = (timestamp - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = timestamp;

        this.portalEffects.render(this.ballState, deltaTime);
    }

    gameLoop(timestamp) {
        this.update(timestamp);
        this.render(timestamp);

        if (this.isRunning) {
            this.animationFrameId = requestAnimationFrame((ts) => this.gameLoop(ts));
        }
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastUpdateTime = performance.now();
            this.gameLoop(this.lastUpdateTime);
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    destroy() {
        this.stop();
        if (this.physics) this.physics = null;
        if (this.windowTracker) this.windowTracker.destroy();
        if (this.syncManager) this.syncManager.destroy();
        if (this.portalEffects) this.portalEffects.reset();
    }
}

if (typeof window !== 'undefined') {
    window.PortalBallApp = PortalBallApp;

    window.addEventListener('DOMContentLoaded', () => {
        window.portalBallApp = new PortalBallApp();
        window.portalBallApp.initialize();
    });

    window.addEventListener('beforeunload', () => {
        if (window.portalBallApp) {
            window.portalBallApp.destroy();
        }
    });
}
