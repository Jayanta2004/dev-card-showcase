export async function dijkstraPath(grid, speed) {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();

  const key = (r, c) => `${r},${c}`;

  function minDistNode() {
    let minNode = null;
    let minDist = Infinity;
    for (const [nodeKey, distance] of dist.entries()) {
      if (!visited.has(nodeKey) && distance < minDist) {
        minDist = distance;
        minNode = nodeKey;
      }
    }
    return minNode;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dist.set(key(r, c), Infinity);
    }
  }
  dist.set(key(0, 0), 0);

  while (true) {
    const currentKey = minDistNode();
    if (!currentKey) break;
    visited.add(currentKey);

    const [r, c] = currentKey.split(",").map(Number);
    const currentNode = grid[r][c];
    currentNode.cell.classList.add("grid-visited");
    await new Promise((r) => setTimeout(r, speed));

    if (r === rows - 1 && c === cols - 1) {
      // Reconstruct path
      let pathNode = currentNode;
      while (pathNode) {
        pathNode.cell.classList.remove("grid-visited");
        pathNode.cell.classList.add("grid-path");
        pathNode = prev.get(pathNode);
        await new Promise((r) => setTimeout(r, speed / 2));
      }
      return;
    }

    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        !grid[nr][nc].wall
      ) {
        const neighborKey = key(nr, nc);
        if (!visited.has(neighborKey)) {
          const alt = dist.get(currentKey) + 1;
          if (alt < dist.get(neighborKey)) {
            dist.set(neighborKey, alt);
            prev.set(grid[nr][nc], currentNode);
          }
        }
      }
    }
  }
}
