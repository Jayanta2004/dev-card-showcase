// RoninEngine — engine/broadphase.js  ·  Spatial-hash broad-phase accelerator
'use strict';
import { Vec2 } from '../core/math.js';

export class SpatialHash {
  /**
   * @param {number} cellSize   World-space size of each grid cell
   */
  constructor(cellSize = 80) {
    this._cell = cellSize;
    this._map  = new Map();
  }

  _key(cx, cy) { return (cx & 0xFFFF) | ((cy & 0xFFFF) << 16); }

  _cellOf(x, y) {
    return [Math.floor(x / this._cell), Math.floor(y / this._cell)];
  }

  clear()  { this._map.clear(); }

  /** Insert an object with an AABB (or {x,y,w,h}) */
  insert(obj, aabb) {
    const [cx0, cy0] = this._cellOf(aabb.minX ?? aabb.x, aabb.minY ?? aabb.y);
    const [cx1, cy1] = this._cellOf(
      (aabb.maxX ?? (aabb.x + aabb.w)) - 0.001,
      (aabb.maxY ?? (aabb.y + aabb.h)) - 0.001,
    );
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        const k = this._key(cx, cy);
        if (!this._map.has(k)) this._map.set(k, []);
        this._map.get(k).push(obj);
      }
    }
  }

  /** Return all objects whose cells overlap the given AABB */
  query(aabb) {
    const [cx0, cy0] = this._cellOf(aabb.minX ?? aabb.x, aabb.minY ?? aabb.y);
    const [cx1, cy1] = this._cellOf(
      (aabb.maxX ?? (aabb.x + aabb.w)) - 0.001,
      (aabb.maxY ?? (aabb.y + aabb.h)) - 0.001,
    );
    const result = new Set();
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        this._map.get(this._key(cx, cy))?.forEach(o => result.add(o));
      }
    }
    return result;
  }
}
