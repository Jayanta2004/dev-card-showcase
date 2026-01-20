class DroidOS {
    constructor() {
        this.state = {
            screen: 'boot',
            theme: localStorage.getItem('droid_theme') || 'light',
            wifi: true,
            openApps: [],
            activeApp: null
        };
        
        document.addEventListener('DOMContentLoaded', () => this.init());
    }

    init() {
        this.applyTheme();
        this.startClock();
        
        // Boot Delay
        setTimeout(() => {
            this.switchScreen('lock');
        }, 2000);

        // Global Event Listeners
        document.getElementById('status-bar').addEventListener('click', () => this.toggleShade());
    }

    // --- SCREEN MANAGEMENT ---
    switchScreen(screenName) {
        document.querySelectorAll('.layer').forEach(el => {
            el.classList.remove('active');
            if(el.id !== 'app-container') el.classList.add('hidden');
        });

        const target = document.getElementById(`${screenName}-screen`);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
        this.state.screen = screenName;
    }

    unlock() {
        if(this.state.screen === 'lock') {
            this.switchScreen('home');
        }
    }

    // --- SYSTEM UTILITIES ---
    startClock() {
        const update = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
            
            const els = ['clock-status', 'lock-time'];
            els.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.innerText = timeStr;
            });
            
            const dateEl = document.getElementById('lock-date');
            if(dateEl) dateEl.innerText = dateStr;

            // Battery Simulation
            const batt = Math.max(10, 100 - Math.floor((Date.now() / 60000) % 90));
            document.getElementById('battery-level').innerText = `${batt}%`;
        };
        setInterval(update, 1000);
        update();
    }

    toggleShade() {
        document.getElementById('notification-shade').classList.toggle('open');
    }

    clearNotifs() {
        document.getElementById('notif-list').innerHTML = '<div style="padding:10px; opacity:0.5; text-align:center">No new notifications</div>';
    }

    // --- THEME & SETTINGS ---
    applyTheme() {
        document.body.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('droid_theme', this.state.theme);
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    }

    toggleWifi() {
        this.state.wifi = !this.state.wifi;
        document.getElementById('wifi-icon').style.opacity = this.state.wifi ? '1' : '0.3';
    }

    // --- NAVIGATION API (Used by Gestures) ---
    goHome() {
        if (this.state.activeApp) {
            const appEl = document.getElementById(`app-${this.state.activeApp}`);
            if(appEl) appEl.classList.remove('open');
            this.state.activeApp = null;
        }
        document.getElementById('app-drawer').classList.remove('open');
        document.getElementById('recents-screen').classList.remove('active');
        this.switchScreen('home');
    }

    goBack() {
        if (this.state.activeApp) {
            this.goHome();
        } else if (document.getElementById('app-drawer').classList.contains('open')) {
            document.getElementById('app-drawer').classList.remove('open');
        } else if (document.getElementById('recents-screen').classList.contains('active')) {
            document.getElementById('recents-screen').classList.remove('active');
        }
    }

    showRecents() {
        if (this.state.activeApp) {
             document.getElementById(`app-${this.state.activeApp}`).classList.remove('open');
             this.state.activeApp = null;
        }
        
        const recents = document.getElementById('recents-screen');
        recents.innerHTML = '';
        
        if(this.state.openApps.length === 0) {
            recents.innerHTML = '<span style="color:white; margin:auto;">No recent apps</span>';
        }

        this.state.openApps.forEach(appId => {
            const app = appManager.apps[appId];
            const card = document.createElement('div');
            card.className = 'recent-card';
            card.innerHTML = `
                <div class="app-header"><span>${app.icon} ${app.name}</span></div>
                <div style="flex:1; background:var(--bg-color); opacity:0.5; margin-top:10px; border-radius:5px;"></div>
                <button class="close-app-btn" data-id="${appId}">X</button>
            `;
            
            // Event Delegation for Recents
            card.addEventListener('click', (e) => {
                if(e.target.classList.contains('close-app-btn')) {
                    e.stopPropagation();
                    appManager.closeApp(appId);
                } else {
                    appManager.openApp(appId);
                }
            });
            recents.appendChild(card);
        });
        
        recents.classList.add('active');
    }
}

const os = new DroidOS();