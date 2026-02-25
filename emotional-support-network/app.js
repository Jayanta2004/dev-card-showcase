// Emotional Support Network (Demo: Local Peer Simulation)
// Author: EWOC Contributors
// Description: Connect users anonymously for peer-to-peer emotional support.

const nicknameSection = document.getElementById('nicknameSection');
const chatSection = document.getElementById('chatSection');
const joinBtn = document.getElementById('joinBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const peerInfo = document.getElementById('peerInfo');
const statusDiv = document.getElementById('status');

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
