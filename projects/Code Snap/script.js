/**
 * Code-Snap Engine
 * Handles UI interactions, Syntax Highlighting (Regex-based), and Image Export.
 */

// --- DOM Elements ---
const captureTarget = document.getElementById('capture-target');
const windowFrame = document.getElementById('window-frame');
const windowControls = document.getElementById('window-controls');
const rawInput = document.getElementById('raw-input');
const highlightedCode = document.getElementById('highlighted-code');
const lineNumbers = document.getElementById('line-numbers');
const paddingSlider = document.getElementById('padding-slider');
const shadowSlider = document.getElementById('shadow-slider');

// --- State Configuration ---
const config = {
    lang: 'javascript',
    theme: 'dracula',
    padding: 64,
    shadow: 0.5
};

// --- Syntax Highlighting Definitions (Regex) ---
// Note: This is a simplified tokenizer. For full production, use Prism.js or Highlight.js
const SYNTAX_RULES = {
    javascript: [
        { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, type: 'comment' },
        { regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, type: 'string' },
        { regex: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|new|this)\b/g, type: 'keyword' },
        { regex: /\b(true|false|null|undefined)\b/g, type: 'keyword' },
        { regex: /\b\d+(\.\d+)?\b/g, type: 'number' },
        { regex: /\b[A-Z][a-zA-Z0-9_]*\b/g, type: 'class' },
        { regex: /\b[a-zA-Z_]\w*(?=\()/g, type: 'function' },
        { regex: /[+\-*/%=&|<>!^?]+/g, type: 'operator' }
    ],
    python: [
        { regex: /#.*/g, type: 'comment' },
        { regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, type: 'string' },
        { regex: /\b(def|class|return|if|else|elif|for|while|import|from|as|try|except|print|with|pass|lambda)\b/g, type: 'keyword' },
        { regex: /\b(True|False|None)\b/g, type: 'keyword' },
        { regex: /\b\d+(\.\d+)?\b/g, type: 'number' },
        { regex: /\b[A-Z][a-zA-Z0-9_]*\b/g, type: 'class' },
        { regex: /\b[a-zA-Z_]\w*(?=\()/g, type: 'function' }
    ],
    html: [
        { regex: /&lt;!--[\s\S]*?--&gt;/g, type: 'comment' },
        { regex: /&lt;\/?[a-zA-Z0-9]+|&gt;/g, type: 'keyword' }, // Tags
        { regex: /".*?"/g, type: 'string' },
        { regex: /\b[a-zA-Z-]+(?==)/g, type: 'function' } // Attributes
    ],
    css: [
        { regex: /\/\*[\s\S]*?\*\//g, type: 'comment' },
        { regex: /[a-zA-Z-]+(?=:)/g, type: 'keyword' }, // Properties
        { regex: /:\s*[^;]+/g, type: 'string' }, // Values (simplified)
        { regex: /[.#][a-zA-Z0-9_-]+/g, type: 'class' }, // Selectors
    ],
    sql: [
        { regex: /--.*/g, type: 'comment' },
        { regex: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|ON|GROUP|BY|ORDER|HAVING|LIMIT|Create|TABLE|VALUES|AND|OR|NOT|NULL)\b/gi, type: 'keyword' },
        { regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, type: 'string' },
        { regex: /\b\d+\b/g, type: 'number' }
    ]
};

// Fallback for languages not strictly defined (java/cpp uses js rules approx)
SYNTAX_RULES.java = SYNTAX_RULES.javascript;

// --- Themes (CSS Variable Mapping) ---
const THEMES = {
    dracula: { bg: '#282a36', fg: '#f8f8f2', comment: '#6272a4', keyword: '#ff79c6', string: '#f1fa8c', func: '#50fa7b', num: '#bd93f9', op: '#ff79c6', cls: '#8be9fd' },
    monokai: { bg: '#272822', fg: '#f8f8f2', comment: '#75715e', keyword: '#f92672', string: '#e6db74', func: '#a6e22e', num: '#ae81ff', op: '#f92672', cls: '#66d9ef' },
    material: { bg: '#0f111a', fg: '#a6accd', comment: '#464b5d', keyword: '#c792ea', string: '#c3e88d', func: '#82aaff', num: '#f78c6c', op: '#89ddff', cls: '#ffcb6b' },
    nord: { bg: '#2e3440', fg: '#d8dee9', comment: '#4c566a', keyword: '#81a1c1', string: '#a3be8c', func: '#88c0d0', num: '#b48ead', op: '#81a1c1', cls: '#8fbcbb' },
    cyberpunk: { bg: '#0b0c15', fg: '#e0e0e0', comment: '#5c6773', keyword: '#ff0055', string: '#00ff9f', func: '#00eaff', num: '#bd00ff', op: '#ff0055', cls: '#ffee00' }
};

// --- Initialization ---
function init() {
    setupEventListeners();
    updateTheme('dracula');
    processCode(); // Initial Highlight
}

function setupEventListeners() {
    // 1. Text Input Handling
    rawInput.addEventListener('input', () => {
        processCode();
        updateLineNumbers();
        autoResize();
    });

    // 2. Window Style Toggle
    document.getElementById('btn-mac').addEventListener('click', (e) => setWindowStyle('mac', e));
    document.getElementById('btn-win').addEventListener('click', (e) => setWindowStyle('win', e));

    // 3. Theme Select
    document.getElementById('theme-select').addEventListener('change', (e) => updateTheme(e.target.value));

    // 4. Language Select
    document.getElementById('lang-select').addEventListener('change', (e) => {
        config.lang = e.target.value;
        processCode();
    });

    // 5. Background Color Grid
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            captureTarget.style.background = btn.dataset.bg;
        });
    });

    // 6. Padding Slider
    paddingSlider.addEventListener('input', (e) => {
        const val = e.target.value + 'px';
        document.getElementById('padding-val').innerText = val;
        captureTarget.style.padding = val;
    });

    // 7. Shadow Slider
    shadowSlider.addEventListener('input', (e) => {
        const opacity = e.target.value / 100;
        document.getElementById('shadow-val').innerText = e.target.value + '%';
        windowFrame.style.boxShadow = `0 20px 50px rgba(0,0,0,${opacity})`;
    });

    // 8. Toggles
    document.getElementById('check-line-nums').addEventListener('change', (e) => {
        e.target.checked ? lineNumbers.classList.remove('hidden') : lineNumbers.classList.add('hidden');
    });
    
    document.getElementById('check-watermark').addEventListener('change', (e) => {
        const wm = document.getElementById('watermark');
        e.target.checked ? wm.classList.remove('hidden') : wm.classList.add('hidden');
    });

    // 9. Export Buttons
    document.getElementById('btn-download').addEventListener('click', downloadImage);
    document.getElementById('btn-copy').addEventListener('click', copyImage);
}

