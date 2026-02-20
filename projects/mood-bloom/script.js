    (function(){
      "use strict";

      const canvas = document.getElementById('gardenCanvas');
      const ctx = canvas.getContext('2d');
      const width = canvas.width;   // 700
      const height = canvas.height; // 420

      // ----- GARDEN STATE -----
      let flowers = [];            // each flower: x, y, mood, size, petalCount, stemHeight, bloomPhase
      let selectedMood = 'joy';    // default
      let seedCount = 24;
      let bloomCount = 0;

      // ----- UI hooks -----
      const bloomSpan = document.getElementById('bloomCount');
      const seedSpan = document.getElementById('seedCount');
      const moodButtons = document.querySelectorAll('.mood-petal');
      const canvasEl = canvas;

      // ----- INIT: sample garden (few starter flowers) -----
      function initGarden() {
        flowers = [
          { x: 180, y: 260, mood: 'joy', size: 26, petalCount: 8, stemHeight: 40, phase: 0.2 },
          { x: 320, y: 210, mood: 'calm', size: 22, petalCount: 6, stemHeight: 35, phase: 0.7 },
          { x: 500, y: 280, mood: 'playful', size: 30, petalCount: 10, stemHeight: 30, phase: 0.9 },
          { x: 90, y: 310, mood: 'love', size: 28, petalCount: 7, stemHeight: 38, phase: 0.5 },
          { x: 590, y: 200, mood: 'melancholy', size: 18, petalCount: 5, stemHeight: 45, phase: 0.3 },
        ];
        updateCounts();
        drawGarden();
      }

      // update stats
      function updateCounts() {
        bloomCount = flowers.length;
        bloomSpan.textContent = bloomCount;
        seedSpan.textContent = seedCount;
      }

      // ----- DRAW GARDEN (organic, soft, each mood unique) -----
      function drawGarden() {
        ctx.clearRect(0, 0, width, height);

        // soft ground gradient
        const groundGrad = ctx.createLinearGradient(0, height-40, 0, height);
        groundGrad.addColorStop(0, '#e1dad0');
        groundGrad.addColorStop(1, '#d6cdc0');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, height-30, width, 40);
        
        // very fine grass strokes
        ctx.strokeStyle = '#b8aaa0';
        ctx.lineWidth = 0.5;
        for (let i=0;i<20;i++) {
          ctx.beginPath();
          ctx.moveTo(i*35, height-30);
          ctx.lineTo(i*35-10, height-50);
          ctx.strokeStyle = '#c6bcae';
          ctx.stroke();
        }

        // draw each flower — unique by mood
        flowers.forEach(f => {
          drawFlower(f);
        });

        // if no flowers, draw a little prompt
        if (flowers.length === 0) {
          ctx.font = '300 22px Inter, sans-serif';
          ctx.fillStyle = '#9baea7';
          ctx.textAlign = 'center';
          ctx.fillText('🌱 plant a mood', width/2, height/2);
        }
      }

      // draw individual flower — unique petal shape, color, stem
      function drawFlower(flower) {
        const { x, y, mood, size, stemHeight, phase } = flower;
        const stemTopY = y - stemHeight;

        // draw stem (organic curve)
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x-4, stemTopY+8);
        ctx.lineTo(x+3, stemTopY-2);
        ctx.lineTo(x, stemTopY-4);
        ctx.strokeStyle = '#96a77d';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // tiny leaves
        ctx.fillStyle = '#aac0a0';
        ctx.beginPath();
        ctx.ellipse(x-6, y-stemHeight/2, 4, 2, 0.3, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x+5, y-stemHeight/2+6, 4, 2, -0.2, 0, Math.PI*2);
        ctx.fill();

        // flower head — mood decides palette + shape
        ctx.save();
        ctx.translate(x, stemTopY-4);

        // mood-specific styles
        switch (mood) {
          case 'joy':
            ctx.fillStyle = '#fbeba0'; // soft yellow
            ctx.shadowColor = '#e9d89a';
            drawPetalCircle(8, size*0.9, '#ffeaa5', '#f7d98c');
            break;
          case 'calm':
            ctx.fillStyle = '#c2ded0'; // soft mint
            ctx.shadowColor = '#aac2b6';
            drawPetalCircle(6, size*0.8, '#d2ecdc', '#b4d3c2');
            break;
          case 'playful':
            ctx.fillStyle = '#fbc0b0'; // peachy
            ctx.shadowColor = '#eaa696';
            drawPetalCircle(10, size*0.85, '#ffcfc0', '#fbb3a0');
            break;
          case 'melancholy':
            ctx.fillStyle = '#d9d0e0'; // lavender
            ctx.shadowColor = '#bcb1cc';
            drawPetalCircle(5, size*0.7, '#e2d7ed', '#cec1dd');
            break;
          case 'love':
            ctx.fillStyle = '#fbc0c0'; // soft rose
            ctx.shadowColor = '#eaa0a0';
            drawHeartFlower(size);
            break;
          default: break;
        }

        ctx.restore();

        // center of flower (common)
        ctx.beginPath();
        ctx.arc(x, stemTopY-4, size*0.2, 0, 2*Math.PI);
        ctx.fillStyle = '#faf2d7';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // helper: draw circle of petals
      function drawPetalCircle(count, radius, color1, color2) {
        for (let i=0; i<count; i++) {
          const angle = (i * 2 * Math.PI) / count + Date.now() * 0.0005; // tiny living motion
          const petalX = Math.cos(angle) * radius * 0.7;
          const petalY = Math.sin(angle) * radius * 0.7;
          ctx.save();
          ctx.translate(petalX, petalY);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, radius*0.4, radius*0.25, 0, 0, Math.PI*2);
          ctx.fillStyle = i % 2 === 0 ? color1 : color2;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      }

      // special love heart-flower
      function drawHeartFlower(size) {
        for (let i=0;i<5;i++) {
          const angle = i * 0.8;
          ctx.save();
          ctx.translate(Math.cos(angle)*size*0.5, Math.sin(angle)*size*0.4);
          ctx.beginPath();
          ctx.moveTo(0, 4);
          ctx.bezierCurveTo(-6, -2, -3, -8, 0, -4);
          ctx.bezierCurveTo(3, -8, 6, -2, 0, 4);
          ctx.fillStyle = '#ffc2c2';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      }

      // ----- PLANT NEW FLOWER (based on mood & click) -----
      function plantFlower(e) {
        if (seedCount <= 0) {
          alert('🌼 no seeds left — clear bed or water to regenerate');
          return;
        }

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;

        // boundary
        if (canvasY > height - 40) { // ground area
          // mood-based flower generation
          const mood = selectedMood;
          let size, petalCount, stemHeight;

          switch (mood) {
            case 'joy': size = 24 + Math.random()*10; petalCount = 8; stemHeight = 40 + Math.random()*15; break;
            case 'calm': size = 20 + Math.random()*8; petalCount = 6; stemHeight = 35 + Math.random()*20; break;
            case 'playful': size = 26 + Math.random()*12; petalCount = 10; stemHeight = 30 + Math.random()*15; break;
            case 'melancholy': size = 16 + Math.random()*8; petalCount = 5; stemHeight = 45 + Math.random()*10; break;
            case 'love': size = 22 + Math.random()*10; petalCount = 7; stemHeight = 38 + Math.random()*12; break;
            default: size = 22; petalCount = 6; stemHeight = 40;
          }

          flowers.push({
            x: canvasX,
            y: canvasY,
            mood: mood,
            size: size,
            petalCount: petalCount,
            stemHeight: stemHeight,
            phase: Math.random()
          });

          seedCount = Math.max(0, seedCount - 1);
          updateCounts();
          drawGarden();
        }
      }

      // ----- MOOD SELECTION -----
      function setActiveMood(mood) {
        selectedMood = mood;
        moodButtons.forEach(btn => {
          btn.classList.remove('active');
          if (btn.dataset.mood === mood) {
            btn.classList.add('active');
          }
        });
      }

      // ----- GARDEN ACTIONS (unique ui) -----
      function waterGarden() {
        // water: add 5 seeds and make flowers slightly larger
        seedCount += 5;
        flowers.forEach(f => {
          f.size *= 1.05;
          f.stemHeight += 2;
        });
        updateCounts();
        drawGarden();
      }

      function windBloom() {
        // soft wind: flowers sway (phase shift) + maybe new random bloom
        flowers.forEach(f => {
          f.phase = Math.random();
          f.x += (Math.random() - 0.5) * 6;
          f.y += (Math.random() - 0.5) * 2;
        });
        drawGarden();
      }

      function clearGarden() {
        flowers = [];
        seedCount = 24; // reset seeds
        updateCounts();
        drawGarden();
      }

      // ----- BIND EVENTS -----
      function bindEvents() {
        canvas.addEventListener('click', function(e) {
          plantFlower(e);
        });

        moodButtons.forEach(btn => {
          btn.addEventListener('click', function() {
            setActiveMood(this.dataset.mood);
          });
        });

        document.getElementById('waterBtn').addEventListener('click', waterGarden);
        document.getElementById('windBtn').addEventListener('click', windBloom);
        document.getElementById('clearGardenBtn').addEventListener('click', clearGarden);
      }

      // start
      initGarden();
      bindEvents();
    })();