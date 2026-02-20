    (function(){
      "use strict";

      // ----- GAME STATE -----
      let board = Array(8).fill().map(() => Array(8).fill(null));
      let currentPlayer = 'white'; // white moves first
      let selectedRow = -1, selectedCol = -1;
      let mandatoryCaptures = [];   // list of {row, col} for current player with capture
      let currentCaptureChain = null; // if a capture is in progress, store piece pos

      // DOM elements
      const boardEl = document.getElementById('checkersBoard');
      const turnText = document.getElementById('turnText');
      const turnDot = document.getElementById('turnDot');
      const statusEl = document.getElementById('statusMessage');

      // ----- INITIAL BOARD (standard checkers) -----
      function initBoard() {
        // clear board
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            board[r][c] = null;
          }
        }

        // place white pieces (top of board: rows 0,1,2)
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 !== 0) { // dark squares only
              board[r][c] = { color: 'white', king: false };
            }
          }
        }

        // place red pieces (bottom: rows 5,6,7)
        for (let r = 5; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 !== 0) {
              board[r][c] = { color: 'red', king: false };
            }
          }
        }
      }

      // ----- RENDER BOARD with current state -----
      function renderBoard() {
        boardEl.innerHTML = '';
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.className = 'square';
            // light / dark pattern
            if ((r + c) % 2 === 0) {
              square.classList.add('light');
            } else {
              square.classList.add('dark');
            }

            square.dataset.row = r;
            square.dataset.col = c;

            // piece rendering
            const piece = board[r][c];
            if (piece) {
              const pieceDiv = document.createElement('div');
              pieceDiv.className = `piece ${piece.color}`;
              if (piece.king) {
                pieceDiv.classList.add('king');
                pieceDiv.innerHTML = '<span class="king-star">✦</span>'; // king symbol
              } else {
                pieceDiv.innerHTML = ''; // no symbol, just clean
              }
              square.appendChild(pieceDiv);
            }

            // visual hints: selected, possible moves (cached later)
            if (selectedRow === r && selectedCol === c) {
              square.classList.add('selected');
            }

            // add possible move hint from function (called later)
            boardEl.appendChild(square);
          }
        }

        // after building, apply move hints and capture highlights (separate)
        highlightPossibleMoves();
        updateTurnDisplay();
      }

      // ----- TURN & STATUS UI -----
      function updateTurnDisplay() {
        if (currentPlayer === 'white') {
          turnText.innerText = 'white’s turn';
          turnDot.style.background = '#dae1ea'; // soft white
        } else {
          turnText.innerText = 'red’s turn';
          turnDot.style.background = '#e6bcb6'; // soft red
        }

        // detect win condition
        const whiteCount = countPieces('white');
        const redCount = countPieces('red');
        if (whiteCount === 0) {
          statusEl.innerText = '✦ red wins!';
        } else if (redCount === 0) {
          statusEl.innerText = '✦ white wins!';
        } else {
          statusEl.innerText = `✦ ${currentPlayer}'s turn`;
        }
      }

      function countPieces(color) {
        let cnt = 0;
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] && board[r][c].color === color) cnt++;
          }
        }
        return cnt;
      }

      // ----- CAPTURE / MOVE LOGIC (standard checkers) -----
      function getValidMoves(row, col) {
        const piece = board[row][col];
        if (!piece || piece.color !== currentPlayer) return { moves: [], captures: [] };

        const moves = [];
        const captures = [];
        const dirs = piece.king ? [-1, 1] : (piece.color === 'white' ? [1] : [-1]); // white moves down (+1), red up (-1)

        // single step moves (non-capture)
        for (let dRow of dirs) {
          for (let dCol of [-1, 1]) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && !board[newRow][newCol]) {
              moves.push({ row: newRow, col: newCol, capture: null });
            }
          }
        }

        // captures (jumps)
        for (let dRow of dirs) {
          for (let dCol of [-1, 1]) {
            const jumpRow = row + dRow * 2;
            const jumpCol = col + dCol * 2;
            const midRow = row + dRow;
            const midCol = col + dCol;
            if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
              const midPiece = board[midRow][midCol];
              if (midPiece && midPiece.color !== piece.color && !board[jumpRow][jumpCol]) {
                captures.push({ row: jumpRow, col: jumpCol, capture: { row: midRow, col: midCol } });
              }
            }
          }
        }
        return { moves, captures };
      }

      // determine if current player has any capture anywhere
      function hasAnyCapture(color) {
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === color) {
              const { captures } = getValidMoves(r, c);
              if (captures.length > 0) return true;
            }
          }
        }
        return false;
      }

      // highlight moves for selected piece + possible capture hints
      function highlightPossibleMoves() {
        // first remove all possible-move, possible-capture classes
        document.querySelectorAll('.square.dark').forEach(sq => {
          sq.classList.remove('possible-move', 'possible-capture', 'selected');
        });

        // re-add selected class
        if (selectedRow !== -1) {
          const selectedSq = document.querySelector(`.square[data-row="${selectedRow}"][data-col="${selectedCol}"]`);
          if (selectedSq) selectedSq.classList.add('selected');
        }

        if (selectedRow === -1 || selectedCol === -1) return;

        const piece = board[selectedRow][selectedCol];
        if (!piece || piece.color !== currentPlayer) return;

        const { moves, captures } = getValidMoves(selectedRow, selectedCol);
        const forcedCapture = hasAnyCapture(currentPlayer);

        // if forced capture exists and this piece has captures -> show only captures; else if forced but no capture -> no moves
        if (forcedCapture) {
          if (captures.length > 0) {
            captures.forEach(m => {
              const sq = document.querySelector(`.square[data-row="${m.row}"][data-col="${m.col}"]`);
              if (sq) sq.classList.add('possible-capture');
            });
          }
        } else {
          // normal moves (non-capture) and also captures are allowed but not forced
          moves.forEach(m => {
            const sq = document.querySelector(`.square[data-row="${m.row}"][data-col="${m.col}"]`);
            if (sq) sq.classList.add('possible-move');
          });
          captures.forEach(m => {
            const sq = document.querySelector(`.square[data-row="${m.row}"][data-col="${m.col}"]`);
            if (sq) sq.classList.add('possible-capture');
          });
        }
      }

      // ----- MOVE EXECUTION -----
      function tryMove(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        if (!piece || piece.color !== currentPlayer) return false;

        const { moves, captures } = getValidMoves(fromRow, fromCol);
        const forcedCapture = hasAnyCapture(currentPlayer);

        // check if move is among captures
        const captureMove = captures.find(m => m.row === toRow && m.col === toCol);
        if (captureMove) {
          // execute jump
          const mid = captureMove.capture;
          board[toRow][toCol] = { ...piece };
          board[fromRow][fromCol] = null;
          board[mid.row][mid.col] = null; // remove captured piece

          // king me?
          if (!piece.king) {
            if ((piece.color === 'white' && toRow === 7) || (piece.color === 'red' && toRow === 0)) {
              board[toRow][toCol].king = true;
            }
          }

          // after capture: check for further captures from new position (multi-jump)
          const newMoves = getValidMoves(toRow, toCol);
          if (newMoves.captures.length > 0) {
            // stay in capture chain, keep same player, select this piece
            selectedRow = toRow;
            selectedCol = toCol;
            renderBoard();
            return true;
          }

          // else end turn
          finishTurn();
          return true;
        }

        // non-capture move (only if no forced capture)
        const normalMove = moves.find(m => m.row === toRow && m.col === toCol);
        if (normalMove && !forcedCapture) {
          board[toRow][toCol] = { ...piece };
          board[fromRow][fromCol] = null;

          if (!piece.king) {
            if ((piece.color === 'white' && toRow === 7) || (piece.color === 'red' && toRow === 0)) {
              board[toRow][toCol].king = true;
            }
          }
          finishTurn();
          return true;
        }
        return false;
      }

      function finishTurn() {
        // switch player
        currentPlayer = currentPlayer === 'white' ? 'red' : 'white';
        selectedRow = -1; selectedCol = -1;
        renderBoard();
        // check win condition after switch
        updateTurnDisplay();
      }

      // ----- EVENT LISTENERS (click handling) -----
      function handleSquareClick(e) {
        const square = e.currentTarget;
        const row = parseInt(square.dataset.row, 10);
        const col = parseInt(square.dataset.col, 10);

        // game over if zero pieces
        if (countPieces('white') === 0 || countPieces('red') === 0) return;

        // if clicked square has a piece of current player -> select/deselect
        const piece = board[row][col];
        if (piece && piece.color === currentPlayer) {
          // reselect
          if (selectedRow === row && selectedCol === col) {
            selectedRow = -1; selectedCol = -1;
          } else {
            selectedRow = row;
            selectedCol = col;
          }
          renderBoard();
          return;
        }

        // attempt move if we have a selected piece
        if (selectedRow !== -1 && selectedCol !== -1) {
          const success = tryMove(selectedRow, selectedCol, row, col);
          if (!success) {
            // invalid move: deselect? keep selection
            // but we can just rerender with selection
          }
          renderBoard(); // ensure updated
        }
      }

      // ----- RESET GAME -----
      function resetGame() {
        initBoard();
        currentPlayer = 'white';
        selectedRow = -1;
        selectedCol = -1;
        renderBoard();
      }

      // ----- ATTACH CLICK LISTENERS -----
      function attachListeners() {
        document.querySelectorAll('.square').forEach(sq => {
          sq.removeEventListener('click', handleSquareClick);
          sq.addEventListener('click', handleSquareClick);
        });
      }

      // Override renderBoard to re-attach listeners
      const originalRender = renderBoard;
      renderBoard = function() {
        originalRender.call(this);
        attachListeners();
      };

      // ----- INITIALISE -----
      initBoard();
      renderBoard();

      // reset button
      document.getElementById('resetBtn').addEventListener('click', function() {
        resetGame();
      });

    })();