/**
 * ui.js
 * 
 * Handles DOM updates, style applications, and UI lifecycle.
 * Bridge between the ProximityEngine and the visual display.
 * 
 * @module UI
 */

import { CONFIG } from './config.js';
import { lerp } from './utils.js';
import { Logger } from './logger.js';
import { Theme } from './theme.js';
import { Audio } from './audio.js';
import { STATE } from './state.js';

export class UIRenderer {
    constructor(controller) {
        this.controller = controller;
        this.activeNodes = new Map();
        this.statusLabel = document.getElementById('proximity-label');
        this.activeDot = document.getElementById('active-dot');

        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.mouseSpeed = 0;

        this.setupEventListeners();
    }

    /**
     * Attaches UI specific event listeners.
     */
    setupEventListeners() {
        // Theme Cycle Button (if we add one, or keyboard shortcut)
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key === 't') {
                Theme.cycle();
                Logger.info("Theme cycled by user.");
            }
            if (key === 'm') {
                const muted = Audio.toggleMute();
                Logger.info(`Audio ${muted ? 'muted' : 'unmuted'} by user.`);
            }
        });

        // Recalibrate on demand
        window.addEventListener('shytext:resize', () => {
            this.controller.proximity.recalibrate();
        });
    }

    /**
     * Updates the visual styles of shy elements based on proximity data.
     * 
     * @param {Array} targetData - Data from ProximityEngine
     */
    render(targetData) {
        let maxGlobalProximity = 0;

        // Calculate Mouse Speed for Panic Mode
        const dx = STATE.cursor.x - this.lastMouseX;
        const dy = STATE.cursor.y - this.lastMouseY;
        this.mouseSpeed = Math.sqrt(dx * dx + dy * dy);
        this.lastMouseX = STATE.cursor.x;
        this.lastMouseY = STATE.cursor.y;

        const isPanicked = this.mouseSpeed > 40; // Threshold for "panic"

        targetData.forEach(target => {
            const prox = target.currentProximity;
            if (prox > maxGlobalProximity) maxGlobalProximity = prox;

            // Apply visual filters
            let blurVal = prox * CONFIG.VISUALS.MAX_BLUR;
            let opacityVal = 1 - (prox * (1 - CONFIG.VISUALS.MIN_OPACITY));

            // Panic adjustment
            if (isPanicked && prox > 0.4) {
                opacityVal = 0;
                blurVal = 30;
            }

            const fontStretch = 100 - (prox * 20);
            const letterSpacing = (prox * 4).toFixed(2);

            // Use requestAnimationFrame style updates via inline styles for maximum smoothness
            target.element.style.filter = `blur(${blurVal.toFixed(2)}px)`;
            target.element.style.opacity = opacityVal.toFixed(3);
            target.element.style.letterSpacing = `${letterSpacing}px`;
            target.element.style.transition = isPanicked ? 'opacity 0.1s, filter 0.1s' : 'opacity 0.5s, filter 0.5s';

            // Individual line subtle offsets for "scattering" effect
            const lines = target.element.querySelectorAll('.shy-line');
            lines.forEach((line, index) => {
                // Feature 1: Letter Scattering
                // Splitting into spans for specific character scattering if prox > 0.8
                if (prox > 0.7) {
                    this.scatterLetters(line, prox);
                } else {
                    this.resetLetters(line);
                }

                const offset = (index % 2 === 0 ? 1 : -1) * (prox * 15);
                line.style.transform = `translateX(${offset.toFixed(2)}px)`;
            });
        });

        this.updateStatus(maxGlobalProximity);
    }

    /**
     * Splits text into individual spans for character-level manipulation.
     */
    scatterLetters(line, proximity) {
        if (!line.dataset.split) {
            const text = line.textContent;
            line.innerHTML = text.split('').map(char => `<span class="shy-char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
            line.dataset.split = "true";
        }

        const chars = line.querySelectorAll('.shy-char');
        chars.forEach(char => {
            const randX = (Math.random() - 0.5) * (proximity * 20);
            const randY = (Math.random() - 0.5) * (proximity * 20);
            const rotation = (Math.random() - 0.5) * (proximity * 10);
            char.style.display = 'inline-block';
            char.style.transform = `translate(${randX}px, ${randY}px) rotate(${rotation}deg)`;
        });
    }

    resetLetters(line) {
        if (line.dataset.split) {
            line.textContent = line.textContent; // Resets HTML
            delete line.dataset.split;
        }
        line.style.transform = '';
    }

    /**
     * Updates the status indicator in the top nav.
     * 
     * @param {number} proximity 
     */
    updateStatus(proximity) {
        if (!this.statusLabel) return;

        if (proximity > 0.8) {
            this.statusLabel.textContent = 'Intimidated';
            this.activeDot.classList.add('pulsing');
            this.activeDot.style.backgroundColor = 'var(--danger-color)';
            this.activeDot.style.boxShadow = '0 0 15px var(--danger-color)';
        } else if (proximity > 0.3) {
            this.statusLabel.textContent = 'Observing';
            this.activeDot.classList.remove('pulsing');
            this.activeDot.style.backgroundColor = 'var(--accent-color)';
            this.activeDot.style.boxShadow = '0 0 10px var(--accent-color)';
        } else {
            this.statusLabel.textContent = 'Peripheral';
            this.activeDot.classList.remove('pulsing');
            this.activeDot.style.backgroundColor = 'var(--text-secondary)';
            this.activeDot.style.boxShadow = 'none';
        }
    }

    /**
     * Shows a gentle greeting or instruction.
     */
    showIntro() {
        const container = document.querySelector('.interactive-text-stage');
        if (container) {
            container.style.opacity = '1';
        }
    }
}

/**
 * Performance Optimization: Inline Styles vs CSS Classes
 * 
 * For high-frequency updates like the blur/opacity interpolation 
 * here, application of inline styles is significantly more performant 
 * than toggling CSS classes. Toggling classes can trigger expensive 
 * recalculations of the entire render tree, whereas inline style 
 * updates to specific properties like Transform and Filter are 
 * often handled by the GPU composite layer.
 */
