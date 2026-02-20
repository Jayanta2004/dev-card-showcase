        (function() {
            // ---------- game state ----------
            let resource = 150.0;                // current crystals
            let totalGenerated = 150.0;           // all-time earn (for stats)
            let clickPower = 1.0;                 // base per click
            let prestigeChips = 0;                 // prestige currency
            let prestigeMultiplier = 1.0;           // from chips (each chip +0.2)
            let totalClicks = 0;

            // upgrades array
            let upgrades = [
                { id: 'pickaxe', name: '⛏️ auto-pick', desc: '+0.8/s', basePrice: 30, price: 30, quantity: 0, income: 0.8, type: 'income' },
                { id: 'drill', name: '🔩 drill', desc: '+3/s', basePrice: 120, price: 120, quantity: 0, income: 3.0, type: 'income' },
                { id: 'mine', name: '🏭 deep mine', desc: '+12/s', basePrice: 550, price: 550, quantity: 0, income: 12, type: 'income' },
                { id: 'clickUp', name: '🔨 power click', desc: '+1 per click', basePrice: 200, price: 200, quantity: 0, income: 1.0, type: 'click' }
            ];

            // DOM elements
            const resourceSpan = document.getElementById('resourceAmount');
            const persecSpan = document.getElementById('persecDisplay');
            const prestigeChipsSpan = document.getElementById('prestigeChips');
            const prestigeBonusSpan = document.getElementById('prestigeBonus');
            const totalClicksSpan = document.getElementById('totalClicks');
            const totalGeneratedSpan = document.getElementById('totalGenerated');
            const prestigeLevelSpan = document.getElementById('prestigeLevel');
            const playTimeSpan = document.getElementById('playTime');

            const clickButton = document.getElementById('clickButton');
            const prestigeBtn = document.getElementById('prestigeBtn');
            const upgradeDiv = document.getElementById('upgradeList');

            // time tracking
            let gameSeconds = 0;
            let lastUpdate = performance.now();

            // helper: format time MM:SS
            function formatTime(sec) {
                let m = Math.floor(sec / 60);
                let s = Math.floor(sec % 60);
                return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }

            // recalc multiplier from prestige chips (each gives +0.2)
            function updatePrestigeMultiplier() {
                prestigeMultiplier = 1 + prestigeChips * 0.2;
                prestigeBonusSpan.innerText = prestigeMultiplier.toFixed(1);
                prestigeLevelSpan.innerText = prestigeChips;
            }

            // total income per second (sum of income upgrades * multiplier)
            function getIncomePerSecond() {
                let base = 0;
                upgrades.forEach(u => {
                    if (u.type === 'income') base += u.quantity * u.income;
                });
                return base * prestigeMultiplier;
            }

            // total click power
            function getClickPower() {
                let bonus = 0;
                upgrades.forEach(u => {
                    if (u.type === 'click') bonus += u.quantity * u.income;
                });
                return (clickPower + bonus) * prestigeMultiplier;
            }

            // render upgrades list + update prices
            function renderUpgrades() {
                let html = '';
                upgrades.forEach((up, idx) => {
                    let canAfford = resource >= up.price;
                    html += `<div class="upgrade-item">
                        <div class="upgrade-info">
                            <span class="upgrade-name">${up.name}</span>
                            <span class="upgrade-desc">${up.desc} · owned: ${up.quantity}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 20px;">
                            <span class="upgrade-cost">💎${Math.round(up.price)}</span>
                            <button class="buy-btn" data-idx="${idx}" ${!canAfford ? 'disabled' : ''}>buy</button>
                        </div>
                    </div>`;
                });
                upgradeDiv.innerHTML = html;
            }

            // buy upgrade
            function buyUpgrade(index) {
                let up = upgrades[index];
                if (resource < up.price) return;
                resource -= up.price;
                up.quantity++;

                // increase price (standard idle curve)
                up.price = Math.floor(up.basePrice * Math.pow(1.5, up.quantity));

                // resource might go negative due to rounding, adjust
                if (resource < 0) resource = 0;
                updateUI();
            }

            // prestige: reset everything but increase chips based on totalGenerated
            function performPrestige() {
                if (totalGenerated < 500) {
                    alert('need at least 500 total crystals to prestige');
                    return;
                }
                // new chips = floor(sqrt(totalGenerated/20)) or something simple
                let gain = Math.floor(Math.sqrt(totalGenerated / 25));
                if (gain < 1) gain = 1;
                prestigeChips += gain;

                // reset everything
                resource = 50;
                totalGenerated = 50;
                totalClicks = 0;
                upgrades.forEach(u => {
                    u.quantity = 0;
                    u.price = u.basePrice;
                });

                updatePrestigeMultiplier();
                updateUI();
            }

            // update all displays
            function updateUI() {
                resourceSpan.innerText = Math.floor(resource * 10) / 10;
                persecSpan.innerText = `⚡ +${getIncomePerSecond().toFixed(1)}/s`;
                prestigeChipsSpan.innerText = prestigeChips;
                totalClicksSpan.innerText = totalClicks;
                totalGeneratedSpan.innerText = Math.floor(totalGenerated);
                updatePrestigeMultiplier();   // refresh multiplier display

                renderUpgrades(); // also sets button states
            }

            // game tick (called every ~100ms)
            function tick(deltaSec) {
                if (deltaSec > 1) deltaSec = 0.5; // avoid huge jumps after tab inactive

                let income = getIncomePerSecond() * deltaSec;
                resource += income;
                totalGenerated += income;

                if (resource < 0) resource = 0;
                updateUI();
            }

            // animation / time loop
            function frame(now) {
                let delta = (now - lastUpdate) / 1000; // seconds
                if (delta > 0.05) { // cap at 50ms granularity
                    tick(Math.min(delta, 0.5));
                    gameSeconds += delta;
                    playTimeSpan.innerText = formatTime(gameSeconds);
                    lastUpdate = now;
                }
                requestAnimationFrame(frame);
            }

            // click handler
            clickButton.addEventListener('click', () => {
                let gain = getClickPower();
                resource += gain;
                totalGenerated += gain;
                totalClicks++;
                updateUI();
            });

            // upgrade event delegation
            upgradeDiv.addEventListener('click', (e) => {
                let btn = e.target.closest('.buy-btn');
                if (!btn) return;
                let idx = btn.dataset.idx;
                if (idx !== undefined) buyUpgrade(parseInt(idx));
            });

            // prestige button
            prestigeBtn.addEventListener('click', performPrestige);

            // load dummy initial values and start
            function initGame() {
                // set starting prestige 0, but maybe some upgrades for demo
                upgrades[0].quantity = 1;  // start with one auto-pick
                upgrades[0].price = Math.floor(upgrades[0].basePrice * 1.5); // reflect owned
                resource = 150;
                totalGenerated = 150;
                totalClicks = 0;
                gameSeconds = 0;
                updatePrestigeMultiplier();
                updateUI();
                lastUpdate = performance.now();
                requestAnimationFrame(frame);
            }

            initGame();

            // optional: save/load local storage? not needed for demo, but we can add simple auto-save later
            // Add visibility change to avoid huge delta
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    lastUpdate = performance.now(); // reset timer when visible again
                }
            });

        })();