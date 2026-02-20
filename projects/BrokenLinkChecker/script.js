document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const contentInput = document.getElementById('content-input');
    const checkBtn = document.getElementById('check-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultsList = document.getElementById('results-list');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // Stats Elements
    const statTotal = document.getElementById('stat-total');
    const statChecked = document.getElementById('stat-checked');
    const statAlive = document.getElementById('stat-alive');
    const statBroken = document.getElementById('stat-broken');

    // State
    let links = [];
    let isChecking = false;

    // --- Core Logic ---

    // Regex to extract URLs (http/https)
    // improved regex to handle more edge cases
    const extractUrls = (text) => {
        const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
        const matches = text.match(regex);
        return matches ? [...new Set(matches)] : []; // Return unique links
    };

    // Improved Check logic with multiple proxy fallbacks
    const checkUrl = async (url) => {
        // Helper to timeout a fetch
        const fetchWithTimeout = async (resource, options = {}) => {
            const { timeout = 8000 } = options;
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(resource, {
                    ...options,
                    signal: controller.signal
                });
                clearTimeout(id);
                return response;
            } catch (error) {
                clearTimeout(id);
                throw error;
            }
        };

        // Strategy 1: AllOrigins (returns JSON with status) - BEST FOR CORS & BLOCKS
        // We try this FIRST because it avoids direct browser CORS issues most effectively.
        try {
            // disableCache to get fresh results
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&disableCache=true`;
            const response = await fetchWithTimeout(proxyUrl);
            const data = await response.json();

            if (data.status && data.status.http_code) {
                const code = data.status.http_code;
                // Treat 403 (Forbidden) & 429 (Too Many Requests) as Alive for link checking purposes
                // as they indicate the server exists but is protecting itself.
                const isAlive = (code >= 200 && code < 400) || code === 403 || code === 429 || code === 405; // 405 Method Not Allowed sometimes happens on HEAD
                return { url, code: code, isAlive: isAlive };
            }
            // Fallback: If we got contents, it's alive.
            if (data.contents) {
                return { url, code: 200, isAlive: true };
            }
        } catch (e) {
            // Proxy 1 failed
        }

        // Strategy 2: corsproxy.io
        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const response = await fetchWithTimeout(proxyUrl, { method: 'HEAD' });

            // If we get a response, the server is there.
            if (response.ok) return { url, code: response.status, isAlive: true };

            // 403/429 from the proxy URL usually means the target blocked the proxy or the proxy blocked us.
            // But if it's the target blocking the proxy, the link is technically "Alive".
            if (response.status === 403 || response.status === 429) {
                return { url, code: response.status, isAlive: true };
            }

            if (response.status === 404) return { url, code: 404, isAlive: false };

        } catch (e) {
            // Proxy 2 failed
        }

        // Strategy 3: Direct Fetch (works if CORS is allowed by server)
        try {
            const response = await fetchWithTimeout(url, { method: 'HEAD', mode: 'cors' });
            if (response.ok) return { url, code: response.status, isAlive: true };
        } catch (e) {
            // Direct failed
        }

        return { url, code: 0, isAlive: false, error: 'Network Error / Blocked' };
    };

    // --- UI Functions ---

    const createLinkCard = (url) => {
        const div = document.createElement('div');
        div.className = 'link-card';
        div.setAttribute('data-url', url);
        div.innerHTML = `
            <div class="link-info">
                <a href="${url}" target="_blank" class="link-url">${url}</a>
                <div class="link-meta">Waiting to check...</div>
            </div>
            <div class="status-badge status-loading">
                <div class="spinner"></div> Checking
            </div>
        `;
        return div;
    };

    const updateLinkCard = (url, result) => {
        const card = document.querySelector(`.link-card[data-url="${url}"]`);
        if (!card) return;

        const badge = card.querySelector('.status-badge');
        const meta = card.querySelector('.link-meta');

        if (result.isAlive) {
            badge.className = 'status-badge status-alive';
            badge.innerHTML = `<i class="ph-fill ph-check-circle"></i> ${result.code} OK`;
            meta.textContent = `Active • Response: ${result.code}`;
        } else {
            const isWarning = result.code === 403; // Forbidden might be bot protection, not necessarily dead
            badge.className = `status-badge ${isWarning ? 'status-warning' : 'status-dead'}`;
            const statusText = result.code === 0 ? 'Error' : result.code;
            badge.innerHTML = `<i class="ph-fill ph-warning-circle"></i> ${statusText}`;
            meta.textContent = result.error ? `Network Error: ${result.error}` : `Broken Link • ${statusText}`;
        }
    };

    // --- Event Handlers ---

    checkBtn.addEventListener('click', async () => {
        if (isChecking) return;

        const text = contentInput.value;
        if (!text.trim()) {
            alert('Please paste some text first!');
            return;
        }

        const foundLinks = extractUrls(text);
        if (foundLinks.length === 0) {
            alert('No links found in the text.');
            return;
        }

        // Reset UI
        isChecking = true;
        checkBtn.disabled = true;
        checkBtn.querySelector('.btn-text').textContent = 'Checking...';
        resultsList.innerHTML = '';
        links = foundLinks;

        // Reset Stats
        statTotal.textContent = links.length;
        statChecked.textContent = '0';
        statAlive.textContent = '0';
        statBroken.textContent = '0';

        // Setup Progress
        progressContainer.classList.remove('hidden');
        progressFill.style.width = '0%';
        progressText.textContent = '0%';

        // Generate Cards
        const fragment = document.createDocumentFragment();
        links.forEach(url => {
            fragment.appendChild(createLinkCard(url));
        });
        resultsList.appendChild(fragment);

        // Process Batch
        let checkedCount = 0;
        let aliveCount = 0;
        let brokenCount = 0;

        // Concurrency limit (e.g., 5 at a time)
        const batchSize = 5;

        for (let i = 0; i < links.length; i += batchSize) {
            const batch = links.slice(i, i + batchSize);
            const promises = batch.map(url => checkUrl(url));

            const results = await Promise.all(promises);

            results.forEach(res => {
                checkedCount++;
                if (res.isAlive) aliveCount++;
                else brokenCount++;

                // Update Card
                updateLinkCard(res.url, res);
            });

            // Update Stats
            statChecked.textContent = checkedCount;
            statAlive.textContent = aliveCount;
            statBroken.textContent = brokenCount;

            // Update Progress
            const percentage = Math.round((checkedCount / links.length) * 100);
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}%`;
        }

        // Finish
        isChecking = false;
        checkBtn.disabled = false;
        checkBtn.querySelector('.btn-text').textContent = 'Check Links';
    });

    clearBtn.addEventListener('click', () => {
        contentInput.value = '';
        resultsList.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-magnifying-glass"></i>
                <p>No links checked yet. Paste text and hit Check to start.</p>
            </div>
        `;
        progressContainer.classList.add('hidden');
        statTotal.textContent = '0';
        statChecked.textContent = '0';
        statAlive.textContent = '0';
        statBroken.textContent = '0';
    });
});
