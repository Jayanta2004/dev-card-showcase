// RoninEngine — ui/menu.js  ·  Pause menu controller
'use strict';
import { Events, EV } from '../core/events.js';
import { State }       from '../core/state.js';

const _el = () => document.getElementById('pause-menu');

export const Menu = {
  init() {
    Events.on(EV.TOGGLE_PAUSE, () => this.toggle());
    _el()?.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => this._handleAction(btn.dataset.action));
    });
  },

  show() {
    State.paused = true;
    _el()?.classList.remove('hidden');
  },

  hide() {
    State.paused = false;
    _el()?.classList.add('hidden');
  },

  toggle() { State.paused ? this.hide() : this.show(); },

  _handleAction(action) {
    switch (action) {
      case 'resume': this.hide(); break;
      case 'restart': this.hide(); Events.emit(EV.ROUND_START); break;
    }
  },
};
