// math.js

const MathUtils = {
    // 3D to 2D perspective projection
    project3D(x, y, z, camera, canvas) {
        const fov = camera.fov;
        const scale = fov / Math.max(z, 0.1);
        
        const screenX = (x * scale) + canvas.width / 2;
        const screenY = (y * scale) + canvas.height / 2;
        
        return { x: screenX, y: screenY, scale: scale };
    },

    // Clamp value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Distance between two 3D points
    distance3D(x1, y1, z1, x2, y2, z2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },

    // Distance between two 2D points
    distance2D(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Generate tunnel ring position using parametric circle
    getTunnelPoint(angle, radius, z) {
        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: z
        };
    },

    // Check if point is inside circle
    isInsideCircle(px, py, cx, cy, radius) {
        return this.distance2D(px, py, cx, cy) < radius;
    }
};