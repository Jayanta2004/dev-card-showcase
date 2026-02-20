// Sample code for each language
const sampleCode = {
    javascript: `// Sample JavaScript function
function calculateSum(numbers) {
    // This function calculates the sum of an array
    let total = 0;
    for (let i = 0; i < numbers.length; i++) {
        total += numbers[i];
    }
    return total;
}

// Example usage
const numbers = [1, 2, 3, 4, 5];
const result = calculateSum(numbers);
console.log('Sum:', result);`,

    css: `/* Sample CSS Styles */
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

/* Button styles */
.button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
    text-decoration: none;
}

.button:hover {
    background-color: #0056b3;
}`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Page</title>
    <!-- Stylesheet link -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Main container -->
    <div class="container">
        <h1>Welcome to My Website</h1>
        <p>This is a sample paragraph with some text.</p>
        <button onclick="alert('Hello!')">Click Me</button>
    </div>
    <!-- JavaScript -->
    <script src="script.js"></script>
</body>
</html>`,

    json: `{
    "name": "sample-project",
    "version": "1.0.0",
    "description": "A sample JSON file",
    "author": {
        "name": "John Doe",
        "email": "john@example.com"
    },
    "dependencies": {
        "express": "^4.18.0",
        "react": "^18.2.0",
        "axios": "^1.3.0"
    },
    "scripts": {
        "start": "node index.js",
        "test": "jest",
        "build": "webpack"
    }
}`
};

// State management
let state = {
    currentLang: 'javascript',
    originalCode: '',
    minifiedCode: '',
    options: {
        removeComments: true,
        removeWhitespace: true,
        removeNewlines: true,
        syntaxHighlight: true
    }
};

// DOM elements
const elements = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    originalCode: document.getElementById('originalCode'),
    minifiedCode: document.getElementById('minifiedCode'),
    originalPreview: document.getElementById('originalPreview'),
    minifiedPreview: document.getElementById('minifiedPreview'),
    originalSize: document.getElementById('originalSize'),
    minifiedSize: document.getElementById('minifiedSize'),
    reduction: document.getElementById('reduction'),
    minifyBtn: document.getElementById('minifyBtn'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    clearBtn: document.getElementById('clearBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    removeComments: document.getElementById('removeComments'),
    removeWhitespace: document.getElementById('removeWhitespace'),
    removeNewlines: document.getElementById('removeNewlines'),
    syntaxHighlight: document.getElementById('syntaxHighlight'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// Initialize the application
function init() {
    attachEventListeners();
    updateStats();
}

// Attach event listeners
function attachEventListeners() {
    // Language tabs
    elements.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            switchLanguage(lang);
        });
    });

    // Text input
    elements.originalCode.addEventListener('input', () => {
        state.originalCode = elements.originalCode.value;
        updateStats();
        updatePreview('original');
    });

    // Buttons
    elements.minifyBtn.addEventListener('click', minifyCode);
    elements.copyBtn.addEventListener('click', copyToClipboard);
    elements.downloadBtn.addEventListener('click', downloadMinified);
    elements.clearBtn.addEventListener('click', clearCode);
    elements.loadSampleBtn.addEventListener('click', loadSample);

    // Options
    elements.removeComments.addEventListener('change', (e) => {
        state.options.removeComments = e.target.checked;
    });

    elements.removeWhitespace.addEventListener('change', (e) => {
        state.options.removeWhitespace = e.target.checked;
    });

    elements.removeNewlines.addEventListener('change', (e) => {
        state.options.removeNewlines = e.target.checked;
    });

    elements.syntaxHighlight.addEventListener('change', (e) => {
        state.options.syntaxHighlight = e.target.checked;
        toggleSyntaxHighlight();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            minifyCode();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearCode();
        }
    });
}

// Switch language
function switchLanguage(lang) {
    state.currentLang = lang;

    // Update active tab
    elements.tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });

    // Clear code
    clearCode();
}

// Minify code based on language
function minifyCode() {
    const code = elements.originalCode.value.trim();

    if (!code) {
        showToast('Please enter some code to minify', 'warning');
        return;
    }

    try {
        let minified = '';

        switch (state.currentLang) {
            case 'javascript':
                minified = minifyJavaScript(code);
                break;
            case 'css':
                minified = minifyCSS(code);
                break;
            case 'html':
                minified = minifyHTML(code);
                break;
            case 'json':
                minified = minifyJSON(code);
                break;
        }

        state.minifiedCode = minified;
        elements.minifiedCode.value = minified;
        updateStats();
        updatePreview('minified');
        showToast('Code minified successfully!', 'success');
    } catch (error) {
        showToast('Error minifying code: ' + error.message, 'error');
        console.error('Minification error:', error);
    }
}

// JavaScript minification
function minifyJavaScript(code) {
    let minified = code;

    // Remove single-line comments
    if (state.options.removeComments) {
        minified = minified.replace(/\/\/[^\n]*/g, '');
        // Remove multi-line comments
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // Remove extra whitespace
    if (state.options.removeWhitespace) {
        minified = minified.replace(/\s+/g, ' ');
    }

    // Remove newlines
    if (state.options.removeNewlines) {
        minified = minified.replace(/\n/g, ' ');
    }

    // Clean up spaces around operators and punctuation
    minified = minified.replace(/\s*([{}()[\];,:])\s*/g, '$1');
    minified = minified.replace(/\s*([=+\-*/<>!&|])\s*/g, '$1');

    return minified.trim();
}

// CSS minification
function minifyCSS(code) {
    let minified = code;

    // Remove comments
    if (state.options.removeComments) {
        minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    // Remove extra whitespace
    if (state.options.removeWhitespace) {
        minified = minified.replace(/\s+/g, ' ');
    }

    // Remove newlines
    if (state.options.removeNewlines) {
        minified = minified.replace(/\n/g, '');
    }

    // Clean up spaces around CSS syntax
    minified = minified.replace(/\s*([{}:;,])\s*/g, '$1');
    minified = minified.replace(/;\}/g, '}');
    minified = minified.replace(/\s*>\s*/g, '>');

    return minified.trim();
}

// HTML minification
function minifyHTML(code) {
    let minified = code;

    // Remove HTML comments
    if (state.options.removeComments) {
        minified = minified.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove extra whitespace between tags
    if (state.options.removeWhitespace) {
        minified = minified.replace(/>\s+</g, '><');
        minified = minified.replace(/\s+/g, ' ');
    }

    // Remove newlines
    if (state.options.removeNewlines) {
        minified = minified.replace(/\n/g, '');
    }

    return minified.trim();
}

// JSON minification
function minifyJSON(code) {
    try {
        // Parse and stringify to minify
        const parsed = JSON.parse(code);
        return JSON.stringify(parsed);
    } catch (error) {
        throw new Error('Invalid JSON format');
    }
}

// Update statistics
function updateStats() {
    const originalSize = new Blob([elements.originalCode.value]).size;
    const minifiedSize = new Blob([elements.minifiedCode.value]).size;
    const reduction = originalSize > 0 
        ? ((originalSize - minifiedSize) / originalSize * 100).toFixed(1)
        : 0;

    elements.originalSize.textContent = formatBytes(originalSize);
    elements.minifiedSize.textContent = formatBytes(minifiedSize);
    elements.reduction.textContent = `${reduction}%`;

    // Color code the reduction
    if (reduction > 50) {
        elements.reduction.style.color = '#10b981';
    } else if (reduction > 25) {
        elements.reduction.style.color = '#f59e0b';
    } else {
        elements.reduction.style.color = '#6b7280';
    }
}

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Update syntax highlighting preview
function updatePreview(type) {
    if (!state.options.syntaxHighlight) return;

    const code = type === 'original' 
        ? elements.originalCode.value 
        : elements.minifiedCode.value;
    
    const preview = type === 'original'
        ? elements.originalPreview
        : elements.minifiedPreview;

    if (!code) {
        preview.innerHTML = '';
        return;
    }

    // Map language to Prism language
    const langMap = {
        javascript: 'javascript',
        css: 'css',
        html: 'markup',
        json: 'json'
    };

    const prismLang = langMap[state.currentLang];
    const highlighted = Prism.highlight(code, Prism.languages[prismLang], prismLang);
    
    preview.innerHTML = `<pre><code class="language-${prismLang}">${highlighted}</code></pre>`;
}

// Toggle syntax highlighting
function toggleSyntaxHighlight() {
    if (state.options.syntaxHighlight) {
        elements.originalCode.style.display = 'none';
        elements.minifiedCode.style.display = 'none';
        elements.originalPreview.classList.add('active');
        elements.minifiedPreview.classList.add('active');
        updatePreview('original');
        updatePreview('minified');
    } else {
        elements.originalCode.style.display = 'block';
        elements.minifiedCode.style.display = 'block';
        elements.originalPreview.classList.remove('active');
        elements.minifiedPreview.classList.remove('active');
    }
}

// Copy to clipboard
function copyToClipboard() {
    const code = elements.minifiedCode.value;

    if (!code) {
        showToast('Nothing to copy!', 'warning');
        return;
    }

    navigator.clipboard.writeText(code).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// Download minified file
function downloadMinified() {
    const code = elements.minifiedCode.value;

    if (!code) {
        showToast('Nothing to download!', 'warning');
        return;
    }

    const extensions = {
        javascript: 'js',
        css: 'css',
        html: 'html',
        json: 'json'
    };

    const ext = extensions[state.currentLang];
    const filename = `minified.${ext}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    showToast(`Downloaded as ${filename}!`, 'success');
}

// Clear code
function clearCode() {
    elements.originalCode.value = '';
    elements.minifiedCode.value = '';
    state.originalCode = '';
    state.minifiedCode = '';
    elements.originalPreview.innerHTML = '';
    elements.minifiedPreview.innerHTML = '';
    updateStats();
}

// Load sample code
function loadSample() {
    const sample = sampleCode[state.currentLang];
    elements.originalCode.value = sample;
    state.originalCode = sample;
    updateStats();
    updatePreview('original');
    showToast('Sample code loaded!', 'success');
}

// Show toast notification
function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    elements.toast.className = `toast ${type} show`;

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
