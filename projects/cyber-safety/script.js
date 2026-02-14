    (function() {
        // ---------- RANDOM SAFETY TIP ROTATOR ----------
        const tips = [
            "Think before you click — if it looks suspicious, it probably is.",
            "Use a password manager. You only need to remember one master password.",
            "Turn on automatic updates: they often include critical security fixes.",
            "Check for 'https://' and the padlock icon before entering personal data.",
            "Never reuse passwords across banking and social media.",
            "If a deal is too good to be true, it's a scam. Trust your gut.",
            "Lock your screen every time you step away from your device.",
            "Backup important files regularly — ransomware is real.",
            "Be kind online, but share personal info like it's public (because it might be).",
            "Disable Bluetooth and Wi‑Fi when not needed — reduces attack surface.",
            "Don't charge your phone on public USB ports (use data blocker or power bank).",
            "Voice calls can be spoofed — hang up and call back on a trusted number."
        ];
        const tipSpan = document.getElementById('tipText');
        const tipBtn = document.getElementById('newTipBtn');

        function setRandomTip() {
            const randomIndex = Math.floor(Math.random() * tips.length);
            tipSpan.textContent = tips[randomIndex];
        }
        tipBtn.addEventListener('click', setRandomTip);

        // ---------- CHECKLIST / SELF ASSESSMENT with localStorage ----------
        const checkboxes = document.querySelectorAll('.rule-check');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const resetBtn = document.getElementById('resetScoreBtn');

        // Load saved checkbox states
        function loadChecklist() {
            let count = 0;
            checkboxes.forEach((cb, index) => {
                const saved = localStorage.getItem(`cyberRule_${index}`);
                if (saved === 'true') {
                    cb.checked = true;
                    count++;
                } else {
                    cb.checked = false; // explicit
                }
            });
            scoreDisplay.textContent = `🛡️ ${count} / 8`;
        }

        // Update count + store on any change
        function updateScoreAndStore() {
            let count = 0;
            checkboxes.forEach((cb, index) => {
                localStorage.setItem(`cyberRule_${index}`, cb.checked);
                if (cb.checked) count++;
            });
            scoreDisplay.textContent = `🛡️ ${count} / 8`;
        }

        // initial load
        loadChecklist();

        // attach event listeners
        checkboxes.forEach(cb => {
            cb.addEventListener('change', updateScoreAndStore);
        });

        // reset button: uncheck all, remove storage, update
        resetBtn.addEventListener('click', () => {
            checkboxes.forEach((cb, index) => {
                cb.checked = false;
                localStorage.setItem(`cyberRule_${index}`, 'false');
            });
            scoreDisplay.textContent = '🛡️ 0 / 8';
        });

        // ---------- fake link just for demonstration ----------
        const fakeLink = document.getElementById('fakeLink');
        fakeLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert("⚠️ CYBER AWARENESS: you just hovered and clicked? Always inspect links before clicking! (This is a demo.)");
        });

        // optional: set a random tip on first load
        setRandomTip();
    })();