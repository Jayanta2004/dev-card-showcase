// Initialize marked.js with GitHub Flavored Markdown support
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});

// DOM Elements
const markdownEditor = document.getElementById('markdown-editor');
const markdownPreview = document.getElementById('markdown-preview');
const lineNumbers = document.querySelector('.line-numbers');
const themeToggler = document.getElementById('theme-toggler');
const themeLabel = document.getElementById('theme-label');
const downloadBtn = document.getElementById('download-md');
const copyHtmlBtn = document.getElementById('copy-html');
const clearBtn = document.getElementById('clear-btn');
const sampleBtn = document.getElementById('sample-btn');
const formatBtn = document.getElementById('format-btn');
const toggleSyncBtn = document.getElementById('toggle-sync');
const syncStatus = document.getElementById('sync-status');
const fullscreenPreviewBtn = document.getElementById('fullscreen-preview');
const fullscreenModal = document.getElementById('fullscreen-modal');
const closeFullscreenBtn = document.getElementById('close-fullscreen');
const fullscreenPreviewContent = document.getElementById('fullscreen-preview-content');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const lineCount = document.getElementById('line-count');
const toolbarButtons = document.querySelectorAll('.toolbar-btn');

// App State
let isSyncEnabled = true;
let isDarkTheme = false;

// Initialize the application
function init() {
    // Set initial theme
    const savedTheme = localStorage.getItem('markdown-theme');
    if (savedTheme === 'dark') {
        enableDarkTheme();
    } else {
        enableLightTheme();
    }
    
    // Render initial markdown
    updatePreview();
    updateLineNumbers();
    updateStats();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load sample content if first visit
    const hasVisited = localStorage.getItem('markdown-has-visited');
    if (!hasVisited) {
        localStorage.setItem('markdown-has-visited', 'true');
        loadSampleContent();
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Editor input events
    markdownEditor.addEventListener('input', () => {
        updatePreview();
        updateLineNumbers();
        updateStats();
        saveToLocalStorage();
    });
    
    // Editor scroll event for sync
    markdownEditor.addEventListener('scroll', syncScroll);
    
    // Preview scroll event for sync
    markdownPreview.addEventListener('scroll', syncScroll);
    
    // Theme toggler
    themeToggler.addEventListener('click', toggleTheme);
    
    // Export buttons
    downloadBtn.addEventListener('click', downloadMarkdown);
    copyHtmlBtn.addEventListener('click', copyHtml);
    
    // Control buttons
    clearBtn.addEventListener('click', clearEditor);
    sampleBtn.addEventListener('click', loadSampleContent);
    formatBtn.addEventListener('click', formatMarkdown);
    
    // Scroll sync toggle
    toggleSyncBtn.addEventListener('click', toggleScrollSync);
    
    // Fullscreen preview
    fullscreenPreviewBtn.addEventListener('click', openFullscreenPreview);
    closeFullscreenBtn.addEventListener('click', closeFullscreenPreview);
    
    // Toolbar buttons
    toolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            const insertText = button.getAttribute('data-insert');
            insertTextAtCursor(insertText);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Close fullscreen on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenModal.style.display === 'flex') {
            closeFullscreenPreview();
        }
    });
    
    // Auto-save on blur
    markdownEditor.addEventListener('blur', saveToLocalStorage);
}

// Update the preview pane with rendered markdown
function updatePreview() {
    const markdownText = markdownEditor.value;
    const html = marked.parse(markdownText);
    markdownPreview.innerHTML = html;
    
    // Also update fullscreen preview if open
    if (fullscreenModal.style.display === 'flex') {
        fullscreenPreviewContent.innerHTML = html;
    }
}

// Update line numbers in the editor
function updateLineNumbers() {
    const lines = markdownEditor.value.split('\n').length;
    lineNumbers.innerHTML = '';
    
    for (let i = 1; i <= lines; i++) {
        const lineNumber = document.createElement('div');
        lineNumber.textContent = i;
        lineNumbers.appendChild(lineNumber);
    }
}

// Update character, word, and line counts
function updateStats() {
    const text = markdownEditor.value;
    
    // Character count
    charCount.textContent = text.length;
    
    // Word count (simplified)
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = words.length;
    
    // Line count
    lineCount.textContent = text.split('\n').length;
}

