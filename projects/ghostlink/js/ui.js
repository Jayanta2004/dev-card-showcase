/**
 * GhostLink UI Controller
 * Binds the simulation logic to the visual interface.
 */
(function (global) {
    'use strict';

    const { GhostState, GhostPeers, GhostNetwork, GhostMessages } = global;

    if (!GhostState) return; // Error handling usually

    // DOM Elements
    const els = {
        myIdentity: document.getElementById('my-identity'),
        toggleNetwork: document.getElementById('toggle-network'),
        translateBtn: document.getElementById('translate-btn'),
        peerList: document.getElementById('peer-list'),
        messageFeed: document.getElementById('message-feed'),
        messageInput: document.getElementById('message-input'),
        sendBtn: document.getElementById('send-btn'),
        vizCanvas: document.getElementById('viz-canvas'),
        vizContainer: document.getElementById('network-viz'),
        onboardingToast: document.getElementById('onboarding-toast'),
        onboardingText: document.getElementById('onboarding-text')
    };

    // State
    let activePeerId = null; // Currently selected chat
    let canvasCtx = els.vizCanvas.getContext('2d');
    let particles = []; // For visualization

    // --- Initialization ---

    function init() {
        const id = GhostState.getIdentity();
        els.myIdentity.innerHTML = `NODE: <span style="color:white">${id.name}</span> <span style="opacity:0.5">[${id.id.substr(0, 4)}]</span>`;

        // Resize Canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Start Viz Loop
        requestAnimationFrame(renderViz);

        // Bind Events
        els.sendBtn.addEventListener('click', handleSend);
        els.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        els.toggleNetwork.addEventListener('click', toggleOffline);
        els.translateBtn.addEventListener('click', toggleLanguage);

        // Show onboarding if needed
        setTimeout(handleOnboarding, 1000);

        // Listen to Ghost System Events
        GhostState.on('peerJoined', renderPeerList);
        GhostState.on('peerLeft', renderPeerList);
        GhostState.on('networkStatsChange', updateNetworkStatus);

        GhostState.on('message:received', (msg) => {
            // If viewing this peer, append, else show badge (todo)
            if (activePeerId === msg.from || activePeerId === msg.to) {
                renderChat(activePeerId);
            }
            spawnVizParticle(msg.from, msg.to, 'packet');
        });

        GhostState.on('history:updated', ({ peerId }) => {
            if (activePeerId === peerId) {
                renderChat(peerId);
            }
        });

        // Network Viz Events
        GhostState.on('network:routing', (data) => {
            spawnVizParticle(GhostState.getIdentity().id, data.target, 'routing');
        });

        // Force initial render
        renderPeerList();

        console.log('[UI] Interface Mounted');
    }

    // --- Actions ---

    function handleSend() {
        const text = els.messageInput.value.trim();
        if (!text) return;
        if (!activePeerId) {
            appendSystemMessage('ERROR: No Target Node Selected. Select a peer from the sidebar.');
            return;
        }

        GhostMessages.sendMessage(text, activePeerId);
        els.messageInput.value = '';
        els.messageInput.focus();
    }

    function toggleOffline() {
        const isOffline = GhostState.isSimulatedOffline();
        GhostState.setOffline(!isOffline);
    }

    function updateNetworkStatus({ online }) {
        els.toggleNetwork.innerText = online ? 'GO OFFLINE' : 'RECONNECT';
        els.toggleNetwork.style.borderColor = online ? 'var(--neon-blue)' : 'var(--neon-pink)';
        els.toggleNetwork.style.color = online ? 'var(--neon-blue)' : 'var(--neon-pink)';

        if (!online) {
            appendSystemMessage('SYSTEM ALERT: NETWORK CONNECTION SEVERED');
            document.body.style.filter = 'grayscale(0.8)';
        } else {
            appendSystemMessage('SYSTEM: CONNECTION RESTORED. SYNCING...');
            document.body.style.filter = 'none';
            // Trigger sync
            GhostMessages.processQueue();
        }
    }

    function selectPeer(id) {
        activePeerId = id;
        renderPeerList(); // update active class
        renderChat(id);
        els.messageInput.focus();
    }

    function toggleLanguage() {
        if (!global.GhostI18n) return;
        global.GhostI18n.toggle();

        // Update Static UI
        els.toggleNetwork.innerText = global.GhostI18n.get('btn_offline');
        els.sendBtn.innerText = global.GhostI18n.get('btn_send');
        els.messageInput.placeholder = global.GhostI18n.get('input_placeholder');

        const labelNodes = document.getElementById('label-nodes');
        if (labelNodes) labelNodes.innerText = global.GhostI18n.get('sidebar_title');

        const emptyPeers = document.getElementById('empty-peers');
        if (emptyPeers) emptyPeers.innerText = global.GhostI18n.get('no_peers');

        // Update Onboarding Text if visible
        els.onboardingText.innerText = global.GhostI18n.get('onboarding_msg');

        // Update Network Button text based on state
        const isOffline = GhostState.isSimulatedOffline();
        els.toggleNetwork.innerText = isOffline ? global.GhostI18n.get('btn_reconnect') : global.GhostI18n.get('btn_offline');
    }

    function handleOnboarding() {
        // If we are the only peer, show the toast
        if (GhostPeers.count() === 0) {
            els.onboardingToast.style.display = 'block';
            els.onboardingToast.style.animation = 'scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }

        // Hide it automatically if a peer joins
        GhostState.on('peerJoined', () => {
            els.onboardingToast.style.display = 'none';
        });
    }

    // --- Rendering ---

    function renderPeerList() {
        const peers = GhostPeers.getActivePeers();
        els.peerList.innerHTML = '';

        if (peers.length === 0) {
            els.peerList.innerHTML = `<div style="padding:20px; text-align:center; opacity:0.5;">NO ACTIVE PEERS FOUND<br><small>Open another tab</small></div>`;
            return;
        }

        peers.forEach(peer => {
            const el = document.createElement('div');
            el.className = `peer-item ${activePeerId === peer.id ? 'active' : ''}`;
            el.onclick = () => selectPeer(peer.id);

            // Generate avatar from name
            const initials = peer.name.substr(0, 2).toUpperCase();

            el.innerHTML = `
                <div class="peer-avatar" style="color: ${peer.color}; border: 1px solid ${peer.color}">
                    ${initials}
                </div>
                <div class="peer-info">
                    <div style="font-weight:600; font-size:0.9rem;">${peer.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-dim); display:flex; align-items:center; gap:4px;">
                        <span class="gl-status-dot online"></span> ONLINE
                    </div>
                </div>
            `;
            els.peerList.appendChild(el);
        });
    }

    function renderChat(peerId) {
        const history = GhostMessages.getHistory(peerId);
        els.messageFeed.innerHTML = ''; // Clear (flashing is acceptable for this aesthetic)

        const myId = GhostState.getIdentity().id;

        history.forEach(msg => {
            const isMe = msg.from === myId;
            const el = document.createElement('div');
            el.className = `message ${isMe ? 'outgoing' : 'incoming'}`;

            let statusHtml = '';
            if (isMe) {
                let icon = '...';
                if (msg.status === 'routing') icon = '⇋';
                if (msg.status === 'sent') icon = '✓';
                if (msg.status === 'delivered') icon = '✓✓';
                if (msg.status === 'failed') icon = '!';

                statusHtml = `<div class="message-status ${msg.status}">
                    ${msg.status.toUpperCase()} ${icon}
                </div>`;
            }

            el.innerHTML = `
                <div class="message-meta">
                    <span>${isMe ? 'ME' : 'PEER'}</span>
                    <span>${new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="message-body">${escapeHtml(msg.text)}</div>
                ${statusHtml}
            `;
            els.messageFeed.appendChild(el);
        });

        // Scroll to bottom
        els.messageFeed.scrollTop = els.messageFeed.scrollHeight;
    }

    function appendSystemMessage(text) {
        const el = document.createElement('div');
        el.className = 'message incoming';
        el.style.borderColor = 'transparent';
        el.style.opacity = '0.7';
        el.innerHTML = `
            <div class="message-meta"><span>SYSTEM</span><span>${new Date().toLocaleTimeString()}</span></div>
            <div class="message-body" style="font-family:var(--font-mono)">${text}</div>
        `;
        els.messageFeed.appendChild(el);
        els.messageFeed.scrollTop = els.messageFeed.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // --- Visualization ---

    function resizeCanvas() {
        els.vizCanvas.width = els.vizContainer.offsetWidth;
        els.vizCanvas.height = els.vizContainer.offsetHeight;
    }

    function spawnVizParticle(from, to, type) {
        // Visual sugar only
        particles.push({
            x: type === 'routing' ? 20 : els.vizCanvas.width - 20,
            y: els.vizCanvas.height / 2,
            targetX: type === 'routing' ? els.vizCanvas.width - 50 : 50,
            progress: 0,
            speed: 0.01 + Math.random() * 0.02,
            color: type === 'routing' ? '#00f0ff' : '#00ff9d'
        });
    }

    function renderViz() {
        canvasCtx.clearRect(0, 0, els.vizCanvas.width, els.vizCanvas.height);

        const w = els.vizCanvas.width;
        const h = els.vizCanvas.height;
        const cx = w / 2;
        const cy = h / 2;

        // Draw "Node" (Me)
        canvasCtx.beginPath();
        canvasCtx.arc(50, cy, 8, 0, Math.PI * 2);
        canvasCtx.fillStyle = '#fff';
        canvasCtx.fill();
        canvasCtx.shadowBlur = 10;
        canvasCtx.shadowColor = '#fff';

        // Draw "Cloud" / Network Core
        canvasCtx.beginPath();
        canvasCtx.arc(cx, cy, 30, 0, Math.PI * 2);
        canvasCtx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();

        // Dynamic pulse
        const time = Date.now() * 0.001;
        const pulse = 30 + Math.sin(time * 2) * 5;
        canvasCtx.beginPath();
        canvasCtx.arc(cx, cy, pulse, 0, Math.PI * 2);
        canvasCtx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        canvasCtx.stroke();

        // Particles
        canvasCtx.shadowBlur = 0;
        particles.forEach((p, idx) => {
            p.progress += p.speed;

            // Lerp
            const currentX = 50 + (w - 100) * p.progress; // Simplified left-to-right logic for visual only

            // Draw
            canvasCtx.fillStyle = p.color;
            canvasCtx.fillRect(currentX, cy - 2, 4, 4);

            if (p.progress >= 1) {
                particles.splice(idx, 1);
            }
        });

        requestAnimationFrame(renderViz);
    }

    // Boot
    init();

})(window);
