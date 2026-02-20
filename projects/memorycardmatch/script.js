        (function() {
            // ---------- game config ----------
            const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']; // 8 pairs
            const TOTAL_PAIRS = 8;
            const TOTAL_CARDS = 16;

            // state
            let cards = [];
            let flippedIndices = [];     // indices of currently flipped cards (max 2)
            let matchedPairs = 0;
            let moves = 0;
            let gameFinished = false;
            let timerInterval = null;
            let secondsElapsed = 0;
            let lockBoard = false;        // prevent clicks during animations

            // DOM
            const boardEl = document.getElementById('board');
            const moveSpan = document.getElementById('moveCount');
            const timerSpan = document.getElementById('timerDisplay');
            const winMessageEl = document.getElementById('winMessage');
            const newGameBtn = document.getElementById('newGameBtn');

            // shuffle array (Fisher-Yates)
            function shuffleArray(arr) {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }

            // initialize cards (shuffled)
            function initCards() {
                // create pairs
                let newCards = [];
                for (let i = 0; i < TOTAL_PAIRS; i++) {
                    newCards.push({ id: i, emoji: EMOJIS[i], matched: false, flipped: false });
                    newCards.push({ id: i, emoji: EMOJIS[i], matched: false, flipped: false });
                }
                cards = shuffleArray(newCards);
                matchedPairs = 0;
                flippedIndices = [];
                moves = 0;
                gameFinished = false;
                lockBoard = false;
                updateMoves();
                winMessageEl.innerText = 'find all pairs';
            }

            // render board based on cards array
            function renderBoard() {
                let html = '';
                cards.forEach((card, index) => {
                    let cardClass = 'card';
                    if (card.matched) cardClass += ' matched';
                    else if (card.flipped) cardClass += ' flipped';

                    let content = '';
                    if (card.matched || card.flipped) {
                        content = `<span>${card.emoji}</span>`;
                    } else {
                        content = `<span style="opacity:0.3;">?</span>`;
                    }

                    html += `<div class="${cardClass}" data-index="${index}">${content}</div>`;
                });
                boardEl.innerHTML = html;
            }

            // update move counter
            function updateMoves() {
                moveSpan.innerText = moves;
            }

            // timer formatting (MM:SS)
            function formatTime(sec) {
                const m = Math.floor(sec / 60);
                const s = Math.floor(sec % 60);
                return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }

            // start timer (if not already running)
            function startTimerIfNeeded() {
                if (timerInterval === null && !gameFinished && matchedPairs < TOTAL_PAIRS) {
                    timerInterval = setInterval(() => {
                        secondsElapsed++;
                        timerSpan.innerText = formatTime(secondsElapsed);
                    }, 1000);
                }
            }

            // stop timer
            function stopTimer() {
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }
            }

            // check win condition
            function checkWin() {
                if (matchedPairs === TOTAL_PAIRS) {
                    gameFinished = true;
                    stopTimer();
                    winMessageEl.innerText = `🏆 you won in ${moves} moves!`;
                }
            }

            // flip two cards, check match, reset flip after delay
            function flipCard(index) {
                if (lockBoard) return;
                const card = cards[index];
                // ignore if already matched, already flipped, or game finished
                if (card.matched || card.flipped || gameFinished) return;

                // start timer on first flip
                startTimerIfNeeded();

                // set flipped
                card.flipped = true;
                flippedIndices.push(index);
                renderBoard();

                // if two cards flipped
                if (flippedIndices.length === 2) {
                    moves++;
                    updateMoves();

                    const idx1 = flippedIndices[0];
                    const idx2 = flippedIndices[1];
                    const card1 = cards[idx1];
                    const card2 = cards[idx2];

                    // check match (same id)
                    if (card1.id === card2.id) {
                        // matched
                        card1.matched = true;
                        card2.matched = true;
                        matchedPairs++;
                        // keep flipped visual, but they become matched (rendered as matched)
                        card1.flipped = true;   // still true but matched overrides css
                        card2.flipped = true;   // matched class will be applied
                        flippedIndices = [];
                        renderBoard();
                        checkWin();
                    } else {
                        // no match: lock board, flip back after 600ms
                        lockBoard = true;
                        setTimeout(() => {
                            // flip back both cards (if not matched in meantime)
                            cards[idx1].flipped = false;
                            cards[idx2].flipped = false;
                            flippedIndices = [];
                            lockBoard = false;
                            renderBoard();
                        }, 600);
                    }
                }
            }

            // handle card click (delegation)
            boardEl.addEventListener('click', (e) => {
                const cardDiv = e.target.closest('.card');
                if (!cardDiv) return;
                if (gameFinished) return;

                const index = cardDiv.dataset.index;
                if (index !== undefined) {
                    flipCard(parseInt(index));
                }
            });

            // reset / new game
            function resetGame() {
                stopTimer();
                secondsElapsed = 0;
                timerSpan.innerText = formatTime(0);
                initCards();
                renderBoard();
                winMessageEl.innerText = 'find all pairs';
            }

            newGameBtn.addEventListener('click', resetGame);

            // initial game
            resetGame();

            // optional: clean up interval on page unload
            window.addEventListener('beforeunload', () => {
                stopTimer();
            });

        })();