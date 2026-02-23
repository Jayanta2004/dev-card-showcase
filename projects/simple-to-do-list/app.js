// Simple To-Do List App
// Add, edit, delete, complete tasks, stats, history

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListEl = document.getElementById('todo-list');
const editSection = document.getElementById('edit-section');
const editForm = document.getElementById('edit-form');
const editInput = document.getElementById('edit-input');
const cancelEditBtn = document.getElementById('cancel-edit');
const statsEl = document.getElementById('stats');
const historyListEl = document.getElementById('history-list');

let todos = [];
let history = [];
let editIdx = null;

// Add task
// ...existing code...
todoForm.addEventListener('submit', e => {
    e.preventDefault();
    const task = todoInput.value.trim();
    if (task) {
        todos.push({ task, completed: false, created: new Date().toLocaleString() });
        renderTodos();
        todoInput.value = '';
    }
});

// Render tasks
function renderTodos() {
    todoListEl.innerHTML = '';
    todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = todo.completed ? 'completed' : '';
        li.innerHTML = `<span>${todo.task}</span>`;
        // Complete button
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = todo.completed ? 'Undo' : 'Complete';
        completeBtn.onclick = () => {
            todo.completed = !todo.completed;
            renderTodos();
            logHistory(todo, todo.completed ? 'Completed' : 'Uncompleted');
        };
        li.appendChild(completeBtn);
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
            editSection.style.display = 'block';
            editInput.value = todo.task;
            editIdx = idx;
        };
        li.appendChild(editBtn);
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            logHistory(todo, 'Deleted');
            todos.splice(idx, 1);
            renderTodos();
        };
        li.appendChild(deleteBtn);
        todoListEl.appendChild(li);
    });
    renderStats();
}

// Edit task
editForm.addEventListener('submit', e => {
    e.preventDefault();
    if (editIdx !== null) {
        todos[editIdx].task = editInput.value.trim();
        logHistory(todos[editIdx], 'Edited');
        renderTodos();
        editSection.style.display = 'none';
        editIdx = null;
    }
});
cancelEditBtn.onclick = () => {
    editSection.style.display = 'none';
    editIdx = null;
};

// Stats
function renderStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    statsEl.innerHTML = `Total tasks: ${total}<br>Completed: ${completed}<br>Pending: ${total - completed}`;
}

// History
function logHistory(todo, action) {
    history.unshift(`${action}: "${todo.task}" at ${new Date().toLocaleString()}`);
    renderHistory();
}
function renderHistory() {
    historyListEl.innerHTML = '';
    history.slice(0, 10).forEach(h => {
        const li = document.createElement('li');
        li.textContent = h;
        historyListEl.appendChild(li);
    });
}

renderTodos();
renderHistory();
