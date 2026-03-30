// Emotion-Driven To-Do List App
// Modular, well-commented code. Main SPA logic here.

const app = document.getElementById('app');

let tasks = [
  { text: 'Finish project report', priority: 'medium', done: false },
  { text: 'Take a walk', priority: 'low', done: false },
  { text: 'Reply to emails', priority: 'high', done: false }
];
let emotion = 'neutral'; // happy, sad, stressed, neutral

function render() {
  app.innerHTML = '';
  renderHeader();
  renderEmotionStatus();
  renderAddTask();
  renderTasks();
}

function renderHeader() {
  const h = document.createElement('h1');
  h.textContent = 'Emotion-Driven To-Do List';
  app.appendChild(h);
}

function renderEmotionStatus() {
  const div = document.createElement('div');
  div.id = 'emotion-status';
  div.textContent = `Current Mood: ${emotionLabel(emotion)}`;
  app.appendChild(div);
  // Simulate mood detection (random for demo)
  setTimeout(detectEmotion, 3000);
}

function emotionLabel(e) {
  if (e === 'happy') return '😊 Happy';
  if (e === 'sad') return '😢 Sad';
  if (e === 'stressed') return '😣 Stressed';
  return '😐 Neutral';
}

function renderAddTask() {
  const div = document.createElement('div');
  div.innerHTML = `
    <input id="task-input" placeholder="Add a new task">
    <button id="add-task-btn">Add Task</button>
  `;
  app.appendChild(div);
  document.getElementById('add-task-btn').onclick = addTask;
}

function addTask() {
  const input = document.getElementById('task-input');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ text, priority: 'medium', done: false });
  input.value = '';
  render();
}

function renderTasks() {
  // Sort tasks by priority (high > medium > low)
  const sorted = [...tasks].sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority));
  sorted.forEach((task, i) => {
    const div = document.createElement('div');
    div.className = `task priority-${task.priority}`;
    div.innerHTML = `
      <span style="text-decoration:${task.done ? 'line-through' : 'none'}">${task.text}</span>
      <div>
        <button onclick="toggleDone(${i})">${task.done ? 'Undo' : 'Done'}</button>
        <button onclick="editTask(${i})">Edit</button>
        <button onclick="deleteTask(${i})">Delete</button>
      </div>
    `;
    app.appendChild(div);
  });
}

window.toggleDone = function(i) {
  tasks[i].done = !tasks[i].done;
  render();
};

window.editTask = function(i) {
  const newText = prompt('Edit task:', tasks[i].text);
  if (newText !== null) {
    tasks[i].text = newText;
    render();
  }
};

window.deleteTask = function(i) {
  tasks.splice(i, 1);
  render();
};

function priorityValue(p) {
  if (p === 'high') return 3;
  if (p === 'medium') return 2;
  return 1;
}

function detectEmotion() {
  // Simulate mood detection (random for demo)
  const moods = ['happy', 'sad', 'stressed', 'neutral'];
  emotion = moods[Math.floor(Math.random() * moods.length)];
  adaptPriorities();
  render();
}

function adaptPriorities() {
  // Example: if stressed, lower priority of non-urgent tasks
  if (emotion === 'stressed') {
    tasks.forEach(t => {
      if (t.priority === 'high') t.priority = 'medium';
      else if (t.priority === 'medium') t.priority = 'low';
    });
  } else if (emotion === 'happy') {
    tasks.forEach(t => {
      if (t.priority === 'low') t.priority = 'medium';
      else if (t.priority === 'medium') t.priority = 'high';
    });
  } else if (emotion === 'sad') {
    tasks.forEach(t => {
      if (t.priority === 'high') t.priority = 'medium';
    });
  } else {
    // Neutral: reset to medium
    tasks.forEach(t => t.priority = 'medium');
  }
}

render();
