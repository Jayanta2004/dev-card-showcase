    (function() {
        // ---------- set today's date ----------
        const dateEl = document.getElementById('currentDate');
        const today = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        dateEl.textContent = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // ---------- quote rotator ----------
        const quotes = [
            "“almost everything will work again if you unplug for a few minutes, including you.”",
            "“rest is not a reward, it's a requirement.”",
            "“self-care is how you take your power back.”",
            "“your mind will answer most questions if you learn to relax.”",
            "“an empty lantern provides no light. rest.”",
            "“slow down, you're doing great.”",
            "“healing is an inside job.”",
            "“sometimes the most productive thing you can do is rest.”"
        ];
        const quoteDisplay = document.getElementById('quoteDisplay');
        document.getElementById('newQuoteBtn').addEventListener('click', () => {
            let randomIdx = Math.floor(Math.random() * quotes.length);
            quoteDisplay.textContent = quotes[randomIdx];
        });

        // ---------- habits (checkboxes kept via browser storage?) we don't store but they stay until refresh; we may load? fine as demo. but we can keep nothing. However we want water to persist, etc.
        // we will load/save to localStorage for water, mood, gratitudes, journal. 

        // ---------- water tracker ----------
        let glassCount = 0;
        const glassSpan = document.getElementById('glassCount');
        const addBtn = document.getElementById('addGlass');
        const removeBtn = document.getElementById('removeGlass');
        const resetWater = document.getElementById('resetWater');

        function updateWaterDisplay() {
            glassSpan.textContent = glassCount;
        }

        // Load water
        const savedGlasses = localStorage.getItem('selfCare_water');
        if (savedGlasses !== null) {
            glassCount = parseInt(savedGlasses, 10) || 0;
        } else {
            glassCount = 0;
        }
        updateWaterDisplay();

        addBtn.addEventListener('click', () => {
            glassCount++;
            updateWaterDisplay();
            localStorage.setItem('selfCare_water', glassCount);
        });
        removeBtn.addEventListener('click', () => {
            if (glassCount > 0) glassCount--;
            updateWaterDisplay();
            localStorage.setItem('selfCare_water', glassCount);
        });
        resetWater.addEventListener('click', () => {
            glassCount = 0;
            updateWaterDisplay();
            localStorage.setItem('selfCare_water', glassCount);
        });

        // ---------- mood persistence ----------
        const moodEmojis = document.querySelectorAll('.mood-emoji');
        const moodNote = document.getElementById('moodNote');

        // Load mood
        const savedMood = localStorage.getItem('selfCare_mood');
        if (savedMood) {
            document.querySelectorAll('.mood-emoji').forEach(btn => {
                if (btn.dataset.mood === savedMood) {
                    btn.classList.add('selected');
                } else {
                    btn.classList.remove('selected');
                }
            });
        } else {
            // default none
        }

        const savedNote = localStorage.getItem('selfCare_moodNote');
        if (savedNote) moodNote.value = savedNote;

        moodEmojis.forEach(btn => {
            btn.addEventListener('click', (e) => {
                moodEmojis.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                const moodValue = btn.dataset.mood;
                localStorage.setItem('selfCare_mood', moodValue);
            });
        });

        moodNote.addEventListener('input', () => {
            localStorage.setItem('selfCare_moodNote', moodNote.value);
        });

        // ---------- gratitude fields ----------
        const grat1 = document.getElementById('grat1');
        const grat2 = document.getElementById('grat2');
        const grat3 = document.getElementById('grat3');
        const gratMsg = document.getElementById('gratitudeSavedMsg');

        // Load gratitudes
        if (localStorage.getItem('selfCare_grat1')) grat1.value = localStorage.getItem('selfCare_grat1');
        if (localStorage.getItem('selfCare_grat2')) grat2.value = localStorage.getItem('selfCare_grat2');
        if (localStorage.getItem('selfCare_grat3')) grat3.value = localStorage.getItem('selfCare_grat3');

        document.getElementById('saveGratitude').addEventListener('click', () => {
            localStorage.setItem('selfCare_grat1', grat1.value);
            localStorage.setItem('selfCare_grat2', grat2.value);
            localStorage.setItem('selfCare_grat3', grat3.value);
            gratMsg.textContent = '✨ saved to local notes';
            setTimeout(() => gratMsg.textContent = '', 1800);
        });

        // ---------- journal ----------
        const journalInput = document.getElementById('journalInput');
        const journalTimeSpan = document.getElementById('journalTime');
        const saveJournalBtn = document.getElementById('saveJournal');

        // Load journal
        const savedJournal = localStorage.getItem('selfCare_journal');
        if (savedJournal) journalInput.value = savedJournal;
        const savedJournalTimestamp = localStorage.getItem('selfCare_journalTime');
        if (savedJournalTimestamp) {
            journalTimeSpan.textContent = '📌 last saved: ' + savedJournalTimestamp;
        }

        saveJournalBtn.addEventListener('click', () => {
            const journalText = journalInput.value;
            localStorage.setItem('selfCare_journal', journalText);
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const fullStamp = `${dateStr} at ${timeStr}`;
            localStorage.setItem('selfCare_journalTime', fullStamp);
            journalTimeSpan.textContent = '📌 last saved: ' + fullStamp;
        });

        // optional: keep checkboxes state? maybe not to overload, but we can save each habit checkbox state.
        const habitCheckboxes = document.querySelectorAll('.habit-check');
        habitCheckboxes.forEach((cb, index) => {
            const key = `selfCare_habit_${index}`;
            const saved = localStorage.getItem(key);
            if (saved === 'true') cb.checked = true;
            cb.addEventListener('change', () => {
                localStorage.setItem(key, cb.checked);
            });
        });

        // extra: refresh quote on load? already static.
        // date badge already set.
    })();