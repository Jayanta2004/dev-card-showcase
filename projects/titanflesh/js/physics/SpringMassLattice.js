'use strict';
class SpringMassLattice {
  constructor(cfg={}){
    this.cx=cfg.cx??400;this.cy=cfg.cy??300;
    this.rx=cfg.rx??180;this.ry=cfg.ry??140;
    this.rings=cfg.rings??CFG.RINGS;
    this.ringPts=cfg.ringPts??CFG.RING_POINTS;
    this.particles=[];this.springs=[];this.boundaryLoop=[];
    this._springMap=new Map();
  }
  build(){
    this.particles=[];this.springs=[];this.boundaryLoop=[];this._springMap.clear();
    const{rings,ringPts,rx,ry,cx,cy}=this;
    const ringParticles=[];
    for(let r=0;r<rings;r++){
      const t=(r+1)/rings;
      const pr=Array.isArray(ringPts)?ringPts[r]:Math.round(6+r*5);
      const ring=[];
      for(let i=0;i<pr;i++){
        const a=(i/pr)*MathUtils.TWO_PI;
        const noiseSeed=cx*.01+cy*.01+r*.3+i*.2;
        const radialNoise=1+MathUtils.fbm(Math.cos(a)*1.5+r,Math.sin(a)*1.5+r,3)*(CFG.NOISE_AMP??0.18);
        const foldFreq=3+Math.floor(r*.5);
        const fold=Math.sin(a*foldFreq+r*.8)*((CFG.FOLD_AMP??0.12)*(1-t*.5));
        const prx=rx*t*radialNoise+fold*rx*.15;
        const pry=ry*t*radialNoise+fold*ry*.12;
        const px=cx+Math.cos(a)*prx;
        const py=cy+Math.sin(a)*pry;
        const posNoise=MathUtils.noise2D(px*.008,py*.008)*(CFG.NOISE_POS??4);
        const mass=CFG.BASE_MASS*(0.9+Math.random()*.2);
        const p=new Particle(px+posNoise,py+posNoise,mass);
        p.ring=r;p.ringIdx=i;p.ringTotal=pr;p.ringFrac=i/pr;p.baseRadius=Math.hypot(prx,pry);
        ring.push(p);this.particles.push(p);
      }
      ringParticles.push(ring);
    }
    for(let r=0;r<rings;r++){
      const ring=ringParticles[r],pr=ring.length;
      for(let i=0;i<pr;i++){
        this._addSpring(ring[i],ring[(i+1)%pr],SPRING_TYPE.EDGE);
      }
      if(r+1<rings){
        const next=ringParticles[r+1],pn=next.length;
        for(let i=0;i<pr;i++){
          const frac=i/pr;
          const ni=Math.round(frac*pn)%pn;
          const ni1=(ni+1)%pn;
          this._addSpring(ring[i],next[ni],SPRING_TYPE.STRUCTURAL);
          this._addSpring(ring[i],next[ni1],SPRING_TYPE.DIAGONAL);
          if(i>0)this._addSpring(ring[i-1],next[ni],SPRING_TYPE.DIAGONAL);
        }
      }
    }
    for(let r=0;r<rings;r+=2){
      const ring=ringParticles[r],pr=ring.length;
      const half=Math.floor(pr*.5);
      for(let i=0;i<half;i++){
        this._addSpring(ring[i],ring[(i+half)%pr],SPRING_TYPE.CROSS);
      }
    }
    const outerRing=ringParticles[rings-1];
    this.boundaryLoop=[...outerRing];
  }
  _addSpring(a,b,type){
    if(!a||!b||a===b)return null;
    const key=a.id<b.id?`${a.id}_${b.id}`:`${b.id}_${a.id}`;
    if(this._springMap.has(key))return this._springMap.get(key);
    const s=new Spring(a,b,type);
    this.springs.push(s);
    a.springs.push(s);b.springs.push(s);
    this._springMap.set(key,s);
    return s;
  }
  removeSpring(spring){
    const idx=this.springs.indexOf(spring);
    if(idx>=0)this.springs.splice(idx,1);
    const ai=spring.a.springs.indexOf(spring);if(ai>=0)spring.a.springs.splice(ai,1);
    const bi=spring.b.springs.indexOf(spring);if(bi>=0)spring.b.springs.splice(bi,1);
    spring.torn=true;
  }
  applyImpulseAt(x,y,forceMag,radius){
    const r2=radius*radius;
    for(const p of this.particles){
      const dx=p.pos.x-x,dy=p.pos.y-y;
      const distSq=dx*dx+dy*dy;
      if(distSq>=r2||distSq<1e-6)continue;
      const d=Math.sqrt(distSq);
      const t=1-d/radius;
      const mag=forceMag*t*t/p.mass;
      p.applyImpulse(dx/d*mag,dy/d*mag);
      p.stressLevel=Math.min(1,p.stressLevel+t*.4);
      p.glowIntensity=Math.min(1,p.glowIntensity+t*.6);
    }
  }
  getBoundaryArea(){
    const bl=this.boundaryLoop;if(bl.length<3)return 0;
    let area=0;const n=bl.length;
    for(let i=0,j=n-1;i<n;j=i++)area+=bl[j].pos.x*bl[i].pos.y-bl[i].pos.x*bl[j].pos.y;
    return Math.abs(area)*.5;
  }
  getBoundaryCentroid(){
    const bl=this.boundaryLoop;if(!bl.length)return{x:this.cx,y:this.cy};
    let sx=0,sy=0;for(const p of bl){sx+=p.pos.x;sy+=p.pos.y;}
    return{x:sx/bl.length,y:sy/bl.length};
  }
}
