const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let objects = [];
let gravity = 0.5;
let paused = false;
let debug = false;

class Body {
  constructor(x, y, w, h, mass = 1) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.mass = mass;

    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;

    this.ax = 0;
    this.ay = gravity;

    this.restitution = 0.8;
    this.friction = 0.98;
  }

  applyForce(fx, fy) {
    this.ax += fx / this.mass;
    this.ay += fy / this.mass;
  }

  update() {
    this.vx += this.ax;
    this.vy += this.ay;

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= this.friction;

    this.ax = 0;
    this.ay = gravity;

    this.handleBounds();
  }

  handleBounds() {
    if (this.x < 0) {
      this.x = 0;
      this.vx *= -this.restitution;
    }
    if (this.x + this.w > canvas.width) {
      this.x = canvas.width - this.w;
      this.vx *= -this.restitution;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vy *= -this.restitution;
    }
    if (this.y + this.h > canvas.height) {
      this.y = canvas.height - this.h;
      this.vy *= -this.restitution;
    }
  }

  draw() {
    ctx.fillStyle = "#6366f1";
    ctx.fillRect(this.x, this.y, this.w, this.h);

    if (debug) {
      ctx.strokeStyle = "white";
      ctx.strokeRect(this.x, this.y, this.w, this.h);

      ctx.beginPath();
      ctx.moveTo(this.x + this.w/2, this.y + this.h/2);
      ctx.lineTo(this.x + this.w/2 + this.vx * 5, this.y + this.h/2 + this.vy * 5);
      ctx.stroke();
    }
  }
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function resolveCollision(a, b) {
  let overlapX = (a.x + a.w/2) - (b.x + b.w/2);
  let overlapY = (a.y + a.h/2) - (b.y + b.h/2);

  if (Math.abs(overlapX) > Math.abs(overlapY)) {
    a.vx *= -a.restitution;
    b.vx *= -b.restitution;
  } else {
    a.vy *= -a.restitution;
    b.vy *= -b.restitution;
  }
}

function update() {
  if (!paused) {
    objects.forEach(obj => obj.update());

    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        if (checkCollision(objects[i], objects[j])) {
          resolveCollision(objects[i], objects[j]);
        }
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  objects.forEach(obj => obj.draw());
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", (e) => {
  objects.push(new Body(e.clientX, e.clientY, 50, 50));
});

document.getElementById("pauseBtn").onclick = () => paused = !paused;

document.getElementById("explodeBtn").onclick = () => {
  objects.forEach(obj => {
    obj.applyForce((Math.random()-0.5)*20, (Math.random()-0.5)*20);
  });
};

document.getElementById("debugBtn").onclick = () => debug = !debug;

loop();