// Social Pomodoro Challenge App
// Modular, well-commented code. Main SPA logic here.

const app = document.getElementById('app');

let users = [
  { username: 'alice', streak: 3 },
  { username: 'bob', streak: 5 },
  { username: 'carol', streak: 2 }
];
let currentUser = users[0];
let sessions = [
  { id: 1, users: ['alice', 'bob'], active: true, timer: 25 * 60, chat: [] }
];
let rewards = [
  { username: 'bob', reward: 'Gold Badge' },
  { username: 'alice', reward: 'Silver Badge' }
];

function render() {
  app.innerHTML = '';
  renderHeader();
  renderSession();
  renderStreaks();
  renderRewards();
  renderChat();
  renderControls();
}

function renderHeader() {
  const h = document.createElement('h1');
  h.textContent = 'Social Pomodoro Challenge';
  app.appendChild(h);
}

function renderSession() {
  const div = document.createElement('div');
  div.className = 'session';
  const session = sessions[0];
  div.innerHTML = `
    <h3>Current Session</h3>
    <div>Participants: ${session.users.join(', ')}</div>
    <div>Time Left: <span id="timer">${formatTime(session.timer)}</span></div>
    <button id="join-btn">Join Session</button>
    <button id="leave-btn">Leave Session</button>
  `;
  app.appendChild(div);
  document.getElementById('join-btn').onclick = joinSession;
  document.getElementById('leave-btn').onclick = leaveSession;
  startTimer();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

function startTimer() {
  const session = sessions[0];
  if (!session.active) return;
  setInterval(() => {
    if (session.timer > 0) {
      session.timer--;
      document.getElementById('timer').textContent = formatTime(session.timer);
    }
  }, 1000);
}

function joinSession() {
  const session = sessions[0];
  if (!session.users.includes(currentUser.username)) {
    session.users.push(currentUser.username);
    render();
  }
}

function leaveSession() {
  const session = sessions[0];
  session.users = session.users.filter(u => u !== currentUser.username);
  render();
}

function renderStreaks() {
  const div = document.createElement('div');
  div.innerHTML = `<h3>Streaks</h3>`;
  users.forEach(u => {
    const streakDiv = document.createElement('div');
    streakDiv.className = 'streak';
    streakDiv.textContent = `${u.username}: ${u.streak} days`;
    div.appendChild(streakDiv);
  });
  app.appendChild(div);
}

function renderRewards() {
  const div = document.createElement('div');
  div.innerHTML = `<h3>Rewards</h3>`;
  rewards.forEach(r => {
    const rewardDiv = document.createElement('div');
    rewardDiv.textContent = `${r.username}: ${r.reward}`;
    div.appendChild(rewardDiv);
  });
  app.appendChild(div);
}

function renderChat() {
  const div = document.createElement('div');
  div.className = 'chat';
  div.innerHTML = `<h3>Session Chat</h3><div id="chat-messages"></div><input id="chat-input" placeholder="Type a message"><button id="send-chat-btn">Send</button>`;
  app.appendChild(div);
  updateChat();
  document.getElementById('send-chat-btn').onclick = sendChat;
}

function updateChat() {
  const session = sessions[0];
  const chatDiv = document.getElementById('chat-messages');
  chatDiv.innerHTML = '';
  session.chat.forEach(msg => {
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `${msg.user}: ${msg.text}`;
    chatDiv.appendChild(msgDiv);
  });
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  sessions[0].chat.push({ user: currentUser.username, text });
  input.value = '';
  updateChat();
}

function renderControls() {
  const div = document.createElement('div');
  div.innerHTML = `<button id="start-session-btn">Start New Session</button>`;
  app.appendChild(div);
  document.getElementById('start-session-btn').onclick = startNewSession;
}

function startNewSession() {
  sessions.unshift({ id: Date.now(), users: [currentUser.username], active: true, timer: 25 * 60, chat: [] });
  render();
}

render();
