/**
 * app.js
 * Application Entry Point
 */

import { initGallery } from './gallery.js';
import { initUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Lumina Gallery Initializing...');

    const gridContainer = document.getElementById('gallery-grid');

    // Initialize Gallery Content
    initGallery(gridContainer);

    // Initialize UI Interactions
    initUI();

    // Theme Toggle Logic (Simple local implementation)
    const btnTheme = document.getElementById('btn-theme-toggle');
    const html = document.documentElement;

    btnTheme.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);

        // Update Icon (Simple swap of inner HTML or class, 
        // essentially just toggling which SVG is visible if we had both, 
        // but here we just keep the sun/moon concept abstract for now or swap icons in a fuller impl)
    });
});
