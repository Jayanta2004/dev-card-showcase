'use strict';
class InputHandler {
  constructor(canvas){
    this.canvas=canvas;
    this._crosshair=null;this._mouseX=0;this._mouseY=0;
    this._dragging=false;this._dragStart={x:0,y:0};
    this._lastDragPos={x:0,y:0};this._dragThrottle=0;
    this._forceScale=1;this._touchId=null;
    this.onStrike=null;this.onDrag=null;this.onRelease=null;
    this._boundMouseMove=this._onMouseMove.bind(this);
    this._boundMouseDown=this._onMouseDown.bind(this);
    this._boundMouseUp=this._onMouseUp.bind(this);
    this._boundWheel=this._onWheel.bind(this);
    this._boundTouchStart=this._onTouchStart.bind(this);
    this._boundTouchMove=this._onTouchMove.bind(this);
    this._boundTouchEnd=this._onTouchEnd.bind(this);
    this._boundContextMenu=e=>e.preventDefault();
  }
  init(){
    this._crosshair=document.getElementById('crosshair');
    this.canvas.addEventListener('mousemove',this._boundMouseMove);
    this.canvas.addEventListener('mousedown',this._boundMouseDown);
    window.addEventListener('mouseup',this._boundMouseUp);
    this.canvas.addEventListener('wheel',this._boundWheel,{passive:false});
    this.canvas.addEventListener('touchstart',this._boundTouchStart,{passive:false});
    this.canvas.addEventListener('touchmove',this._boundTouchMove,{passive:false});
    this.canvas.addEventListener('touchend',this._boundTouchEnd);
    this.canvas.addEventListener('contextmenu',this._boundContextMenu);
    this._updateCrosshair(window.innerWidth*.5,window.innerHeight*.5);
  }
  destroy(){
    this.canvas.removeEventListener('mousemove',this._boundMouseMove);
    this.canvas.removeEventListener('mousedown',this._boundMouseDown);
    window.removeEventListener('mouseup',this._boundMouseUp);
    this.canvas.removeEventListener('wheel',this._boundWheel);
    this.canvas.removeEventListener('touchstart',this._boundTouchStart);
    this.canvas.removeEventListener('touchmove',this._boundTouchMove);
    this.canvas.removeEventListener('touchend',this._boundTouchEnd);
    this.canvas.removeEventListener('contextmenu',this._boundContextMenu);
  }
  _onMouseMove(e){
    const{x,y}=this._getCanvasPos(e.clientX,e.clientY);
    this._mouseX=x;this._mouseY=y;this._updateCrosshair(e.clientX,e.clientY);
    if(this._dragging){
      const now=performance.now();
      if(now-this._dragThrottle>14){
        this._dragThrottle=now;
        const dx=x-this._lastDragPos.x,dy=y-this._lastDragPos.y;
        const dist=Math.hypot(dx,dy);
        if(dist>2&&this.onDrag)this.onDrag(x,y,dx,dy,MathUtils.clamp(dist*.08,0,1)*this._forceScale);
        this._lastDragPos={x,y};
      }
    }
  }
  _onMouseDown(e){
    const{x,y}=this._getCanvasPos(e.clientX,e.clientY);
    this._mouseX=x;this._mouseY=y;this._dragging=true;
    this._dragStart={x,y};this._lastDragPos={x,y};
    if(this._crosshair)this._crosshair.classList.add('dragging');
  }
  _onMouseUp(e){
    if(!this._dragging)return;
    this._dragging=false;
    if(this._crosshair)this._crosshair.classList.remove('dragging');
    const{x,y}=this._getCanvasPos(e.clientX,e.clientY);
    const dx=x-this._dragStart.x,dy=y-this._dragStart.y;
    const dist=Math.hypot(dx,dy);
    const force=MathUtils.clamp(dist*.05+.4,0.2,1)*this._forceScale;
    if(this.onStrike)this.onStrike(x,y,force);
    if(this.onRelease)this.onRelease(x,y);
  }
  _onWheel(e){
    e.preventDefault();
    const delta=e.deltaY>0?1.1:1/1.1;
    this._forceScale=MathUtils.clamp(this._forceScale*delta,.2,3);
    document.getElementById('force-val')&&(document.getElementById('force-val').textContent=this._forceScale.toFixed(1)+'');
  }
  _onTouchStart(e){
    e.preventDefault();
    if(e.changedTouches.length===0)return;
    const touch=e.changedTouches[0];
    this._touchId=touch.identifier;
    const{x,y}=this._getCanvasPos(touch.clientX,touch.clientY);
    this._mouseX=x;this._mouseY=y;this._dragging=true;
    this._dragStart={x,y};this._lastDragPos={x,y};
    this._updateCrosshair(touch.clientX,touch.clientY);
  }
  _onTouchMove(e){
    e.preventDefault();
    const touch=Array.from(e.changedTouches).find(t=>t.identifier===this._touchId);
    if(!touch)return;
    const{x,y}=this._getCanvasPos(touch.clientX,touch.clientY);
    this._updateCrosshair(touch.clientX,touch.clientY);
    const now=performance.now();
    if(now-this._dragThrottle>16){
      this._dragThrottle=now;
      const dx=x-this._lastDragPos.x,dy=y-this._lastDragPos.y;
      const dist=Math.hypot(dx,dy);
      if(dist>2&&this.onDrag)this.onDrag(x,y,dx,dy,MathUtils.clamp(dist*.08,0,1)*this._forceScale);
      this._lastDragPos={x,y};
    }
  }
  _onTouchEnd(e){
    const touch=Array.from(e.changedTouches).find(t=>t.identifier===this._touchId);
    if(!touch)return;
    this._dragging=false;this._touchId=null;
    if(this._crosshair)this._crosshair.classList.remove('dragging');
    const{x,y}=this._getCanvasPos(touch.clientX,touch.clientY);
    const dx=x-this._dragStart.x,dy=y-this._dragStart.y;
    const dist=Math.hypot(dx,dy);
    const force=MathUtils.clamp(dist*.05+.4,.2,1)*this._forceScale;
    if(this.onStrike)this.onStrike(x,y,force);
    if(this.onRelease)this.onRelease(x,y);
  }
  _getCanvasPos(cx,cy){
    const rect=this.canvas.getBoundingClientRect();
    const scaleX=this.canvas.width/rect.width,scaleY=this.canvas.height/rect.height;
    return{x:(cx-rect.left)*scaleX,y:(cy-rect.top)*scaleY};
  }
  _updateCrosshair(cx,cy){
    if(!this._crosshair)return;
    this._crosshair.style.left=cx+'px';this._crosshair.style.top=cy+'px';
  }
  get mouseX(){return this._mouseX;}
  get mouseY(){return this._mouseY;}
  get dragging(){return this._dragging;}
  get forceScale(){return this._forceScale;}
  set forceScale(v){this._forceScale=MathUtils.clamp(v,.2,3);}
}
