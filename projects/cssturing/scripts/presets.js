/**
 * Preset Patterns for Rule 110.
 * 
 * Rule 110 is proven Turing Complete and has many interesting known patterns.
 * This file catalogues some of them for the "Presets" menu.
 * 
 * Legend: 
 * 0 = Dead
 * 1 = Alive
 * 
 * We assume the tape is centered or starts at index 0.
 */

export const PRESETS = {
    random: {
        name: "Random Noise",
        description: "A random distribution of bits. Often settles into stable periodic structures.",
        generate: (cols) => {
            const arr = new Array(cols).fill(0);
            return arr.map(() => Math.random() > 0.5 ? 1 : 0);
        }
    },

    single: {
        name: "Single Cell",
        description: "A single active cell at the right edge. Generates the classic Rule 110 triangle.",
        generate: (cols) => {
            const arr = new Array(cols).fill(0);
            arr[cols - 1] = 1;
            return arr;
        }
    },

    alternating: {
        name: "Alternating",
        description: "1-0-1-0 pattern. Creates a chaotic interaction zone.",
        generate: (cols) => {
            const arr = new Array(cols).fill(0);
            return arr.map((_, i) => i % 2 === 0 ? 1 : 0);
        }
    },

    spaceship_A: {
        name: "Standard Glider",
        description: "One of the most common background structures in Rule 110.",
        data: [0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0] // 000110111000...
    },

    // A pattern that repeats with a shift
    repeater: {
        name: "Simple Repeater",
        description: "A small periodic structure.",
        data: [1, 1, 1, 0, 1, 0, 0, 1, 1, 0]
    },

    // More complex structure
    ether: {
        name: "Ether Pattern",
        description: "The background texture of Rule 110.",
        data: [0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1]
    },

    // A pattern that generates a glider gun-like behavior
    gun_variant: {
        name: "Glider Gun Variant",
        description: "Produces multiple gliders over time.",
        data: [1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1]
    },

    // Chaotic seeds
    chaos_A: {
        name: "Chaos Seed A",
        description: "A small seed that grows chaotically.",
        data: [0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0]
    },

    chaos_B: {
        name: "Chaos Seed B",
        description: "Another chaotic seed.",
        data: [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1]
    },

    // Long period oscillator
    oscillator_long: {
        name: "Long Oscillator",
        description: "Repeats after many generations.",
        data: [1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1]
    },

    // Dense start
    dense: {
        name: "Dense Block",
        description: "A solid block of 1s.",
        generate: (cols) => {
            const arr = new Array(cols).fill(0);
            const center = Math.floor(cols / 2);
            for (let i = center - 5; i <= center + 5; i++) arr[i] = 1;
            return arr;
        }
    }
};

/**
 * Applies a preset to the tape inputs.
 * @param {string} key - The preset key.
 * @param {HTMLElement} tapeContainer - The DOM container with inputs.
 */
export function loadPreset(key, tapeContainer) {
    const preset = PRESETS[key];
    if (!preset) return;

    const inputs = tapeContainer.querySelectorAll('input');
    const cols = inputs.length;

    // Reset
    inputs.forEach(inp => inp.checked = false);

    let pattern = [];
    if (preset.generate) {
        pattern = preset.generate(cols);
    } else if (preset.data) {
        pattern = preset.data;
    }

    // Apply pattern
    // If it's a fixed data array, where do we place it?
    // Let's place it in the center or right edge?
    // Rule 110 moves Left. So placing on Right gives more time to see it.

    const offset = preset.data ? Math.max(0, cols - preset.data.length - 2) : 0;

    pattern.forEach((val, i) => {
        const targetIdx = offset + i;
        if (targetIdx < inputs.length) {
            inputs[targetIdx].checked = !!val;
        }
    });

    console.log(`Loaded preset: ${preset.name}`);
}

/**
 * Returns list of presets for UI generation.
 */
export function getPresetList() {
    return Object.keys(PRESETS).map(key => ({
        key,
        name: PRESETS[key].name,
        description: PRESETS[key].description
    }));
}
