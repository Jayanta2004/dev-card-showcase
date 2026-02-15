    (function() {
      // --- DOM elements
      const coin = document.getElementById('coin3D');
      const tossBtn = document.getElementById('tossBtn');
      const resetHistoryBtn = document.getElementById('resetHistoryBtn');
      const clearHistoryBtn = document.getElementById('clearHistoryBtn');
      const resultLabel = document.getElementById('resultLabel');
      const historyList = document.getElementById('historyList');
      const historyCountSpan = document.getElementById('historyCount');

      // --- state
      let currentSide = 'heads';        // 'heads' or 'tails' (0deg or 180deg)
      let history = [];                 // array of 'heads'/'tails'
      let isFlipping = false;
      let flipSound = null;             // Web Audio oscillator

      // --- audio context (initialized on first user interaction)
      let audioCtx = null;

      function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      // play click / thud sound (short, metallic)
      function playCoinSound() {
        if (!audioCtx) {
          initAudio();
          if (!audioCtx) return;
        }
        // resume if suspended (autoplay policy)
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().then(() => playCoinSound()).catch(() => {});
          return;
        }
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 380; // base metallic "ding"
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gainNode).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.16);

        // add a second short noise for flip "shuffle"
        const noiseCtx = audioCtx; // use same
        const osc2 = noiseCtx.createOscillator();
        const gain2 = noiseCtx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.value = 720;
        gain2.gain.setValueAtTime(0.08, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc2.connect(gain2).connect(noiseCtx.destination);
        osc2.start(now);
        osc2.stop(now + 0.12);
      }

      // play landing "thud"
      function playLandSound() {
        if (!audioCtx) {
          initAudio();
          if (!audioCtx) return;
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume().then(() => playLandSound()).catch(() => {});
          return;
        }
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 220;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }

      // random between min and max
      function randomRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      // update result label & coin rotation (without transition)
      function setSide(side, instant = false) {
        currentSide = side;
        const rotation = (side === 'heads') ? 0 : 180;
        coin.style.transition = instant ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0.9, 0.3, 1.2)';
        coin.style.transform = `rotateY(${rotation}deg)`;
        resultLabel.innerText = side === 'heads' ? 'HEADS' : 'TAILS';
      }

      // add history item
      function addHistory(side) {
        history.push(side);
        if (history.length > 12) history.shift(); // keep last 12
        renderHistory();
      }

      function renderHistory() {
        let html = '';
        history.forEach((item, idx) => {
          const cls = item === 'heads' ? 'heads-item' : 'tails-item';
          html += `<span class="history-item ${cls}">${item === 'heads' ? '🪙 H' : '🌙 T'}</span>`;
        });
        historyList.innerHTML = html || '<span style="color:#9aa79a;">no tosses yet</span>';
        historyCountSpan.innerText = history.length;
      }

      // clear history
      function clearHistory() {
        history = [];
        renderHistory();
      }

      // core flip animation
      function performFlip() {
        if (isFlipping) return;
        isFlipping = true;
        tossBtn.disabled = true;

        // enable audio on user gesture (button)
        initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume().catch(() => {});
        }

        // play flip whoosh sound (multiple fast pips)
        for (let i = 0; i < 4; i++) {
          setTimeout(() => { playCoinSound(); }, i * 45);
        }

        // random number of half rotations (at least 8, up to 22)
        const rotations = 8 + Math.floor(Math.random() * 10); // total half-turns (each 180°)
        // we want final side random: heads (even number of 180° flips) or tails (odd)
        const finalParity = Math.random() > 0.5 ? 0 : 1; // 0 = heads (even), 1 = tails (odd)
        // adjust rotations to match parity: if (rotations %2 != finalParity) add one
        let totalHalfTurns = rotations;
        if (totalHalfTurns % 2 !== finalParity) totalHalfTurns++; // ensure parity

        const finalSide = (totalHalfTurns % 2 === 0) ? 'heads' : 'tails';
        const totalDeg = totalHalfTurns * 180; // total rotation in degrees

        // decide direction: positive or negative for more realism (mix)
        const direction = Math.random() > 0.5 ? 1 : -1;
        const finalAngle = direction * totalDeg;

        // animate using keyframes? simpler: set transform step by step with setTimeout
        // we'll use a rough simulation with incremental steps, but better: use transition and set final rotation.
        // we set a very long transition then update midway? more reliable: set transition 0.8s, start rotation, then after 0.8s set side.
        coin.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)';
        coin.style.transform = `rotateY(${finalAngle}deg)`;

        // play landing sound near end
        setTimeout(() => {
          playLandSound();
        }, 700);

        // after animation, set correct face (without transition jump)
        setTimeout(() => {
          // set final side with instant rotation (reset to 0 or 180)
          coin.style.transition = 'none';
          const resetDeg = finalSide === 'heads' ? 0 : 180;
          coin.style.transform = `rotateY(${resetDeg}deg)`;
          currentSide = finalSide;
          resultLabel.innerText = finalSide === 'heads' ? 'HEADS' : 'TAILS';

          // add to history
          addHistory(finalSide);

          isFlipping = false;
          tossBtn.disabled = false;
        }, 820); // slightly after transition
      }

      // toss button
      tossBtn.addEventListener('click', () => {
        performFlip();
      });

      // click on coin also toss
      coin.addEventListener('click', (e) => {
        e.stopPropagation();
        performFlip();
      });

      // reset/clear history
      function resetAllHistory() {
        clearHistory();
      }
      resetHistoryBtn.addEventListener('click', resetAllHistory);
      clearHistoryBtn.addEventListener('click', resetAllHistory);

      // initialise: set heads, empty history
      setSide('heads', true);
      renderHistory();

      // ensure audio resumes on first click (if needed, but we already call in flip)
      // also pre-init audio context on first hover/touch? we'll init inside flip.
    })();