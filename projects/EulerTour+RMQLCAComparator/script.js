const svg=document.getElementById("tree");
let n=10,adj,depth,parent,euler=[],first=[],seg=[];

function generateTree(){
    adj=Array.from({length:n},()=>[]);
    for(let i=1;i<n;i++){
        let p=Math.floor(Math.random()*i);
        adj[p].push(i);
        adj[i].push(p);
    }
    depth=Array(n).fill(0);
    parent=Array(n).fill(-1);
    euler=[]; first=Array(n).fill(-1);

    dfs(0,-1,0);
    buildSeg();
    draw();
    showArrays();
}

function dfs(u,p,d){
    parent[u]=p; depth[u]=d;
    first[u]=euler.length;
    euler.push(u);

    for(let v of adj[u]){
        if(v===p)continue;
        dfs(v,u,d+1);
        euler.push(u);
    }
}

function buildSeg(){
    let m=euler.length;
    seg=Array(2*m);
    for(let i=0;i<m;i++)seg[m+i]=euler[i];
    for(let i=m-1;i>0;i--){
        let a=seg[i<<1],b=seg[i<<1|1];
        seg[i]=depth[a]<depth[b]?a:b;
    }
}

function rmq(l,r){
    let m=euler.length; l+=m;r+=m;
    let res=-1;
    while(l<=r){
        if(l&1)res=minNode(res,seg[l++]);
        if(!(r&1))res=minNode(res,seg[r--]);
        l>>=1;r>>=1;
    }
    return res;
}

function minNode(a,b){
    if(a==-1)return b;
    if(b==-1)return a;
    return depth[a]<depth[b]?a:b;
}

function lcaNaive(u,v){
    let seen=new Set();
    while(u!=-1){seen.add(u);u=parent[u];}
    while(v!=-1){
        if(seen.has(v))return v;
        v=parent[v];
    }
}

function computeLCA(){
    let u=+document.getElementById("u").value;
    let v=+document.getElementById("v").value;

    let naive=lcaNaive(u,v);
    let l=first[u],r=first[v];
    if(l>r)[l,r]=[r,l];
    let fast=rmq(l,r);

    document.getElementById("result").innerText=
        `Naive LCA: ${naive} | RMQ LCA: ${fast}`;
}

function showArrays(){
    document.getElementById("tour").innerText=euler.join(" ");
    document.getElementById("depth").innerText=euler.map(x=>depth[x]).join(" ");
}

function draw(){
    svg.innerHTML="";
    let pos={};
    let x=50;

    function dfsPos(u,p,dep){
        pos[u]={x:x,y:80+dep*70}; x+=70;
        for(let v of adj[u]) if(v!==p) dfsPos(v,u,dep+1);
    }
    dfsPos(0,-1,0);

    for(let u=0;u<n;u++){
        for(let v of adj[u]) if(u<v){
            svg.appendChild(line(pos[u],pos[v]));
        }
    }
    for(let i=0;i<n;i++){
        svg.appendChild(circle(pos[i],i));
    }
}

function line(a,b){
    let l=document.createElementNS("http://www.w3.org/2000/svg","line");
    l.setAttribute("x1",a.x);l.setAttribute("y1",a.y);
    l.setAttribute("x2",b.x);l.setAttribute("y2",b.y);
    l.setAttribute("class","edge");
    return l;
}
function circle(p,t){
    let g=document.createElementNS("http://www.w3.org/2000/svg","g");
    let c=document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);c.setAttribute("r",18);
    c.setAttribute("class","node");
    let txt=document.createElementNS("http://www.w3.org/2000/svg","text");
    txt.setAttribute("x",p.x);txt.setAttribute("y",p.y+4);
    txt.setAttribute("text-anchor","middle");
    txt.textContent=t;
    g.appendChild(c);g.appendChild(txt);
    return g;
}