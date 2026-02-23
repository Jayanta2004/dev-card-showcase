// Live Gradient Editor for GradientFlow
// Drag-and-drop color stops, add/remove stops, real-time preview

export class GradientEditor {
  constructor(container, onChange) {
    this.container = container;
    this.onChange = onChange;
    this.stops = [{pos:0, color:'#fff'}, {pos:1, color:'#000'}];
    this.selectedStop = 0;
    this.initUI();
  }
  initUI() {
    // ... UI creation for color stops, drag handles, add/remove buttons ...
    // For brevity, actual DOM code will be added in the next step
  }
  setStops(stops) {
    this.stops = stops;
    this.render();
    if (this.onChange) this.onChange(this.stops);
  }
  addStop(pos, color) {
    this.stops.push({pos, color});
    this.stops.sort((a,b)=>a.pos-b.pos);
    this.render();
  }
  removeStop(idx) {
    if (this.stops.length <= 2) return;
    this.stops.splice(idx,1);
    this.render();
  }
  render() {
    // ... Render gradient bar and draggable stops ...
  }
}
