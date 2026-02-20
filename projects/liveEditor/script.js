// DOM Elements
const codeEditor = document.getElementById('codeEditor');
const previewFrame = document.getElementById('previewFrame');
const previewOverlay = document.getElementById('previewOverlay');
const runBtn = document.getElementById('runBtn');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const clearSnippetsBtn = document.getElementById('clearSnippetsBtn');
const snippetsContainer = document.getElementById('snippetsContainer');
const snippetCount = document.getElementById('snippetCount');
const lastSaved = document.getElementById('lastSaved');
const refreshPreview = document.getElementById('refreshPreview');
const themeToggle = document.getElementById('themeToggle');
const fontSizeToggle = document.getElementById('fontSizeToggle');
const snippetModal = document.getElementById('snippetModal');
const snippetNameInput = document.getElementById('snippetName');
const confirmSaveBtn = document.getElementById('confirmSave');
const cancelSaveBtn = document.getElementById('cancelSave');
const closeModalBtn = document.querySelector('.close-modal');

// Default code template
const defaultCode = `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #fff, #a5b4fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 30px;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .feature {
            background: rgba(255, 255, 255, 0.15);
            padding: 20px;
            border-radius: 10px;
            transition: transform 0.3s;
        }
        .feature:hover {
            transform: translateY(-5px);
        }
        .feature i {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        button {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.1rem;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 600;
            margin: 10px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }
        .dynamic-text {
            font-size: 1.5rem;
            margin: 30px 0;
            min-height: 50px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✨ Welcome to CodeCanvas!</h1>
        <p>This is a live preview. Edit the code to see instant results.</p>
        
        <div class="feature-grid">
            <div class="feature">
                <i class="fas fa-bolt"></i>
                <h3>Live Preview</h3>
                <p>See changes instantly</p>
            </div>
            <div class="feature">
                <i class="fas fa-save"></i>
                <h3>Save Snippets</h3>
                <p>Store your code snippets</p>
            </div>
            <div class="feature">
                <i class="fas fa-palette"></i>
                <h3>Modern UI</h3>
                <p>Beautiful interface</p>
            </div>
        </div>
        
        <div class="dynamic-text" id="dynamicText">
            Click the button below!
        </div>
        
        <button onclick="changeText()">Click Me!</button>
        <button onclick="changeColor()">Change Theme</button>
    </div>

    <script>
        const colors = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444'];
        let colorIndex = 0;
        
        function changeText() {
            const texts = [
                "🎉 You clicked the button!",
                "🚀 CodeCanvas is awesome!",
                "💡 Try editing the code!",
                "✨ Save your snippets!",
                "🌈 Customize everything!"
            ];
            const randomText = texts[Math.floor(Math.random() * texts.length)];
            document.getElementById('dynamicText').textContent = randomText;
        }
        
        function changeColor() {
            const container = document.querySelector('.container');
            colorIndex = (colorIndex + 1) % colors.length;
            document.body.style.background = \`linear-gradient(135deg, \${colors[colorIndex]} 0%, \${colors[(colorIndex + 2) % colors.length]} 100%)\`;
        }
        
        // Initial animation
        setTimeout(() => {
            changeText();
        }, 1000);
    </script>
</body>
</html>`;

// State Management
let currentSnippetId = null;
let fontSizeIndex = 0;
let isDarkTheme = false;
const fontSizes = [12, 14, 16, 18];

// Initialize the application
function init() {
    // Set default code
    codeEditor.value = defaultCode;
    
    // Update editor stats
    updateEditorStats();
    
    // Run initial code
    runCode();
    
    // Load saved snippets
    loadSnippets();
    
    // Update last saved time
    updateLastSaved();
}

// Run code and update preview
function runCode() {
    try {
        showPreviewOverlay();
        
        const code = codeEditor.value;
        const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        
        previewDoc.open();
        previewDoc.write(code);
        previewDoc.close();
        
        setTimeout(hidePreviewOverlay, 300);
    } catch (error) {
        console.error('Error running code:', error);
        hidePreviewOverlay();
    }
}

// Show/hide preview overlay
function showPreviewOverlay() {
    previewOverlay.classList.add('show');
}

function hidePreviewOverlay() {
    previewOverlay.classList.remove('show');
}

// Save snippet functionality
function saveSnippet() {
    const code = codeEditor.value.trim();
    if (!code) {
        showNotification('Cannot save empty code!', 'warning');
        return;
    }
    
    // Show modal for snippet name
    snippetNameInput.value = `Snippet ${new Date().toLocaleDateString()}`;
    openSnippetModal();
}

function confirmSnippetSave() {
    const name = snippetNameInput.value.trim();
    if (!name) {
        showNotification('Please enter a snippet name!', 'warning');
        return;
    }
    
    const code = codeEditor.value.trim();
    const snippet = {
        id: Date.now(),
        name: name,
        code: code,
        date: new Date().toLocaleString(),
        preview: code.substring(0, 200)
    };
    
    // Get existing snippets
    const snippets = JSON.parse(localStorage.getItem('codeSnippets') || '[]');
    snippets.push(snippet);
    
    // Save to localStorage
    localStorage.setItem('codeSnippets', JSON.stringify(snippets));
    
    // Update UI
    loadSnippets();
    updateLastSaved();
    closeSnippetModal();
    
    // Show success notification
    showNotification(`Snippet "${name}" saved successfully!`, 'success');
}

