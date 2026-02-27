const workspace = document.getElementById("workspace");
const svg = document.getElementById("lines");

let nodeCount = 0;
let connectMode = false;
let selectedNode = null;
let connections = [];

// ---------- CREATE NODE ----------
function createNode(x=100,y=100){
  const node = document.createElement("div");
  node.className = "node";
  node.contentEditable = true;
  node.textContent = "Idea " + (++nodeCount);

  node.style.left = x + "px";
  node.style.top = y + "px";

  makeDraggable(node);

  node.onclick = () => {
    if(!connectMode) return;

    if(!selectedNode){
      selectedNode = node;
      node.style.background = "#f59e0b";
    } else {
      connections.push([selectedNode, node]);
      selectedNode.style.background = "#38bdf8";
      selectedNode = null;
      drawLines();
    }
  };

  workspace.appendChild(node);
}

// ---------- DRAG ----------
function makeDraggable(node){
  let offsetX, offsetY, dragging=false;

  node.addEventListener("mousedown",(e)=>{
    dragging=true;
    offsetX=e.offsetX;
    offsetY=e.offsetY;
  });

  document.addEventListener("mousemove",(e)=>{
    if(!dragging) return;

    const rect = workspace.getBoundingClientRect();
    node.style.left = (e.clientX-rect.left-offsetX)+"px";
    node.style.top = (e.clientY-rect.top-offsetY)+"px";

    drawLines();
  });

  document.addEventListener("mouseup",()=>{
    dragging=false;
  });
}

// ---------- DRAW CONNECTIONS ----------
function drawLines(){
  svg.innerHTML="";

  connections.forEach(([a,b])=>{
    const line = document.createElementNS(
      "http://www.w3.org/2000/svg","line"
    );

    const ax = a.offsetLeft + a.offsetWidth/2;
    const ay = a.offsetTop + a.offsetHeight/2;
    const bx = b.offsetLeft + b.offsetWidth/2;
    const by = b.offsetTop + b.offsetHeight/2;

    line.setAttribute("x1",ax);
    line.setAttribute("y1",ay);
    line.setAttribute("x2",bx);
    line.setAttribute("y2",by);
    line.setAttribute("stroke","#64748b");
    line.setAttribute("stroke-width","2");

    svg.appendChild(line);
  });
}

// ---------- BUTTONS ----------
document.getElementById("addNode").onclick = ()=>{
  createNode(
    Math.random()*500+50,
    Math.random()*300+50
  );
};

document.getElementById("connectMode").onclick = ()=>{
  connectMode=!connectMode;
  alert(connectMode ? "Connect Mode ON" : "Connect Mode OFF");
};

// init
createNode(200,150);