  const player = document.getElementById("player");
  const world = document.getElementById("world");
  const gravityUI = document.getElementById("gravityUI");
  const scoreUI = document.getElementById("scoreUI");

  let px = 200, py = 300, vy = 0;
  let cameraX = 0;
  let gravity = 0.8;
  let gravityDir = 1; 
  let onSurface = false;
  let isGameOver = false;

  let lastSpikeX = 400;
  let score = 0;
  const spikes = [];

  const keys = {};
  document.addEventListener("keydown", e => keys[e.key] = true);
  document.addEventListener("keyup", e => keys[e.key] = false);

  /* Gravity flip */
  setInterval(() => {
    gravityDir *= -1;
    gravityUI.textContent = gravityDir === 1 ? "Gravity: ↓" : "Gravity: ↑";
  }, 4000);

  function spawnSpike() {
    const spike = document.createElement("div");
    spike.classList.add("spike");

    const isTop = Math.random() > 0.5;
    if (isTop) spike.classList.add("down");

    spike.style.left = lastSpikeX + "px";
    spike.style.bottom = isTop ? "" : "60px";
    spike.style.top = isTop ? "60px" : "";

    spike.passed = false; 

    world.appendChild(spike);
    spikes.push(spike);

    lastSpikeX += 300 + Math.random() * 300;
  }

  function loop() {
    if (isGameOver) return;

    if (keys["ArrowRight"]) px += 4;
    if (keys["ArrowLeft"]) px -= 4;

    const centerX = window.innerWidth / 2;
    if (px - cameraX > centerX) cameraX = px - centerX;
    if (cameraX < 0) cameraX = 0;

    while (lastSpikeX < cameraX + window.innerWidth + 500) {
      spawnSpike();
    }

    if (keys["ArrowUp"] && onSurface) {
      vy = -14 * gravityDir;
      onSurface = false;
    }

    vy += gravity * gravityDir;
    py += vy;

    if (gravityDir === 1 && py >= window.innerHeight - 100) {
      py = window.innerHeight - 100;
      vy = 0;
      onSurface = true;
    }

    if (gravityDir === -1 && py <= 60) {
      py = 60;
      vy = 0;
      onSurface = true;
    }

    player.style.left = px + "px";
    player.style.top = py + "px";
    world.style.transform = `translateX(${-cameraX}px)`;

    const p = player.getBoundingClientRect();

    spikes.forEach(spike => {
      const s = spike.getBoundingClientRect();

      if (
        p.right > s.left &&
        p.left < s.right &&
        p.bottom > s.top &&
        p.top < s.bottom
      ) {
        isGameOver = true;
        alert("Game Over ☠️\nScore: " + score);
        location.reload();
      }

      if (!spike.passed && p.left > s.right) {
        spike.passed = true;
        score++;
        scoreUI.textContent = "Score: " + score;
      }
    });

    requestAnimationFrame(loop);
  }

  loop();