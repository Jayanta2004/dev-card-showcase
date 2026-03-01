'use strict';
class DelaunayTriangulator {
  constructor() {
    this._superVerts = [];
  }
  triangulate(particles) {
    if (!particles || particles.length < 3) return [];
    const pts = particles.filter(p => !p.dead);
    if (pts.length < 3) return [];
    const st = this._buildSuperTriangle(pts);
    let tris = [st];
    for (const p of pts) {
      const bad = [];
      for (const t of tris) {
        if (t.inCircumcircle(p)) bad.push(t);
      }
      const boundary = this._findBoundaryPolygon(bad);
      tris = tris.filter(t => !bad.includes(t));
      for (const [a, b] of boundary) {
        const nt = new Triangle(a, b, p);
        nt.enforceWinding();
        tris.push(nt);
      }
    }
    this._superVerts = [st.a, st.b, st.c];
    return tris.filter(t => !this._touchesSuperVerts(t));
  }
  _buildSuperTriangle(pts) {
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    for (const p of pts) {
      const px = p.pos?.x ?? p.x, py = p.pos?.y ?? p.y;
      if (px < minx) minx = px; if (py < miny) miny = py;
      if (px > maxx) maxx = px; if (py > maxy) maxy = py;
    }
    const dx = (maxx - minx) * 3, dy = (maxy - miny) * 3;
    const mx = (minx + maxx) * 0.5, my = (miny + maxy) * 0.5;
    const sa = new Particle(mx - dx * 2, my - dy, 1);
    const sb = new Particle(mx, my + dy * 2, 1);
    const sc = new Particle(mx + dx * 2, my - dy, 1);
    return new Triangle(sa, sb, sc);
  }
  _findBoundaryPolygon(badTris) {
    const edges = [];
    for (const t of badTris) {
      const triEdges = [[t.a, t.b], [t.b, t.c], [t.c, t.a]];
      for (const [p1, p2] of triEdges) {
        const shared = badTris.some(other =>
          other !== t && other.hasEdge(p1, p2)
        );
        if (!shared) edges.push([p1, p2]);
      }
    }
    return edges;
  }
  _touchesSuperVerts(tri) {
    const sv = this._superVerts;
    return tri.hasParticle(sv[0]) || tri.hasParticle(sv[1]) || tri.hasParticle(sv[2]);
  }
  extractBoundaryLoop(particles) {
    const alive = particles.filter(p => !p.dead);
    if (alive.length < 3) return [...alive];
    let cx = 0, cy = 0;
    for (const p of alive) { cx += p.pos.x; cy += p.pos.y; }
    cx /= alive.length; cy /= alive.length;
    return [...alive].sort((a, b) => {
      return Math.atan2(a.pos.y - cy, a.pos.x - cx) - Math.atan2(b.pos.y - cy, b.pos.x - cx);
    });
  }
  validateTriangles(tris) {
    return tris.filter(t => {
      if (!t.a || !t.b || !t.c) return false;
      if (t.a.dead || t.b.dead || t.c.dead) return false;
      return t.area > 0.01;
    });
  }
}
