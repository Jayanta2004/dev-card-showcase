import { Stroke } from './Stroke.js';
import { SpatialHash } from './SpatialHash.js';
import { Config } from '../core/Config.js';
import { Logger } from '../utils/Logger.js';

/**
 * @class StrokeManager
 * @description Manages the collection of all strokes.
 * Handles the logic for detecting if a new point intersects an old stroke.
 * This is the "brain" of the specific "timbre change on cross" mechanic.
 */
export class StrokeManager {
    /**
     * @param {EventManager} eventManager 
     */
    constructor(eventManager) {
        this.events = eventManager;
        this.strokes = [];
        this.currentStroke = null;
        this.spatialHash = new SpatialHash();

        this._setupListeners();
    }

    _setupListeners() {
        this.events.on('INPUT_START', this._onInputStart.bind(this));
        this.events.on('INPUT_MOVE', this._onInputMove.bind(this));
        this.events.on('INPUT_END', this._onInputEnd.bind(this));
    }

    _onInputStart(data) {
        this.currentStroke = new Stroke(data.time);
        this.currentStroke.addPoint(data.position);

        // Add start point to spatial hash immediately? 
        // No, typically we only collide against COMPLETED or OLDER strokes to avoid self-collision noise at creation
        // But for crossing *existing* strokes, yes.

        this.events.emit('STROKE_STARTED', { strokeId: this.currentStroke.id });
    }

    _onInputMove(data) {
        if (!this.currentStroke) return;

        const pos = data.position;
        this.currentStroke.addPoint(pos);

        // Check collision against spatial hash
        this._checkCollision(pos);
    }

    _onInputEnd(data) {
        if (!this.currentStroke) return;

        this.currentStroke.finish();

        // Commit stroke to spatial hash for future collisions
        this._commitStrokeToHash(this.currentStroke);

        this.strokes.push(this.currentStroke);
        this.strokes = this._pruneHistory(this.strokes);

        this.events.emit('STROKE_ENDED', { strokeId: this.currentStroke.id });
        this.currentStroke = null;
    }

    /**
     * @method _checkCollision
     * @description Checks if the current point is near any points in the spatial hash.
     * @param {Vector2} point 
     */
    _checkCollision(point) {
        const neighbors = this.spatialHash.query(point);
        let collisionDetected = false;

        for (const item of neighbors) {
            // Don't collide with self (current Stroke)
            if (item.data.strokeId === this.currentStroke.id) continue;

            const dist = point.dist(item.position);
            if (dist < Config.DRAWING.COLLISION_RADIUS) {
                collisionDetected = true;
                break; // One collision is enough to trigger the effect
            }
        }

        if (collisionDetected) {
            this.events.emit('COLLISION_DETECTED', {
                position: point
            });
        } else {
            this.events.emit('COLLISION_CLEARED', {});
        }
    }

    /**
     * @method _commitStrokeToHash
     * @description Adds all points of a completed stroke to the spatial hash.
     * @param {Stroke} stroke 
     */
    _commitStrokeToHash(stroke) {
        // Optimization: Don't add every single pixel. Step by radius or fraction.
        // But for simplicity/robustness first, let's step by a moderate amount.
        const step = 5; // samples

        for (let i = 0; i < stroke.points.length; i += 1) {
            // We can sparsely populate to save memory while keeping adequate detection
            if (i % 2 !== 0) continue;

            const p = stroke.points[i];
            this.spatialHash.insert(p, { strokeId: stroke.id });
        }

        Logger.debug(`Stroke ${stroke.id} committed to spatial hash. Total Points: ${stroke.points.length}`);
    }

    _pruneHistory(strokes) {
        if (strokes.length > Config.DRAWING.MAX_HISTORY) {
            // In a real app we would remove from spatial hash too, but that's complex to un-index.
            // For this scope, infinite growth of hash might be okay, or we just clear oldest.
            // A rebuild of hash is expensive. 
            // We will just shift.
            strokes.shift();
        }
        return strokes;
    }
}
