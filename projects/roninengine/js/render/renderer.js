// ============================================================
//  RoninEngine — render/renderer.js
//  Main render pipeline: composites all visual layers,
//  debug overlay, HUD, FPS counter
// ============================================================

'use strict';

import { Vec2, clamp, lerp }                from '../core/math.js';
import { CANVAS_W, CANVAS_H, GROUND_Y,
         VFX, DEBUG, COMBAT, SKEL }         from '../core/config.js';
import { State }                             from '../core/state.js';
import { debugDrawSAT }                      from '../engine/sat.js';
import { BackgroundRenderer, BloomEffect,
         drawVignette, drawSlowMoOverlay,
         drawArenaFloor }                    from './effects.js';
import { STANCE }                            from '../entities/samurai.js';

// ─── Renderer ────────────────────────────────────────────────────────────────
export class Renderer {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;

    // Off-screen buffer for bloom source
    this.bloomSrc         = document.createElement('canvas');
    this.bloomSrc.width   = CANVAS_W;
    this.bloomSrc.height  = CANVAS_H;
    this.bloomSrcCtx      = this.bloomSrc.getContext('2d');

    this.bg     = new BackgroundRenderer(canvas);
    this.bloom  = new BloomEffect(CANVAS_W, CANVAS_H, 2);

    // Camera shake
    this.shakeAmt   = 0;
    this.shakeDecay = 12;

    // Screen flash (for death / parry)
    this.flashAlpha  = 0;
    this.flashColor  = '#ffffff';

