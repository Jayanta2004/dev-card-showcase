let graph = {}, rev = {}, order = [], comp = {};
let n = 0;

function varIndex(x) {
    let v = Math.abs(x) - 1;
    return x > 0 ? 2*v : 2*v+1;
}
function neg(x){ return x%2 ? x-1 : x+1; }

function addEdge(u,v){
    graph[u].push(v);
    rev[v].push(u);
}

function solve(){
    graph={}; rev={}; order=[]; comp={};

    let lines=document.getElementById("clauses").value.trim().split("\n");
    n=0;

    for(let line of lines){
        if(!line.trim()) continue;
        let [a,b]=line.split(" ").map(Number);
        n=Math.max(n,Math.abs(a),Math.abs(b));
    }

    for(let i=0;i<2*n;i++){ graph[i]=[]; rev[i]=[]; }

    for(let line of lines){
        if(!line.trim()) continue;
        let [a,b]=line.split(" ").map(Number);

        let A=varIndex(a), B=varIndex(b);
        addEdge(neg(A),B);
        addEdge(neg(B),A);
    }

    kosaraju();
    visualize();

    let assignment=[];
    for(let i=0;i<n;i++){
        if(comp[2*i]==comp[2*i+1]){
            document.getElementById("result").innerText="UNSATISFIABLE ❌";
            return;
        }
        assignment[i]=comp[2*i]>comp[2*i+1];
    }

    document.getElementById("result").innerText=
        "SATISFIABLE ✅  Assignment: "+assignment.map((v,i)=>`x${i+1}=${v}`).join(", ");
}

function dfs1(u,vis){
    vis[u]=1;
    for(let v of graph[u]) if(!vis[v]) dfs1(v,vis);
    order.push(u);
}
function dfs2(u,c,vis){
    comp[u]=c; vis[u]=1;
    for(let v of rev[u]) if(!vis[v]) dfs2(v,c,vis);
}

function kosaraju(){
    let vis=Array(2*n).fill(0);
    for(let i=0;i<2*n;i++) if(!vis[i]) dfs1(i,vis);
    vis.fill(0);
    let j=0;
    for(let i=order.length-1;i>=0;i--){
        if(!vis[order[i]]) dfs2(order[i],j++,vis);
    }
}

function visualize(){
    const svg=document.getElementById("graph");
    svg.innerHTML=`<defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
    <polygon points="0 0, 10 3, 0 6" fill="#64748b"/>
    </marker></defs>`;

    const R=200, cx=450, cy=250;
    let pos={};

    for(let i=0;i<2*n;i++){
        let angle=2*Math.PI*i/(2*n);
        pos[i]={x:cx+R*Math.cos(angle),y:cy+R*Math.sin(angle)};
    }

    for(let u in graph){
        for(let v of graph[u]){
            let line=document.createElementNS("http://www.w3.org/2000/svg","line");
            line.setAttribute("x1",pos[u].x);
            line.setAttribute("y1",pos[u].y);
            line.setAttribute("x2",pos[v].x);
            line.setAttribute("y2",pos[v].y);
            line.setAttribute("class","edge");
            svg.appendChild(line);
        }
    }

    for(let i=0;i<2*n;i++){
        let circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
        circle.setAttribute("cx",pos[i].x);
        circle.setAttribute("cy",pos[i].y);
        circle.setAttribute("r",18);
        circle.setAttribute("class","node");
        svg.appendChild(circle);

        let txt=document.createElementNS("http://www.w3.org/2000/svg","text");
        txt.setAttribute("x",pos[i].x);
        txt.setAttribute("y",pos[i].y);
        txt.setAttribute("class","text");
        txt.textContent = (i%2? "¬":"") + "x"+(Math.floor(i/2)+1);
        svg.appendChild(txt);
    }
}

function clearAll(){
    document.getElementById("clauses").value="";
    document.getElementById("graph").innerHTML="";
    document.getElementById("result").innerText="";
}