// RoninEngine — ui/hud.js  ·  HUD state model (data only, render is in hud_renderer.js)
'use strict';
import { State }      from '../core/state.js';
import { Events, EV } from '../core/events.js';

const _flash = { player: 0, ai: 0 };

export const HUD = {
  init() {
    Events.on(EV.PLAYER_HIT, () => { _flash.player = 0.4; });
    Events.on(EV.AI_HIT,     () => { _flash.ai     = 0.4; });
  },

  update(dt) {
    _flash.player = Math.max(0, _flash.player - dt * 2.5);
    _flash.ai     = Math.max(0, _flash.ai     - dt * 2.5);
  },

  get playerFlash() { return _flash.player; },
  get aiFlash()     { return _flash.ai; },

  get playerHP()      { return State.player?.health  ?? 100; },
  get playerPosture() { return State.player?.posture  ?? 0; },
  get aiHP()          { return State.ai?.health       ?? 100; },
  get aiPosture()     { return State.ai?.posture       ?? 0; },
  get round()         { return State.round             ?? 1; },
  get slowMo()        { return State.slowMo            ?? false; },
};
