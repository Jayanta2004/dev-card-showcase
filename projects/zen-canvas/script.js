    (function() {
        const canvas = document.getElementById('zenCanvas');
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;

        // DOM elements
        const complexitySlider = document.getElementById('complexity');
        const complexityVal = document.getElementById('complexityVal');
        const densitySlider = document.getElementById('density');
        const densityVal = document.getElementById('densityVal');
        const softnessSlider = document.getElementById('softness');
        const softnessVal = document.getElementById('softnessVal');
        const primaryColorInput = document.getElementById('primaryColor');
        const secondaryColorInput = document.getElementById('secondaryColor');
        const primaryBox = document.getElementById('primaryColorBox');
        const secondaryBox = document.getElementById('secondaryColorBox');
        const seedInput = document.getElementById('seedInput');
        const applySeedBtn = document.getElementById('applySeed');
        const randomizeBtn = document.getElementById('randomizeBtn');
        const resetCanvasBtn = document.getElementById('resetCanvasBtn');
        const generationTag = document.getElementById('generationTag');
        const downloadBtn = document.getElementById('downloadBtn');

        // state
        let seed = 42;          // numeric seed
        let seedString = 'zen42';

        // pseudo-random number generator with seed (mulberry32)
        let rng = () => { seed = (seed + 0x9e3779b9) & 0xffffffff; let t = seed; t = Math.imul(t, 0x6c8e9cf7) ^ (t >>> 16); t = Math.imul(t, 0x9d38b3c3) ^ (t >>> 16); return (t >>> 0) / 0x100000000; };

        // set seed from string
        function setSeed(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
            }
            seed = hash >>> 0;
            seedString = str;
            rng(); // advance once
        }

        // generate art based on current params and seed
        function generateArt() {
            // read sliders
            const complexity = parseFloat(complexitySlider.value);   // number of "elements"
            const density = parseFloat(densitySlider.value);         // density factor (strokes per element)
            const softness = parseFloat(softnessSlider.value);       // blur/softness influence
            const col1 = primaryColorInput.value;
            const col2 = secondaryColorInput.value;

            // update display boxes
            primaryBox.style.backgroundColor = col1;
            secondaryBox.style.backgroundColor = col2;

            // reset canvas with light gradient background
            ctx.clearRect(0, 0, w, h);
            const grad = ctx.createLinearGradient(0, 0, w*0.6, h*0.8);
            grad.addColorStop(0, '#f4f1e6');
            grad.addColorStop(1, '#e4dfcd');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // draw soft layered circles / organic shapes
            const primaryRgb = hexToRgb(col1);
            const secondaryRgb = hexToRgb(col2);

            // number of main forms (complexity)
            const mainShapes = Math.floor(complexity / 2) + 8;
            let shapeCount = 0;

            for (let i = 0; i < mainShapes; i++) {
                // random properties using seeded rng
                const x = rng() * w;
                const y = rng() * h;
                const radiusBase = 30 + rng() * 120;
                // use density to modulate secondary shapes
                const subCount = Math.floor(density / 6) + 2 + Math.floor(rng() * 5);

                for (let j = 0; j < subCount; j++) {
                    const offsetX = (rng() - 0.5) * radiusBase * 0.9;
                    const offsetY = (rng() - 0.5) * radiusBase * 0.9;
                    const rad = radiusBase * (0.3 + rng() * 0.7);
                    const mix = rng();
                    // interpolate between primary and secondary
                    const r = Math.floor(primaryRgb.r * (1 - mix) + secondaryRgb.r * mix);
                    const g = Math.floor(primaryRgb.g * (1 - mix) + secondaryRgb.g * mix);
                    const b = Math.floor(primaryRgb.b * (1 - mix) + secondaryRgb.b * mix);

                    ctx.beginPath();
                    ctx.arc(x + offsetX, y + offsetY, rad, 0, 2 * Math.PI);
                    // set fill with opacity based on softness
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + (softness/40)})`; // softness influence transparency
                    ctx.filter = `blur(${softness * 0.6}px)`;
                    ctx.fill();
                    shapeCount++;

                    // extra tiny dots if density high
                    if (density > 40 && rng() > 0.6) {
                        ctx.beginPath();
                        ctx.arc(x + offsetX + (rng()-0.5)*25, y + offsetY + (rng()-0.5)*25, rad * 0.2, 0, 2*Math.PI);
                        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
                        ctx.filter = `blur(${softness * 0.3}px)`;
                        ctx.fill();
                        shapeCount++;
                    }
                }
            }

            // add some light flowing lines (zen)
            ctx.filter = `blur(${softness * 0.5}px)`;
            for (let k = 0; k < 6 + Math.floor(complexity/10); k++) {
                ctx.beginPath();
                const startX = rng() * w;
                const startY = rng() * h;
                const cp1x = startX + (rng()-0.5) * 150;
                const cp1y = startY + (rng()-0.5) * 120;
                const cp2x = startX + (rng()-0.5) * 200;
                const cp2y = startY + (rng()-0.5) * 180;
                const endX = rng() * w;
                const endY = rng() * h;
                ctx.moveTo(startX, startY);
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
                ctx.strokeStyle = `rgba(80, 90, 100, 0.25)`;
                ctx.lineWidth = 1.5 + rng() * 4;
                ctx.stroke();
                shapeCount++;
            }

            // reset filter
            ctx.filter = 'none';

            // update tag
            generationTag.innerText = `🌀 seed: ${seedString} · ${shapeCount} gestalts`;
        }

        // utility: hex to rgb
        function hexToRgb(hex) {
            const shorthand = hex.length === 4;
            let r = parseInt(shorthand ? hex[1]+hex[1] : hex.substring(1,3), 16);
            let g = parseInt(shorthand ? hex[2]+hex[2] : hex.substring(3,5), 16);
            let b = parseInt(shorthand ? hex[3]+hex[3] : hex.substring(5,7), 16);
            return {r, g, b};
        }

        // update sliders labels
        function updateLabels() {
            complexityVal.textContent = complexitySlider.value;
            densityVal.textContent = densitySlider.value;
            softnessVal.textContent = parseFloat(softnessSlider.value).toFixed(1);
        }

        // attach events
        complexitySlider.addEventListener('input', () => {
            updateLabels();
            generateArt();
        });
        densitySlider.addEventListener('input', () => {
            updateLabels();
            generateArt();
        });
        softnessSlider.addEventListener('input', () => {
            updateLabels();
            generateArt();
        });

        primaryColorInput.addEventListener('input', () => {
            primaryBox.style.backgroundColor = primaryColorInput.value;
            generateArt();
        });
        secondaryColorInput.addEventListener('input', () => {
            secondaryBox.style.backgroundColor = secondaryColorInput.value;
            generateArt();
        });

        // randomize all parameters & seed
        randomizeBtn.addEventListener('click', () => {
            // generate random seed string
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let newSeed = '';
            for (let i = 0; i < 6; i++) newSeed += chars[Math.floor(Math.random() * chars.length)];
            seedInput.value = newSeed;
            setSeed(newSeed);

            complexitySlider.value = Math.floor(15 + Math.random() * 90);
            densitySlider.value = Math.floor(8 + Math.random() * 60);
            softnessSlider.value = (Math.random() * 14).toFixed(1);

            // random colors
            const randomColor1 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            const randomColor2 = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            primaryColorInput.value = randomColor1;
            secondaryColorInput.value = randomColor2;
            primaryBox.style.backgroundColor = randomColor1;
            secondaryBox.style.backgroundColor = randomColor2;

            updateLabels();
            generateArt();
        });

        applySeedBtn.addEventListener('click', () => {
            const str = seedInput.value.trim() || 'seed';
            setSeed(str);
            generateArt();
        });

        resetCanvasBtn.addEventListener('click', () => {
            // reset to default parameters
            complexitySlider.value = 42;
            densitySlider.value = 30;
            softnessSlider.value = 6;
            primaryColorInput.value = '#d8786a';
            secondaryColorInput.value = '#5ba37e';
            seedInput.value = 'zen42';
            setSeed('zen42');
            updateLabels();
            generateArt();
        });

        // click canvas to regenerate (re-roll with same seed but adds variation)
        canvas.addEventListener('click', () => {
            // advance seed slightly to get new but deterministic variation
            seed = (seed + 97) & 0xffffffff;  // shift
            generateArt();
        });

        // download as PNG
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = `zen-${seedString}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });

        // initial set seed and generate
        setSeed('zen42');
        updateLabels();
        generateArt();
    })();