    this._time = 0;
  }

  // ─── Camera shake ─────────────────────────────────────────

  shake(amount) {
    this.shakeAmt = Math.max(this.shakeAmt, amount);
  }

  flash(color = '#ffffff', alpha = 0.5) {
    this.flashColor = color;
    this.flashAlpha = Math.max(this.flashAlpha, alpha);
  }

  // ─── Main render ──────────────────────────────────────────

  render(dt) {
    this._time += dt;
    const ctx   = this.ctx;
    const W = CANVAS_W, H = CANVAS_H;

    // Decay shake
    if (this.shakeAmt > 0) {
      this.shakeAmt = Math.max(0, this.shakeAmt - this.shakeDecay * dt);
    }
    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 3);
    }

    ctx.save();

    // Apply camera shake
    if (this.shakeAmt > 0.5) {
      const sx = (Math.random() - 0.5) * this.shakeAmt;
      const sy = (Math.random() - 0.5) * this.shakeAmt * 0.6;
      ctx.translate(sx, sy);
    }

    // ── Layer 1: Background ──────────────────────────────────
    this.bg.draw(ctx, this._time);

    // Arena floor grid
    drawArenaFloor(ctx, W, GROUND_Y);

    // ── Layer 2: Entities ────────────────────────────────────
    this._renderEntities(ctx);

    // ── Layer 3: Particles ────────────────────────────────────
    if (State.showSparks || State.showBlood) {
      if (State.particleSystem) {
        State.particleSystem.render(ctx);
      }
    }

    // ── Layer 4: Vignette ────────────────────────────────────
    drawVignette(ctx, W, H);

    // ── Layer 5: Slow-mo tint ────────────────────────────────
    if (State.slowMo) {
      drawSlowMoOverlay(ctx, W, H);
    }

    // ── Layer 6: Screen flash ────────────────────────────────
    if (this.flashAlpha > 0.01) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = this.flashAlpha;
      ctx.fillStyle   = this.flashColor;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    ctx.restore();  // end shake transform

    // ── Layer 7: HUD (no shake) ──────────────────────────────
    this._renderHUD(ctx);

    // ── Layer 8: Debug overlay ────────────────────────────────
    if (State.showDebug) {
      this._renderDebug(ctx);
    }

    // ── Layer 9: FPS ─────────────────────────────────────────
    this._renderFPS(ctx);
  }

  // ─── Entities ─────────────────────────────────────────────

  _renderEntities(ctx) {
    const player = State.player;
    const ai     = State.ai;

    if (!player || !ai) return;

    // Draw back entity first (farther from camera)
    const entities = [
      { e: player, isPlayer: true  },
      { e: ai,     isPlayer: false },
    ];

    for (const { e, isPlayer } of entities) {
      if (!e) continue;
      e.render(ctx, {
        showCloth  : State.showCloth,
        showShadow : State.showShadows,
        showHUD    : false,   // HUD drawn separately below
        color      : VFX.silhouetteColor,
      });
    }
  }

  // ─── HUD ──────────────────────────────────────────────────

  _renderHUD(ctx) {
    const player = State.player;
    const ai     = State.ai;
    if (!player || !ai) return;

    const W = CANVAS_W;
    const barH = 14, barY = 24, margin = 30;
    const barW = W * 0.32;

    ctx.save();
    ctx.font         = 'bold 11px "Courier New", monospace';
    ctx.textBaseline = 'middle';

    // ── Player health bar (left) ───────────────────────────
    this._drawBar(ctx, margin, barY, barW, barH,
      player.health / COMBAT.healthMax, '#cc0000', '#300000',
      'PLAYER', 'left'
    );
    this._drawPosture(ctx, margin, barY + barH + 4, barW, 6,
      player.posture / COMBAT.maxPosture
    );

    // ── AI health bar (right) ──────────────────────────────
    const aiX = W - margin - barW;
    this._drawBar(ctx, aiX, barY, barW, barH,
      ai.health / COMBAT.healthMax, '#cc0000', '#300000',
      'OPPONENT', 'right'
    );
    this._drawPosture(ctx, aiX, barY + barH + 4, barW, 6,
      ai.posture / COMBAT.maxPosture
    );

    // ── Round / match info ────────────────────────────────
    ctx.fillStyle   = 'rgba(200,150,150,0.8)';
    ctx.font        = 'bold 14px "Courier New", monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(`ROUND ${State.round}`, W * 0.5, barY + barH * 0.5);

    // Win pips
    for (let i = 0; i < State.playerWins; i++) {
      ctx.fillStyle = '#cc2200';
      ctx.beginPath();
      ctx.arc(W * 0.5 - 30 + i * 14, barY + barH + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < State.aiWins; i++) {
      ctx.fillStyle = '#cc2200';
      ctx.beginPath();
      ctx.arc(W * 0.5 + 22 + i * 14, barY + barH + 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Match state overlays ─────────────────────────────
    if (State.matchState === 'intro') {
      this._drawOverlayText(ctx, 'PREPARE YOURSELF', W * 0.5, CANVAS_H * 0.38, 32);
    } else if (State.matchState === 'results') {
      const winner = player.dead ? 'OPPONENT WINS' : 'PLAYER WINS';
      this._drawOverlayText(ctx, winner, W * 0.5, CANVAS_H * 0.38, 36);
      this._drawOverlayText(ctx, 'PRESS ENTER TO CONTINUE', W * 0.5, CANVAS_H * 0.48, 15);
    } else if (State.matchState === 'slowkill') {
      this._drawOverlayText(ctx, 'DEATH BLOW', W * 0.5, CANVAS_H * 0.35, 28);
    }

    // ── Stance indicator for player ──────────────────────
    const stanceLabel = this._stanceLabel(player.stance);
    ctx.font      = '10px "Courier New", monospace';
    ctx.fillStyle = 'rgba(200,200,200,0.55)';
    ctx.textAlign = 'left';
    ctx.fillText(stanceLabel, margin, barY + barH + 26);

    ctx.restore();
  }

  _drawBar(ctx, x, y, w, h, fill, filled, bg, label, align) {
    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(x, y, w, h);
    // Fill
    const fillW = clamp(fill, 0, 1) * w;
    const grad  = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#ff4444');
    grad.addColorStop(1, filled);
    ctx.fillStyle = grad;
    if (align === 'right') {
      ctx.fillRect(x + w - fillW, y, fillW, h);
    } else {
      ctx.fillRect(x, y, fillW, h);
    }
    // Border
    ctx.strokeStyle = 'rgba(200,50,50,0.4)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(x, y, w, h);

    // Label
    ctx.fillStyle = 'rgba(255,200,200,0.75)';
    ctx.font      = 'bold 10px "Courier New", monospace';
    ctx.textAlign = align === 'right' ? 'right' : 'left';
    ctx.fillText(label, align === 'right' ? x + w : x, y + h + 1 + (h * 0.5) - 2);
  }

  _drawPosture(ctx, x, y, w, h, fill) {
    ctx.fillStyle = '#111';
    ctx.fillRect(x, y, w, h);
    const yw = clamp(fill, 0, 1) * w;
    const yg  = ctx.createLinearGradient(x, 0, x + w, 0);
    yg.addColorStop(0, '#ffe066');
    yg.addColorStop(1, '#ff8800');
    ctx.fillStyle = yg;
    ctx.fillRect(x, y, yw, h);
    ctx.strokeStyle = 'rgba(255,200,0,0.3)';
    ctx.lineWidth   = 1;
    ctx.strokeRect(x, y, w, h);
  }

  _drawOverlayText(ctx, text, x, y, size) {
    ctx.save();
    ctx.font         = `bold ${size}px "Courier New", monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    // Shadow
    ctx.fillStyle    = 'rgba(0,0,0,0.8)';
    ctx.fillText(text, x + 2, y + 2);
    // Glow
    ctx.shadowBlur   = 20;
    ctx.shadowColor  = '#cc0000';
    ctx.fillStyle    = '#ff4444';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _stanceLabel(stance) {
    const map = {
      idle        : 'READY',
      walk        : 'ADVANCING',
      run         : 'RUNNING',
      attackLight : '⚔ LIGHT STRIKE',
      attackHeavy : '⚔ HEAVY STRIKE',
      block       : '🛡 BLOCKING',
      parry       : '✦ PARRY',
      stagger     : '✖ STAGGERED',
      death       : '☠ FALLEN',
      dash        : '▶ DASH',
    };
    return map[stance] || stance.toUpperCase();
  }

  // ─── Debug overlay ────────────────────────────────────────

  _renderDebug(ctx) {
    const player  = State.player;
    const ai      = State.ai;
    const W = CANVAS_W;

    ctx.save();
    ctx.font         = '11px "Courier New", monospace';
    ctx.textBaseline = 'top';

    // Draw SAT polygons + contact normals
    if (player && ai) {
      const playerKatana = player.katana;
      const aiKatana     = ai.katana;

      if (playerKatana && aiKatana) {
        playerKatana.polygon.update();
        aiKatana.polygon.update();

        const lastContact = State.lastCollisions[0] || null;
        debugDrawSAT(ctx, playerKatana.polygon, aiKatana.polygon, lastContact, {
          axisColor  : DEBUG.axisColor,
          normalColor: DEBUG.normalColor,
        });
      }

      // Draw skeleton joints
      this._debugSkeleton(ctx, player);
      this._debugSkeleton(ctx, ai);

      // Draw cloth particle grid
      if (State.showCloth) {
        this._debugCloth(ctx, player);
        this._debugCloth(ctx, ai);
      }
    }

    // Info panel
    const lines = [
      `FPS: ${State.fps}   Frame: ${State.frameTime.toFixed(1)}ms`,
      `Time: ${State.elapsedTime.toFixed(2)}s  Slow: ${State.slowMo ? '0.25x' : '1.0x'}`,
      `Particles: ${State.particleSystem ? State.particleSystem.count : 0}`,
      `Player → HP:${Math.ceil(player ? player.health : 0)} Post:${Math.ceil(player ? player.posture : 0)}`,
      `AI     → HP:${Math.ceil(ai ? ai.health : 0)} Post:${Math.ceil(ai ? ai.posture : 0)}`,
    ];

    if (State.aiController) {
      const dbg = State.aiController.getDebugInfo();
      lines.push(`AI State: ${dbg.state} | Agr: ${dbg.aggression}`);
      lines.push(`Pending: ${dbg.pending} | Dist: ${dbg.dist}`);
    }

    ctx.fillStyle   = 'rgba(0,0,0,0.65)';
    ctx.fillRect(8, CANVAS_H - lines.length * 16 - 14, 310, lines.length * 16 + 10);

    ctx.fillStyle = DEBUG.textColor;
    lines.forEach((l, i) => {
      ctx.fillText(l, 14, CANVAS_H - lines.length * 16 - 6 + i * 16);
    });

    ctx.restore();
  }

  _debugSkeleton(ctx, samurai) {
    if (!samurai) return;
    ctx.save();
    ctx.strokeStyle = DEBUG.skeletonColor + '88';
    ctx.lineWidth   = 1;

    const pos = samurai.skeleton.positions;
    for (const [name, p] of Object.entries(pos)) {
      if (!p) continue;
      ctx.fillStyle = DEBUG.skeletonColor;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(68,136,255,0.5)';
      ctx.fillText(name, p.x + 4, p.y - 4);
    }
    ctx.restore();
  }

  _debugCloth(ctx, samurai) {
    if (!samurai || !samurai.robe) return;
    ctx.save();
    ctx.strokeStyle = DEBUG.clothColor + '66';
    ctx.lineWidth   = 0.5;

    for (const c of samurai.robe.constraints) {
      ctx.beginPath();
      ctx.moveTo(c.a.pos.x, c.a.pos.y);
      ctx.lineTo(c.b.pos.x, c.b.pos.y);
      ctx.stroke();
    }

    ctx.fillStyle = DEBUG.clothColor;
    for (const p of samurai.robe.particles) {
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.pinned ? 3 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── FPS counter ──────────────────────────────────────────

  _renderFPS(ctx) {
    const fps = State.fpsSmoothed || State.fps;
    const col = fps >= 55 ? '#44ff88' : fps >= 30 ? '#ffee44' : '#ff4444';
    ctx.save();
    ctx.font         = 'bold 12px "Courier New", monospace';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle    = 'rgba(0,0,0,0.55)';
    ctx.fillRect(CANVAS_W - 74, 6, 68, 18);
    ctx.fillStyle    = col;
    ctx.fillText(`${Math.round(fps)} FPS`, CANVAS_W - 8, 9);
    ctx.restore();
  }
}
