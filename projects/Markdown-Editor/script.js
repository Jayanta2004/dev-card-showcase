// Configuration
const CONFIG = {
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds
    STORAGE_KEY: 'markdown-editor-content',
    THEME_KEY: 'markdown-editor-theme'
};

// Initialize marked with GitHub Flavored Markdown
marked.setOptions({
    breaks: true,
    gfm: true,
    pedantic: false,
    sanitize: false
});

// State Management
const state = {
    isDarkTheme: localStorage.getItem(CONFIG.THEME_KEY) !== 'light',
    isFullscreen: false,
    lastSaved: null,
    autoSaveTimer: null
};

// DOM Elements
const elements = {
    editor: document.getElementById('markdownInput'),
    preview: document.getElementById('preview'),
    wordCount: document.getElementById('wordCount'),
    charCount: document.getElementById('charCount'),
    lineCount: document.getElementById('lineCount'),
    autoSaveStatus: document.getElementById('autoSaveStatus'),
    previewStatus: document.getElementById('previewStatus'),
    toggleTheme: document.getElementById('toggleTheme'),
    toggleFullscreen: document.getElementById('toggleFullscreen'),
    helpToggle: document.getElementById('helpToggle'),
    closeHelp: document.getElementById('closeHelp'),
    helpPanel: document.getElementById('helpPanel'),
    helpOverlay: document.getElementById('helpOverlay'),
    container: document.querySelector('.markdown-editor-container'),
    body: document.body,
    toastContainer: document.getElementById('toastContainer')
};

// ==================== INITIALIZATION ====================
function init() {
    loadFromStorage();
    applyTheme();
    setupEventListeners();
    startAutoSave();
    renderPreview();
    updateStats();
}

// ==================== MARKDOWN RENDERING ====================
function renderPreview() {
    try {
        const markdown = elements.editor.value;
        let html = marked.parse(markdown);
        
        // Sanitize HTML to prevent XSS
        html = DOMPurify.sanitize(html);
        
        // Highlight code blocks
        html = html.replace(/<pre><code[^>]*>/g, (match) => {
            return match.replace(/class="language-([^"]*)"/, (m, lang) => {
                return `class="hljs language-${lang}"`;
            });
        });
        
        elements.preview.innerHTML = html;
        
        // Highlight all code blocks
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        
        elements.previewStatus.textContent = 'Rendered';
        setTimeout(() => {
            elements.previewStatus.textContent = 'Ready';
        }, 1000);
        
    } catch (error) {
        console.error('Render error:', error);
        elements.preview.innerHTML = '<p style="color: red;">Error rendering markdown</p>';
    }
}

// ==================== STATISTICS ====================
function updateStats() {
    const text = elements.editor.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split('\n').length : 0;
    
    elements.charCount.textContent = chars;
    elements.wordCount.textContent = words;
    elements.lineCount.textContent = lines;
}

// ==================== LOCAL STORAGE ====================
function saveToStorage() {
    const content = elements.editor.value;
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, content);
        state.lastSaved = new Date();
        showAutoSaveStatus();
    } catch (error) {
        console.error('Storage error:', error);
    }
}

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            elements.editor.value = saved;
        }
    } catch (error) {
        console.error('Load error:', error);
    }
}

function showAutoSaveStatus() {
    const status = elements.autoSaveStatus;
    status.innerHTML = '<i class="fas fa-check-circle"></i> Auto-saved';
    status.style.opacity = '1';
    
    clearTimeout(status.hideTimer);
    status.hideTimer = setTimeout(() => {
        status.style.opacity = '0.5';
    }, 3000);
}

function startAutoSave() {
    state.autoSaveTimer = setInterval(() => {
        saveToStorage();
    }, CONFIG.AUTO_SAVE_INTERVAL);
}

