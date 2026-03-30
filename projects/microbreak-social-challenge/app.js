// Microbreak Social Challenge App
// Modular, well-commented code. Main SPA logic here.

const app = document.getElementById('app');

// Mock backend data
let users = [
  { username: 'alice', password: 'pass', breaks: 3, ideas: ['Stretch', 'Drink water'] },
  { username: 'bob', password: 'pass', breaks: 2, ideas: ['Walk', 'Meditate'] }
];
let challenges = [
  { from: 'alice', to: 'bob', idea: 'Stretch', status: 'pending' }
];
let currentUser = null;

function render() {
  app.innerHTML = '';
  if (!currentUser) {
    renderLogin();
  } else {
    renderDashboard();
  }
}

function renderLogin() {
  const div = document.createElement('div');
  div.innerHTML = `
    <h1>Microbreak Social Challenge</h1>
    <input id="login-username" placeholder="Username">
    <input id="login-password" type="password" placeholder="Password">
    <button id="login-btn">Login</button>
    <button id="register-btn">Register</button>
    <div id="login-error" style="color:red;"></div>
  `;
  app.appendChild(div);
  document.getElementById('login-btn').onclick = login;
  document.getElementById('register-btn').onclick = register;
}

function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    currentUser = user;
    render();
  } else {
    document.getElementById('login-error').textContent = 'Invalid credentials';
  }
}

function register() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  if (!username || !password) {
    document.getElementById('login-error').textContent = 'Enter username and password';
    return;
  }
  if (users.find(u => u.username === username)) {
    document.getElementById('login-error').textContent = 'Username already exists';
    return;
  }
  const user = { username, password, breaks: 0, ideas: [] };
  users.push(user);
  currentUser = user;
  render();
}

function renderDashboard() {
  const div = document.createElement('div');
  div.innerHTML = `
    <h2>Welcome, ${currentUser.username}!</h2>
    <button id="logout-btn">Logout</button>
    <h3>Your Breaks: ${currentUser.breaks}</h3>
    <button id="take-break-btn">Take a Microbreak</button>
    <h3>Challenge a Friend</h3>
    <select id="friend-select"></select>
    <input id="challenge-idea" placeholder="Break idea (e.g. Stretch)">
    <button id="send-challenge-btn">Send Challenge</button>
    <h3>Incoming Challenges</h3>
    <div id="incoming-challenges"></div>
    <h3>Creative Break Ideas</h3>
    <input id="new-idea" placeholder="Share a break idea">
    <button id="add-idea-btn">Add Idea</button>
    <div id="ideas-list"></div>
    <div class="leaderboard">
      <h3>Leaderboard</h3>
      <div id="leaderboard-list"></div>
    </div>
  `;
  app.appendChild(div);
  document.getElementById('logout-btn').onclick = () => { currentUser = null; render(); };
  document.getElementById('take-break-btn').onclick = takeBreak;
  document.getElementById('send-challenge-btn').onclick = sendChallenge;
  document.getElementById('add-idea-btn').onclick = addIdea;
  updateFriendSelect();
  renderIncomingChallenges();
  renderIdeas();
  renderLeaderboard();
}

function updateFriendSelect() {
  const select = document.getElementById('friend-select');
  select.innerHTML = '';
  users.filter(u => u.username !== currentUser.username).forEach(u => {
    const option = document.createElement('option');
    option.value = u.username;
    option.textContent = u.username;
    select.appendChild(option);
  });
}

function takeBreak() {
  currentUser.breaks++;
  render();
}

function sendChallenge() {
  const to = document.getElementById('friend-select').value;
  const idea = document.getElementById('challenge-idea').value;
  if (!to || !idea) return;
  challenges.push({ from: currentUser.username, to, idea, status: 'pending' });
  render();
}

function renderIncomingChallenges() {
  const div = document.getElementById('incoming-challenges');
  div.innerHTML = '';
  challenges.filter(c => c.to === currentUser.username && c.status === 'pending').forEach((c, i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <b>${c.from}</b> challenged you: <i>${c.idea}</i>
      <button onclick="acceptChallenge(${i})">Accept</button>
      <button onclick="declineChallenge(${i})">Decline</button>
    `;
    div.appendChild(card);
  });
}

window.acceptChallenge = function(i) {
  const challenge = challenges.filter(c => c.to === currentUser.username && c.status === 'pending')[i];
  if (challenge) {
    challenge.status = 'accepted';
    currentUser.breaks++;
    render();
  }
};

window.declineChallenge = function(i) {
  const challenge = challenges.filter(c => c.to === currentUser.username && c.status === 'pending')[i];
  if (challenge) {
    challenge.status = 'declined';
    render();
  }
};

function addIdea() {
  const idea = document.getElementById('new-idea').value;
  if (!idea) return;
  currentUser.ideas.push(idea);
  render();
}

function renderIdeas() {
  const div = document.getElementById('ideas-list');
  div.innerHTML = '';
  users.forEach(u => {
    u.ideas.forEach(idea => {
      const card = document.createElement('div');
      card.className = 'card';
      card.textContent = `${u.username}: ${idea}`;
      div.appendChild(card);
    });
  });
}

function renderLeaderboard() {
  const div = document.getElementById('leaderboard-list');
  div.innerHTML = '';
  users.sort((a, b) => b.breaks - a.breaks).forEach(u => {
    const card = document.createElement('div');
    card.className = 'card';
    card.textContent = `${u.username}: ${u.breaks} breaks`;
    div.appendChild(card);
  });
}

render();
