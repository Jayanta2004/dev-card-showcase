        (function() {
            // ---- TASTE STORAGE ----
            const STORAGE_KEY = 'tastetrack_entries';

            // ---- sample data + state ----
            let entries = [];

            // rating state (new entry)
            let currentRating = 3;  // 1-5 stars

            // filter state
            let activeFilter = 'all';   // all, sweet, savory, spicy, other

            // ---- DOM elements ----
            const foodInput = document.getElementById('foodNameInput');
            const categoryInput = document.getElementById('categoryInput');
            const notesInput = document.getElementById('notesInput');
            const starContainer = document.getElementById('starRatingContainer');
            const saveBtn = document.getElementById('saveTasteBtn');
            const resetBtn = document.getElementById('resetFieldsBtn');
            const tasteGrid = document.getElementById('tasteGrid');
            const flavorCountSpan = document.getElementById('flavorCount');
            const avgRatingSpan = document.getElementById('avgRatingDisplay');
            const filterChips = document.querySelectorAll('.filter-chip');

            // ---- helper: render stars (editable) ----
            function renderStarSelector() {
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    const filled = i <= currentRating ? '★' : '☆';
                    starsHtml += `<span class="star" data-value="${i}">${filled}</span>`;
                }
                starContainer.innerHTML = starsHtml;

                // attach click listeners
                document.querySelectorAll('#starRatingContainer .star').forEach(star => {
                    star.addEventListener('click', (e) => {
                        const val = parseInt(e.target.getAttribute('data-value'), 10);
                        if (val) {
                            currentRating = val;
                            renderStarSelector();
                        }
                    });
                });
            }

            // ---- load entries from localStorage ----
            function loadEntries() {
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        entries = JSON.parse(stored);
                        if (!Array.isArray(entries)) entries = [];
                    } else {
                        // default demo data for tastiness
                        entries = [
                            { id: '1', name: 'Tiramisu', category: 'sweet', rating: 5, notes: 'Creamy, coffee perfection', date: '2026-02-20', displayDate: 'Feb 20' },
                            { id: '2', name: 'Spicy Ramen', category: 'spicy', rating: 4, notes: 'Rich broth, level 3 heat', date: '2026-02-19', displayDate: 'Feb 19' },
                            { id: '3', name: 'Margherita Pizza', category: 'savory', rating: 5, notes: 'Fresh basil, perfect crust', date: '2026-02-18', displayDate: 'Feb 18' },
                            { id: '4', name: 'Mango Sticky Rice', category: 'sweet', rating: 5, notes: 'Sweet coconut, ripe mango', date: '2026-02-17', displayDate: 'Feb 17' },
                        ];
                    }
                } catch (e) {
                    entries = [];
                }
                // sort newest first (by date string)
                entries.sort((a, b) => (a.date < b.date ? 1 : -1));
            }

            // save entries
            function saveEntries() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            }

            // generate simple id
            function generateId() {
                return Date.now() + '-' + Math.random().toString(36).substring(2, 8);
            }

            // ---- filter + render grid ----
            function renderGrid() {
                const lowerFilter = activeFilter.toLowerCase();

                const filtered = entries.filter(entry => {
                    if (activeFilter === 'all') return true;
                    const cat = (entry.category || 'other').toLowerCase();
                    if (activeFilter === 'sweet' && cat.includes('sweet')) return true;
                    if (activeFilter === 'savory' && (cat.includes('savory') || cat.includes('savory'))) return true;
                    if (activeFilter === 'spicy' && cat.includes('spicy')) return true;
                    if (activeFilter === 'other' && !cat.includes('sweet') && !cat.includes('savory') && !cat.includes('spicy')) return true;
                    return false;
                });

                // update count + avg
                flavorCountSpan.textContent = filtered.length + (filtered.length === 1 ? ' taste' : ' tastes');

                if (filtered.length === 0) {
                    tasteGrid.innerHTML = `<div class="empty-state">👅 no entries · add your first flavor</div>`;
                    avgRatingSpan.textContent = '★ avg —';
                    return;
                }

                // compute average rating
                const sum = filtered.reduce((acc, e) => acc + (e.rating || 0), 0);
                const avg = (sum / filtered.length).toFixed(1);
                avgRatingSpan.textContent = `★ avg ${avg}`;

                // build cards
                let html = '';
                filtered.forEach(entry => {
                    const starFull = '★'.repeat(entry.rating) + '☆'.repeat(5 - entry.rating);
                    const cat = entry.category || 'other';
                    html += `
                        <div class="taste-card" data-id="${entry.id}">
                            <div class="card-header">
                                <span class="item-name">${escapeHtml(entry.name)}</span>
                                <span class="item-category">${escapeHtml(cat)}</span>
                            </div>
                            <div class="item-rating" title="${entry.rating} stars">${starFull}</div>
                            <div class="item-notes">${entry.notes ? escapeHtml(entry.notes) : '—'}</div>
                            <div class="item-date">
                                <span>📅 ${entry.displayDate || entry.date}</span>
                                <button class="delete-btn" data-id="${entry.id}">delete</button>
                            </div>
                        </div>
                    `;
                });
                tasteGrid.innerHTML = html;

                // attach delete events
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = btn.getAttribute('data-id');
                        deleteEntryById(id);
                    });
                });
            }

            // simple escape
            function escapeHtml(unsafe) {
                if (!unsafe) return '';
                return unsafe.replace(/[&<>"]/g, function(m) {
                    if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; if (m === '"') return '&quot;';
                    return m;
                });
            }

            // delete entry
            function deleteEntryById(id) {
                entries = entries.filter(e => e.id !== id);
                saveEntries();
                renderGrid();
            }

            // ---- save new entry ----
            function addNewEntry() {
                const name = foodInput.value.trim();
                const category = categoryInput.value.trim() || 'other';
                const notes = notesInput.value.trim();
                if (!name) {
                    alert('Please enter a food/dish name.');
                    return;
                }

                const today = new Date();
                const dateISO = today.toISOString().split('T')[0];
                const displayDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const newEntry = {
                    id: generateId(),
                    name: name,
                    category: category,
                    rating: currentRating,
                    notes: notes,
                    date: dateISO,
                    displayDate: displayDate,
                };

                entries.push(newEntry);
                entries.sort((a, b) => (a.date < b.date ? 1 : -1));
                saveEntries();
                renderGrid();

                // clear fields but keep rating at default 3? reset to default 3 but keep name etc clear
                foodInput.value = '';
                categoryInput.value = '';
                notesInput.value = '';
                currentRating = 3;
                renderStarSelector();
            }

            // reset fields (without saving)
            function resetFields() {
                foodInput.value = '';
                categoryInput.value = '';
                notesInput.value = '';
                currentRating = 3;
                renderStarSelector();
            }

            // ---- filter change ----
            function setActiveFilter(filter) {
                activeFilter = filter;
                filterChips.forEach(chip => {
                    const chipFilter = chip.getAttribute('data-filter');
                    if (chipFilter === filter) chip.classList.add('active');
                    else chip.classList.remove('active');
                });
                renderGrid();
            }

            // ---- init ----
            function init() {
                loadEntries();
                renderStarSelector();
                renderGrid();

                // event listeners
                saveBtn.addEventListener('click', addNewEntry);
                resetBtn.addEventListener('click', resetFields);

                filterChips.forEach(chip => {
                    chip.addEventListener('click', () => {
                        const filter = chip.getAttribute('data-filter');
                        setActiveFilter(filter);
                    });
                });

                // storage sync (multi-tab)
                window.addEventListener('storage', (e) => {
                    if (e.key === STORAGE_KEY) {
                        loadEntries();
                        renderGrid();
                    }
                });
            }

            init();
        })();