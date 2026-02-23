export const Random = {
    float: (min, max) => Math.random() * (max - min) + min,
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    chance: (probability) => Math.random() < probability
};

export const Vector = {
    dist: (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y),
    add: (v1, v2) => ({ x: v1.x + v2.x, y: v1.y + v2.y }),
    sub: (v1, v2) => ({ x: v1.x - v2.x, y: v1.y - v2.y }),
    normalize: (v) => {
        const mag = Math.hypot(v.x, v.y);
        return mag === 0 ? { x: 0, y: 0 } : { x: v.x / mag, y: v.y / mag };
    },
    scale: (v, s) => ({ x: v.x * s, y: v.y * s })
};
