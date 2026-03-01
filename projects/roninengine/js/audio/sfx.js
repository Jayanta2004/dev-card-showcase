// RoninEngine — audio/sfx.js  ·  High-level SFX triggers tied to game events
'use strict';
import { Events, EV } from '../core/events.js';
import { audioEngine }         from './audio.js';
import { playClash, playHit, playSwing } from './synth.js';

export const SFX = {
  init() {
    // Init audio after first user interaction
    const unlock = () => {
      audioEngine.init();
      _bindEvents();
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('pointerdown', unlock);
    };
    document.addEventListener('keydown',    unlock, { once: true });
    document.addEventListener('pointerdown', unlock, { once: true });
  },
};

function _bindEvents() {
  Events.on(EV.BLADE_CLASH,  ()  => playClash());
  Events.on(EV.PLAYER_HIT,   ()  => playHit());
  Events.on(EV.AI_HIT,       ()  => playHit());
  Events.on(EV.PARRY,        ()  => playClash());
  Events.on(EV.PLAYER_DEATH, ()  => playHit());
  Events.on(EV.AI_DEATH,     ()  => playHit());
  // Swing events are emitted directly by samurai.js via Events.emit('swing')
  Events.on('swing',         ()  => playSwing());
}