// ==================== THEME MANAGEMENT ====================
function applyTheme() {
    if (state.isDarkTheme) {
        elements.body.classList.add('dark-theme');
        elements.toggleTheme.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        elements.body.classList.remove('dark-theme');
        elements.toggleTheme.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    state.isDarkTheme = !state.isDarkTheme;
    localStorage.setItem(CONFIG.THEME_KEY, state.isDarkTheme ? 'dark' : 'light');
    applyTheme();
}

// ==================== FULLSCREEN MODE ====================
function toggleFullscreen() {
    state.isFullscreen = !state.isFullscreen;
    
    if (state.isFullscreen) {
        elements.container.classList.add('fullscreen-mode');
        elements.toggleFullscreen.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        elements.container.classList.remove('fullscreen-mode');
        elements.toggleFullscreen.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// ==================== HELP PANEL ====================
function showHelp() {
    elements.helpPanel.classList.add('active');
    elements.helpOverlay.classList.add('active');
}

function hideHelp() {
    elements.helpPanel.classList.remove('active');
    elements.helpOverlay.classList.remove('active');
}

// ==================== EXPORT FUNCTIONALITY ====================
function exportAsHtml() {
    const html = elements.preview.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Markdown Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
        blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 20px; color: #666; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
    
    downloadFile(fullHtml, 'markdown-export.html', 'text/html');
}

function exportAsPdf() {
    const element = elements.preview;
    const opt = {
        margin: 10,
        filename: 'markdown-export.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
    showToast('PDF downloaded!', 'success');
}

function exportAsMarkdown() {
    const markdown = elements.editor.value;
    downloadFile(markdown, 'markdown-export.md', 'text/markdown');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showToast(`${filename} downloaded!`, 'success');
}

// ==================== COPY FUNCTIONALITY ====================
function copyHtmlOutput() {
    const html = elements.preview.innerHTML;
    
    navigator.clipboard.writeText(html).then(() => {
        showToast('HTML copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = html;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('HTML copied to clipboard!', 'success');
    });
}

// ==================== EDITOR UTILITIES ====================
function insertText(before, after = '') {
    const textarea = elements.editor;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const text = textarea.value;
    
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    textarea.value = newText;
    
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selectedText.length;
    textarea.focus();
    
    renderPreview();
    updateStats();
}

function insertLink() {
    insertText('[Link Text](https://example.com)');
}

function insertImage() {
    insertText('![Alt Text](https://example.com/image.jpg)');
}

function insertCode() {
    insertText('```javascript\n', '\n```');
}

function clearEditor() {
    if (confirm('Are you sure you want to clear the editor? This cannot be undone.')) {
        elements.editor.value = '';
        renderPreview();
        updateStats();
        saveToStorage();
        showToast('Editor cleared', 'info');
    }
}

// ==================== NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Editor input
    elements.editor.addEventListener('input', () => {
        renderPreview();
        updateStats();
    });
    
    // Theme toggle
    elements.toggleTheme.addEventListener('click', toggleTheme);
    
    // Fullscreen toggle
    elements.toggleFullscreen.addEventListener('click', toggleFullscreen);
    
    // Help panel
    elements.helpToggle.addEventListener('click', showHelp);
    elements.closeHelp.addEventListener('click', hideHelp);
    elements.helpOverlay.addEventListener('click', hideHelp);
    
    // Export buttons
    document.getElementById('exportHtml').addEventListener('click', exportAsHtml);
    document.getElementById('exportPdf').addEventListener('click', exportAsPdf);
    document.getElementById('exportMd').addEventListener('click', exportAsMarkdown);
    
    // Copy button
    document.getElementById('copyHtml').addEventListener('click', copyHtmlOutput);
    
    // Clear button
    document.getElementById('clearEditor').addEventListener('click', clearEditor);
    
    // Insert buttons
    document.getElementById('insertLink').addEventListener('click', insertLink);
    document.getElementById('insertImage').addEventListener('click', insertImage);
    document.getElementById('insertCode').addEventListener('click', insertCode);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Tab key support in textarea
    elements.editor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            insertText('\t');
        }
    });
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(state.autoSaveTimer);
        saveToStorage();
    });
}

function handleKeyboardShortcuts(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        switch(e.key.toLowerCase()) {
            case 'e':
                e.preventDefault();
                exportAsHtml();
                break;
            case 'p':
                e.preventDefault();
                exportAsPdf();
                break;
            case 'f':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'h':
                e.preventDefault();
                showHelp();
                break;
        }
    }
    
    // Ctrl+S or Cmd+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveToStorage();
        showToast('Saved successfully!', 'success');
    }
}

// ==================== START ====================
document.addEventListener('DOMContentLoaded', init);
