class AppManager {
    constructor() {
        this.apps = {
            'calc': { name: 'Calculator', icon: '🧮', render: this.renderCalc },
            'clock': { name: 'Clock', icon: '⏰', render: this.renderClock },
            'notes': { name: 'Notes', icon: '📝', render: this.renderNotes },
            'camera': { name: 'Camera', icon: '📸', render: this.renderCamera },
            'settings': { name: 'Settings', icon: '⚙️', render: this.renderSettings },
            'browser': { name: 'Browser', icon: '🌐', render: () => '<div style="padding:20px; text-align:center;">Simulated Browser<br>(Offline Mode)</div>' }
        };
        
        // Wait for OS to be ready then render icons
        setTimeout(() => this.renderIcons(), 100);
    }

    renderIcons() {
        const homeGrid = document.getElementById('home-grid');
        const drawerGrid = document.getElementById('drawer-grid');
        if(!homeGrid) return; 

        homeGrid.innerHTML = '';
        drawerGrid.innerHTML = '';

        Object.keys(this.apps).forEach(key => {
            const app = this.apps[key];
            const iconHtml = `
                <div class="app-icon-wrapper" onclick="appManager.openApp('${key}')">
                    <div class="app-icon">${app.icon}</div>
                    <div class="app-name">${app.name}</div>
                </div>
            `;
            drawerGrid.innerHTML += iconHtml;
            // Home screen apps
            if (['calc', 'camera', 'notes', 'settings'].includes(key)) {
                homeGrid.innerHTML += iconHtml;
            }
        });
        
        // App Drawer Trigger on Home
        homeGrid.innerHTML += `
             <div class="app-icon-wrapper" onclick="document.getElementById('app-drawer').classList.add('open')">
                <div class="app-icon" style="background:#ddd; color:#333;">⋮⋮⋮</div>
                <div class="app-name">Apps</div>
            </div>
        `;
    }

    openApp(id) {
        document.getElementById('app-drawer').classList.remove('open');
        document.getElementById('recents-screen').classList.remove('active');

        let appWindow = document.getElementById(`app-${id}`);
        
        if (!appWindow) {
            const container = document.getElementById('app-container');
            appWindow = document.createElement('div');
            appWindow.id = `app-${id}`;
            appWindow.className = 'app-window';
            appWindow.innerHTML = `
                <div class="app-header">
                    <span onclick="os.goBack()">←</span>
                    ${this.apps[id].icon} ${this.apps[id].name}
                </div>
                <div class="app-content">${this.apps[id].render()}</div>
            `;
            container.appendChild(appWindow);
            
            if(!os.state.openApps.includes(id)) os.state.openApps.push(id);
            
            // App Lifecycle Init
            if (id === 'clock') this.initClockApp();
            if (id === 'notes') this.initNotesApp();
            if (id === 'camera') this.initCameraApp();
        }

        setTimeout(() => appWindow.classList.add('open'), 10);
        os.state.activeApp = id;
    }

    closeApp(id) {
        const win = document.getElementById(`app-${id}`);
        if (win) win.remove();
        
        // Cleanups
        if(id === 'camera' && this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
        }

        os.state.openApps = os.state.openApps.filter(app => app !== id);
        if (os.state.activeApp === id) os.state.activeApp = null;
        os.showRecents();
    }

    filterApps(query) {
        const terms = query.toLowerCase();
        document.querySelectorAll('#drawer-grid .app-icon-wrapper').forEach(node => {
            const name = node.querySelector('.app-name').innerText.toLowerCase();
            node.style.display = name.includes(terms) ? 'flex' : 'none';
        });
    }

    /* --- SPECIFIC APPS --- */

