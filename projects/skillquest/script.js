        (function() {
            // ----- core data -----
            let skills = [];   // each skill = { id: string, name: string, progress: number }

            // ----- DOM elements -----
            const skillNameInput = document.getElementById('skillNameInput');
            const progressSlider = document.getElementById('progressSlider');
            const sliderDisplay = document.getElementById('sliderDisplay');
            const addBtn = document.getElementById('addSkillBtn');
            const skillsContainer = document.getElementById('skillsContainer');
            const totalSpan = document.getElementById('totalSkills');
            const avgSpan = document.getElementById('avgProgress');

            // slider live display
            progressSlider.addEventListener('input', function() {
                sliderDisplay.textContent = progressSlider.value + '%';
            });

            // ----- helpers / storage -----
            const STORAGE_KEY = 'skillquest_data';

            function loadFromStorage() {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            // simple sanitize: ensure each has id, name, progress (number)
                            skills = parsed.filter(s => s && typeof s === 'object')
                                .map(s => ({
                                    id: s.id || crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random(),
                                    name: s.name || 'untitled',
                                    progress: typeof s.progress === 'number' ? Math.min(100, Math.max(0, s.progress)) : 0
                                }));
                        }
                    } catch (e) {}
                }
                if (!skills.length) {
                    // seed some demo skills
                    skills = [
                        { id: '1', name: 'JavaScript', progress: 75 },
                        { id: '2', name: 'UI Design', progress: 40 },
                        { id: '3', name: 'Public speaking', progress: 20 },
                        { id: '4', name: 'Data Analysis', progress: 90 },
                    ];
                }
            }

            function saveToStorage() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
            }

            // ------ render skill list + stats -----
            function renderAll() {
                if (!skillsContainer) return;

                // stats update
                const total = skills.length;
                totalSpan.textContent = total;
                let avg = 0;
                if (total > 0) {
                    const sum = skills.reduce((acc, s) => acc + (s.progress || 0), 0);
                    avg = Math.round(sum / total);
                }
                avgSpan.textContent = avg + '%';

                if (total === 0) {
                    skillsContainer.innerHTML = `<div class="empty-message">
                        <i class="fa-regular fa-compass"></i><br>
                        No skills yet. Start your quest above ✦
                    </div>`;
                    return;
                }

                // build html
                let htmlString = '';
                skills.forEach(skill => {
                    const progress = skill.progress ?? 0;
                    // use an icon hint based on progress (just for delight)
                    let icon = 'fa-solid fa-code'; // default
                    if (progress >= 80) icon = 'fa-solid fa-crown';
                    else if (progress >= 40) icon = 'fa-solid fa-rocket';
                    else icon = 'fa-solid fa-seedling';

                    htmlString += `
                        <div class="skill-item" data-id="${skill.id}">
                            <span class="skill-name">
                                <i class="${icon}"></i> 
                                ${escapeHtml(skill.name)}
                            </span>
                            <div class="progress-bar-container">
                                <div class="progress-bg">
                                    <div class="progress-fill" style="width: ${progress}%;"></div>
                                </div>
                                <span class="skill-percent">${progress}%</span>
                            </div>
                            <div class="skill-actions">
                                <button class="icon-btn up-btn" title="increase +5"><i class="fas fa-arrow-up"></i></button>
                                <button class="icon-btn down-btn" title="decrease -5"><i class="fas fa-arrow-down"></i></button>
                                <button class="icon-btn delete-btn" title="delete skill"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                });

                skillsContainer.innerHTML = htmlString;

                // attach event listeners to each row's buttons (using container delegation would be lighter, but we attach per button for clarity)
                document.querySelectorAll('.skill-item').forEach(item => {
                    const id = item.dataset.id;
                    const upBtn = item.querySelector('.up-btn');
                    const downBtn = item.querySelector('.down-btn');
                    const deleteBtn = item.querySelector('.delete-btn');

                    if (upBtn) {
                        upBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            adjustProgress(id, 5);
                        });
                    }
                    if (downBtn) {
                        downBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            adjustProgress(id, -5);
                        });
                    }
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            deleteSkill(id);
                        });
                    }
                });
            }

            // simple escape to prevent XSS from user input
            function escapeHtml(unsafe) {
                return unsafe.replace(/[&<>"']/g, function(m) {
                    if(m === '&') return '&amp;'; if(m === '<') return '&lt;'; if(m === '>') return '&gt;';
                    if(m === '"') return '&quot;'; if(m === "'") return '&#039;';
                    return m;
                });
            }

            // ----- actions -----
            function adjustProgress(id, delta) {
                const skill = skills.find(s => s.id === id);
                if (skill) {
                    let newVal = (skill.progress || 0) + delta;
                    newVal = Math.min(100, Math.max(0, newVal));
                    skill.progress = newVal;
                    saveToStorage();
                    renderAll();
                }
            }

            function deleteSkill(id) {
                skills = skills.filter(s => s.id !== id);
                saveToStorage();
                renderAll();
            }

            function addNewSkill() {
                const rawName = skillNameInput.value.trim();
                if (rawName === '') {
                    alert('Please enter a skill name.');
                    return;
                }
                const progress = parseInt(progressSlider.value, 10) || 0;
                const newSkill = {
                    id: crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36),
                    name: rawName,
                    progress: progress
                };
                skills.push(newSkill);
                saveToStorage();
                renderAll();

                // reset input & slider to default
                skillNameInput.value = '';
                progressSlider.value = 40;
                sliderDisplay.textContent = '40%';
                // focus back to input
                skillNameInput.focus();
            }

            // event listener for add button
            addBtn.addEventListener('click', addNewSkill);
            // allow enter in input field
            skillNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addNewSkill();
                }
            });

            // initialise
            loadFromStorage();
            renderAll();

            // (optional) if you want to update avg/total live after any change, it's already inside render
            // but we also need to reflect slider initial value
            sliderDisplay.textContent = progressSlider.value + '%';
        })();