// Fragmented Collaboration Hub
const app = document.getElementById('app');

const sections = [
  { name: 'Tasks', icon: '📝', render: renderTasks },
  { name: 'Chat', icon: '💬', render: renderChat },
  { name: 'Docs', icon: '📄', render: renderDocs },
  { name: 'Files', icon: '📁', render: renderFiles }
];

let activeSection = 0;
let tasks = [];
let chat = [];
let docs = [];
let files = [];

function renderTabs() {
  return `<div class="tabs">${sections.map((s, i) => `<button class="tab${i===activeSection?' active':''}" onclick="switchSection(${i})">${s.icon} ${s.name}</button>`).join('')}</div>`;
}

function renderTasks() {
  return `
    <div>
      <h3>Team Tasks</h3>
      <input id="taskInput" placeholder="Add a task..." />
      <button onclick="addTask()">Add</button>
      <ul>${tasks.map((t,i)=>`<li>${t} <button onclick="removeTask(${i})">❌</button></li>`).join('')}</ul>
    </div>
  `;
}

function renderChat() {
  return `
    <div>
      <h3>Team Chat</h3>
      <textarea id="chatInput" placeholder="Type a message..."></textarea>
      <button onclick="sendChat()">Send</button>
      <div>${chat.map(c=>`<div><strong>${c.user}:</strong> ${c.msg}</div>`).join('')}</div>
    </div>
  `;
}

function renderDocs() {
  return `
    <div>
      <h3>Shared Docs</h3>
      <textarea id="docInput" placeholder="Add a note or doc..."></textarea>
      <button onclick="addDoc()">Add</button>
      <ul>${docs.map((d,i)=>`<li>${d} <button onclick="removeDoc(${i})">❌</button></li>`).join('')}</ul>
    </div>
  `;
}

function renderFiles() {
  return `
    <div>
      <h3>Files (Demo)</h3>
      <input id="fileInput" placeholder="File name..." />
      <button onclick="addFile()">Add</button>
      <ul>${files.map((f,i)=>`<li>${f} <button onclick="removeFile(${i})">❌</button></li>`).join('')}</ul>
    </div>
  `;
}

function renderSection() {
  app.innerHTML = renderTabs() + `<div class="section-content">${sections[activeSection].render()}</div>`;
}

window.switchSection = function(idx) {
  activeSection = idx;
  renderSection();
};

window.addTask = function() {
  const val = document.getElementById('taskInput').value.trim();
  if (val) tasks.push(val);
  renderSection();
};
window.removeTask = function(i) {
  tasks.splice(i,1);
  renderSection();
};
window.sendChat = function() {
  const val = document.getElementById('chatInput').value.trim();
  if (val) chat.push({user:'You',msg:val});
  renderSection();
};
window.addDoc = function() {
  const val = document.getElementById('docInput').value.trim();
  if (val) docs.push(val);
  renderSection();
};
window.removeDoc = function(i) {
  docs.splice(i,1);
  renderSection();
};
window.addFile = function() {
  const val = document.getElementById('fileInput').value.trim();
  if (val) files.push(val);
  renderSection();
};
window.removeFile = function(i) {
  files.splice(i,1);
  renderSection();
};

renderSection();
