const X_MIN=-50,X_MAX=50;
const canvas=document.getElementById("graph");
const ctx=canvas.getContext("2d");

class Line{
    constructor(m,b){this.m=m;this.b=b;}
    get(x){return this.m*x+this.b;}
}

class Node{
    constructor(l,r){
        this.l=l;this.r=r;
        this.mid=Math.floor((l+r)/2);
        this.line=null;
        this.left=null;
        this.right=null;
    }
}

let root=new Node(X_MIN,X_MAX);
let lines=[];

function addLine(){
    const m=+document.getElementById("m").value;
    const b=+document.getElementById("b").value;
    const ln=new Line(m,b);
    lines.push(ln);
    insert(root,ln);
    draw();
    renderTree(root);
}

function insert(node,line){
    if(!node.line){ node.line=line; return; }

    let l=node.l,r=node.r,mid=node.mid;
    let left=line.get(l)<node.line.get(l);
    let middle=line.get(mid)<node.line.get(mid);

    if(middle){ [node.line,line]=[line,node.line]; }

    if(r-l===0) return;
    else if(left!==middle){
        if(!node.left) node.left=new Node(l,mid);
        insert(node.left,line);
    }else{
        if(!node.right) node.right=new Node(mid+1,r);
        insert(node.right,line);
    }
}

function query(){
    const x=+document.getElementById("qx").value;
    let res=queryNode(root,x);
    document.getElementById("result").innerText=`Min at x=${x} : ${res}`;
}

function queryNode(node,x){
    if(!node) return Infinity;
    let cur=node.line?node.line.get(x):Infinity;
    if(node.l===node.r) return cur;
    if(x<=node.mid) return Math.min(cur,queryNode(node.left,x));
    return Math.min(cur,queryNode(node.right,x));
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="#e2e8f0";
    for(let x=0;x<canvas.width;x+=50){
        ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,500);ctx.stroke();
    }

    lines.forEach(line=>{
        ctx.beginPath();
        ctx.strokeStyle=`hsl(${Math.random()*360},70%,50%)`;
        for(let px=0;px<canvas.width;px++){
            let x=X_MIN+(px/canvas.width)*(X_MAX-X_MIN);
            let y=line.get(x);
            let py=250-y*5;
            if(px===0) ctx.moveTo(px,py);
            else ctx.lineTo(px,py);
        }
        ctx.stroke();
    });
}

function renderTree(node,depth=0){
    const div=document.getElementById("tree");
    if(depth===0) div.innerHTML="";
    if(!node||!node.line) return;

    const el=document.createElement("div");
    el.className="node";
    el.style.marginLeft=depth*20+"px";
    el.innerText=`[${node.l},${node.r}] : y=${node.line.m}x+${node.line.b}`;
    div.appendChild(el);

    renderTree(node.left,depth+1);
    renderTree(node.right,depth+1);
}