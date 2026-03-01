        (function() {
            const canvas = document.getElementById('bubbleCanvas');
            const ctx = canvas.getContext('2d');
            const shootBtn = document.getElementById('shootButton');
            const previewEl = document.getElementById('nextBubblePreview');

            // ---------- GAME STATE ----------
            // rows x columns – classic bubble hex grid (even/odd offset)
            const ROWS = 9;
            const COLS = 12;
            const BUBBLE_RADIUS = 24;
            // hex offsets: odd rows shifted right by radius
            const X_OFFSET = BUBBLE_RADIUS * 1.8;  // comfortable spacing
            const Y_OFFSET = BUBBLE_RADIUS * 1.65; 
            const START_X = 70;
            const START_Y = 70;

            // bubble colors (vibrant, candy-like)
            const COLORS = [
                '#FF5E7E', // pink
                '#FFB347', // orange
                '#4ECDC4', // mint
                '#5D9DF9', // light blue
                '#B983FF', // purple
                '#FFD966', // yellow
                '#FF8C5A'  // coral
            ];

            // grid representation: null = empty, string = color code
            let grid = [];

            // current shooter bubble (aiming from bottom)
            let currentBubble = {
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                x: 350,   // will be updated relative to canvas width
                y: 420
            };

            // aim angle (in radians) – initial  -90° (straight up)
            let aimAngle = -Math.PI / 2;  // up

            // mouse position for aiming (canvas relative)
            let mouseX = 350, mouseY = 200;

            // score
            let score = 2480; // match UI

            // ------------------------------------------------------------
            // INIT GRID: fill with some bubbles, leave top area random
            function initGrid() {
                grid = Array(ROWS).fill().map(() => Array(COLS).fill(null));
                // populate lower rows with some bubbles, keep upper half sparse
                for (let r = 2; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        if (Math.random() < 0.65) { // density
                            const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                            grid[r][c] = randomColor;
                        }
                    }
                }
                // add some clustered patterns for fun
                grid[1][5] = '#FFB347';
                grid[1][6] = '#FFB347';
                grid[2][4] = '#4ECDC4';
                grid[2][7] = '#4ECDC4';
                grid[3][5] = '#FF5E7E';
                grid[3][6] = '#FF5E7E';
                // top empty area for shooting
            }

            initGrid();

            // helper to get bubble position (hex-like staggered)
            function getBubblePos(row, col) {
                let x = START_X + col * X_OFFSET;
                let y = START_Y + row * Y_OFFSET;
                // odd rows shift right
                if (row % 2 === 1) {
                    x += X_OFFSET / 2;
                }
                return { x, y };
            }

            // draw bubbles + shooter + aim line
            function drawGame() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // --- draw grid bubbles ---
                for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        if (grid[r][c]) {
                            const pos = getBubblePos(r, c);
                            drawBubble(pos.x, pos.y, grid[r][c], BUBBLE_RADIUS);
                        }
                    }
                }

                // --- draw shooter bubble (current) ---
                // position: fixed at bottom center
                const shooterX = canvas.width / 2;
                const shooterY = canvas.height - 48;
                // store current bubble position for collision (logical)
                currentBubble.x = shooterX;
                currentBubble.y = shooterY;

                // draw aiming line / trajectory preview
                ctx.save();
                ctx.translate(shooterX, shooterY);
                // angle from mouse relative to shooter
                let dx = mouseX - shooterX;
                let dy = mouseY - shooterY;
                const length = Math.sqrt(dx * dx + dy * dy);
                if (length > 5) {
                    aimAngle = Math.atan2(dy, dx);
                }
                // restrict angle (don't shoot downward)
                let angle = aimAngle;
                if (angle > -0.1 && angle < 0.1) angle = -0.1; // slight upward
                if (angle > 0) angle = -0.2; // force upward if needed
                
                // draw dotted line preview
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * 150, Math.sin(angle) * 150);
                ctx.strokeStyle = 'rgba(220, 255, 255, 0.7)';
                ctx.lineWidth = 3;
                ctx.setLineDash([6, 8]);
                ctx.stroke();
                
                // aim dot at end
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * 150, Math.sin(angle) * 150, 6, 0, 2 * Math.PI);
                ctx.fillStyle = '#F0FFFF';
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.restore();

                // draw shooter bubble with glow
                drawBubble(shooterX, shooterY, currentBubble.color, BUBBLE_RADIUS + 2);
                // extra ring
                ctx.beginPath();
                ctx.arc(shooterX, shooterY, BUBBLE_RADIUS + 4, 0, 2 * Math.PI);
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth = 2.5;
                ctx.stroke();

                // draw "launcher" base
                ctx.fillStyle = '#226688';
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#005F99';
                ctx.beginPath();
                ctx.ellipse(shooterX, shooterY + 6, 30, 16, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#0A4860';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // individual bubble with inner glow
            function drawBubble(x, y, color, radius) {
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                // gradient for glass effect
                const grad = ctx.createRadialGradient(x-4, y-4, 4, x, y, radius+2);
                grad.addColorStop(0, color);
                grad.addColorStop(0.8, color);
                grad.addColorStop(1, '#333');
                ctx.fillStyle = grad;
                ctx.shadowColor = 'rgba(0,200,255,0.6)';
                ctx.shadowBlur = 12;
                ctx.fill();
                // highlight
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(x-3, y-3, 6, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // --- collision detection & bubble placement ---
            function shootBubble() {
                // simulate shooting along aimAngle from shooter position
                const shooterX = canvas.width / 2;
                const shooterY = canvas.height - 48;
                let dx = mouseX - shooterX;
                let dy = mouseY - shooterY;
                let angle = Math.atan2(dy, dx);
                // restrict upward
                if (angle > -0.2) angle = -0.5; 
                
                // simple simulation: move step-by-step
                let bubbleX = shooterX;
                let bubbleY = shooterY;
                const step = 5;
                let maxSteps = 150;
                let landed = false;

                // bubble color to place
                const shootingColor = currentBubble.color;

                while (!landed && maxSteps-- > 0) {
                    bubbleX += Math.cos(angle) * step;
                    bubbleY += Math.sin(angle) * step;

                    // boundary check? snap to grid if near a bubble or ceiling
                    if (bubbleY < 40) { // top row approx
                        // try to place at row 0
                        let col = Math.floor((bubbleX - START_X) / X_OFFSET);
                        if (col >= 0 && col < COLS) {
                            if (!grid[0][col]) {
                                grid[0][col] = shootingColor;
                                landed = true;
                                break;
                            }
                        }
                        break;
                    }

                    // check collision with existing bubbles (simple distance)
                    for (let r = 0; r < ROWS; r++) {
                        for (let c = 0; c < COLS; c++) {
                            if (grid[r][c] !== null) {
                                const pos = getBubblePos(r, c);
                                const dist = Math.hypot(bubbleX - pos.x, bubbleY - pos.y);
                                if (dist < BUBBLE_RADIUS * 1.6) {
                                    // find neighbor cell to attach
                                    const neighborPos = findNeighborEmptyCell(r, c, angle);
                                    if (neighborPos) {
                                        grid[neighborPos.row][neighborPos.col] = shootingColor;
                                        landed = true;
                                    }
                                    break;
                                }
                            }
                        }
                        if (landed) break;
                    }
                    if (landed) break;
                }

                // if no collision, just drop at top dead center fallback
                if (!landed) {
                    for (let c = 5; c < 7; c++) {
                        if (c < COLS && !grid[0][c]) {
                            grid[0][c] = shootingColor;
                            break;
                        }
                    }
                }

                // simple pop matching (3+ adjacent)
                popBubbles();

                // new current bubble random color, update preview
                currentBubble.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                previewEl.style.background = currentBubble.color;
                
                // add score (demo)
                score += 10;
                document.querySelector('.score').innerText = score;
                drawGame();
            }

            // find empty cell near row, col for attachment (crude but functional)
            function findNeighborEmptyCell(row, col, angle) {
                // prioritize cell above if angle upward, else left/right
                const candidates = [];
                // even/odd offset matters – typical bubble neighbor logic
                if (row % 2 === 0) {
                    candidates.push([row-1, col-1], [row-1, col], [row, col-1], [row, col+1], [row+1, col-1], [row+1, col]);
                } else {
                    candidates.push([row-1, col], [row-1, col+1], [row, col-1], [row, col+1], [row+1, col], [row+1, col+1]);
                }
                // filter valid & empty
                for (let [r, c] of candidates) {
                    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && grid[r][c] === null) {
                        return { row: r, col: c };
                    }
                }
                return null;
            }

            // simple flood fill elimination (minimum 3 connected)
            function popBubbles() {
                // naive: just remove random group for demo – but we want feedback.
                // real bubble shooter logic is complex, this UI shows concept.
                // we'll remove some clusters of same color adjacent.
                let visited = Array(ROWS).fill().map(() => Array(COLS).fill(false));
                for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        if (grid[r][c] && !visited[r][c]) {
                            const color = grid[r][c];
                            const queue = [{r, c}];
                            const cluster = [];
                            while (queue.length) {
                                const {r, c} = queue.shift();
                                if (visited[r][c]) continue;
                                visited[r][c] = true;
                                if (grid[r][c] === color) {
                                    cluster.push({r, c});
                                    // get neighbors
                                    let neighbors = [];
                                    if (r % 2 === 0) {
                                        neighbors = [[r-1, c-1], [r-1, c], [r, c-1], [r, c+1], [r+1, c-1], [r+1, c]];
                                    } else {
                                        neighbors = [[r-1, c], [r-1, c+1], [r, c-1], [r, c+1], [r+1, c], [r+1, c+1]];
                                    }
                                    for (let [nr, nc] of neighbors) {
                                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && grid[nr][nc] === color) {
                                            queue.push({r: nr, c: nc});
                                        }
                                    }
                                }
                            }
                            if (cluster.length >= 3) {
                                // pop them!
                                cluster.forEach(cell => {
                                    grid[cell.r][cell.c] = null;
                                });
                                // add score
                                score += cluster.length * 30;
                            }
                        }
                    }
                }
            }

            // --- mouse tracking for aiming ---
            function handleMouseMove(e) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                let canvasRelativeX = (e.clientX - rect.left) * scaleX;
                let canvasRelativeY = (e.clientY - rect.top) * scaleY;
                // clamp
                canvasRelativeX = Math.min(Math.max(canvasRelativeX, 50), canvas.width - 50);
                canvasRelativeY = Math.min(Math.max(canvasRelativeY, 40), canvas.height - 80);
                mouseX = canvasRelativeX;
                mouseY = canvasRelativeY;
                drawGame();
            }

            // touch support
            function handleTouchMove(e) {
                e.preventDefault();
                if (e.touches.length) {
                    const rect = canvas.getBoundingClientRect();
                    const touch = e.touches[0];
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    let canvasRelativeX = (touch.clientX - rect.left) * scaleX;
                    let canvasRelativeY = (touch.clientY - rect.top) * scaleY;
                    canvasRelativeX = Math.min(Math.max(canvasRelativeX, 50), canvas.width - 50);
                    canvasRelativeY = Math.min(Math.max(canvasRelativeY, 40), canvas.height - 80);
                    mouseX = canvasRelativeX;
                    mouseY = canvasRelativeY;
                    drawGame();
                }
            }

            // attach events
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            canvas.addEventListener('touchstart', (e) => e.preventDefault());
            
            // shoot button
            shootBtn.addEventListener('click', (e) => {
                e.preventDefault();
                shootBubble();
            });

            // also click on canvas to shoot
            canvas.addEventListener('click', (e) => {
                shootBubble();
            });

            // init preview color
            previewEl.style.background = currentBubble.color;

            // initial draw
            drawGame();

            // reload button (restart)
            document.querySelector('.action-btn:nth-child(1)').addEventListener('click', function() {
                initGrid();
                score = 2480;
                document.querySelector('.score').innerText = score;
                drawGame();
            });

            // swap/shuffle – randomize next bubble
            document.querySelector('.action-btn:nth-child(3)').addEventListener('click', function() {
                currentBubble.color = COLORS[Math.floor(Math.random() * COLORS.length)];
                previewEl.style.background = currentBubble.color;
                drawGame();
            });

            // aim assist (just a visual reset of angle)
            document.querySelector('.action-btn:nth-child(2)').addEventListener('click', function() {
                mouseX = canvas.width / 2;
                mouseY = canvas.height / 3;
                drawGame();
            });

            // level up demo (just visual)
            document.querySelector('.level-panel').addEventListener('click', function() {
                let lvl = document.querySelector('.level');
                let current = parseInt(lvl.innerText.replace('LVL ', ''));
                current = current + 1;
                lvl.innerText = 'LVL ' + current;
            });
        })();