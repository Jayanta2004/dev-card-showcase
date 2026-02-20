/**
 * Main Entry Point
 */
import { store } from './state/store.js';
import { GameLoop } from './core/loop.js';
import { Renderer } from './ui/renderer.js';

// Initialize Components
console.log('BusinessJS Initializing...');

// Setup UI Renderer
const renderer = new Renderer();
renderer.init();

// Setup Game Loop
const loop = new GameLoop();
loop.start();

// Debug Global Exposure
window.Game = {
    store,
    loop
};

// Start Date
document.getElementById('date-text').textContent = `Day ${store.get().day}`;
