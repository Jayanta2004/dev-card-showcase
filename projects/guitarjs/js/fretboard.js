/**
 * GuitarJS - Fretboard Logic
 * Handles DOM generation, visual state, and mouse interactions.
 */

const Fretboard = (() => {
    let container = null;
    let strings = [];

    // Configuration
    const FRET_Count = 20; // Visible frets
    const MARKERS = [3, 5, 7, 9, 12, 15, 17, 19];

    function init() {
        container = document.getElementById('fretboard');
        if (!container) return;

        renderFrets();
        renderStrings();
        attachEventListeners();
    }

    function renderFrets() {
        // Calculate fret spacing (logarithmic approximation for visual realism)
        // distance = scale * (1 - (1/2)^(n/12))
        // We'll just use percentage widths for simpler CSS layout

        for (let i = 1; i <= FRET_Count; i++) {
            const fret = document.createElement('div');
            fret.className = 'fret-marker';

            // Visual position (approximate percentage)
            // Real scaling is compressed near bridge. 
            // Let's use a simplified constant reduction for visual spacing.
            // 0% is nut (left).

            // Formula adjustment for visuals:
            // P(i) = 1 - 1 / (2 ^ (i/12))
            const position = 1 - (1 / Math.pow(2, i / 17.817)); // 17.817 is standard scale rule
            const leftPercent = position * 100 * 1.5; // Scale up to fit viewport width logic

            // Clamp for CSS
            let finalLeft = Math.min(leftPercent, 95);
            // Simple linear-ish fallback if math feels off in CSS:
            // Just use fixed calc? No, let's trust the formula but scale it.
            // Actually, let's keep it simple: equal spacing looks bad. 
            // Let's manually tweak a formula:

            // position from 0 to 1
            const x = (1 - Math.pow(0.9438, i)); // 0.9438 is 18th root of 2 approx inverse
            // Scale x to 100%
            finalLeft = x * 100 * 1.3; // *1.3 to stretch it out visually

            fret.style.left = `${finalLeft}%`;
            container.appendChild(fret);

            // Inlays
            if (MARKERS.includes(i)) {
                if (i === 12) {
                    createInlay(finalLeft - 2.5, 'double-top'); // Approximate center of fret space
                    createInlay(finalLeft - 2.5, 'double-bottom');
                } else {
                    createInlay(finalLeft - 2.5, 'single');
                }
            }
        }
    }

    function createInlay(leftPercent, type) {
        const dot = document.createElement('div');
        dot.className = `inlay ${type}`;
        dot.style.left = `${leftPercent}%`;
        container.appendChild(dot);
    }

    function renderStrings() {
        // High E (index 5) is usually bottom or top?
        // Let's render High E (0 in CSS classes visually thin) at TOP visually? 
        // Or Bottom? Tablature - Top line is High E.
        // CSS implementation: Flex column.
        // If we want Tablature standard:
        // Top Element -> High E (String 5 in array, or 0? Array[0] is Low E usually).
        // Let's stick to Array Indices matching Frequency Strings.
        // Frequencies.STRING_TUNINGS[0] is E2 (Low).
        // Frequencies.STRING_TUNINGS[5] is E4 (High).

        // Visual Order: High E (Top) -> Low E (Bottom)
        // So loop 5 down to 0.

        for (let i = 5; i >= 0; i--) {
            const strContainer = document.createElement('div');
            strContainer.className = 'string-container';
            strContainer.dataset.stringIndex = i;

            const strWire = document.createElement('div');
            strWire.className = `string string-${i}`;
            strContainer.appendChild(strWire);

            container.appendChild(strContainer);
            strings[i] = strContainer; // Store by index
        }
    }

    function attachEventListeners() {
        // Delegate for efficiency? No, simple strings.

        strings.forEach(str => {
            if (!str) return;

            // Mouse Down (Pluck)
            str.addEventListener('mousedown', (e) => {
                triggerString(parseInt(str.dataset.stringIndex), e.clientX);
            });

            // Hover Pluck (Strumming)
            str.addEventListener('mouseenter', (e) => {
                if (e.buttons === 1) { // Left mouse button held
                    triggerString(parseInt(str.dataset.stringIndex), e.clientX);
                }
            });
        });
    }

    function triggerString(index, mouseX) {
        // Calculate intensity based on mouse movement/position?
        // Or just random variance for realism.
        const velocity = 0.8 + Math.random() * 0.2;

        // Calculate which fret is being pressed? 
        // For interaction V1: Just Open strings or simplified fretting.
        // Requirement: "Clicking/tapping a string plucks it".
        // Requirement: "Active strings/frets highlighted".
        // If we only mouse click, we probably play open strings unless a key is held? 
        // Or: clicking *on* a fret?
        // "Mouse position affects pluck strength" -> Constraint.
        // Let's use Mouse X relative to string width for... something?
        // Actually, let's map Mouse X to Fret? That allows playing.
        // If I click far right -> High pitch. Far left -> Low pitch.

        const rect = container.getBoundingClientRect();
        const xPercent = (mouseX - rect.left) / rect.width;

        // Map xPercent to fret?
        // Fret 0 is 0-3%. Fret 1 is 3-8% etc. 
        // This logic mimics touching the fretboard.
        let fret = 0;
        // Inverse of the visual mapping we used earlier roughly
        // Simple linear approx for interaction efficiency:
        if (xPercent > 0.05) {
            fret = Math.floor(xPercent * 20); // 0-19
        }

        // Play
        const freq = Frequencies.getFrequency(index, fret);
        const note = window.audioEngine.pluck(freq, velocity, index);

        // Visuals
        vibrateString(index, note);
    }

    function vibrateString(index, noteObj) {
        const el = strings[index];
        if (!el) return;

        const wire = el.querySelector('.string');
        wire.classList.remove('vibrating');
        void wire.offsetWidth; // Trigger reflow
        wire.classList.add('vibrating');

        el.classList.add('string-active');

        // Stop vibration visual after some time
        setTimeout(() => {
            wire.classList.remove('vibrating');
            el.classList.remove('string-active');
        }, 300); // 300ms visual decay
    }

    // External API
    function pluckString(index, fret = 0) {
        const velocity = 0.9;
        const freq = Frequencies.getFrequency(index, fret);
        const note = window.audioEngine.pluck(freq, velocity, index);

        vibrateString(index, note);
        return note;
    }

    return {
        init,
        pluckString
    };
})();
