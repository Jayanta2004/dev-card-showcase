    (function() {
      // ---------- GAME STATE ----------
      const suits = ['♠', '♥', '♦', '♣'];
      const values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

      let deck = [];
      let playerHand = [];
      let dealerHand = [];
      let gamePhase = 'betting';    // 'betting', 'playerTurn', 'dealerTurn', 'roundEnd'
      let balance = 1000;
      let currentBet = 0;
      let selectedChip = 10;        // default chip

      // DOM elements
      const dealerCardsDiv = document.getElementById('dealerCards');
      const playerCardsDiv = document.getElementById('playerCards');
      const dealerScoreSpan = document.getElementById('dealerScore');
      const playerScoreSpan = document.getElementById('playerScore');
      const balanceDisplay = document.getElementById('balanceDisplay');
      const betDisplay = document.getElementById('betDisplay');
      const messageDiv = document.getElementById('message');

      const dealBtn = document.getElementById('dealBtn');
      const hitBtn = document.getElementById('hitBtn');
      const standBtn = document.getElementById('standBtn');
      const resetBetBtn = document.getElementById('resetBetBtn');
      const chips = document.querySelectorAll('.chip');

      // chip selection
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          if (gamePhase !== 'betting') {
            messageDiv.innerText = 'wait until next round';
            return;
          }
          chips.forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedChip = parseInt(chip.dataset.value, 10);
        });
        // preset first chip selected
        if (chip.dataset.value == '10') chip.classList.add('selected');
      });

      // place bet (click on chip already selects, but we also add bet by clicking again? but simpler: click chip adds to bet)
      // we use chip click to add bet (if betting phase)
      chips.forEach(chip => {
        chip.addEventListener('dblclick', (e) => {   // double click to add bet
          if (gamePhase !== 'betting') {
            messageDiv.innerText = 'cannot bet now';
            return;
          }
          const val = parseInt(chip.dataset.value, 10);
          if (balance >= currentBet + val) {
            currentBet += val;
            updateBetBalance();
            messageDiv.innerText = `bet $${currentBet}`;
          } else {
            messageDiv.innerText = 'insufficient balance';
          }
        });
      });

      // also add simple click (single) to add chip quickly? but we use separate: chip click to select, double to add.
      // for usability, we also add a small button: but we keep as is. we can add by pressing chip then "add" but it's fine.
      // alternative: each chip can be clicked to add that amount (if betting). Let's change: single click = add that amount.
      chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          if (gamePhase !== 'betting') {
            messageDiv.innerText = 'betting only before deal';
            return;
          }
          const val = parseInt(chip.dataset.value, 10);
          if (balance >= currentBet + val) {
            currentBet += val;
            updateBetBalance();
            messageDiv.innerText = `bet $${currentBet}`;
          } else {
            messageDiv.innerText = '❌ not enough coins';
          }
        });
      });

      function updateBetBalance() {
        betDisplay.innerText = currentBet;
        balanceDisplay.innerText = `💰 ${balance}`;
        dealBtn.disabled = (currentBet === 0 || gamePhase !== 'betting');
      }

      // reset bet (clear currentBet to 0, refund)
      resetBetBtn.addEventListener('click', () => {
        if (gamePhase === 'betting') {
          balance += currentBet;   // refund
          currentBet = 0;
          updateBetBalance();
          messageDiv.innerText = 'bet reset';
        } else {
          messageDiv.innerText = 'cannot reset during hand';
        }
      });

      // ---------- HELPER FUNCTIONS ----------
      function createDeck() {
        deck = [];
        for (let s of suits) {
          for (let v of values) {
            deck.push({ suit: s, value: v });
          }
        }
        shuffle(deck);
      }

      function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      }

      function getCardValue(card, aceHigh = true) {
        if (card.value === 'A') return aceHigh ? 11 : 1;
        if (['K','Q','J'].includes(card.value)) return 10;
        return parseInt(card.value);
      }

      function computeHandScore(hand) {
        let score = 0;
        let aces = 0;
        for (let card of hand) {
          if (card.value === 'A') aces++;
          score += getCardValue(card, true);
        }
        while (score > 21 && aces > 0) {
          score -= 10;
          aces--;
        }
        return score;
      }

      function renderCard(card, hidden = false) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        if (hidden) {
          cardDiv.classList.add('card-back');
          cardDiv.innerText = '';
          return cardDiv;
        }
        const isRed = (card.suit === '♥' || card.suit === '♦');
        cardDiv.classList.add(isRed ? 'red' : 'black');
        const topSpan = document.createElement('div');
        topSpan.className = 'top-suit';
        topSpan.innerText = card.value + card.suit;
        const bottomSpan = document.createElement('div');
        bottomSpan.className = 'bottom-suit';
        bottomSpan.innerText = card.suit + ' ' + card.value;
        cardDiv.appendChild(topSpan);
        cardDiv.appendChild(bottomSpan);
        return cardDiv;
      }

      function renderGame() {
        // dealer cards
        dealerCardsDiv.innerHTML = '';
        if (dealerHand.length === 0) {
          dealerCardsDiv.innerHTML = '<div style="color:#efe6c9;">waiting</div>';
        } else {
          dealerHand.forEach((card, idx) => {
            // hide first card if dealerTurn not started AND gamePhase not dealerTurn and round not end
            const hide = (idx === 0 && gamePhase === 'playerTurn');
            dealerCardsDiv.appendChild(renderCard(card, hide));
          });
        }

        // player cards
        playerCardsDiv.innerHTML = '';
        playerHand.forEach(card => {
          playerCardsDiv.appendChild(renderCard(card, false));
        });

        // scores
        if (gamePhase === 'playerTurn') {
          dealerScoreSpan.innerText = '?'; // hide hole card
        } else {
          const dealerScore = dealerHand.length ? computeHandScore(dealerHand) : 0;
          dealerScoreSpan.innerText = dealerScore;
        }
        const playerScore = playerHand.length ? computeHandScore(playerHand) : 0;
        playerScoreSpan.innerText = playerScore;
      }

      // start new round after bet placed
      function startRound() {
        if (currentBet === 0) {
          messageDiv.innerText = 'place a bet first';
          return;
        }
        // deduct bet from balance
        balance -= currentBet;
        balanceDisplay.innerText = `💰 ${balance}`;
        gamePhase = 'playerTurn';
        createDeck();
        playerHand = [deck.pop(), deck.pop()];
        dealerHand = [deck.pop(), deck.pop()];

        // check blackjack (player)
        const playerScore = computeHandScore(playerHand);
        if (playerScore === 21) {
          // player blackjack, dealer might also have
          const dealerScore = computeHandScore(dealerHand);
          if (dealerScore === 21) {
            // tie (push)
            messageDiv.innerText = 'blackjack push! both have 21';
            balance += currentBet;  // refund
            gamePhase = 'roundEnd';
          } else {
            messageDiv.innerText = '🎉 BLACKJACK! you win 1.5x';
            balance += currentBet + Math.floor(currentBet * 1.5);
            gamePhase = 'roundEnd';
          }
          endRound();
        } else {
          // normal proceed
          messageDiv.innerText = 'your turn: hit or stand';
        }
        renderGame();
        updateButtons();
      }

      function hit() {
        if (gamePhase !== 'playerTurn') return;
        playerHand.push(deck.pop());
        const playerScore = computeHandScore(playerHand);
        renderGame();
        if (playerScore > 21) {
          // bust
          messageDiv.innerText = '💥 BUST! dealer wins';
          gamePhase = 'roundEnd';
          endRound();
        } else if (playerScore === 21) {
          // optional stand
          messageDiv.innerText = '21! press stand';
        }
        updateButtons();
      }

      function stand() {
        if (gamePhase !== 'playerTurn') return;
        gamePhase = 'dealerTurn';
        // dealer reveals hole card
        renderGame();
        // dealer draws to 17 or above
        while (computeHandScore(dealerHand) < 17) {
          dealerHand.push(deck.pop());
        }
        renderGame();
        // determine winner
        const playerScore = computeHandScore(playerHand);
        const dealerScore = computeHandScore(dealerHand);
        let resultMsg = '';
        let winAmount = 0;
        if (dealerScore > 21) {
          resultMsg = '🎉 dealer bust! you win!';
          winAmount = currentBet * 2;
          balance += currentBet * 2;
        } else if (dealerScore > playerScore) {
          resultMsg = '😞 dealer wins';
          // bet already lost (balance reduced)
        } else if (dealerScore < playerScore) {
          resultMsg = '✅ you win!';
          winAmount = currentBet * 2;
          balance += currentBet * 2;
        } else {
          resultMsg = '🤝 push (tie)';
          balance += currentBet;  // refund
        }
        if (winAmount) balanceDisplay.innerText = `💰 ${balance}`;
        messageDiv.innerText = resultMsg;
        gamePhase = 'roundEnd';
        endRound();
      }

      function endRound() {
        renderGame();
        updateButtons();
        // reset hand for next round but keep bet? we reset betting phase and allow new bet.
        gamePhase = 'betting';
        currentBet = 0;
        betDisplay.innerText = '0';
        dealBtn.disabled = true; // until bet placed
        // enable resetBet
        playerHand = [];
        dealerHand = [];
        renderGame();
        updateButtons();
        balanceDisplay.innerText = `💰 ${balance}`;
        if (balance <= 0) messageDiv.innerText = '💔 you are out of money – refresh to restart';
      }

      function updateButtons() {
        dealBtn.disabled = (gamePhase !== 'betting' || currentBet === 0);
        hitBtn.disabled = (gamePhase !== 'playerTurn');
        standBtn.disabled = (gamePhase !== 'playerTurn');
        // resetBet enabled only during betting
        resetBetBtn.disabled = (gamePhase !== 'betting');
      }

      // button listeners
      dealBtn.addEventListener('click', startRound);
      hitBtn.addEventListener('click', hit);
      standBtn.addEventListener('click', stand);

      // init
      function initGame() {
        balance = 1000;
        currentBet = 0;
        gamePhase = 'betting';
        playerHand = [];
        dealerHand = [];
        renderGame();
        updateBetBalance();
        messageDiv.innerText = 'place your bet with chips';
        updateButtons();
      }
      initGame();

      // after end, reset hand display
    })();