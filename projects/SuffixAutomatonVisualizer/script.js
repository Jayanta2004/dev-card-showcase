const svg=document.getElementById("graph");

class State{
    constructor(){
        this.next={};
        this.link=-1;
        this.len=0;
    }
}

let st=[],last;

function saInit(){
    st=[new State()];
    last=0;
}

function saExtend(c){
    let cur=st.length;
    st.push(new State());
    st[cur].len=st[last].len+1;

    let p=last;
    while(p!=-1 && !st[p].next[c]){
        st[p].next[c]=cur;
        p=st[p].link;
    }

    if(p==-1) st[cur].link=0;
    else{
        let q=st[p].next[c];
        if(st[p].len+1==st[q].len)
            st[cur].link=q;
        else{
            let clone=st.length;
            st.push(new State());
            st[clone].len=st[p].len+1;
            st[clone].next={...st[q].next};
            st[clone].link=st[q].link;

            while(p!=-1 && st[p].next[c]==q){
                st[p].next[c]=clone;
                p=st[p].link;
            }
            st[q].link=st[cur].link=clone;
        }
    }
    last=cur;
}

function build(){
    const s=document.getElementById("str").value;
    saInit();
    for(let ch of s) saExtend(ch);
    draw();
}

function checkSubstring(){
    let t=document.getElementById("query").value;
    let v=0;
    for(let c of t){
        if(!st[v].next[c]){
            document.getElementById("result").innerText="Not a substring ❌";
            return;
        }
        v=st[v].next[c];
    }
    document.getElementById("result").innerText="Substring exists ✅";
}

function draw(){
    svg.innerHTML=`<defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
    <polygon points="0 0, 10 3, 0 6" fill="#64748b"/>
    </marker></defs>`;

    let R=200,cx=450,cy=260;
    let pos={};

    for(let i=0;i<st.length;i++){
        let ang=2*Math.PI*i/st.length;
        pos[i]={x:cx+R*Math.cos(ang),y:cy+R*Math.sin(ang)};
    }

    for(let i=0;i<st.length;i++){
        for(let c in st[i].next){
            let j=st[i].next[c];
            let line=create("line",{x1:pos[i].x,y1:pos[i].y,x2:pos[j].x,y2:pos[j].y,class:"edge"});
            svg.appendChild(line);

            let tx=(pos[i].x+pos[j].x)/2;
            let ty=(pos[i].y+pos[j].y)/2;
            svg.appendChild(create("text",{x:tx,y:ty,class:"label"},c));
        }
    }

    for(let i=0;i<st.length;i++){
        svg.appendChild(create("circle",{cx:pos[i].x,cy:pos[i].y,r:20,class:"state"}));
        svg.appendChild(create("text",{x:pos[i].x,y:pos[i].y,class:"label"},`${i}\nL${st[i].len}`));
    }
}

function create(tag,attrs,text){
    let el=document.createElementNS("http://www.w3.org/2000/svg",tag);
    for(let k in attrs)el.setAttribute(k,attrs[k]);
    if(text)el.textContent=text;
    return el;
}