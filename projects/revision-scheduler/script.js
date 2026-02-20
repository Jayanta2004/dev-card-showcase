        (function() {
            // ---- revision scheduler state (local storage could be added, but keep in memory for demo) ----
            let topics = [];

            // predefined intervals (days) for spaced repetition
            const INTERVALS = [1, 3, 7, 14, 30];  // days

            // ---- helper: generate a new due date based on current stage ----
            function getDueDateFromStage(stageIndex) {
                if (stageIndex >= INTERVALS.length) stageIndex = INTERVALS.length - 1;
                const days = INTERVALS[stageIndex];
                const now = new Date();
                now.setDate(now.getDate() + days);
                return now;
            }

            // format date: YYYY-MM-DD (sortable, short)
            function formatDate(date) {
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }

            // ---- default seed topics (for demo) ----
            function createDefaultTopics() {
                const now = new Date();
                const today = new Date(now);
                const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
                const inThree = new Date(now); inThree.setDate(inThree.getDate() + 3);
                const lastWeek = new Date(now); lastWeek.setDate(lastWeek.getDate() - 2); // overdue example

                return [
                    { id: 't1', name: 'Photosynthesis', stage: 0, dueDate: tomorrow, created: new Date() },
                    { id: 't2', name: 'French irregular verbs', stage: 1, dueDate: inThree, created: new Date() },
                    { id: 't3', name: 'CSS Flexbox', stage: 2, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), created: new Date() },
                    { id: 't4', name: 'WWII dates', stage: 0, dueDate: lastWeek, created: new Date() }, // overdue
                    { id: 't5', name: 'Organic chemistry', stage: 1, dueDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2), created: new Date() },
                ];
            }

            // initialize with defaults
            topics = createDefaultTopics();

            // ----- DOM elements -----
            const taskContainer = document.getElementById('taskListContainer');
            const libraryContainer = document.getElementById('topicLibraryContainer');
            const dueCountSpan = document.getElementById('dueCountDisplay');
            const nextBadge = document.getElementById('nextBadge');
            const totalTopicsSpan = document.getElementById('totalTopics');
            const addBtn = document.getElementById('addTopicBtn');
            const newInput = document.getElementById('newTopicInput');

            // ----- helper: generate unique id (simple) -----
            function generateId() {
                return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            }

            // ----- add new topic (stage 0, due tomorrow) -----
            function addNewTopic(name) {
                if (!name.trim()) return;
                const now = new Date();
                const due = new Date(now);
                due.setDate(due.getDate() + INTERVALS[0]); // +1 day

                const newTopic = {
                    id: generateId(),
                    name: name.trim(),
                    stage: 0,
                    dueDate: due,
                    created: new Date()
                };
                topics.push(newTopic);
                renderAll();
            }

            // ----- mark topic as reviewed (move to next stage) -----
            function markDone(topicId) {
                const topic = topics.find(t => t.id === topicId);
                if (!topic) return;

                // move to next stage (if not already at max)
                if (topic.stage < INTERVALS.length - 1) {
                    topic.stage += 1;
                }
                // else stay at max stage (30d)

                // recalc due date based on new stage
                const newDue = new Date();
                newDue.setDate(newDue.getDate() + INTERVALS[topic.stage]);
                topic.dueDate = newDue;

                renderAll();
            }

            // ----- reset topic stage to 0 (1 day) -----
            function resetInterval(topicId) {
                const topic = topics.find(t => t.id === topicId);
                if (!topic) return;
                topic.stage = 0;
                const newDue = new Date();
                newDue.setDate(newDue.getDate() + INTERVALS[0]);
                topic.dueDate = newDue;
                renderAll();
            }

            // ----- render both panels -----
            function renderAll() {
                renderTaskList();
                renderLibrary();
                updateMeta();
            }

            // ----- render upcoming tasks (sorted by due date) -----
            function renderTaskList() {
                // sort topics by due date (ascending)
                const sorted = [...topics].sort((a, b) => a.dueDate - b.dueDate);

                if (sorted.length === 0) {
                    taskContainer.innerHTML = `<div class="empty-state">✨ no topics — add one above</div>`;
                    return;
                }

                let html = '';
                const today = new Date();
                today.setHours(0,0,0,0);

                sorted.forEach(topic => {
                    const due = new Date(topic.dueDate);
                    const dueStr = formatDate(due);
                    const isOverdue = due < today;

                    // human friendly stage text
                    const stageText = `stage ${topic.stage+1}/${INTERVALS.length}`;

                    html += `<div class="task-item ${isOverdue ? 'overdue' : ''}">
                        <div class="task-info">
                            <span class="task-title">${topic.name}</span>
                            <div class="task-meta">
                                <span>📅 due: ${dueStr}</span>
                                <span class="pill">${stageText} · next ${INTERVALS[topic.stage]}d</span>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="btn-icon done" data-id="${topic.id}" title="mark reviewed">✓</button>
                        </div>
                    </div>`;
                });

                taskContainer.innerHTML = html;

                // attach event listeners to done buttons
                document.querySelectorAll('.btn-icon.done').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = btn.dataset.id;
                        markDone(id);
                    });
                });
            }

            // ----- render library with reset buttons -----
            function renderLibrary() {
                if (topics.length === 0) {
                    libraryContainer.innerHTML = `<div class="empty-state">📌 no topics yet</div>`;
                    return;
                }

                let libHtml = '';
                topics.forEach(topic => {
                    const dueStr = formatDate(new Date(topic.dueDate));
                    libHtml += `<div class="topic-item">
                        <div class="topic-left">
                            <span class="topic-name">${topic.name}</span>
                            <span class="interval-badge">stage ${topic.stage} · ${INTERVALS[topic.stage]}d</span>
                            <span style="font-size:0.7rem; color:#366f83;">due ${dueStr}</span>
                        </div>
                        <button class="reset-interval" data-id="${topic.id}">↻ reset to 1d</button>
                    </div>`;
                });

                libraryContainer.innerHTML = libHtml;

                // attach reset listeners
                document.querySelectorAll('.reset-interval').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = btn.dataset.id;
                        resetInterval(id);
                    });
                });
            }

            // ----- update footer and badge (next due)-----
            function updateMeta() {
                totalTopicsSpan.innerText = topics.length + ' topics';

                if (topics.length === 0) {
                    nextBadge.innerText = '🔔 next: —';
                    dueCountSpan.innerText = '';
                    return;
                }

                const today = new Date();
                today.setHours(0,0,0,0);
                const upcoming = topics.filter(t => new Date(t.dueDate) >= today);
                const overdue = topics.filter(t => new Date(t.dueDate) < today);

                const sorted = [...topics].sort((a,b) => a.dueDate - b.dueDate);
                const next = sorted[0];
                const nextDate = formatDate(new Date(next.dueDate));
                nextBadge.innerText = `🔔 next: ${next.name} (${nextDate})`;

                dueCountSpan.innerText = `📌 overdue: ${overdue.length}  |  upcoming: ${upcoming.length}`;
            }

            // ----- event listener: add topic -----
            addBtn.addEventListener('click', () => {
                addNewTopic(newInput.value);
                newInput.value = '';
            });

            newInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addNewTopic(newInput.value);
                    newInput.value = '';
                }
            });

            // initial render
            renderAll();

            // (optional) expose for debugging
            window.__scheduler = { topics, addNewTopic, markDone, resetInterval };
        })();