/**
 * main.js
 * Application Entry Point.
 */
import EventBus from './core/EventBus.js';
import StateManager from './core/StateManager.js';
import SceneManager from './engine/SceneManager.js';
import ParticleSystem from './engine/ParticleSystem.js';
import LightingEngine from './engine/LightingEngine.js';
import SoundEngine from './engine/SoundEngine.js';
import SettingsPanel from './ui/SettingsPanel.js';
import KeyboardControl from './core/KeyboardControl.js';

// Mood Configs
import CalmMood from './moods/CalmMood.js';
import FocusMood from './moods/FocusMood.js';
import SadMood from './moods/SadMood.js';
import HappyMood from './moods/HappyMood.js';
import ChaosMood from './moods/ChaosMood.js';
import MysteryMood from './moods/MysteryMood.js';

class App {
    constructor() {
        this.eventBus = new EventBus();
        this.state = new StateManager(this.eventBus);
        this.scene = new SceneManager(this.eventBus);
        this.particles = new ParticleSystem('particles-container');
        this.lighting = new LightingEngine(this.eventBus);
        this.sound = new SoundEngine(this.eventBus);
        this.settings = new SettingsPanel(this.eventBus);
        this.keyboard = new KeyboardControl(this.eventBus);

        this.moods = {
            'Calm': CalmMood,
            'Focus': FocusMood,
            'Sad': SadMood,
            'Happy': HappyMood,
            'Chaos': ChaosMood,
            'Mystery': MysteryMood
        };

        this.init();
    }

    init() {
        this.bindEvents();
        // default mood
        this.setMood('Calm');
    }

    bindEvents() {
        // UI Drag/Click events
        const buttons = document.querySelectorAll('.mood-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = e.currentTarget.dataset.mood;
                this.setMood(mood);

                // Update active state in UI
                buttons.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Listen for internal state changes if needed
        this.eventBus.on('moodChange', (data) => {
            this.handleMoodChange(data);
        });

        // EventBus listeners
        this.eventBus.on('moodChange', (data) => {
            this.handleMoodChange(data);
            this.updateUI(data.current);
        });

        this.eventBus.on('requestMood', (moodName) => {
            this.setMood(moodName);
        });

        this.eventBus.on('toggleMute', () => {
            if (this.sound) this.sound.toggleMute();
        });

        this.eventBus.on('toggleSettings', () => {
            if (this.settings) this.settings.toggleBtn.click(); // Quick hack to trigger UI
        });
    }

    updateUI(moodName) {
        const buttons = document.querySelectorAll('.mood-btn');
        buttons.forEach(b => {
            if (b.dataset.mood === moodName) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }

    setMood(moodName) {
        if (!this.moods[moodName]) return;
        this.state.setMood(moodName);
    }

    handleMoodChange({ current }) {
        const MoodClass = this.moods[current];
        if (!MoodClass) return;

        const config = MoodClass.config;

        // Update Scene (Colors, Lighting)
        this.scene.applyMood(config);

        // Update Particles
        if (config.particles) {
            this.particles.start(config.particles.class, config.particles.options);
        } else {
            this.particles.stop();
        }
    }
}

// Start App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
