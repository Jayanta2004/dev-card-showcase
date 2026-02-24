// app.js - Virtual Study Room
// LocalStorage keys: rooms, stats
let rooms = JSON.parse(localStorage.getItem('rooms') || '{}');
let stats = JSON.parse(localStorage.getItem('stats') || '{}');
let currentRoom = null;
let currentUser = '';
let timer = null;
let timerSeconds = 0;
let timerRunning = false;

const usernameInput = document.getElementById('username');
const roomNameInput = document.getElementById('room-name');
const createRoomBtn = document.getElementById('create-room');
const joinRoomBtn = document.getElementById('join-room');
const currentRoomDiv = document.getElementById('current-room');
const studySection = document.getElementById('study-section');
const timerMinutesInput = document.getElementById('timer-minutes');
const startTimerBtn = document.getElementById('start-timer');
const pauseTimerBtn = document.getElementById('pause-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const timerDisplay = document.getElementById('timer-display');
const ambientSelect = document.getElementById('ambient-select');
const playAmbientBtn = document.getElementById('play-ambient');
const stopAmbientBtn = document.getElementById('stop-ambient');
const ambientAudio = document.getElementById('ambient-audio');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const statsDiv = document.getElementById('stats');

function saveState() {
    localStorage.setItem('rooms', JSON.stringify(rooms));
    localStorage.setItem('stats', JSON.stringify(stats));
}

function showRoom(room) {
    currentRoom = room;
    currentRoomDiv.textContent = `In room: ${room}`;
    studySection.style.display = '';
    renderChat();
    renderStats();
}

createRoomBtn.onclick = () => {
    const user = usernameInput.value.trim();
    const room = roomNameInput.value.trim();
    if (!user || !room) return;
    if (!rooms[room]) rooms[room] = { users: [], chat: [] };
    if (!rooms[room].users.includes(user)) rooms[room].users.push(user);
    currentUser = user;
    saveState();
    showRoom(room);
};

joinRoomBtn.onclick = () => {
    const user = usernameInput.value.trim();
    const room = roomNameInput.value.trim();
    if (!user || !room) return;
    if (!rooms[room]) {
        alert('Room does not exist. Create it first.');
        return;
    }
    if (!rooms[room].users.includes(user)) rooms[room].users.push(user);
    currentUser = user;
    saveState();
    showRoom(room);
};

// Timer logic
function updateTimerDisplay() {
    const min = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const sec = (timerSeconds % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;
}

startTimerBtn.onclick = () => {
    if (timerRunning) return;
    timerRunning = true;
    if (timerSeconds === 0) timerSeconds = parseInt(timerMinutesInput.value) * 60;
    timer = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            clearInterval(timer);
            timerRunning = false;
            addStatSession();
            alert('Session complete!');
        }
    }, 1000);
};

pauseTimerBtn.onclick = () => {
    timerRunning = false;
    clearInterval(timer);
};

resetTimerBtn.onclick = () => {
    timerRunning = false;
    clearInterval(timer);
    timerSeconds = parseInt(timerMinutesInput.value) * 60;
    updateTimerDisplay();
};

timerMinutesInput.oninput = () => {
    if (!timerRunning) {
        timerSeconds = parseInt(timerMinutesInput.value) * 60;
        updateTimerDisplay();
    }
};

// Ambient sounds
const ambientSources = {
    rain: 'https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae7e2.mp3',
    cafe: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7b7b.mp3',
    forest: 'https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7b7b.mp3'
};

playAmbientBtn.onclick = () => {
    const val = ambientSelect.value;
    if (ambientSources[val]) {
        ambientAudio.src = ambientSources[val];
        ambientAudio.play();
    }
};

stopAmbientBtn.onclick = () => {
    ambientAudio.pause();
    ambientAudio.currentTime = 0;
};

// Chat logic
function renderChat() {
    if (!currentRoom) return;
    chatWindow.innerHTML = '';
    const chat = rooms[currentRoom].chat || [];
    chat.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'msg ' + (msg.user === currentUser ? 'me' : 'them');
        div.textContent = `${msg.user}: ${msg.text}`;
        chatWindow.appendChild(div);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.onsubmit = e => {
    e.preventDefault();
    if (!currentRoom || !currentUser) return;
    const text = chatInput.value.trim();
    if (!text) return;
    rooms[currentRoom].chat.push({ user: currentUser, text, time: Date.now() });
    saveState();
    chatInput.value = '';
    renderChat();
};

// Stats logic
function addStatSession() {
    if (!currentUser) return;
    if (!stats[currentUser]) stats[currentUser] = { sessions: 0, minutes: 0 };
    stats[currentUser].sessions++;
    stats[currentUser].minutes += parseInt(timerMinutesInput.value);
    saveState();
    renderStats();
}

function renderStats() {
    if (!currentUser || !stats[currentUser]) {
        statsDiv.innerHTML = '<p>No stats yet.</p>';
        return;
    }
    const s = stats[currentUser];
    statsDiv.innerHTML = `<p>Sessions: ${s.sessions}</p><p>Total Minutes: ${s.minutes}</p>`;
}

// Initial state
updateTimerDisplay();
