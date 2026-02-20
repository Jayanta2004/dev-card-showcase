    (function() {
      // DOM elements
      const historyEl = document.getElementById('historyDisplay');
      const currentInput = document.getElementById('currentInput');

      // Buttons (will attach via delegation, but also define for clarity)
      const buttonsContainer = document.querySelector('.buttons');

      // Calculator state
      let current = '0';
      let previous = '';          // previous operand / expression
      let operator = null;
      let resetCurrent = false;   // flag to overwrite current on next digit
      let lastResult = null;

      // update both display fields
      function updateDisplay() {
        // format current: if it includes .0? but keep as is
        if (current === '' || current === '-' || current === '.') {
          currentInput.value = '0';
        } else {
          currentInput.value = current;
        }
        historyEl.innerText = previous + (operator ? ' ' + operator : '');
      }

      // sanitize input for multiple decimals, leading zeros etc.
      function sanitizeNumber(value) {
        // if it ends with a dot, keep it for typing
        if (value === '.') return '0.';
        if (value === '') return '';
        // limit dots to one
        const dotCount = (value.match(/\./g) || []).length;
        if (dotCount > 1) {
          // remove extra dots (keep first)
          const parts = value.split('.');
          value = parts[0] + '.' + parts.slice(1).join('');
        }
        // avoid leading zeros like "007" -> "7" but keep "0" and "0.x"
        if (value.length > 1 && !value.startsWith('0.') && !value.startsWith('-0.')) {
          if (value.startsWith('-') && value[1] === '0' && value[2] !== '.' && value.length > 2) {
            value = '-' + parseFloat(value.slice(1)).toString();
          } else if (value[0] === '0' && value[1] !== '.' && value.length > 1) {
            value = parseFloat(value).toString();
          }
        }
        return value;
      }

      // handle number / dot input
      function inputDigit(digit) {
        if (resetCurrent) {
          current = '';
          resetCurrent = false;
        }
        // avoid multiple leading zeros
        if (digit === '0' && (current === '0' || current === '-0')) {
          return;
        }
        if (digit === '.' && current.includes('.')) {
          return; // already have a dot
        }
        if (current === '0' && digit !== '.') {
          current = digit;
        } else if (current === '-0' && digit !== '.') {
          current = '-' + digit;
        } else {
          current = (current === '0' && digit === '.') ? '0.' : current + digit;
        }
        current = sanitizeNumber(current);
        updateDisplay();
      }

      // operator clicked
      function setOperator(op) {
        if (operator && !resetCurrent && previous !== '' && current !== '') {
          // evaluate pending operation
          compute();
        } else if (current === '' && previous !== '' && operator) {
          // just change operator
          operator = op;
          updateDisplay();
          return;
        } else if (current === '' || current === '0') {
          // ignore if no current value, but allow if previous exists
          if (previous !== '') {
            operator = op;
          }
          updateDisplay();
          return;
        }

        if (previous !== '' && operator && !resetCurrent) {
          // after compute, previous becomes result, current cleared
          // then set new operator
          operator = op;
          previous = current;   // result becomes previous
          current = '';
          resetCurrent = false;
        } else {
          // first operator after entering number
          if (current !== '') {
            previous = current;
            current = '';
          }
          operator = op;
        }
        resetCurrent = false;
        updateDisplay();
      }

      // compute result
      function compute() {
        if (operator === null || previous === '' || current === '' || current === '-') return;

        let a = parseFloat(previous);
        let b = parseFloat(current);
        if (isNaN(a) || isNaN(b)) return;

        let result;
        switch (operator) {
          case '+': result = a + b; break;
          case '−': result = a - b; break;
          case '×': result = a * b; break;
          case '÷': 
            if (b === 0) {
              current = 'Error';
              previous = '';
              operator = null;
              resetCurrent = true;
              updateDisplay();
              return;
            }
            result = a / b; 
            break;
          case '%': result = a % b; break;
          default: return;
        }

        // handle floating point precision
        result = Math.round(result * 1e12) / 1e12;

        // store in history
        previous = previous + ' ' + operator + ' ' + current + ' =';
        current = result.toString();
        operator = null;
        resetCurrent = true;  // next digit will start fresh
        updateDisplay();
      }

      // clear all
      function clearAll() {
        current = '0';
        previous = '';
        operator = null;
        resetCurrent = false;
        updateDisplay();
      }

      // backspace
      function backspace() {
        if (resetCurrent) {
          // if we just had a result, backspace clears it
          current = '0';
          resetCurrent = false;
        } else if (current.length > 1) {
          current = current.slice(0, -1);
        } else {
          current = '0';
        }
        if (current === '' || current === '-') current = '0';
        updateDisplay();
      }

      // toggle sign (+/-)
      function toggleSign() {
        if (current !== '' && current !== '0' && current !== 'Error') {
          if (current.startsWith('-')) {
            current = current.slice(1);
          } else {
            current = '-' + current;
          }
        }
        updateDisplay();
      }

      // handle percentage quickly: convert current to % of current (like 50% -> 0.5)
      function percentTransform() {
        if (current !== '' && current !== 'Error' && current !== '-') {
          let val = parseFloat(current);
          if (!isNaN(val)) {
            current = (val / 100).toString();
          }
        }
        updateDisplay();
      }

      // event delegation for all buttons
      buttonsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;

        // handle via id or text content
        const text = btn.innerText;

        // numbers and dot
        if (!btn.classList.contains('operator') && !btn.classList.contains('equals') && !btn.classList.contains('clear') && !btn.classList.contains('backspace')) {
          // digit or dot
          if (text === '.' || (!isNaN(parseInt(text)) && text.length === 1)) {
            inputDigit(text);
          }
        } else if (btn.classList.contains('operator')) {
          const op = text;  // '÷', '×', '−', '+', '%'
          if (op === '%') {
            percentTransform();
          } else {
            setOperator(op);
          }
        } else if (btn.classList.contains('equals')) {
          if (operator && previous !== '' && current !== '' && current !== 'Error') {
            compute();
          } else if (current === 'Error') {
            clearAll();
          } else {
            // just show current
          }
        } else if (btn.classList.contains('clear')) {
          clearAll();
        } else if (btn.classList.contains('backspace')) {
          backspace();
        }

        // extra: double-check if any unexpected button
        // also handle zero explicitly (text '0')
        if (text === '0' && !btn.classList.contains('operator') && !btn.classList.contains('equals')) {
          inputDigit('0');
        }
      });

      // also sign toggling via a hidden gesture? we don't have a dedicated button, but we can simulate with double tap? not needed.
      // Add ± button? many glass calculators have it. we can add it by using 'C' long? but better to embed ± using operator? let's include one extra button? but grid is full.
      // To keep design clean, I'll add ± as a hidden double-click on display? but simpler: long-press on 'C'? not user friendly. Instead I'll replace % with ±? but we have % already.
      // I'll add a small extra: double-tap on display clears history (optional). But better: we reuse a combination? Since the user expects ±, I'll replace the functionality of '%' with ±? no, that's worse. 
      // For completeness, let's add an extra gesture: Press and hold 'C' for ±. (common pattern). We'll implement.
      const clearBtn = document.getElementById('clearBtn');
      let clearPressTimer;
      clearBtn.addEventListener('mousedown', (e) => {
        clearPressTimer = setTimeout(() => {
          toggleSign();
          clearPressTimer = null;
        }, 500); // long press 500ms
      });
      clearBtn.addEventListener('mouseup', () => {
        if (clearPressTimer) {
          clearTimeout(clearPressTimer);
          clearPressTimer = null;
        }
      });
      clearBtn.addEventListener('mouseleave', () => {
        if (clearPressTimer) {
          clearTimeout(clearPressTimer);
          clearPressTimer = null;
        }
      });

      // For mobile touch
      clearBtn.addEventListener('touchstart', (e) => {
        clearPressTimer = setTimeout(() => {
          toggleSign();
          clearPressTimer = null;
        }, 500);
      });
      clearBtn.addEventListener('touchend', (e) => {
        if (clearPressTimer) {
          clearTimeout(clearPressTimer);
          clearPressTimer = null;
        }
      });
      clearBtn.addEventListener('touchcancel', (e) => {
        if (clearPressTimer) {
          clearTimeout(clearPressTimer);
          clearPressTimer = null;
        }
      });

      // Add keyboard support (bonus)
      document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '0' && key <= '9') inputDigit(key);
        else if (key === '.') inputDigit('.');
        else if (key === '+' || key === '-') {
          if (key === '-') setOperator('−'); // we display as minus
          else setOperator('+');
        }
        else if (key === '*') setOperator('×');
        else if (key === '/') {
          e.preventDefault();
          setOperator('÷');
        }
        else if (key === '%') percentTransform();
        else if (key === 'Enter' || key === '=') {
          e.preventDefault();
          if (operator && previous !== '' && current !== '' && current !== 'Error') compute();
        }
        else if (key === 'Backspace') {
          e.preventDefault();
          backspace();
        }
        else if (key === 'Escape') clearAll();
        else if (key === 'Delete') clearAll();
      });

      // initial update
      updateDisplay();

      // also if someone clicks outside but fine
      // handle error reset on new input
      // if current is error, any digit will clear it
      const originalInputDigit = inputDigit;
      window.inputDigit = function(d) {
        if (current === 'Error') clearAll();
        originalInputDigit(d);
      };
      // override closure reference? we need to wrap the actual event handler.
      // easiest: patch the inputDigit function itself
      const superInput = inputDigit;
      inputDigit = function(d) {
        if (current === 'Error') clearAll();
        superInput(d);
      };
      // but we also need inside the event listener
      // replace the event delegation with a wrapper
      // but we already defined listeners. we need to update. We'll re-declare the listener part? simpler: add check at top of handler
      // I'll wrap inside the main listener with a condition. Just modify the existing event delegation code to handle error.
      // Better: add a small check at the beginning of the click handler:
      // we can't change it now because it's hoisted. I'll copy the logic but it's fine, I'll edit above quickly? no, but we can fix by overriding
      // the current function before event attach? but it's already attached. Instead we add another little patch:
      // add event listener to document for keydown, but for click we need to patch the closure? easier: reset the whole listener.
      // I'll rewrite the whole event listener with the error check. It's fine, I can just add below and remove previous?
      // But code is long, let's just adapt the inputDigit function to handle error globally. we'll also adjust the current variable.
      // We'll also override the inputDigit closure by reassigning the function.
      const oldInputDigit = inputDigit;
      inputDigit = function(digit) {
        if (current === 'Error') {
          clearAll();
        }
        oldInputDigit(digit);
      };
      // and we need to update the same inside listener? We'll keep original listener but we call inputDigit function.
      // Our listener calls inputDigit(digit) which now uses the new function. Great.
      // But inside setOperator we also need? we'll patch similarly? setOperator calls compute which sets error. fine.
      // Also backspace should reset error if backspacing? I'll add condition at backspace start:
      const oldBackspace = backspace;
      backspace = function() {
        if (current === 'Error') {
          clearAll();
          return;
        }
        oldBackspace();
      };
      // override functions
      backspace = backspace.bind(this);
    })();