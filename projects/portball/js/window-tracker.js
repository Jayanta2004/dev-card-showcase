class WindowTracker {
    constructor(windowId) {
        this.windowId = windowId;
        this.position = { x: 0, y: 0 };
        this.dimensions = { width: 0, height: 0 };
        this.screenPosition = { x: 0, y: 0 };
        this.isActive = true;
        this.isFocused = document.hasFocus();
        this.updateCallbacks = [];
        this.resizeCallbacks = [];
        this.focusCallbacks = [];
        this.updateInterval = null;
        this.updateFrequency = 100;
    }

    initialize() {
        this.updateDimensions();
        this.updateScreenPosition();
        this.setupEventListeners();
        this.startTracking();
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.updateDimensions();
            this.notifyResizeCallbacks();
        });

        window.addEventListener('focus', () => {
            this.isFocused = true;
            this.updateScreenPosition();
            this.notifyFocusCallbacks(true);
        });

        window.addEventListener('blur', () => {
            this.isFocused = false;
            this.notifyFocusCallbacks(false);
        });

        window.addEventListener('beforeunload', () => {
            this.isActive = false;
            this.stopTracking();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isActive = false;
            } else {
                this.isActive = true;
                this.updateScreenPosition();
            }
        });
    }

    updateDimensions() {
        this.dimensions = {
            width: window.innerWidth,
            height: window.innerHeight
        };
    }

    updateScreenPosition() {
        this.screenPosition = {
            x: window.screenX || window.screenLeft || 0,
            y: window.screenY || window.screenTop || 0
        };
        this.position = { ...this.screenPosition };
    }

    startTracking() {
        this.updateInterval = setInterval(() => {
            const oldPosition = { ...this.screenPosition };
            this.updateScreenPosition();

            if (oldPosition.x !== this.screenPosition.x ||
                oldPosition.y !== this.screenPosition.y) {
                this.notifyUpdateCallbacks();
            }
        }, this.updateFrequency);
    }

    stopTracking() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    onResize(callback) {
        this.resizeCallbacks.push(callback);
    }

    onFocus(callback) {
        this.focusCallbacks.push(callback);
    }

    notifyUpdateCallbacks() {
        this.updateCallbacks.forEach(callback => {
            callback(this.getState());
        });
    }

    notifyResizeCallbacks() {
        this.resizeCallbacks.forEach(callback => {
            callback(this.dimensions);
        });
    }

    notifyFocusCallbacks(focused) {
        this.focusCallbacks.forEach(callback => {
            callback(focused);
        });
    }

    getState() {
        return {
            windowId: this.windowId,
            position: { ...this.position },
            dimensions: { ...this.dimensions },
            screenPosition: { ...this.screenPosition },
            isActive: this.isActive,
            isFocused: this.isFocused
        };
    }

    getRelativePosition(otherWindowState) {
        return {
            x: this.screenPosition.x - otherWindowState.screenPosition.x,
            y: this.screenPosition.y - otherWindowState.screenPosition.y
        };
    }

    isWindowAdjacent(otherWindowState, threshold = 50) {
        const relPos = this.getRelativePosition(otherWindowState);
        const thisRight = this.screenPosition.x + this.dimensions.width;
        const thisBottom = this.screenPosition.y + this.dimensions.height;
        const otherRight = otherWindowState.screenPosition.x + otherWindowState.dimensions.width;
        const otherBottom = otherWindowState.screenPosition.y + otherWindowState.dimensions.height;

        const adjacentRight = Math.abs(thisRight - otherWindowState.screenPosition.x) < threshold;
        const adjacentLeft = Math.abs(this.screenPosition.x - otherRight) < threshold;
        const adjacentBottom = Math.abs(thisBottom - otherWindowState.screenPosition.y) < threshold;
        const adjacentTop = Math.abs(this.screenPosition.y - otherBottom) < threshold;

        return {
            right: adjacentRight,
            left: adjacentLeft,
            bottom: adjacentBottom,
            top: adjacentTop,
            any: adjacentRight || adjacentLeft || adjacentBottom || adjacentTop
        };
    }

    calculateTransferPosition(exitEdge, exitPosition, otherWindowState) {
        const relPos = this.getRelativePosition(otherWindowState);
        let entryPosition = { x: 0, y: 0 };
        let entryEdge = '';

        switch (exitEdge) {
            case 'right':
                entryPosition.x = 0;
                entryPosition.y = exitPosition.y;
                entryEdge = 'left';
                break;
            case 'left':
                entryPosition.x = otherWindowState.dimensions.width;
                entryPosition.y = exitPosition.y;
                entryEdge = 'right';
                break;
            case 'bottom':
                entryPosition.x = exitPosition.x;
                entryPosition.y = 0;
                entryEdge = 'top';
                break;
            case 'top':
                entryPosition.x = exitPosition.x;
                entryPosition.y = otherWindowState.dimensions.height;
                entryEdge = 'bottom';
                break;
        }

        return { position: entryPosition, edge: entryEdge };
    }

    destroy() {
        this.stopTracking();
        this.updateCallbacks = [];
        this.resizeCallbacks = [];
        this.focusCallbacks = [];
    }
}

if (typeof window !== 'undefined') {
    window.WindowTracker = WindowTracker;
}
