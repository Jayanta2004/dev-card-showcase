        (function() {
            // ----- HISTORICAL LETTERS DATASET -----
            const letters = [
                {
                    sender: "Michelangelo",
                    recipient: "Giovanni da Pistoia",
                    year: 1509,
                    place: "Rome",
                    excerpt: "I am more exhausted than any man who ever lived; I am overcome with effort...",
                    fullText: "I am more exhausted than any man who ever lived; I am overcome with effort, surrounded by the greatest anxiety. Already for months I have been living in the most complete discomfort, working night and day, and my body has been reduced to a skeleton. But I cannot stop—the Pope demands the ceiling finished, and I must obey. This work is my torment and my glory.",
                    century: "16"
                },
                {
                    sender: "Queen Elizabeth I",
                    recipient: "King James VI of Scotland",
                    year: 1586,
                    place: "Greenwich",
                    excerpt: "My dear brother, I hope you will understand the necessity...",
                    fullText: "My dear brother, I hope you will understand the necessity of the actions I must take. The Queen of Scots, your mother, has been implicated in plots against my throne. I assure you this decision is not taken lightly, but for the safety of my realm and yours, I see no other path. May God guide us both.",
                    century: "16"
                },
                {
                    sender: "Galileo Galilei",
                    recipient: "Belisario Vinta",
                    year: 1610,
                    place: "Padua",
                    excerpt: "I have discovered four wandering stars not known to any astronomer before me...",
                    fullText: "I have discovered four wandering stars not known to any astronomer before me. They revolve around Jupiter, like Venus and Mercury around the Sun. This confirms the Copernican system, which many still deny. I shall name them the Medicean Stars, in honor of your noble family.",
                    century: "17"
                },
                {
                    sender: "René Descartes",
                    recipient: "Marin Mersenne",
                    year: 1637,
                    place: "Leiden",
                    excerpt: "I think, therefore I am, is so firm and certain that...",
                    fullText: "I think, therefore I am, is so firm and certain that all the most extravagant suppositions of the skeptics are incapable of shaking it. I have decided to publish my Discourse on the Method, hoping it will contribute to the advancement of knowledge. I await your judgment, my friend.",
                    century: "17"
                },
                {
                    sender: "Voltaire",
                    recipient: "Frederick the Great",
                    year: 1740,
                    place: "Berlin",
                    excerpt: "You are a philosopher king; you prove that a monarch can think...",
                    fullText: "You are a philosopher king; you prove that a monarch can think, and that thought does not weaken the will. Prussia is fortunate to have you. Let us enlighten Europe together! I shall remain at your court as long as my health permits.",
                    century: "18"
                },
                {
                    sender: "Thomas Jefferson",
                    recipient: "John Adams",
                    year: 1813,
                    place: "Monticello",
                    excerpt: "I have received and read with great pleasure your letter...",
                    fullText: "I have received and read with great pleasure your letter. We have lived through an age of revolution, and now in our old age we can reflect on what we built. The Declaration and the Constitution remain beacons. Let us correspond often, my old friend, for there is none left who remembers what we do.",
                    century: "19"
                },
                {
                    sender: "Jane Austen",
                    recipient: "Cassandra Austen",
                    year: 1813,
                    place: "Chawton",
                    excerpt: "I have just finished writing a novel called 'Pride and Prejudice'...",
                    fullText: "I have just finished writing a novel called 'Pride and Prejudice', and I flatter myself it is something quite clever. The characters are drawn from life, though I shall deny it if asked. I hope you will be the first to read it when it is published.",
                    century: "19"
                },
                {
                    sender: "Abraham Lincoln",
                    recipient: "Mrs. Bixby",
                    year: 1864,
                    place: "Washington",
                    excerpt: "I feel how weak and fruitless must be any words of mine...",
                    fullText: "Dear Madam, I have been shown in the files of the War Department a statement of the Adjutant General of Massachusetts that you are the mother of five sons who have died gloriously on the field of battle. I feel how weak and fruitless must be any words of mine which should attempt to beguile you from the grief of a loss so overwhelming. But I cannot refrain from tendering to you the consolation that may be found in the thanks of the republic they died to save.",
                    century: "19"
                },
                {
                    sender: "Wolfgang Amadeus Mozart",
                    recipient: "Leopold Mozart",
                    year: 1778,
                    place: "Mannheim",
                    excerpt: "I write to you with a heavy heart; my mother is very ill...",
                    fullText: "I write to you with a heavy heart; my mother is very ill. The doctor says there is little hope. I am doing everything I can, but I fear the worst. Please forgive any distress this causes you. I will write again soon. Your loving son, Wolfgang.",
                    century: "18"
                },
                {
                    sender: "Beatrix Potter",
                    recipient: "Noel Moore",
                    year: 1893,
                    place: "London",
                    excerpt: "My dear Noel, I don't know what to write to you, so I shall tell you a story...",
                    fullText: "My dear Noel, I don't know what to write to you, so I shall tell you a story about four little rabbits whose names were Flopsy, Mopsy, Cottontail, and Peter. They lived with their mother in a sandbank under the root of a big fir tree...",
                    century: "19"
                },
                {
                    sender: "Napoleon Bonaparte",
                    recipient: "Joséphine",
                    year: 1796,
                    place: "Milan",
                    excerpt: "I have not spent a day without loving you; I have not spent a night without holding you in my arms...",
                    fullText: "I have not spent a day without loving you; I have not spent a night without holding you in my arms. I have drunk no tea without cursing the glory and ambition that keep me away from you, soul of my life. A thousand kisses, as pure and tender as my heart.",
                    century: "18"
                },
                {
                    sender: "Emily Dickinson",
                    recipient: "Thomas Wentworth Higginson",
                    year: 1862,
                    place: "Amherst",
                    excerpt: "Are you too deeply occupied to say if my verse is alive?",
                    fullText: "Are you too deeply occupied to say if my verse is alive? The mind is so near itself it cannot see distinctly. I have no one to ask. Should you think it breathed, and had you the leisure to tell me, I should feel quick gratitude. I enclose my name, asking you to return it, if you please.",
                    century: "19"
                }
            ];

            // ----- DOM elements -----
            const grid = document.getElementById('lettersGrid');
            const searchInput = document.getElementById('searchInput');
            const centuryBtns = document.querySelectorAll('.filter-btn');
            const counterSpan = document.getElementById('counterDisplay');
            const resultCounter = document.getElementById('resultCounter');
            const modalOverlay = document.getElementById('letterModal');
            const modalSender = document.getElementById('modalSender');
            const modalYear = document.getElementById('modalYear');
            const modalRecipient = document.getElementById('modalRecipient');
            const modalPlace = document.getElementById('modalPlace');
            const modalBody = document.getElementById('modalBody');
            const closeModalBtn = document.getElementById('closeModalBtn');

            // ----- state -----
            let activeCentury = 'all';
            let searchTerm = '';

            // ----- filter logic (century + search) -----
            function filterLetters() {
                return letters.filter(letter => {
                    // century filter
                    if (activeCentury !== 'all' && letter.century !== activeCentury) return false;

                    // search (case-insensitive) in sender, recipient, excerpt, fullText, place
                    if (searchTerm.trim() !== '') {
                        const term = searchTerm.trim().toLowerCase();
                        const haystack = `${letter.sender} ${letter.recipient} ${letter.excerpt} ${letter.fullText} ${letter.place}`.toLowerCase();
                        return haystack.includes(term);
                    }
                    return true;
                });
            }

            // ----- render cards -----
            function renderGrid() {
                const filtered = filterLetters();
                // sort by year ascending (oldest first)
                filtered.sort((a,b) => a.year - b.year);

                if (filtered.length === 0) {
                    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3.5rem; background:#2f2a22; border-radius:3rem; color:#bba88b;">📭 no letters match your search</div>`;
                } else {
                    let html = '';
                    filtered.forEach(letter => {
                        html += `
                            <div class="letter-card" data-sender="${letter.sender}" data-recipient="${letter.recipient}" data-year="${letter.year}" data-place="${letter.place}" data-full="${letter.fullText.replace(/"/g, '&quot;')}" data-century="${letter.century}">
                                <div class="card-year">${letter.year}</div>
                                <div class="card-sender">${letter.sender}</div>
                                <div class="card-recipient">${letter.recipient}</div>
                                <div class="card-excerpt">“${letter.excerpt}”</div>
                                <div class="card-footer">
                                    <span class="card-place">📍 ${letter.place}</span>
                                    <span>📖 read</span>
                                </div>
                            </div>
                        `;
                    });
                    grid.innerHTML = html;
                }

                // update counters
                const total = filtered.length;
                counterSpan.textContent = `${total} letter${total !== 1 ? 's' : ''}`;
                resultCounter.textContent = `showing ${total} letter${total !== 1 ? 's' : ''}`;

                // attach click listeners to cards
                document.querySelectorAll('.letter-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const sender = card.dataset.sender;
                        const recipient = card.dataset.recipient;
                        const year = card.dataset.year;
                        const place = card.dataset.place;
                        const fullText = card.dataset.full;
                        openModal(sender, recipient, year, place, fullText);
                    });
                });
            }

            // open modal with full letter
            function openModal(sender, recipient, year, place, fullText) {
                modalSender.textContent = sender;
                modalRecipient.textContent = `to ${recipient}`;
                modalYear.textContent = year;
                modalPlace.textContent = `📍 ${place}`;
                modalBody.textContent = fullText || 'Full text unavailable.';
                modalOverlay.classList.add('show');
            }

            // close modal
            function closeModal() {
                modalOverlay.classList.remove('show');
            }

            // ----- event listeners -----
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                renderGrid();
            });

            centuryBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    centuryBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeCentury = btn.dataset.century;
                    renderGrid();
                });
            });

            closeModalBtn.addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModal();
            });

            // initial render
            renderGrid();
        })();