    // 1. CAMERA APP
    renderCamera() {
        return `
            <div style="height:100%; display:flex; flex-direction:column; background:black;">
                <video id="cam-video" autoplay playsinline style="flex:1; width:100%; object-fit:cover;"></video>
                <div style="height:100px; display:flex; justify-content:center; align-items:center;">
                    <button onclick="appManager.takePhoto()" style="width:70px; height:70px; border-radius:50%; background:white; border:4px solid #ccc; cursor:pointer;"></button>
                </div>
            </div>
        `;
    }
    async initCameraApp() {
        const video = document.getElementById('cam-video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                this.cameraStream = stream;
            } catch (err) {
                video.parentNode.innerHTML = '<div style="color:white; padding:20px; text-align:center;">Camera permission denied or not available.</div>';
            }
        }
    }
    takePhoto() {
        const video = document.getElementById('cam-video');
        video.style.opacity = 0;
        setTimeout(() => video.style.opacity = 1, 150);
        alert("Photo captured! (Simulation)");
    }

    // 2. NOTES APP
    renderNotes() {
        return `
            <textarea id="note-input" class="search-bar" style="height:150px; background:var(--surface-color); border:1px solid #ccc;" placeholder="Type here..."></textarea>
            <button class="os-btn" onclick="appManager.saveNote()">Save Note</button>
            <div id="notes-list" style="margin-top:20px;"></div>
        `;
    }
    initNotesApp() { this.loadNotes(); }
    saveNote() {
        const txt = document.getElementById('note-input').value;
        if(!txt) return;
        const notes = JSON.parse(localStorage.getItem('droid_notes') || '[]');
        notes.unshift(txt);
        localStorage.setItem('droid_notes', JSON.stringify(notes));
        document.getElementById('note-input').value = '';
        this.loadNotes();
    }
    loadNotes() {
        const list = document.getElementById('notes-list');
        const notes = JSON.parse(localStorage.getItem('droid_notes') || '[]');
        list.innerHTML = notes.map(n => `<div class="notif-item" style="background:var(--surface-color); margin-bottom:5px; border-radius:5px;">${n}</div>`).join('');
    }

    // 3. SETTINGS
    renderSettings() {
        return `
            <div style="padding:10px;">
                <h3>Display</h3>
                <div class="notif-item">
                    <span>Dark Mode</span>
                    <div class="toggle-switch ${os.state.theme === 'dark' ? 'on' : ''}" onclick="os.toggleTheme(); this.classList.toggle('on')"></div>
                </div>
                <h3>Network</h3>
                <div class="notif-item">
                    <span>Wi-Fi</span>
                    <div class="toggle-switch ${os.state.wifi ? 'on' : ''}" onclick="os.toggleWifi(); this.classList.toggle('on')"></div>
                </div>
            </div>
        `;
    }

    // 4. CLOCK
    renderClock() {
        return `<div style="text-align:center; padding-top:50px;"><h1>${new Date().toLocaleTimeString()}</h1></div>`;
    }
    initClockApp() {}
    
    // 5. CALCULATOR
    renderCalc() {
        return `
            <div class="calc-grid">
                <div class="calc-display" id="calc-out">0</div>
                <button class="calc-btn" onclick="appManager.calc('C')">C</button>
                <button class="calc-btn" onclick="appManager.calc('/')">/</button>
                <button class="calc-btn" onclick="appManager.calc('*')">×</button>
                <button class="calc-btn" onclick="appManager.calc('back')">⌫</button>
                <button class="calc-btn" onclick="appManager.calc('7')">7</button>
                <button class="calc-btn" onclick="appManager.calc('8')">8</button>
                <button class="calc-btn" onclick="appManager.calc('9')">9</button>
                <button class="calc-btn" onclick="appManager.calc('-')">-</button>
                <button class="calc-btn" onclick="appManager.calc('4')">4</button>
                <button class="calc-btn" onclick="appManager.calc('5')">5</button>
                <button class="calc-btn" onclick="appManager.calc('6')">6</button>
                <button class="calc-btn" onclick="appManager.calc('+')">+</button>
                <button class="calc-btn" onclick="appManager.calc('1')">1</button>
                <button class="calc-btn" onclick="appManager.calc('2')">2</button>
                <button class="calc-btn" onclick="appManager.calc('3')">3</button>
                <button class="calc-btn" style="grid-column: span 2" onclick="appManager.calc('0')">0</button>
                <button class="calc-btn" onclick="appManager.calc('.')">.</button>
                <button class="calc-btn" style="background:var(--primary); color:white;" onclick="appManager.calc('=')">=</button>
            </div>
        `;
    }
    calc(val) {
        const out = document.getElementById('calc-out');
        if(val === 'C') out.innerText = '0';
        else if(val === 'back') out.innerText = out.innerText.slice(0,-1) || '0';
        else if(val === '=') { try { out.innerText = eval(out.innerText) } catch { out.innerText = 'Err'} }
        else { out.innerText = out.innerText === '0' ? val : out.innerText + val; }
    }
}

const appManager = new AppManager();