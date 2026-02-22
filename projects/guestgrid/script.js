        (function() {
            // ---- data model ----
            let guests = [];            // { id, name, email, status }
            let statusFilter = 'all';
            let searchQuery = '';

            // DOM elements
            const nameInput = document.getElementById('guestNameInput');
            const emailInput = document.getElementById('guestEmailInput');
            const statusSelect = document.getElementById('guestStatusSelect');
            const addBtn = document.getElementById('addGuestBtn');
            const tableBody = document.getElementById('guestTableBody');
            const statusFilterSelect = document.getElementById('statusFilterSelect');
            const searchInput = document.getElementById('searchInput');
            const resetFilterBtn = document.getElementById('resetFilterBtn');

            // stats spans
            const totalSpan = document.getElementById('totalGuests');
            const confirmedSpan = document.getElementById('confirmedCount');
            const pendingSpan = document.getElementById('pendingCount');
            const declinedSpan = document.getElementById('declinedCount');
            const attendingPercentSpan = document.getElementById('attendingPercent');

            const STORAGE_KEY = 'guestgrid_data';

            // ---- load initial / seed ----
            function loadFromStorage() {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            guests = parsed.map(g => ({
                                id: g.id || crypto.randomUUID ? crypto.randomUUID() : 'guest_' + Date.now() + '_' + Math.random(),
                                name: g.name || 'Unknown',
                                email: g.email || 'noemail@example.com',
                                status: g.status || 'pending'
                            }));
                        }
                    } catch (e) {}
                }

                if (!guests.length) {
                    // seed data
                    guests = [
                        { id: 'g1', name: 'Elena Martinez', email: 'elena.m@example.com', status: 'confirmed' },
                        { id: 'g2', name: 'James Carter', email: 'j.carter@example.com', status: 'pending' },
                        { id: 'g3', name: 'Priya Kapoor', email: 'priya.k@example.com', status: 'confirmed' },
                        { id: 'g4', name: 'Liam O’Connor', email: 'liam.o@example.com', status: 'declined' },
                        { id: 'g5', name: 'Zara Hassan', email: 'zara.h@example.com', status: 'confirmed' },
                        { id: 'g6', name: 'Miguel Santos', email: 'm.santos@example.com', status: 'pending' },
                    ];
                }
            }

            function saveToStorage() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
            }

            // ---- filtered guests based on statusFilter and searchQuery ----
            function getFilteredGuests() {
                return guests.filter(guest => {
                    if (statusFilter !== 'all' && guest.status !== statusFilter) return false;
                    if (searchQuery.trim() !== '') {
                        const q = searchQuery.toLowerCase();
                        return guest.name.toLowerCase().includes(q) || guest.email.toLowerCase().includes(q);
                    }
                    return true;
                });
            }

            // ---- render table and stats ----
            function renderGrid() {
                const filtered = getFilteredGuests();

                // update stats (from full list, not filtered)
                const total = guests.length;
                const confirmed = guests.filter(g => g.status === 'confirmed').length;
                const pending = guests.filter(g => g.status === 'pending').length;
                const declined = guests.filter(g => g.status === 'declined').length;
                const attendingPercent = total ? Math.round((confirmed / total) * 100) : 0;

                totalSpan.textContent = total;
                confirmedSpan.textContent = confirmed;
                pendingSpan.textContent = pending;
                declinedSpan.textContent = declined;
                attendingPercentSpan.textContent = attendingPercent + '%';

                if (filtered.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="4" class="empty-message">✨ no guests match the filter</td></tr>`;
                    return;
                }

                let rows = '';
                filtered.forEach(guest => {
                    const statusClass = 
                        guest.status === 'confirmed' ? 'status-confirmed' : 
                        guest.status === 'pending' ? 'status-pending' : 'status-declined';
                    
                    rows += `
                        <tr data-id="${guest.id}">
                            <td class="guest-name">${escapeHtml(guest.name)}</td>
                            <td class="guest-email">${escapeHtml(guest.email)}</td>
                            <td>
                                <span class="status-badge ${statusClass}">${guest.status}</span>
                            </td>
                            <td>
                                <div class="action-btns">
                                    <button class="action-btn confirm-btn" title="mark confirmed"><i class="fa-regular fa-check"></i></button>
                                    <button class="action-btn pending-btn" title="mark pending"><i class="fa-regular fa-clock"></i></button>
                                    <button class="action-btn decline-btn" title="mark declined"><i class="fa-regular fa-xmark"></i></button>
                                    <button class="action-btn delete-btn" title="delete guest"><i class="fa-regular fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    `;
                });

                tableBody.innerHTML = rows;

                // attach event listeners to each row's buttons
                document.querySelectorAll('tr[data-id]').forEach(row => {
                    const id = row.dataset.id;
                    const confirmBtn = row.querySelector('.confirm-btn');
                    const pendingBtn = row.querySelector('.pending-btn');
                    const declineBtn = row.querySelector('.decline-btn');
                    const deleteBtn = row.querySelector('.delete-btn');

                    if (confirmBtn) confirmBtn.addEventListener('click', (e) => { e.stopPropagation(); updateStatus(id, 'confirmed'); });
                    if (pendingBtn) pendingBtn.addEventListener('click', (e) => { e.stopPropagation(); updateStatus(id, 'pending'); });
                    if (declineBtn) declineBtn.addEventListener('click', (e) => { e.stopPropagation(); updateStatus(id, 'declined'); });
                    if (deleteBtn) deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteGuest(id); });
                });
            }

            // escape helper
            function escapeHtml(unsafe) {
                return unsafe.replace(/[&<>"]/g, function(m) {
                    if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; if (m === '"') return '&quot;';
                    return m;
                });
            }

            // update status
            function updateStatus(id, newStatus) {
                const guest = guests.find(g => g.id === id);
                if (guest) {
                    guest.status = newStatus;
                    saveToStorage();
                    renderGrid();
                }
            }

            // delete guest
            function deleteGuest(id) {
                guests = guests.filter(g => g.id !== id);
                saveToStorage();
                renderGrid();
            }

            // add new guest
            function addGuest() {
                const name = nameInput.value.trim();
                const email = emailInput.value.trim();
                const status = statusSelect.value;

                if (!name) {
                    alert('Please enter guest name.');
                    return;
                }
                if (!email) {
                    alert('Email is required.');
                    return;
                }
                // basic email pattern check (simple)
                if (!email.includes('@') || !email.includes('.')) {
                    alert('Enter a valid email address.');
                    return;
                }

                const newGuest = {
                    id: crypto.randomUUID ? crypto.randomUUID() : 'guest_' + Date.now() + '_' + Math.random().toString(36),
                    name: name,
                    email: email,
                    status: status
                };

                guests.push(newGuest);
                saveToStorage();

                // clear inputs, keep status as default?
                nameInput.value = '';
                emailInput.value = '';
                statusSelect.value = 'confirmed';   // default
                renderGrid();
                nameInput.focus();
            }

            // reset filters
            function resetFilters() {
                statusFilter = 'all';
                searchQuery = '';
                statusFilterSelect.value = 'all';
                searchInput.value = '';
                renderGrid();
            }

            // ---- event listeners ----
            addBtn.addEventListener('click', addGuest);
            // Enter in fields? (optional but handy)
            nameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addGuest(); });
            emailInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addGuest(); });

            statusFilterSelect.addEventListener('change', (e) => {
                statusFilter = e.target.value;
                renderGrid();
            });

            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                renderGrid();
            });

            resetFilterBtn.addEventListener('click', resetFilters);

            // initialize
            loadFromStorage();
            renderGrid();
        })();