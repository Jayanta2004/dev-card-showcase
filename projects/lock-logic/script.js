        (function() {
            // --- configuration ---
            const PIN_COUNT = 5;          // 5-pin lock
            const MAX_CUT = 9;             // cuts 0..9 (some lock sims use 0-9)
            const PIN_HEIGHT = 90;          // total chamber height in px
            const SHEAR_POS = 33;            // fixed shear line from bottom (px). Must be consistent: driver + key pin = total height - shear? Actually we treat chamber: bottom is 0, top is 90. shear at 33px means bottom part (key pin) should be 33px when cut correct.

            // we'll compute actual pin lengths: keyPin height = CUT * factor? we set bottom part = base + cut * step
            const BASE_PIN = 12;   // minimum pin height (cut 0)
            const STEP = 4;         // each cut increases height by 4px  (max cut 9 -> 12+36=48 <= 57? need to keep under shear line margin)
            // driver fills rest: driverHeight = totalHeight - keyPinHeight (but we want shear at 33 from bottom: keyPin should be exactly 33 when correct cut?)
            // Let's define: correct cut for a given pin: keyPinHeight = 15 + cut*3; shear fixed at 33. then driver height = 90 - keyPinHeight. at correct cut, keyPinHeight =33? 33 = 15+cut*3 => cut=6. That means reference cut 6 aligns with shear. That's okay – different locks have different "true" heights. We want visual shear line fixed.
            // to make it intuitive: We want when key cut matches the preset secret cut, the gap between key pin and driver aligns with shear. Let's define secret cuts (random on reset). then keyPinHeight = BASE + cut*STEP. And we set shearLine at HEIGHT where correct cut makes keyPinHeight = correctShearHeight.
            // we'll define secretCuts array. for each pin, the "correct cut" gives keyPinHeight = BASE + correctCut*STEP = SHEAR_POS.
            // thus correctCut = (SHEAR_POS - BASE)/STEP . We need integer round. Let's set BASE = 15, STEP = 4, SHEAR_POS = 35 (makes cut 5 = 15+20=35). good.
            // then if cut is less, key pin too short, driver sinks; if cut more, key pin too tall pushes driver up.
            
            const BASE = 15;           
            const STEP_PX = 4;          
            const SHEAR_PX = 35;         // shear line at 35px from bottom

            // ----- global state -----
            let secretCuts = [];            // the correct cuts (0-9) for each pin (set randomly on reset)
            let currentKeyCuts = [2, 2, 2, 2, 2];   // default key cuts
            let keyInserted = false;
            let plugRotated = false;        // if plug rotated (lock unlocked)
            let lockRotated = false;        // alias for unlocked state

            // DOM elements
            const pinColumnsEl = document.getElementById('pinColumnsContainer');
            const keyBittingEl = document.getElementById('keyBittingContainer');
            const logMessageEl = document.getElementById('logMessage');
            const lockStateText = document.getElementById('lockStateText');
            const lockIcon = document.querySelector('#lockIcon i');
            const keyPresenceSpan = document.getElementById('keyPresence');

            const insertKeyBtn = document.getElementById('insertKeyBtn');
            const turnPlugBtn = document.getElementById('turnPlugBtn');
            const resetLockBtn = document.getElementById('resetLockBtn');
            const randomKeyBtn = document.getElementById('randomKeyBtn');
            const zeroKeyBtn = document.getElementById('zeroKeyBtn');

            // ---- helper: generate random secret (0..MAX_CUT)
            function randomCuts() {
                return Array.from({ length: PIN_COUNT }, () => Math.floor(Math.random() * (MAX_CUT + 1)));
            }

            // ---- reset lock (new secret, clears rotation, removes key)
            function resetLock() {
                secretCuts = randomCuts();
                // make sure currentKeyCuts are not undefined; keep same or set default to all 2?
                currentKeyCuts = [2, 2, 2, 2, 2];
                keyInserted = false;
                plugRotated = false;
                lockRotated = false;
                updateUI();
                logMessage('Lock reset · new secret cuts generated');
            }

            // ---- insert / remove key (toggle)
            function insertKey() {
                if (!keyInserted) {
                    keyInserted = true;
                    plugRotated = false;  // pulling key resets rotation
                    lockRotated = false;
                    logMessage('Key inserted. Try turning the plug.');
                } else {
                    // remove key
                    keyInserted = false;
                    plugRotated = false;
                    lockRotated = false;
                    logMessage('Key removed.');
                }
                updateUI();
            }

            // ---- attempt to turn plug
            function turnPlug() {
                if (!keyInserted) {
                    logMessage('No key inserted!', 'warn');
                    return;
                }
                if (plugRotated) {
                    logMessage('Plug already rotated (unlocked). Reset or remove key.', 'info');
                    return;
                }

                // check if key cuts match secret cuts (within tolerance? exactly equal)
                const match = currentKeyCuts.every((cut, idx) => cut === secretCuts[idx]);
                if (match) {
                    plugRotated = true;
                    lockRotated = true;
                    logMessage('✅ SUCCESS! Correct key – plug rotates, lock OPEN.');
                } else {
                    plugRotated = false;
                    lockRotated = false;
                    logMessage('❌ Wrong key – pins block the shear line. Lock remains LOCKED.');
                }
                updateUI();
            }

            // --- update pin graphics, key sliders, statuses
            function updateUI() {
                renderPinColumns();
                renderKeySliders();
                // update status text & icons
                if (lockRotated) {
                    lockStateText.textContent = 'UNLOCKED';
                    lockIcon.className = 'fas fa-unlock-alt unlocked-color';
                } else {
                    lockStateText.textContent = 'LOCKED';
                    lockIcon.className = 'fas fa-lock locked-color';
                }
                // key presence
                if (keyInserted) {
                    keyPresenceSpan.innerHTML = '<i class="fas fa-key"></i> key inserted';
                } else {
                    keyPresenceSpan.innerHTML = '<i class="fas fa-key"></i> no key';
                }

                // enable/disable turn button depending if keyInserted and not already rotated
                turnPlugBtn.disabled = !keyInserted || lockRotated;
            }

            // render pin columns based on secret, current cuts, keyInserted, rotation
            function renderPinColumns() {
                if (!pinColumnsEl) return;
                let html = '';
                for (let i = 0; i < PIN_COUNT; i++) {
                    const secret = secretCuts[i];
                    const keyCut = currentKeyCuts[i] !== undefined ? currentKeyCuts[i] : 0;

                    // key pin height (bottom part) depends on key if inserted, else default? In real lock, without key all pins are at rest (driver down, keypin up?). Actually no key: key pins rest on bottom? We simplify: with no key, key pins are at 0 height (resting on plug?) Actually typical: no key, key pins are flush with plug, drivers pushed down by springs. We'll represent: when key not inserted, keypin = 0 (or very small) , driver fills almost all.
                    let keyPinHeight, driverHeight;
                    if (!keyInserted) {
                        // no key: keypin minimal (0px) but we show small pad, driver almost full (down)
                        keyPinHeight = 4; // just a sliver
                        driverHeight = PIN_HEIGHT - keyPinHeight;
                    } else {
                        // key inserted: key pin height = BASE + keyCut * STEP_PX (capped to reasonable)
                        keyPinHeight = Math.min(PIN_HEIGHT - 8, BASE + keyCut * STEP_PX);
                        // ensure not negative
                        keyPinHeight = Math.max(4, keyPinHeight);
                        // driver height = rest
                        driverHeight = PIN_HEIGHT - keyPinHeight;
                    }

                    // also when plug rotated (unlocked) the pins are sheared and may not align? we simplify: just show same but we can add visual effect: shift.
                    // but we only care about shear line: draw shear line at SHEAR_PX.
                    const shearStyle = `top: ${SHEAR_PX}px;`;

                    // determine if key matches secret, only relevant if key inserted and not rotated? just visual hint.
                    const cutMatch = (keyInserted && (keyCut === secret));

                    html += `
                        <div class="pin-pair">
                            <div class="pin-label">Pin ${i+1}</div>
                            <div class="pin-chamber">
                                <div class="pin driver" style="height: ${driverHeight}px;"></div>
                                <div class="pin" style="height: ${keyPinHeight}px; background: ${cutMatch ? '#b5e6a7' : '#f0cb97'};"></div>
                                <div class="shear-line" style="${shearStyle}"></div>
                            </div>
                            <div style="font-size: 0.75rem; color: #d4e2ed; margin-top: 5px;">secret: ${secret}</div>
                        </div>
                    `;
                }
                pinColumnsEl.innerHTML = html;
            }

            // render sliders for key cuts
            function renderKeySliders() {
                if (!keyBittingEl) return;
                let html = '';
                for (let i = 0; i < PIN_COUNT; i++) {
                    const val = currentKeyCuts[i] !== undefined ? currentKeyCuts[i] : 0;
                    html += `
                        <div class="cut-slider">
                            <label>${i+1}</label>
                            <input type="range" min="0" max="${MAX_CUT}" value="${val}" step="1" data-index="${i}" class="key-slider">
                            <span class="cut-value" id="cutVal${i}">${val}</span>
                        </div>
                    `;
                }
                keyBittingEl.innerHTML = html;

                // attach listeners
                document.querySelectorAll('.key-slider').forEach(slider => {
                    slider.addEventListener('input', function(e) {
                        const idx = parseInt(this.dataset.index);
                        const newVal = parseInt(this.value);
                        currentKeyCuts[idx] = newVal;
                        // update displayed value next to slider
                        const span = document.getElementById(`cutVal${idx}`);
                        if (span) span.textContent = newVal;
                        // if key inserted, changing cuts affects pin heights dynamically (in reality maybe need to remove key first, but we allow live tweak for sim)
                        if (keyInserted) {
                            // changing cuts while key inserted will rearrange pins, lock should become locked unless correct.
                            plugRotated = false;
                            lockRotated = false;
                            logMessage('Key cuts changed — plug is locked again.');
                        }
                        renderPinColumns();  // update pins
                        updateUI(); // refresh turn button state etc
                    });
                });
            }

            // randomize key cuts (0-9 each)
            function randomizeKey() {
                currentKeyCuts = currentKeyCuts.map(() => Math.floor(Math.random() * (MAX_CUT + 1)));
                if (keyInserted) {
                    plugRotated = false;
                    lockRotated = false;
                }
                updateUI();
                logMessage('Random key cuts generated.');
            }

            // zero out cuts
            function zeroKey() {
                currentKeyCuts = currentKeyCuts.map(() => 0);
                if (keyInserted) {
                    plugRotated = false;
                    lockRotated = false;
                }
                updateUI();
                logMessage('All cuts set to 0 (lowest).');
            }

            // log helper
            function logMessage(msg, type = 'info') {
                if (logMessageEl) {
                    logMessageEl.innerHTML = `⚡ ${msg}`;
                }
            }

            // ----- initial setup and event binding ----
            function init() {
                // random secret on first load
                secretCuts = randomCuts();
                currentKeyCuts = [2,2,2,2,2];
                keyInserted = false;
                plugRotated = false;
                lockRotated = false;

                updateUI();

                // buttons
                insertKeyBtn.addEventListener('click', () => { insertKey(); });
                turnPlugBtn.addEventListener('click', () => { turnPlug(); });
                resetLockBtn.addEventListener('click', () => { resetLock(); });
                randomKeyBtn.addEventListener('click', () => { randomizeKey(); });
                zeroKeyBtn.addEventListener('click', () => { zeroKey(); });

                logMessage('🔧 LockLogic ready. Insert a key and turn.');
            }

            init();
        })();