// Load snippets from localStorage
function loadSnippets() {
    const snippets = JSON.parse(localStorage.getItem('codeSnippets') || '[]');
    
    snippetCount.textContent = snippets.length;
    
    if (snippets.length === 0) {
        snippetsContainer.innerHTML = `
            <div class="no-snippets">
                <i class="fas fa-code"></i>
                <h3>No snippets yet</h3>
                <p>Save your first code snippet to get started!</p>
            </div>
        `;
        return;
    }
    
    // Clear container
    snippetsContainer.innerHTML = '';
    
    // Display snippets (newest first)
    snippets.slice().reverse().forEach(snippet => {
        const snippetElement = document.createElement('div');
        snippetElement.className = 'snippet-card';
        snippetElement.innerHTML = `
            <div class="snippet-header">
                <div class="snippet-title">${snippet.name}</div>
                <div class="snippet-date">${snippet.date}</div>
            </div>
            <div class="snippet-preview">${snippet.preview || snippet.code.substring(0, 200)}</div>
            <div class="snippet-actions">
                <button class="btn btn-primary btn-small" onclick="loadSnippet(${snippet.id})">
                    <i class="fas fa-pencil-alt"></i> Load
                </button>
                <button class="btn btn-outline btn-small" onclick="copySnippet(${snippet.id})">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="btn btn-danger btn-small" onclick="deleteSnippet(${snippet.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        snippetsContainer.appendChild(snippetElement);
    });
}

// Load a specific snippet
function loadSnippet(id) {
    const snippets = JSON.parse(localStorage.getItem('codeSnippets') || '[]');
    const snippet = snippets.find(s => s.id === id);
    
    if (snippet) {
        codeEditor.value = snippet.code;
        updateEditorStats();
        runCode();
        showNotification(`Loaded: ${snippet.name}`, 'success');
    }
}

// Copy snippet to clipboard
function copySnippet(id) {
    const snippets = JSON.parse(localStorage.getItem('codeSnippets') || '[]');
    const snippet = snippets.find(s => s.id === id);
    
    if (snippet) {
        navigator.clipboard.writeText(snippet.code)
            .then(() => showNotification('Code copied to clipboard!', 'success'))
            .catch(err => showNotification('Failed to copy code', 'error'));
    }
}

// Delete a snippet
function deleteSnippet(id) {
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    
    const snippets = JSON.parse(localStorage.getItem('codeSnippets') || '[]');
    const filteredSnippets = snippets.filter(s => s.id !== id);
    
    localStorage.setItem('codeSnippets', JSON.stringify(filteredSnippets));
    loadSnippets();
    showNotification('Snippet deleted!', 'success');
}

// Clear all snippets
function clearAllSnippets() {
    if (!confirm('Are you sure you want to delete ALL snippets? This cannot be undone.')) return;
    
    localStorage.removeItem('codeSnippets');
    loadSnippets();
    showNotification('All snippets cleared!', 'success');
}

// Update editor statistics
function updateEditorStats() {
    const text = codeEditor.value;
    const charCount = text.length;
    const lineCount = text.split('\n').length;
    
    document.getElementById('charCount').textContent = `${charCount.toLocaleString()} characters`;
    document.getElementById('lineCount').textContent = `${lineCount} lines`;
}

// Update last saved time
function updateLastSaved() {
    const saved = localStorage.getItem('lastSaved');
    if (saved) {
        lastSaved.textContent = `Last saved: ${new Date(parseInt(saved)).toLocaleTimeString()}`;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Modal functions
function openSnippetModal() {
    snippetModal.classList.add('show');
    snippetNameInput.focus();
}

function closeSnippetModal() {
    snippetModal.classList.remove('show');
    snippetNameInput.value = '';
}

// Toggle font size
function toggleFontSize() {
    fontSizeIndex = (fontSizeIndex + 1) % fontSizes.length;
    const newSize = fontSizes[fontSizeIndex];
    codeEditor.style.fontSize = `${newSize}px`;
    showNotification(`Font size: ${newSize}px`, 'info');
}

// Toggle theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const icon = themeToggle.querySelector('i');
    
    if (isDarkTheme) {
        document.documentElement.style.setProperty('--editor-bg', '#0f172a');
        document.documentElement.style.setProperty('--light', '#1e293b');
        document.documentElement.style.setProperty('--dark', '#f1f5f9');
        icon.className = 'fas fa-sun';
        showNotification('Dark theme activated', 'info');
    } else {
        document.documentElement.style.setProperty('--editor-bg', '#1e293b');
        document.documentElement.style.setProperty('--light', '#f9fafb');
        document.documentElement.style.setProperty('--dark', '#1f2937');
        icon.className = 'fas fa-moon';
        showNotification('Light theme activated', 'info');
    }
}

// Event Listeners
codeEditor.addEventListener('input', function() {
    updateEditorStats();
    localStorage.setItem('lastSaved', Date.now().toString());
    updateLastSaved();
});

// Auto-run with debounce
let debounceTimer;
codeEditor.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runCode, 800);
});

runBtn.addEventListener('click', runCode);
saveBtn.addEventListener('click', saveSnippet);
clearBtn.addEventListener('click', () => {
    if (confirm('Clear the editor? This cannot be undone.')) {
        codeEditor.value = '';
        updateEditorStats();
        runCode();
    }
});

clearSnippetsBtn.addEventListener('click', clearAllSnippets);
refreshPreview.addEventListener('click', runCode);
fontSizeToggle.addEventListener('click', toggleFontSize);
themeToggle.addEventListener('click', toggleTheme);
confirmSaveBtn.addEventListener('click', confirmSnippetSave);
cancelSaveBtn.addEventListener('click', closeSnippetModal);
closeModalBtn.addEventListener('click', closeSnippetModal);

// Close modal on outside click
snippetModal.addEventListener('click', (e) => {
    if (e.target === snippetModal) {
        closeSnippetModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && snippetModal.classList.contains('show')) {
        closeSnippetModal();
    }
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);