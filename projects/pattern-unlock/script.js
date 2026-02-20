        class PatternUnlockGame {
            constructor() {
                this.container = document.getElementById('patternContainer');
                this.patternDisplay = document.getElementById('patternDisplay');
                this.messageEl = document.getElementById('message');
                this.patternLengthEl = document.getElementById('patternLength');
                this.attemptsEl = document.getElementById('attempts');
                this.successRateEl = document.getElementById('successRate');
                
                this.dots = [];
                this.lines = [];
                this.selectedDots = [];
                this.currentPattern = [];
                this.correctPattern = [1, 2, 3, 6, 9, 8, 7, 4]; // Default pattern
                this.isSettingPattern = false;
                this.isDrawing = false;
                this.attempts = 0;
                this.successfulAttempts = 0;
                
                this.init();
                this.setupEventListeners();
            }
            
            init() {
                this.createDots();
                this.updateStats();
            }
            
            createDots() {
                const positions = [
                    [50, 50],   [150, 50],  [250, 50],
                    [50, 150],  [150, 150], [250, 150],
                    [50, 250],  [150, 250], [250, 250]
                ];
                
                for (let i = 0; i < 9; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'dot';
                    dot.dataset.index = i + 1;
                    dot.style.left = `${positions[i][0]}px`;
                    dot.style.top = `${positions[i][1]}px`;
                    
                    // Add number to dot
                    const number = document.createElement('span');
                    number.textContent = i + 1;
                    number.style.position = 'absolute';
                    number.style.top = '50%';
                    number.style.left = '50%';
                    number.style.transform = 'translate(-50%, -50%)';
                    number.style.color = 'white';
                    number.style.fontWeight = 'bold';
                    number.style.fontSize = '18px';
                    dot.appendChild(number);
                    
                    this.container.appendChild(dot);
                    this.dots.push(dot);
                }
            }
            
            setupEventListeners() {
                // Mouse events
                this.container.addEventListener('mousedown', this.startDrawing.bind(this));
                this.container.addEventListener('mousemove', this.draw.bind(this));
                document.addEventListener('mouseup', this.stopDrawing.bind(this));
                
                // Touch events for mobile
                this.container.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.startDrawing(e.touches[0]);
                });
                this.container.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    this.draw(e.touches[0]);
                });
                this.container.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.stopDrawing();
                });
                
                // Button events
                document.getElementById('resetBtn').addEventListener('click', () => this.reset());
                document.getElementById('checkBtn').addEventListener('click', () => this.checkPattern());
                document.getElementById('setPatternBtn').addEventListener('click', () => this.setPattern());
                document.getElementById('minDots').addEventListener('change', (e) => {
                    this.updateMessage(`Minimum dots set to ${e.target.value}`, 'info');
                });
                
                // Dot click events (for accessibility)
                this.dots.forEach(dot => {
                    dot.addEventListener('click', (e) => {
                        if (!this.isDrawing) {
                            this.startDrawing(e);
                            this.addDotToPattern(parseInt(dot.dataset.index));
                            this.stopDrawing();
                        }
                    });
                });
            }
            
            startDrawing(e) {
                this.isDrawing = true;
                this.clearLines();
                this.resetDotHighlights();
                this.selectedDots = [];
                this.currentPattern = [];
                this.patternDisplay.textContent = 'Drawing...';
            }
            
            draw(e) {
                if (!this.isDrawing) return;
                
                const rect = this.container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Check if cursor is over a dot
                this.dots.forEach(dot => {
                    const dotRect = dot.getBoundingClientRect();
                    const dotX = dotRect.left - rect.left + 25;
                    const dotY = dotRect.top - rect.top + 25;
                    
                    if (Math.abs(x - dotX) < 30 && Math.abs(y - dotY) < 30) {
                        const dotIndex = parseInt(dot.dataset.index);
                        if (!this.selectedDots.includes(dotIndex)) {
                            this.addDotToPattern(dotIndex);
                        }
                    }
                });
                
                // Draw line to current cursor position from last dot
                if (this.selectedDots.length > 0) {
                    this.drawLineToCursor(x, y);
                }
            }
            
            stopDrawing() {
                if (!this.isDrawing) return;
                
                this.isDrawing = false;
                this.clearTemporaryLines();
                
                if (this.currentPattern.length > 0) {
                    this.patternDisplay.textContent = `Pattern: ${this.currentPattern.join(' → ')}`;
                    this.patternLengthEl.textContent = this.currentPattern.length;
                }
            }
            
            addDotToPattern(dotIndex) {
                this.selectedDots.push(dotIndex);
                this.currentPattern.push(dotIndex);
                
                // Highlight the dot
                const dot = this.dots[dotIndex - 1];
                dot.classList.add('active');
                
                // Draw line from previous dot if exists
                if (this.selectedDots.length > 1) {
                    const prevDotIndex = this.selectedDots[this.selectedDots.length - 2];
                    this.drawLineBetweenDots(prevDotIndex, dotIndex);
                }
            }
            
            drawLineBetweenDots(fromIndex, toIndex) {
                const fromDot = this.dots[fromIndex - 1];
                const toDot = this.dots[toIndex - 1];
                
                const fromRect = fromDot.getBoundingClientRect();
                const toRect = toDot.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();
                
                const x1 = fromRect.left - containerRect.left + 25;
                const y1 = fromRect.top - containerRect.top + 25;
                const x2 = toRect.left - containerRect.left + 25;
                const y2 = toRect.top - containerRect.top + 25;
                
                const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
                
                const line = document.createElement('div');
                line.className = 'line';
                line.style.width = `${length}px`;
                line.style.left = `${x1}px`;
                line.style.top = `${y1}px`;
                line.style.transform = `rotate(${angle}deg)`;
                
                this.container.appendChild(line);
                this.lines.push(line);
            }
            
            drawLineToCursor(x, y) {
                // Clear any existing temporary line
                this.clearTemporaryLines();
                
                const lastDotIndex = this.selectedDots[this.selectedDots.length - 1];
                const lastDot = this.dots[lastDotIndex - 1];
                const lastDotRect = lastDot.getBoundingClientRect();
                const containerRect = this.container.getBoundingClientRect();
                
                const x1 = lastDotRect.left - containerRect.left + 25;
                const y1 = lastDotRect.top - containerRect.top + 25;
                
                const length = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
                const angle = Math.atan2(y - y1, x - x1) * 180 / Math.PI;
                
                const line = document.createElement('div');
                line.className = 'line';
                line.style.width = `${length}px`;
                line.style.left = `${x1}px`;
                line.style.top = `${y1}px`;
                line.style.transform = `rotate(${angle}deg)`;
                line.style.opacity = '0.5';
                line.style.background = '#3498db';
                
                this.container.appendChild(line);
                this.lines.push(line);
            }
            
            clearLines() {
                this.lines.forEach(line => line.remove());
                this.lines = [];
            }
            
            clearTemporaryLines() {
                // Remove lines with opacity (temporary cursor lines)
                this.lines.forEach(line => {
                    if (line.style.opacity === '0.5') {
                        line.remove();
                    }
                });
                this.lines = this.lines.filter(line => line.style.opacity !== '0.5');
            }
            
            resetDotHighlights() {
                this.dots.forEach(dot => {
                    dot.classList.remove('active');
                    dot.classList.remove('highlight');
                });
            }
            
            reset() {
                this.clearLines();
                this.resetDotHighlights();
                this.selectedDots = [];
                this.currentPattern = [];
                this.patternDisplay.textContent = 'Draw a pattern...';
                this.patternLengthEl.textContent = '0';
                this.hideMessage();
            }
            
            checkPattern() {
                const minDots = parseInt(document.getElementById('minDots').value);
                
                if (this.currentPattern.length < minDots) {
                    this.updateMessage(`Pattern too short! Minimum ${minDots} dots required.`, 'error');
                    return;
                }
                
                this.attempts++;
                let isCorrect = false;
                
                if (this.isSettingPattern) {
                    this.correctPattern = [...this.currentPattern];
                    this.updateMessage('✅ New pattern set as solution!', 'success');
                    this.isSettingPattern = false;
                    isCorrect = true;
                } else {
                    // Check if pattern matches
                    if (this.currentPattern.length !== this.correctPattern.length) {
                        isCorrect = false;
                    } else {
                        isCorrect = this.currentPattern.every((dot, index) => dot === this.correctPattern[index]);
                    }
                    
                    if (isCorrect) {
                        this.successfulAttempts++;
                        this.updateMessage('🎉 Pattern correct! Access granted!', 'success');
                        // Visual celebration
                        this.dots.forEach(dot => {
                            dot.classList.add('highlight');
                        });
                        setTimeout(() => {
                            this.resetDotHighlights();
                        }, 1000);
                    } else {
                        this.updateMessage('❌ Pattern incorrect. Try again!', 'error');
                        // Visual feedback for incorrect pattern
                        this.dots.forEach(dot => {
                            dot.classList.add('highlight');
                            setTimeout(() => {
                                dot.classList.remove('highlight');
                            }, 300);
                        });
                    }
                }
                
                this.updateStats();
            }
            
            setPattern() {
                const minDots = parseInt(document.getElementById('minDots').value);
                
                if (this.currentPattern.length < minDots) {
                    this.updateMessage(`Pattern too short! Minimum ${minDots} dots required.`, 'error');
                    return;
                }
                
                this.isSettingPattern = true;
                this.updateMessage('Now draw the pattern you want to set as solution, then click "Check Pattern"', 'info');
            }
            
            updateMessage(text, type) {
                this.messageEl.textContent = text;
                this.messageEl.className = `message show ${type}`;
                
                // Auto-hide message after 3 seconds
                setTimeout(() => {
                    this.hideMessage();
                }, 3000);
            }
            
            hideMessage() {
                this.messageEl.classList.remove('show');
            }
            
            updateStats() {
                this.attemptsEl.textContent = this.attempts;
                const successRate = this.attempts > 0 
                    ? Math.round((this.successfulAttempts / this.attempts) * 100) 
                    : 0;
                this.successRateEl.textContent = `${successRate}%`;
            }
        }
        
        // Initialize the game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new PatternUnlockGame();
        });