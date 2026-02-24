// app.js - Skill Swap Platform
// LocalStorage keys: users, sessions, chats, currentUser
let users = JSON.parse(localStorage.getItem('users') || '[]');
let sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
let chats = JSON.parse(localStorage.getItem('chats') || '{}');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

const profileForm = document.getElementById('profile-form');
const usernameInput = document.getElementById('username');
const skillsOfferInput = document.getElementById('skills-offer');
const skillsSeekInput = document.getElementById('skills-seek');
const userList = document.getElementById('user-list');
const searchSkillInput = document.getElementById('search-skill');
const chatUsersDiv = document.getElementById('chat-users');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const scheduleForm = document.getElementById('schedule-form');
const sessionUserInput = document.getElementById('session-user');
const sessionTimeInput = document.getElementById('session-time');
const sessionTopicInput = document.getElementById('session-topic');
const sessionList = document.getElementById('session-list');

function saveState() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('sessions', JSON.stringify(sessions));
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

profileForm.onsubmit = e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const skillsOffer = skillsOfferInput.value.trim().split(',').map(s => s.trim()).filter(Boolean);
    const skillsSeek = skillsSeekInput.value.trim().split(',').map(s => s.trim()).filter(Boolean);
    if (!username || skillsOffer.length === 0 || skillsSeek.length === 0) return;
    let user = users.find(u => u.username === username);
    if (!user) {
        user = { username, skillsOffer, skillsSeek };
        users.push(user);
    } else {
        user.skillsOffer = skillsOffer;
        user.skillsSeek = skillsSeek;
    }
    currentUser = user;
    saveState();
    renderUserList();
    renderChatUsers();
    renderSessions();
};

function renderUserList() {
    userList.innerHTML = '';
    const search = searchSkillInput.value.trim().toLowerCase();
    users.filter(u => !currentUser || u.username !== currentUser.username).forEach(user => {
        if (
            !search ||
            user.skillsOffer.some(s => s.toLowerCase().includes(search)) ||
            user.skillsSeek.some(s => s.toLowerCase().includes(search))
        ) {
            const li = document.createElement('li');
            li.textContent = `${user.username} | Offers: ${user.skillsOffer.join(', ')} | Seeks: ${user.skillsSeek.join(', ')}`;
            li.onclick = () => selectChatUser(user.username);
            userList.appendChild(li);
        }
    });
}

searchSkillInput.oninput = renderUserList;

// Chat logic
let activeChatUser = null;
function renderChatUsers() {
    chatUsersDiv.innerHTML = '';
    users.filter(u => currentUser && u.username !== currentUser.username).forEach(user => {
        const span = document.createElement('span');
        span.textContent = user.username;
        span.className = (activeChatUser === user.username) ? 'active' : '';
        span.onclick = () => selectChatUser(user.username);
        chatUsersDiv.appendChild(span);
    });
}

function selectChatUser(username) {
    activeChatUser = username;
    renderChatUsers();
    renderChatWindow();
    chatForm.style.display = 'block';
}

function renderChatWindow() {
    chatWindow.innerHTML = '';
    if (!activeChatUser || !currentUser) return;
    const key = chatKey(currentUser.username, activeChatUser);
    const msgs = chats[key] || [];
    msgs.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'msg ' + (msg.from === currentUser.username ? 'me' : 'them');
        div.textContent = `${msg.from}: ${msg.text}`;
        chatWindow.appendChild(div);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function chatKey(u1, u2) {
    return [u1, u2].sort().join('::');
}

chatForm.onsubmit = e => {
    e.preventDefault();
    if (!activeChatUser || !currentUser) return;
    const text = chatInput.value.trim();
    if (!text) return;
    const key = chatKey(currentUser.username, activeChatUser);
    if (!chats[key]) chats[key] = [];
    chats[key].push({ from: currentUser.username, text, time: Date.now() });
    saveState();
    chatInput.value = '';
    renderChatWindow();
};

// Scheduling logic
scheduleForm.onsubmit = e => {
    e.preventDefault();
    if (!currentUser) return;
    const user = sessionUserInput.value.trim();
    const time = sessionTimeInput.value;
    const topic = sessionTopicInput.value.trim();
    if (!user || !time || !topic) return;
    sessions.push({ from: currentUser.username, to: user, time, topic });
    saveState();
    renderSessions();
    sessionUserInput.value = '';
    sessionTimeInput.value = '';
    sessionTopicInput.value = '';
};

function renderSessions() {
    sessionList.innerHTML = '';
    if (!currentUser) return;
    sessions.filter(s => s.from === currentUser.username || s.to === currentUser.username).forEach(s => {
        const li = document.createElement('li');
        li.textContent = `${s.from} ↔ ${s.to} | ${s.topic} | ${new Date(s.time).toLocaleString()}`;
        sessionList.appendChild(li);
    });
}

// Initial render
if (currentUser) {
    usernameInput.value = currentUser.username;
    skillsOfferInput.value = currentUser.skillsOffer.join(', ');
    skillsSeekInput.value = currentUser.skillsSeek.join(', ');
}
renderUserList();
renderChatUsers();
renderSessions();