// Synchronize scrolling between editor and preview
function syncScroll(e) {
    if (!isSyncEnabled) return;
    
    const isEditorScrolling = e.target === markdownEditor;
    const source = isEditorScrolling ? markdownEditor : markdownPreview;
    const target = isEditorScrolling ? markdownPreview : markdownEditor;
    
    // Calculate scroll percentage
    const scrollPercent = source.scrollTop / (source.scrollHeight - source.clientHeight);
    
    // Apply to target
    target.scrollTop = scrollPercent * (target.scrollHeight - target.clientHeight);
}

// Toggle scroll synchronization
function toggleScrollSync() {
    isSyncEnabled = !isSyncEnabled;
    syncStatus.textContent = `Sync: ${isSyncEnabled ? 'ON' : 'OFF'}`;
    toggleSyncBtn.textContent = isSyncEnabled ? 'Disable' : 'Enable';
    
    showToast(`Scroll sync ${isSyncEnabled ? 'enabled' : 'disabled'}`);
}

// Toggle between light and dark themes
function toggleTheme() {
    if (isDarkTheme) {
        enableLightTheme();
    } else {
        enableDarkTheme();
    }
    
    // Save theme preference
    localStorage.setItem('markdown-theme', isDarkTheme ? 'dark' : 'light');
    
    showToast(`${isDarkTheme ? 'Dark' : 'Light'} theme activated`);
}

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    themeLabel.textContent = 'Dark Theme';
    isDarkTheme = true;
}

function enableLightTheme() {
    document.body.classList.remove('dark-theme');
    themeLabel.textContent = 'Light Theme';
    isDarkTheme = false;
}

// Download markdown as .md file
function downloadMarkdown() {
    const markdownText = markdownEditor.value;
    const blob = new Blob([markdownText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Markdown file downloaded successfully');
}

// Copy rendered HTML to clipboard
function copyHtml() {
    const html = marked.parse(markdownEditor.value);
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = html;
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextarea);
    
    showToast('HTML copied to clipboard');
}

// Clear the editor
function clearEditor() {
    if (markdownEditor.value.trim() !== '' && confirm('Are you sure you want to clear the editor? All unsaved changes will be lost.')) {
        markdownEditor.value = '';
        updatePreview();
        updateLineNumbers();
        updateStats();
        saveToLocalStorage();
        showToast('Editor cleared');
    }
}

// Load sample markdown content
function loadSampleContent() {
    const sampleMarkdown = `# Welcome to Markdown Live Preview

## Introduction
This is a **powerful tool** for writers and developers to create formatted content using Markdown.

### Key Features
- **Live Preview**: See your rendered Markdown in real-time
- **GitHub Flavored Markdown**: Full support for tables, task lists, and more
- **Export Options**: Download as .md file or copy the HTML
- **Synchronized Scrolling**: Scroll editor and preview together
- **Theme Toggler**: Switch between light and dark themes

## Code Example
\`\`\`javascript
// This is a JavaScript code block
function helloWorld() {
  console.log("Hello, Markdown!");
  return "Formatted code with syntax highlighting";
}

// Example of async/await
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

## Task List
- [x] Create the editor interface
- [x] Implement live preview
- [ ] Add more export options
- [ ] Implement auto-save feature

## Table Example
| Feature | Status | Notes |
|---------|--------|-------|
| Tables | ✅ Implemented | Supports alignment |
| Task Lists | ✅ Implemented | With interactive checkboxes |
| Code Blocks | ✅ Implemented | With syntax highlighting |
| Math Support | 🔜 Planned | LaTeX equations |

## Links and Images
Check out the [Markdown Guide](https://www.markdownguide.org) for more syntax help.

Here's an example image reference: ![Markdown Logo](https://markdown-here.com/img/icon256.png)

## Blockquote
> This is a blockquote. It's great for highlighting important information or quotes from other sources.

## Mathematical Expression (LaTeX)
This tool also supports LaTeX math expressions:

Inline math: \\(E = mc^2\\)

Display math:
\\[
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\\]

---
*Enjoy using this Markdown Live Preview tool!*`;

    markdownEditor.value = sampleMarkdown;
    updatePreview();
    updateLineNumbers();
    updateStats();
    saveToLocalStorage();
    showToast('Sample content loaded');
}

// Format markdown with proper indentation
function formatMarkdown() {
    let text = markdownEditor.value;
    
    // Format lists with consistent indentation
    text = text.replace(/^(\s*)[-*+](\s+)/gm, '$1- ');
    
    // Format numbered lists
    let inNumberedList = false;
    let lineNumber = 1;
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
        if (line.match(/^\s*\d+\.\s+/)) {
            if (!inNumberedList) {
                inNumberedList = true;
                lineNumber = 1;
            }
            const match = line.match(/^(\s*)\d+\.(\s+.*)$/);
            if (match) {
                const formattedLine = `${match[1]}${lineNumber}.${match[2]}`;
                lineNumber++;
                return formattedLine;
            }
        } else {
            inNumberedList = false;
        }
        return line;
    });
    
    text = formattedLines.join('\n');
    
    // Update editor with formatted text
    markdownEditor.value = text;
    updatePreview();
    updateLineNumbers();
    updateStats();
    saveToLocalStorage();
    
    showToast('Markdown formatted');
}

