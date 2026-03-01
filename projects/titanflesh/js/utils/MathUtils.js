'use strict';
const MathUtils = (() => {
  const clamp=(v,lo,hi)=>v<lo?lo:v>hi?hi:v;
  const lerp=(a,b,t)=>a+(b-a)*t;
  const map=(v,a0,a1,b0,b1)=>b0+(v-a0)/(a1-a0)*(b1-b0);
  const sign=(v)=>v>0?1:v<0?-1:0;
  const fract=(v)=>v-Math.floor(v);
  const mod=(a,b)=>((a%b)+b)%b;
  const sq=(v)=>v*v;
  const abs=(v)=>v<0?-v:v;
  const min=(a,b)=>a<b?a:b;
  const max=(a,b)=>a>b?a:b;
  const mix=(a,b,t)=>a*(1-t)+b*t;
  const smoothstep=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};
  const smootherstep=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*t*(t*(t*6-15)+10);};
  const easeIn=(t)=>t*t;
  const easeOut=(t)=>t*(2-t);
  const easeInOut=(t)=>t<.5?2*t*t:-1+(4-2*t)*t;
  const easeInCubic=(t)=>t*t*t;
  const easeOutCubic=(t)=>1-Math.pow(1-t,3);
  const easeInOutCubic=(t)=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const pulse=(t,c)=>smoothstep(0,c,t)*smoothstep(1,c,t);
  const TWO_PI=Math.PI*2,HALF_PI=Math.PI*.5,DEG2RAD=Math.PI/180,RAD2DEG=180/Math.PI;
  const wrapAngle=(a)=>mod(a,TWO_PI);
  const angleDiff=(a,b)=>{let d=mod(b-a,TWO_PI);if(d>Math.PI)d-=TWO_PI;return d;};
  const lerpAngle=(a,b,t)=>a+angleDiff(a,b)*t;
  const angleToDir=(a)=>({x:Math.cos(a),y:Math.sin(a)});
  const signedArea=(pts)=>{
    let area=0,n=pts.length;
    for(let i=0,j=n-1;i<n;j=i++)area+=pts[j].x*pts[i].y-pts[i].x*pts[j].y;
    return area*.5;
  };
  const polygonArea=(pts)=>Math.abs(signedArea(pts));
  const centroid=(pts)=>{
    const n=pts.length;let cx=0,cy=0,area=0;
    for(let i=0,j=n-1;i<n;j=i++){
      const cross=pts[j].x*pts[i].y-pts[i].x*pts[j].y;
      area+=cross;cx+=(pts[j].x+pts[i].x)*cross;cy+=(pts[j].y+pts[i].y)*cross;
    }
    area*=.5;
    if(Math.abs(area)<1e-10){
      let cx2=0,cy2=0;for(const p of pts){cx2+=p.pos?p.pos.x:p.x;cy2+=p.pos?p.pos.y:p.y;}
      return new Vec2(cx2/n,cy2/n);
    }
    const inv=1/(6*area);return new Vec2(cx*inv,cy*inv);
  };
  const circumcircle=(ax,ay,bx,by,cx,cy)=>{
    const D=2*(ax*(by-cy)+bx*(cy-ay)+cx*(ay-by));
    if(Math.abs(D)<1e-12)return null;
    const ax2=ax*ax+ay*ay,bx2=bx*bx+by*by,cx2=cx*cx+cy*cy;
    const ux=(ax2*(by-cy)+bx2*(cy-ay)+cx2*(ay-by))/D;
    const uy=(ax2*(cx-bx)+bx2*(ax-cx)+cx2*(bx-ax))/D;
    return{cx:ux,cy:uy,rSq:sq(ax-ux)+sq(ay-uy)};
  };
  const inCircumcircle=(px,py,circ)=>{
    if(!circ)return false;
    const dx=px-circ.cx,dy=py-circ.cy;
    return dx*dx+dy*dy<circ.rSq-1e-10;
  };
  const pointToSegmentDist=(px,py,ax,ay,bx,by)=>{
    const dx=bx-ax,dy=by-ay,lenSq=dx*dx+dy*dy;
    if(lenSq<1e-12)return Math.hypot(px-ax,py-ay);
    const t=clamp(((px-ax)*dx+(py-ay)*dy)/lenSq,0,1);
    return Math.hypot(px-ax-t*dx,py-ay-t*dy);
  };
  const segmentsIntersect=(ax,ay,bx,by,cx,cy,dx,dy)=>{
    const d1x=bx-ax,d1y=by-ay,d2x=dx-cx,d2y=dy-cy;
    const cross=d1x*d2y-d1y*d2x;if(Math.abs(cross)<1e-10)return false;
    const t=((cx-ax)*d2y-(cy-ay)*d2x)/cross;
    const u=((cx-ax)*d1y-(cy-ay)*d1x)/cross;
    return t>=0&&t<=1&&u>=0&&u<=1;
  };
  const _perm=new Uint8Array(512);
  (() => {
    const p=new Uint8Array(256);for(let i=0;i<256;i++)p[i]=i;
    for(let i=255;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
    for(let i=0;i<512;i++)_perm[i]=p[i&255];
  })();
  const _grad2=[[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  const _dot2d=(gi,x,y)=>{const g=_grad2[gi%8];return g[0]*x+g[1]*y;};
  const noise2D=(xin,yin)=>{
    const F2=.5*(Math.sqrt(3)-1),G2=(3-Math.sqrt(3))/6;
    const s=(xin+yin)*F2,i=Math.floor(xin+s),j=Math.floor(yin+s);
    const t=(i+j)*G2,X0=i-t,Y0=j-t,x0=xin-X0,y0=yin-Y0;
    const[i1,j1]=x0>y0?[1,0]:[0,1];
    const x1=x0-i1+G2,y1=y0-j1+G2,x2=x0-1+2*G2,y2=y0-1+2*G2;
    const ii=i&255,jj=j&255;
    const gi0=_perm[ii+_perm[jj]]%8,gi1=_perm[ii+i1+_perm[jj+j1]]%8,gi2=_perm[ii+1+_perm[jj+1]]%8;
    let n=0;
    let t0=.5-x0*x0-y0*y0;if(t0>0){t0*=t0;n+=t0*t0*_dot2d(gi0,x0,y0);}
    let t1=.5-x1*x1-y1*y1;if(t1>0){t1*=t1;n+=t1*t1*_dot2d(gi1,x1,y1);}
    let t2=.5-x2*x2-y2*y2;if(t2>0){t2*=t2;n+=t2*t2*_dot2d(gi2,x2,y2);}
    return 70*n;
  };
  const noise1D=(x)=>{const xi=Math.floor(x)&255,xf=easeInOut(x-Math.floor(x));return lerp((_perm[xi]/127.5)-1,(_perm[xi+1]/127.5)-1,xf);};
  const fbm=(x,y,oct=4,lac=2,gain=.5)=>{
    let val=0,amp=.5,freq=1,max=0;
    for(let i=0;i<oct;i++){val+=noise2D(x*freq,y*freq)*amp;max+=amp;amp*=gain;freq*=lac;}
    return max>0?val/max:0;
  };
  const hexToRgb=(hex)=>{
    const h=hex.replace('#','');
    return h.length===3?{r:parseInt(h[0]+h[0],16),g:parseInt(h[1]+h[1],16),b:parseInt(h[2]+h[2],16)}:{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
  };
  const lerpColor=(h0,h1,t)=>{
    const c0=hexToRgb(h0),c1=hexToRgb(h1);
    return`rgb(${Math.round(lerp(c0.r,c1.r,t))},${Math.round(lerp(c0.g,c1.g,t))},${Math.round(lerp(c0.b,c1.b,t))})`;
  };
  const pressureColor=(t)=>{
    t=clamp(t,0,1);
    if(t<.33)return lerpColor('#000012','#220044',t/.33);
    if(t<.66)return lerpColor('#220044','#8b0000',(t-.33)/.33);
    return lerpColor('#8b0000','#ff4400',(t-.66)/.34);
  };
  const hsl=(h,s,l,a=1)=>`hsla(${h},${s}%,${l}%,${a})`;
  const rgbStr=(r,g,b,a=1)=>`rgba(${r},${g},${b},${a})`;
  let _idc=0;const nextId=()=>++_idc;
  return{clamp,lerp,map,sign,fract,mod,sq,abs,min,max,mix,smoothstep,smootherstep,easeIn,easeOut,easeInOut,easeInCubic,easeOutCubic,easeInOutCubic,pulse,TWO_PI,HALF_PI,DEG2RAD,RAD2DEG,wrapAngle,angleDiff,lerpAngle,angleToDir,signedArea,polygonArea,centroid,circumcircle,inCircumcircle,pointToSegmentDist,segmentsIntersect,noise1D,noise2D,fbm,hexToRgb,lerpColor,pressureColor,hsl,rgbStr,nextId};
})();
