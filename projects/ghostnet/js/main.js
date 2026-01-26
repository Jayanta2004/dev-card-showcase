/**
 * GhostNet Main Logic v2.0
 * Includes Boot Sequence, Router, and App Logic
 */

const appState = {
    history: ['search://home'],
    currentIndex: 0,
    currentUrl: 'search://home',
    isLoading: false,
    theme: localStorage.getItem('ghost-theme') || 'default',
    messages: [], // Chat history
    fileSystem: JSON.parse(JSON.stringify(window.GhostData.files)) // Deep copy for reactivity
};

const dom = {
    browserWindow: document.getElementById('browser-window'),
    bootScreen: document.getElementById('boot-screen'),
    addressInput: document.getElementById('address-input'),
    viewport: document.getElementById('viewport'),
    backBtn: document.getElementById('btn-back'),
    forwardBtn: document.getElementById('btn-forward'),
    refreshBtn: document.getElementById('btn-refresh'),
    homeBtn: document.getElementById('btn-home'),
    settingsBtn: document.getElementById('btn-settings'),
    loadingBar: document.getElementById('loading-bar'),
    statusText: document.getElementById('status-text'),
    statusIndicator: document.getElementById('status-indicator'),
    clock: document.getElementById('clock-widget')
};

// =========================================
// 1. BOOT SEQUENCE & INITIALIZATION
// =========================================
window.addEventListener('DOMContentLoaded', () => {
    applyTheme(appState.theme);
    runBootSequence();
    updateClock();
    setInterval(updateClock, 1000);
});

function runBootSequence() {
    // If we've already booted recently, maybe skip? Nah, let's show it.
    // Wait for animation to finish (approx 3.5s total)
    setTimeout(() => {
        dom.bootScreen.classList.add('boot-hidden');
        setTimeout(() => {
            dom.bootScreen.style.display = 'none';
            dom.browserWindow.classList.add('active');
            renderContent(appState.currentUrl);
        }, 500);
    }, 3800);
}

function updateClock() {
    const now = new Date();
    dom.clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// =========================================
// 2. ROUTER & NAVIGATION
// =========================================
function navigateTo(url, addToHistory = true) {
    if (appState.isLoading) return;
    url = url.trim();

    // Check for The Void
    if (url === 'ghost://void' || url === 'search://void') {
        enterTheVoid();
        return;
    }

    startLoading();

    setTimeout(() => {
        if (addToHistory) {
            if (appState.currentIndex < appState.history.length - 1) {
                appState.history = appState.history.slice(0, appState.currentIndex + 1);
            }
            appState.history.push(url);
            appState.currentIndex = appState.history.length - 1;
        }
        appState.currentUrl = url;
        updateUI();
        renderContent(url);
        stopLoading();
    }, 500);
}

function updateUI() {
    dom.addressInput.value = appState.currentUrl;
    dom.backBtn.style.opacity = appState.currentIndex > 0 ? '1' : '0.4';
    dom.forwardBtn.style.opacity = appState.currentIndex < appState.history.length - 1 ? '1' : '0.4';
}

function startLoading() {
    appState.isLoading = true;
    dom.loadingBar.style.width = '70%';
    dom.statusIndicator.style.backgroundColor = '#fbbf24'; // Yellow loading
}

function stopLoading() {
    dom.loadingBar.style.width = '100%';
    setTimeout(() => {
        dom.loadingBar.style.opacity = '0';
        setTimeout(() => {
            dom.loadingBar.style.width = '0%';
            dom.loadingBar.style.opacity = '1';
        }, 200);
    }, 200);
    appState.isLoading = false;
    dom.statusIndicator.style.backgroundColor = '#22c55e'; // Green connected
}

// =========================================
// 3. RENDERERS
// =========================================
function renderContent(url) {
    dom.viewport.innerHTML = '';
    const [protocol, path] = url.split('://');

    if (protocol === 'search') {
        if (path === 'home') renderSearchHome();
        else renderSearchResults(decodeURIComponent(path));
    } else if (protocol === 'wiki') {
        renderWikiPage(path);
    } else if (protocol === 'video') {
        renderVideoPlayer(path);
    } else if (protocol === 'chat') {
        renderChatApp();
    } else if (protocol === 'music') {
        renderMusicApp();
    } else if (protocol === 'mail') {
        if (path === 'inbox') renderMailApp();
        else renderMailView(path); // mail://id
    } else if (protocol === 'file') {
        renderFileExplorer(path === 'explorer' ? 'Home' : path);
    } else if (protocol === 'settings') {
        renderSettings();
    } else {
        renderErrorPage(url);
    }
}

// --- SEARCH ---
function renderSearchHome() {
    const container = document.createElement('div');
    container.className = 'page-search-home';
    container.innerHTML = `
        <div class="search-logo">GhostSearch</div>
        <div class="search-box-large">
            <input type="text" class="search-input-large" placeholder="Search the offline web..." autofocus>
        </div>
        
        <!-- App Shortcuts -->
        <div class="shortcut-grid">
            <div class="shortcut-item" onclick="navigateTo('chat://home')">
                <div class="shortcut-icon" style="color:#22c55e">💬</div>
                <span>Chat</span>
            </div>
            <div class="shortcut-item" onclick="navigateTo('mail://inbox')">
                <div class="shortcut-icon" style="color:#fbbf24">📧</div>
                <span>Mail</span>
            </div>
            <div class="shortcut-item" onclick="navigateTo('music://home')">
                <div class="shortcut-icon" style="color:#8b5cf6">🎵</div>
                <span>Music</span>
            </div>
            <div class="shortcut-item" onclick="navigateTo('file://explorer')">
                <div class="shortcut-icon" style="color:#3b82f6">📂</div>
                <span>Files</span>
            </div>
            <div class="shortcut-item" onclick="navigateTo('video://space')">
                 <div class="shortcut-icon" style="color:#f43f5e">▶️</div>
                <span>Video</span>
            </div>
             <div class="shortcut-item" onclick="navigateTo('wiki://gravity')">
                 <div class="shortcut-icon" style="color:#94a3b8">📚</div>
                <span>Wiki</span>
            </div>
        </div>
    `;

    // Bind Search
    const input = container.querySelector('input');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            navigateTo(`search://${encodeURIComponent(input.value.trim())}`);
        }
    });

    dom.viewport.appendChild(container);
    setTimeout(() => input.focus(), 100);
}

