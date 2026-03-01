document.addEventListener("DOMContentLoaded", () => {

const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body, Vector, Constraint } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;

const world = engine.world;

const canvas = document.getElementById("world");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: "transparent"
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
function createWalls() {
  return [
    Bodies.rectangle(window.innerWidth/2, window.innerHeight+30, window.innerWidth, 60, { isStatic: true }),
    Bodies.rectangle(-30, window.innerHeight/2, 60, window.innerHeight, { isStatic: true }),
    Bodies.rectangle(window.innerWidth+30, window.innerHeight/2, 60, window.innerHeight, { isStatic: true }),
    Bodies.rectangle(window.innerWidth/2, -30, window.innerWidth, 60, { isStatic: true })
  ];
}

Composite.add(world, createWalls());

// Projects
const projects = ["AI System", "Dashboard UI", "Game Engine", "Neural Tool", "Visualizer"];
const bodies = [];
const constraints = [];

projects.forEach((name, i) => {

  const box = Bodies.rectangle(
    Math.random()*window.innerWidth,
    Math.random()*window.innerHeight,
    220,
    130,
    {
      frictionAir: 0.03,
      restitution: 0.9,
      render: {
        fillStyle: "rgba(99,102,241,0.85)",
        strokeStyle: "#8b5cf6",
        lineWidth: 3
      }
    }
  );

  box.label = name;

  Body.setVelocity(box, {
    x: (Math.random()-0.5)*4,
    y: (Math.random()-0.5)*4
  });

  bodies.push(box);
  Composite.add(world, box);
});

// SPRING CONNECTIONS
for (let i = 0; i < bodies.length - 1; i++) {
  const spring = Constraint.create({
    bodyA: bodies[i],
    bodyB: bodies[i+1],
    stiffness: 0.02,
    render: { visible: false }
  });
  constraints.push(spring);
  Composite.add(world, spring);
}

// Mouse Drag
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: { stiffness: 0.08 }
});
Composite.add(world, mouseConstraint);

// Mouse Repulsion Field
canvas.addEventListener("mousemove", (e) => {

  const mousePos = { x: e.clientX, y: e.clientY };

  bodies.forEach(body => {
    const dist = Vector.magnitude(Vector.sub(body.position, mousePos));

    if (dist < 200) {
      const force = Vector.normalise(Vector.sub(body.position, mousePos));
      Body.applyForce(body, body.position, {
        x: force.x * 0.003,
        y: force.y * 0.003
      });
    }
  });

});

// Explosion
const explodeBtn = document.createElement("button");
explodeBtn.textContent = "Shockwave";
explodeBtn.style.position = "absolute";
explodeBtn.style.bottom = "25px";
explodeBtn.style.right = "25px";
explodeBtn.style.padding = "12px 20px";
explodeBtn.style.borderRadius = "14px";
explodeBtn.style.border = "none";
explodeBtn.style.background = "linear-gradient(90deg,#ef4444,#f97316)";
explodeBtn.style.color = "white";
explodeBtn.style.cursor = "pointer";
document.body.appendChild(explodeBtn);

explodeBtn.onclick = () => {
  bodies.forEach(body => {
    Body.applyForce(body, body.position, {
      x: (Math.random()-0.5)*0.07,
      y: (Math.random()-0.5)*0.07
    });
  });
};

// Glow Trail Renderer
Events.on(render, "afterRender", () => {

  const ctx = render.context;

  bodies.forEach(body => {
    ctx.beginPath();
    ctx.arc(body.position.x, body.position.y, 150, 0, Math.PI*2);
    ctx.strokeStyle = "rgba(99,102,241,0.05)";
    ctx.stroke();
  });

});

// Click Modal
Events.on(mouseConstraint, "mousedown", event => {

  const mousePosition = event.mouse.position;

  bodies.forEach(body => {
    if (Matter.Bounds.contains(body.bounds, mousePosition)) {
      document.getElementById("modal").style.display = "flex";
      document.getElementById("modalTitle").textContent = body.label;
    }
  });

});

// Close modal
document.getElementById("closeModal").onclick = () => {
  document.getElementById("modal").style.display = "none";
};

// Theme
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
};

// Resize
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;
});

});