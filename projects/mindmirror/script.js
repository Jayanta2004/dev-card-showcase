        (function() {
            // ----------------------------------- data & state ------------------------------------
            const STORAGE_KEY = 'mindmirror_journal_entries';

            // today's date (fixed for the session, but updates if day changes)
            const today = new Date();
            const todayISO = today.toISOString().split('T')[0];  // YYYY-MM-DD
            const todayDisplay = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const weekdayName = today.toLocaleDateString('en-US', { weekday: 'long' });

            // UI elements
            const weekdaySpan = document.getElementById('weekday');
            const fullDateSpan = document.getElementById('fullDate');
            const promptSpan = document.getElementById('dailyPrompt');
            const journalInput = document.getElementById('journalInput');
            const saveBtn = document.getElementById('saveEntryBtn');
            const regenerateBtn = document.getElementById('regeneratePromptBtn');
            const historyContainer = document.getElementById('historyList');
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');

            // ---------- prompts pool (reflection starters) ----------
            const promptPool = [
                "What emotion stayed with you the longest today?",
                "One small thing I appreciated today...",
                "What could I let go of right now?",
                "Today I showed myself kindness by...",
                "A moment I want to remember from today.",
                "What did I learn about myself?",
                "If my mind were a mirror, what would it reflect?",
                "A conversation that touched me today.",
                "What tension can I soften within me?",
                "Today I'm proud of...",
                "Something I need to forgive myself for.",
                "What energy do I want to invite tomorrow?",
                "I felt most alive when...",
                "A word that sums up today:",
                "The quietest thought I had today...",
                "What surprised me today?"
            ];

            // get random prompt (consistent within session unless regenerated)
            function getRandomPrompt() {
                return promptPool[Math.floor(Math.random() * promptPool.length)];
            }

            // initial prompt (or restore from session storage?)
            let currentPrompt = getRandomPrompt();
            promptSpan.textContent = currentPrompt;

            // regenerate prompt (user clicks)
            regenerateBtn.addEventListener('click', () => {
                currentPrompt = getRandomPrompt();
                promptSpan.textContent = currentPrompt;
            });

            // ---------- display today's date ----------
            weekdaySpan.textContent = weekdayName;
            fullDateSpan.textContent = todayDisplay;

            // ---------- load entries from localStorage ----------
            let entries = [];   // array of { dateISO, displayDate, prompt, text }

            function loadEntries() {
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        entries = JSON.parse(stored);
                        // basic validation: ensure it's an array
                        if (!Array.isArray(entries)) entries = [];
                    } else {
                        entries = [];
                    }
                } catch (e) {
                    console.warn("failed to load entries");
                    entries = [];
                }
                // always sort: newest first (by dateISO then time added? we keep as stored but we can sort)
                entries.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
            }

            function saveEntries() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            }

            // render history panel
            function renderHistory() {
                if (!historyContainer) return;

                if (entries.length === 0) {
                    historyContainer.innerHTML = `<div class="empty-history">Your mirror will show past entries ✨</div>`;
                    return;
                }

                // show latest 6 entries (newest first)
                const latest = entries.slice(0, 6);
                let htmlStr = '';
                latest.forEach(entry => {
                    const preview = entry.text.length > 40 ? entry.text.substring(0, 40) + '…' : entry.text;
                    // display friendly date: if today, show "Today", else show short date
                    let displayDate = entry.displayDate || entry.dateISO;
                    if (entry.dateISO === todayISO) displayDate = 'Today';
                    else {
                        // try to format compact
                        const d = new Date(entry.dateISO + 'T12:00:00'); // avoid timezone issues
                        displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }

                    htmlStr += `
                        <div class="history-item">
                            <span class="entry-preview" title="${entry.text.replace(/"/g, '&quot;')}">${preview}</span>
                            <span class="entry-date">${displayDate}</span>
                        </div>
                    `;
                });
                historyContainer.innerHTML = htmlStr;
            }

            // initial load
            loadEntries();
            renderHistory();

            // ---------- check if today's entry already exists (to prefill?) ----------
            const todaysEntry = entries.find(e => e.dateISO === todayISO);
            if (todaysEntry) {
                journalInput.value = todaysEntry.text;
                journalInput.placeholder = 'Reflection saved (you can update)';
            } else {
                journalInput.value = '';
                journalInput.placeholder = 'Write freely — this is your mirror...';
            }

            // ---------- save (create or update today's entry) ----------
            saveBtn.addEventListener('click', () => {
                const text = journalInput.value.trim();
                if (text === '') {
                    // optional gentle alert – but we allow empty? better to remind softly
                    if (!confirm('Your reflection is empty. Save anyway?')) {
                        return;
                    }
                }

                const newText = journalInput.value;  // keep as entered (even spaces if user wants)
                const todayEntryIndex = entries.findIndex(e => e.dateISO === todayISO);

                const entryObject = {
                    dateISO: todayISO,
                    displayDate: todayDisplay, // full date string
                    prompt: currentPrompt,
                    text: newText,
                };

                if (todayEntryIndex >= 0) {
                    // update existing entry
                    entries[todayEntryIndex] = entryObject;
                } else {
                    // add new
                    entries.push(entryObject);
                }

                // sort and save
                entries.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
                saveEntries();
                renderHistory();
                journalInput.placeholder = 'Reflection saved ✓';
                // subtle feedback
                saveBtn.style.background = '#e5f0e8';
                setTimeout(() => saveBtn.style.background = '', 180);
            });

            // ---------- clear all history (with confirmation) ----------
            clearHistoryBtn.addEventListener('click', () => {
                if (entries.length === 0) return;
                const ok = confirm('Remove all past reflections? This cannot be undone.');
                if (ok) {
                    entries = [];
                    saveEntries();
                    renderHistory();
                    // if today's entry was present, clear field only if user wants? We respect blank state.
                    journalInput.value = '';
                    journalInput.placeholder = 'Write freely — this is your mirror...';
                }
            });

            // ---------- auto-save / optional? we don't auto-save, only manual.
            // but we could sync if user closes? not needed. keep manual.

            // ---------- if user wants to start fresh with today's entry, they can just type.
            // no extra.

            // Optional: update history if another tab changes localStorage? we can ignore.

            // extra: listen for localStorage changes (if same tab updates, already fine)
            window.addEventListener('storage', (e) => {
                if (e.key === STORAGE_KEY) {
                    // another tab changed storage — reload and rerender
                    loadEntries();
                    renderHistory();
                    // also check today's entry again to update textarea if needed
                    const updatedToday = entries.find(e => e.dateISO === todayISO);
                    if (updatedToday) {
                        journalInput.value = updatedToday.text;
                    } else {
                        // if cleared, maybe clear if empty but keep user input? we choose not to clear unsaved.
                        if (!journalInput.value) journalInput.value = '';
                    }
                }
            });

            // optional: set min height for text
        })();