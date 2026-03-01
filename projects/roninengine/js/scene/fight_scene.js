// RoninEngine — scene/fight_scene.js  ·  Active duel scene (delegates to main game objects)
'use strict';
import { Events, EV } from '../core/events.js';
import { State }       from '../core/state.js';

/**
 * The fight scene owns the core update / render dispatch.
 * Actual logic lives in entities / renderer — this is the coordinator.
 */
export const FightScene = {
  _unsub: [],

  init() {
    State.resetRound();
    this._unsub.push(
      Events.on(EV.PLAYER_DEATH, () => _endRound('ai')),
      Events.on(EV.AI_DEATH,     () => _endRound('player')),
    );
    Events.emit(EV.ROUND_START);
  },

  update(dt) {
    if (State.paused) return;
    // Delegation: samurai + controller + particles are updated by main.js game loop
    // This scene's update hook is available for scene-level logic (e.g., time limit)
  },

  render(/* ctx */) {
    // Full render is handled by Renderer.render() in main.js
  },

  destroy() {
    this._unsub.forEach(fn => fn());
    this._unsub = [];
  },
};

function _endRound(winner) {
  State.lastWinner = winner;
  Events.emit(EV.ROUND_END, { winner });
  import('./scene_manager.js').then(({ sceneManager }) => {
    sceneManager.switchTo('results');
  });
}
