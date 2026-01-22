// main.js

let engine;

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    engine = new Engine(canvas);
    engine.start();

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        engine.restart();
    });
});