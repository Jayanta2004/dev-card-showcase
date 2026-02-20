        document.addEventListener('DOMContentLoaded', function() {
            // ----- State -----
            let capsules = [];
            
            // DOM elements
            const titleInput = document.getElementById('capsule-title');
            const messageInput = document.getElementById('capsule-message');
            const dateInput = document.getElementById('capsule-date');
            const createBtn = document.getElementById('create-capsule');
            const capsulesList = document.getElementById('capsules-list');
            const emptyState = document.getElementById('empty-state-message');
            const totalCapsulesStat = document.getElementById('total-capsules-stat');
            const sealedStat = document.getElementById('sealed-stat');
            const availableStat = document.getElementById('available-stat');
            const openedStat = document.getElementById('opened-stat');
            const capsuleCountEl = document.getElementById('capsule-count');
            
            // Modal elements
            const modal = document.getElementById('capsule-modal');
            const modalTitle = document.getElementById('modal-capsule-title');
            const modalMessage = document.getElementById('modal-message');
            const modalDate = document.getElementById('modal-date');
            const modalUnlock = document.getElementById('modal-unlock');
            const closeModalBtn = document.getElementById('close-modal-btn');
            
            // Toast
            const toast = document.getElementById('toast');
            
            // Set default date to 1 year from now
            function setDefaultDate() {
                const today = new Date();
                const nextYear = new Date(today);
                nextYear.setFullYear(today.getFullYear() + 1);
                
                const year = nextYear.getFullYear();
                const month = String(nextYear.getMonth() + 1).padStart(2, '0');
                const day = String(nextYear.getDate()).padStart(2, '0');
                
                dateInput.value = `${year}-${month}-${day}`;
            }
            setDefaultDate();
            
            // ----- Load from localStorage -----
            function loadCapsules() {
                const stored = localStorage.getItem('timeCapsules');
                if (stored) {
                    try {
                        capsules = JSON.parse(stored);
                        // convert date strings back to Date objects for comparison
                        capsules.forEach(c => {
                            c.createdAt = new Date(c.createdAt);
                            c.unlockDate = new Date(c.unlockDate);
                        });
                    } catch (e) {
                        console.error('Failed to load capsules', e);
                        capsules = [];
                    }
                } else {
                    // Add sample capsule if empty
                    if (capsules.length === 0) {
                        const sampleDate = new Date();
                        sampleDate.setFullYear(sampleDate.getFullYear() + 2);
                        capsules.push({
                            id: generateId(),
                            title: 'Hello from the past',
                            message: 'I hope you\'re doing well. Remember to be kind to yourself. 🌿',
                            unlockDate: sampleDate,
                            createdAt: new Date(),
                            opened: false
                        });
                    }
                }
                saveCapsules();
                renderCapsules();
                updateStats();
            }
            
            // ----- Save to localStorage -----
            function saveCapsules() {
                localStorage.setItem('timeCapsules', JSON.stringify(capsules));
                renderCapsules();
                updateStats();
            }
            
            // ----- Generate unique ID -----
            function generateId() {
                return Date.now().toString(36) + Math.random().toString(36).substring(2);
            }
            
            // ----- Create new capsule -----
            function createCapsule() {
                const message = messageInput.value.trim();
                if (!message) {
                    showToast('Please write a message 💌', 'error');
                    return;
                }
                
                let unlockDate = dateInput.value ? new Date(dateInput.value) : null;
                
                if (!unlockDate) {
                    // fallback: 1 year from now
                    unlockDate = new Date();
                    unlockDate.setFullYear(unlockDate.getFullYear() + 1);
                }
                
                // Ensure unlock date is in the future
                const now = new Date();
                if (unlockDate <= now) {
                    showToast('Unlock date must be in the future ⏳', 'error');
                    return;
                }
                
                const title = titleInput.value.trim() || `Letter from ${now.toLocaleDateString()}`;
                
                const newCapsule = {
                    id: generateId(),
                    title: title,
                    message: message,
                    unlockDate: unlockDate,
                    createdAt: new Date(),
                    opened: false
                };
                
                capsules.push(newCapsule);
                saveCapsules();
                
                // Reset form
                titleInput.value = '';
                messageInput.value = '';
                setDefaultDate();
                
                showToast('✨ Time capsule buried successfully!');
            }
            
            // ----- Check if capsule is unlockable (date reached) -----
            function isUnlockable(capsule) {
                const now = new Date();
                return now >= capsule.unlockDate && !capsule.opened;
            }
            
            // ----- Unlock capsule (mark as opened) -----
            function unlockCapsule(id) {
                const capsule = capsules.find(c => c.id === id);
                if (capsule && !capsule.opened) {
                    capsule.opened = true;
                    saveCapsules();
                    showToast('🔓 Time capsule opened. Welcome to the future.');
                    
                    // Show modal with the message
                    openCapsuleModal(capsule);
                }
            }
            
            // ----- Open modal to read capsule -----
            function openCapsuleModal(capsule) {
                modalTitle.textContent = capsule.title;
                modalMessage.textContent = capsule.message;
                
                const created = new Date(capsule.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                });
                modalDate.textContent = `📬 Sealed: ${created}`;
                
                const unlockedDate = new Date(capsule.unlockDate).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                
                if (capsule.opened) {
                    modalUnlock.textContent = `🔓 Opened: ${new Date().toLocaleDateString()}`;
                } else {
                    modalUnlock.textContent = `📅 Unlocks: ${unlockedDate}`;
                }
                
                modal.style.display = 'flex';
            }
            
            // ----- Render all capsules in vault -----
            function renderCapsules() {
                // Sort: unread/unlockable first, then by date
                const sorted = [...capsules].sort((a, b) => {
                    // ready to open first
                    const aReady = isUnlockable(a);
                    const bReady = isUnlockable(b);
                    if (aReady && !bReady) return -1;
                    if (!aReady && bReady) return 1;
                    
                    // then by unlock date (soonest first)
                    return a.unlockDate - b.unlockDate;
                });
                
                if (sorted.length === 0) {
                    capsulesList.innerHTML = `
                        <div class="empty-state" id="empty-state-message">
                            <i class="fas fa-box-open"></i>
                            <p>Your time capsule vault is empty.</p>
                            <p style="font-size: 0.95rem; margin-top: 10px;">Write your first message to the future ✨</p>
                        </div>
                    `;
                    capsuleCountEl.textContent = '0 capsules';
                    return;
                }
                
                let html = '';
                sorted.forEach(capsule => {
                    const now = new Date();
                    const unlockDate = new Date(capsule.unlockDate);
                    const isReady = now >= unlockDate && !capsule.opened;
                    const isOpened = capsule.opened;
                    
                    // Format dates
                    const formattedUnlock = unlockDate.toLocaleDateString('en-US', { 
                        month: 'short', day: 'numeric', year: 'numeric' 
                    });
                    
                    // Determine icon and status
                    let iconClass = 'fa-clock';
                    let iconBg = '';
                    let statusText = '';
                    let statusClass = '';
                    
                    if (isOpened) {
                        iconClass = 'fa-envelope-open';
                        iconBg = 'opened';
                        statusText = 'Opened';
                        statusClass = 'status-opened';
                    } else if (isReady) {
                        iconClass = 'fa-gift';
                        iconBg = 'unlocked';
                        statusText = 'Ready to open';
                        statusClass = 'status-available';
                    } else {
                        iconClass = 'fa-hourglass';
                        iconBg = 'locked';
                        statusText = `Unlocks ${formattedUnlock}`;
                        statusClass = 'status-locked';
                    }
                    
                    // Short preview
                    const preview = capsule.message.substring(0, 45) + (capsule.message.length > 45 ? '…' : '');
                    
                    html += `
                        <div class="capsule-card" data-id="${capsule.id}">
                            <div class="capsule-icon ${iconBg}">
                                <i class="fas ${iconClass}"></i>
                            </div>
                            <div class="capsule-info">
                                <div class="capsule-title">${capsule.title}</div>
                                <div class="capsule-date">
                                    <i class="far fa-calendar-alt"></i> Open: ${formattedUnlock}
                                </div>
                                <div class="capsule-preview">
                                    ${isOpened ? '📖 ' + preview : isReady ? '🔔 ' + preview : '⏳ ' + preview}
                                </div>
                            </div>
                            <div class="capsule-status">
                                <span class="status-badge ${statusClass}">${statusText}</span>
                                ${isReady ? `<button class="unlock-btn" data-id="${capsule.id}"><i class="fas fa-unlock-alt"></i> Open</button>` : ''}
                                ${isOpened ? `<button class="unlock-btn" style="background: #9b8b8b;" data-id="${capsule.id}"><i class="fas fa-book-open"></i> Read</button>` : ''}
                                ${!isReady && !isOpened ? `<button class="unlock-btn" style="background: #d9c2c2;" disabled><i class="fas fa-lock"></i> Locked</button>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                capsulesList.innerHTML = html;
                capsuleCountEl.textContent = `${capsules.length} ${capsules.length === 1 ? 'capsule' : 'capsules'}`;
                
                // Add event listeners to cards and buttons
                document.querySelectorAll('.capsule-card').forEach(card => {
                    const id = card.dataset.id;
                    
                    // Click on card opens if unlocked/opened, otherwise just info
                    card.addEventListener('click', (e) => {
                        // Prevent if clicking on button directly
                        if (e.target.closest('button')) return;
                        
                        const capsule = capsules.find(c => c.id === id);
                        if (capsule) {
                            if (capsule.opened || isUnlockable(capsule)) {
                                openCapsuleModal(capsule);
                            } else {
                                showToast('⏳ This capsule is still sealed. Time will tell.', 'info');
                            }
                        }
                    });
                });
                
                // Unlock/Read buttons
                document.querySelectorAll('.unlock-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = btn.dataset.id;
                        const capsule = capsules.find(c => c.id === id);
                        
                        if (capsule) {
                            if (!capsule.opened && isUnlockable(capsule)) {
                                unlockCapsule(id);
                            } else if (capsule.opened) {
                                openCapsuleModal(capsule);
                            }
                        }
                    });
                });
            }
            
            // ----- Update statistics -----
            function updateStats() {
                const total = capsules.length;
                const sealed = capsules.filter(c => !c.opened && new Date() < new Date(c.unlockDate)).length;
                const ready = capsules.filter(c => isUnlockable(c)).length;
                const opened = capsules.filter(c => c.opened).length;
                
                totalCapsulesStat.textContent = total;
                sealedStat.textContent = sealed;
                availableStat.textContent = ready;
                openedStat.textContent = opened;
            }
            
            // ----- Show toast notification -----
            function showToast(message, type = 'success') {
                toast.textContent = message;
                toast.style.display = 'flex';
                toast.style.background = type === 'error' ? '#c46f6f' : '#3a2c2c';
                toast.style.color = 'white';
                
                setTimeout(() => {
                    toast.style.display = 'none';
                }, 3000);
            }
            
            // ----- Preset date buttons -----
            document.querySelectorAll('.preset-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const years = parseInt(this.dataset.years, 10);
                    const date = new Date();
                    date.setFullYear(date.getFullYear() + years);
                    
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    
                    dateInput.value = `${year}-${month}-${day}`;
                });
            });
            
            // ----- Create button -----
            createBtn.addEventListener('click', createCapsule);
            
            // ----- Modal close -----
            function closeModal() {
                modal.style.display = 'none';
            }
            
            closeModalBtn.addEventListener('click', closeModal);
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // ----- Enter key in message (Ctrl+Enter) -----
            messageInput.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    createCapsule();
                }
            });
            
            // ----- Initialize -----
            loadCapsules();
            
            // Keyboard shortcut: Ctrl+Shift+T to create test capsule (dev)
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                    const testDate = new Date();
                    testDate.setSeconds(testDate.getSeconds() + 10); // opens in 10 seconds
                    
                    capsules.push({
                        id: generateId(),
                        title: '⚡ Test Capsule',
                        message: 'This capsule will unlock in 10 seconds! Welcome, time traveler.',
                        unlockDate: testDate,
                        createdAt: new Date(),
                        opened: false
                    });
                    saveCapsules();
                    showToast('🧪 Test capsule added (unlocks in 10s)');
                }
            });
        });