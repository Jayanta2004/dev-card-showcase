import { Position, Velocity, Type, Life, Renderable, Vision } from './components.js';
import { Random } from './utils.js';

export const EntityFactory = {
    createGrass(world, x, y) {
        const entity = world.createEntity();
        entity.addComponent(new Position(x, y))
            .addComponent(new Type('Grass'))
            .addComponent(new Life(50, 0.5)) // Max energy 50, slow decay
            .addComponent(new Renderable('#1eff7f', 4)); // Small green square
        return entity;
    },

    createRabbit(world, x, y) {
        const entity = world.createEntity();
        entity.addComponent(new Position(x, y))
            .addComponent(new Velocity(Random.float(-20, 20), Random.float(-20, 20)))
            .addComponent(new Type('Rabbit'))
            .addComponent(new Life(100, 5)) // Needs more energy, faster decay
            .addComponent(new Vision(100))
            .addComponent(new Renderable('#f0f0f0', 6)); // White circle
        return entity;
    },

    createWolf(world, x, y) {
        const entity = world.createEntity();
        entity.addComponent(new Position(x, y))
            .addComponent(new Velocity(Random.float(-25, 25), Random.float(-25, 25)))
            .addComponent(new Type('Wolf'))
            .addComponent(new Life(150, 8)) // High energy need
            .addComponent(new Vision(150))
            .addComponent(new Renderable('#ff3b3b', 8)); // Red circle
        return entity;
    }
};
