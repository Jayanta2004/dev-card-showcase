const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

let pts=[],root=null,lastQuery=null,bestPoint=null;

class Node{
    constructor(p,axis,left,right){
        this.p=p; this.axis=axis;
        this.left=left; this.right=right;
    }
}

canvas.addEventListener("click",e=>{
    const r=canvas.getBoundingClientRect();
    const x=e.clientX-r.left,y=e.clientY-r.top;
    pts.push({x,y});
    draw();
});

function buildTree(){
    root=build(pts,0);
    document.getElementById("info").innerText="Tree built — click to query nearest";
    canvas.onclick=queryPoint;
}

function build(arr,depth){
    if(!arr.length)return null;
    const axis=depth%2;
    arr.sort((a,b)=>axis? a.y-b.y : a.x-b.x);
    const mid=Math.floor(arr.length/2);
    return new Node(
        arr[mid],
        axis,
        build(arr.slice(0,mid),depth+1),
        build(arr.slice(mid+1),depth+1)
    );
}

function dist(a,b){return (a.x-b.x)**2+(a.y-b.y)**2;}

function nearest(node,target,best){
    if(!node)return best;

    if(!best || dist(target,node.p)<dist(target,best))
        best=node.p;

    let diff=node.axis? target.y-node.p.y : target.x-node.p.x;

    let first=diff<0?node.left:node.right;
    let second=diff<0?node.right:node.left;

    best=nearest(first,target,best);

    if(diff*diff<dist(target,best))
        best=nearest(second,target,best);

    return best;
}

function queryPoint(e){
    const r=canvas.getBoundingClientRect();
    lastQuery={x:e.clientX-r.left,y:e.clientY-r.top};
    bestPoint=nearest(root,lastQuery,null);
    draw();
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    pts.forEach(p=>{
        ctx.fillStyle="#111827";
        ctx.beginPath();ctx.arc(p.x,p.y,5,0,7);ctx.fill();
    });

    if(lastQuery){
        ctx.fillStyle="#ef4444";
        ctx.beginPath();ctx.arc(lastQuery.x,lastQuery.y,6,0,7);ctx.fill();

        ctx.fillStyle="#22c55e";
        ctx.beginPath();ctx.arc(bestPoint.x,bestPoint.y,7,0,7);ctx.fill();

        ctx.strokeStyle="#22c55e";
        ctx.beginPath();
        ctx.moveTo(lastQuery.x,lastQuery.y);
        ctx.lineTo(bestPoint.x,bestPoint.y);
        ctx.stroke();
    }
}

function clearAll(){
    pts=[];root=null;lastQuery=null;bestPoint=null;
    canvas.onclick=e=>{
        const r=canvas.getBoundingClientRect();
        pts.push({x:e.clientX-r.left,y:e.clientY-r.top});
        draw();
    };
    draw();
}