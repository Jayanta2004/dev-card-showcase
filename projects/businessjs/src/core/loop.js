/**
 * Game Loop Engine
 * Handles the tick-based logic and animation frames.
 */
import { store } from '../state/store.js';
import { TimeSystem } from './time.js';
import { FinanceSystem } from '../systems/finance.js';
import { MarketSystem } from '../systems/market.js';
import { EmployeeSystem } from '../systems/employees.js';
import { OperationsSystem } from '../systems/operations.js';
import { GlobalEventSystem } from '../systems/events.js';
import { ProductSystem } from '../systems/product.js';
import { PolicySystem } from '../systems/policies.js';

export class GameLoop {
    constructor() {
        this.lastTime = 0;
        this.accumulatedTime = 0;
        this.tickRate = 1000; // 1 second per game day by default
        this.running = false;

        // Systems
        this.timeSystem = new TimeSystem();
        this.financeSystem = new FinanceSystem();
        this.marketSystem = new MarketSystem();
        this.employeeSystem = new EmployeeSystem();
        this.operationsSystem = new OperationsSystem();
        this.globalEventSystem = new GlobalEventSystem();
        this.productSystem = new ProductSystem();
        this.policySystem = new PolicySystem();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.animate.bind(this));
        console.log('Simulation Engine Started');
    }

    stop() {
        this.running = false;
    }

    animate(currentTime) {
        if (!this.running) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        const state = store.get();

        if (!state.paused) {
            // Logic: 1 day per second (1000ms)
            // Speed 2 = 5x faster (200ms)
            // Speed 3 = 20x faster (50ms)
            let multiplier = 1;
            if (state.gameSpeed === 2) multiplier = 0.2;
            if (state.gameSpeed === 3) multiplier = 0.05;

            const currentTickRate = this.tickRate * multiplier;

            this.accumulatedTime += deltaTime;

            while (this.accumulatedTime >= currentTickRate) {
                this.tick();
                this.accumulatedTime -= currentTickRate;
            }
        }

        requestAnimationFrame(this.animate.bind(this));
    }

    tick() {
        // This is a Game Day
        this.timeSystem.advanceDay();

        // Trigger other systems
        this.financeSystem.update();
        this.marketSystem.update();
        this.employeeSystem.update();
        this.operationsSystem.update();
        this.globalEventSystem.update();
        this.productSystem.update();
        this.policySystem.update();

        // console.log(`Tick: Day ${store.get().day}`);
    }
}
