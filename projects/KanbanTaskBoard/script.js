// KanbanFlow - Agile Project Management Board

document.addEventListener('DOMContentLoaded', function() {
    // Application state
    const state = {
        columns: [],
        tasks: [],
        selectedTask: null,
        nextTaskId: 1,
        nextColumnId: 1,
        theme: localStorage.getItem('kanbanTheme') || 'light',
        activityLog: [],
        filteredTasks: null,
        currentFilter: {
            priority: 'all',
            assignee: 'all',
            search: ''
        }
    };
    
    // Sample data for initialization
    const sampleColumns = [
        { id: 1, name: 'Backlog', color: '#4361ee', wipLimit: null, taskIds: [1, 2] },
        { id: 2, name: 'To Do', color: '#4CAF50', wipLimit: 5, taskIds: [3] },
        { id: 3, name: 'In Progress', color: '#FF9800', wipLimit: 3, taskIds: [4] },
        { id: 4, name: 'Review', color: '#9c27b0', wipLimit: null, taskIds: [5] },
        { id: 5, name: 'Done', color: '#607d8b', wipLimit: null, taskIds: [6] }
    ];
    
    const sampleTasks = [
        {
            id: 1,
            title: 'Design homepage mockup',
            description: 'Create wireframes and mockups for the new homepage design',
            priority: 'high',
            dueDate: '2023-12-15',
            assignee: 'alex',
            tags: ['design', 'frontend'],
            columnId: 1,
            createdAt: new Date('2023-11-01'),
            updatedAt: new Date('2023-11-05')
        },
        {
            id: 2,
            title: 'Research competitor features',
            description: 'Analyze top 5 competitors and document key features',
            priority: 'medium',
            dueDate: '2023-11-30',
            assignee: 'sam',
            tags: ['research', 'analysis'],
            columnId: 1,
            createdAt: new Date('2023-11-02'),
            updatedAt: new Date('2023-11-03')
        },
        {
            id: 3,
            title: 'Implement user authentication',
            description: 'Build login, registration, and password reset functionality',
            priority: 'high',
            dueDate: '2023-12-10',
            assignee: 'jordan',
            tags: ['backend', 'security'],
            columnId: 2,
            createdAt: new Date('2023-11-05'),
            updatedAt: new Date('2023-11-08')
        },
        {
            id: 4,
            title: 'Write API documentation',
            description: 'Document all REST API endpoints with examples',
            priority: 'medium',
            dueDate: '2023-11-25',
            assignee: 'taylor',
            tags: ['documentation', 'backend'],
            columnId: 3,
            createdAt: new Date('2023-11-06'),
            updatedAt: new Date('2023-11-10')
        },
        {
            id: 5,
            title: 'Fix mobile responsiveness issues',
            description: 'Address CSS issues on mobile devices',
            priority: 'low',
            dueDate: '2023-11-20',
            assignee: 'alex',
            tags: ['frontend', 'bug'],
            columnId: 4,
            createdAt: new Date('2023-11-07'),
            updatedAt: new Date('2023-11-09')
        },
        {
            id: 6,
            title: 'Setup project repository',
            description: 'Initialize Git repository and setup CI/CD pipeline',
            priority: 'none',
            dueDate: '2023-11-05',
            assignee: 'jordan',
            tags: ['devops', 'setup'],
            columnId: 5,
            createdAt: new Date('2023-10-30'),
            updatedAt: new Date('2023-11-01')
        }
    ];
    
    // DOM Elements
    const elements = {
        // Theme toggler
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.querySelector('#themeToggle i'),
        
        // Search
        searchInput: document.getElementById('searchInput'),
        
        // Board controls
        newTaskBtn: document.getElementById('newTaskBtn'),
        addColumnBtn: document.getElementById('addColumnBtn'),
        resetBoardBtn: document.getElementById('resetBoardBtn'),
        exportBtn: document.getElementById('exportBtn'),
        initBoardBtn: document.getElementById('initBoardBtn'),
        
        // Filters
        priorityFilter: document.getElementById('priorityFilter'),
        assigneeFilter: document.getElementById('assigneeFilter'),
        clearFilters: document.getElementById('clearFilters'),
        
        // Board
        kanbanBoard: document.getElementById('kanbanBoard'),
        
        // Stats
        totalTasks: document.getElementById('totalTasks'),
        completedTasks: document.getElementById('completedTasks'),
        inProgressTasks: document.getElementById('inProgressTasks'),
        overdueTasks: document.getElementById('overdueTasks'),
        todayTasks: document.getElementById('todayTasks'),
        
        // Activity log
        activityLog: document.getElementById('activityLog'),
        
        // Modals
        taskModal: document.getElementById('taskModal'),
        columnModal: document.getElementById('columnModal'),
        shortcutsModal: document.getElementById('shortcutsModal'),
        
        // Task modal elements
        modalTitle: document.getElementById('modalTitle'),
        taskForm: document.getElementById('taskForm'),
        taskTitle: document.getElementById('taskTitle'),
        taskDescription: document.getElementById('taskDescription'),
        taskDueDate: document.getElementById('taskDueDate'),
        taskAssignee: document.getElementById('taskAssignee'),
        taskColumn: document.getElementById('taskColumn'),
        taskTags: document.getElementById('taskTags'),
        cancelTask: document.getElementById('cancelTask'),
        saveTask: document.getElementById('saveTask'),
        
        // Column modal elements
        columnModalTitle: document.getElementById('columnModalTitle'),
        columnForm: document.getElementById('columnForm'),
        columnName: document.getElementById('columnName'),
        columnLimit: document.getElementById('columnLimit'),
        cancelColumn: document.getElementById('cancelColumn'),
        saveColumn: document.getElementById('saveColumn'),
        
        // Shortcuts modal
        closeShortcuts: document.getElementById('closeShortcuts'),
        keyboardShortcuts: document.getElementById('keyboardShortcuts'),
        
        // Context menu
        contextMenu: document.getElementById('contextMenu'),
        
        // Toast
        toast: document.getElementById('toast')
    };
    
    // Assignee names mapping
    const assigneeNames = {
        'alex': 'Alex Johnson',
        'sam': 'Sam Davis',
        'jordan': 'Jordan Lee',
        'taylor': 'Taylor Smith'
    };
    
    // Initialize the application
    function init() {
        // Set theme
        setTheme(state.theme);
        
        // Load data from localStorage
        loadData();
        
        // Initialize event listeners
        initEventListeners();
        
        // Initialize filters
        updateAssigneeFilter();
        
        // Render the board
        renderBoard();
        
        // Update statistics
        updateStatistics();
        
        // Add initial activity log entry
        logActivity('Board loaded successfully');
        
        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();
        
        // Initialize keyboard shortcuts
        initKeyboardShortcuts();
    }
    
    // Set theme
    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('kanbanTheme', theme);
        
        // Update icon
        elements.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    // Load data from localStorage
    function loadData() {
        // Load columns
        const savedColumns = localStorage.getItem('kanbanColumns');
        if (savedColumns) {
            try {
                state.columns = JSON.parse(savedColumns);
                state.nextColumnId = state.columns.length > 0 ? 
                    Math.max(...state.columns.map(c => c.id)) + 1 : 1;
            } catch (e) {
                console.error('Error loading columns:', e);
                state.columns = [];
            }
        }
        
        // Load tasks
        const savedTasks = localStorage.getItem('kanbanTasks');
        if (savedTasks) {
            try {
                state.tasks = JSON.parse(savedTasks);
                // Convert date strings back to Date objects
                state.tasks.forEach(task => {
                    task.createdAt = new Date(task.createdAt);
                    task.updatedAt = new Date(task.updatedAt);
                });
                state.nextTaskId = state.tasks.length > 0 ? 
                    Math.max(...state.tasks.map(t => t.id)) + 1 : 1;
            } catch (e) {
                console.error('Error loading tasks:', e);
                state.tasks = [];
            }
        }
        
        // Load activity log
        const savedLog = localStorage.getItem('kanbanActivityLog');
        if (savedLog) {
            try {
                state.activityLog = JSON.parse(savedLog);
            } catch (e) {
                console.error('Error loading activity log:', e);
                state.activityLog = [];
            }
        }
        
        // If no data exists, show empty board
        if (state.columns.length === 0 && state.tasks.length === 0) {
            elements.initBoardBtn.style.display = 'block';
        } else {
            elements.initBoardBtn.style.display = 'none';
        }
    }
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('kanbanColumns', JSON.stringify(state.columns));
        localStorage.setItem('kanbanTasks', JSON.stringify(state.tasks));
        localStorage.setItem('kanbanActivityLog', JSON.stringify(state.activityLog));
    }
    
    // Log activity
    function logActivity(text) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const logEntry = {
            time: timeStr,
            text: text,
            timestamp: now.getTime()
        };
        
        state.activityLog.unshift(logEntry);
        
        // Keep only last 50 entries
        if (state.activityLog.length > 50) {
            state.activityLog.pop();
        }
        
        updateActivityLog();
        saveData();
    }
    
    // Update activity log display
    function updateActivityLog() {
        elements.activityLog.innerHTML = '';
        
        state.activityLog.slice(0, 10).forEach(entry => {
            const logElement = document.createElement('div');
            logElement.className = 'log-entry';
            logElement.innerHTML = `
                <span class="log-time">${entry.time}</span>
                <span class="log-text">${entry.text}</span>
            `;
            elements.activityLog.appendChild(logElement);
        });
    }
    
    // Initialize event listeners
    function initEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', () => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
        
        // Search
        elements.searchInput.addEventListener('input', (e) => {
            state.currentFilter.search = e.target.value.toLowerCase();
            filterTasks();
        });
        
        // New task button
        elements.newTaskBtn.addEventListener('click', showNewTaskModal);
        
        // Add column button
        elements.addColumnBtn.addEventListener('click', showNewColumnModal);
        
        // Reset board button
        elements.resetBoardBtn.addEventListener('click', resetBoard);
        
        // Export button
        elements.exportBtn.addEventListener('click', exportBoard);
        
        // Initialize sample board
        elements.initBoardBtn.addEventListener('click', initializeSampleBoard);
        
        // Filters
        elements.priorityFilter.addEventListener('change', (e) => {
            state.currentFilter.priority = e.target.value;
            filterTasks();
        });
        
        elements.assigneeFilter.addEventListener('change', (e) => {
            state.currentFilter.assignee = e.target.value;
            filterTasks();
        });
        
        elements.clearFilters.addEventListener('click', clearAllFilters);
        
        // Task modal
        elements.cancelTask.addEventListener('click', hideTaskModal);
        elements.taskForm.addEventListener('submit', saveTask);
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                hideTaskModal();
                hideColumnModal();
                hideShortcutsModal();
            });
        });
        
        // Column modal
        elements.cancelColumn.addEventListener('click', hideColumnModal);
        elements.columnForm.addEventListener('submit', saveColumn);
        
        // Shortcuts modal
        elements.keyboardShortcuts.addEventListener('click', showShortcutsModal);
        elements.closeShortcuts.addEventListener('click', hideShortcutsModal);
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target === elements.taskModal) hideTaskModal();
            if (e.target === elements.columnModal) hideColumnModal();
            if (e.target === elements.shortcutsModal) hideShortcutsModal();
        });
        
        // Close context menu when clicking outside
        document.addEventListener('click', () => {
            hideContextMenu();
        });
        
        // Initialize drag and drop
        initDragAndDrop();
    }
    
    // Initialize keyboard shortcuts
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }
            
            // Close modals with Escape
            if (e.key === 'Escape') {
                if (elements.taskModal.classList.contains('show')) hideTaskModal();
                if (elements.columnModal.classList.contains('show')) hideColumnModal();
                if (elements.shortcutsModal.classList.contains('show')) hideShortcutsModal();
                hideContextMenu();
            }
            
            // New task with N
            if (e.key === 'n' || e.key === 'N') {
                e.preventDefault();
                showNewTaskModal();
            }
            
            // New column with C
            if (e.key === 'c' || e.key === 'C') {
                e.preventDefault();
                showNewColumnModal();
            }
            
            // Focus search with F
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                elements.searchInput.focus();
                elements.searchInput.select();
            }
            
            // Save task with Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (elements.taskModal.classList.contains('show')) {
                    elements.saveTask.click();
                }
            }
            
            // Delete task with Delete
            if (e.key === 'Delete' && state.selectedTask) {
                e.preventDefault();
                deleteTask(state.selectedTask.id);
            }
        });
    }
    
    // Update assignee filter options
    function updateAssigneeFilter() {
        // Get unique assignees from tasks
        const assignees = new Set();
        state.tasks.forEach(task => {
            if (task.assignee) {
                assignees.add(task.assignee);
            }
        });
        
        // Update filter dropdown
        elements.assigneeFilter.innerHTML = '<option value="all">All Assignees</option>';
        
        assignees.forEach(assigneeId => {
            const option = document.createElement('option');
            option.value = assigneeId;
            option.textContent = assigneeNames[assigneeId] || assigneeId;
            elements.assigneeFilter.appendChild(option);
        });
    }
    
    // Filter tasks based on current filters
    function filterTasks() {
        const { priority, assignee, search } = state.currentFilter;
        
        if (priority === 'all' && assignee === 'all' && search === '') {
            state.filteredTasks = null;
        } else {
            state.filteredTasks = state.tasks.filter(task => {
                // Priority filter
                if (priority !== 'all' && task.priority !== priority) {
                    return false;
                }
                
                // Assignee filter
                if (assignee !== 'all' && task.assignee !== assignee) {
                    return false;
                }
                
                // Search filter
                if (search !== '') {
                    const searchLower = search.toLowerCase();
                    const titleMatch = task.title.toLowerCase().includes(searchLower);
                    const descMatch = task.description.toLowerCase().includes(searchLower);
                    const tagsMatch = task.tags.some(tag => tag.toLowerCase().includes(searchLower));
                    
                    if (!titleMatch && !descMatch && !tagsMatch) {
                        return false;
                    }
                }
                
                return true;
            });
        }
        
        renderBoard();
    }
    
    // Clear all filters
    function clearAllFilters() {
        state.currentFilter = {
            priority: 'all',
            assignee: 'all',
            search: ''
        };
        
        elements.priorityFilter.value = 'all';
        elements.assigneeFilter.value = 'all';
        elements.searchInput.value = '';
        
        state.filteredTasks = null;
        renderBoard();
    }
    
    // Render the entire board
    function renderBoard() {
        elements.kanbanBoard.innerHTML = '';
        
        if (state.columns.length === 0) {
            renderEmptyBoard();
            return;
        }
        
        // Render each column
        state.columns.forEach(column => {
            renderColumn(column);
        });
        
        // Add event listeners to column elements
        initColumnEventListeners();
    }
    
    // Render empty board state
    function renderEmptyBoard() {
        elements.kanbanBoard.innerHTML = `
            <div class="empty-board">
                <div class="empty-icon">
                    <i class="fas fa-columns"></i>
                </div>
                <h3>No columns yet</h3>
                <p>Click "Add Column" to create your first column and start organizing tasks.</p>
                <button id="initBoardBtn" class="btn-primary">
                    <i class="fas fa-rocket"></i> Initialize Sample Board
                </button>
            </div>
        `;
        
        // Re-attach event listener to init button
        document.getElementById('initBoardBtn').addEventListener('click', initializeSampleBoard);
    }
    
    // Render a single column
    function renderColumn(column) {
        // Get tasks for this column
        let columnTasks = state.tasks.filter(task => task.columnId === column.id);
        
        // Apply filters if active
        if (state.filteredTasks) {
            columnTasks = columnTasks.filter(task => 
                state.filteredTasks.some(ft => ft.id === task.id)
            );
        }
        
        // Sort tasks: high priority first, then by creation date
        columnTasks.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return a.createdAt - b.createdAt;
        });
        
        // Create column element
        const columnElement = document.createElement('div');
        columnElement.className = 'kanban-column';
        columnElement.setAttribute('data-column-id', column.id);
        columnElement.style.borderTopColor = column.color;
        
        // Check WIP limit
        const taskCount = state.tasks.filter(t => t.columnId === column.id).length;
        const isWipExceeded = column.wipLimit && taskCount > column.wipLimit;
        const isWipWarning = column.wipLimit && taskCount >= column.wipLimit * 0.8;
        
        // Column header
        columnElement.innerHTML = `
            <div class="column-header">
                <h3 class="column-title" data-column-id="${column.id}">${column.name}</h3>
                <div class="column-header-actions">
                    <button class="column-header-action edit-column" data-column-id="${column.id}" title="Edit column">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="column-header-action delete-column" data-column-id="${column.id}" title="Delete column">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="column-meta">
                <span class="column-task-count">${columnTasks.length} task${columnTasks.length !== 1 ? 's' : ''}</span>
                ${column.wipLimit ? 
                    `<span class="wip-limit ${isWipExceeded ? 'exceeded' : isWipWarning ? 'warning' : ''}">
                        ${taskCount}/${column.wipLimit}
                    </span>` : 
                    ''
                }
            </div>
            <div class="column-body ${columnTasks.length === 0 ? 'empty' : ''}" 
                 data-column-id="${column.id}"
                 ondragover="event.preventDefault()"
                 ondrop="window.app.handleDrop(event, ${column.id})">
                ${columnTasks.length === 0 ? 
                    '<div class="empty-column">No tasks</div>' : 
                    columnTasks.map(task => renderTaskCard(task)).join('')
                }
            </div>
            <div class="column-footer">
                <button class="add-task-btn" data-column-id="${column.id}">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            </div>
        `;
        
        elements.kanbanBoard.appendChild(columnElement);
        
        // Initialize task card event listeners
        if (columnTasks.length > 0) {
            initTaskCardEventListeners(columnElement);
        }
    }
    
    // Render a single task card
    function renderTaskCard(task) {
        // Get assignee name
        const assigneeName = task.assignee ? assigneeNames[task.assignee] || task.assignee : 'Unassigned';
        const assigneeInitials = assigneeName.split(' ').map(n => n[0]).join('').toUpperCase();
        
        // Format due date
        let dueDateDisplay = '';
        let dueDateClass = '';
        
        if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const timeDiff = dueDate.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff < 0) {
                dueDateDisplay = 'Overdue';
                dueDateClass = 'overdue';
            } else if (daysDiff === 0) {
                dueDateDisplay = 'Today';
                dueDateClass = 'today';
            } else if (daysDiff <= 7) {
                dueDateDisplay = `In ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`;
                dueDateClass = 'upcoming';
            } else {
                dueDateDisplay = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        }
        
        // Render tags
        const tagsHtml = task.tags && task.tags.length > 0 ? 
            `<div class="task-tags">${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}</div>` : '';
        
        return `
            <div class="task-card" 
                 data-task-id="${task.id}"
                 draggable="true"
                 ondragstart="window.app.handleDragStart(event, ${task.id})">
                <div class="task-card-header">
                    <div class="task-title">${task.title}</div>
                    <div class="task-priority ${task.priority}"></div>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                ${tagsHtml}
                <div class="task-footer">
                    <div class="task-meta">
                        ${task.assignee ? `
                            <div class="task-assignee">
                                <div class="assignee-avatar">${assigneeInitials}</div>
                                <span>${assigneeName}</span>
                            </div>
                        ` : ''}
                        ${task.dueDate ? `
                            <div class="task-due-date ${dueDateClass}">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${dueDateDisplay}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize column event listeners
    function initColumnEventListeners() {
        // Column title click to edit
        document.querySelectorAll('.column-title').forEach(title => {
            title.addEventListener('click', (e) => {
                const columnId = parseInt(e.target.getAttribute('data-column-id'));
                editColumn(columnId);
            });
        });
        
        // Edit column buttons
        document.querySelectorAll('.edit-column').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const columnId = parseInt(e.currentTarget.getAttribute('data-column-id'));
                editColumn(columnId);
            });
        });
        
        // Delete column buttons
        document.querySelectorAll('.delete-column').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const columnId = parseInt(e.currentTarget.getAttribute('data-column-id'));
                deleteColumn(columnId);
            });
        });
        
        // Add task buttons
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const columnId = parseInt(e.currentTarget.getAttribute('data-column-id'));
                showNewTaskModal(columnId);
            });
        });
    }
    
    // Initialize task card event listeners
    function initTaskCardEventListeners(columnElement) {
        // Task click to edit
        columnElement.querySelectorAll('.task-title').forEach(title => {
            title.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.closest('.task-card').getAttribute('data-task-id'));
                editTask(taskId);
            });
        });
        
        // Task right-click for context menu
        columnElement.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const taskId = parseInt(e.currentTarget.getAttribute('data-task-id'));
                showContextMenu(e, taskId);
            });
            
            // Task double-click to edit
            card.addEventListener('dblclick', (e) => {
                const taskId = parseInt(e.currentTarget.getAttribute('data-task-id'));
                editTask(taskId);
            });
        });
    }
    
    // Initialize drag and drop
    function initDragAndDrop() {
        // Global event handlers for drag and drop
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            // Highlight drop zones
            const column = e.target.closest('.column-body');
            if (column) {
                column.classList.add('column-dropzone');
            }
        });
        
        document.addEventListener('dragleave', (e) => {
            // Remove highlight from drop zones
            const column = e.target.closest('.column-body');
            if (column) {
                column.classList.remove('column-dropzone');
            }
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Remove highlight from all drop zones
            document.querySelectorAll('.column-body').forEach(col => {
                col.classList.remove('column-dropzone');
            });
        });
    }
    
    // Handle drag start
    window.app = window.app || {};
    window.app.handleDragStart = function(e, taskId) {
        e.dataTransfer.setData('text/plain', taskId.toString());
        e.dataTransfer.effectAllowed = 'move';
        
        // Add dragging class to task card
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            taskCard.classList.add('dragging');
        }
        
        logActivity(`Started dragging task #${taskId}`);
    };
    
    // Handle drop
    window.app.handleDrop = function(e, columnId) {
        e.preventDefault();
        
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(taskId)) return;
        
        // Remove dragging class from all task cards
        document.querySelectorAll('.task-card').forEach(card => {
            card.classList.remove('dragging');
        });
        
        // Move task to new column
        moveTaskToColumn(taskId, columnId);
        
        // Remove highlight from drop zone
        e.target.classList.remove('column-dropzone');
    };
    
    // Move task to a different column
    function moveTaskToColumn(taskId, columnId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const oldColumnId = task.columnId;
        
        // Don't move if already in the same column
        if (oldColumnId === columnId) return;
        
        // Check WIP limit for new column
        const newColumn = state.columns.find(c => c.id === columnId);
        if (newColumn && newColumn.wipLimit) {
            const tasksInColumn = state.tasks.filter(t => t.columnId === columnId).length;
            if (tasksInColumn >= newColumn.wipLimit) {
                showToast(`WIP limit (${newColumn.wipLimit}) exceeded for "${newColumn.name}"`, 'warning');
                return;
            }
        }
        
        // Update task
        task.columnId = columnId;
        task.updatedAt = new Date();
        
        // Save and re-render
        saveData();
        renderBoard();
        updateStatistics();
        
        // Log activity
        const oldColumn = state.columns.find(c => c.id === oldColumnId);
        const newColumnName = newColumn ? newColumn.name : 'Unknown';
        const oldColumnName = oldColumn ? oldColumn.name : 'Unknown';
        
        logActivity(`Moved "${task.title}" from ${oldColumnName} to ${newColumnName}`);
        
        showToast(`Task moved to ${newColumnName}`, 'success');
    }
    
    // Update statistics
    function updateStatistics() {
        const total = state.tasks.length;
        const completed = state.tasks.filter(t => {
            const doneColumn = state.columns.find(c => c.name.toLowerCase() === 'done');
            return doneColumn && t.columnId === doneColumn.id;
        }).length;
        
        const inProgress = state.tasks.filter(t => {
            const inProgressColumn = state.columns.find(c => 
                c.name.toLowerCase().includes('progress') || 
                c.name.toLowerCase().includes('doing')
            );
            return inProgressColumn && t.columnId === inProgressColumn.id;
        }).length;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const overdue = state.tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            return dueDate < today;
        }).length;
        
        const dueToday = state.tasks.filter(t => {
            if (!t.dueDate) return false;
            const dueDate = new Date(t.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
        }).length;
        
        // Update DOM
        elements.totalTasks.textContent = total;
        elements.completedTasks.textContent = completed;
        elements.inProgressTasks.textContent = inProgress;
        elements.overdueTasks.textContent = overdue;
        elements.todayTasks.textContent = dueToday;
    }
    
    // Show new task modal
    function showNewTaskModal(columnId = null) {
        elements.modalTitle.textContent = 'Add New Task';
        elements.taskForm.reset();
        
        // Set default priority
        document.getElementById('priority-none').checked = true;
        
        // Set today's date as default due date
        const today = new Date().toISOString().split('T')[0];
        elements.taskDueDate.value = today;
        
        // Populate column dropdown
        elements.taskColumn.innerHTML = '';
        state.columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.id;
            option.textContent = column.name;
            if (columnId && column.id === columnId) {
                option.selected = true;
            }
            elements.taskColumn.appendChild(option);
        });
        
        // If no column selected and there are columns, select first one
        if (!columnId && state.columns.length > 0) {
            elements.taskColumn.selectedIndex = 0;
        }
        
        // Clear selected task
        state.selectedTask = null;
        
        // Show modal
        elements.taskModal.classList.add('show');
        elements.taskTitle.focus();
    }
    
    // Edit task
    function editTask(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        elements.modalTitle.textContent = 'Edit Task';
        elements.taskForm.reset();
        
        // Fill form with task data
        elements.taskTitle.value = task.title;
        elements.taskDescription.value = task.description || '';
        elements.taskDueDate.value = task.dueDate || '';
        elements.taskAssignee.value = task.assignee || '';
        elements.taskTags.value = task.tags ? task.tags.join(', ') : '';
        
        // Set priority
        document.getElementById(`priority-${task.priority}`).checked = true;
        
        // Populate column dropdown
        elements.taskColumn.innerHTML = '';
        state.columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.id;
            option.textContent = column.name;
            if (column.id === task.columnId) {
                option.selected = true;
            }
            elements.taskColumn.appendChild(option);
        });
        
        // Set selected task
        state.selectedTask = task;
        
        // Show modal
        elements.taskModal.classList.add('show');
        elements.taskTitle.focus();
    }
    
    // Hide task modal
    function hideTaskModal() {
        elements.taskModal.classList.remove('show');
        state.selectedTask = null;
    }
    
    // Save task (new or edit)
    function saveTask(e) {
        e.preventDefault();
        
        // Get form data
        const title = elements.taskTitle.value.trim();
        if (!title) {
            showToast('Task title is required', 'warning');
            return;
        }
        
        const description = elements.taskDescription.value.trim();
        const dueDate = elements.taskDueDate.value;
        const assignee = elements.taskAssignee.value;
        const columnId = parseInt(elements.taskColumn.value);
        const tags = elements.taskTags.value.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // Get priority
        const priorityInput = document.querySelector('input[name="priority"]:checked');
        const priority = priorityInput ? priorityInput.value : 'none';
        
        if (state.selectedTask) {
            // Update existing task
            state.selectedTask.title = title;
            state.selectedTask.description = description;
            state.selectedTask.dueDate = dueDate;
            state.selectedTask.assignee = assignee;
            state.selectedTask.columnId = columnId;
            state.selectedTask.tags = tags;
            state.selectedTask.priority = priority;
            state.selectedTask.updatedAt = new Date();
            
            logActivity(`Updated task: "${title}"`);
            showToast('Task updated successfully', 'success');
        } else {
            // Create new task
            const newTask = {
                id: state.nextTaskId++,
                title,
                description,
                priority,
                dueDate,
                assignee,
                tags,
                columnId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            state.tasks.push(newTask);
            
            logActivity(`Created new task: "${title}"`);
            showToast('Task created successfully', 'success');
        }
        
        // Save data and update UI
        saveData();
        renderBoard();
        updateStatistics();
        updateAssigneeFilter();
        
        // Hide modal
        hideTaskModal();
    }
    
    // Delete task
    function deleteTask(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
            const taskIndex = state.tasks.findIndex(t => t.id === taskId);
            state.tasks.splice(taskIndex, 1);
            
            // Save data and update UI
            saveData();
            renderBoard();
            updateStatistics();
            
            logActivity(`Deleted task: "${task.title}"`);
            showToast('Task deleted successfully', 'success');
        }
    }
    
    // Show new column modal
    function showNewColumnModal() {
        elements.columnModalTitle.textContent = 'Add New Column';
        elements.columnForm.reset();
        
        // Set default color
        document.getElementById('color-blue').checked = true;
        
        // Show modal
        elements.columnModal.classList.add('show');
        elements.columnName.focus();
    }
    
    // Edit column
    function editColumn(columnId) {
        const column = state.columns.find(c => c.id === columnId);
        if (!column) return;
        
        elements.columnModalTitle.textContent = 'Edit Column';
        elements.columnForm.reset();
        
        // Fill form with column data
        elements.columnName.value = column.name;
        elements.columnLimit.value = column.wipLimit || '';
        
        // Set color
        const colorInput = document.querySelector(`input[name="columnColor"][value="${column.color}"]`);
        if (colorInput) {
            colorInput.checked = true;
        } else {
            document.getElementById('color-blue').checked = true;
        }
        
        // Set selected column (for context)
        state.selectedColumn = column;
        
        // Show modal
        elements.columnModal.classList.add('show');
        elements.columnName.focus();
    }
    
    // Hide column modal
    function hideColumnModal() {
        elements.columnModal.classList.remove('show');
        state.selectedColumn = null;
    }
    
    // Save column (new or edit)
    function saveColumn(e) {
        e.preventDefault();
        
        // Get form data
        const name = elements.columnName.value.trim();
        if (!name) {
            showToast('Column name is required', 'warning');
            return;
        }
        
        const colorInput = document.querySelector('input[name="columnColor"]:checked');
        const color = colorInput ? colorInput.value : '#4361ee';
        
        const wipLimit = elements.columnLimit.value ? parseInt(elements.columnLimit.value) : null;
        
        if (state.selectedColumn) {
            // Update existing column
            const oldName = state.selectedColumn.name;
            state.selectedColumn.name = name;
            state.selectedColumn.color = color;
            state.selectedColumn.wipLimit = wipLimit;
            
            logActivity(`Updated column: "${oldName}" to "${name}"`);
            showToast('Column updated successfully', 'success');
        } else {
            // Create new column
            const newColumn = {
                id: state.nextColumnId++,
                name,
                color,
                wipLimit,
                taskIds: []
            };
            
            state.columns.push(newColumn);
            
            logActivity(`Created new column: "${name}"`);
            showToast('Column created successfully', 'success');
        }
        
        // Save data and update UI
        saveData();
        renderBoard();
        
        // Hide modal
        hideColumnModal();
    }
    
    // Delete column
    function deleteColumn(columnId) {
        const column = state.columns.find(c => c.id === columnId);
        if (!column) return;
        
        // Check if column has tasks
        const columnTasks = state.tasks.filter(t => t.columnId === columnId);
        
        if (columnTasks.length > 0) {
            if (!confirm(`Column "${column.name}" contains ${columnTasks.length} task(s). Deleting it will also delete these tasks. Are you sure?`)) {
                return;
            }
            
            // Delete all tasks in this column
            state.tasks = state.tasks.filter(t => t.columnId !== columnId);
        }
        
        // Delete column
        const columnIndex = state.columns.findIndex(c => c.id === columnId);
        state.columns.splice(columnIndex, 1);
        
        // Save data and update UI
        saveData();
        renderBoard();
        updateStatistics();
        updateAssigneeFilter();
        
        logActivity(`Deleted column: "${column.name}"`);
        showToast('Column deleted successfully', 'success');
    }
    
    // Show context menu
    function showContextMenu(e, taskId) {
        e.preventDefault();
        
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        state.selectedTask = task;
        
        // Position context menu
        elements.contextMenu.style.left = `${e.pageX}px`;
        elements.contextMenu.style.top = `${e.pageY}px`;
        elements.contextMenu.classList.add('show');
        
        // Add event listeners to context menu items
        const contextItems = elements.contextMenu.querySelectorAll('li[data-action]');
        contextItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                handleContextAction(item.getAttribute('data-action'), taskId);
            });
        });
    }
    
    // Hide context menu
    function hideContextMenu() {
        elements.contextMenu.classList.remove('show');
    }
    
    // Handle context menu action
    function handleContextAction(action, taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        switch(action) {
            case 'edit':
                editTask(taskId);
                break;
                
            case 'duplicate':
                duplicateTask(taskId);
                break;
                
            case 'delete':
                deleteTask(taskId);
                break;
                
            case 'move-left':
                moveTaskLeft(taskId);
                break;
                
            case 'move-right':
                moveTaskRight(taskId);
                break;
                
            case 'high-priority':
                updateTaskPriority(taskId, 'high');
                break;
                
            case 'medium-priority':
                updateTaskPriority(taskId, 'medium');
                break;
                
            case 'low-priority':
                updateTaskPriority(taskId, 'low');
                break;
        }
        
        hideContextMenu();
    }
    
    // Duplicate task
    function duplicateTask(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const duplicatedTask = {
            ...JSON.parse(JSON.stringify(task)),
            id: state.nextTaskId++,
            title: `${task.title} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        state.tasks.push(duplicatedTask);
        
        // Save data and update UI
        saveData();
        renderBoard();
        updateStatistics();
        
        logActivity(`Duplicated task: "${task.title}"`);
        showToast('Task duplicated successfully', 'success');
    }
    
    // Move task left (to previous column)
    function moveTaskLeft(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const currentColumnIndex = state.columns.findIndex(c => c.id === task.columnId);
        if (currentColumnIndex <= 0) return;
        
        const newColumnId = state.columns[currentColumnIndex - 1].id;
        moveTaskToColumn(taskId, newColumnId);
    }
    
    // Move task right (to next column)
    function moveTaskRight(taskId) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const currentColumnIndex = state.columns.findIndex(c => c.id === task.columnId);
        if (currentColumnIndex >= state.columns.length - 1) return;
        
        const newColumnId = state.columns[currentColumnIndex + 1].id;
        moveTaskToColumn(taskId, newColumnId);
    }
    
    // Update task priority
    function updateTaskPriority(taskId, priority) {
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const oldPriority = task.priority;
        task.priority = priority;
        task.updatedAt = new Date();
        
        // Save data and update UI
        saveData();
        renderBoard();
        
        logActivity(`Changed priority of "${task.title}" from ${oldPriority} to ${priority}`);
        showToast(`Priority set to ${priority}`, 'success');
    }
    
    // Show shortcuts modal
    function showShortcutsModal() {
        elements.shortcutsModal.classList.add('show');
    }
    
    // Hide shortcuts modal
    function hideShortcutsModal() {
        elements.shortcutsModal.classList.remove('show');
    }
    
    // Initialize sample board
    function initializeSampleBoard() {
        if (confirm('This will replace your current board with sample data. Are you sure?')) {
            state.columns = JSON.parse(JSON.stringify(sampleColumns));
            state.tasks = JSON.parse(JSON.stringify(sampleTasks));
            state.nextTaskId = 7;
            state.nextColumnId = 6;
            state.activityLog = [];
            
            // Convert date strings back to Date objects
            state.tasks.forEach(task => {
                task.createdAt = new Date(task.createdAt);
                task.updatedAt = new Date(task.updatedAt);
            });
            
            // Save and render
            saveData();
            renderBoard();
            updateStatistics();
            updateAssigneeFilter();
            
            // Add activity log entry
            logActivity('Initialized sample board');
            
            showToast('Sample board initialized', 'success');
        }
    }
    
    // Reset board
    function resetBoard() {
        if (confirm('Are you sure you want to reset the board? This will delete all tasks and columns.')) {
            state.columns = [];
            state.tasks = [];
            state.nextTaskId = 1;
            state.nextColumnId = 1;
            state.activityLog = [];
            state.filteredTasks = null;
            state.currentFilter = {
                priority: 'all',
                assignee: 'all',
                search: ''
            };
            
            // Clear filters
            elements.priorityFilter.value = 'all';
            elements.assigneeFilter.value = 'all';
            elements.searchInput.value = '';
            
            // Save and render
            saveData();
            renderBoard();
            updateStatistics();
            
            // Add activity log entry
            logActivity('Reset board to empty state');
            
            showToast('Board reset successfully', 'success');
        }
    }
    
    // Export board data
    function exportBoard() {
        const data = {
            columns: state.columns,
            tasks: state.tasks.map(task => ({
                ...task,
                createdAt: task.createdAt.toISOString(),
                updatedAt: task.updatedAt.toISOString()
            })),
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `kanban-board-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        logActivity('Exported board data');
        showToast('Board data exported successfully', 'success');
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        const toast = elements.toast;
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');
        
        // Update content
        toastMessage.textContent = message;
        
        // Update icon based on type
        switch(type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle toast-icon';
                toast.style.backgroundColor = 'var(--success-color)';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle toast-icon';
                toast.style.backgroundColor = 'var(--warning-color)';
                break;
            case 'error':
                toastIcon.className = 'fas fa-times-circle toast-icon';
                toast.style.backgroundColor = 'var(--danger-color)';
                break;
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Initialize the app
    init();
});