// Interactive Particle Overlay for GradientFlow
// Animated particles that interact with gradient and user input

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this._resize();
    window.addEventListener('resize', ()=>this._resize());
  }
  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  start() {
    this.running = true;
    this._loop();
  }
  stop() {
    this.running = false;
  }
  _loop() {
    if (!this.running) return;
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.update();
    this.draw();
    requestAnimationFrame(()=>this._loop());
  }
  update() {
    // ... Update particle positions, handle interactions ...
  }
  draw() {
    // ... Draw particles ...
  }
  addParticle(p) {
    this.particles.push(p);
  }
}
