// RoninEngine — scene/scene_manager.js  ·  Scene stack controller
'use strict';

/** A Scene must implement: init(), update(dt), render(ctx), destroy() */
export class SceneManager {
  constructor() {
    this._scenes = new Map();
    this._current = null;
  }

  register(name, scene) {
    this._scenes.set(name, scene);
    return this;
  }

  async switchTo(name, ...args) {
    await this._current?.destroy?.();
    const scene = this._scenes.get(name);
    if (!scene) throw new Error(`SceneManager: unknown scene "${name}"`);
    this._current = scene;
    await scene.init?.(...args);
  }

  update(dt) { this._current?.update?.(dt); }
  render(ctx) { this._current?.render?.(ctx); }

  get name() {
    for (const [k, v] of this._scenes) if (v === this._current) return k;
    return null;
  }
}

export const sceneManager = new SceneManager();
