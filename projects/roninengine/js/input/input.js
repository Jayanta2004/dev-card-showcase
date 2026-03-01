// RoninEngine — input/input.js  ·  Centralised keyboard + pointer input manager
'use strict';
import { Events, EV } from '../core/events.js';

const _held   = new Set();
const _down   = new Set();
const _up     = new Set();
const _axes   = { x: 0, y: 0 };  // analogue left-stick equivalent

export const Input = {
  init() {
    window.addEventListener('keydown', e => {
      if (!_held.has(e.code)) _down.add(e.code);
      _held.add(e.code);
      _dispatch(e.code, true);
    });
    window.addEventListener('keyup', e => {
      _up.add(e.code);
      _held.delete(e.code);
      _dispatch(e.code, false);
    });
  },

  /** Call once per frame BEFORE reading input, AFTER flushing */
  flush() {
    _down.clear();
    _up.clear();
  },

  isHeld  : code => _held.has(code),
  isDown  : code => _down.has(code),
  isUp    : code => _up.has(code),

  /** Synthesised directional axis from WASD / Arrows */
  getAxis() {
    _axes.x = (Input.isHeld('ArrowRight') || Input.isHeld('KeyD') ? 1 : 0)
            - (Input.isHeld('ArrowLeft')  || Input.isHeld('KeyA') ? 1 : 0);
    _axes.y = (Input.isHeld('ArrowDown')  || Input.isHeld('KeyS') ? 1 : 0)
            - (Input.isHeld('ArrowUp')    || Input.isHeld('KeyW') ? 1 : 0);
    return _axes;
  },

  /** Inject a virtual key press (used by touch controls) */
  virtualDown(code) { if (!_held.has(code)) _down.add(code); _held.add(code); },
  virtualUp(code)   { _up.add(code); _held.delete(code); },
};

function _dispatch(code, pressed) {
  if (code === 'KeyP')       Events.emit(EV.TOGGLE_PAUSE);
  if (code === 'F1' && !pressed) Events.emit(EV.TOGGLE_DEBUG);
}
