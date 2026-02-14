/**
 * @file genome.js
 * @package GeneticUI.Core
 * @description 
 * The Genome class is the single source of truth for an individual's design phenotype.
 * It uses a "Gene-to-Token" mapping strategy where numeric and categorical traits
 * (the genotype) are translated into CSS custom properties (the phenotype).
 * 
 * DESIGN PRINCIPLES:
 * 1. Encapsulation: All design tokens for a single layout are contained within this class.
 * 2. Determinism: A given set of traits will always produce the exact same visual output.
 * 3. Gradient Logic: Supports multi-stop linear and radial gradients derived from primary/secondary genes.
 * 4. Lineage Tracking: Every genome maintains a reference to its primary parent.
 * 
 * @author GeneticUI Lab
 * @version 2.0.0
 */

/**
 * DNA representing a unique UI configuration.
 * Each instance generates a unique 9-character ID for population indexing.
 */
class Genome {
    /**
     * @constructor
     * @param {Object} properties - Initial traits for the genome. If incomplete, defaults are randomized.
     * @param {string} [parentId=null] - ID of the primary parent for lineage tracking.
     */
    constructor(properties = {}, parentId = null) {
        /** 
         * @property {string} id 
         * Unique identifier generated at "birth". Used for DOM binding and selection sets.
         */
        this.id = 'g-' + Math.random().toString(36).substr(2, 9);

        /** 
         * @property {string|null} parentId 
         * Reference to the parent genome. Enables lineage tree visualization and ancestry analysis.
         */
        this.parentId = parentId;

        /** 
         * @property {number} generation 
         * The evolutionary iteration this genome belongs to. Incremented during breeding.
         */
        this.generation = properties.generation || 1;

        /** 
         * @property {number} birthTime 
         * Epoch timestamp of creation. Used for sorting in the Genetic Memory gallery.
         */
        this.birthTime = Date.now();

        /** 
         * @property {Object} lockedTraits 
         * A map of trait keys to boolean flags. Locked traits are protected from 
         * crossover and mutation in the Sandbox mode.
         */
        this.lockedTraits = properties.lockedTraits || {};

        /** 
         * @property {Object} traits 
         * The core Gene set. These variables define the aesthetic boundaries of the evolved UI.
         */
        this.traits = {
            // --- COLOR SYSTEM (HSL) ---
            primaryHue: properties.primaryHue ?? this.rand(0, 360),
            primarySaturation: properties.primarySaturation ?? this.rand(30, 90),
            primaryLightness: properties.primaryLightness ?? this.rand(40, 70),

            secondaryHue: properties.secondaryHue ?? this.rand(0, 360),
            secondarySaturation: properties.secondarySaturation ?? this.rand(20, 80),

            accentHue: properties.accentHue ?? this.rand(0, 360),

            bgHue: properties.bgHue ?? this.rand(0, 360),
            bgSaturation: properties.bgSaturation ?? this.rand(0, 20),
            bgLightness: properties.bgLightness ?? this.rand(5, 15), // Default dark

            darkTheme: properties.darkTheme ?? true,
            highContrast: properties.highContrast ?? (Math.random() > 0.8),

            // --- GRADIENT LOGIC ---
            useGradients: properties.useGradients ?? (Math.random() > 0.4),
            gradientAngle: properties.gradientAngle ?? this.rand(0, 360),
            gradientType: properties.gradientType ?? this.choice(['linear', 'radial']),

            // --- TYPOGRAPHY ---
            fontFamilyH: properties.fontFamilyH ?? this.choice(['"Outfit", sans-serif', '"Inter", sans-serif', '"JetBrains Mono", monospace']),
            fontFamilyB: properties.fontFamilyB ?? this.choice(['"Inter", sans-serif', 'system-ui', 'serif']),
            baseFontSize: properties.baseFontSize ?? this.rand(14, 22),
            lineHeight: properties.lineHeight ?? (1.2 + Math.random() * 0.6).toFixed(2),
            letterSpacing: properties.letterSpacing ?? (Math.random() * 4 - 1).toFixed(2),
            fontWeightH: properties.fontWeightH ?? this.choice([300, 400, 600, 800]),
            textTransformH: properties.textTransformH ?? this.choice(['none', 'uppercase', 'capitalize']),

            // --- SPACING & GEOMETRY ---
            borderRadius: properties.borderRadius ?? this.rand(0, 40),
            innerRadius: properties.innerRadius ?? this.rand(0, 12),
            paddingBase: properties.paddingBase ?? (0.5 + Math.random() * 1.5).toFixed(2),
            containerGap: properties.containerGap ?? (0.5 + Math.random() * 2.5).toFixed(2),
            borderWidth: properties.borderWidth ?? this.rand(0, 4),

            // --- VISUAL EFFECTS ---
            glassmorphism: properties.glassmorphism ?? (Math.random() > 0.5),
            blurIntensity: properties.blurIntensity ?? this.rand(0, 20),
            shadowIntensity: properties.shadowIntensity ?? Math.random().toFixed(2),
            shadowColorOpacity: properties.shadowColorOpacity ?? Math.random().toFixed(2),
            noiseOverlay: properties.noiseOverlay ?? (Math.random() > 0.7),
            borderGlow: properties.borderGlow ?? (Math.random() > 0.6),

            // --- LAYOUT ARCHETYPES ---
            layoutType: properties.layoutType ?? this.choice(['landing', 'dashboard', 'profile', 'feed']),
            heroAlign: properties.heroAlign ?? this.choice(['flex-start', 'center', 'flex-end']),
            navPosition: properties.navPosition ?? this.choice(['top', 'side', 'none']),
            cardStyle: properties.cardStyle ?? this.choice(['flat', 'elevated', 'glass', 'outline']),
            contentDensity: properties.contentDensity ?? this.choice(['compact', 'medium', 'spacious']),

            // --- ANIMATION TIMING ---
            transitionSpeed: properties.transitionSpeed ?? (0.2 + Math.random() * 0.8).toFixed(2),
            cubicBezier: properties.cubicBezier ?? this.choice(['ease', 'linear', 'cubic-bezier(0.23, 1, 0.32, 1)', 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'])
        };
    }

    /**
     * Random number generator helper.
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Random choice helper.
     * @param {Array<any>} options 
     * @returns {any}
     */
    choice(options) {
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Toggles a trait lock.
     * @param {string} trait 
     */
    toggleLock(trait) {
        this.lockedTraits[trait] = !this.lockedTraits[trait];
    }

    /**
     * Generates a CSS variable map for rendering.
     * Handles color derivation and layout projection.
     * @returns {Object} Map of CSS property names to values.
     */
    getStyleMap() {
        const t = this.traits;

        // Color derivation
        const pColor = `hsl(${t.primaryHue}, ${t.primarySaturation}%, ${t.primaryLightness}%)`;
        const sColor = `hsl(${t.secondaryHue}, ${t.secondarySaturation}%, 50%)`;
        const aColor = `hsl(${t.accentHue}, 90%, 60%)`;

        let bgColor, textColor, cardBg;

        if (t.darkTheme) {
            bgColor = `hsl(${t.bgHue}, ${t.bgSaturation}%, ${t.bgLightness}%)`;
            textColor = t.highContrast ? '#ffffff' : '#e0e0e0';
            cardBg = `rgba(255, 255, 255, ${t.glassmorphism ? 0.05 : 0.03})`;
        } else {
            bgColor = `hsl(${t.bgHue}, 10%, 96%)`;
            textColor = t.highContrast ? '#000000' : '#202020';
            cardBg = `rgba(0, 0, 0, ${t.glassmorphism ? 0.03 : 0.01})`;
        }

        const gradient = t.useGradients ?
            `${t.gradientType}-gradient(${t.gradientAngle}deg, ${pColor}, ${sColor})` :
            pColor;

        return {
            '--p-color': pColor,
            '--s-color': sColor,
            '--a-color': aColor,
            '--bg-color': bgColor,
            '--txt-color': textColor,
            '--card-bg': cardBg,
            '--gradient': gradient,
            '--font-h': t.fontFamilyH,
            '--font-b': t.fontFamilyB,
            '--fz-base': `${t.baseFontSize}px`,
            '--lh': t.lineHeight,
            '--ls': `${t.letterSpacing}px`,
            '--fw-h': t.fontWeightH,
            '--tt-h': t.textTransformH,
            '--br': `${t.borderRadius}px`,
            '--ir': `${t.innerRadius}px`,
            '--pad': `${t.paddingBase}rem`,
            '--gap': `${t.containerGap}rem`,
            '--bw': `${t.borderWidth}px`,
            '--blur': t.glassmorphism ? `${t.blurIntensity}px` : '0px',
            '--shd': `0 ${t.shadowIntensity * 15}px ${t.shadowIntensity * 30}px rgba(0,0,0,${t.shadowColorOpacity * 0.5})`,
            '--trans': `${t.transitionSpeed}s ${t.cubicBezier}`,
            '--hero-aln': t.heroAlign
        };
    }

    /**
     * Serializes genome for persistent storage or export.
     * @returns {string} JSON representation of the genome.
     */
    serialize() {
        return JSON.stringify({
            traits: this.traits,
            lockedTraits: this.lockedTraits,
            parentId: this.parentId,
            generation: this.generation
        });
    }

    /**
     * Deserializes a genome string.
     * @param {string} json 
     * @returns {Genome}
     */
    static deserialize(json) {
        const data = JSON.parse(json);
        const g = new Genome(data.traits, data.parentId);
        g.lockedTraits = data.lockedTraits || {};
        g.generation = data.generation || 1;
        return g;
    }
}
