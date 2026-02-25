// OneOnOneSession Component
class OneOnOneSession {
    constructor(sessionId, container) {
        this.sessionId = sessionId;
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
            <div class="session-header">Session: ${this.sessionId}</div>
            <div class="session-messages" id="session-messages-${this.sessionId}"></div>
            <form class="session-form" id="session-form-${this.sessionId}">
                <input type="text" class="session-input" id="session-input-${this.sessionId}" placeholder="Type your message..." required>
                <button type="submit">Send</button>
            </form>
        `;
        this.messagesDiv = document.getElementById(`session-messages-${this.sessionId}`);
        this.form = document.getElementById(`session-form-${this.sessionId}`);
        this.input = document.getElementById(`session-input-${this.sessionId}`);
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage(this.input.value);
            this.input.value = '';
        });
    }

    loadMessages() {
        const stored = localStorage.getItem(`oneonone-session-${this.sessionId}`);
        if (stored) {
            this.messages = JSON.parse(stored);
        } else {
            // Sample data for demo
            this.messages = [
                { text: 'Hello, I am here to listen.', timestamp: new Date(Date.now()-3600000).toISOString(), self: false, avatar: '🦉' },
                { text: 'Thank you, I appreciate it.', timestamp: new Date(Date.now()-3500000).toISOString(), self: true, avatar: '🦁' },
                { text: 'How are you feeling today?', timestamp: new Date(Date.now()-3400000).toISOString(), self: false, avatar: '🦉' }
            ];
        }
        this.renderMessages();
    }

    saveMessages() {
        localStorage.setItem(`oneonone-session-${this.sessionId}`, JSON.stringify(this.messages));
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
            div.className = 'session-message ' + (m.self ? 'self' : 'peer');
            div.innerHTML = `<span class="avatar">${m.avatar || (m.self ? '🦁' : '🦉')}</span> <span>${m.text}</span>`;
            this.messagesDiv.appendChild(div);
        });
        this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
    }
}

export default OneOnOneSession;
