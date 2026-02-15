    (function() {
      // ----- canvas & ui elements -----
      const canvas = document.getElementById('previewCanvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      // sliders & displays
      const edgeStrength = document.getElementById('edgeStrength');
      const edgeVal = document.getElementById('edgeVal');
      const colorLevels = document.getElementById('colorLevels');
      const levelsVal = document.getElementById('levelsVal');
      const smoothPasses = document.getElementById('smoothPasses');
      const smoothVal = document.getElementById('smoothVal');
      const invertEdgeCheck = document.getElementById('invertEdge');

      // buttons
      const fileInput = document.getElementById('fileInput');
      const fileNameDisplay = document.getElementById('fileNameDisplay');
      const samplePortrait = document.getElementById('samplePortrait');
      const sampleLandscape = document.getElementById('sampleLandscape');
      const sampleObject = document.getElementById('sampleObject');
      const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
      const downloadBtn = document.getElementById('downloadBtn');
      const refreshOriginal = document.getElementById('refreshOriginal');

      // internal state
      let originalImageData = null;           // store original image data (after upload/default)
      let originalWidth = 400, originalHeight = 300;
      let currentFileName = 'default sample';

      // ----- default sample (built-in colorful pattern) -----
      function drawDefaultSample() {
        canvas.width = 400; canvas.height = 300;
        ctx.clearRect(0, 0, 400, 300);
        // draw a fun test image: gradients, shapes, face-like
        const grd = ctx.createLinearGradient(0, 0, 400, 300);
        grd.addColorStop(0, '#f7c978');
        grd.addColorStop(0.5, '#c99e60');
        grd.addColorStop(1, '#8f6e4c');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 400, 300);
        // eye / mouth shapes
        ctx.fillStyle = '#a6521c';
        ctx.beginPath();
        ctx.arc(120, 120, 35, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#d47b42';
        ctx.beginPath();
        ctx.arc(280, 120, 40, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = '#302012';
        ctx.beginPath();
        ctx.arc(130, 130, 12, 0, 2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(290, 130, 14, 0, 2*Math.PI);
        ctx.fill();

        ctx.fillStyle = '#bc693a';
        ctx.beginPath();
        ctx.ellipse(200, 200, 70, 35, 0, 0, 2*Math.PI);
        ctx.fill();
        // store as original
        originalImageData = ctx.getImageData(0, 0, 400, 300);
        originalWidth = 400; originalHeight = 300;
        currentFileName = 'default sample';
        fileNameDisplay.innerText = currentFileName;
        applyCartoon(); // cartoonize initial
      }

      // ----- cartoonization core (simple sobel edge + posterize + smooth) -----
      function applyCartoon() {
        if (!originalImageData) return;

        const edgeW = parseFloat(edgeStrength.value);
        const levels = parseInt(colorLevels.value, 10);
        const smooth = parseInt(smoothPasses.value, 10);
        const invert = invertEdgeCheck.checked; // true = dark edges

        edgeVal.innerText = edgeW.toFixed(1);
        levelsVal.innerText = levels;
        smoothVal.innerText = smooth;

        // copy original data
        const srcData = new Uint8ClampedArray(originalImageData.data);
        const w = originalWidth, h = originalHeight;
        const dstData = new Uint8ClampedArray(srcData.length);

        // 1. posterize (simple quantization)
        const step = 255 / (levels - 1);
        for (let i = 0; i < srcData.length; i += 4) {
          let r = srcData[i];
          let g = srcData[i+1];
          let b = srcData[i+2];
          // quantize each channel independently (posterize)
          dstData[i] = Math.round(Math.round(r / step) * step);
          dstData[i+1] = Math.round(Math.round(g / step) * step);
          dstData[i+2] = Math.round(Math.round(b / step) * step);
          dstData[i+3] = srcData[i+3]; // alpha
        }

        // 2. simple edge detection (sobel-like intensity difference) on luminance of original
        const gray = new Uint8ClampedArray(w * h);
        for (let i = 0; i < srcData.length; i += 4) {
          const r = srcData[i];
          const g = srcData[i+1];
          const b = srcData[i+2];
          gray[i/4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        }

        const edgeMap = new Float32Array(w * h).fill(0);
        for (let y = 1; y < h-1; y++) {
          for (let x = 1; x < w-1; x++) {
            const idx = y * w + x;
            // horizontal gradient
            const gx = (gray[(y-1)*w + x-1] + 2*gray[y*w + x-1] + gray[(y+1)*w + x-1]) -
                       (gray[(y-1)*w + x+1] + 2*gray[y*w + x+1] + gray[(y+1)*w + x+1]);
            const gy = (gray[(y-1)*w + x-1] + 2*gray[(y-1)*w + x] + gray[(y-1)*w + x+1]) -
                       (gray[(y+1)*w + x-1] + 2*gray[(y+1)*w + x] + gray[(y+1)*w + x+1]);
            const mag = Math.sqrt(gx*gx + gy*gy) * (edgeW * 0.5); // scaled
            edgeMap[idx] = Math.min(mag, 255);
          }
        }

        // 3. combine: darken edges on quantized image
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = y * w + x;
            const edgeVal = edgeMap[idx] || 0;
            const pIdx = idx * 4;
            if (edgeVal > 8) { // threshold
              if (invert) {
                // darken: reduce rgb
                dstData[pIdx] = Math.max(0, dstData[pIdx] - edgeVal * 0.8);
                dstData[pIdx+1] = Math.max(0, dstData[pIdx+1] - edgeVal * 0.8);
                dstData[pIdx+2] = Math.max(0, dstData[pIdx+2] - edgeVal * 0.8);
              } else {
                // lighten (inverted) – just for fun, but we keep dark edges by default
                dstData[pIdx] = Math.min(255, dstData[pIdx] + edgeVal * 0.3);
                dstData[pIdx+1] = Math.min(255, dstData[pIdx+1] + edgeVal * 0.3);
                dstData[pIdx+2] = Math.min(255, dstData[pIdx+2] + edgeVal * 0.3);
              }
            }
          }
        }

        // 4. simple smoothing (box blur, number of passes)
        let finalData = dstData;
        for (let pass = 0; pass < smooth; pass++) {
          const temp = new Uint8ClampedArray(finalData.length);
          for (let y = 1; y < h-1; y++) {
            for (let x = 1; x < w-1; x++) {
              const i = (y * w + x) * 4;
              let r=0,g=0,b=0; let count=0;
              for (let dy = -1; dy <=1; dy++) {
                for (let dx = -1; dx <=1; dx++) {
                  const ni = ((y+dy) * w + (x+dx)) * 4;
                  r += finalData[ni];
                  g += finalData[ni+1];
                  b += finalData[ni+2];
                  count++;
                }
              }
              temp[i] = r/count; temp[i+1]=g/count; temp[i+2]=b/count; temp[i+3]=finalData[i+3];
            }
          }
          // copy edges
          for (let i = 0; i < finalData.length; i+=4) {
            if (temp[i] !== undefined) {
              finalData[i]=temp[i]; finalData[i+1]=temp[i+1]; finalData[i+2]=temp[i+2];
            }
          }
        }

        const outImage = new ImageData(finalData, w, h);
        ctx.putImageData(outImage, 0, 0);
      }

      // ----- load image from file or sample -----
      function loadImageFromFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // resize canvas to fit while preserving aspect (max 500 width)
            const maxW = 500, maxH = 400;
            let w = img.width, h = img.height;
            if (w > maxW) { h = (maxW / w) * h; w = maxW; }
            if (h > maxH) { w = (maxH / h) * w; h = maxH; }
            canvas.width = Math.floor(w); canvas.height = Math.floor(h);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalWidth = canvas.width; originalHeight = canvas.height;
            currentFileName = file.name;
            fileNameDisplay.innerText = currentFileName;
            applyCartoon();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      // load sample via URL (predefined images – we use emoji placeholders / create pattern)
      function loadSample(type) {
        canvas.width = 400; canvas.height = 300;
        ctx.clearRect(0,0,400,300);
        if (type === 'portrait') {
          // stylized face
          ctx.fillStyle = '#d69d5e'; ctx.fillRect(0,0,400,300);
          ctx.fillStyle = '#b57a4a'; ctx.beginPath(); ctx.ellipse(200,130,100,130,0,0,2*Math.PI); ctx.fill();
          ctx.fillStyle = '#f0c27b'; ctx.beginPath(); ctx.ellipse(150,100,30,40,0,0,2*Math.PI); ctx.fill();
          ctx.beginPath(); ctx.ellipse(250,100,30,40,0,0,2*Math.PI); ctx.fill();
          ctx.fillStyle = '#421c0c'; ctx.beginPath(); ctx.arc(160,120,8,0,2*Math.PI); ctx.fill();
          ctx.beginPath(); ctx.arc(240,120,8,0,2*Math.PI); ctx.fill();
          ctx.fillStyle = '#ab5f35'; ctx.beginPath(); ctx.ellipse(200,190,40,20,0,0,2*Math.PI); ctx.fill();
        } else if (type === 'landscape') {
          ctx.fillStyle = '#88aa55'; ctx.fillRect(0,150,400,150);
          ctx.fillStyle = '#5d814a'; ctx.fillRect(0,200,400,100);
          ctx.fillStyle = '#3d6f42'; ctx.beginPath(); ctx.arc(80,130,60,0,2*Math.PI); ctx.fill();
          ctx.beginPath(); ctx.arc(300,80,70,0,2*Math.PI); ctx.fill();
          ctx.fillStyle = '#c9ae74'; beginPath(ctx).arc(200,200,30,0,2*Math.PI); ctx.fill(); // rock?
        } else if (type === 'object') {
          ctx.fillStyle = '#cf7f4a'; ctx.fillRect(0,0,400,300);
          ctx.fillStyle = '#a25228'; ctx.beginPath(); ctx.ellipse(200,150,80,100,0,0,2*Math.PI); ctx.fill();
          ctx.fillStyle = '#8b5a2b'; ctx.beginPath(); ctx.arc(200,100,30,0,2*Math.PI); ctx.fill();
        }
        originalImageData = ctx.getImageData(0, 0, 400, 300);
        originalWidth = 400; originalHeight = 300;
        currentFileName = type + ' sample';
        fileNameDisplay.innerText = currentFileName;
        applyCartoon();
      }

      // reset filters to default values
      function resetFilters() {
        edgeStrength.value = '2.0';
        colorLevels.value = '6';
        smoothPasses.value = '1';
        invertEdgeCheck.checked = true;
        applyCartoon();
      }

      // revert to original (without cartoon)
      function revertOriginal() {
        if (originalImageData) {
          ctx.putImageData(originalImageData, 0, 0);
          // but we keep filters, we need to reapply? actually revert means show original, then reapply?
          // we want to see original: just draw original. we can then apply cartoon on demand? we have applyCartoon.
          // revert = show unmodified.
          ctx.putImageData(originalImageData, 0, 0);
          // but we want to keep ability to reapply: we can call applyCartoon after revert? not exactly.
          // better: use a flag. but simple: revert to original (temporarily show original). we'll also set a state.
          // for UX we create separate "refreshOriginal" that shows original.
        }
      }

      // Event listeners
      edgeStrength.addEventListener('input', applyCartoon);
      colorLevels.addEventListener('input', applyCartoon);
      smoothPasses.addEventListener('input', applyCartoon);
      invertEdgeCheck.addEventListener('change', applyCartoon);

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) loadImageFromFile(e.target.files[0]);
      });

      samplePortrait.addEventListener('click', () => loadSample('portrait'));
      sampleLandscape.addEventListener('click', () => loadSample('landscape'));
      sampleObject.addEventListener('click', () => loadSample('object'));

      resetDefaultsBtn.addEventListener('click', resetFilters);

      refreshOriginal.addEventListener('click', () => {
        if (originalImageData) {
          ctx.putImageData(originalImageData, 0, 0);
        }
      });

      downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'cartoonized.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });

      // init
      drawDefaultSample();
    })();