function renderSearchResults(query) {
    const container = document.createElement('div');
    container.className = 'page-search-results';

    const results = window.GhostData.index.filter(item => {
        const q = query.toLowerCase();
        return item.keywords.some(k => k.includes(q)) || item.title.toLowerCase().includes(q);
    });

    let html = `<p style="color:var(--text-muted); margin-bottom:20px;">Found ${results.length} results for "<strong>${query}</strong>"</p>`;

    if (results.length === 0) html += `<p>No results. Try 'chat', 'cats', or 'code'.</p>`;
    else {
        results.forEach(item => {
            html += `
                <div class="result-card" onclick="navigateTo('${item.url}')">
                    <span class="result-url">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        ${item.url}
                    </span>
                    <div class="result-title">${item.title}</div>
                    <p class="result-desc">${item.description}</p>
                </div>
            `;
        });
    }
    container.innerHTML = html;
    dom.viewport.appendChild(container);
}

// --- WIKI ---
function renderWikiPage(topic) {
    const data = window.GhostData.wiki[topic];
    if (!data) return renderErrorPage(`wiki://${topic}`);

    const container = document.createElement('div');
    container.className = 'page-wiki';
    container.innerHTML = `
        <div class="wiki-header">
            <h1 class="wiki-title">${data.title}</h1>
            <p class="wiki-subtitle">${data.subtitle}</p>
        </div>
        <div class="wiki-content">${data.content}</div>
    `;

    // Handle internal links
    const links = container.querySelectorAll('a[data-link]'); // For links handled in data.js content
    // But data.js currently doesn't add data-link classes automatically, let's just parse the HTML text.
    // Simpler: Just rely on navigateTo

    dom.viewport.appendChild(container);
}

