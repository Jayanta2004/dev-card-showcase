/**
 * PHAYSICS LAB APP V2
 * Main Entry Point
 */

import { initControls } from './controls.js';
import { initEffects } from './effects.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Initializing Physics Lab V3... 🧪");

    // Initialize Modules
    initControls();
    initEffects();

    // Animate Header on Load
    const header = document.querySelector('.main-header');
    header.style.opacity = 0;
    setTimeout(() => {
        header.style.opacity = 1;
    }, 100);
});
