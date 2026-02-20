/**
 * whisper.js
 * 
 * Manages the "Whisper Log" - a narrative layer that reveals 
 * the internal thoughts of the shy text as the user interacts.
 */

import { randomInt } from './utils.js';

const MENTIONS = [
    "I can feel you...",
    "Why so close?",
    "Give me space.",
    "The edges are safer.",
    "Your gaze is heavy.",
    "I'm trembling.",
    "Look away, please.",
    "Peripheral vision is kinder.",
    "Silence is better.",
    "You're too fast."
];

export class WhisperLog {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.lastWhisperTime = 0;
        this.whisperInterval = 3000; // ms
    }

    /**
     * Potentially trigger a whisper based on proximity.
     */
    update(proximity) {
        if (!this.container) return;

        const now = Date.now();
        if (proximity > 0.6 && now - this.lastWhisperTime > this.whisperInterval) {
            this.addWhisper();
            this.lastWhisperTime = now;
        }
    }

    addWhisper() {
        const whisper = document.createElement('div');
        whisper.className = 'whisper-entry';
        whisper.textContent = MENTIONS[randomInt(0, MENTIONS.length - 1)];

        // Random horizontal position
        const x = randomInt(10, 90);
        whisper.style.left = `${x}%`;

        this.container.appendChild(whisper);

        // Auto remove after animation
        setTimeout(() => {
            whisper.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            whisper.style.opacity = '0';
            whisper.style.transform = 'translateY(-20px)';
            setTimeout(() => whisper.remove(), 1000);
        }, 2000);
    }
}
