// RoninEngine — audio/audio.js  ·  Web Audio API context wrapper
'use strict';

export class AudioEngine {
  constructor() {
    this._ctx    = null;
    this._master = null;
    this._muted  = false;
    this._vol    = 1.0;
  }

  /** Must be called after a user gesture to satisfy autoplay policy */
  init() {
    if (this._ctx) return this;
    this._ctx    = new (window.AudioContext || window.webkitAudioContext)();
    this._master = this._ctx.createGain();
    this._master.connect(this._ctx.destination);
    return this;
  }

  get ctx()    { return this._ctx; }
  get master() { return this._master; }

  /** Create a gain node connected to master */
  gain(value = 1) {
    const g = this._ctx.createGain();
    g.gain.value = value;
    g.connect(this._master);
    return g;
  }

  setVolume(v) {
    this._vol = Math.max(0, Math.min(1, v));
    if (this._master) this._master.gain.value = this._muted ? 0 : this._vol;
  }

  mute()   { this._muted = true;  this._master && (this._master.gain.value = 0); }
  unmute() { this._muted = false; this._master && (this._master.gain.value = this._vol); }
  toggle() { this._muted ? this.unmute() : this.mute(); }

  get currentTime() { return this._ctx?.currentTime ?? 0; }
}

/** Singleton audio engine instance used by sfx.js / synth.js */
export const audioEngine = new AudioEngine();
