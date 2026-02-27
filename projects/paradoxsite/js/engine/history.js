// js/engine/history.js
export class HistoryTracker {
    constructor() {
        this.snapshots = [];
        this.maxSnapshots = 50;
    }

    takeSnapshot(state, domSnapshot = null) {
        if (this.snapshots.length >= this.maxSnapshots) {
            this.snapshots.shift(); // Remove oldest
        }

        const snapshot = {
            timestamp: Date.now(),
            state: JSON.parse(JSON.stringify(state)),
            domState: domSnapshot
        };

        this.snapshots.push(snapshot);
        return snapshot;
    }

    getPreviousState() {
        if (this.snapshots.length < 2) return null;
        return this.snapshots[this.snapshots.length - 2].state;
    }

    revertToSnapshot(index) {
        if (index < 0 || index >= this.snapshots.length) return null;

        const target = this.snapshots[index];
        // Truncate future snapshots
        this.snapshots = this.snapshots.slice(0, index + 1);

        return target.state;
    }

    findSnapshotByNode(nodeId) {
        for (let i = this.snapshots.length - 1; i >= 0; i--) {
            if (this.snapshots[i].state.timeline.includes(nodeId)) {
                return this.snapshots[i];
            }
        }
        return null;
    }

    getSnapshotCount() {
        return this.snapshots.length;
    }

    clear() {
        this.snapshots = [];
    }
}
