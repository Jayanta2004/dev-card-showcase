// --- Monaco Editor Loader ---
let editor;
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
require(['vs/editor/editor.main'], function () {
  editor = monaco.editor.create(document.getElementById('editor'), {
    value: '// Start coding together!\n',
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 16,
    minimap: { enabled: false },
    automaticLayout: true
  });
});

// --- Socket.IO Setup ---
const socket = io('http://localhost:3050');
let userName = 'User' + Math.floor(Math.random() * 10000);

// Join room and announce user
socket.emit('join', { userName });

document.getElementById('user-list').textContent = 'You: ' + userName;

// --- Real-time Code Sync ---
function sendCodeUpdate() {
  if (editor) {
    socket.emit('code-update', { code: editor.getValue() });
  }
}

// Debounce code sending
let codeTimeout;
function onCodeChange() {
  clearTimeout(codeTimeout);
  codeTimeout = setTimeout(sendCodeUpdate, 200);
}

// Listen for local code changes
require(['vs/editor/editor.main'], function () {
  editor.onDidChangeModelContent(onCodeChange);
});

// Receive code updates
socket.on('code-update', ({ code }) => {
  if (editor && code !== editor.getValue()) {
    const pos = editor.getPosition();
    editor.setValue(code);
    editor.setPosition(pos);
  }
});

// --- User List ---
socket.on('user-list', ({ users }) => {
  document.getElementById('user-list').textContent = 'Online: ' + users.join(', ');
});

// --- Chat ---
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const msg = chatInput.value.trim();
  if (msg) {
    socket.emit('chat-message', { userName, message: msg });
    chatInput.value = '';
  }
});

socket.on('chat-message', ({ userName: from, message }) => {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${from}:</strong> ${message}`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
