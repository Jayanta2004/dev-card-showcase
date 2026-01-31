// =========================================
// JSON Formatter & Validator
// =========================================

const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const formatBtn = document.getElementById('format-btn');
const minifyBtn = document.getElementById('minify-btn');
const validateBtn = document.getElementById('validate-btn');
const copyBtn = document.getElementById('copy-output');
const clearBtn = document.getElementById('clear-input');
const pasteBtn = document.getElementById('paste-input');
const statusEl = document.getElementById('status');
const sizeInfoEl = document.getElementById('size-info');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error');

// =========================================
// Utility Functions
// =========================================

/**
 * Parse JSON string and return result with error info
 */
function parseJSON(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return { success: true, data: parsed, error: null };
    } catch (error) {
        return { success: false, data: null, error: error.message };
    }
}

/**
 * Format JSON with indentation
 */
function formatJSON(jsonString, indent = 2) {
    const result = parseJSON(jsonString);
    if (!result.success) {
        return { success: false, data: null, error: result.error };
    }
    try {
        const formatted = JSON.stringify(result.data, null, indent);
        return { success: true, data: formatted, error: null };
    } catch (error) {
        return { success: false, data: null, error: error.message };
    }
}

/**
 * Minify JSON (remove all whitespace)
 */
function minifyJSON(jsonString) {
    const result = parseJSON(jsonString);
    if (!result.success) {
        return { success: false, data: null, error: result.error };
    }
    try {
        const minified = JSON.stringify(result.data);
        return { success: true, data: minified, error: null };
    } catch (error) {
        return { success: false, data: null, error: error.message };
    }
}

/**
 * Validate JSON
 */
function validateJSON(jsonString) {
    const result = parseJSON(jsonString);
    return {
        success: result.success,
        error: result.error
    };
}

/**
 * Calculate and display file size
 */
function updateSizeInfo() {
    const inputSize = new Blob([jsonInput.value]).size;
    const outputSize = new Blob([jsonOutput.value]).size;
    const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);
    
    if (inputSize > 0) {
        sizeInfoEl.textContent = `Input: ${formatBytes(inputSize)} | Output: ${formatBytes(outputSize)}`;
        if (reduction > 0 && outputSize < inputSize) {
            sizeInfoEl.textContent += ` | ${reduction}% smaller`;
        }
    } else {
        sizeInfoEl.textContent = '';
    }
}

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Update status indicator
 */
function setStatus(status, isValid) {
    statusEl.textContent = status;
    statusEl.className = 'status';
    
    if (isValid === true) {
        statusEl.classList.add('valid');
    } else if (isValid === false) {
        statusEl.classList.add('error');
    } else {
        statusEl.classList.add('neutral');
    }
}

/**
 * Show error message
 */
function showError(message) {
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
    setStatus('Error', false);
}

/**
 * Hide error message
 */
function hideError() {
    errorContainer.style.display = 'none';
}

/**
 * Copy to clipboard
 */
async function copyToClipboard() {
    if (!jsonOutput.value) {
        alert('Nothing to copy!');
        return;
    }

    try {
        await navigator.clipboard.writeText(jsonOutput.value);
        const originalText = copyBtn.textContent;
        copyBtn.innerHTML = '<span>✓</span> Copied!';
        copyBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        
        setTimeout(() => {
            copyBtn.innerHTML = '<span>📋</span> Copy';
            copyBtn.style.background = '';
        }, 2000);
    } catch (err) {
        showError('Failed to copy: ' + err.message);
    }
}

/**
 * Paste from clipboard
 */
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        jsonInput.value = text;
        formatJSON(text);
    } catch (err) {
        showError('Failed to paste: ' + err.message);
    }
}

// =========================================
// Event Listeners
// =========================================

formatBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
        showError('Please paste JSON to format');
        return;
    }

    const result = formatJSON(jsonInput.value, 2);
    
    if (result.success) {
        jsonOutput.value = result.data;
        hideError();
        setStatus('Valid JSON', true);
        updateSizeInfo();
    } else {
        showError('JSON Syntax Error:\n' + result.error);
        jsonOutput.value = '';
    }
});

minifyBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
        showError('Please paste JSON to minify');
        return;
    }

    const result = minifyJSON(jsonInput.value);
    
    if (result.success) {
        jsonOutput.value = result.data;
        hideError();
        setStatus('Valid JSON', true);
        updateSizeInfo();
    } else {
        showError('JSON Syntax Error:\n' + result.error);
        jsonOutput.value = '';
    }
});

validateBtn.addEventListener('click', () => {
    if (!jsonInput.value.trim()) {
        showError('Please paste JSON to validate');
        return;
    }

    const result = validateJSON(jsonInput.value);
    
    if (result.success) {
        hideError();
        setStatus('Valid JSON', true);
        jsonOutput.value = '✓ Valid JSON syntax';
        updateSizeInfo();
    } else {
        showError('JSON Syntax Error:\n' + result.error);
        jsonOutput.value = '';
    }
});

copyBtn.addEventListener('click', copyToClipboard);

clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.value = '';
    sizeInfoEl.textContent = '';
    setStatus('Ready', null);
    hideError();
});

pasteBtn.addEventListener('click', pasteFromClipboard);

closeErrorBtn.addEventListener('click', hideError);

// Allow Enter key to format (Ctrl+Enter)
jsonInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formatBtn.click();
    }
});

// =========================================
// Auto-format on paste
// =========================================

jsonInput.addEventListener('paste', () => {
    setTimeout(() => {
        // Auto-format after paste
        if (jsonInput.value.trim()) {
            const result = formatJSON(jsonInput.value, 2);
            if (result.success) {
                jsonOutput.value = result.data;
                hideError();
                setStatus('Valid JSON', true);
                updateSizeInfo();
            }
        }
    }, 10);
});

// =========================================
// Real-time validation as user types
// =========================================

let validationTimeout;
jsonInput.addEventListener('input', () => {
    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
        if (jsonInput.value.trim()) {
            const result = validateJSON(jsonInput.value);
            if (result.success) {
                setStatus('Valid', true);
            } else {
                // Only show error status, don't show full error unless user clicks validate
                setStatus('Invalid', false);
            }
        } else {
            setStatus('Ready', null);
        }
    }, 500);
});

// =========================================
// Theme Toggle (if dark mode is available)
// =========================================

function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('json-formatter-theme');
    
    if (savedTheme === 'dark' || (prefersDark && !savedTheme)) {
        document.body.classList.add('theme-dark');
    }
}

// Initialize theme on load
initTheme();

console.log('JSON Formatter & Validator initialized successfully!');
