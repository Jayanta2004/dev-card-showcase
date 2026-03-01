'use strict';

class Renderer {
  constructor(canvas) {
    /** @type {HTMLCanvasElement} */
    this.canvas = canvas;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = canvas.getContext('2d');

    /** @type {BackgroundRenderer} */
    this._bg       = new BackgroundRenderer();
    /** @type {MeshRenderer} */
    this._mesh     = new MeshRenderer(canvas);
    /** @type {PressureRenderer} */
    this._pressure = new PressureRenderer();
    /** @type {DebugRenderer} */
    this._debug    = new DebugRenderer();

    this._showPressure = false;
    this._showDebug    = false;

    this._time        = 0;
    this._frameCount  = 0;
    this._lastResize  = 0;
    this._globalAlpha = 1;
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this._onWindowResize());
  }

  _onWindowResize() {
    const now = Date.now();
    if (now - this._lastResize < 50) return;
    this._lastResize = now;
    this.resize();
  }

  resize(w, h) {
    const newW = Math.max(320, w ?? window.innerWidth);
    const newH = Math.max(240, h ?? window.innerHeight);

    if (this.canvas.width === newW && this.canvas.height === newH) return;

    this.canvas.width        = newW;
    this.canvas.height       = newH;
    this.canvas.style.width  = '100vw';
    this.canvas.style.height = '100vh';

    this._mesh.resize(newW, newH);
  }

  /**
   * Composite all rendering layers in order onto the canvas.
   */
  render(state) {
    const ctx = this.ctx;
    const w   = this.canvas.width;
    const h   = this.canvas.height;

    this._time = state?.time ?? (this._time + 16);
    this._frameCount++;

    // Clear
    ctx.clearRect(0, 0, w, h);

    if (this._globalAlpha !== 1) {
      ctx.globalAlpha = this._globalAlpha;
    }

    // Layer 1: animated void background
    this._bg.render(ctx, this._time);

    if (state) {
      // Layer 2: flesh mesh
      this._mesh.render(ctx, state);

      // Layer 3 (optional): pressure heatmap
      if (this._showPressure) {
        this._pressure.render(ctx, state);
      }

      // Layer 4 (optional): debug overlay
      if (this._showDebug) {
        this._debug.render(ctx, state);
      }
    }

    if (this._globalAlpha !== 1) {
      ctx.globalAlpha = 1;
    }
  }

  /**
   * Toggle the pressure heatmap layer.
   */
  togglePressure() {
    this._showPressure = !this._showPressure;
    return this._showPressure;
  }

  /**
   * Toggle the debug overlay layer.
   */
  toggleDebug() {
    this._showDebug = !this._showDebug;
    return this._showDebug;
  }

  /**
   * Explicitly set canvas dimensions (bypasses debounce).
   */
  setSize(w, h) {
    this.canvas.width  = w;
    this.canvas.height = h;
    this._mesh.resize(w, h);
  }

  setGlobalAlpha(a) {
    this._globalAlpha = MathUtils.clamp(a, 0, 1);
  }

  /**
   * Capture the current frame as a data URL (for debug snapshots).
   */
  captureFrame() {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Return metadata about the active rendering layers.
   */
  getLayerInfo() {
    return {
      pressure:   this._showPressure,
      debug:      this._showDebug,
      frameCount: this._frameCount,
      size: { w: this.canvas.width, h: this.canvas.height }
    };
  }

  // ---- Accessors ----

  /** @returns {number} Current canvas width. */
  get width()        { return this.canvas.width; }
  /** @returns {number} Current canvas height. */
  get height()       { return this.canvas.height; }
  /** @returns {boolean} Whether pressure heatmap is visible. */
  get showPressure() { return this._showPressure; }
  /** @returns {boolean} Whether debug overlay is visible. */
  get showDebug()    { return this._showDebug; }
  /** @returns {number} Total frames rendered so far. */
  get frameCount()   { return this._frameCount; }
}
