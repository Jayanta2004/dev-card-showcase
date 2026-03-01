// RoninEngine — input/gamepad.js  ·  Gamepad API wrapper
'use strict';
import { Input } from './input.js';

const BUTTON_MAP = {
  0: 'GamepadA', 1: 'GamepadB', 2: 'GamepadX', 3: 'GamepadY',
  4: 'GamepadLB', 5: 'GamepadRB',
};
const AXIS_DEAD = 0.15;

export const Gamepad = {
  _pad: null,

  poll() {
    const pads = navigator.getGamepads?.();
    if (!pads) return;
    for (const pad of pads) if (pad?.connected) { this._pad = pad; break; }
    if (!this._pad) return;

    this._pad.buttons.forEach((btn, i) => {
      const code = BUTTON_MAP[i];
      if (!code) return;
      if (btn.pressed) Input.virtualDown(code);
      else             Input.virtualUp(code);
    });

    // Left stick → virtual WASD
    const ax = this._pad.axes[0] ?? 0;
    const ay = this._pad.axes[1] ?? 0;
    if (ax >  AXIS_DEAD) Input.virtualDown('KeyD'); else Input.virtualUp('KeyD');
    if (ax < -AXIS_DEAD) Input.virtualDown('KeyA'); else Input.virtualUp('KeyA');
    if (ay < -AXIS_DEAD) Input.virtualDown('KeyW'); else Input.virtualUp('KeyW');
    if (ay >  AXIS_DEAD) Input.virtualDown('KeyS'); else Input.virtualUp('KeyS');
  },

  get connected() { return !!this._pad?.connected; },
};
