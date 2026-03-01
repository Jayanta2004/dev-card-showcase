export class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    contains(point) {
        return (point.pos.x >= this.x - point.radius &&
            point.pos.x <= this.x + this.w + point.radius &&
            point.pos.y >= this.y - point.radius &&
            point.pos.y <= this.y + this.h + point.radius);
    }

    intersects(range) {
        return !(range.x > this.x + this.w ||
            range.x + range.w < this.x ||
            range.y > this.y + this.h ||
            range.y + range.h < this.y);
    }
}

export class Quadtree {
    constructor(boundary, capacity) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];
        this.divided = false;
    }

    subdivide() {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.w / 2;
        const h = this.boundary.h / 2;

        const ne = new Rectangle(x + w, y, w, h);
        this.northeast = new Quadtree(ne, this.capacity);
        const nw = new Rectangle(x, y, w, h);
        this.northwest = new Quadtree(nw, this.capacity);
        const se = new Rectangle(x + w, y + h, w, h);
        this.southeast = new Quadtree(se, this.capacity);
        const sw = new Rectangle(x, y + h, w, h);
        this.southwest = new Quadtree(sw, this.capacity);

        this.divided = true;
    }

    insert(point) {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            this.points.push(point);
            return true;
        }

        if (!this.divided) {
            this.subdivide();
        }

        if (this.northeast.insert(point)) return true;
        if (this.northwest.insert(point)) return true;
        if (this.southeast.insert(point)) return true;
        if (this.southwest.insert(point)) return true;

        // Should happen if point is exactly on boundary, fallback info
        return false;
    }

    query(range, found) {
        if (!found) {
            found = [];
        }

        if (!this.boundary.intersects(range)) {
            return found;
        }

        for (const p of this.points) {
            // Rough check in range
            if (range.contains(p)) {
                found.push(p);
            }
        }

        if (this.divided) {
            this.northwest.query(range, found);
            this.northeast.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }

        return found;
    }

    clear() {
        this.points = [];
        this.divided = false;
        this.northwest = null;
        this.northeast = null;
        this.southwest = null;
        this.southeast = null;
    }
}
