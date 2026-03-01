'use strict';
/**
 * TitanFlesh – main entry point.
 * Sets up the fixed-timestep game loop, wires input/UI, and handles keyboard shortcuts.
 */
(function () {
  const FIXED_DT = CFG.FIXED_DT ?? 16.667;
  const MAX_CATCH_UP = CFG.MAX_CATCH_UP ?? 5;

  let titan = null;
  let renderer = null;
  let ui = null;
  let input = null;
  let perfMon = null;

  let lastTime = 0;
  let accumulator = 0;
  let animFrameId = null;
  let running = false;

  /** Initialize all subsystems and start the loop. */
  function init() {
    const canvas = document.getElementById('titanCanvas');
    if (!canvas) { console.error('Canvas not found'); return; }

    renderer = new Renderer(canvas);
    renderer.init();

    titan = new TitanFlesh(canvas);
    titan.build();

    perfMon = new PerformanceMonitor();

    input = new InputHandler(canvas);
    input.onStrike = (x, y, force) => {
      titan.handleStrike(x, y, force);
      const stats = titan.getStats();
      ui?.showStrikeInfo(x, y, force, stats);
    };
    input.onDrag = (x, y, dx, dy, force) => {
      titan.handleDrag(x, y, dx, dy, force);
    };
    input.init();

    ui = new UIManager(titan, renderer);
    ui.init();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    window._tf = {
      titan,
      renderer,
      input,
      ui,
      perf: perfMon,
      reset: () => titan.reset(),
      getStats: () => titan.getStats(),
      togglePressure: () => renderer.togglePressure(),
      toggleDebug: () => renderer.toggleDebug()
    };

    running = true;
    lastTime = performance.now();
    animFrameId = requestAnimationFrame(loop);
    console.info('[TitanFlesh] initialized');
  }

  /** Main game loop using fixed-step physics + uncapped render. */
  function loop(now) {
    if (!running) return;
    animFrameId = requestAnimationFrame(loop);

    const rawDt = Math.min(now - lastTime, FIXED_DT * MAX_CATCH_UP);
    lastTime = now;
    accumulator += rawDt;

    perfMon.beginFrame(now);

    let steps = 0;
    while (accumulator >= FIXED_DT && steps < MAX_CATCH_UP) {
      titan.update(FIXED_DT);
      accumulator -= FIXED_DT;
      steps++;
    }

    const state = titan.buildRenderState();
    renderer.render(state);

    perfMon.endFrame(now);

    if (renderer.frameCount % 6 === 0) {
      const stats = titan.getStats();
      ui.updatePerfPanel(stats, perfMon.fps);
    }
  }

  /** Handle keyboard shortcuts for common actions. */
  function onKeyDown(e) {
    if (e.target && e.target.tagName === 'INPUT') return;
    switch (e.key.toLowerCase()) {
      case 'r':
        titan.reset();
        break;
      case 'p':
        renderer.togglePressure();
        document.getElementById('btnPressure')?.classList.toggle('active', renderer.showPressure);
        break;
      case 'd':
        renderer.toggleDebug();
        document.getElementById('btnMesh')?.classList.toggle('active', renderer.showDebug);
        break;
      case 't':
        titan.tearEnabled = !titan.tearEnabled;
        document.getElementById('btnTearing')?.classList.toggle('active', titan.tearEnabled);
        break;
      case 'w':
        titan.rippleEnabled = !titan.rippleEnabled;
        document.getElementById('btnRipple')?.classList.toggle('active', titan.rippleEnabled);
        break;
      case 'escape':
        running = false;
        if (animFrameId) cancelAnimationFrame(animFrameId);
        break;
      case ' ':
        e.preventDefault();
        if (!running) {
          running = true;
          lastTime = performance.now();
          animFrameId = requestAnimationFrame(loop);
        }
        break;
    }
  }

  /** Handle window resize – update canvas and rebuild entity. */
  function onResize() {
    renderer.resize();
    if (titan && titan.bodies[0]) {
      titan.bodies[0].cfg.cx = renderer.width * 0.5;
      titan.bodies[0].cfg.cy = renderer.height * 0.5;
    }
  }

  /** Stop and clean up. */
  function destroy() {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    input?.destroy();
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', onResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
