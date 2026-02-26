const canvas = document.getElementById("fireflies");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const mouse = {
  x: canvas.width / 2,
  y: canvas.height / 2
};

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Firefly {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 2;
    this.speedX = (Math.random() - 0.5) * 1.5;
    this.speedY = (Math.random() - 0.5) * 1.5;
    this.glow = Math.random() * 0.5 + 0.5;
  }

  update() {
    // movement toward cursor
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 250) {
      this.x += dx * 0.002;
      this.y += dy * 0.002;
    }

    // natural floating movement
    this.x += this.speedX;
    this.y += this.speedY;

    // bounce edges
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

    // flicker effect
    this.glow += (Math.random() - 0.5) * 0.05;
    this.glow = Math.max(0.3, Math.min(1, this.glow));
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 150, ${this.glow})`;
    ctx.shadowColor = "rgba(255,255,150,0.9)";
    ctx.shadowBlur = 20;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const fireflies = [];
const COUNT = 60;

for (let i = 0; i < COUNT; i++) {
  fireflies.push(new Firefly());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  fireflies.forEach(f => {
    f.update();
    f.draw();
  });

  requestAnimationFrame(animate);
}

animate();