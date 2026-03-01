/**
 * GlowRenderer.js
 * Handles blooming and glow effects for entity rendering.
 */
class GlowRenderer {
    static applyGlow(ctx, color, blur) {
        ctx.shadowColor = color;
        ctx.shadowBlur = blur;
    }
}