// --- VIDEO ---
function renderVideoPlayer(id) {
    const data = window.GhostData.videos[id];
    if (!data) return renderErrorPage(`video://${id}`);

    const container = document.createElement('div');
    container.style.padding = '30px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';

    container.innerHTML = `
        <div class="player-stage" id="fake-player" style="width:100%; max-width:900px; aspect-ratio:16/9; background:#000; position:relative; display:flex; align-items:center; justify-content:center; border-radius:12px; overflow:hidden;">
            <div class="play-btn" id="btn-play-video" style="width:70px;height:70px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="#000"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
            <div style="position:absolute;bottom:0;left:0;width:100%;height:4px;background:#333;"><div id="video-progress" style="width:0%;height:100%;background:red;"></div></div>
        </div>
        <div style="width:100%; max-width:900px; margin-top:20px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h2 style="font-size:24px;">${data.title}</h2>
                <p style="color:var(--text-muted); margin-top:5px;">${data.channel} • ${data.views}</p>
            </div>
            <button onclick="downloadFile('${data.title}.mp4')" style="background:var(--bg-browser); border:1px solid var(--border-light); color:white; padding:8px 16px; border-radius:8px; cursor:pointer;">
                ⬇ Download
            </button>
        </div>
    `;

    dom.viewport.appendChild(container);

    // Play logic
    const btn = container.querySelector('#btn-play-video');
    const stage = container.querySelector('#fake-player');
    const prog = container.querySelector('#video-progress');

    btn.addEventListener('click', () => {
        btn.style.display = 'none';
        let p = 0;
        const int = setInterval(() => {
            p += 0.5;
            prog.style.width = p + '%';
            stage.style.backgroundColor = p % 10 < 5 ? data.color : '#000'; // Flash effect
            if (p >= 100) {
                clearInterval(int);
                btn.style.display = 'flex';
                stage.style.backgroundColor = '#000';
            }
        }, 50);
    });
}

// --- CHAT APP ---
function renderChatApp() {
    const container = document.createElement('div');
    container.className = 'page-chat';

    // Build Chat UI
    container.innerHTML = `
        <div class="chat-window">
            <div class="chat-messages" id="chat-feed">
                <!-- Messages go here -->
            </div>
            <div class="chat-input-area">
                <input type="text" class="chat-input" id="chat-input" placeholder="Type a message..." autocomplete="off">
            </div>
        </div>
    `;

    dom.viewport.appendChild(container);

    const feed = document.getElementById('chat-feed');
    const input = document.getElementById('chat-input');

    // Restore history
    appState.messages.forEach(msg => addBubble(msg.text, msg.sender, false));

    // Welcome if empty
    if (appState.messages.length === 0) {
        addBubble("Hello. I am GhostNet AI. Ask me anything.", 'bot');
    }

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            const txt = input.value.trim();
            addBubble(txt, 'user');
            input.value = '';

            // Bot Response
            setTimeout(() => {
                const lower = txt.toLowerCase();
                let params = Object.keys(window.GhostData.chat).filter(k => lower.includes(k));
                let reply = params.length > 0 ? window.GhostData.chat[params[0]] : window.GhostData.chat['default'];
                addBubble(reply, 'bot');
            }, 800);
        }
    });

    function addBubble(text, sender, save = true) {
        if (save) appState.messages.push({ text, sender });

        const div = document.createElement('div');
        div.className = `chat-msg msg-${sender}`;
        div.textContent = text;
        feed.appendChild(div);
        feed.scrollTop = feed.scrollHeight;
    }
}

