export class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        document.body.appendChild(this.container);

        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #notification-container {
                position: fixed;
                bottom: 20px;
                left: 30px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 1000;
                pointer-events: none;
            }
            
            .notification {
                background: rgba(10, 25, 47, 0.95);
                border-left: 4px solid #64ffda;
                color: #ccd6f6;
                padding: 12px 20px;
                border-radius: 4px;
                font-family: 'Segoe UI', sans-serif;
                font-size: 0.9rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.5);
                transform: translateX(-100%);
                animation: slideIn 0.3s forwards;
                backdrop-filter: blur(5px);
                max-width: 300px;
            }

            .notification.error {
                border-left-color: #ff5f5f;
            }

            .notification.info {
                border-left-color: #ffd700;
            }

            @keyframes slideIn {
                to { transform: translateX(0); }
            }

            @keyframes fadeOut {
                to { opacity: 0; transform: translateY(10px); }
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'success', duration = 3000) {
        const note = document.createElement('div');
        note.className = `notification ${type}`;
        note.textContent = message;

        this.container.appendChild(note);

        setTimeout(() => {
            note.style.animation = 'fadeOut 0.5s forwards';
            note.addEventListener('animationend', () => {
                note.remove();
            });
        }, duration);
    }

    success(msg) { this.show(msg, 'success'); }
    error(msg) { this.show(msg, 'error'); }
    info(msg) { this.show(msg, 'info'); }
}
