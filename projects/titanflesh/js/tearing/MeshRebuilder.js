'use strict';

class MeshRebuilder {
  constructor(triangulator) {
    /** @type {DelaunayTriangulator} Shared Bowyer-Watson triangulator. */
    this._triangulator = triangulator;
    /** @type {number} Lifetime count of rebuild invocations. */
    this._rebuilds = 0;
  }

  rebuild(particles, springs) {
    this._rebuilds++;

    const alive = particles.filter(p => !p.dead);
    if (alive.length < 3) {
      return { triangles: [], boundaryLoop: null };
    }

    const triangles  = this._triangulator.triangulate(alive);
    const validated  = this._triangulator.validateTriangles(triangles);

    // Rebuild boundary loop from outer ring
    const boundaryLoop = this._findBoundaryParticles(alive, springs);

    return { triangles: validated, boundaryLoop };
  }

  _findBoundaryParticles(particles, springs) {
    if (!particles.length) return null;

    let maxRing = 0;
    for (const p of particles) {
      if ((p.ring ?? 0) > maxRing) maxRing = p.ring ?? 0;
    }

    const outerRing = particles.filter(p => (p.ring ?? 0) === maxRing);
    if (outerRing.length >= 3) {
      return this._triangulator.extractBoundaryLoop(outerRing);
    }

    // Fallback to extracting from all alive particles
    return this._triangulator.extractBoundaryLoop(particles);
  }

  findConnectedComponents(particles, springs) {
    // DSU parent and rank maps (keyed by particle reference)
    const parent = new Map();
    const rank   = new Map();

    const find = (x) => {
      if (!parent.has(x)) {
        parent.set(x, x);
        rank.set(x, 0);
      }
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)));  // path compression
      }
      return parent.get(x);
    };

    const union = (a, b) => {
      const ra = find(a);
      const rb = find(b);
      if (ra === rb) return;
      const rankA = rank.get(ra) ?? 0;
      const rankB = rank.get(rb) ?? 0;
      if (rankA < rankB) {
        parent.set(ra, rb);
      } else if (rankA > rankB) {
        parent.set(rb, ra);
      } else {
        parent.set(rb, ra);
        rank.set(ra, rankA + 1);
      }
    };

    // Initialise every particle in its own component
    for (const p of particles) {
      find(p);
    }

    // Unite particles connected by non-torn springs
    for (const s of springs) {
      if (!s.torn) union(s.a, s.b);
    }

    // Group particles by root
    const groups = new Map();
    for (const p of particles) {
      const root = find(p);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(p);
    }

    return Array.from(groups.values());
  }

  getOrphanParticles(particles, springs) {
    const connected = new Set();
    for (const s of springs) {
      if (!s.torn) {
        connected.add(s.a);
        connected.add(s.b);
      }
    }
    return particles.filter(p => !p.dead && !connected.has(p));
  }

  getBoundaryEdges(triangles) {
    const edgeCount = new Map();

    const key = (a, b) => {
      const ia = a.id, ib = b.id;
      return ia < ib ? `${ia}_${ib}` : `${ib}_${ia}`;
    };
    const addEdge = (a, b) => {
      const k = key(a, b);
      edgeCount.set(k, (edgeCount.get(k) ?? 0) + 1);
    };

    for (const t of triangles) {
      addEdge(t.a, t.b);
      addEdge(t.b, t.c);
      addEdge(t.c, t.a);
    }

    const boundary = [];
    for (const t of triangles) {
      const edges = [[t.a, t.b], [t.b, t.c], [t.c, t.a]];
      for (const [a, b] of edges) {
        if (edgeCount.get(key(a, b)) === 1) {
          boundary.push({ a, b });
        }
      }
    }
    return boundary;
  }

  // ---- Accessors ----

  /** @returns {number} Total number of times rebuild() has been called. */
  get totalRebuilds() {
    return this._rebuilds;
  }
}