// --- MUSIC APP ---
function renderMusicApp() {
    const container = document.createElement('div');
    container.className = 'page-music';

    // Generate track list
    const tracksHtml = window.GhostData.music.map((song, idx) => `
        <div class="track-row" onclick="playMusic(${idx})">
            <div class="track-img" style="background:${song.cover}"></div>
            <div class="track-info">
                <div class="track-title">${song.title}</div>
                <div class="track-artist">${song.artist}</div>
            </div>
            <div class="track-time">${song.duration}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="music-main">
            <div class="music-sidebar">
                <div class="music-nav-item active">🏠 Home</div>
                <div class="music-nav-item">🔍 Search</div>
                <div class="music-nav-item">📚 Your Library</div>
                <div style="margin-top:20px; font-size:12px; color:var(--text-muted); font-weight:700;">PLAYLISTS</div>
                <div class="music-nav-item">💖 Liked Songs</div>
                <div class="music-nav-item">🌌 Void Vibes</div>
            </div>
            <div class="music-content">
                <div class="music-header-banner">
                    <div>
                        <h1 style="font-size:40px; font-weight:800; margin-bottom:10px;">Void Vibes</h1>
                        <p>The sounds of silence.</p>
                    </div>
                </div>
                <div class="music-track-list">
                    ${tracksHtml}
                </div>
            </div>
        </div>
    `;
    dom.viewport.appendChild(container);
}

window.playMusic = (idx) => {
    // Simulate playing by adding equalizer to the row
    const rows = document.querySelectorAll('.track-row');
    rows.forEach(r => {
        const eq = r.querySelector('.eq-container');
        if (eq) eq.remove();
        r.style.background = 'transparent';
    });

    const row = rows[idx];
    row.style.background = 'rgba(255,255,255,0.1)';

    // Add fake EQ
    const eq = document.createElement('div');
    eq.className = 'eq-container';
    eq.innerHTML = '<div class="equalizer-bar eq-1"></div><div class="equalizer-bar eq-2"></div><div class="equalizer-bar eq-3"></div>';
    row.querySelector('.track-info').appendChild(eq);
};


// --- MAIL APP ---
function renderMailApp() {
    const container = document.createElement('div');
    container.className = 'page-mail';

    const listHtml = window.GhostData.mail.map(mail => `
        <div class="mail-item ${mail.unread ? 'unread' : ''}" onclick="navigateTo('mail://${mail.id}')">
            <div class="mail-sender">
                <span>${mail.sender}</span>
                <span>${mail.date}</span>
            </div>
            <div class="mail-subject">${mail.subject}</div>
            <div class="mail-preview">${mail.body}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="mail-list">
            <div style="padding:16px; border-bottom:1px solid var(--border-light); font-weight:bold;">Inbox (${window.GhostData.mail.filter(m => m.unread).length})</div>
            ${listHtml}
        </div>
        <div class="mail-view">
            <div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--text-muted);">
                Select an email to read
            </div>
        </div>
    `;
    dom.viewport.appendChild(container);
}

function renderMailView(id) {
    const mail = window.GhostData.mail.find(m => m.id == id);
    if (!mail) return renderMailApp(); // Fallback

    const container = document.createElement('div');
    container.className = 'page-mail';

    // Same List Sidebar (Ideally would be reusable)
    const listHtml = window.GhostData.mail.map(m => `
        <div class="mail-item ${m.unread ? 'unread' : ''} ${m.id == id ? 'active' : ''}" onclick="navigateTo('mail://${m.id}')">
            <div class="mail-sender">
                <span>${m.sender}</span>
                <span>${m.date}</span>
            </div>
            <div class="mail-subject">${m.subject}</div>
            <div class="mail-preview">${m.body}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="mail-list">
             <div style="padding:16px; border-bottom:1px solid var(--border-light); font-weight:bold;">Inbox</div>
            ${listHtml}
        </div>
        <div class="mail-view">
             <div class="mail-view-header">
                <div class="mail-view-subject">${mail.subject}</div>
                <div class="mail-meta">
                    <span>From: <strong>${mail.sender}</strong></span>
                    <span>${mail.date}</span>
                </div>
            </div>
            <div class="mail-body">${mail.body}</div>
            <div class="mail-actions">
                <button onclick="alert('Sent to the void.')" style="padding:8px 16px; background:var(--accent-primary); border:none; color:white; border-radius:6px; cursor:pointer;">Reply</button>
                <button style="padding:8px 16px; background:transparent; border:1px solid var(--border-light); color:var(--text-muted); border-radius:6px; cursor:pointer;">Forward</button>
            </div>
        </div>
    `;
    dom.viewport.appendChild(container);

    // Mark read
    mail.unread = false;
}

// --- FILE EXPLORER ---
function renderFileExplorer(folderName = "Home") {
    const container = document.createElement('div');
    container.className = 'page-files';

    let folders = Object.keys(appState.fileSystem);
    let files = [];

    // If we are at Home, show folders. If in folder, show files.
    let isRoot = folderName === 'Home';
    let displayItems = [];

    if (isRoot) {
        displayItems = folders.map(f => ({ name: f, type: 'folder' }));
    } else {
        files = appState.fileSystem[folderName] || [];
        displayItems = files;
    }

    const gridHtml = displayItems.map(item => `
        <div class="file-item" onclick="${item.type === 'folder' ? `navigateTo('file://${item.name}')` : `openFile('${item.name}')`}">
            <div class="file-icon" style="color: ${item.type === 'folder' ? '#fbbf24' : '#cbd5e1'}">
                ${item.type === 'folder' ? '📁' : (item.type === 'img' ? '🖼️' : '📄')}
            </div>
            <div class="file-name">${item.name}</div>
            <div class="file-helper">${item.type === 'folder' ? 'Folder' : item.type.toUpperCase()}</div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="file-breadcrumbs">
            <span class="file-crumb" onclick="navigateTo('file://explorer')">Home</span>
            ${!isRoot ? `<span>/</span> <span>${folderName}</span>` : ''}
        </div>
        <h2 style="margin-bottom:20px;">${folderName}</h2>
        <div class="file-grid">
            ${displayItems.length ? gridHtml : '<div style="color:var(--text-muted);">Empty folder</div>'}
        </div>
    `;

    dom.viewport.appendChild(container);
}

// Helpers
window.downloadFile = (filename) => {
    appState.fileSystem['Downloads'].push({ name: filename, type: 'file' });

    // Show toast
    const toast = document.createElement('div');
    toast.textContent = `Downloaded ${filename}`;
    toast.style.cssText = `position:fixed; bottom:40px; right:40px; background:#22c55e; color:black; padding:12px 24px; border-radius:8px; animation: fadeIn 0.3s; z-index:9999;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};

window.openFile = (filename) => {
    alert(`Opening ${filename}... (Preview not available in GhostNet v2.0)`);
};

// --- SETTINGS ---
function renderSettings() {
    const container = document.createElement('div');
    container.className = 'page-settings';

    container.innerHTML = `
        <h1 style="font-size:32px; margin-bottom:30px;">Settings</h1>
        
        <div class="settings-section">
            <div class="settings-title">Theme Color</div>
            <div class="theme-options">
                <div class="theme-btn" style="background:#3b82f6" onclick="setTheme('default')"></div>
                <div class="theme-btn" style="background:#f43f5e" onclick="setTheme('neon')"></div>
                <div class="theme-btn" style="background:#22c55e" onclick="setTheme('hacker')"></div>
            </div>
        </div>

         <div class="settings-section">
            <div class="settings-title">Data Management</div>
            <button onclick="clearData()" style="padding:10px 20px; background:#ef4444; border:none; color:white; border-radius:8px; cursor:pointer;">
                Factory Reset (Clear History)
            </button>
        </div>
    `;

    dom.viewport.appendChild(container);
}

// =========================================
// 4. LOGIC HELPERS
// =========================================

// Theme Logic
window.setTheme = (themeName) => {
    document.body.className = ''; // reset
    if (themeName !== 'default') document.body.classList.add(`theme-${themeName}`);
    appState.theme = themeName;
    localStorage.setItem('ghost-theme', themeName);
};

// Apply Theme on load
function applyTheme(themeName) {
    if (themeName !== 'default') document.body.classList.add(`theme-${themeName}`);
}

// Clear Logic
window.clearData = () => {
    appState.history = ['search://home'];
    appState.messages = [];
    localStorage.removeItem('ghost-theme');
    alert("System Reset Complete.");
    location.reload();
};

// ERROR / VOID
function renderErrorPage(url) {
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.marginTop = '100px';
    container.innerHTML = `<h1>404 Not Found</h1><p>URL: ${url}</p>`;
    dom.viewport.appendChild(container);
}

function enterTheVoid() {
    document.body.classList.add('theme-void');
    dom.statusText.textContent = "CRITICAL FAILURE // THE VOID";
    dom.viewport.innerHTML = `
        <div style="display:flex; height:100%; align-items:center; justify-content:center; text-align:center; color:#eab308;">
            <div>
                <h1 style="font-size:4rem; font-family:'Courier New';">THE VOID</h1>
                <p>You have strayed too far.</p>
                <button onclick="location.reload()" style="margin-top:20px; background:transparent; border:1px solid #eab308; color:#eab308; padding:10px 20px; cursor:pointer;">REBOOT SYSTEM</button>
            </div>
        </div>
    `;
}

// Global Toolbar Events
dom.backBtn.addEventListener('click', () => {
    if (appState.currentIndex > 0) {
        appState.currentIndex--;
        navigateTo(appState.history[appState.currentIndex], false);
    }
});
dom.forwardBtn.addEventListener('click', () => {
    if (appState.currentIndex < appState.history.length - 1) {
        appState.currentIndex++;
        navigateTo(appState.history[appState.currentIndex], false);
    }
});
dom.refreshBtn.addEventListener('click', () => navigateTo(appState.currentUrl, false));
dom.homeBtn.addEventListener('click', () => navigateTo('search://home'));
dom.settingsBtn.addEventListener('click', () => navigateTo('settings://config'));

dom.addressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        let val = dom.addressInput.value;
        if (!val.includes('://')) val = `search://${encodeURIComponent(val)}`;
        navigateTo(val);
    }
});
