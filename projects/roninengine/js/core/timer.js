// RoninEngine — core/timer.js  ·  Game-time timer utilities
'use strict';

/**
 * Countdown timer that fires a callback on expiry.
 * Time is tracked in seconds of game-time (affected by slow-mo).
 */
export class Timer {
  constructor(duration = 1, onDone = null, loop = false) {
    this.duration = duration;
    this.onDone   = onDone;
    this.loop     = loop;
    this._elapsed = 0;
    this._running = false;
  }

  start(duration) {
    if (duration !== undefined) this.duration = duration;
    this._elapsed = 0;
    this._running = true;
    return this;
  }

  stop()  { this._running = false; }
  reset() { this._elapsed = 0; this._running = false; }

  /** @param {number} dt  seconds of game-time this frame */
  update(dt) {
    if (!this._running) return false;
    this._elapsed += dt;
    if (this._elapsed >= this.duration) {
      this.onDone?.();
      if (this.loop) this._elapsed -= this.duration;
      else           this._running = false;
      return true;
    }
    return false;
  }

  get elapsed()  { return this._elapsed; }
  get progress() { return Math.min(this._elapsed / this.duration, 1); }
  get done()     { return !this._running && this._elapsed >= this.duration; }
  get running()  { return this._running; }
}

/** Simple periodic ticker – fires every `interval` seconds */
export class Ticker {
  constructor(interval, onTick) {
    this._interval = interval;
    this._accum    = 0;
    this.onTick    = onTick;
  }

  update(dt) {
    this._accum += dt;
    while (this._accum >= this._interval) {
      this._accum -= this._interval;
      this.onTick?.();
    }
  }
}
