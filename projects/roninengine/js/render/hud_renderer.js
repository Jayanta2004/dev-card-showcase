// RoninEngine — render/hud_renderer.js  ·  Renders health / posture bars + round info
'use strict';
import { HUD }        from '../ui/hud.js';
import { CANVAS_W, CANVAS_H } from '../core/config.js';

const BAR_W   = 280;
const BAR_H   = 14;
const POST_H  = 8;
const PAD     = 24;
const BAR_Y   = 36;

export function renderHUD(ctx) {
  ctx.save();

  // ── Player (left) ──────────────────────────────────────────────
  _drawHealthBar(ctx, PAD, BAR_Y, BAR_W, BAR_H,
    HUD.playerHP / 100, HUD.playerFlash, false);
  _drawPostureBar(ctx, PAD, BAR_Y + BAR_H + 4, BAR_W, POST_H,
    HUD.playerPosture / 100, '#4af');

  // ── AI (right, mirrored) ───────────────────────────────────────
  _drawHealthBar(ctx, CANVAS_W - PAD - BAR_W, BAR_Y, BAR_W, BAR_H,
    HUD.aiHP / 100, HUD.aiFlash, true);
  _drawPostureBar(ctx, CANVAS_W - PAD - BAR_W, BAR_Y + BAR_H + 4, BAR_W, POST_H,
    HUD.aiPosture / 100, '#f44');

  // ── Round label ────────────────────────────────────────────────
  ctx.font        = '16px "Cinzel", serif';
  ctx.textAlign   = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle   = 'rgba(220,200,150,0.9)';
  ctx.fillText(`ROUND ${HUD.round}`, CANVAS_W / 2, BAR_Y + BAR_H / 2);

  ctx.restore();
}

function _drawHealthBar(ctx, x, y, w, h, pct, flash, rtl) {
  const fp = Math.max(0, Math.min(1, pct));
  const hue = fp > 0.5 ? 120 : fp > 0.25 ? 60 : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = flash > 0
    ? `rgba(255,255,255,${flash})`
    : `hsl(${hue},80%,45%)`;
  const fw = w * fp;
  ctx.fillRect(rtl ? x + w - fw : x, y, fw, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(x, y, w, h);
}

function _drawPostureBar(ctx, x, y, w, h, pct, color) {
  const fp = Math.max(0, Math.min(1, pct));
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * fp, h);
  if (fp >= 0.95) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.6 + Math.sin(Date.now() * 0.01) * 0.4;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }
}
