class BallState {
    constructor(radius = 20) {
        this.radius = radius;
        this.position = { x: 0, y: 0 };
        this.velocity = { vx: 0, vy: 0 };
        this.isActive = false;
        this.isVisible = true;
        this.color = '#00ffff';
        this.trailColor = 'rgba(0, 255, 255, 0.3)';
        this.transferCount = 0;
        this.lastTransferTime = 0;
        this.stateHistory = [];
        this.maxHistoryLength = 10;
    }

    initialize(canvasWidth, canvasHeight) {
        this.position = {
            x: canvasWidth / 2,
            y: canvasHeight / 2
        };
        this.velocity = { vx: 0, vy: 0 };
        this.isActive = false;
        this.isVisible = true;
    }

    setPosition(x, y) {
        this.position = { x, y };
        this.addToHistory();
    }

    setVelocity(vx, vy) {
        this.velocity = { vx, vy };
    }

    updatePosition(newPosition) {
        this.position = { ...newPosition };
        this.addToHistory();
    }

    updateVelocity(newVelocity) {
        this.velocity = { ...newVelocity };
    }

    launch(velocity) {
        this.velocity = { ...velocity };
        this.isActive = true;
        this.isVisible = true;
    }

    stop() {
        this.velocity = { vx: 0, vy: 0 };
        this.isActive = false;
    }

    reset(canvasWidth, canvasHeight) {
        this.position = {
            x: canvasWidth / 2,
            y: canvasHeight / 2
        };
        this.velocity = { vx: 0, vy: 0 };
        this.isActive = false;
        this.isVisible = true;
        this.transferCount = 0;
        this.stateHistory = [];
    }

    hide() {
        this.isVisible = false;
    }

    show() {
        this.isVisible = true;
    }

    incrementTransferCount() {
        this.transferCount++;
        this.lastTransferTime = Date.now();
    }

    addToHistory() {
        this.stateHistory.push({
            position: { ...this.position },
            velocity: { ...this.velocity },
            timestamp: Date.now()
        });

        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
    }

    getState() {
        return {
            position: { ...this.position },
            velocity: { ...this.velocity },
            radius: this.radius,
            isActive: this.isActive,
            isVisible: this.isVisible,
            color: this.color,
            transferCount: this.transferCount,
            timestamp: Date.now()
        };
    }

    setState(state) {
        if (state.position) {
            this.position = { ...state.position };
        }
        if (state.velocity) {
            this.velocity = { ...state.velocity };
        }
        if (state.radius !== undefined) {
            this.radius = state.radius;
        }
        if (state.isActive !== undefined) {
            this.isActive = state.isActive;
        }
        if (state.isVisible !== undefined) {
            this.isVisible = state.isVisible;
        }
        if (state.transferCount !== undefined) {
            this.transferCount = state.transferCount;
        }
        this.addToHistory();
    }

    createTransferData(exitEdge, targetWindowId) {
        return {
            position: { ...this.position },
            velocity: { ...this.velocity },
            radius: this.radius,
            color: this.color,
            exitEdge: exitEdge,
            sourceWindowId: window.portalBallApp?.windowId || 'window1',
            targetWindowId: targetWindowId,
            transferCount: this.transferCount + 1,
            timestamp: Date.now()
        };
    }

    applyTransferData(transferData) {
        this.position = { ...transferData.position };
        this.velocity = { ...transferData.velocity };
        this.radius = transferData.radius;
        this.color = transferData.color;
        this.transferCount = transferData.transferCount;
        this.isActive = true;
        this.isVisible = true;
        this.addToHistory();
    }

    interpolateToState(targetState, alpha) {
        this.position = {
            x: this.position.x + (targetState.position.x - this.position.x) * alpha,
            y: this.position.y + (targetState.position.y - this.position.y) * alpha
        };
        this.velocity = {
            vx: this.velocity.vx + (targetState.velocity.vx - this.velocity.vx) * alpha,
            vy: this.velocity.vy + (targetState.velocity.vy - this.velocity.vy) * alpha
        };
    }

    getVelocityMagnitude() {
        return Math.sqrt(this.velocity.vx * this.velocity.vx + this.velocity.vy * this.velocity.vy);
    }

    isMoving() {
        return this.getVelocityMagnitude() > 0.5;
    }

    clone() {
        const cloned = new BallState(this.radius);
        cloned.setState(this.getState());
        return cloned;
    }
}

if (typeof window !== 'undefined') {
    window.BallState = BallState;
}
