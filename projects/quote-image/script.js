        (function() {
            // ----- get elements -----
            const canvas = document.getElementById('quoteCanvas');
            const ctx = canvas.getContext('2d');

            const quoteInput = document.getElementById('quoteInput');
            const authorInput = document.getElementById('authorInput');
            const bgSelect = document.getElementById('bgSelect');
            const textColorInput = document.getElementById('textColorInput');
            const authorColorInput = document.getElementById('authorColorInput');
            const fontSelect = document.getElementById('fontSelect');
            const alignRadios = document.getElementsByName('align');
            const downloadBtn = document.getElementById('downloadBtn');

            // helper: get selected alignment
            function getSelectedAlign() {
                for (let radio of alignRadios) {
                    if (radio.checked) return radio.value;
                }
                return 'center'; // fallback
            }

            // ----- gradient presets (backgrounds) -----
            function applyBackground(styleKey, ctx, width, height) {
                let gradient;
                switch (styleKey) {
                    case 'gradient1': // sunset dream
                        gradient = ctx.createLinearGradient(0, 0, width*0.8, height);
                        gradient.addColorStop(0, '#ffd4b0');
                        gradient.addColorStop(0.4, '#ff9f9f');
                        gradient.addColorStop(0.8, '#c09bd8');
                        gradient.addColorStop(1, '#7b5c9e');
                        break;
                    case 'gradient2': // mint & lavender
                        gradient = ctx.createLinearGradient(0, height, width, 0);
                        gradient.addColorStop(0, '#d3c6f0');
                        gradient.addColorStop(0.5, '#f2e3c9');
                        gradient.addColorStop(1, '#b8e0d2');
                        break;
                    case 'gradient3': // midnight galaxy
                        gradient = ctx.createRadialGradient(width*0.3, height*0.3, 40, width*0.7, height*0.7, 700);
                        gradient.addColorStop(0, '#261447');
                        gradient.addColorStop(0.5, '#371c5a');
                        gradient.addColorStop(1, '#120b2b');
                        break;
                    case 'gradient4': // peachy dust
                        gradient = ctx.createLinearGradient(0, 0, width, height);
                        gradient.addColorStop(0, '#fbc7b7');
                        gradient.addColorStop(0.6, '#f5a3b9');
                        gradient.addColorStop(1, '#cb9edb');
                        break;
                    case 'gradient5': // emerald water
                        gradient = ctx.createLinearGradient(0, height*0.3, width, height*0.8);
                        gradient.addColorStop(0, '#a6e0d2');
                        gradient.addColorStop(0.5, '#b7d9e4');
                        gradient.addColorStop(1, '#b3a9d9');
                        break;
                    default: // fallback
                        gradient = ctx.createLinearGradient(0, 0, width, height);
                        gradient.addColorStop(0, '#f3e7ff');
                        gradient.addColorStop(1, '#dccdff');
                }
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }

            // ----- main drawing function -----
            function drawQuote() {
                const width = canvas.width;
                const height = canvas.height;

                // clear with white background (for transparent gaps)
                ctx.clearRect(0, 0, width, height);
                
                // 1. draw background gradient
                const bgStyle = bgSelect.value;
                applyBackground(bgStyle, ctx, width, height);

                // 2. text variables
                const quote = quoteInput.value.trim() || "—";
                const author = authorInput.value.trim();
                const mainColor = textColorInput.value;
                const authorColor = authorColorInput.value;
                const fontFamily = fontSelect.value;
                const align = getSelectedAlign();

                // set text alignment
                let canvasAlign = align;
                ctx.textAlign = canvasAlign;

                // set x coordinate based on alignment
                let xPos;
                if (align === 'left') xPos = 80;
                else if (align === 'right') xPos = width - 80;
                else xPos = width / 2; // center

                // ----- draw main quote (with auto wrap) -----
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // wrap quote
                const maxWidth = width - 160; // comfortable margins
                const lineHeight = 64;
                const fontSize = 44;
                ctx.font = `600 ${fontSize}px ${fontFamily}`;
                ctx.fillStyle = mainColor;

                const words = quote.split(' ');
                let lines = [];
                let currentLine = words[0];

                for (let i = 1; i < words.length; i++) {
                    const testLine = currentLine + ' ' + words[i];
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth) {
                        lines.push(currentLine);
                        currentLine = words[i];
                    } else {
                        currentLine = testLine;
                    }
                }
                lines.push(currentLine); // last line

                // if quote empty
                if (quote === "—" || quote === "") lines = ["—"];

                // starting Y (roughly vertical center, but dynamic)
                let startY = height / 2 - ((lines.length - 1) * lineHeight) / 2.2;

                for (let i = 0; i < lines.length; i++) {
                    ctx.font = `600 ${fontSize}px ${fontFamily}`;
                    ctx.fillStyle = mainColor;
                    ctx.fillText(lines[i], xPos, startY + i * lineHeight);
                }

                // ----- draw author (smaller, separate) -----
                if (author) {
                    ctx.shadowBlur = 8;
                    ctx.shadowOffsetX = 1;
                    ctx.shadowOffsetY = 1;
                    ctx.font = `300 30px ${fontFamily}`;
                    ctx.fillStyle = authorColor;
                    
                    const authorLine = author.startsWith('—') ? author : `— ${author}`;
                    const authorY = startY + lines.length * lineHeight + 48;
                    
                    // constrain width for author too
                    const authorMetrics = ctx.measureText(authorLine);
                    if (authorMetrics.width > maxWidth && authorLine.length > 20) {
                        // if too long, just truncate (rare)
                        ctx.fillText(authorLine.substring(0, 30) + '…', xPos, authorY);
                    } else {
                        ctx.fillText(authorLine, xPos, authorY);
                    }
                }

                // reset shadow
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            }

            // ----- attach event listeners for live update -----
            quoteInput.addEventListener('input', drawQuote);
            authorInput.addEventListener('input', drawQuote);
            bgSelect.addEventListener('change', drawQuote);
            textColorInput.addEventListener('input', drawQuote);
            authorColorInput.addEventListener('input', drawQuote);
            fontSelect.addEventListener('change', drawQuote);
            for (let radio of alignRadios) {
                radio.addEventListener('change', drawQuote);
            }

            // randomize colors on canvas click (for fun)
            canvas.addEventListener('click', function() {
                const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
                textColorInput.value = randomHex();
                authorColorInput.value = randomHex();
                drawQuote(); // redraw with new colors
            });

            // download as PNG
            downloadBtn.addEventListener('click', function() {
                const link = document.createElement('a');
                link.download = `quote-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });

            // initial draw
            drawQuote();

            // optional: adjust canvas resolution for sharper image (already 600x600)
            // but we keep it crisp
        })();