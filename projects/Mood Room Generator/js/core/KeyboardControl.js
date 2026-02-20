/**
 * KeyboardControl.js
 * Handles keyboard shortcuts for the application.
 * Mapped keys:
 * 1-6: Switch Moods
 * M: Toggle Mute
 * S: Toggle Settings
 */
export default class KeyboardControl {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            // Ignore if focus is in an input (if we had any text inputs)
            if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;

            switch (e.key.toLowerCase()) {
                case '1':
                    this.eventBus.emit('requestMood', 'Calm');
                    break;
                case '2':
                    this.eventBus.emit('requestMood', 'Focus');
                    break;
                case '3':
                    this.eventBus.emit('requestMood', 'Sad');
                    break;
                case '4':
                    this.eventBus.emit('requestMood', 'Happy');
                    break;
                case '5':
                    this.eventBus.emit('requestMood', 'Chaos');
                    break;
                case '6':
                    this.eventBus.emit('requestMood', 'Mystery');
                    break;
                case 'm':
                    this.eventBus.emit('toggleMute');
                    break;
                case 's':
                    this.eventBus.emit('toggleSettings');
                    break;
            }
        });
    }
}
