    (function() {
        // ---------- game state ----------
        let playerScore = 0;          // permanent score
        let computerScore = 0;
        let roundScore = 0;           // unbanked points for current player
        let currentTurn = 'player';    // 'player' or 'computer'
        let gameOver = false;

        // DOM elements
        const playerScoreSpan = document.getElementById('playerScore');
        const computerScoreSpan = document.getElementById('computerScore');
        const playerDieDiv = document.getElementById('playerDie');
        const computerDieDiv = document.getElementById('computerDie');
        const roundPotDiv = document.getElementById('roundPot');
        const turnMessageDiv = document.getElementById('turnMessage');
        const gameMessageDiv = document.getElementById('gameMessage');

        const rollBtn = document.getElementById('rollBtn');
        const holdBtn = document.getElementById('holdBtn');
        const resetBtn = document.getElementById('resetBtn');

        // helper: convert die value (1-6) to unicode symbol (simple representation)
        function getDieFace(value) {
            const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
            return faces[value - 1] || '⚀';
        }

        // update UI scores, dice, pot
        function refreshUI(playerDieValue = 1, computerDieValue = 1) {
            playerScoreSpan.textContent = playerScore;
            computerScoreSpan.textContent = computerScore;
            roundPotDiv.textContent = `round pot: ${roundScore}`;

            // show dice faces (only update if provided, but keep displayed)
            playerDieDiv.textContent = getDieFace(playerDieValue);
            computerDieDiv.textContent = getDieFace(computerDieValue);

            // turn indicator and message
            if (gameOver) {
                turnMessageDiv.textContent = '🏁 GAME OVER';
            } else {
                turnMessageDiv.textContent = currentTurn === 'player' ? '🎲 your turn · roll or hold' : '🤖 computer thinking ...';
            }
        }

        // random 1-6
        function rollDie() {
            return Math.floor(Math.random() * 6) + 1;
        }

        // computer turn logic (simple: roll until risk > 5 or hold if round score >= 8)
        function computerTurn() {
            if (gameOver || currentTurn !== 'computer') return;

            function computerMove() {
                if (gameOver || currentTurn !== 'computer') return;

                // computer decision: hold if round score >= 8, else roll with 70% chance, but also sometimes hold if score>4 randomly?
                // we'll implement a simple AI: if round score >= 9, always hold; otherwise 70% roll, 30% hold (but risk of rolling 1)
                // but to make it interesting and keep turn moving, we use a small timeout.

                if (roundScore >= 9) {
                    // computer holds
                    holdComputer();
                    return;
                }

                // random decision: 70% roll, 30% hold (if roundScore>0, else must roll)
                if (roundScore === 0) {
                    // must roll (can't hold zero)
                    performComputerRoll();
                } else {
                    const decision = Math.random();
                    if (decision < 0.7) {  // 70% roll
                        performComputerRoll();
                    } else {
                        holdComputer();
                    }
                }
            }

            function performComputerRoll() {
                // roll for computer (as current player)
                const die = rollDie();
                // display computer die (the rolling player)
                if (currentTurn === 'computer') {
                    computerDieDiv.textContent = getDieFace(die);  // computer's own die
                }

                if (die === 1) {
                    // lose round score, switch turn to player
                    roundScore = 0;
                    gameMessageDiv.textContent = '💥 Computer rolled 1! Round lost. Your turn.';
                    currentTurn = 'player';
                    refreshUI(1, die);  // keep player die as previous? we don't have player die now; we can set player die to 1 as placeholder.
                    // better to update both dice: player die unchanged (last known) but we can keep it.
                    // we'll fetch current playerDie from DOM? we'll not. but we can store last player roll. for simplicity just show.
                    // we'll call refresh with default die representation (just update computer die).
                    // but we want to keep player die unchanged. we can pass stored value.
                    // we'll store last player roll separately. add state:
                    lastPlayerRoll = 1; // but we don't have it; we'll store last roll values.
                } else {
                    // add to round score
                    roundScore += die;
                    gameMessageDiv.textContent = `🤖 computer rolled ${die}, round score ${roundScore}`;
                    // computer continues (recursive call with small delay)
                    refreshUI(lastPlayerRoll, die); // need to know player last roll
                    // but we don't track player last roll. we can store it: lastPlayerDie, lastComputerDie.
                }
                // after roll, if not 1, we call computerTurn again (recursive after short delay)
                if (die !== 1 && currentTurn === 'computer' && !gameOver) {
                    setTimeout(computerTurn, 600);
                } else if (die === 1) {
                    // turn passed to player
                    refreshUI(lastPlayerRoll, die);
                    // enable buttons (player turn)
                    setButtonsDisabled(false);
                }
            }

            function holdComputer() {
                // bank computer round score
                computerScore += roundScore;
                roundScore = 0;
                gameMessageDiv.textContent = '🤖 computer holds. Your turn.';
                currentTurn = 'player';
                refreshUI(lastPlayerRoll, lastComputerDie); 
                setButtonsDisabled(false);
                // check win condition after hold
                checkGameOver();
            }

            // need to keep last known dice for display
            if (currentTurn === 'computer') {
                setButtonsDisabled(true); // ensure buttons disabled
                // slight delay to feel natural
                setTimeout(computerMove, 400);
            }
        }

        // track last rolled dice (for display)
        let lastPlayerRoll = 1;
        let lastComputerDie = 1;

        // switch to computer turn
        function startComputerTurn() {
            if (gameOver) return;
            currentTurn = 'computer';
            gameMessageDiv.textContent = '💭 Computer thinking...';
            refreshUI(lastPlayerRoll, lastComputerDie);
            setButtonsDisabled(true);
            computerTurn();
        }

        // player roll
        function handlePlayerRoll() {
            if (gameOver || currentTurn !== 'player') return;

            const roll = rollDie();
            lastPlayerRoll = roll;   // store for display
            playerDieDiv.textContent = getDieFace(roll);

            if (roll === 1) {
                // lose round points, switch to computer
                roundScore = 0;
                gameMessageDiv.textContent = '💔 You rolled 1! Round lost. Computer turn.';
                refreshUI(roll, lastComputerDie);
                startComputerTurn();
            } else {
                roundScore += roll;
                gameMessageDiv.textContent = `✅ You rolled ${roll}. round pot: ${roundScore}`;
                refreshUI(roll, lastComputerDie);
                // turn remains player, no change
            }
        }

        // player hold
        function handlePlayerHold() {
            if (gameOver || currentTurn !== 'player') return;
            if (roundScore === 0) {
                gameMessageDiv.textContent = '⚠️ No points to hold. Roll first.';
                return;
            }
            // bank
            playerScore += roundScore;
            roundScore = 0;
            gameMessageDiv.textContent = '💰 You held. Computer turn.';
            refreshUI(lastPlayerRoll, lastComputerDie);
            // check win after hold
            if (checkGameOver()) return;
            startComputerTurn();
        }

        // check if either player reached 50 (win condition)
        function checkGameOver() {
            if (playerScore >= 50) {
                gameOver = true;
                gameMessageDiv.textContent = '🏆 YOU WIN! congratulations!';
                turnMessageDiv.textContent = '🎉 GAME OVER';
                setButtonsDisabled(true);
                return true;
            } else if (computerScore >= 50) {
                gameOver = true;
                gameMessageDiv.textContent = '🤖 COMPUTER WINS ... better luck next time.';
                turnMessageDiv.textContent = '🏁 GAME OVER';
                setButtonsDisabled(true);
                return true;
            }
            return false;
        }

        // enable/disable action buttons
        function setButtonsDisabled(disabled) {
            rollBtn.disabled = disabled;
            holdBtn.disabled = disabled;
        }

        // reset entire game
        function resetGame() {
            playerScore = 0;
            computerScore = 0;
            roundScore = 0;
            currentTurn = 'player';
            gameOver = false;
            lastPlayerRoll = 1;
            lastComputerDie = 1;
            playerDieDiv.textContent = '⚀';
            computerDieDiv.textContent = '⚀';
            gameMessageDiv.textContent = 'New game! Roll the dice.';
            refreshUI(1, 1);
            setButtonsDisabled(false);
        }

        // event listeners
        rollBtn.addEventListener('click', () => {
            handlePlayerRoll();
            checkGameOver();
        });

        holdBtn.addEventListener('click', () => {
            handlePlayerHold();
            // checkGameOver inside hold
        });

        resetBtn.addEventListener('click', () => {
            resetGame();
        });

        // initial reset
        resetGame();

        // helper: for computerTurn we need to hold computer stuff, also need to store lastComputerDie. update during computer rolls
        // override: we'll integrate lastComputerDie set inside computerTurn
        // Let's modify: store computer last die inside computer turn.

        // we'll patch: after computer roll, set lastComputerDie = die. after hold, keep previous. 
        // but we also need to show computer die. we'll store.

        // Re-declare computerTurn with variable access.
        // but already declared above, we need to merge. Instead, rewrite computerTurn with closure access.

        // clean approach: we already have lastComputerDie variable. inside computerTurn we will update.

        // redefining computerTurn with proper updates (since hoisting, we can just reassign later)
        // replace the earlier empty function with full implementation.
        // We'll just replace the whole script section with final version.
        // To avoid confusion, I'll re-start logic:

        // reset state and attach final computer logic using existing variables.
        // use a flag to prevent overlapping turns

        let computerTurnActive = false;

        function startComputerTurn() {
            if (gameOver || currentTurn !== 'computer' || computerTurnActive) return;
            computerTurnActive = true;
            setButtonsDisabled(true);
            gameMessageDiv.textContent = '🤖 computer is rolling ...';
            // slight delay then run computer loop
            setTimeout(() => {
                if (gameOver || currentTurn !== 'computer') {
                    computerTurnActive = false;
                    return;
                }
                performComputerDecision();
            }, 400);
        }

        function performComputerDecision() {
            if (gameOver || currentTurn !== 'computer') {
                computerTurnActive = false;
                return;
            }

            // if roundScore >= 8, hold with high probability, or hold if risky
            if (roundScore >= 9) {
                // hold
                computerScore += roundScore;
                roundScore = 0;
                gameMessageDiv.textContent = '🤖 computer holds. your turn.';
                currentTurn = 'player';
                refreshUI(lastPlayerRoll, lastComputerDie);
                computerTurnActive = false;
                setButtonsDisabled(false);
                checkGameOver();
                return;
            }

            // otherwise roll
            const roll = rollDie();
            lastComputerDie = roll;
            computerDieDiv.textContent = getDieFace(roll);

            if (roll === 1) {
                // lose round points, switch turn
                roundScore = 0;
                gameMessageDiv.textContent = '💥 computer rolled 1! your turn.';
                currentTurn = 'player';
                refreshUI(lastPlayerRoll, roll);
                computerTurnActive = false;
                setButtonsDisabled(false);
                // no score add
            } else {
                roundScore += roll;
                gameMessageDiv.textContent = `🤖 computer rolled ${roll}, round score ${roundScore}`;
                refreshUI(lastPlayerRoll, roll);
                // recursive decision after short delay
                if (currentTurn === 'computer' && !gameOver) {
                    setTimeout(() => performComputerDecision(), 500);
                } else {
                    computerTurnActive = false;
                }
            }
            checkGameOver();
        }

        // Override hold/roll to use new computer turn
        // Reattach:
        rollBtn.onclick = () => {
            if (gameOver || currentTurn !== 'player') return;
            const roll = rollDie();
            lastPlayerRoll = roll;
            playerDieDiv.textContent = getDieFace(roll);
            if (roll === 1) {
                roundScore = 0;
                gameMessageDiv.textContent = '💔 You rolled 1! Computer turn.';
                refreshUI(roll, lastComputerDie);
                currentTurn = 'computer';
                startComputerTurn();
            } else {
                roundScore += roll;
                gameMessageDiv.textContent = `✅ You rolled ${roll}. round pot: ${roundScore}`;
                refreshUI(roll, lastComputerDie);
            }
            checkGameOver();
        };

        holdBtn.onclick = () => {
            if (gameOver || currentTurn !== 'player') return;
            if (roundScore === 0) {
                gameMessageDiv.textContent = '⚠️ Nothing to hold. roll first.';
                return;
            }
            playerScore += roundScore;
            roundScore = 0;
            gameMessageDiv.textContent = '💰 You held. Computer turn.';
            refreshUI(lastPlayerRoll, lastComputerDie);
            if (checkGameOver()) return;
            currentTurn = 'computer';
            startComputerTurn();
        };

        resetBtn.onclick = () => {
            playerScore = 0;
            computerScore = 0;
            roundScore = 0;
            currentTurn = 'player';
            gameOver = false;
            lastPlayerRoll = 1;
            lastComputerDie = 1;
            playerDieDiv.textContent = '⚀';
            computerDieDiv.textContent = '⚀';
            gameMessageDiv.textContent = 'New game! Roll the dice.';
            refreshUI(1, 1);
            setButtonsDisabled(false);
            computerTurnActive = false;
        };

        // initial display
        refreshUI(1, 1);
        setButtonsDisabled(false);
    })();