// --- Logic Functions ---

function processCode() {
    let code = rawInput.value;
    
    // HTML Escape
    code = code.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;");

    // Apply Syntax Highlighting
    const highlighted = highlightSyntax(code, config.lang);
    highlightedCode.innerHTML = highlighted;
}

/**
 * Custom Syntax Highlighter
 * Breaks text into tokens and wraps them in spans based on regex rules.
 */
function highlightSyntax(text, lang) {
    const rules = SYNTAX_RULES[lang] || SYNTAX_RULES.javascript;
    
    // Simple tokenizer approach: 
    // We mask matches to avoid double-highlighting, then unmask.
    // NOTE: This is a basic implementation.
    
    let tokens = []; 
    let placeholderMap = {};
    let uniqueId = 0;

    // Helper to store token and return placeholder
    const mask = (match, type) => {
        const id = `__TOKEN_${uniqueId++}__`;
        placeholderMap[id] = `<span class="token ${type}">${match}</span>`;
        return id;
    };

    let processed = text;

    rules.forEach(rule => {
        processed = processed.replace(rule.regex, (match) => mask(match, rule.type));
    });

    // Restore tokens
    // We must loop until no placeholders remain (in case of overlap/nesting limitations)
    // Since this is simple, one pass usually suffices for non-nested tokens.
    Object.keys(placeholderMap).forEach(id => {
        // Replace all occurrences of the ID
        processed = processed.split(id).join(placeholderMap[id]);
    });

    return processed;
}

function updateLineNumbers() {
    const lines = rawInput.value.split('\n').length;
    lineNumbers.innerHTML = Array(lines).fill(0).map((_, i) => `<span>${i + 1}</span>`).join('');
}

function autoResize() {
    // Grow textarea height based on content
    rawInput.style.height = 'auto';
    rawInput.style.height = rawInput.scrollHeight + 'px';
}

function setWindowStyle(style, event) {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    windowControls.className = `window-controls ${style}`;
    
    // Reset dots for windows
    const dots = windowControls.querySelectorAll('.dot');
    if (style === 'win') {
        dots.forEach(d => { d.className = 'dot'; });
    } else {
        dots[0].className = 'dot red';
        dots[1].className = 'dot yellow';
        dots[2].className = 'dot green';
    }
}

function updateTheme(themeName) {
    const t = THEMES[themeName];
    const root = document.documentElement;
    
    root.style.setProperty('--th-bg', t.bg);
    root.style.setProperty('--th-fg', t.fg);
    root.style.setProperty('--th-comment', t.comment);
    root.style.setProperty('--th-keyword', t.keyword);
    root.style.setProperty('--th-string', t.string);
    root.style.setProperty('--th-function', t.func);
    root.style.setProperty('--th-number', t.num);
    root.style.setProperty('--th-operator', t.op);
    root.style.setProperty('--th-class', t.cls);
}

// --- Export Functions ---

async function generateCanvas() {
    // Temporarily disable scaling or transforms if any
    const canvas = await html2canvas(captureTarget, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null
    });
    return canvas;
}

function downloadImage() {
    const btn = document.getElementById('btn-download');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    generateCanvas().then(canvas => {
        const link = document.createElement('a');
        link.download = 'code-snap.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        btn.innerHTML = originalText;
    });
}

function copyImage() {
    const btn = document.getElementById('btn-copy');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    generateCanvas().then(canvas => {
        canvas.toBlob(blob => {
            navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => btn.innerHTML = originalText, 2000);
            });
        });
    });
}

// Start
init();