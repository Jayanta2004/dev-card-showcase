    (function() {
        // canvas & context
        const canvas = document.getElementById('functionCanvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // DOM elements
        const functionInput = document.getElementById('functionInput');
        const rangeSlider = document.getElementById('rangeSlider');
        const rangeSpan = document.getElementById('rangeValue');
        const coordDisplay = document.getElementById('coordDisplay');
        const resetBtn = document.getElementById('resetViewBtn');
        const presetBtns = document.querySelectorAll('.preset-btn');

        // current settings
        let xMin = -6, xMax = 6;
        let yMin = -4, yMax = 4;   // dynamic, but we'll auto-scale y based on function

        // mouse tracking
        let mouseX = 0, mouseY = 0;
        let showCoord = false;

        // function to evaluate
        let currentFn = (x) => Math.sin(x); // default

        // update function from input string
        function updateFunctionFromInput() {
            const expr = functionInput.value.trim();
            try {
                // create a new function with 'x' as parameter
                const fnBody = expr.startsWith('return') ? expr : 'return ' + expr;
                const fn = new Function('x', fnBody);
                // test evaluation
                fn(1);
                currentFn = fn;
                drawGridAndCurve();
            } catch (e) {
                alert('Invalid function expression. Use x as variable, e.g. x*x, Math.sin(x)');
            }
        }

        // auto-scale y based on visible x range and function values
        function computeYRange() {
            const samples = 200;
            let minY = Infinity, maxY = -Infinity;
            for (let i = 0; i <= samples; i++) {
                const t = i / samples;
                const x = xMin + t * (xMax - xMin);
                try {
                    const y = currentFn(x);
                    if (isFinite(y)) {
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                } catch (e) {
                    // ignore undefined points
                }
            }
            // add some padding
            if (minY === Infinity) minY = -1;
            if (maxY === -Infinity) maxY = 1;
            const padding = Math.max(0.2, (maxY - minY) * 0.1);
            yMin = minY - padding;
            yMax = maxY + padding;
            if (Math.abs(yMax - yMin) < 0.001) { // flat line
                yMin = -1;
                yMax = 1;
            }
        }

        // map x to canvas coordinate
        function mapX(x) {
            return ((x - xMin) / (xMax - xMin)) * width;
        }

        // map y to canvas coordinate (inverted)
        function mapY(y) {
            return height - ((y - yMin) / (yMax - yMin)) * height;
        }

        // draw grid, axes, and curve
        function drawGridAndCurve() {
            ctx.clearRect(0, 0, width, height);

            // compute y range based on current function and x-range
            computeYRange();

            // draw light grid
            ctx.strokeStyle = "#d9e2ec";
            ctx.lineWidth = 0.6;
            // vertical lines
            const stepX = (xMax - xMin) / 10;
            for (let x = xMin; x <= xMax; x += stepX) {
                const canvasX = mapX(x);
                ctx.beginPath();
                ctx.moveTo(canvasX, 0);
                ctx.lineTo(canvasX, height);
                ctx.strokeStyle = "#d0deed";
                ctx.stroke();
            }
            // horizontal lines
            const stepY = (yMax - yMin) / 8;
            for (let y = yMin; y <= yMax; y += stepY) {
                const canvasY = mapY(y);
                ctx.beginPath();
                ctx.moveTo(0, canvasY);
                ctx.lineTo(width, canvasY);
                ctx.strokeStyle = "#d0deed";
                ctx.stroke();
            }

            // draw axes
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#3a6d9c";
            // x-axis
            const yZero = mapY(0);
            if (yZero >= 0 && yZero <= height) {
                ctx.beginPath();
                ctx.moveTo(0, yZero);
                ctx.lineTo(width, yZero);
                ctx.strokeStyle = "#3a6d9c";
                ctx.stroke();
            }
            // y-axis
            const xZero = mapX(0);
            if (xZero >= 0 && xZero <= width) {
                ctx.beginPath();
                ctx.moveTo(xZero, 0);
                ctx.lineTo(xZero, height);
                ctx.stroke();
            }

            // draw function curve
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#c2592b";
            ctx.shadowColor = '#ffb27f';
            ctx.shadowBlur = 8;

            const steps = 500;
            let first = true;
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = xMin + t * (xMax - xMin);
                let y;
                try {
                    y = currentFn(x);
                } catch (e) {
                    first = true;
                    continue;
                }
                if (!isFinite(y)) {
                    first = true;
                    continue;
                }
                const canvasX = mapX(x);
                const canvasY = mapY(y);
                if (canvasY < 0 || canvasY > height) {
                    first = true;
                    continue; // skip out-of-range
                }
                if (first) {
                    ctx.moveTo(canvasX, canvasY);
                    first = false;
                } else {
                    ctx.lineTo(canvasX, canvasY);
                }
            }
            ctx.stroke();
            ctx.shadowBlur = 0;

            // if mouse inside, draw crosshair and coordinates
            if (showCoord) {
                const xVal = xMin + (mouseX / width) * (xMax - xMin);
                let yVal;
                try {
                    yVal = currentFn(xVal);
                } catch (e) {
                    yVal = NaN;
                }
                if (isFinite(yVal)) {
                    const canvasY = mapY(yVal);
                    // draw cross
                    ctx.beginPath();
                    ctx.strokeStyle = "#1d3f5c";
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([5, 3]);
                    ctx.moveTo(0, canvasY);
                    ctx.lineTo(width, canvasY);
                    ctx.stroke();
                    ctx.moveTo(mouseX, 0);
                    ctx.lineTo(mouseX, height);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // update display
                    coordDisplay.innerHTML = `
                        <div class="coord-item">🖱️ x: ${xVal.toFixed(3)}</div>
                        <div class="coord-item">📌 f(x): ${yVal.toFixed(3)}</div>
                    `;
                } else {
                    coordDisplay.innerHTML = `
                        <div class="coord-item">🖱️ x: ${xVal.toFixed(3)}</div>
                        <div class="coord-item">📌 f(x): undefined</div>
                    `;
                }
            } else {
                coordDisplay.innerHTML = `
                    <div class="coord-item">🖱️ x: —</div>
                    <div class="coord-item">📌 f(x): —</div>
                `;
            }
        }

        // mouse tracking
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouseX = (e.clientX - rect.left) * scaleX;
            mouseY = (e.clientY - rect.top) * scaleY;
            if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
                showCoord = true;
            } else {
                showCoord = false;
            }
            drawGridAndCurve();
        });

        canvas.addEventListener('mouseleave', () => {
            showCoord = false;
            drawGridAndCurve();
        });

        // range slider
        rangeSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            rangeSpan.textContent = `±${val.toFixed(1)}`;
            xMin = -val;
            xMax = val;
            drawGridAndCurve();
        });

        // preset buttons
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const fnStr = btn.dataset.fn;
                functionInput.value = fnStr;
                updateFunctionFromInput();
            });
        });

        // reset view
        resetBtn.addEventListener('click', () => {
            functionInput.value = 'Math.sin(x)';
            rangeSlider.value = 6;
            rangeSpan.textContent = '±6.0';
            xMin = -6;
            xMax = 6;
            updateFunctionFromInput();
        });

        // input change
        functionInput.addEventListener('change', updateFunctionFromInput);
        functionInput.addEventListener('input', updateFunctionFromInput); // realtime

        // initial draw
        updateFunctionFromInput();

        // also handle window resize? canvas fixed size, ignore.
        // optional: allow dragging to update? no need.

        // after each update, draw
        // override updateFunctionFromInput to call draw
        const originalUpdate = updateFunctionFromInput;
        updateFunctionFromInput = function() {
            originalUpdate();
            drawGridAndCurve();
        };
        updateFunctionFromInput();

        // fix reference
        window.updateFunctionFromInput = updateFunctionFromInput;
    })();