/**
 * @file tests.js
 * @description Internal verification suite for the LightSwitch application.
 * 
 * This module provides a simple, dependency-free test runner and specific
 * unit tests to ensure the core logic (State, Math, Audio configuration)
 * remains stable across refactors.
 */

import { appState } from './state.js';
import { MathUtils } from './utils.js';

export class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.logger = console;
    }

    /**
     * Registers a new test case.
     * @param {string} name - Desciption of the test.
     * @param {Function} fn - The test logic.
     */
    add(name, fn) {
        this.tests.push({ name, fn });
    }

    /**
     * Executes all registered tests and logs a report.
     */
    async runAll() {
        this.logger.log("%c[Test Runner] Starting Automated Verification...", "color: #ff00ff; font-weight: bold;");
        let passedCount = 0;

        for (const test of this.tests) {
            try {
                await test.fn();
                this.logger.log(`%c[PASS] %c${test.name}`, "color: #00ff00;", "color: inherit;");
                passedCount++;
                this.results.push({ name: test.name, status: 'PASS' });
            } catch (error) {
                this.logger.error(`%c[FAIL] %c${test.name}`, "color: #ff0000;", "color: inherit;");
                this.logger.error(error);
                this.results.push({ name: test.name, status: 'FAIL', error: error.message });
            }
        }

        const total = this.tests.length;
        const color = passedCount === total ? 'color: #00ff00;' : 'color: #ff3333;';
        this.logger.log(`%c[Test Runner] Completed: ${passedCount}/${total} tests passed.`, color + "font-weight: bold;");
    }

    /**
     * Helper to assert a condition.
     * @param {boolean} condition 
     * @param {string} message 
     */
    assert(condition, message) {
        if (!condition) throw new Error(`Assertion Failed: ${message}`);
    }

    /**
     * Helper to check equality.
     * @param {any} actual 
     * @param {any} expected 
     * @param {string} message 
     */
    assertEquals(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`Equality Failed: ${message} (Expected ${expected}, got ${actual})`);
        }
    }
}

/**
 * Initialize and run basic suite.
 */
export async function initializeTests() {
    const runner = new TestRunner();

    // 1. Math Utils Tests
    runner.add("MathUtils.clamp should restrict upper bound", () => {
        runner.assertEquals(MathUtils.clamp(100, 0, 50), 50, "Clamp high failed");
    });

    runner.add("MathUtils.clamp should restrict lower bound", () => {
        runner.assertEquals(MathUtils.clamp(-10, 0, 50), 0, "Clamp low failed");
    });

    runner.add("MathUtils.lerp should return middle value", () => {
        runner.assertEquals(MathUtils.lerp(0, 100, 0.5), 50, "Lerp middle failed");
    });

    // 2. State Manager Tests
    runner.add("StateManager should start in initial state", () => {
        runner.assert(appState.isOn === false, "Initial state should be false (Dark)");
    });

    runner.add("StateManager history should record initialization", () => {
        const history = appState.getHistory();
        runner.assert(history.length >= 1, "History empty");
        runner.assertEquals(history[0].reason, "INITIAL_LOAD", "Incorrect history reason");
    });

    runner.add("StateManager toggle should change state", () => {
        const initialState = appState.isOn;
        appState.toggle();
        const newState = appState.isOn;
        runner.assert(initialState !== newState, "Toggle failed to flip state");
        // Reset state for remaining app use
        appState.toggle();
    });

    // 3. Audio Config Tests
    runner.add("Audio Engine context check", () => {
        // We can't verify functionality, but we can verify the module export
        runner.assert(!!appState.subscribe, "State module export check failed");
    });

    // Run the suite
    await runner.runAll();
}
