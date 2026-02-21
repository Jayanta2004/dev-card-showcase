        (function() {
            // ---- story library (immutable seed data) ----
            const STORY_DATA = [
                { id: 's1', title: 'The Crystal Cave', author: 'Eleanor Grey', genre: 'Fantasy', year: 2022, words: 2400, excerpt: 'Deep beneath the mountain, a hidden cave held secrets that could change the realm forever.', full: 'Lira had always been drawn to the mountain. The elders warned of spirits, but she found a cavern of luminescent crystals that hummed with ancient magic. There she met an entity of light, who spoke of an old pact—and a danger rising.' },
                { id: 's2', title: 'Neptune’s Gambit', author: 'Arjun Mehta', genre: 'Sci-Fi', year: 2023, words: 3100, excerpt: 'On a mining colony around Neptune, a lone engineer discovers an alien signal no one believes.', full: 'The signal came from the methane ice. Engineer Kael ran diagnostics again—it was patterned. Soon, corporate security arrived to silence him, but a rogue AI on the station chose to help. Together they uncovered a derelict ship frozen for millennia.' },
                { id: 's3', title: 'The Last Keeper', author: 'Sofia Rivera', genre: 'Mystery', year: 2021, words: 1900, excerpt: 'A lighthouse keeper on a remote island finds a logbook that predicts shipwrecks before they happen.', full: 'Every evening, Clara wound the clock and read the entries. But one log, dated tomorrow, detailed a wreck. When she woke, a ship was indeed foundering. She began to investigate the previous keeper—who had vanished years ago.' },
                { id: 's4', title: 'Letters from Summer', author: 'James Chen', genre: 'Romance', year: 2020, words: 1600, excerpt: 'Two strangers exchange letters through a misdirected post, falling in love across the country.', full: 'Ella received the first letter meant for someone else. She almost tossed it, but the handwriting was beautiful. On a whim, she replied. For months, they shared stories—until she realized she wanted to meet.' },
                { id: 's5', title: 'Jungle of Whispers', author: 'Maya Singh', genre: 'Adventure', year: 2024, words: 2800, excerpt: 'An expedition into the Amazon uncovers a lost city—and something that still lives there.', full: 'Dr. Vargas led the team using old Jesuit maps. They found the overgrown ziggurat, but the jungle itself seemed to watch them. At night, they heard whispers in a language none recognized. One by one, they felt they were being led somewhere.' },
                { id: 's6', title: 'The Alchemist’s Diary', author: 'Theo Black', genre: 'Fantasy', year: 2019, words: 2200, excerpt: 'A modern historian discovers a diary that might contain the formula for the philosopher’s stone.', full: 'The diary was written in code. Dr. Hale spent years deciphering it, only to realize the alchemist was still alive—or something wearing his name. The formula required a sacrifice: one year of the reader’s life.' },
                { id: 's7', title: 'Silent Orbit', author: 'Nadia Voss', genre: 'Sci-Fi', year: 2023, words: 2700, excerpt: 'A lone astronaut loses contact with Earth, but hears a haunting melody from the void.', full: 'Commander Park’s comms went dead after a solar flare. Then the music began—an orchestral piece that seemed to emanate from the hull. She followed the signal to a derelict satellite that held a message from the first mission to Mars.' },
                { id: 's8', title: 'Murder at the Lighthouse', author: 'Sofia Rivera', genre: 'Mystery', year: 2022, words: 2100, excerpt: 'The lighthouse keeper is found dead—locked from the inside.', full: 'Inspector Rowe arrived to a sealed tower. The only key was inside with the body. Yet a single wet footprint led away from the door. A classic impossible crime with a twist: the killer used the tide.' },
            ];

            // ---- app state (filters) ----
            let selectedGenre = 'all';
            let searchQuery = '';

            // DOM elements
            const genreSelect = document.getElementById('genreSelect');
            const searchInput = document.getElementById('searchInput');
            const resetBtn = document.getElementById('resetBtn');
            const storyGrid = document.getElementById('storyGrid');
            const totalStoriesSpan = document.getElementById('totalStories');
            const totalAuthorsSpan = document.getElementById('totalAuthors');
            const modalOverlay = document.getElementById('modalOverlay');
            const modalClose = document.getElementById('modalClose');
            const modalGenre = document.getElementById('modalGenre');
            const modalTitle = document.getElementById('modalTitle');
            const modalAuthor = document.getElementById('modalAuthor');
            const modalText = document.getElementById('modalText');
            const modalDate = document.getElementById('modalDate');
            const modalWords = document.getElementById('modalWords');

            // ---- helpers ----
            function escapeHtml(unsafe) {
                return unsafe.replace(/[&<>"]/g, function(m) {
                    if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; if (m === '"') return '&quot;';
                    return m;
                });
            }

            // get filtered stories
            function getFilteredStories() {
                return STORY_DATA.filter(story => {
                    if (selectedGenre !== 'all' && story.genre !== selectedGenre) return false;
                    if (searchQuery.trim() !== '') {
                        const q = searchQuery.toLowerCase();
                        return story.title.toLowerCase().includes(q) || story.author.toLowerCase().includes(q);
                    }
                    return true;
                });
            }

            // update stats and grid
            function renderGrid() {
                const filtered = getFilteredStories();

                // stats
                totalStoriesSpan.textContent = filtered.length;
                const uniqueAuthors = [...new Set(filtered.map(s => s.author))].length;
                totalAuthorsSpan.textContent = uniqueAuthors;

                if (filtered.length === 0) {
                    storyGrid.innerHTML = `<div class="empty-stories"><i class="fa-regular fa-face-frown"></i><br>No tales match. Try another path.</div>`;
                    return;
                }

                let html = '';
                filtered.forEach(story => {
                    html += `
                        <div class="story-card" data-id="${story.id}">
                            <span class="story-genre">${story.genre}</span>
                            <div class="story-title">${escapeHtml(story.title)}</div>
                            <div class="story-author"><i class="fa-regular fa-pen"></i> ${escapeHtml(story.author)}</div>
                            <div class="story-excerpt">${escapeHtml(story.excerpt)}</div>
                            <div class="story-footer">
                                <span><i class="fa-regular fa-calendar"></i> ${story.year}</span>
                                <span><i class="fa-regular fa-file-lines"></i> ${story.words} words</span>
                            </div>
                        </div>
                    `;
                });

                storyGrid.innerHTML = html;

                // attach click listeners for each card (open modal)
                document.querySelectorAll('.story-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const id = card.dataset.id;
                        const story = STORY_DATA.find(s => s.id === id);
                        if (story) showModal(story);
                    });
                });
            }

            // show modal with full story
            function showModal(story) {
                modalGenre.textContent = story.genre;
                modalTitle.textContent = story.title;
                modalAuthor.innerHTML = `<i class="fa-regular fa-user"></i> by ${escapeHtml(story.author)}`;
                modalText.textContent = story.full || story.excerpt + ' […]'; // fallback
                modalDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${story.year}`;
                modalWords.innerHTML = `<i class="fa-regular fa-file-lines"></i> ${story.words} words`;
                modalOverlay.style.display = 'flex';
            }

            // close modal
            function closeModal() {
                modalOverlay.style.display = 'none';
            }

            // reset filters
            function resetFilters() {
                selectedGenre = 'all';
                searchQuery = '';
                genreSelect.value = 'all';
                searchInput.value = '';
                renderGrid();
            }

            // ---- event listeners ----
            genreSelect.addEventListener('change', (e) => {
                selectedGenre = e.target.value;
                renderGrid();
            });

            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderGrid();
            });

            resetBtn.addEventListener('click', resetFilters);

            modalClose.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModal();
            });

            // initial render
            renderGrid();

            // close modal on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modalOverlay.style.display === 'flex') {
                    closeModal();
                }
            });
        })();