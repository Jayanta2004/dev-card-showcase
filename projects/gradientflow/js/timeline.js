// Timeline Animation for GradientFlow
// Keyframe-based animation of gradient parameters

export class Timeline {
  constructor(onUpdate) {
    this.keyframes = [];
    this.onUpdate = onUpdate;
    this.currentTime = 0;
    this.duration = 5; // seconds
    this.playing = false;
    this.timer = null;
  }
  addKeyframe(time, params) {
    this.keyframes.push({time, params});
    this.keyframes.sort((a,b)=>a.time-b.time);
  }
  play() {
    this.playing = true;
    this.currentTime = 0;
    this._tick();
  }
  pause() {
    this.playing = false;
    if (this.timer) clearTimeout(this.timer);
  }
  _tick() {
    if (!this.playing) return;
    this.currentTime += 0.016;
    if (this.currentTime > this.duration) {
      this.currentTime = 0;
    }
    let params = this.interpolate(this.currentTime);
    if (this.onUpdate) this.onUpdate(params);
    this.timer = setTimeout(()=>this._tick(), 16);
  }
  interpolate(time) {
    // ... Interpolate between keyframes ...
    return {};
  }
}
