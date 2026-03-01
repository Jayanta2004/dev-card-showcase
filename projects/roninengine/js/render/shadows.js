// RoninEngine — render/shadows.js  ·  Silhouette drop-shadow renderer
'use strict';
import { GROUND_Y } from '../core/config.js';

const SHADOW_COLOR  = 'rgba(0,0,0,0.35)';
const SHADOW_BLUR   = 14;

/**
 * Render a stylised shadow beneath a samurai silhouette.
 * Draws an elliptical ground shadow at the samurai's feet.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} footX    World X of the character's mid-foot
 * @param {number} footY    World Y of the character's mid-foot
 * @param {number} scale    0–1, tie to character scale
 * @param {number} alpha    overall shadow opacity multiplier
 */
export function drawGroundShadow(ctx, footX, footY, scale = 1, alpha = 1) {
  const rx = 38 * scale;
  const ry = 10 * scale;
  ctx.save();
  ctx.globalAlpha  = 0.35 * alpha;
  ctx.shadowColor  = 'transparent';
  ctx.shadowBlur   = 0;
  ctx.fillStyle    = SHADOW_COLOR;
  ctx.beginPath();
  ctx.ellipse(footX, GROUND_Y + 2, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw a semi-transparent canvas-blur shadow of any drawn shape.
 * Wrap the shape drawing call: shadow(ctx, () => { drawShape(); })
 */
export function castShadow(ctx, drawFn, offsetX = 6, offsetY = 8) {
  ctx.save();
  ctx.shadowOffsetX = offsetX;
  ctx.shadowOffsetY = offsetY;
  ctx.shadowColor   = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur    = SHADOW_BLUR;
  drawFn(ctx);
  ctx.restore();
}
