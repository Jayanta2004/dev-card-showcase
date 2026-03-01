'use strict';
class TitanFlesh {
  constructor(canvas){
    this.canvas=canvas;
    this._bodies=[];this._time=0;this._tearFlash=0;
    this._strikePower=CFG.STRIKE_POWER??1;
    this._tearEnabled=true;this._rippleEnabled=true;
    this._tearThresh=CFG.SPRING_TEAR_THRESHOLD??800;
    this._mutation=null;this._lastStrike=null;this._totalStrikes=0;
  }
  build(){
    this._bodies=[];this._tearFlash=0;this._time=0;this._totalStrikes=0;
    const cx=this.canvas.width*.5,cy=this.canvas.height*.5;
    const b=new FleshBody(this.canvas,{cx,cy,rx:CFG.BODY_RX??180,ry:CFG.BODY_RY??140});
    b.build();
    b.tearEnabled=this._tearEnabled;
    b.rippleEnabled=this._rippleEnabled;
    b.setTearThreshold(this._tearThresh);
    this._bodies.push(b);
    this._mutation=new MutationSystem(b);
  }
  reset(){
    if(this._mutation)this._mutation.reset?.();
    this.build();
  }
  update(dt){
    if(!dt||dt<=0)return;
    this._time+=dt;
    const clampedDt=Math.min(dt,50);
    for(const b of this._bodies)b.update(clampedDt);
    if(this._mutation)this._mutation.update(clampedDt);
    this._tearFlash=Math.max(0,this._tearFlash-dt*.0025);
  }
  handleStrike(x,y,force){
    this._totalStrikes++;
    this._lastStrike={x,y,force,time:this._time};
    const flashAmt=MathUtils.clamp(force*.8,0,1);
    this._tearFlash=Math.min(1,Math.max(this._tearFlash,flashAmt*.7));
    for(const b of this._bodies)b.strike(x,y,force*this._strikePower,CFG.STRIKE_RADIUS??80);
  }
  handleDrag(x,y,dx,dy,force){
    for(const b of this._bodies)b.drag(x,y,dx,dy,force*this._strikePower*.5);
  }
  buildRenderState(){
    if(!this._bodies.length)return null;
    const b=this._bodies[0];
    const tris=b.triangles
      .filter(t=>t.a&&t.b&&t.c&&!t.a.dead&&!t.b.dead&&!t.c.dead)
      .map(t=>({
        a:{x:t.a.pos.x,y:t.a.pos.y},
        b:{x:t.b.pos.x,y:t.b.pos.y},
        c:{x:t.c.pos.x,y:t.c.pos.y},
        pressure:t.pressureRatio??0,
        stress:Math.max(t.a.stressLevel??0,t.b.stressLevel??0,t.c.stressLevel??0)
      }));
    const bl=b.lattice?.boundaryLoop??[];
    const boundary=bl.filter(p=>!p.dead).map(p=>({x:p.pos.x,y:p.pos.y}));
    const particles=b.particles
      .filter(p=>!p.dead)
      .map(p=>({
        x:p.pos.x,y:p.pos.y,
        pressure:p.pressure??0,stress:p.stressLevel??0,
        glow:p.glowIntensity??0,
        spike:p.spikeLength??0,spikeAngle:p.spikeAngle??0,
        vel:{x:p.pos.x-p.prevPos.x,y:p.pos.y-p.prevPos.y}
      }));
    const springs=b.springs
      .map(s=>({
        ax:s.a.pos.x,ay:s.a.pos.y,bx:s.b.pos.x,by:s.b.pos.y,
        type:s.type,stressRatio:s._stressRatio??0,torn:s.torn
      }));
    const tearMarkers=b.tearEvents??[];
    return{triangles:tris,boundaryLoop:boundary,particles,springs,tearMarkers,tearFlash:this._tearFlash,time:this._time};
  }
  getStats(){
    const b=this._bodies[0];
    if(!b)return{particles:0,springs:0,triangles:0,tears:0,pressure:1,mutations:0};
    return{
      particles:b.particles.filter(p=>!p.dead).length,
      springs:b.springs.filter(s=>!s.torn).length,
      triangles:b.triangles.length,
      tears:b.tearCount??0,
      pressure:b.pressure?.currentRatio??1,
      mutations:this._mutation?.totalTears??0
    };
  }
  set strikePower(v){this._strikePower=MathUtils.clamp(v,.1,10);}
  get strikePower(){return this._strikePower;}
  set tearEnabled(v){
    this._tearEnabled=!!v;
    for(const b of this._bodies)b.tearEnabled=this._tearEnabled;
  }
  get tearEnabled(){return this._tearEnabled;}
  set rippleEnabled(v){
    this._rippleEnabled=!!v;
    for(const b of this._bodies)b.rippleEnabled=this._rippleEnabled;
  }
  get rippleEnabled(){return this._rippleEnabled;}
  set tearThreshold(v){
    this._tearThresh=v;
    for(const b of this._bodies)b.setTearThreshold(v);
  }
  get bodies(){return this._bodies;}
  get totalStrikes(){return this._totalStrikes;}
  get simulationTime(){return this._time;}
}
