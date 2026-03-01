// RoninEngine — scene/results_scene.js  ·  Round results / victory display
'use strict';
import { State }       from '../core/state.js';
import { Events, EV }  from '../core/events.js';
import { sceneManager } from './scene_manager.js';

const DISPLAY_DURATION = 3.5;   // seconds before auto-restart

export const ResultsScene = {
  _timer: 0,
  _winner: '',

  init() {
    this._timer  = 0;
    this._winner = State.lastWinner === 'player' ? 'VICTORY' : 'DEFEAT';
  },

  update(dt) {
    this._timer += dt;
    if (this._timer >= DISPLAY_DURATION) {
      sceneManager.switchTo('fight');
    }
  },

  render(ctx) {
    const { width: W, height: H } = ctx.canvas;
    const fade = Math.min(1, this._timer * 2);
    ctx.globalAlpha = fade;
    ctx.fillStyle   = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    const isVictory  = this._winner === 'VICTORY';
    ctx.font        = 'bold 96px "Cinzel Decorative", serif';
    ctx.fillStyle   = isVictory ? '#FFD700' : '#B22222';
    ctx.shadowColor = isVictory ? '#FF8C00' : '#8B0000';
    ctx.shadowBlur  = 40;
    ctx.fillText(this._winner, W / 2, H / 2 - 40);
    ctx.font        = '28px "Cinzel", serif';
    ctx.fillStyle   = '#ccc';
    ctx.shadowBlur  = 0;
    const pct = Math.min(1, this._timer / DISPLAY_DURATION);
    ctx.fillText(`Restarting…  ${'█'.repeat(Math.floor(pct * 10))}`, W / 2, H / 2 + 60);
    ctx.globalAlpha = 1;
  },

  destroy() {},
};
