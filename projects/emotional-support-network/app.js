// Emotional Support Network (Demo: Local Peer Simulation)
// Author: EWOC Contributors
// Description: Connect users anonymously for peer-to-peer emotional support.

import ChatRoom from './components/ChatRoom.js';
import OneOnOneSession from './components/OneOnOneSession.js';
import Moderation from './components/Moderation.js';
import Resources from './components/Resources.js';
import Matching from './components/Matching.js';
import ChatRoomList from './components/ChatRoomList.js';
import Auth from './utils/auth.js';

const navChatRoom = document.getElementById('navChatRoom');
const navOneOnOne = document.getElementById('navOneOnOne');
const navModeration = document.getElementById('navModeration');
const navResources = document.getElementById('navResources');
const navMatching = document.getElementById('navMatching');

const chatRoomSection = document.getElementById('chatRoomSection');
const oneOnOneSection = document.getElementById('oneOnOneSection');
const moderationSection = document.getElementById('moderationSection');
const resourcesSection = document.getElementById('resourcesSection');
const matchingSection = document.getElementById('matchingSection');

function showSection(section) {
    [chatRoomSection, oneOnOneSection, moderationSection, resourcesSection, matchingSection].forEach(s => s.classList.remove('active'));
    section.classList.add('active');
}

navChatRoom.addEventListener('click', () => showSection(chatRoomSection));
navOneOnOne.addEventListener('click', () => showSection(oneOnOneSection));
navModeration.addEventListener('click', () => showSection(moderationSection));
navResources.addEventListener('click', () => showSection(resourcesSection));
navMatching.addEventListener('click', () => showSection(matchingSection));

// Initialize components
const chatRoomListDiv = document.createElement('div');
chatRoomSection.appendChild(chatRoomListDiv);
let currentRoom = 'main';
const chatRoom = new ChatRoom(currentRoom, chatRoomSection);
const chatRoomList = new ChatRoomList(chatRoomListDiv, (room) => {
    currentRoom = room;
    chatRoom.roomId = room;
    chatRoom.init();
});

const oneOnOne = new OneOnOneSession('session1', oneOnOneSection);
const moderation = new Moderation(moderationSection);
const resources = new Resources(resourcesSection);
const matching = new Matching(matchingSection);

// User authentication
let user = null;
function handleLogin(nickname) {
    user = Auth.login(nickname);
    statusDiv.textContent = `Logged in as ${user.nickname}`;
}
function handleLogout() {
    Auth.logout();
    user = null;
    statusDiv.textContent = 'Logged out.';
}
// Example login flow
navChatRoom.addEventListener('click', () => {
    if (!user) handleLogin(prompt('Enter nickname for login:') || randomNickname());
    showSection(chatRoomSection);
});
navOneOnOne.addEventListener('click', () => {
    if (!user) handleLogin(prompt('Enter nickname for login:') || randomNickname());
    showSection(oneOnOneSection);
});

// Show chat room by default
showSection(chatRoomSection);

let nickname = '';
let peerNickname = '';
let connected = false;
let messages = [];

function randomNickname() {
    const animals = ['Otter', 'Robin', 'Fox', 'Panda', 'Koala', 'Swan', 'Wolf', 'Dove', 'Hawk', 'Seal', 'Fawn', 'Bear', 'Finch', 'Lynx', 'Mole', 'Wren'];
    return 'Anon' + animals[Math.floor(Math.random() * animals.length)] + Math.floor(Math.random() * 1000);
}

function connectPeer() {
    // Demo: Simulate random peer
    peerNickname = randomNickname();
    connected = true;
    messages = [];
    peerInfo.textContent = `You are chatting with: ${peerNickname}`;
    chatBox.innerHTML = '';
    statusDiv.textContent = 'Connected! You can now chat.';
}

function disconnectPeer() {
    connected = false;
    peerNickname = '';
    chatBox.innerHTML = '';
    chatSection.classList.add('hidden');
    nicknameSection.classList.remove('hidden');
    statusDiv.textContent = 'Disconnected. You can join again.';
}

function renderMessages() {
    chatBox.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message ' + (msg.self ? 'self' : 'peer');
        div.textContent = msg.text;
        chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
}

joinBtn.addEventListener('click', () => {
    nickname = document.getElementById('nickname').value.trim() || randomNickname();
    connectPeer();
    nicknameSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
    renderMessages();
});

disconnectBtn.addEventListener('click', disconnectPeer);

chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!connected) return;
    const text = chatInput.value.trim();
    if (!text) return;
    messages.push({ text, self: true });
    renderMessages();
    chatInput.value = '';
    // Demo: Simulate peer reply after 1-2s
    setTimeout(() => {
        if (!connected) return;
        const responses = [
            "I'm here for you.",
            "That sounds tough. Want to talk more?",
            "You're not alone.",
            "Sending you positive vibes!",
            "Thank you for sharing.",
            "How are you feeling now?",
            "Would you like to share more?",
            "Remember to take care of yourself."
        ];
        const reply = responses[Math.floor(Math.random() * responses.length)];
        messages.push({ text: reply, self: false });
        renderMessages();
    }, 1000 + Math.random() * 1000);
});
