import { Simulation } from './Simulation.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('simulationCanvas');
    const simulation = new Simulation(canvas);
    simulation.start();

    // UI Bindings
    document.getElementById('resetBtn').addEventListener('click', () => simulation.reset());
    document.getElementById('explodeBtn').addEventListener('click', () => simulation.explode());

    const statNormal = document.getElementById('stat-normal');
    const statAnti = document.getElementById('stat-anti');

    // Update stats interval
    setInterval(() => {
        const stats = simulation.getStats();
        statNormal.textContent = `Normal: ${stats.normal}`;
        statAnti.textContent = `Anti-G: ${stats.anti}`;
    }, 500);
});
