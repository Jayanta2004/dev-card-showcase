import { clamp, map } from '../utils/MathUtils.js';

export class Controls {
    constructor(decks, mixer, effects) {
        this.decks = decks; // Map { 'A': deckA, 'B': deckB }
        this.mixer = mixer;
        this.effects = effects; // { delay, distortion }

        this.activeElement = null;
        this.startY = 0;
        this.startValue = 0;

        this.init();
    }

    init() {
        // Global Mouse Up
        document.addEventListener('mouseup', () => {
            this.activeElement = null;
            document.body.style.cursor = 'default';
        });

        // Global Mouse Move
        document.addEventListener('mousemove', (e) => this.handleDrag(e));

        // Knobs
        document.querySelectorAll('.knob, .knob-small').forEach(knob => {
            knob.addEventListener('mousedown', (e) => this.startDrag(e, knob));
        });

        // Sliders (Rate) - Native inputs handle themselves, but we listen to input
        document.querySelectorAll('.vertical-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const deckId = e.target.id.split('-')[1].toUpperCase(); // rate-a -> A
                const val = parseFloat(e.target.value);
                if (this.decks[deckId]) this.decks[deckId].setRate(val);
            });
            // Reset on double click
            slider.addEventListener('dblclick', (e) => {
                e.target.value = 1;
                const deckId = e.target.id.split('-')[1].toUpperCase();
                if (this.decks[deckId]) this.decks[deckId].setRate(1);
            });
        });

        // Transport Buttons
        document.querySelectorAll('.transport-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deckId = e.target.dataset.deck;
                const deck = this.decks[deckId];
                if (!deck) return;

                if (e.target.classList.contains('play-btn')) {
                    if (deck.isPlaying) deck.pause();
                    else deck.play();
                    e.target.innerText = deck.isPlaying ? 'PAUSE' : 'PLAY';
                    e.target.classList.toggle('active', deck.isPlaying);
                } else if (e.target.classList.contains('cue-btn')) {
                    deck.cue();
                    // Reset Play button state
                    const playBtn = document.querySelector(`.play-btn[data-deck="${deckId}"]`);
                    if (playBtn) {
                        playBtn.innerText = 'PLAY';
                        playBtn.classList.remove('active');
                    }
                }
            });
        });

        // Crossfader
        const xfader = document.getElementById('crossfader');
        xfader.addEventListener('input', (e) => {
            this.mixer.setCrossfader(parseFloat(e.target.value));
        });
        xfader.addEventListener('dblclick', (e) => {
            e.target.value = 0;
            this.mixer.setCrossfader(0);
        });
    }

    startDrag(e, element) {
        this.activeElement = element;
        this.startY = e.clientY;

        // Get current visual rotation or value
        // We'll store a dataset value for logical value 0-1 or -1 to 1
        let current = parseFloat(element.dataset.value || 0.5); // Default center
        this.startValue = current;

        document.body.style.cursor = 'ns-resize';
        e.preventDefault();
    }

    handleDrag(e) {
        if (!this.activeElement) return;

        const deltaY = this.startY - e.clientY;
        const sensitivity = 0.005;
        let newValue = this.startValue + (deltaY * sensitivity);
        newValue = clamp(newValue, 0, 1);

        // Update State & Visuals
        this.updateParam(this.activeElement, newValue);
    }

    updateParam(element, value) {
        element.dataset.value = value;

        // Visual Rotation (approx -135deg to 135deg)
        const rotation = map(value, 0, 1, -135, 135);
        element.style.setProperty('--rotation', `${rotation}deg`);
        // Manually update pseudo element transform via style if possible, 
        // OR better: use variable in CSS.
        // Let's assume we update a css variable on the element.
        // .knob::after { transform: rotate(var(--rotation)); }
        // We need to add that to CSS.
        element.style.transform = `rotate(${rotation}deg)`;
        // Wait, rotating the whole knob rotates the border too, which might look weird if not circular perfectly or has shadows.
        // Better: rotate the marker inside. 
        // But for MVP, rotating the div is fine if it's a circle.

        // Logic binding
        if (element.dataset.deck) {
            // EQ
            const deck = element.dataset.deck;
            const param = element.dataset.param; // high, mid, low
            // EQ expects -1 to 1 usually, or 0 to 1?
            // Mixer.ChannelStrip expects -1 to 1 ideally for cut/boost
            // Let's map 0..1 to -1..1
            const eqVal = map(value, 0, 1, -1, 1);
            if (param === 'high') this.mixer[deck === 'A' ? 'channelA' : 'channelB'].setEQ('high', eqVal);
            if (param === 'mid') this.mixer[deck === 'A' ? 'channelA' : 'channelB'].setEQ('mid', eqVal);
            if (param === 'low') this.mixer[deck === 'A' ? 'channelA' : 'channelB'].setEQ('low', eqVal);
        }
        else if (element.dataset.fx) {
            const fx = element.dataset.fx;
            if (fx === 'delay-time') this.effects.delay.setTime(value); // 0-1s?? needs mapping
            if (fx === 'delay-feedback') this.effects.delay.setFeedback(value);
            if (fx === 'delay-mix') this.effects.delay.setMix(value);
            if (fx === 'distort-amount') this.effects.distortion.setAmount(value);
        }
    }
}
