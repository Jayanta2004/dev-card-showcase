'use strict';
class UIManager {
  constructor(sim, renderer) {
    this._sim = sim; this._renderer = renderer;
    this._strikeTimer = null; this._tooltip = null; this._tooltipTimer = null;
  }
  init() {
    this._tooltip = document.getElementById('tooltip');
    this._bindButtons(); this._bindSliders(); this._bindTooltips();
  }
  _bindButtons() {
    this._bind('btnPressure', () => {
      const on = this._renderer.togglePressure();
      this._setActive('btnPressure', on);
    });
    this._bind('btnMesh', () => {
      const on = this._renderer.toggleDebug();
      this._setActive('btnMesh', on);
    });
    this._bind('btnTearing', () => {
      this._sim.tearEnabled = !this._sim.tearEnabled;
      this._setActive('btnTearing', this._sim.tearEnabled);
    });
    this._bind('btnRipple', () => {
      this._sim.rippleEnabled = !this._sim.rippleEnabled;
      this._setActive('btnRipple', this._sim.rippleEnabled);
    });
    this._bind('btnReset', () => {
      this._sim.reset();
      document.querySelectorAll('.ctrlBtn.active').forEach(b => {
        if (b.id !== 'btnTearing' && b.id !== 'btnRipple' && b.id !== 'btnPressure') b.classList.remove('active');
      });
    });
  }
  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  }
  _setActive(id, active) {
    const el = document.getElementById(id);
    if (el) { if (active) el.classList.add('active'); else el.classList.remove('active'); }
  }
  _bindSliders() {
    this._bindSlider('strikeForce', 'strikeForceVal', (v) => {
      this._sim.strikePower = v;
    }, 1, 10, .1, v => v.toFixed(1));
    this._bindSlider('viscosity', 'viscosityVal', (v) => {
      if (this._sim.bodies && this._sim.bodies[0]) this._sim.bodies[0].setDamping(v);
    }, .9, .999, .001, v => v.toFixed(3));
    this._bindSlider('pressureStrength', 'pressureStrengthVal', (v) => { }, 0.1, 5.0, .1, v => v.toFixed(1));
  }
  _bindSlider(id, valId, onChange, min, max, step, fmt) {
    const sl = document.getElementById(id), vl = document.getElementById(valId);
    if (!sl) return;
    sl.min = min; sl.max = max; sl.step = step;
    sl.addEventListener('input', () => {
      const v = parseFloat(sl.value);
      if (vl) vl.textContent = fmt ? fmt(v) : (v + '');
      onChange(v);
    });
  }
  _bindTooltips() {
    document.querySelectorAll('[data-tip]').forEach(el => {
      el.addEventListener('mouseenter', e => {
        const tip = el.getAttribute('data-tip');
        if (!tip || !this._tooltip) return;
        this._tooltip.textContent = tip; this._tooltip.classList.remove('hidden');
        this._positionTooltip(e.clientX, e.clientY);
      });
      el.addEventListener('mousemove', e => this._positionTooltip(e.clientX, e.clientY));
      el.addEventListener('mouseleave', () => { if (this._tooltip) this._tooltip.classList.add('hidden'); });
    });
  }
  _positionTooltip(cx, cy) {
    if (!this._tooltip) return;
    const tt = this._tooltip, tw = tt.offsetWidth, th = tt.offsetHeight;
    let tx = cx + 14, ty = cy - th - 6;
    if (tx + tw > window.innerWidth - 8) tx = cx - tw - 14;
    if (ty < 4) ty = cy + 10;
    tt.style.left = tx + 'px'; tt.style.top = ty + 'px';
  }
  showStrikeInfo(x, y, force, stats) {
    const panel = document.getElementById('strikeInfo');
    if (!panel) return;
    const fi = document.getElementById('strikeForceDisplay'), ti = document.getElementById('strikeTearDisplay'), ri = document.getElementById('strikeRippleDisplay');
    if (fi) fi.textContent = (force).toFixed(1);
    if (ti && stats) ti.textContent = stats.tears + '';
    if (ri && stats) ri.textContent = stats.mutations + '';
    panel.classList.remove('hidden');
    clearTimeout(this._strikeTimer);
    this._strikeTimer = setTimeout(() => panel.classList.add('hidden'), 1600);
  }
  updatePerfPanel(stats, fps) {
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    const fpsEl = document.getElementById('fpsStat');
    if (fpsEl) {
      fpsEl.textContent = Math.round(fps) + '';
      fpsEl.className = 'perfVal' + (fps < 30 ? ' crit' : fps < 50 ? ' warn' : '');
    }
    set('frameStat', this._renderer ? this._renderer.frameCount : 0);
    if (stats) {
      set('particleStat', stats.particles);
      set('springStat', stats.springs);
      set('triStat', stats.triangles);
      set('tearStat', stats.tears);
      set('pressureStat', (stats.pressure * 100).toFixed(0) + '%');
      set('areaStat', stats.mutations);
    }
  }
}
