    (function() {
      // seed types (logic gates)
      const seedTypes = [
        { emoji: '🌿', name: 'leaf', logic: 'AND', color: '#b0d3b0' },
        { emoji: '🌸', name: 'flower', logic: 'OR', color: '#f9b5b5' },
        { emoji: '🍄', name: 'mushroom', logic: 'XOR', color: '#d6b596' },
        { emoji: '🌞', name: 'sun', logic: 'NOT', color: '#f9e66b' },
        { emoji: '🌙', name: 'moon', logic: 'NAND', color: '#c2c1a5' },
        { emoji: '⭐', name: 'star', logic: 'NOR', color: '#ecd59c' }
      ];

      let currentSeedIndex = 0; // default leaf
      let seeds = []; // { x, y, typeIndex, id, value (0/1) }

      const canvas = document.getElementById('logicCanvas');
      const ctx = canvas.getContext('2d');
      const seedPalette = document.getElementById('seedPalette');
      const seedCounter = document.getElementById('seedCounter');
      const flowerContainer = document.getElementById('flowerContainer');
      const evaluateBtn = document.getElementById('evaluateBtn');
      const clearBtn = document.getElementById('clearBtn');
      const randomBtn = document.getElementById('randomBtn');

      let width = canvas.width;
      let height = canvas.height;

      // render seed palette
      function renderPalette() {
        let html = '';
        seedTypes.forEach((seed, idx) => {
          html += `
            <div class="seed-card ${idx === currentSeedIndex ? 'active' : ''}" data-index="${idx}">
              <span class="seed-emoji">${seed.emoji}</span>
              <span class="seed-name">${seed.name}</span>
              <span class="seed-type">${seed.logic}</span>
            </div>
          `;
        });
        seedPalette.innerHTML = html;

        document.querySelectorAll('.seed-card').forEach(card => {
          card.addEventListener('click', () => {
            document.querySelectorAll('.seed-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentSeedIndex = parseInt(card.dataset.index, 10);
          });
        });
      }

      // draw garden
      function drawGarden() {
        ctx.clearRect(0, 0, width, height);

        // soft grid
        ctx.strokeStyle = '#e8d9c5';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.strokeStyle = '#eadac2';
          ctx.stroke();
        }
        for (let i = 0; i < height; i += 40) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(width, i);
          ctx.strokeStyle = '#eadac2';
          ctx.stroke();
        }

        // draw seeds
        seeds.forEach(seed => {
          const type = seedTypes[seed.typeIndex];
          ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji"';
          ctx.fillStyle = '#4d3f2e';
          ctx.fillText(type.emoji, seed.x - 20, seed.y - 10);

          // draw connection nodes (small dots for logic)
          ctx.beginPath();
          ctx.arc(seed.x, seed.y + 15, 8, 0, 2 * Math.PI);
          ctx.fillStyle = seed.value ? '#8fc97f' : '#c9a87c';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#b3926e';
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#6b4f3f';
          ctx.lineWidth = 2;
          ctx.stroke();

          // label
          ctx.font = '14px "Inter"';
          ctx.fillStyle = '#5a4a3a';
          ctx.fillText(type.logic, seed.x - 18, seed.y - 30);
        });
      }

      // add seed at click
      function addSeed(mx, my) {
        // check boundaries
        if (mx < 30 || mx > width - 30 || my < 40 || my > height - 40) return;

        // avoid overlapping too close
        for (let s of seeds) {
          const dx = Math.abs(s.x - mx);
          const dy = Math.abs(s.y - my);
          if (dx < 40 && dy < 40) {
            flowerContainer.innerHTML = '<div class="flower-chip"><span class="flower-emoji">🌱</span><span class="flower-text">too close</span></div>';
            return;
          }
        }

        seeds.push({
          id: 'seed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          x: mx,
          y: my,
          typeIndex: currentSeedIndex,
          value: Math.random() < 0.5 ? 0 : 1 // random initial value
        });
        updateSeedCounter();
        drawGarden();
      }

      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        addSeed(mx, my);
      });

      function updateSeedCounter() {
        seedCounter.innerText = seeds.length + ' seed' + (seeds.length !== 1 ? 's' : '');
      }

      // evaluate logic (bloom)
      function evaluateBloom() {
        if (seeds.length === 0) {
          flowerContainer.innerHTML = '<div class="empty-garden">🌿 no seeds to bloom</div>';
          return;
        }

        // simulate simple logic: each seed's output depends on neighbors within 70px
        let results = [];
        seeds.forEach(seed => {
          const type = seedTypes[seed.typeIndex];
          // find neighbors
          const neighbors = seeds.filter(s => {
            if (s.id === seed.id) return false;
            const dx = s.x - seed.x;
            const dy = s.y - seed.y;
            return Math.sqrt(dx*dx + dy*dy) < 70;
          });

          let inputA = seed.value;
          let inputB = neighbors.length > 0 ? neighbors[0].value : 0;

          let output = 0;
          switch (type.logic) {
            case 'AND': output = inputA & inputB; break;
            case 'OR': output = inputA | inputB; break;
            case 'XOR': output = inputA ^ inputB; break;
            case 'NOT': output = inputA ? 0 : 1; break;
            case 'NAND': output = (inputA & inputB) ? 0 : 1; break;
            case 'NOR': output = (inputA | inputB) ? 0 : 1; break;
            default: output = 0;
          }

          results.push({
            emoji: type.emoji,
            name: type.name,
            output: output,
            logic: type.logic
          });

          // update seed value (for next bloom)
          seed.value = output;
        });

        // render flowerbed
        let html = '';
        results.slice(0, 8).forEach(r => {
          html += `
            <div class="flower-chip">
              <span class="flower-emoji">${r.emoji}</span>
              <span class="flower-text">${r.logic} = ${r.output}</span>
            </div>
          `;
        });
        flowerContainer.innerHTML = html;
        drawGarden();
      }

      // clear all seeds
      clearBtn.addEventListener('click', () => {
        seeds = [];
        drawGarden();
        updateSeedCounter();
        flowerContainer.innerHTML = '<div class="empty-garden">🌿 garden cleared</div>';
      });

      // randomize values
      randomBtn.addEventListener('click', () => {
        seeds.forEach(s => s.value = Math.random() < 0.5 ? 0 : 1);
        drawGarden();
        flowerContainer.innerHTML = '<div class="empty-garden">✨ values randomized</div>';
      });

      evaluateBtn.addEventListener('click', evaluateBloom);

      // init
      renderPalette();

      // demo seeds
      function initDemo() {
        seeds.push({ id: 'd1', x: 200, y: 200, typeIndex: 0, value: 1 });
        seeds.push({ id: 'd2', x: 300, y: 200, typeIndex: 1, value: 0 });
        seeds.push({ id: 'd3', x: 250, y: 300, typeIndex: 2, value: 1 });
        drawGarden();
        updateSeedCounter();
      }
      initDemo();
    })();