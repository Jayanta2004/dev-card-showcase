// ChatRoom Component
class ChatRoom {
    constructor(roomId, container) {
        this.roomId = roomId;
        this.container = container;
        this.messages = [];
        this.init();
    }

    init() {
        this.render();
        this.loadMessages();
    }

    render() {
        this.container.innerHTML = `
            <div class="chat-header">Room: ${this.roomId}</div>
            <div class="chat-messages" id="chat-messages-${this.roomId}"></div>
            <form class="chat-form" id="chat-form-${this.roomId}">
                <input type="text" class="chat-input" id="chat-input-${this.roomId}" placeholder="Type your message..." required>
                <button type="submit">Send</button>
            </form>
        `;
        this.messagesDiv = document.getElementById(`chat-messages-${this.roomId}`);
        this.form = document.getElementById(`chat-form-${this.roomId}`);
        this.input = document.getElementById(`chat-input-${this.roomId}`);
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage(this.input.value);
            this.input.value = '';
        });
    }

    loadMessages() {
        const stored = localStorage.getItem(`chat-room-${this.roomId}`);
        if (stored) {
            this.messages = JSON.parse(stored);
        } else {
            // Sample data for demo
            this.messages = [
                { text: 'Welcome to the chat room!', timestamp: new Date(Date.now()-3600000).toISOString(), self: false, avatar: '🦊' },
                { text: 'Feel free to share your thoughts.', timestamp: new Date(Date.now()-3500000).toISOString(), self: false, avatar: '🐼' },
                { text: 'Hi everyone!', timestamp: new Date(Date.now()-3400000).toISOString(), self: true, avatar: '🦁' }
            ];
        }
        this.renderMessages();
    }

    saveMessages() {
        localStorage.setItem(`chat-room-${this.roomId}`, JSON.stringify(this.messages));
    }

    sendMessage(msg) {
        if (msg.trim()) {
            this.messages.push({ text: msg, timestamp: new Date().toISOString() });
            this.saveMessages();
            this.renderMessages();
        }
    }

    renderMessages() {
        this.messagesDiv.innerHTML = '';
        this.messages.forEach(m => {
            const div = document.createElement('div');
            div.className = 'message ' + (m.self ? 'self' : 'peer');
            div.innerHTML = `<span class="avatar">${m.avatar || (m.self ? '🦁' : '🦊')}</span> <span>${m.text}</span>`;
            this.messagesDiv.appendChild(div);
        });
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }
}

export default ChatRoom;
