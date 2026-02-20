    // ---------- LIGHT ICON GENERATOR · CANVAS STUDIO ----------
    (function(){
      "use strict";

      // ----- CANVAS SETUP -----
      const canvas = document.getElementById('iconCanvas');
      const ctx = canvas.getContext('2d');
      const size = 200; // canvas 200x200

      // ----- STATE -----
      let currentShape = 'circle';      // default
      let primaryColor = '#9bc4d2';    // soft pastel blue
      let secondaryColor = '#f1d3b3';  // warm sand
      let iconScale = 80;             // percent
      let rotationAngle = 0;          // degrees
      let cornerRadius = 20;          // for square / hexagon (0-50)

      // ----- DOM ELEMENTS -----
      const shapeBtns = document.querySelectorAll('.shape-btn');
      const primaryInput = document.getElementById('primaryColor');
      const secondaryInput = document.getElementById('secondaryColor');
      const sizeSlider = document.getElementById('sizeSlider');
      const sizeValue = document.getElementById('sizeValue');
      const rotationSlider = document.getElementById('rotationSlider');
      const rotationValue = document.getElementById('rotationValue');
      const cornerSlider = document.getElementById('cornerSlider');
      const cornerValue = document.getElementById('cornerValue');
      const cornerGroup = document.getElementById('cornerRadiusGroup');
      const randomizeBtn = document.getElementById('randomizeBtn');
      const downloadBtn = document.getElementById('downloadBtn');

      // ----- INITIAL UPDATE -----
      function updateIcon() {
        // read current values from inputs
        primaryColor = primaryInput.value;
        secondaryColor = secondaryInput.value;
        iconScale = parseInt(sizeSlider.value, 10);
        rotationAngle = parseInt(rotationSlider.value, 10);
        cornerRadius = parseInt(cornerSlider.value, 10);

        // update labels
        sizeValue.textContent = iconScale + '%';
        rotationValue.textContent = rotationAngle + '°';
        cornerValue.textContent = cornerRadius + '%';

        // show/hide corner radius based on shape (circle/heart/star don't use radius)
        if (currentShape === 'square' || currentShape === 'hexagon') {
          cornerGroup.style.display = 'block';
        } else {
          cornerGroup.style.display = 'none';
        }

        drawIcon();
      }

      // ----- DRAWING ENGINE (light, crisp, modern) -----
      function drawIcon() {
        ctx.clearRect(0, 0, size, size);

        // soft background (transparent-like, but we draw subtle cross-grid)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // very light dotted grid (barely visible)
        ctx.strokeStyle = '#e7edf2';
        ctx.lineWidth = 0.4;
        for (let i=0; i<=4; i++) {
          ctx.beginPath();
          ctx.moveTo(i*50, 0);
          ctx.lineTo(i*50, size);
          ctx.strokeStyle = '#e2ecf2';
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i*50);
          ctx.lineTo(size, i*50);
          ctx.stroke();
        }

        // save context for rotation & scale
        ctx.save();

        // move to center, rotate, scale, then translate back
        const centerX = size / 2;
        const centerY = size / 2;
        ctx.translate(centerX, centerY);
        
        // rotation (radians)
        const rad = rotationAngle * Math.PI / 180;
        ctx.rotate(rad);
        
        // scale factor (0.3 to 1.0)
        const scaleFactor = iconScale / 100;
        ctx.scale(scaleFactor, scaleFactor);

        // go back to -center for drawing
        ctx.translate(-centerX, -centerY);

        // ----- DRAW SELECTED SHAPE (centered) -----
        ctx.save(); // extra save for clip if needed

        // primary fill style
        ctx.fillStyle = primaryColor;
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 6 * (1/scaleFactor); // scale stroke inversely? adjust
        if (scaleFactor > 0) ctx.lineWidth = 6 / scaleFactor; 

        // shape drawing
        if (currentShape === 'circle') {
          ctx.beginPath();
          ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
          ctx.fillStyle = primaryColor;
          ctx.fill();
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 8 / scaleFactor;
          ctx.stroke();
        }
        else if (currentShape === 'square') {
          const w = 130;
          const h = 130;
          const x = centerX - w/2;
          const y = centerY - h/2;
          const radius = (cornerRadius / 50) * 30; // map 0-50 → 0-30px

          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();

          ctx.fillStyle = primaryColor;
          ctx.fill();
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 8 / scaleFactor;
          ctx.stroke();
        }
        else if (currentShape === 'hexagon') {
          // soft hexagon
          const cx = centerX, cy = centerY;
          const hexRadius = 70;
          const rot = 0; // flat top? we want pointy top? classic orientation
          let points = 6;
          ctx.beginPath();
          for (let i = 0; i < points; i++) {
            let angle = (i * 2 * Math.PI) / points - Math.PI / 2; // rotate to point up
            let x = cx + hexRadius * Math.cos(angle);
            let y = cy + hexRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fillStyle = primaryColor;
          ctx.fill();

          // apply corner rounding via clip? but we just use stroke secondary
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 8 / scaleFactor;
          ctx.stroke();
        }
        else if (currentShape === 'star') {
          // five-point star
          const cx = centerX, cy = centerY;
          const outerR = 70;
          const innerR = 32;
          let rot = Math.PI / 2 * 3;
          const step = Math.PI / 5;

          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            // outer point
            let x = cx + Math.cos(rot) * outerR;
            let y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += step;

            // inner point
            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.closePath();
          ctx.fillStyle = primaryColor;
          ctx.fill();
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 6 / scaleFactor;
          ctx.stroke();
        }
        else if (currentShape === 'heart') {
          // classic heart
          const cx = centerX, cy = centerY - 10;
          ctx.beginPath();
          ctx.moveTo(cx, cy + 20);
          ctx.bezierCurveTo(cx - 30, cy - 10, cx - 60, cy + 20, cx, cy + 60);
          ctx.bezierCurveTo(cx + 60, cy + 20, cx + 30, cy - 10, cx, cy + 20);
          ctx.closePath();
          ctx.fillStyle = primaryColor;
          ctx.fill();
          ctx.strokeStyle = secondaryColor;
          ctx.lineWidth = 6 / scaleFactor;
          ctx.stroke();
        }

        ctx.restore(); // restore clip/scale
        ctx.restore(); // restore original transformation

        // tiny inner highlight (soft)
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
      }

      // ----- SHAPE SELECTION -----
      function setActiveShape(shape) {
        shapeBtns.forEach(btn => {
          const btnShape = btn.dataset.shape;
          if (btnShape === shape) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        currentShape = shape;
        updateIcon();
      }

      // ----- RANDOMIZE ICON -----
      function randomizeIcon() {
        // random shape
        const shapes = ['circle', 'square', 'hexagon', 'star', 'heart'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        setActiveShape(randomShape);

        // random colors (pastel-ish)
        const randomPastel = () => {
          const hue = Math.floor(Math.random() * 360);
          return `hsl(${hue}, 60%, 80%)`; // light, soft
        };
        primaryInput.value = hslToHex(Math.random() * 360, 60, 80);
        secondaryInput.value = hslToHex(Math.random() * 360, 50, 85);

        // random scale (50-100)
        sizeSlider.value = Math.floor(Math.random() * 60) + 40; // 40-100
        // random rotation 0-360
        rotationSlider.value = Math.floor(Math.random() * 360);
        // random corner radius (0-40)
        cornerSlider.value = Math.floor(Math.random() * 40);

        updateIcon();
      }

      // tiny helper hsl to hex (simple conversion for randomizer)
      function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      }

      // ----- DOWNLOAD CANVAS AS PNG -----
      function downloadPNG() {
        const link = document.createElement('a');
        link.download = `icon-${currentShape}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }

      // ----- EVENT LISTENERS -----
      function bindEvents() {
        // shape buttons
        shapeBtns.forEach(btn => {
          btn.addEventListener('click', function(e) {
            const shape = this.dataset.shape;
            setActiveShape(shape);
          });
        });

        // color pickers
        primaryInput.addEventListener('input', updateIcon);
        secondaryInput.addEventListener('input', updateIcon);

        // sliders
        sizeSlider.addEventListener('input', updateIcon);
        rotationSlider.addEventListener('input', updateIcon);
        cornerSlider.addEventListener('input', updateIcon);

        // randomize
        randomizeBtn.addEventListener('click', randomizeIcon);

        // download
        downloadBtn.addEventListener('click', downloadPNG);
      }

      // set default active shape
      setActiveShape('circle');
      bindEvents();
      updateIcon();

      // corner group visibility on init
      if (currentShape !== 'square' && currentShape !== 'hexagon') {
        cornerGroup.style.display = 'none';
      }
    })();