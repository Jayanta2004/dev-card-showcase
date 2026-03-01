        (function() {
            // ----- data model -----
            let ideas = [];               // { id, text, category, timestamp }
            let activeFilter = 'all';      // 'all' or category name

            // ----- DOM elements -----
            const ideaInput = document.getElementById('ideaInput');
            const categorySelect = document.getElementById('categorySelect');
            const addBtn = document.getElementById('addIdeaBtn');
            const ideasGrid = document.getElementById('ideasGrid');
            const totalSpan = document.getElementById('totalIdeas');
            const categoryCountSpan = document.getElementById('categoryCount');
            const filterContainer = document.getElementById('filterContainer');
            const clearFilterBtn = document.getElementById('clearFilterBtn');

            // ----- storage key -----
            const STORAGE_KEY = 'ideavault_data';

            // ----- helper functions -----
            function loadFromStorage() {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            ideas = parsed.map(idea => ({
                                id: idea.id || self.crypto.randomUUID ? crypto.randomUUID() : 'idea_' + Date.now() + '_' + Math.random(),
                                text: idea.text || 'untitled',
                                category: idea.category || 'Personal',
                                timestamp: idea.timestamp || Date.now()
                            }));
                        }
                    } catch (e) {}
                }
                if (!ideas.length) {
                    // seed some nice ideas
                    const now = Date.now();
                    ideas = [
                        { id: 'i1', text: 'Write a short story set in a library at night', category: 'Creative', timestamp: now - 86400000 },
                        { id: 'i2', text: 'Morning stretching routine for desk workers', category: 'Health', timestamp: now - 172800000 },
                        { id: 'i3', text: 'Self-watering plant pot using recycled bottles', category: 'Personal', timestamp: now - 3000000 },
                        { id: 'i4', text: 'Local artist collaboration platform', category: 'Work', timestamp: now - 90000000 },
                        { id: 'i5', text: 'Browser extension to reduce social media distraction', category: 'Tech', timestamp: now - 5000000 },
                        { id: 'i6', text: 'Paint a mural in the community garden', category: 'Creative', timestamp: now - 2000000 },
                    ];
                }
            }

            function saveToStorage() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
            }

            // get unique categories (excluding 'all')
            function getUniqueCategories() {
                const cats = ideas.map(idea => idea.category);
                return [...new Set(cats)].sort();
            }

            // update filter buttons (dynamic categories)
            function renderFilterButtons() {
                const categories = getUniqueCategories();
                let html = `<button class="filter-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All</button>`;
                categories.forEach(cat => {
                    html += `<button class="filter-btn ${activeFilter === cat ? 'active' : ''}" data-filter="${cat}">${cat}</button>`;
                });
                filterContainer.innerHTML = html;

                // attach event listeners to filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const filterVal = btn.dataset.filter;
                        activeFilter = filterVal || 'all';
                        renderFilterButtons();   // refresh active style
                        renderIdeasGrid();
                    });
                });
            }

            // escape for safe HTML
            function escapeHtml(unsafe) {
                return unsafe.replace(/[&<>"]/g, function(m) {
                    if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; if (m === '"') return '&quot;';
                    return m;
                });
            }

            // format timestamp
            function formatDate(ts) {
                const date = new Date(ts);
                return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + 
                       date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // render main grid and stats
            function renderIdeasGrid() {
                // filter ideas based on activeFilter
                let filteredIdeas = ideas;
                if (activeFilter !== 'all') {
                    filteredIdeas = ideas.filter(idea => idea.category === activeFilter);
                }

                // update stats
                totalSpan.textContent = ideas.length;
                const uniqueCats = getUniqueCategories().length;
                categoryCountSpan.textContent = uniqueCats;

                if (filteredIdeas.length === 0) {
                    ideasGrid.innerHTML = `<div class="empty-vault"><i class="fa-regular fa-folder-open"></i><br>No ideas in this filter. Time to brainstorm ✨</div>`;
                    return;
                }

                // sort by newest first
                const sorted = [...filteredIdeas].sort((a, b) => b.timestamp - a.timestamp);

                let gridHtml = '';
                sorted.forEach(idea => {
                    const safeText = escapeHtml(idea.text);
                    const cat = escapeHtml(idea.category);
                    const timeStr = formatDate(idea.timestamp);
                    gridHtml += `
                        <div class="idea-card" data-id="${idea.id}">
                            <div class="idea-header">
                                <span class="category-tag"><i class="fa-regular fa-tag"></i> ${cat}</span>
                                <div class="idea-actions">
                                    <button class="icon-btn delete-btn" title="delete idea"><i class="fa-regular fa-trash-can"></i></button>
                                </div>
                            </div>
                            <div class="idea-content">${safeText}</div>
                            <div class="idea-meta">
                                <span><i class="fa-regular fa-clock"></i> ${timeStr}</span>
                            </div>
                        </div>
                    `;
                });

                ideasGrid.innerHTML = gridHtml;

                // attach delete events to each card
                document.querySelectorAll('.idea-card').forEach(card => {
                    const id = card.dataset.id;
                    const delBtn = card.querySelector('.delete-btn');
                    if (delBtn) {
                        delBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            deleteIdea(id);
                        });
                    }
                });
            }

            // delete idea by id
            function deleteIdea(id) {
                ideas = ideas.filter(idea => idea.id !== id);
                // if active filter no longer has any items, maybe reset to 'all'? we keep same filter, but refresh buttons
                const categoriesLeft = getUniqueCategories();
                if (activeFilter !== 'all' && !categoriesLeft.includes(activeFilter)) {
                    activeFilter = 'all';
                }
                saveToStorage();
                renderFilterButtons();   // refresh category filter list
                renderIdeasGrid();
            }

            // add new idea
            function addIdea() {
                const rawText = ideaInput.value.trim();
                if (rawText === '') {
                    alert('Please describe your idea.');
                    return;
                }
                const category = categorySelect.value;
                const newIdea = {
                    id: crypto.randomUUID ? crypto.randomUUID() : 'idea_' + Date.now() + '_' + Math.random().toString(36),
                    text: rawText,
                    category: category,
                    timestamp: Date.now()
                };
                ideas.push(newIdea);
                saveToStorage();

                // reset filter to 'all' to show the new idea (optional, but friendly)
                activeFilter = 'all';
                renderFilterButtons();
                renderIdeasGrid();

                // clear input
                ideaInput.value = '';
                ideaInput.focus();
            }

            // reset filter to all
            function resetFilter() {
                activeFilter = 'all';
                renderFilterButtons();
                renderIdeasGrid();
            }

            // ----- event listeners -----
            addBtn.addEventListener('click', addIdea);
            ideaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addIdea();
                }
            });
            clearFilterBtn.addEventListener('click', resetFilter);

            // initial load
            loadFromStorage();
            renderFilterButtons();
            renderIdeasGrid();
        })();