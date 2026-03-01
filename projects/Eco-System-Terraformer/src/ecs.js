import { Position, Type } from './components.js';

export class Component {
    constructor() { }
}

export class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
        this.markedForDeletion = false;
    }

    addComponent(component) {
        this.components.set(component.constructor.name, component);
        return this;
    }

    getComponent(componentClassOrName) {
        const name = typeof componentClassOrName === 'string' ? componentClassOrName : componentClassOrName.name;
        return this.components.get(name);
    }

    hasComponent(componentClassOrName) {
        const name = typeof componentClassOrName === 'string' ? componentClassOrName : componentClassOrName.name;
        return this.components.get(name) !== undefined;
    }

    destroy() {
        this.markedForDeletion = true;
    }
}

export class System {
    constructor(world) {
        this.world = world;
    }
    update(dt) { }
}

export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.entities = [];
        this.systems = [];
        this.nextId = 0;
        this.spatialGrid = new SpatialHash(50);
        this.stats = { grass: 0, rabbit: 0, wolf: 0 };
    }

    createEntity() {
        const entity = new Entity(this.nextId++);
        this.entities.push(entity);
        return entity;
    }

    addSystem(system) {
        this.systems.push(system);
    }

    update(dt) {
        // Cleanup dead entities first
        this.entities = this.entities.filter(e => !e.markedForDeletion);

        // Reset stats
        this.stats = { grass: 0, rabbit: 0, wolf: 0 };

        // Clear grid and rebuild, and count stats
        this.spatialGrid.clear();
        for (const entity of this.entities) {
            const pos = entity.getComponent('Position'); // Updated to string key
            if (pos) {
                this.spatialGrid.insert(entity, pos);
            }

            const typeComp = entity.getComponent('Type');
            if (typeComp) {
                if (typeComp.type === 'Grass') this.stats.grass++;
                else if (typeComp.type === 'Rabbit') this.stats.rabbit++;
                else if (typeComp.type === 'Wolf') this.stats.wolf++;
            }
        }

        // Run systems
        for (const system of this.systems) {
            system.update(dt);
        }
    }

    query(x, y, radius) {
        return this.spatialGrid.query(x, y, radius);
    }
}

class SpatialHash {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    _key(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    insert(entity, pos) {
        const key = this._key(pos.x, pos.y);
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push(entity);
    }

    clear() {
        this.grid.clear();
    }

    query(x, y, range) {
        const entities = [];
        const startX = Math.floor((x - range) / this.cellSize);
        const endX = Math.floor((x + range) / this.cellSize);
        const startY = Math.floor((y - range) / this.cellSize);
        const endY = Math.floor((y + range) / this.cellSize);

        for (let ix = startX; ix <= endX; ix++) {
            for (let iy = startY; iy <= endY; iy++) {
                const key = `${ix},${iy}`;
                if (this.grid.has(key)) {
                    entities.push(...this.grid.get(key));
                }
            }
        }
        return entities;
    }
}
