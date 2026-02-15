const svg=document.getElementById("canvas");
let nodes=[],edges=[];
let mode="node",source=null,sink=null,selected=null;

svg.innerHTML=`<defs>
<marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
<polygon points="0 0, 10 3, 0 6" fill="#94a3b8"/>
</marker></defs>`;

svg.addEventListener("click",e=>{
    const rect=svg.getBoundingClientRect();
    const x=e.clientX-rect.left,y=e.clientY-rect.top;

    if(mode==="node"){
        nodes.push({x,y});
        draw();
    }
});

function draw(){
    svg.querySelectorAll(".draw").forEach(e=>e.remove());

    edges.forEach((e,i)=>{
        const line=create("line",{x1:nodes[e.u].x,y1:nodes[e.u].y,x2:nodes[e.v].x,y2:nodes[e.v].y,class:"edge draw"});
        svg.appendChild(line);

        const tx=(nodes[e.u].x+nodes[e.v].x)/2;
        const ty=(nodes[e.u].y+nodes[e.v].y)/2;
        svg.appendChild(create("text",{x:tx,y:ty,class:"draw"},`${e.cap}|${e.cost}`));
    });

    nodes.forEach((n,i)=>{
        let cls="node draw";
        if(i===source)cls+=" source";
        if(i===sink)cls+=" sink";

        const c=create("circle",{cx:n.x,cy:n.y,r:18,class:cls});
        c.onclick=()=>handleNode(i);
        svg.appendChild(c);

        svg.appendChild(create("text",{x:n.x,y:n.y+4,class:"draw"},i));
    });
}

function handleNode(i){
    if(mode==="edge"){
        if(selected===null)selected=i;
        else{
            const cap=+prompt("Capacity?");
            const cost=+prompt("Cost?");
            edges.push({u:selected,v:i,cap,cost,flow:0});
            selected=null; draw();
        }
    }
}

function setSource(){ mode="source"; document.getElementById("info").innerText="Click source node"; svg.onclick=e=>pickNode(e,i=>source=i); }
function setSink(){ mode="sink"; document.getElementById("info").innerText="Click sink node"; svg.onclick=e=>pickNode(e,i=>sink=i); }

function pickNode(e,cb){
    const rect=svg.getBoundingClientRect();
    const x=e.clientX-rect.left,y=e.clientY-rect.top;
    nodes.forEach((n,i)=>{
        if(Math.hypot(n.x-x,n.y-y)<20){cb(i); draw();}
    });
}

function create(tag,attrs,text){
    const el=document.createElementNS("http://www.w3.org/2000/svg",tag);
    for(let k in attrs)el.setAttribute(k,attrs[k]);
    if(text)el.textContent=text;
    return el;
}

// ---------- Min Cost Max Flow ----------

async function runMCMF(){
    const N=nodes.length;
    let totalFlow=0,totalCost=0;

    while(true){
        let dist=Array(N).fill(Infinity),par=Array(N).fill(-1);
        dist[source]=0;
        let inq=Array(N).fill(false),q=[source]; inq[source]=true;

        while(q.length){
            let u=q.shift(); inq[u]=false;
            edges.forEach((e,i)=>{
                if(e.u===u && e.flow<e.cap && dist[e.v]>dist[u]+e.cost){
                    dist[e.v]=dist[u]+e.cost;
                    par[e.v]=i;
                    if(!inq[e.v]){q.push(e.v);inq[e.v]=true;}
                }
            });
        }

        if(dist[sink]===Infinity)break;

        let add=Infinity;
        for(let v=sink;v!==source;){
            let e=edges[par[v]];
            add=Math.min(add,e.cap-e.flow);
            v=e.u;
        }

        for(let v=sink;v!==source;){
            let e=edges[par[v]];
            e.flow+=add;
            totalCost+=add*e.cost;
            highlight(e);
            v=e.u;
        }

        totalFlow+=add;
        await sleep(600);
    }

    document.getElementById("info").innerText=
        `Flow=${totalFlow}, Cost=${totalCost}`;
}

function highlight(e){
    svg.querySelectorAll(".edge").forEach(l=>{
        if(+l.getAttribute("x1")==nodes[e.u].x && +l.getAttribute("y1")==nodes[e.u].y)
            l.classList.add("path");
    });
}

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function clearAll(){nodes=[];edges=[];source=sink=null;draw();}