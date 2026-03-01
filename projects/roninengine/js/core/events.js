// RoninEngine — core/events.js  ·  Lightweight event bus
'use strict';

const _listeners = new Map();

export const Events = {
  /** Subscribe to an event. Returns unsubscribe function. */
  on(event, fn) {
    if (!_listeners.has(event)) _listeners.set(event, new Set());
    _listeners.get(event).add(fn);
    return () => Events.off(event, fn);
  },

  /** Subscribe once — auto-removes after first fire */
  once(event, fn) {
    const wrapper = (...args) => { fn(...args); Events.off(event, wrapper); };
    return Events.on(event, wrapper);
  },

  /** Unsubscribe */
  off(event, fn) {
    _listeners.get(event)?.delete(fn);
  },

  /** Emit an event with optional payload */
  emit(event, payload) {
    _listeners.get(event)?.forEach(fn => fn(payload));
  },

  /** Remove all listeners for an event */
  clear(event) {
    if (event) _listeners.delete(event);
    else       _listeners.clear();
  },
};

// Pre-defined engine event names
export const EV = {
  PLAYER_HIT    : 'player:hit',
  AI_HIT        : 'ai:hit',
  BLADE_CLASH   : 'blade:clash',
  PARRY         : 'parry',
  PLAYER_DEATH  : 'player:death',
  AI_DEATH      : 'ai:death',
  ROUND_START   : 'round:start',
  ROUND_END     : 'round:end',
  SLOW_MO_ON    : 'slowmo:on',
  SLOW_MO_OFF   : 'slowmo:off',
  TOGGLE_DEBUG  : 'toggle:debug',
  TOGGLE_CLOTH  : 'toggle:cloth',
  TOGGLE_PAUSE  : 'toggle:pause',
};
