    (function() {
      const canvas = document.getElementById('mazeCanvas');
      const ctx = canvas.getContext('2d');
      
      // dimensions
      let rows = 20, cols = 30;
      let cellSize = Math.min(Math.floor(canvas.width / cols), Math.floor(canvas.height / rows));
      
      // maze grid: 0 = path, 1 = wall
      let grid = [];
      
      // start and end positions
      let start = { row: 1, col: 1 };
      let end = { row: rows-2, col: cols-2 };
      
      // visited and solution for display
      let visited = [];
      let solution = [];
      let solving = false;
      
      // UI elements
      const rowsSlider = document.getElementById('rowsSlider');
      const colsSlider = document.getElementById('colsSlider');
      const rowsVal = document.getElementById('rowsVal');
      const colsVal = document.getElementById('colsVal');
      const sizeInfo = document.getElementById('sizeInfo');
      const stepCount = document.getElementById('stepCount');
      const pathLength = document.getElementById('pathLength');
      
      const generateDFS = document.getElementById('generateDFS');
      const generatePrim = document.getElementById('generatePrim');
      const clearWalls = document.getElementById('clearWalls');
      const addRandomWalls = document.getElementById('addRandomWalls');
      const solveBtn = document.getElementById('solveBtn');
      const resetSolution = document.getElementById('resetSolution');
      
      const algoBtns = document.querySelectorAll('.algo-btn');
      let currentAlgo = 'dfs';
      
      // initialize grid
      function initGrid(rows, cols, fill = 1) {
        grid = Array(rows).fill().map(() => Array(cols).fill(fill));
        // ensure start and end are within bounds
        start.row = Math.min(start.row, rows-2);
        start.col = Math.min(start.col, cols-2);
        end.row = Math.min(end.row, rows-2);
        end.col = Math.min(end.col, cols-2);
        
        // set start and end as paths
        if (start.row >= 0 && start.col >= 0) grid[start.row][start.col] = 0;
        if (end.row >= 0 && end.col >= 0) grid[end.row][end.col] = 0;
        
        visited = [];
        solution = [];
        updateSizeInfo();
        drawMaze();
      }
      
      // update size info
      function updateSizeInfo() {
        rowsVal.innerText = rows;
        colsVal.innerText = cols;
        sizeInfo.innerText = `${rows}x${cols}`;
        cellSize = Math.min(Math.floor(canvas.width / cols), Math.floor(canvas.height / rows));
      }
      
      // draw maze
      function drawMaze() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // draw cells
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            let x = c * cellSize;
            let y = r * cellSize;
            
            // cell color based on type
            if (grid[r][c] === 1) {
              ctx.fillStyle = '#2d4a4a'; // wall
            } else {
              ctx.fillStyle = '#95b8ae'; // path
            }
            
            ctx.fillRect(x, y, cellSize-1, cellSize-1);
            
            // draw visited
            if (visited.length > 0 && visited.some(v => v.row === r && v.col === c)) {
              ctx.fillStyle = '#ffe06690';
              ctx.fillRect(x, y, cellSize-1, cellSize-1);
            }
            
            // draw solution
            if (solution.length > 0 && solution.some(s => s.row === r && s.col === c)) {
              ctx.fillStyle = '#f5a97f90';
              ctx.fillRect(x, y, cellSize-1, cellSize-1);
            }
          }
        }
        
        // draw start and end
        ctx.fillStyle = '#44cf6c';
        ctx.fillRect(start.col * cellSize, start.row * cellSize, cellSize-1, cellSize-1);
        
        ctx.fillStyle = '#f5544e';
        ctx.fillRect(end.col * cellSize, end.row * cellSize, cellSize-1, cellSize-1);
        
        // grid lines
        ctx.strokeStyle = '#5f7e7a';
        ctx.lineWidth = 1;
        for (let r = 0; r <= rows; r++) {
          ctx.beginPath();
          ctx.moveTo(0, r * cellSize);
          ctx.lineTo(canvas.width, r * cellSize);
          ctx.strokeStyle = '#3d5f5b';
          ctx.stroke();
        }
        for (let c = 0; c <= cols; c++) {
          ctx.beginPath();
          ctx.moveTo(c * cellSize, 0);
          ctx.lineTo(c * cellSize, canvas.height);
          ctx.stroke();
        }
      }
      
      // ----- MAZE GENERATION ALGORITHMS -----
      
      // DFS recursive backtracking maze
      function generateDFSMaze() {
        // initialize all walls
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            grid[r][c] = 1;
          }
        }
        
        // start from (1,1)
        let stack = [{ row: 1, col: 1 }];
        grid[1][1] = 0;
        
        const dirs = [
          [0, 2], [2, 0], [0, -2], [-2, 0]
        ];
        
        while (stack.length > 0) {
          let current = stack[stack.length-1];
          let { row, col } = current;
          
          // get unvisited neighbors (2 steps away)
          let neighbors = [];
          for (let [dr, dc] of dirs) {
            let nr = row + dr;
            let nc = col + dc;
            if (nr > 0 && nr < rows-1 && nc > 0 && nc < cols-1 && grid[nr][nc] === 1) {
              neighbors.push({ row: nr, col: nc, midRow: row + dr/2, midCol: col + dc/2 });
            }
          }
          
          if (neighbors.length > 0) {
            // choose random neighbor
            let next = neighbors[Math.floor(Math.random() * neighbors.length)];
            // carve path
            grid[next.midRow][next.midCol] = 0;
            grid[next.row][next.col] = 0;
            stack.push(next);
          } else {
            stack.pop();
          }
        }
        
        // ensure start and end are open
        grid[start.row][start.col] = 0;
        grid[end.row][end.col] = 0;
        
        visited = [];
        solution = [];
        drawMaze();
      }
      
      // Prim's algorithm maze
      function generatePrimMaze() {
        // initialize all walls
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            grid[r][c] = 1;
          }
        }
        
        // start with a random cell
        let startRow = 1;
        let startCol = 1;
        grid[startRow][startCol] = 0;
        
        let frontier = [];
        // add frontier cells (2 steps away)
        const dirs = [[0,2], [2,0], [0,-2], [-2,0]];
        for (let [dr, dc] of dirs) {
          let nr = startRow + dr;
          let nc = startCol + dc;
          if (nr > 0 && nr < rows-1 && nc > 0 && nc < cols-1 && grid[nr][nc] === 1) {
            frontier.push({ row: nr, col: nc, fromRow: startRow, fromCol: startCol });
          }
        }
        
        while (frontier.length > 0) {
          // pick random frontier
          let idx = Math.floor(Math.random() * frontier.length);
          let cell = frontier[idx];
          frontier.splice(idx, 1);
          
          if (grid[cell.row][cell.col] === 1) {
            // carve path from cell to a random adjacent path
            let neighbors = [];
            for (let [dr, dc] of dirs) {
              let nr = cell.row + dr;
              let nc = cell.col + dc;
              if (nr > 0 && nr < rows-1 && nc > 0 && nc < cols-1 && grid[nr][nc] === 0) {
                neighbors.push({ row: nr, col: nc, midRow: cell.row + dr/2, midCol: cell.col + dc/2 });
              }
            }
            
            if (neighbors.length > 0) {
              let connect = neighbors[Math.floor(Math.random() * neighbors.length)];
              grid[connect.midRow][connect.midCol] = 0;
              grid[cell.row][cell.col] = 0;
              
              // add new frontiers
              for (let [dr, dc] of dirs) {
                let nr = cell.row + dr;
                let nc = cell.col + dc;
                if (nr > 0 && nr < rows-1 && nc > 0 && nc < cols-1 && grid[nr][nc] === 1) {
                  frontier.push({ row: nr, col: nc, fromRow: cell.row, fromCol: cell.col });
                }
              }
            }
          }
        }
        
        grid[start.row][start.col] = 0;
        grid[end.row][end.col] = 0;
        
        visited = [];
        solution = [];
        drawMaze();
      }
      
      // random walls (density ~30%)
      function addRandomWallsFn() {
        for (let r = 1; r < rows-1; r++) {
          for (let c = 1; c < cols-1; c++) {
            if (Math.random() < 0.3 && !(r === start.row && c === start.col) && !(r === end.row && c === end.col)) {
              grid[r][c] = 1;
            } else {
              if (grid[r][c] !== 0) grid[r][c] = 0;
            }
          }
        }
        visited = [];
        solution = [];
        drawMaze();
      }
      
      // ----- SOLVING ALGORITHMS -----
      
      // DFS solver (recursive)
      function solveDFS() {
        visited = [];
        solution = [];
        
        let stack = [{ row: start.row, col: start.col, path: [{ row: start.row, col: start.col }] }];
        let visitedSet = new Set();
        visitedSet.add(`${start.row},${start.col}`);
        
        while (stack.length > 0) {
          let { row, col, path } = stack.pop();
          
          if (row === end.row && col === end.col) {
            solution = path;
            stepCount.innerText = visited.length;
            pathLength.innerText = path.length;
            drawMaze();
            return true;
          }
          
          visited.push({ row, col });
          
          // check neighbors
          const dirs = [[0,1], [1,0], [0,-1], [-1,0]];
          for (let [dr, dc] of dirs) {
            let nr = row + dr;
            let nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !visitedSet.has(`${nr},${nc}`)) {
              visitedSet.add(`${nr},${nc}`);
              stack.push({ row: nr, col: nc, path: [...path, { row: nr, col: nc }] });
            }
          }
        }
        
        stepCount.innerText = visited.length;
        pathLength.innerText = 0;
        drawMaze();
        return false;
      }
      
      // BFS solver
      function solveBFS() {
        visited = [];
        solution = [];
        
        let queue = [{ row: start.row, col: start.col, path: [{ row: start.row, col: start.col }] }];
        let visitedSet = new Set();
        visitedSet.add(`${start.row},${start.col}`);
        
        while (queue.length > 0) {
          let { row, col, path } = queue.shift();
          
          if (row === end.row && col === end.col) {
            solution = path;
            stepCount.innerText = visited.length;
            pathLength.innerText = path.length;
            drawMaze();
            return true;
          }
          
          visited.push({ row, col });
          
          const dirs = [[0,1], [1,0], [0,-1], [-1,0]];
          for (let [dr, dc] of dirs) {
            let nr = row + dr;
            let nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !visitedSet.has(`${nr},${nc}`)) {
              visitedSet.add(`${nr},${nc}`);
              queue.push({ row: nr, col: nc, path: [...path, { row: nr, col: nc }] });
            }
          }
        }
        
        stepCount.innerText = visited.length;
        pathLength.innerText = 0;
        drawMaze();
        return false;
      }
      
      // A* solver (manhattan distance)
      function solveAStar() {
        visited = [];
        solution = [];
        
        function heuristic(r, c) {
          return Math.abs(r - end.row) + Math.abs(c - end.col);
        }
        
        let openSet = [{ row: start.row, col: start.col, g: 0, f: heuristic(start.row, start.col), path: [{ row: start.row, col: start.col }] }];
        let closedSet = new Set();
        
        while (openSet.length > 0) {
          // find node with smallest f
          let idx = 0;
          for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < openSet[idx].f) idx = i;
          }
          let current = openSet[idx];
          openSet.splice(idx, 1);
          
          if (current.row === end.row && current.col === end.col) {
            solution = current.path;
            stepCount.innerText = visited.length;
            pathLength.innerText = current.path.length;
            drawMaze();
            return true;
          }
          
          closedSet.add(`${current.row},${current.col}`);
          visited.push({ row: current.row, col: current.col });
          
          const dirs = [[0,1], [1,0], [0,-1], [-1,0]];
          for (let [dr, dc] of dirs) {
            let nr = current.row + dr;
            let nc = current.col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 0 && !closedSet.has(`${nr},${nc}`)) {
              let g = current.g + 1;
              let h = heuristic(nr, nc);
              let f = g + h;
              
              // check if in open set with better g
              let inOpen = openSet.find(n => n.row === nr && n.col === nc);
              if (!inOpen || g < inOpen.g) {
                if (!inOpen) {
                  openSet.push({ row: nr, col: nc, g: g, f: f, path: [...current.path, { row: nr, col: nc }] });
                } else {
                  inOpen.g = g;
                  inOpen.f = f;
                  inOpen.path = [...current.path, { row: nr, col: nc }];
                }
              }
            }
          }
        }
        
        stepCount.innerText = visited.length;
        pathLength.innerText = 0;
        drawMaze();
        return false;
      }
      
      // reset solution display
      function resetSolutionFn() {
        visited = [];
        solution = [];
        stepCount.innerText = 0;
        pathLength.innerText = 0;
        drawMaze();
      }
      
      // clear all walls (only keep border)
      function clearWallsFn() {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (r === 0 || r === rows-1 || c === 0 || c === cols-1) {
              grid[r][c] = 1; // border walls
            } else {
              grid[r][c] = 0;
            }
          }
        }
        grid[start.row][start.col] = 0;
        grid[end.row][end.col] = 0;
        visited = [];
        solution = [];
        drawMaze();
      }
      
      // resize grid
      function resizeGrid() {
        rows = parseInt(rowsSlider.value);
        cols = parseInt(colsSlider.value);
        cellSize = Math.min(Math.floor(canvas.width / cols), Math.floor(canvas.height / rows));
        
        // adjust start and end
        start.row = Math.min(start.row, rows-2);
        start.col = Math.min(start.col, cols-2);
        end.row = Math.min(end.row, rows-2);
        end.col = Math.min(end.col, cols-2);
        
        initGrid(rows, cols, 0);
        // add border walls
        for (let r = 0; r < rows; r++) {
          grid[r][0] = 1;
          grid[r][cols-1] = 1;
        }
        for (let c = 0; c < cols; c++) {
          grid[0][c] = 1;
          grid[rows-1][c] = 1;
        }
        grid[start.row][start.col] = 0;
        grid[end.row][end.col] = 0;
        drawMaze();
      }
      
      // event listeners
      rowsSlider.addEventListener('input', () => {
        rowsVal.innerText = rowsSlider.value;
        resizeGrid();
      });
      
      colsSlider.addEventListener('input', () => {
        colsVal.innerText = colsSlider.value;
        resizeGrid();
      });
      
      generateDFS.addEventListener('click', generateDFSMaze);
      generatePrim.addEventListener('click', generatePrimMaze);
      clearWalls.addEventListener('click', clearWallsFn);
      addRandomWalls.addEventListener('click', addRandomWallsFn);
      resetSolution.addEventListener('click', resetSolutionFn);
      
      solveBtn.addEventListener('click', () => {
        if (currentAlgo === 'dfs') solveDFS();
        else if (currentAlgo === 'bfs') solveBFS();
        else if (currentAlgo === 'astar') solveAStar();
      });
      
      algoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          algoBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentAlgo = btn.dataset.algo;
        });
      });
      
      // click on canvas to set start/end (shift+click for end)
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        const col = Math.floor(mouseX / cellSize);
        const row = Math.floor(mouseY / cellSize);
        
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
          if (e.shiftKey) {
            // set end
            if (grid[row][col] === 0) {
              end.row = row;
              end.col = col;
            }
          } else {
            // set start
            if (grid[row][col] === 0) {
              start.row = row;
              start.col = col;
            }
          }
          resetSolutionFn();
          drawMaze();
        }
      });
      
      // initialize
      initGrid(rows, cols, 0);
      // add border walls
      for (let r = 0; r < rows; r++) {
        grid[r][0] = 1;
        grid[r][cols-1] = 1;
      }
      for (let c = 0; c < cols; c++) {
        grid[0][c] = 1;
        grid[rows-1][c] = 1;
      }
      grid[start.row][start.col] = 0;
      grid[end.row][end.col] = 0;
      drawMaze();
    })();