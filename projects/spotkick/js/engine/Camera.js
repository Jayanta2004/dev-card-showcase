import { Vector3 } from '../math/Vector3.js';

export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.position = new Vector3(0, 1.5, -5); // Behind ball
        this.target = new Vector3(0, 1.0, 11); // Look at goal center (approx)

        this.focalLength = 800;
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.cx = this.width / 2;
        this.cy = this.height / 2;

        this.shakeOffset = new Vector3(0, 0, 0);
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
        this.cx = w / 2;
        this.cy = h / 2;
    }

    project(v3) {
        // Simple manual projection matrix simulation
        // Relative position
        const rx = v3.x - (this.position.x + this.shakeOffset.x);
        const ry = v3.y - (this.position.y + this.shakeOffset.y);
        const rz = v3.z - (this.position.z + this.shakeOffset.z);

        if (rz <= 0) return null; // Behind camera

        const scale = this.focalLength / rz;

        // Screen coords
        // x is right, y is up in 3D.
        // Screen x is right, screen y is down.

        return {
            x: this.cx + (rx * scale),
            y: this.cy - (ry * scale), // Invert Y
            scale: scale,
            visible: true
        };
    }

    applyShake(intensity = 0.1) {
        this.shakeOffset.x = (Math.random() - 0.5) * intensity;
        this.shakeOffset.y = (Math.random() - 0.5) * intensity;
        this.shakeOffset.z = (Math.random() - 0.5) * intensity;
    }

    resetShake() {
        this.shakeOffset.set(0, 0, 0);
    }
}
