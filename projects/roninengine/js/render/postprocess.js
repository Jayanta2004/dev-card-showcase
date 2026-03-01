// RoninEngine — render/postprocess.js  ·  Post-processing pipeline manager
'use strict';
import { CANVAS_W, CANVAS_H } from '../core/config.js';

/**
 * Manages an off-screen canvas for multi-pass post-processing.
 * Usage:
 *   pp.begin(mainCtx)    ← starts capturing to off-screen buffer
 *   ... draw scene ...
 *   pp.end()             ← apply effects and blit to mainCtx
 */
export class PostProcess {
  constructor() {
    this._buf  = document.createElement('canvas');
    this._buf.width  = CANVAS_W;
    this._buf.height = CANVAS_H;
    this._bctx  = this._buf.getContext('2d');
    this._passes = [];
  }

  /** Add a post-process pass function: (ctx, offscreenCanvas) => void */
  addPass(fn) { this._passes.push(fn); return this; }

  /** Redirect drawing to the off-screen buffer */
  begin() {
    this._bctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    return this._bctx;
  }

  /** Blit buffer to the main context and run all passes */
  end(mainCtx) {
    if (!this._passes.length) {
      mainCtx.drawImage(this._buf, 0, 0);
      return;
    }
    for (const pass of this._passes) pass(mainCtx, this._buf);
  }

  /** Built-in: simple desaturation pass */
  static desaturate(mainCtx, src, amount = 0.5) {
    mainCtx.save();
    mainCtx.drawImage(src, 0, 0);
    mainCtx.globalCompositeOperation = 'saturation';
    mainCtx.fillStyle = `rgba(128,128,128,${amount})`;
    mainCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    mainCtx.restore();
  }

  /** Built-in: colour-tint overlay */
  static tint(mainCtx, src, color = 'rgba(180,0,0,0.08)') {
    mainCtx.drawImage(src, 0, 0);
    mainCtx.save();
    mainCtx.globalCompositeOperation = 'multiply';
    mainCtx.fillStyle = color;
    mainCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    mainCtx.restore();
  }
}
