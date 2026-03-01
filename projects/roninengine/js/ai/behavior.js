// RoninEngine — ai/behavior.js  ·  Re-usable behaviour-tree leaf nodes
'use strict';

export const BT_STATUS = { SUCCESS: 'success', FAILURE: 'failure', RUNNING: 'running' };

/** Base class for all BT nodes */
export class BTNode {
  tick(ctx) { return BT_STATUS.FAILURE; }
}

/** Runs children left-to-right; stops on first SUCCESS */
export class Selector extends BTNode {
  constructor(...children) { super(); this.children = children; }
  tick(ctx) {
    for (const c of this.children) {
      const r = c.tick(ctx);
      if (r !== BT_STATUS.FAILURE) return r;
    }
    return BT_STATUS.FAILURE;
  }
}

/** Runs children left-to-right; stops on first FAILURE */
export class Sequence extends BTNode {
  constructor(...children) { super(); this.children = children; }
  tick(ctx) {
    for (const c of this.children) {
      const r = c.tick(ctx);
      if (r !== BT_STATUS.SUCCESS) return r;
    }
    return BT_STATUS.SUCCESS;
  }
}

/** Inverts SUCCESS/FAILURE of child */
export class Inverter extends BTNode {
  constructor(child) { super(); this.child = child; }
  tick(ctx) {
    const r = this.child.tick(ctx);
    if (r === BT_STATUS.SUCCESS) return BT_STATUS.FAILURE;
    if (r === BT_STATUS.FAILURE) return BT_STATUS.SUCCESS;
    return r;
  }
}

/** Condition leaf: fn(ctx) => bool */
export class Condition extends BTNode {
  constructor(fn) { super(); this._fn = fn; }
  tick(ctx) { return this._fn(ctx) ? BT_STATUS.SUCCESS : BT_STATUS.FAILURE; }
}

/** Action leaf: fn(ctx) => BT_STATUS  */
export class Action extends BTNode {
  constructor(fn) { super(); this._fn = fn; }
  tick(ctx) { return this._fn(ctx) ?? BT_STATUS.SUCCESS; }
}
