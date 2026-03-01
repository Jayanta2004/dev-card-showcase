  (function() {
    // --- canvas & character ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const actionLog = document.getElementById('actionLog');
    const listeningStatus = document.getElementById('listeningStatus');
    const micBtn = document.getElementById('micButton');

    // character physics (simple ground at y=300)
    const GROUND_Y = 300;
    const CHAR_WIDTH = 32;
    const CHAR_HEIGHT = 42;
    let charX = 140;               // start position
    let charY = GROUND_Y - CHAR_HEIGHT; // standing on ground
    let vy = 0;
    let isOnGround = true;
    const GRAVITY = 0.5;
    const JUMP_FORCE = -10;
    const MOVE_STEP = 15;          // pixels per voice command
    const MIN_X = 30;
    const MAX_X = 690 - CHAR_WIDTH; // right boundary

    // --- voice recognition setup ---
    let recognition = null;
    let isListening = false;        // are we currently capturing voice?
    let forcedStop = false;         // just for ui feedback

    // recent command (for display)
    let lastCommand = '—';

    // speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      listeningStatus.innerHTML = '❌ speech not supported';
      micBtn.style.opacity = '0.4';
      actionLog.innerText = '🚫 browser lacks speech recognition';
    } else {
      recognition = new SpeechRecognition();
      recognition.continuous = true;      // keep listening (but we restart on end)
      recognition.interimResults = false; // only final transcripts
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // --- handle results ---
      recognition.onresult = (event) => {
        // take the last result (in case of multiple)
        const last = event.results[event.results.length - 1];
        if (last.isFinal) {
          const transcript = last[0].transcript.trim().toLowerCase();
          processVoiceCommand(transcript);
        }
      };

      recognition.onend = () => {
        // if we are still supposed to be listening (not manually stopped) restart
        if (isListening && !forcedStop) {
          try {
            recognition.start();
          } catch (e) {
            console.warn('restart failed', e);
            isListening = false;
            updateMicUI();
          }
        } else {
          // normal stop (user clicked or forced)
          isListening = false;
          updateMicUI();
        }
      };

      recognition.onerror = (e) => {
        console.warn('recognition error:', e.error);
        if (e.error === 'not-allowed') {
          listeningStatus.innerHTML = '🔇 microphone blocked';
          isListening = false;
          updateMicUI();
        } else if (e.error === 'no-speech') {
          // ignore, just wait for next try
        } else {
          // other errors: stop and reset ui
          isListening = false;
          updateMicUI();
        }
      };
    }

    // --- process spoken command ---
    function processVoiceCommand(text) {
      let action = '🤔 unknown';
      let moved = false;

      // simple keyword matching
      if (text.includes('left') || text.includes('move left') || text.includes('go left')) {
        charX = Math.max(MIN_X, charX - MOVE_STEP);
        action = '⬅️ left';
        moved = true;
      }
      else if (text.includes('right') || text.includes('move right') || text.includes('go right')) {
        charX = Math.min(MAX_X, charX + MOVE_STEP);
        action = '➡️ right';
        moved = true;
      }
      else if (text.includes('jump') || text.includes('jump now') || text.includes('leap')) {
        if (isOnGround) {
          vy = JUMP_FORCE;
          isOnGround = false;
          action = '🦘 jump';
          moved = true;
        } else {
          action = '⏫ jump (already air)';
        }
      }
      else if (text.includes('stop') || text.includes('halt') || text.includes('stay')) {
        // does nothing, just logs
        action = '✋ stop';
        moved = true;
      }
      else {
        action = `❓ "${text}"`;
      }

      lastCommand = action;
      actionLog.innerText = `🗣️ ${action}`;
      if (moved) {
        // give a little feedback flash
        micBtn.style.backgroundColor = '#b8e0b8';
        setTimeout(() => { micBtn.style.backgroundColor = ''; }, 120);
      }
    }

    // --- UI update for microphone button & status ---
    function updateMicUI() {
      if (isListening) {
        micBtn.classList.add('active');
        listeningStatus.innerHTML = '🎙️ listening ...';
      } else {
        micBtn.classList.remove('active');
        if (recognition && !SpeechRecognition) {
          listeningStatus.innerHTML = '⚪ idle';
        } else if (recognition === null) {
          listeningStatus.innerHTML = '⛔ unsupported';
        } else {
          listeningStatus.innerHTML = '⚪ idle';
        }
      }
    }

    // toggle listening
    function toggleListening() {
      if (!recognition) {
        alert('Speech recognition not available. Try Chrome / Edge.');
        return;
      }

      if (isListening) {
        // turn off
        forcedStop = false;
        isListening = false;
        try {
          recognition.stop();
        } catch (e) {}
      } else {
        // turn on
        forcedStop = false;
        isListening = true;
        try {
          recognition.start();
          actionLog.innerText = '🎤 microphone active ...';
        } catch (e) {
          console.warn('start failed', e);
          isListening = false;
          if (e.message.includes('already started')) {
            // try to restart
            try { recognition.stop(); } catch (ex) {}
            setTimeout(() => {
              if (isListening) {
                try { recognition.start(); } catch (ex) {}
              }
            }, 100);
          }
        }
      }
      updateMicUI();
    }

    // force stop (cleanup)
    function forceStopListening() {
      forcedStop = true;
      if (recognition && isListening) {
        try {
          recognition.stop();
        } catch (e) {}
      }
      isListening = false;
      updateMicUI();
      actionLog.innerText = '🛑 voice stopped (manual)';
    }

    // --- drawing ---
    function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, '#a6d9fb');
      sky.addColorStop(0.7, '#e0f0fa');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, canvas.width, GROUND_Y - 5);

      // ground
      ctx.fillStyle = '#4f7942';
      ctx.fillRect(0, GROUND_Y, canvas.width, 60);
      // grass detail
      ctx.fillStyle = '#6f9e5f';
      ctx.fillRect(0, GROUND_Y, canvas.width, 8);
      ctx.fillStyle = '#9fbb73';
      for (let i = 0; i < 12; i++) {
        ctx.fillRect(i * 60 + 10, GROUND_Y - 2, 30, 6);
      }

      // platform markings
      ctx.shadowColor = '#00000040';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      // character (simple round boy)
      ctx.shadowColor = '#1e2e24';
      ctx.shadowBlur = 12;

      // body
      ctx.fillStyle = '#fdd998';
      ctx.beginPath();
      ctx.roundRect(charX, charY, CHAR_WIDTH, CHAR_HEIGHT, 12);
      ctx.fill();

      // belt / detail
      ctx.fillStyle = '#b86f2c';
      ctx.beginPath();
      ctx.roundRect(charX + 4, charY + 22, 24, 8, 6);
      ctx.fill();

      // eyes
      ctx.fillStyle = '#2f1e0e';
      ctx.beginPath();
      ctx.arc(charX + 8, charY + 12, 4, 0, Math.PI * 2);
      ctx.arc(charX + 24, charY + 12, 4, 0, Math.PI * 2);
      ctx.fill();

      // eye highlights
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(charX + 6, charY + 10, 1.5, 0, Math.PI * 2);
      ctx.arc(charX + 22, charY + 10, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // mouth (depending on ground)
      ctx.beginPath();
      ctx.strokeStyle = '#592f0b';
      ctx.lineWidth = 2;
      if (isOnGround) {
        ctx.arc(charX + 16, charY + 26, 6, 0.1, Math.PI - 0.1);
      } else {
        ctx.arc(charX + 16, charY + 20, 5, 0, Math.PI);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }

    // helper canvas rounding
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
      return this;
    };

    // --- physics update ---
    function update() {
      if (!isOnGround) {
        vy += GRAVITY;
        charY += vy;
      }

      // ground collision
      if (charY >= GROUND_Y - CHAR_HEIGHT) {
        charY = GROUND_Y - CHAR_HEIGHT;
        vy = 0;
        isOnGround = true;
      } else {
        isOnGround = false;
      }

      // clamp horizontal (redundant but safe)
      charX = Math.max(MIN_X, Math.min(MAX_X, charX));
    }

    // animation loop
    function gameLoop() {
      update();
      drawScene();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();

    // --- event listeners ---
    micBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleListening();
    });

    document.getElementById('forceStopBtn').addEventListener('click', () => {
      forceStopListening();
    });

    // optional: click on canvas to stop listening (usability)
    canvas.addEventListener('click', () => {
      if (isListening) {
        forceStopListening();
        actionLog.innerText = '🖐️ listening stopped (canvas tap)';
      } else {
        // start listening on canvas tap? better toggle via mic, but we can hint
        actionLog.innerText = '🎤 use mic button';
      }
    });

    // clean up on page hide
    window.addEventListener('beforeunload', () => {
      if (recognition && isListening) {
        try { recognition.stop(); } catch (e) {}
      }
    });

    // initial draw
    drawScene();
    updateMicUI();

    // add a fallback for manual command (if voice not works, but we don't need)
    // just show that it's ready
    actionLog.innerText = 'say left / right / jump / stop';
  })();