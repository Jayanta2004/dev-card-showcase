/**
 * LiveTypingAura - Main Entry Point
 * Bootstraps the application and links input to renderer.
 */

import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { CONFIG } from './config.js';
import { Atmosphere } from './atmosphere.js';

document.addEventListener('DOMContentLoaded', () => {
    // State
    let heat = 0;
    let activeThemeHue = null; // null means use heat map

    // 1. Initialize Engines
    const renderer = new Renderer();
    const atmosphere = new Atmosphere();
    renderer.start();

    // ... (rest of code)

    // ... inside onThemeTrigger ...
    onThemeTrigger: (word) => {
        // Check if theme exists
        const theme = CONFIG.THEMES[word];
        if (theme && theme.active) {
            // UPDATE GLOBAL STATE
            activeThemeHue = theme.color; // Can be null (Reset)

            // Update Atmosphere
            if (theme.color !== null) {
                atmosphere.setMode(word.toLowerCase());
            } else {
                atmosphere.setMode('none');
            }

            // Update UI Indicator
            const indicator = document.getElementById('active-theme-display');

            // 2. Setup Cursor Tracker (Hidden Span)
            const display = document.getElementById('text-display');
            const measureContainer = document.createElement('div');
            measureContainer.style.position = 'absolute';
            measureContainer.style.visibility = 'hidden';
            measureContainer.style.whiteSpace = 'pre-wrap'; // Match text-display
            measureContainer.style.font = getComputedStyle(display).font;
            measureContainer.style.letterSpacing = getComputedStyle(display).letterSpacing;
            document.body.appendChild(measureContainer);

            // Helper: Find caret coords
            const getCaretPos = (text) => {
                // We simulate the text content up to the caret
                measureContainer.textContent = text;
                const rect = display.getBoundingClientRect();

                // To be precise, we need to handle wrapping.
                // We can create a span for the last char and measure its position relative to wrapper?
                // Simplification: We assume centered text.
                // Let's rely on a simpler trick: 
                // We can look at the width of the measure container?
                // Actually, since it's centered, the "end" of the text is:
                // CenterX + (Width / 2) is WRONG because it's centered. 
                // If centered: Start = Center - Width/2. End = Center + Width/2.
                // Yes.

                const width = measureContainer.offsetWidth;
                // Text display is centered
                const centerX = window.innerWidth / 2;
                // caret is at centerX + width/2 ?? No.
                // If text is "A", width is 20. Center is 500. Box is 490 to 510. Caret is at 510.
                // If text is "ABC", width is 60. Box is 470 to 530. Caret is at 530.
                // So yes: CenterX + (Width / 2).
                return {
                    x: centerX + (width / 2),
                    y: window.innerHeight / 2 // Approximate vertical center
                };
            };

            // 3. Initialize Input Handler
            const inputHandler = new InputHandler({
                onType: (data) => {
                    document.body.classList.remove('idle');

                    // Increase global Heat
                    heat = Math.min(heat + CONFIG.HEAT.GAIN_PER_CHAR, CONFIG.HEAT.MAX);

                    // Calculate spawn position
                    let currentText = display.textContent;
                    // The display update happens in keydown below, which might be BEFORE or AFTER this callback?
                    // InputHandler calls callback immediately. 
                    // We need the text *including* the new char to find the new caret pos.
                    // But data.char is just the key.
                    // Let's assume the text update happens separately. We can predict.

                    let caretPos = getCaretPos(display.textContent + data.char);

                    // Random spread based on heat
                    const spread = 10 + (heat * 10);

                    const spawnX = caretPos.x + (Math.random() - 0.5) * spread;
                    const spawnY = caretPos.y + (Math.random() - 0.5) * 40;

                    // Exaggerate count
                    const particleCount = Math.floor(6 + (heat * 4)); // Base 6, scales faster

                    // Punctuation Burst - Huge
                    if (/[.,;?!:]/.test(data.char)) {
                        renderer.spawnParticles(spawnX, spawnY, particleCount * 4, heat + 3, activeThemeHue);
                    } else {
                        // Use activeThemeHue if set, otherwise null (renderer logic handles heat fallback if null)
                        // actually renderer expects overrideHue.
                        renderer.spawnParticles(spawnX, spawnY, particleCount, heat, activeThemeHue);
                    }
                },
                onBackspace: (intensity) => {
                    document.body.classList.remove('idle');
                    renderer.triggerImplosion();
                    // Just for fun, spawn some "dust" on delete
                    renderer.spawnParticles(
                        getCaretPos(display.textContent).x,
                        getCaretPos(display.textContent).y,
                        10, 2.0, activeThemeHue);
                },
                onIdle: () => {
                    document.body.classList.add('idle');
                },
                onThemeTrigger: (word) => {
                    // Check if theme exists
                    const theme = CONFIG.THEMES[word];
                    if (theme && theme.active) {
                        // UPDATE GLOBAL STATE
                        activeThemeHue = theme.color; // Can be null (Reset)

                        // Update UI Indicator
                        const indicator = document.getElementById('active-theme-display');
                        if (indicator) {
                            if (theme.color !== null) {
                                indicator.textContent = `MODE: ${word.toUpperCase()}`;
                                indicator.style.color = `hsl(${theme.color}, 80%, 60%)`;
                                indicator.style.textShadow = `0 0 10px hsl(${theme.color}, 80%, 60%)`;

                                // Safe Class Management
                                const knownThemes = Object.keys(CONFIG.THEMES).map(k => `theme-${k}`);
                                document.body.classList.remove(...knownThemes);
                                document.body.classList.add(`theme-${word.toLowerCase()}`);

                                // Set Renderer Environment
                                renderer.setEnvironment(word);

                            } else {
                                indicator.textContent = "MODE: AUTO";
                                indicator.style.color = "cyan";
                                indicator.style.textShadow = "none";

                                // Clear Body Theme
                                const knownThemes = Object.keys(CONFIG.THEMES).map(k => `theme-${k}`);
                                document.body.classList.remove(...knownThemes);

                                // Reset Renderer Environment
                                renderer.setEnvironment('none');
                            }
                        }

                        // VISUAL FEEDBACK: MASSIVE BURST
                        const cx = window.innerWidth / 2;
                        const cy = window.innerHeight / 2;

                        if (theme.color !== null) {
                            renderer.spawnParticles(cx, cy, 150, 5.0, theme.color);
                        } else {
                            // Reset feedback
                            renderer.createShockwave(cx, cy);
                        }
                    }
                }
            });

            // 4. Heat Decay Loop (Hook into requestAnimationFrame implicitly or separate interval)
            // Let's just run a small interval for logic updates like heat decay
            setInterval(() => {
                heat = Math.max(0, heat - CONFIG.HEAT.DECAY);
            }, 16); // ~60fps logic tick

            // 5. Text Display & Physics Hooks
            let textState = "Start Typing...";
            let hasStarted = false;

            window.addEventListener('keydown', (e) => {
                if (!hasStarted && e.key.length === 1) {
                    hasStarted = true;
                    textState = "";
                }

                // Gravity Well (Shift)
                if (e.key === 'Shift') {
                    const cp = getCaretPos(display.textContent);
                    // Activate gravity towards caret
                    renderer.setGravityWell(true, cp.x, cp.y);
                    document.body.classList.add('gravity-mode'); // Optional UI Hint
                }

                // Shockwave on Enter
                if (e.key === 'Enter') {
                    const centerX = window.innerWidth / 2;
                    const centerY = window.innerHeight / 2;
                    renderer.createShockwave(centerX, centerY);

                    // Screen Shake
                    document.body.classList.remove('shake');
                    void document.body.offsetWidth; // Trigger reflow to restart animation
                    document.body.classList.add('shake');
                }

                if (e.key === 'Backspace') {
                    textState = textState.slice(0, -1);
                } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
                    textState += e.key;
                }

                display.textContent = textState;

                // Sync font updates if resize happens
                measureContainer.style.font = getComputedStyle(display).font;
            });

            window.addEventListener('keyup', (e) => {
                if (e.key === 'Shift') {
                    renderer.setGravityWell(false, 0, 0);
                    document.body.classList.remove('gravity-mode');
                }
            });
        });
