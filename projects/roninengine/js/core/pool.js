// RoninEngine — core/pool.js  ·  Generic object pool
'use strict';

export class Pool {
  /**
   * @param {()=>object} factory   Creates a new item
   * @param {(item)=>void} reset   Resets item before reuse
   * @param {number} prealloc      Pre-allocate N items
   */
  constructor(factory, reset, prealloc = 0) {
    this._factory  = factory;
    this._reset    = reset;
    this._inactive = [];
    this._active   = new Set();
    for (let i = 0; i < prealloc; i++) this._inactive.push(factory());
  }

  /** Acquire an item from the pool (or create a new one) */
  acquire() {
    const item = this._inactive.length
      ? this._inactive.pop()
      : this._factory();
    this._reset(item);
    this._active.add(item);
    return item;
  }

  /** Return an item to the pool */
  release(item) {
    this._active.delete(item);
    this._inactive.push(item);
  }

  /** Release all active items at once */
  releaseAll() {
    this._active.forEach(item => this._inactive.push(item));
    this._active.clear();
  }

  get activeCount()   { return this._active.size; }
  get inactiveCount() { return this._inactive.length; }

  /** Iterate over active items */
  forEach(fn) { this._active.forEach(fn); }
}
