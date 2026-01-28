// DOM Elements
const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const formatBtn = document.getElementById('formatBtn');
const minifyBtn = document.getElementById('minifyBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const status = document.getElementById('status');
const charCount = document.getElementById('charCount');
const notification = document.getElementById('notification');

// Event Listeners
jsonInput.addEventListener('input', () => {
    updateCharCount();
    validateJSON();
});

formatBtn.addEventListener('click', formatJSON);
minifyBtn.addEventListener('click', minifyJSON);
copyBtn.addEventListener('click', copyOutput);
clearBtn.addEventListener('click', clearAll);

// Function to validate JSON
function validateJSON() {
    const input = jsonInput.value.trim();

    if (!input) {
        status.className = 'status empty';
        status.textContent = 'Waiting for input...';
        jsonOutput.value = '';
        return false;
    }

    try {
        JSON.parse(input);
        status.className = 'status valid';
        status.textContent = '✓ Valid JSON';
        return true;
    } catch (error) {
        status.className = 'status invalid';
        const errorMsg = error.message;
        const match = errorMsg.match(/position (\d+)/);
        if (match) {
            status.textContent = `✗ Invalid - ${errorMsg}`;
        } else {
            status.textContent = `✗ Invalid - ${errorMsg}`;
        }
        jsonOutput.value = '';
        return false;
    }
}

// Function to format JSON with indentation
function formatJSON() {
    const input = jsonInput.value.trim();

    if (!input) {
        showNotification('Please enter some JSON first', 'error');
        return;
    }

    try {
        const parsed = JSON.parse(input);
        const formatted = JSON.stringify(parsed, null, 2);
        jsonOutput.value = formatted;
        validateJSON();
        showNotification('JSON formatted successfully!', 'success');
    } catch (error) {
        status.className = 'status invalid';
        status.textContent = `✗ Invalid JSON - ${error.message}`;
        jsonOutput.value = '';
        showNotification('Invalid JSON: ' + error.message, 'error');
    }
}

// Function to minify JSON
function minifyJSON() {
    const input = jsonInput.value.trim();

    if (!input) {
        showNotification('Please enter some JSON first', 'error');
        return;
    }

    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        jsonOutput.value = minified;
        validateJSON();
        showNotification('JSON minified successfully!', 'success');
    } catch (error) {
        status.className = 'status invalid';
        status.textContent = `✗ Invalid JSON - ${error.message}`;
        jsonOutput.value = '';
        showNotification('Invalid JSON: ' + error.message, 'error');
    }
}

// Function to copy output to clipboard
function copyOutput() {
    if (!jsonOutput.value) {
        showNotification('Nothing to copy - format JSON first!', 'error');
        return;
    }

    jsonOutput.select();
    document.execCommand('copy');
    showNotification('Output copied to clipboard!', 'success');
}

// Function to clear all content
function clearAll() {
    jsonInput.value = '';
    jsonOutput.value = '';
    status.className = 'status empty';
    status.textContent = 'Waiting for input...';
    charCount.textContent = '0 characters';
}

// Function to update character count
function updateCharCount() {
    const length = jsonInput.value.length;
    charCount.textContent = length + ' character' + (length !== 1 ? 's' : '');
}

// Function to show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to format
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        formatJSON();
    }
    // Ctrl+Shift+M or Cmd+Shift+M to minify
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        minifyJSON();
    }
});

// Initialize
updateCharCount();
status.className = 'status empty';
status.textContent = 'Waiting for input...';

// Sample JSON for testing (optional - can be removed)
const sampleJSON = {
    "name": "JSON Formatter",
    "version": "1.0.0",
    "description": "A powerful JSON formatting and validation tool",
    "features": [
        "Format JSON",
        "Minify JSON",
        "Validate JSON",
        "Copy to clipboard"
    ],
    "author": "Dev Team",
    "timestamp": new Date().toISOString()
};

// Add a function to load sample JSON
window.loadSample = function() {
    jsonInput.value = JSON.stringify(sampleJSON, null, 2);
    updateCharCount();
    validateJSON();
};
