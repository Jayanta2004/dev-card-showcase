    (function(){
      "use strict";

      // ----- CANVAS SETUP -----
      const canvas = document.getElementById('targetCanvas');
      const ctx = canvas.getContext('2d');
      const width = canvas.width;   // 700
      const height = canvas.height; // 420

      // ----- GAME STATE (soft pastel palette) -----
      let targets = [];
      let score = 0;
      let hits = 0;
      let shots = 0;

      // ----- UI ELEMENTS -----
      const scoreEl = document.getElementById('scoreDisplay');
      const hitsEl = document.getElementById('hitsDisplay');
      const shotsEl = document.getElementById('shotsDisplay');
      const targetCountDisplay = document.getElementById('targetCountDisplay');

      // ----- TARGET CONFIG -----
      const TARGET_RADIUS = 26;      // nice hit area
      const MAX_TARGETS = 12;
      
      // ----- HELPER: generate random position (respect margins) -----
      function randomTargetPosition() {
        const margin = TARGET_RADIUS + 8;
        return {
          x: Math.random() * (width - margin * 2) + margin,
          y: Math.random() * (height - margin * 2) + margin,
        };
      }

      // ----- CREATE A FRESH TARGET (light color) -----
      function createTarget() {
        const pos = randomTargetPosition();
        return {
          x: pos.x,
          y: pos.y,
          r: TARGET_RADIUS,
          // soft pastel rings – will be drawn with opacity
        };
      }

      // ----- INIT / RESET: place 5 targets -----
      function initGame() {
        targets = [];
        for (let i = 0; i < 5; i++) {
          targets.push(createTarget());
        }
        score = 0;
        hits = 0;
        shots = 0;
        updateStats();
        draw();
      }

      // ----- ADD TARGET (if below max) -----
      function addTarget() {
        if (targets.length < MAX_TARGETS) {
          targets.push(createTarget());
          updateStats();
          draw();
        } else {
          // subtle feedback (no alert, just visual)
          targetCountDisplay.style.background = '#ffefef';
          setTimeout(() => targetCountDisplay.style.background = '', 200);
        }
      }

      // ----- UPDATE UI SCORE / HITS / SHOTS -----
      function updateStats() {
        scoreEl.textContent = score;
        hitsEl.textContent = hits;
        shotsEl.textContent = shots;
        targetCountDisplay.textContent = `${targets.length} target${targets.length !== 1 ? 's' : ''}`;
      }

      // ----- DRAW THE TARGET RANGE (light, airy aesthetics) -----
      function draw() {
        ctx.clearRect(0, 0, width, height);

        // very subtle paper texture
        ctx.fillStyle = '#fcfdff';
        ctx.fillRect(0, 0, width, height);
        
        // light grid lines (soft)
        ctx.strokeStyle = '#e2ecf2';
        ctx.lineWidth = 0.6;
        for (let i = 0; i <= 6; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 120, 0);
          ctx.lineTo(i * 120, height);
          ctx.strokeStyle = '#e0eaf0';
          ctx.stroke();
        }
        for (let i = 0; i <= 4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, i * 110);
          ctx.lineTo(width, i * 110);
          ctx.strokeStyle = '#e0eaf0';
          ctx.stroke();
        }

        // draw all targets – light style, semi-transparent rings
        targets.forEach((t, index) => {
          const x = t.x, y = t.y, r = t.r;
          
          // outer ring – very soft sand
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 2 * Math.PI);
          ctx.fillStyle = '#fff9e8';
          ctx.shadowColor = 'rgba(100,130,150,0.1)';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // middle ring (light peach)
          ctx.beginPath();
          ctx.arc(x, y, r * 0.7, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffeede';
          ctx.fill();
          
          // inner bullseye (soft coral)
          ctx.beginPath();
          ctx.arc(x, y, r * 0.35, 0, 2 * Math.PI);
          ctx.fillStyle = '#fdd7c4';
          ctx.fill();
          
          // tiny highlight
          ctx.beginPath();
          ctx.arc(x-3, y-3, 3, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();

          // very subtle outline
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 2 * Math.PI);
          ctx.strokeStyle = '#b8d0dd';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // inner ring accent
          ctx.beginPath();
          ctx.arc(x, y, r * 0.7, 0, 2 * Math.PI);
          ctx.strokeStyle = '#c8dae3';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // tiny crosshair hint (optional)
          ctx.beginPath();
          ctx.moveTo(x - 6, y);
          ctx.lineTo(x + 6, y);
          ctx.moveTo(x, y - 6);
          ctx.lineTo(x, y + 6);
          ctx.strokeStyle = 'rgba(150,180,200,0.2)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });

        // draw 'empty' message if no targets
        if (targets.length === 0) {
          ctx.font = '400 22px Inter, sans-serif';
          ctx.fillStyle = '#a4bac8';
          ctx.textAlign = 'center';
          ctx.fillText('✨ all targets cleared', width/2, height/2);
        }
      }

      // ----- HIT DETECTION (distance) -----
      function handleShoot(e) {
        // get click coordinates relative to canvas
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;   // canvas physical size / display size
        const scaleY = canvas.height / rect.height;
        const canvasRelativeX = (e.clientX - rect.left) * scaleX;
        const canvasRelativeY = (e.clientY - rect.top) * scaleY;

        shots++;
        let hitTargetIndex = -1;
        let hitDistance = Infinity;

        // find the closest target within radius
        targets.forEach((target, index) => {
          const dx = target.x - canvasRelativeX;
          const dy = target.y - canvasRelativeY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist <= target.r && dist < hitDistance) {
            hitDistance = dist;
            hitTargetIndex = index;
          }
        });

        if (hitTargetIndex !== -1) {
          // hit! remove target, increment score/hits
          targets.splice(hitTargetIndex, 1);
          hits++;
          // score: bullseye proximity: 10 + (remaining health just fun)
          score += 15;
          
          // optional: add a little pop effect (instant remove)
        } else {
          // miss: no score
        }

        // update UI
        updateStats();
        draw();

        // auto-refill if empty? no — player adds or reset
      }

      // ----- RESET (new game) -----
      function newGame() {
        targets = [];
        for (let i = 0; i < 5; i++) {
          targets.push(createTarget());
        }
        score = 0;
        hits = 0;
        shots = 0;
        updateStats();
        draw();
      }

      // ----- BIND EVENTS -----
      function bindEvents() {
        canvas.addEventListener('click', function(e) {
          handleShoot(e);
        });

        document.getElementById('newGameBtn').addEventListener('click', function() {
          newGame();
        });

        document.getElementById('addTargetBtn').addEventListener('click', function() {
          addTarget();
        });
      }

      // ensure canvas resets on window resize? not needed, but we keep.
      // initialize
      initGame();
      bindEvents();

      // for extra smoothness: redraw if needed, but mostly done
      // optional: adjust target count on add
    })();