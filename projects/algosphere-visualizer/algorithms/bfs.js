export async function bfsPath(grid, speed) {
  const rows = grid.length;
  const cols = grid[0].length;
  let queue = [grid[0][0]];
  let visited = new Set();
  const key = (r, c) => `${r},${c}`;
  visited.add(key(0, 0));

  const prev = new Map();

  while (queue.length) {
    const node = queue.shift();
    node.cell.classList.add("grid-visited");
    await new Promise((r) => setTimeout(r, speed));

    if (node.r === rows - 1 && node.c === cols - 1) {
      // Reconstruct path
      let pathNode = node;
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
      const nr = node.r + dr;
      const nc = node.c + dc;
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        !visited.has(key(nr, nc)) &&
        !grid[nr][nc].wall
      ) {
        visited.add(key(nr, nc));
        prev.set(grid[nr][nc], node);
        queue.push(grid[nr][nc]);
      }
    }
  }
}
