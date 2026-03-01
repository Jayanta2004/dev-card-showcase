/**
 * @file presets.js
 * @description Pre-defined geometric patterns and musical scales for CollisionSynth.
 */

const Presets = (() => {
    /**
     * @typedef {Object} WallData
     * @property {Object} p1 - {x, y} start
     * @property {Object} p2 - {x, y} end
     */

    /**
     * Calculates size based on current window dimensions.
     * Ensures walls stay within the interactable viewport area.
     * @returns {Object} {w, h} dimensions
     */
    const getViewportSize = () => ({
        w: window.innerWidth - 320, // Subtract sidebar
        h: window.innerHeight - 70   // Subtract header
    });

    const standard = () => {
        const { w, h } = getViewportSize();
        const margin = 100;
        return [
            { p1: { x: margin, y: margin }, p2: { x: w - margin, y: margin } },
            { p1: { x: w - margin, y: margin }, p2: { x: w - margin, y: h - margin } },
            { p1: { x: w - margin, y: h - margin }, p2: { x: margin, y: h - margin } },
            { p1: { x: margin, y: h - margin }, p2: { x: margin, y: margin } }
        ];
    };

    const hourglass = () => {
        const { w, h } = getViewportSize();
        const midX = w / 2;
        const midY = h / 2;
        const pad = 80;
        return [
            { p1: { x: pad, y: pad }, p2: { x: w - pad, y: pad } },
            { p1: { x: pad, y: h - pad }, p2: { x: w - pad, y: h - pad } },
            { p1: { x: pad, y: pad }, p2: { x: midX, y: midY } },
            { p1: { x: w - pad, y: pad }, p2: { x: midX, y: midY } },
            { p1: { x: pad, y: h - pad }, p2: { x: midX, y: midY } },
            { p1: { x: w - pad, y: h - pad }, p2: { x: midX, y: midY } }
        ];
    };

    const diamond = () => {
        const { w, h } = getViewportSize();
        const midX = w / 2;
        const midY = h / 2;
        const size = Math.min(w, h) * 0.4;
        return [
            { p1: { x: midX, y: midY - size }, p2: { x: midX + size, y: midY } },
            { p1: { x: midX + size, y: midY }, p2: { x: midX, y: midY + size } },
            { p1: { x: midX, y: midY + size }, p2: { x: midX - size, y: midY } },
            { p1: { x: midX - size, y: midY }, p2: { x: midX, y: midY - size } }
        ];
    };

    const maze = () => {
        const { w, h } = getViewportSize();
        const steps = 6;
        const walls = [];
        for (let i = 1; i < steps; i++) {
            const x = (w / steps) * i;
            const y = (h / steps) * i;
            if (i % 2 === 0) {
                walls.push({ p1: { x: x, y: 0 }, p2: { x: x, y: h * 0.7 } });
            } else {
                walls.push({ p1: { x: x, y: h }, p2: { x: x, y: h * 0.3 } });
            }
        }
        return walls;
    };

    const fractal = () => {
        const { w, h } = getViewportSize();
        const midX = w / 2;
        const midY = h / 2;
        const walls = [];
        const size = 300;

        // Recursive-like snowflake pattern
        const addSection = (cx, cy, s, angle) => {
            const x1 = cx + Math.cos(angle) * s;
            const y1 = cy + Math.sin(angle) * s;
            const x2 = cx + Math.cos(angle + Math.PI * 0.6) * s;
            const y2 = cy + Math.sin(angle + Math.PI * 0.6) * s;
            walls.push({ p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } });
        };

        for (let i = 0; i < 6; i++) {
            addSection(midX, midY, size, (i / 6) * Math.PI * 2);
        }
        return walls;
    };

    const orbit = () => {
        const { w, h } = getViewportSize();
        const midX = w / 2;
        const midY = h / 2;
        const count = 12;
        const r1 = 150;
        const r2 = 350;
        const walls = [];

        for (let i = 0; i < count; i++) {
            const a1 = (i / count) * Math.PI * 2;
            const a2 = ((i + 1) / count) * Math.PI * 2;

            // Inner ring
            walls.push({
                p1: { x: midX + Math.cos(a1) * r1, y: midY + Math.sin(a1) * r1 },
                p2: { x: midX + Math.cos(a2) * r1, y: midY + Math.sin(a2) * r1 }
            });

            // Outter ring segments
            if (i % 2 === 0) {
                walls.push({
                    p1: { x: midX + Math.cos(a1) * r2, y: midY + Math.sin(a1) * r2 },
                    p2: { x: midX + Math.cos(a2) * r2, y: midY + Math.sin(a2) * r2 }
                });
            }
        }
        return walls;
    };

    return {
        standard,
        hourglass,
        diamond,
        maze,
        fractal,
        orbit,
        /**
         * Clears world walls and applies a specific preset by name.
         * @param {string} name 
         * @param {PhysicsWorld} world 
         */
        apply: (name, world) => {
            const data = Presets[name] ? Presets[name]() : Presets.standard();
            world.walls = [];
            data.forEach(d => world.addWall(d.p1.x, d.p1.y, d.p2.x, d.p2.y));
        }
    };
})();
