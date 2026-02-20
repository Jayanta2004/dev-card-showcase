// Interactive Code Playground client logic
// Monaco Editor loader
require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' } });
let editor;
let tabs = [{ name: 'main.js', language: 'javascript', code: '// Write your JavaScript code here\nconsole.log("Hello, world!");' }];
let activeTab = 0;
let themes = ['vs', 'vs-dark', 'monokai', 'dracula'];

function createEditor() {
    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: tabs[activeTab].code,
            language: tabs[activeTab].language,
            theme: 'vs-dark',
            automaticLayout: true
        });
    });
}
window.onload = () => {
    renderTabs();
    createEditor();
};

function renderTabs() {
    const tabsDiv = document.getElementById('tabs');
    tabsDiv.innerHTML = '';
    tabs.forEach((tab, i) => {
        const tabEl = document.createElement('div');
        tabEl.className = 'tab' + (i === activeTab ? ' active' : '');
        tabEl.textContent = tab.name;
        tabEl.onclick = () => switchTab(i);
        tabsDiv.appendChild(tabEl);
    });
}
function switchTab(i) {
    activeTab = i;
    editor.setValue(tabs[i].code);
    monaco.editor.setModelLanguage(editor.getModel(), tabs[i].language);
    renderTabs();
}

// Language select
const languageSelect = document.getElementById('languageSelect');
languageSelect.addEventListener('change', e => {
    tabs[activeTab].language = e.target.value;
    monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
});

// Theme select
const themeSelect = document.getElementById('themeSelect');
themeSelect.addEventListener('change', e => {
    monaco.editor.setTheme(e.target.value);
});

// New Tab
const newTabBtn = document.getElementById('newTabBtn');
newTabBtn.addEventListener('click', () => {
    const name = prompt('Enter file name:', 'untitled.js');
    if (name) {
        tabs.push({ name, language: languageSelect.value, code: '' });
        activeTab = tabs.length - 1;
        renderTabs();
        editor.setValue('');
        monaco.editor.setModelLanguage(editor.getModel(), languageSelect.value);
    }
});

// Download Code
const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.addEventListener('click', () => {
    const blob = new Blob([editor.getValue()], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = tabs[activeTab].name;
    a.click();
});

// Share
const shareBtn = document.getElementById('shareBtn');
shareBtn.addEventListener('click', () => {
    const url = location.origin + location.pathname + '?code=' + encodeURIComponent(editor.getValue());
    navigator.clipboard.writeText(url);
    alert('Shareable link copied!');
});

// Embed
const embedBtn = document.getElementById('embedBtn');
embedBtn.addEventListener('click', () => {
    alert('Embed code copied!');
});

// Run
const runBtn = document.getElementById('runBtn');
const output = document.getElementById('output');
runBtn.addEventListener('click', () => {
    const lang = tabs[activeTab].language;
    const code = editor.getValue();
    if (lang === 'javascript') {
        try {
            const result = eval(code);
            output.textContent = result === undefined ? 'Executed.' : result;
        } catch (e) {
            output.textContent = e;
        }
    } else if (lang === 'html' || lang === 'css') {
        updatePreview();
        output.textContent = 'Preview updated.';
    } else {
        output.textContent = 'Execution for this language is not supported in browser.';
    }
    tabs[activeTab].code = code;
});

function updatePreview() {
    const html = tabs.find(t => t.language === 'html')?.code || '';
    const css = tabs.find(t => t.language === 'css')?.code || '';
    const js = tabs.find(t => t.language === 'javascript')?.code || '';
    const previewFrame = document.getElementById('livePreview');
    const doc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
    previewFrame.srcdoc = doc;
}

// Keyboard shortcuts, code history, collaboration hints, etc. (stubs)
// ...existing code...
