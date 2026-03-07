    (function(){
        // DOM elements
        const htmlInput = document.getElementById('htmlInput');
        const cssInput = document.getElementById('cssInput');
        const jsInput = document.getElementById('jsInput');
        const previewFrame = document.getElementById('previewFrame');
        const consolePane = document.getElementById('consolePane');
        const runBtn = document.getElementById('runCodeBtn');
        const refreshBtn = document.getElementById('refreshPreviewBtn');
        const clearConsoleBtn = document.getElementById('clearConsoleBtn');
        const previewTabBtn = document.getElementById('previewTabBtn');
        const consoleTabBtn = document.getElementById('consoleTabBtn');
        // file tabs (just for ui highlight)
        const htmlTabBtn = document.getElementById('tabHtmlBtn');
        const cssTabBtn = document.getElementById('tabCssBtn');
        const jsTabBtn = document.getElementById('tabJsBtn');
        const panels = document.querySelectorAll('.panel'); // not toggling, only active highlight

        // state
        let consoleEntries = [];   // store lines as html
        let activeOutput = 'preview'; // 'preview' or 'console'

        // --- helper: add line to console pane (internal store)
        function addConsoleMessage(text, isError = false) {
            const icon = isError ? 'fa-circle-exclamation' : 'fa-chevron-right';
            const cls = isError ? 'error' : '';
            const lineHtml = `<div class="console-line ${cls}"><i class="fas ${icon}"></i> ${escapeHtml(text)}</div>`;
            consoleEntries.push(lineHtml);
            // limit entries (optional)
            if (consoleEntries.length > 50) consoleEntries.shift();
            renderConsole();
        }

        // simple escape for console content (prevent XSS from logs)
        function escapeHtml(unsafe) {
            return unsafe.replace(/[&<>"]/g, function(m) {
                if(m === '&') return '&amp;'; if(m === '<') return '&lt;'; if(m === '>') return '&gt;'; if(m === '"') return '&quot;';
                return m;
            });
        }

        // render the console pane from stored entries
        function renderConsole() {
            consolePane.innerHTML = consoleEntries.join('');
            if (consoleEntries.length === 0) {
                consolePane.innerHTML = '<div class="console-line"><i class="fas fa-info-circle"></i> [console empty]</div>';
            }
        }

        // clear console
        function clearConsole() {
            consoleEntries = [];
            addConsoleMessage('console cleared · ready', false);
        }

        // --- core: run code (build iframe srcdoc) ---
        function generatePreviewDocument() {
            const htmlRaw = htmlInput.value;
            const cssRaw = cssInput.value;
            const jsRaw = jsInput.value;

            // we capture console methods from iframe via overriding. 
            // we'll inject a custom script to forward logs to parent using postMessage
            const forwardedScript = `
                <script>
                    (function() {
                        // preserve original console
                        const originalConsole = window.console;
                        function sendLog(level, args) {
                            try {
                                // Convert args to strings
                                const strings = Array.from(args).map(arg => {
                                    try {
                                        return String(arg);
                                    } catch { return '[unstringable]'; }
                                }).join(' ');
                                window.parent.postMessage({ type: 'console', level: level, message: strings }, '*');
                            } catch (e) {}
                        }

                        // override console methods
                        console = {
                            log: function(...args) { sendLog('log', args); originalConsole.log(...args); },
                            info: function(...args) { sendLog('info', args); originalConsole.info(...args); },
                            warn: function(...args) { sendLog('warn', args); originalConsole.warn(...args); },
                            error: function(...args) { sendLog('error', args); originalConsole.error(...args); },
                            debug: function(...args) { sendLog('debug', args); originalConsole.debug(...args); },
                        };
                        window.addEventListener('error', function(e) {
                            sendLog('error', ['Uncaught:', e.message, 'at', e.filename + ':' + e.lineno]);
                        });
                    })();
                <\/script>
            `;

            // build full document
            return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${cssRaw}</style>
    <style>/* reset default margin */ body { margin: 0; }</style>
</head>
<body>
    ${htmlRaw}
    ${forwardedScript}
    <script>${jsRaw}<\/script>
</body>
</html>
            `;
        }

        function updatePreview() {
            const doc = generatePreviewDocument();
            previewFrame.srcdoc = doc;
            // optional: also show a message in console that preview updated
            addConsoleMessage('▶ preview updated at ' + new Date().toLocaleTimeString(), false);
        }

        // --- message event listener for iframe logs ---
        window.addEventListener('message', function(event) {
            // optionally check origin to be safe, but for sandboxed we accept
            if (event.data && event.data.type === 'console') {
                const level = event.data.level || 'log';
                const msg = event.data.message || '[empty]';
                let prefix = '';
                if (level === 'warn') prefix = '⚠️ ';
                else if (level === 'error') prefix = '❌ ';
                else if (level === 'info') prefix = 'ℹ️ ';
                addConsoleMessage(prefix + msg, level==='error');
            }
        });

        // --- ui switching between preview and console ---
        function setOutputTab(tab) {
            if (tab === 'preview') {
                previewTabBtn.classList.add('active');
                consoleTabBtn.classList.remove('active');
                previewFrame.style.display = 'block';
                consolePane.classList.remove('visible');
                activeOutput = 'preview';
            } else {
                previewTabBtn.classList.remove('active');
                consoleTabBtn.classList.add('active');
                previewFrame.style.display = 'none';
                consolePane.classList.add('visible');
                activeOutput = 'console';
            }
        }

        previewTabBtn.addEventListener('click', () => setOutputTab('preview'));
        consoleTabBtn.addEventListener('click', () => setOutputTab('console'));

        // file tabs : just UI active state + focus (optional)
        function setActiveFileTab(active) {
            [htmlTabBtn, cssTabBtn, jsTabBtn].forEach(btn => btn.classList.remove('active'));
            if (active === 'html') htmlTabBtn.classList.add('active');
            if (active === 'css') cssTabBtn.classList.add('active');
            if (active === 'js') jsTabBtn.classList.add('active');
        }
        htmlTabBtn.addEventListener('click', () => {
            setActiveFileTab('html');
            htmlInput.focus();
        });
        cssTabBtn.addEventListener('click', () => {
            setActiveFileTab('css');
            cssInput.focus();
        });
        jsTabBtn.addEventListener('click', () => {
            setActiveFileTab('js');
            jsInput.focus();
        });

        // run button & ctrl+enter
        runBtn.addEventListener('click', () => {
            updatePreview();
        });

        // refresh (re-run without changes? just rebuild from same code)
        refreshBtn.addEventListener('click', () => {
            updatePreview();
            addConsoleMessage('⟳ preview manually refreshed', false);
        });

        clearConsoleBtn.addEventListener('click', () => {
            clearConsole();
        });

        // keyboard: Ctrl+Enter run
        [htmlInput, cssInput, jsInput].forEach(textarea => {
            textarea.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    updatePreview();
                }
            });
        });

        // initial preview load
        window.addEventListener('load', () => {
            // clear any default console logs (but we have the base message)
            consoleEntries = [];
            addConsoleMessage('👋 miniIDE ready · logs from iframe appear here', false);
            updatePreview(); // load demo

            // set active file tab to html for start
            setActiveFileTab('html');
        });

        // extra: handle when user clicks on console (maybe link)
        // also override any possible error with console catching on parent (just in case)
        window.onerror = function(msg, src, line) {
            addConsoleMessage('[parent error] ' + msg + ' at ' + src + ':' + line, true);
        };
    })();