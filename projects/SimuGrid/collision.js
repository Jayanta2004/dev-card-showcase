/**
 * SIMUGRID COLLISION KERNEL
 * Implements Separating Axis Theorem (SAT) for convex polygons and circles.
 * @author saiusesgithub
 */

class Collision {
    /**
     * Main detection entry point.
     * Checks for collision between two rigid bodies.
     */
    static check(body1, body2) {
        // Broad phase check (Simple circle bounds) for optimization
        const dist = body1.pos.dist(body2.pos);
        if (dist > body1.radius + body2.radius) return null;

        // Narrow phase: SAT
        if (body1.type === 'circle' && body2.type === 'circle') {
            return this.circleToCircle(body1, body2);
        } else if (body1.type === 'poly' && body2.type === 'poly') {
            return this.polyToPoly(body1, body2);
        } else {
            return this.polyToCircle(body1, body2);
        }
    }

    /**
     * Poly-to-Poly SAT Implementation
     */
    static polyToPoly(b1, b2) {
        let overlap = Infinity;
        let smallAxis = null;

        const axes = [...b1.getAxes(), ...b2.getAxes()];

        for (let axis of axes) {
            const p1 = b1.project(axis);
            const p2 = b2.project(axis);

            if (!p1.overlaps(p2)) return null; // Gap found!

            const currentOverlap = p1.getOverlap(p2);
            if (currentOverlap < overlap) {
                overlap = currentOverlap;
                smallAxis = axis;
            }
        }

        return {
            overlap: overlap,
            axis: smallAxis,
            b1: b1,
            b2: b2
        };
    }

    /**
     * Poly-to-Circle logic: finds the closest vertex to treat as an axis.
     */
    static polyToCircle(poly, circle) {
        let overlap = Infinity;
        let smallAxis = null;

        const axes = poly.getAxes();
        
        // Add the axis from circle center to closest poly vertex
        const closest = poly.getClosestVertex(circle.pos);
        axes.push(closest.sub(circle.pos).normalize());

        for (let axis of axes) {
            const p1 = poly.project(axis);
            const p2 = circle.project(axis);

            if (!p1.overlaps(p2)) return null;

            const currentOverlap = p1.getOverlap(p2);
            if (currentOverlap < overlap) {
                overlap = currentOverlap;
                smallAxis = axis;
            }
        }

        return { overlap, axis: smallAxis, b1: poly, b2: circle };
    }

    static circleToCircle(c1, c2) {
        const dist = c1.pos.dist(c2.pos);
        const radiusSum = c1.shapeRadius + c2.shapeRadius;
        
        if (dist < radiusSum) {
            const axis = c1.pos.sub(c2.pos).normalize();
            return {
                overlap: radiusSum - dist,
                axis: axis,
                b1: c1,
                b2: c2
            };
        }
        return null;
    }
}

/**
 * Projection Helper Class
 * Represents a shape projected onto a 1D line (axis).
 */
class Projection {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }

    overlaps(other) {
        return !(this.min > other.max || other.min > this.max);
    }

    getOverlap(other) {
        return Math.min(this.max, other.max) - Math.max(this.min, other.min);
    }
}

window.Collision = Collision;
window.Projection = Projection;