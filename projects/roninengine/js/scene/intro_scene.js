// RoninEngine — scene/intro_scene.js  ·  Title / intro splash scene
'use strict';
import { sceneManager } from './scene_manager.js';
import { Events, EV }   from '../core/events.js';

/** Fades in the title card, waits for any key, then transitions to fight */
export const IntroScene = {
  _alpha:    0,
  _phase:    'fadein',  // fadein | hold | fadeout
  _unsub:    null,

  init() {
    this._alpha = 0;
    this._phase = 'fadein';
    this._unsub = Events.on(EV.ROUND_START, () => this._beginFadeOut());
    // Show HTML title overlay if present
    document.getElementById('title-screen')?.classList.remove('hidden');
  },

  _beginFadeOut() {
    this._phase = 'fadeout';
    document.getElementById('title-screen')?.classList.add('hidden');
  },

  update(dt) {
    if (this._phase === 'fadein') {
      this._alpha = Math.min(1, this._alpha + dt * 0.8);
    } else if (this._phase === 'fadeout') {
      this._alpha = Math.max(0, this._alpha - dt * 1.2);
      if (this._alpha <= 0) sceneManager.switchTo('fight');
    }
  },

  render(ctx) {
    const { width: W, height: H } = ctx.canvas;
    ctx.globalAlpha = 1 - this._alpha;
    ctx.fillStyle   = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  },

  destroy() { this._unsub?.(); },
};
