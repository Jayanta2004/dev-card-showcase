        (function() {
            // --- data model ---
            let tasks = [];   // { id, title, priority: 'high'|'medium'|'low', done: false } (we only show pending, but we can keep done for history? we'll keep only pending; completed removed)
            // but for "next" we only consider pending. We'll keep tasks as pending items; completing removes them.

            const STORAGE_KEY = 'makenext_tasks';

            // DOM elements
            const taskInput = document.getElementById('taskInput');
            const prioritySelect = document.getElementById('prioritySelect');
            const addBtn = document.getElementById('addTaskBtn');
            const taskContainer = document.getElementById('taskListContainer');
            const nextDisplay = document.getElementById('nextTaskDisplay');
            const completeBtn = document.getElementById('completeNextBtn');

            // stats spans
            const totalSpan = document.getElementById('totalTasks');
            const highSpan = document.getElementById('highCount');
            const mediumSpan = document.getElementById('mediumCount');
            const lowSpan = document.getElementById('lowCount');

            // --- load / seed ---
            function loadTasks() {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) {
                            tasks = parsed.map(t => ({
                                id: t.id || crypto.randomUUID ? crypto.randomUUID() : 'task_' + Date.now() + '_' + Math.random(),
                                title: t.title || 'untitled',
                                priority: t.priority || 'medium'
                            }));
                        }
                    } catch (e) {}
                }
                if (!tasks.length) {
                    tasks = [
                        { id: 't1', title: 'Sketch wireframes for project', priority: 'high' },
                        { id: 't2', title: 'Reply to client email', priority: 'high' },
                        { id: 't3', title: 'Update weekly log', priority: 'medium' },
                        { id: 't4', title: 'Organize desk', priority: 'low' },
                    ];
                }
            }

            function saveTasks() {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            }

            // --- helper: get sorted tasks (high > medium > low), preserving order within same priority? we can keep insertion order but group.
            function getSortedTasks() {
                const priorityOrder = { high: 1, medium: 2, low: 3 };
                return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            }

            // --- determine next task (first after sort) ---
            function getNextTask() {
                const sorted = getSortedTasks();
                return sorted.length ? sorted[0] : null;
            }

            // --- render task list and next suggestion ---
            function renderAll() {
                // stats
                const total = tasks.length;
                const high = tasks.filter(t => t.priority === 'high').length;
                const medium = tasks.filter(t => t.priority === 'medium').length;
                const low = tasks.filter(t => t.priority === 'low').length;

                totalSpan.textContent = total;
                highSpan.textContent = high;
                mediumSpan.textContent = medium;
                lowSpan.textContent = low;

                // next display
                const next = getNextTask();
                if (next) {
                    nextDisplay.textContent = `⚡ ${next.title}`;
                    nextDisplay.classList.remove('next-empty');
                    completeBtn.disabled = false;
                } else {
                    nextDisplay.textContent = '— all done. add a task —';
                    nextDisplay.classList.add('next-empty');
                    completeBtn.disabled = true;
                }

                // render task list (all pending)
                if (tasks.length === 0) {
                    taskContainer.innerHTML = `<div class="empty-tasks"><i class="fa-regular fa-face-smile"></i> nothing pending · nice work</div>`;
                    return;
                }

                const sorted = getSortedTasks();
                let html = '';
                sorted.forEach(task => {
                    let priorityClass = '';
                    if (task.priority === 'high') priorityClass = 'priority-high';
                    else if (task.priority === 'medium') priorityClass = 'priority-medium';
                    else priorityClass = 'priority-low';

                    html += `
                        <div class="task-item" data-id="${task.id}">
                            <span class="task-priority ${priorityClass}">${task.priority}</span>
                            <span class="task-title">${escapeHtml(task.title)}</span>
                            <div class="task-actions">
                                <button class="task-btn up-priority" title="increase priority"><i class="fa-regular fa-arrow-up"></i></button>
                                <button class="task-btn down-priority" title="decrease priority"><i class="fa-regular fa-arrow-down"></i></button>
                                <button class="task-btn delete-btn" title="delete task"><i class="fa-regular fa-trash-can"></i></button>
                            </div>
                        </div>
                    `;
                });

                taskContainer.innerHTML = html;

                // attach event listeners
                document.querySelectorAll('.task-item').forEach(item => {
                    const id = item.dataset.id;
                    const upBtn = item.querySelector('.up-priority');
                    const downBtn = item.querySelector('.down-priority');
                    const deleteBtn = item.querySelector('.delete-btn');

                    if (upBtn) upBtn.addEventListener('click', (e) => { e.stopPropagation(); changePriority(id, 'up'); });
                    if (downBtn) downBtn.addEventListener('click', (e) => { e.stopPropagation(); changePriority(id, 'down'); });
                    if (deleteBtn) deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); deleteTask(id); });
                });
            }

            function escapeHtml(unsafe) {
                return unsafe.replace(/[&<>"]/g, function(m) {
                    if (m === '&') return '&amp;'; if (m === '<') return '&lt;'; if (m === '>') return '&gt;'; if (m === '"') return '&quot;';
                    return m;
                });
            }

            // --- priority change cycle: high > medium > low ---
            function changePriority(id, direction) {
                const task = tasks.find(t => t.id === id);
                if (!task) return;
                const order = ['high', 'medium', 'low'];
                let idx = order.indexOf(task.priority);
                if (idx === -1) idx = 1; // fallback

                if (direction === 'up') {
                    idx = Math.max(0, idx - 1);
                } else {
                    idx = Math.min(2, idx + 1);
                }
                task.priority = order[idx];
                saveTasks();
                renderAll();
            }

            function deleteTask(id) {
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                renderAll();
            }

            // --- complete next task (remove it) ---
            function completeNext() {
                const next = getNextTask();
                if (next) {
                    tasks = tasks.filter(t => t.id !== next.id);
                    saveTasks();
                    renderAll();
                }
            }

            // --- add new task ---
            function addTask() {
                const title = taskInput.value.trim();
                if (!title) {
                    alert('Please describe the task.');
                    return;
                }
                const priority = prioritySelect.value;

                const newTask = {
                    id: crypto.randomUUID ? crypto.randomUUID() : 'task_' + Date.now() + '_' + Math.random().toString(36),
                    title: title,
                    priority: priority
                };
                tasks.push(newTask);
                saveTasks();
                renderAll();

                // clear input
                taskInput.value = '';
                taskInput.focus();
            }

            // --- event listeners ---
            addBtn.addEventListener('click', addTask);
            taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
            completeBtn.addEventListener('click', completeNext);

            // initialize
            loadTasks();
            renderAll();
        })();