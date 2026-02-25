        (function() {
            // ---------- BLACKJACK CORE ----------
            const suits = ['♠', '♥', '♦', '♣'];
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

            // Game state
            let deck = [];
            let playerHand = [];
            let dealerHand = [];
            let gamePhase = 'betting'; // 'betting', 'playerTurn', 'dealerTurn', 'roundEnd'
            let balance = 5000;
            let currentBet = 100;
            let insuranceBet = 0; // not used for simplicity, but classic feel

            // DOM elements
            const dealerRow = document.getElementById('dealerCards');
            const playerRow = document.getElementById('playerCards');
            const balanceSpan = document.getElementById('balanceDisplay');
            const betSpan = document.getElementById('currentBet');
            const gameMsg = document.getElementById('gameMessage');
            const dealBtn = document.getElementById('dealBtn');
            const hitBtn = document.getElementById('hitBtn');
            const standBtn = document.getElementById('standBtn');
            const doubleBtn = document.getElementById('doubleBtn');
            const chips = document.querySelectorAll('.chip');

            // helpers
            function updateBalanceUI() {
                balanceSpan.innerText = balance;
            }
            function updateBetUI() {
                betSpan.innerText = currentBet;
            }

            // disable/enable chips based on phase
            function setChipsEnabled(enabled) {
                chips.forEach(chip => {
                    if (enabled) chip.classList.remove('disabled');
                    else chip.classList.add('disabled');
                });
            }

            // initialize or shuffle deck
            function createShuffledDeck() {
                let newDeck = [];
                for (let suit of suits) {
                    for (let rank of ranks) {
                        newDeck.push({ suit, rank });
                    }
                }
                // Fisher-Yates
                for (let i = newDeck.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
                }
                return newDeck;
            }

            // card value (for counting)
            function cardValue(rank) {
                if (rank === 'A') return 11; // soft handled separately
                if (['J', 'Q', 'K'].includes(rank)) return 10;
                return parseInt(rank);
            }

            // calculate hand total (with soft aces)
            function handTotal(hand) {
                let total = 0;
                let aces = 0;
                for (let card of hand) {
                    if (card.rank === 'A') {
                        aces++;
                        total += 11;
                    } else {
                        total += cardValue(card.rank);
                    }
                }
                while (total > 21 && aces > 0) {
                    total -= 10;
                    aces--;
                }
                return total;
            }

            // check if blackjack (21 with 2 cards)
            function isBlackjack(hand) {
                return hand.length === 2 && handTotal(hand) === 21;
            }

            // render cards
            function renderCards() {
                // dealer
                dealerRow.innerHTML = '';
                dealerHand.forEach((card, index) => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'card';
                    if (gamePhase === 'playerTurn' && index === 0) {
                        // first dealer card hidden during player turn
                        cardDiv.classList.add('hidden');
                    } else {
                        cardDiv.setAttribute('data-suit', card.suit);
                        cardDiv.innerHTML = `
                            <div class="card-top"><span>${card.rank}</span><span>${card.suit}</span></div>
                            <div class="card-center">${card.suit}</div>
                            <div class="card-bottom"><span>${card.rank}</span><span>${card.suit}</span></div>
                        `;
                    }
                    dealerRow.appendChild(cardDiv);
                });

                // player
                playerRow.innerHTML = '';
                playerHand.forEach(card => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'card';
                    cardDiv.setAttribute('data-suit', card.suit);
                    cardDiv.innerHTML = `
                        <div class="card-top"><span>${card.rank}</span><span>${card.suit}</span></div>
                        <div class="card-center">${card.suit}</div>
                        <div class="card-bottom"><span>${card.rank}</span><span>${card.suit}</span></div>
                    `;
                    playerRow.appendChild(cardDiv);
                });
            }

            // reset for new round (but keep deck)
            function resetRound() {
                playerHand = [];
                dealerHand = [];
                renderCards();
                gamePhase = 'betting';
                setChipsEnabled(true);
                dealBtn.disabled = false;
                hitBtn.disabled = true;
                standBtn.disabled = true;
                doubleBtn.disabled = true;
                gameMsg.innerText = 'place your bet';
            }

            // deal initial cards
            function deal() {
                if (balance < currentBet) {
                    gameMsg.innerText = 'insufficient balance';
                    return;
                }
                // deduct bet
                balance -= currentBet;
                updateBalanceUI();

                deck = createShuffledDeck(); // fresh shuffle each deal (premium feel)

                playerHand = [deck.pop(), deck.pop()];
                dealerHand = [deck.pop(), deck.pop()];

                gamePhase = 'playerTurn';
                setChipsEnabled(false);
                dealBtn.disabled = true;
                hitBtn.disabled = false;
                standBtn.disabled = false;
                // double only allowed on first two cards and if balance >= double amount
                if (playerHand.length === 2 && balance >= currentBet) {
                    doubleBtn.disabled = false;
                } else {
                    doubleBtn.disabled = true;
                }

                renderCards();

                // check immediate blackjack
                if (isBlackjack(playerHand) || isBlackjack(dealerHand)) {
                    resolveBlackjack();
                } else {
                    gameMsg.innerText = 'hit or stand?';
                }
            }

            // resolve if initial blackjack
            function resolveBlackjack() {
                let playerBJ = isBlackjack(playerHand);
                let dealerBJ = isBlackjack(dealerHand);

                if (playerBJ && dealerBJ) {
                    // push: return bet
                    balance += currentBet;
                    gameMsg.innerText = 'both blackjack · push';
                } else if (playerBJ) {
                    // player wins 3:2 (classic)
                    let win = Math.floor(currentBet * 1.5);
                    balance += currentBet + win;
                    gameMsg.innerText = `BLACKJACK! you win $${win}`;
                } else if (dealerBJ) {
                    gameMsg.innerText = 'dealer blackjack · you lose';
                }

                if (playerBJ || dealerBJ) {
                    updateBalanceUI();
                    gamePhase = 'roundEnd';
                    hitBtn.disabled = true;
                    standBtn.disabled = true;
                    doubleBtn.disabled = true;
                    // reveal dealer card
                    renderCards(); // all revealed (phase not playerTurn)
                    // after delay allow new bet
                    setTimeout(() => {
                        if (balance <= 0) {
                            gameMsg.innerText = 'out of chips · refresh';
                        } else {
                            resetRound();
                        }
                    }, 2000);
                }
            }

            // hit
            function hit() {
                if (gamePhase !== 'playerTurn') return;
                playerHand.push(deck.pop());
                renderCards();
                let total = handTotal(playerHand);
                if (total > 21) {
                    // bust
                    gameMsg.innerText = 'BUST! dealer wins';
                    gamePhase = 'roundEnd';
                    hitBtn.disabled = true;
                    standBtn.disabled = true;
                    doubleBtn.disabled = true;
                    // reveal dealer
                    renderCards();
                    setTimeout(() => {
                        if (balance <= 0) gameMsg.innerText = 'game over · refresh';
                        else resetRound();
                    }, 2000);
                } else if (total === 21) {
                    stand(); // auto stand on 21
                } else {
                    // double becomes unavailable after hit
                    doubleBtn.disabled = true;
                }
            }

            // stand
            function stand() {
                if (gamePhase !== 'playerTurn') return;
                gamePhase = 'dealerTurn';
                hitBtn.disabled = true;
                standBtn.disabled = true;
                doubleBtn.disabled = true;
                // reveal dealer hole card
                renderCards(); // now hidden removed because phase not playerTurn
                // dealer play
                dealerPlay();
            }

            // double down
            function doubleDown() {
                if (gamePhase !== 'playerTurn' || playerHand.length !== 2 || balance < currentBet) return;

                // deduct additional bet
                balance -= currentBet;
                currentBet *= 2;
                updateBalanceUI();
                updateBetUI();

                // one card only
                playerHand.push(deck.pop());
                renderCards();

                let total = handTotal(playerHand);
                if (total > 21) {
                    gameMsg.innerText = 'double bust · dealer wins';
                    gamePhase = 'roundEnd';
                    hitBtn.disabled = true;
                    standBtn.disabled = true;
                    doubleBtn.disabled = true;
                    renderCards();
                    setTimeout(() => {
                        if (balance <= 0) gameMsg.innerText = 'out of chips';
                        else { resetRound(); updateBetUI(); }
                    }, 2000);
                } else {
                    // stand automatically after double
                    gamePhase = 'dealerTurn';
                    hitBtn.disabled = true;
                    standBtn.disabled = true;
                    doubleBtn.disabled = true;
                    renderCards();
                    dealerPlay();
                }
            }

            // dealer logic (hits until 17 or above)
            function dealerPlay() {
                while (handTotal(dealerHand) < 17) {
                    dealerHand.push(deck.pop());
                }
                renderCards(); // show all

                let dealerTotal = handTotal(dealerHand);
                let playerTotal = handTotal(playerHand);

                let resultMsg = '';
                let payout = 0;

                if (playerTotal > 21) {
                    resultMsg = 'player bust · dealer wins';
                } else if (dealerTotal > 21) {
                    resultMsg = 'dealer bust · you win!';
                    payout = currentBet * 2; // win even money (original bet returned + equal win)
                } else if (playerTotal > dealerTotal) {
                    resultMsg = 'player wins!';
                    payout = currentBet * 2;
                } else if (playerTotal < dealerTotal) {
                    resultMsg = 'dealer wins';
                } else {
                    resultMsg = 'push · tie';
                    payout = currentBet; // return bet
                }

                if (payout > 0) {
                    balance += payout;
                } else if (payout === 0 && resultMsg.includes('push')) {
                    balance += currentBet; // push gives back bet
                }

                updateBalanceUI();
                gameMsg.innerText = resultMsg;
                gamePhase = 'roundEnd';

                // after delay reset (but keep bet same)
                setTimeout(() => {
                    if (balance <= 0) {
                        gameMsg.innerText = 'insufficient funds · refresh';
                    } else {
                        // restore bet to half if doubled
                        if (currentBet > 5000) currentBet = 500; // safety
                        if (currentBet > balance) currentBet = Math.min(100, balance);
                        updateBetUI();
                        resetRound();
                    }
                }, 2000);
            }

            // chip click handler
            chips.forEach(chip => {
                chip.addEventListener('click', (e) => {
                    if (gamePhase !== 'betting') return;
                    let val = parseInt(chip.getAttribute('data-value'));
                    if (currentBet + val <= balance) {
                        currentBet += val;
                    } else {
                        currentBet = balance; // max
                    }
                    if (currentBet > balance) currentBet = balance;
                    if (currentBet < 25) currentBet = 25; // min
                    updateBetUI();
                });
            });

            // buttons
            dealBtn.addEventListener('click', deal);
            hitBtn.addEventListener('click', hit);
            standBtn.addEventListener('click', stand);
            doubleBtn.addEventListener('click', doubleDown);

            // initial render
            updateBalanceUI();
            updateBetUI();
            resetRound();

            // right click prevention (avoid context menu on cards)
            document.querySelectorAll('.card').forEach(c => c.addEventListener('contextmenu', (e) => e.preventDefault()));
        })();