// Insert text at cursor position in editor
function insertTextAtCursor(text) {
    const start = markdownEditor.selectionStart;
    const end = markdownEditor.selectionEnd;
    const currentText = markdownEditor.value;
    
    // Check if text contains newline for multiline insertion
    if (text.includes('\n')) {
        // For multiline text, replace selection with the text
        markdownEditor.value = currentText.substring(0, start) + text + currentText.substring(end);
        
        // Position cursor after the inserted text
        markdownEditor.selectionStart = markdownEditor.selectionEnd = start + text.length;
    } else {
        // For single line text, wrap selected text if any
        const selectedText = currentText.substring(start, end);
        markdownEditor.value = currentText.substring(0, start) + text + currentText.substring(end);
        
        // Position cursor appropriately
        if (text.includes('**') || text.includes('_') || text.includes('`')) {
            // For formatting markers, position cursor between them
            const markerLength = text.match(/\*\*|__|`/g) ? text.match(/\*\*|__|`/g)[0].length : 0;
            markdownEditor.selectionStart = markdownEditor.selectionEnd = start + markerLength;
        } else {
            // For other insertions, position cursor at end
            markdownEditor.selectionStart = markdownEditor.selectionEnd = start + text.length;
        }
    }
    
    // Trigger input event to update preview
    markdownEditor.dispatchEvent(new Event('input'));
    markdownEditor.focus();
    
    showToast('Text inserted at cursor');
}

// Open fullscreen preview
function openFullscreenPreview() {
    const html = marked.parse(markdownEditor.value);
    fullscreenPreviewContent.innerHTML = html;
    fullscreenModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    showToast('Fullscreen preview opened');
}

// Close fullscreen preview
function closeFullscreenPreview() {
    fullscreenModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    showToast('Fullscreen preview closed');
}

// Show toast notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Save content to localStorage
function saveToLocalStorage() {
    localStorage.setItem('markdown-content', markdownEditor.value);
}

// Load content from localStorage
function loadFromLocalStorage() {
    const savedContent = localStorage.getItem('markdown-content');
    if (savedContent) {
        markdownEditor.value = savedContent;
        updatePreview();
        updateLineNumbers();
        updateStats();
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Check for Ctrl/Cmd key
    const isCtrl = e.ctrlKey || e.metaKey;
    
    // Save (Ctrl/Cmd + S)
    if (isCtrl && e.key === 's') {
        e.preventDefault();
        saveToLocalStorage();
        showToast('Content saved locally');
    }
    
    // Format (Ctrl/Cmd + Shift + F)
    if (isCtrl && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        formatMarkdown();
    }
    
    // Toggle theme (Ctrl/Cmd + Shift + T)
    if (isCtrl && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Toggle sync (Ctrl/Cmd + Shift + S)
    if (isCtrl && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        toggleScrollSync();
    }
    
    // Clear editor (Ctrl/Cmd + Shift + C)
    if (isCtrl && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        clearEditor();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Load saved content from localStorage
window.addEventListener('load', loadFromLocalStorage);