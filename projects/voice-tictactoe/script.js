    (function() {
        // ---------- TIC TAC TOE CORE ----------
        const boardEl = document.getElementById('board');
        const turnDisplay = document.getElementById('turnDisplay');
        const lastCommandLog = document.getElementById('lastCommandLog');
        const micBtn = document.getElementById('micButton');
        const listeningStatus = document.getElementById('listeningStatus');
        
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';   // X always starts
        let gameActive = true;
        let winCells = [];         // indices of winning line

        // mapping voice commands to board indices
        const positionMap = {
            // top row
            'top left': 0, 'top-left': 0, 'topleft': 0, 'top left corner': 0,
            'top center': 1, 'top-center': 1, 'topcenter': 1, 'top middle': 1,
            'top right': 2, 'top-right': 2, 'topright': 2, 'top right corner': 2,
            // middle row
            'middle left': 3, 'middle-left': 3, 'middleleft': 3, 'center left': 3,
            'center': 4, 'middle': 4, 'centre': 4, 'middle center': 4, 'middle-centre': 4,
            'middle right': 5, 'middle-right': 5, 'middleright': 5, 'center right': 5,
            // bottom row
            'bottom left': 6, 'bottom-left': 6, 'bottomleft': 6, 'bottom left corner': 6,
            'bottom center': 7, 'bottom-center': 7, 'bottomcenter': 7, 'bottom middle': 7,
            'bottom right': 8, 'bottom-right': 8, 'bottomright': 8, 'bottom right corner': 8
        };

        // extra aliases for numbers
        const numberMap = {
            '1': 0, 'one': 0, 'first': 0,
            '2': 1, 'two': 1, 'second': 1,
            '3': 2, 'three': 2, 'third': 2,
            '4': 3, 'four': 3, 'fourth': 3,
            '5': 4, 'five': 4, 'fifth': 4,
            '6': 5, 'six': 5, 'sixth': 5,
            '7': 6, 'seven': 6, 'seventh': 6,
            '8': 7, 'eight': 7, 'eighth': 7,
            '9': 8, 'nine': 8, 'ninth': 8
        };

        // render board dynamically
        function renderBoard() {
            let html = '';
            for (let i = 0; i < 9; i++) {
                let cellClass = 'cell';
                if (board[i] !== '') cellClass += ' taken';
                if (winCells.includes(i)) cellClass += ' win';
                html += `<div class="${cellClass}" data-index="${i}">${board[i]}</div>`;
            }
            boardEl.innerHTML = html;

            // update turn message
            if (!gameActive) {
                if (winCells.length > 0) {
                    turnDisplay.innerText = `🏆 Player ${currentPlayer === 'X' ? 'O' : 'X'} wins!`;
                } else {
                    turnDisplay.innerText = `🤝 It's a draw!`;
                }
            } else {
                turnDisplay.innerText = `Player ${currentPlayer} · your turn`;
            }
        }

        // check winner
        function checkWinner() {
            const winPatterns = [
                [0,1,2],[3,4,5],[6,7,8], // rows
                [0,3,6],[1,4,7],[2,5,8], // cols
                [0,4,8],[2,4,6]          // diags
            ];

            for (let pattern of winPatterns) {
                const [a,b,c] = pattern;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    winCells = [a,b,c];
                    return board[a]; // X or O
                }
            }
            if (board.every(cell => cell !== '')) return 'draw';
            return null;
        }

        // handle move
        function makeMove(index) {
            if (!gameActive) return false;
            if (index < 0 || index > 8) return false;
            if (board[index] !== '') return false;

            // place mark
            board[index] = currentPlayer;
            
            const winner = checkWinner();
            if (winner) {
                gameActive = false;
                if (winner === 'draw') {
                    winCells = [];
                }
            } else {
                // switch player
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
            
            renderBoard();
            return true;
        }

        // reset game
        function resetGame() {
            board = ['', '', '', '', '', '', '', '', ''];
            currentPlayer = 'X';
            gameActive = true;
            winCells = [];
            renderBoard();
            lastCommandLog.innerText = '🕹️ last: —';
        }

        // ---------- VOICE RECOGNITION ----------
        let recognition = null;
        let isListening = false;
        let forcedStop = false;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            listeningStatus.innerHTML = '❌ not supported';
            micBtn.style.opacity = '0.5';
        } else {
            recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const last = event.results[event.results.length - 1];
                if (last.isFinal) {
                    const transcript = last[0].transcript.trim().toLowerCase();
                    processVoiceCommand(transcript);
                }
            };

            recognition.onend = () => {
                if (isListening && !forcedStop) {
                    try { recognition.start(); } catch (e) {}
                } else {
                    isListening = false;
                    updateMicUI();
                }
            };

            recognition.onerror = (e) => {
                console.warn(e.error);
                if (e.error === 'not-allowed') {
                    listeningStatus.innerHTML = '🔇 blocked';
                    isListening = false;
                } else if (e.error === 'no-speech') {
                    // ignore
                } else {
                    isListening = false;
                }
                updateMicUI();
            };
        }

        function updateMicUI() {
            if (isListening) {
                micBtn.classList.add('active');
                listeningStatus.innerHTML = '🎙️ listening...';
            } else {
                micBtn.classList.remove('active');
                listeningStatus.innerHTML = '⚪ idle';
            }
        }

        function toggleListening() {
            if (!recognition) {
                alert('Speech recognition not available. Use Chrome/Edge.');
                return;
            }

            if (isListening) {
                forcedStop = false;
                isListening = false;
                try { recognition.stop(); } catch (e) {}
            } else {
                forcedStop = false;
                isListening = true;
                try { recognition.start(); } catch (e) {
                    isListening = false;
                }
            }
            updateMicUI();
        }

        function forceStopListening() {
            forcedStop = true;
            if (recognition && isListening) {
                try { recognition.stop(); } catch (e) {}
            }
            isListening = false;
            updateMicUI();
        }

        // ---------- PROCESS VOICE COMMAND ----------
        function processVoiceCommand(text) {
            lastCommandLog.innerText = `🗣️ "${text}"`;
            
            // reset command
            if (text.includes('reset') || text.includes('new game') || text.includes('restart')) {
                resetGame();
                return;
            }

            if (!gameActive) {
                // if game over, maybe reset on 'play again' etc, but we can ignore
                return;
            }

            // try to find a position
            let index = -1;

            // 1. check named positions
            for (let [key, value] of Object.entries(positionMap)) {
                if (text.includes(key)) {
                    index = value;
                    break;
                }
            }

            // 2. if not found, try number mapping
            if (index === -1) {
                for (let [key, value] of Object.entries(numberMap)) {
                    if (text.includes(key)) {
                        index = value;
                        break;
                    }
                }
            }

            // 3. also try patterns like "cell 5" "move 3"
            if (index === -1) {
                const match = text.match(/\b([1-9])\b/);
                if (match) {
                    index = parseInt(match[1]) - 1;
                }
            }

            // 4. check for "place at ..." patterns (already covered by includes)

            if (index !== -1) {
                const success = makeMove(index);
                if (success) {
                    // flash mic feedback
                    micBtn.style.backgroundColor = '#6acd90';
                    setTimeout(() => micBtn.style.backgroundColor = '', 150);
                } else {
                    lastCommandLog.innerText += ' ❌ cell taken';
                }
            } else {
                lastCommandLog.innerText += ' 🤔 not understood';
            }
        }

        // ---------- EVENT LISTENERS ----------
        micBtn.addEventListener('click', toggleListening);

        document.getElementById('resetGame').addEventListener('click', () => {
            resetGame();
            forceStopListening(); // optional, but nice to stop voice
        });

        // board click fallback (manual)
        boardEl.addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (!cell) return;
            const index = cell.dataset.index;
            if (index !== undefined) {
                const success = makeMove(parseInt(index));
                if (success) {
                    forceStopListening(); // stop listening after manual move (optional)
                }
            }
        });

        // initial render
        renderBoard();
        updateMicUI();

        // cleanup
        window.addEventListener('beforeunload', () => {
            if (recognition && isListening) {
                try { recognition.stop(); } catch (e) {}
            }
        });
    })();