const ROWS = 20;
const COLS = 20;

const gridEl = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const algoSelect = document.getElementById("algoSelect");

let grid = [];
let start = null;
let goal = null;

function createGrid() {
  gridEl.innerHTML = "";
  grid = [];

  for (let r = 0; r < ROWS; r++) {
    let row = [];
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      cell.addEventListener("click", () => handleClick(r, c));
      gridEl.appendChild(cell);

      row.push({
        r, c,
        el: cell,
        wall: false,
        parent: null
      });
    }
    grid.push(row);
  }
}

function handleClick(r, c) {
  const node = grid[r][c];

  if (!start) {
    start = node;
    node.el.classList.add("start");
    return;
  }

  if (!goal && node !== start) {
    goal = node;
    node.el.classList.add("goal");
    return;
  }

  if (node !== start && node !== goal) {
    node.wall = !node.wall;
    node.el.classList.toggle("wall");
  }
}

function neighbors(node) {
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  const list = [];

  dirs.forEach(([dr,dc]) => {
    const nr = node.r + dr;
    const nc = node.c + dc;

    if (nr>=0 && nc>=0 && nr<ROWS && nc<COLS) {
      const n = grid[nr][nc];
      if (!n.wall) list.push(n);
    }
  });

  return list;
}

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

async function visualizePath(end){
  let cur = end.parent;
  while(cur && cur !== start){
    cur.el.classList.add("path");
    cur = cur.parent;
    await sleep(30);
  }
}

async function bfs(){
  const q = [start];
  const visited = new Set([start]);

  while(q.length){
    const node = q.shift();

    if(node === goal){
      await visualizePath(goal);
      return;
    }

    for(let n of neighbors(node)){
      if(!visited.has(n)){
        visited.add(n);
        n.parent = node;
        q.push(n);

        if(n!==goal && n!==start)
          n.el.classList.add("visited");

        await sleep(10);
      }
    }
  }
}

async function dfs(){
  const stack = [start];
  const visited = new Set([start]);

  while(stack.length){
    const node = stack.pop();

    if(node === goal){
      await visualizePath(goal);
      return;
    }

    for(let n of neighbors(node)){
      if(!visited.has(n)){
        visited.add(n);
        n.parent = node;
        stack.push(n);

        if(n!==goal && n!==start)
          n.el.classList.add("visited");

        await sleep(10);
      }
    }
  }
}

function h(a,b){
  return Math.abs(a.r-b.r)+Math.abs(a.c-b.c);
}

async function astar(){
  const open = [start];
  const g = new Map([[start,0]]);
  const f = new Map([[start,h(start,goal)]]);

  while(open.length){
    open.sort((a,b)=>f.get(a)-f.get(b));
    const node = open.shift();

    if(node===goal){
      await visualizePath(goal);
      return;
    }

    for(let n of neighbors(node)){
      const temp = g.get(node)+1;
      if(!g.has(n) || temp<g.get(n)){
        n.parent=node;
        g.set(n,temp);
        f.set(n,temp+h(n,goal));

        if(!open.includes(n)) open.push(n);

        if(n!==goal && n!==start)
          n.el.classList.add("visited");

        await sleep(10);
      }
    }
  }
}

startBtn.addEventListener("click", async () => {
  if(!start || !goal) return;

  const algo = algoSelect.value;

  if(algo==="bfs") await bfs();
  if(algo==="dfs") await dfs();
  if(algo==="astar") await astar();
});

resetBtn.addEventListener("click", () => {
  start = null;
  goal = null;
  createGrid();
});

createGrid();