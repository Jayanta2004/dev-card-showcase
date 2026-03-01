const network = document.getElementById("network");
const runBtn = document.getElementById("runBtn");
const resetBtn = document.getElementById("resetBtn");

const nodesData = [
  {id:"A",x:80,y:120},
  {id:"B",x:260,y:70},
  {id:"C",x:460,y:120},
  {id:"D",x:160,y:300},
  {id:"E",x:380,y:300},
  {id:"F",x:620,y:220}
];

const edges = [
  ["A","B",2],
  ["B","C",3],
  ["A","D",4],
  ["D","E",2],
  ["C","E",2],
  ["C","F",5],
  ["E","F",1]
];

let source = null;
let dest = null;
let nodeMap = {};

function drawLinks() {
  edges.forEach(([a,b])=>{
    const n1 = nodeMap[a];
    const n2 = nodeMap[b];

    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const len = Math.hypot(dx,dy);
    const angle = Math.atan2(dy,dx)*180/Math.PI;

    const line = document.createElement("div");
    line.className = "link";
    line.style.width = len + "px";
    line.style.left = n1.x + 20 + "px";
    line.style.top = n1.y + 20 + "px";
    line.style.transform = `rotate(${angle}deg)`;

    network.appendChild(line);
  });
}

function createNodes() {
  network.innerHTML = "";
  nodeMap = {};

  nodesData.forEach(n=>{
    const el = document.createElement("div");
    el.className = "node";
    el.textContent = n.id;
    el.style.left = n.x + "px";
    el.style.top = n.y + "px";

    el.addEventListener("click",()=>selectNode(n.id));

    network.appendChild(el);

    nodeMap[n.id] = {...n, el};
  });

  drawLinks();
}

function selectNode(id){
  if(!source){
    source=id;
    nodeMap[id].el.classList.add("source");
    return;
  }
  if(!dest && id!==source){
    dest=id;
    nodeMap[id].el.classList.add("dest");
  }
}

function neighbors(id){
  return edges
    .filter(e=>e[0]===id || e[1]===id)
    .map(e=>{
      const next = e[0]===id ? e[1] : e[0];
      return [next,e[2]];
    });
}

function dijkstra(start,end){
  const dist={}, prev={}, pq=[start];

  nodesData.forEach(n=>dist[n.id]=Infinity);
  dist[start]=0;

  while(pq.length){
    pq.sort((a,b)=>dist[a]-dist[b]);
    const cur=pq.shift();

    if(cur===end) break;

    for(let [next,w] of neighbors(cur)){
      const nd=dist[cur]+w;
      if(nd<dist[next]){
        dist[next]=nd;
        prev[next]=cur;
        if(!pq.includes(next)) pq.push(next);
      }
    }
  }

  const path=[];
  let cur=end;
  while(cur){
    path.unshift(cur);
    cur=prev[cur];
  }
  return path;
}

function sleep(ms){
  return new Promise(r=>setTimeout(r,ms));
}

async function animatePacket(path){
  for(let i=0;i<path.length;i++){
    nodeMap[path[i]].el.classList.add("path");
  }

  const packet=document.createElement("div");
  packet.className="packet";
  network.appendChild(packet);

  for(let i=0;i<path.length;i++){
    const n=nodeMap[path[i]];
    packet.style.left=(n.x+14)+"px";
    packet.style.top=(n.y+14)+"px";
    await sleep(500);
  }
}

runBtn.addEventListener("click", async ()=>{
  if(!source || !dest) return;
  const path=dijkstra(source,dest);
  await animatePacket(path);
});

resetBtn.addEventListener("click",()=>{
  source=null;
  dest=null;
  createNodes();
});

createNodes();