'use strict';

/**
 * Measures and reports rendering and simulation performance.
 * Uses a circular buffer of recent frame times to compute rolling FPS.
 * Updates DOM elements periodically to avoid layout thrash.
 */
class PerformanceMonitor {
  constructor(bufferSize = 60) {
    this._buffer = new Float64Array(bufferSize);
    this._bufferSize = bufferSize;
    this._head = 0;
    this._count = 0;
    this._frameStart = 0;
    this._frameEnd = 0;
    this._lastUpdate = 0;
    this._updateInterval = 200;
    this._fps = 60;
    this._frameTime = 16.67;
    this._minFps = 60;
    this._maxFps = 60;
    this._frameCount = 0;
    this._droppedFrames = 0;
    this._targetFps = 60;
    this._targetFrameTime = 1000 / 60;
  }

  /** Called at the start of each animation frame. */
  beginFrame(now) {
    this._frameStart = now;
  }

  /** Called at the end of each animation frame with the same timestamp. */
  endFrame(now) {
    this._frameEnd = now;
    const ft = now - this._frameStart;
    this._frameTime = ft;
    this._buffer[this._head] = ft;
    this._head = (this._head + 1) % this._bufferSize;
    if (this._count < this._bufferSize) this._count++;
    if (ft > this._targetFrameTime * 1.5) this._droppedFrames++;
    this._frameCount++;

    if (now - this._lastUpdate >= this._updateInterval) {
      this._recalculate();
      this._lastUpdate = now;
    }
  }

  /** Recompute FPS statistics from the rolling buffer. */
  _recalculate() {
    if (this._count < 2) return;
    let total = 0, mn = Infinity, mx = 0;
    for (let i = 0; i < this._count; i++) {
      const v = this._buffer[i];
      total += v;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
    const avgFt = total / this._count;
    this._fps = avgFt > 0 ? Math.min(1000 / avgFt, 200) : 0;
    this._minFps = mx > 0 ? Math.min(1000 / mx, 200) : 0;
    this._maxFps = mn > 0 ? Math.min(1000 / mn, 200) : 0;
  }

  /** Rolling average FPS. */
  get fps() { return this._fps; }

  /** Frame time in milliseconds for last frame. */
  get frameTime() { return this._frameTime; }

  /** True if FPS is below warning threshold. */
  get isLagging() { return this._fps < 30; }

  /** True if performance is good (>=50 fps). */
  get isSmooth() { return this._fps >= 50; }

  /** Total animation frames elapsed since init. */
  get frameCount() { return this._frameCount; }

  /** Number of frames that exceeded 1.5x target duration. */
  get droppedFrames() { return this._droppedFrames; }

  /** Min FPS over the rolling buffer window. */
  get minFps() { return this._minFps; }

  /** Max FPS over the rolling buffer window. */
  get maxFps() { return this._maxFps; }

  /** Reset all counters. */
  reset() {
    this._buffer.fill(0);
    this._head = 0;
    this._count = 0;
    this._fps = 60;
    this._frameCount = 0;
    this._droppedFrames = 0;
  }

  /** Return a summary object for debugging. */
  getSummary() {
    return {
      fps: Math.round(this._fps),
      minFps: Math.round(this._minFps),
      maxFps: Math.round(this._maxFps),
      frameTime: this._frameTime.toFixed(2) + 'ms',
      dropped: this._droppedFrames,
      total: this._frameCount
    };
  }
}
