// DOM Elements
const regexInput = document.getElementById('regexInput');
const testString = document.getElementById('testString');
const flagGlobal = document.getElementById('flagGlobal');
const flagCaseInsensitive = document.getElementById('flagCaseInsensitive');
const flagMultiline = document.getElementById('flagMultiline');
const highlightedText = document.getElementById('highlightedText');
const matchList = document.getElementById('matchList');
const matchCount = document.getElementById('matchCount');
const errorStatus = document.getElementById('errorStatus');
const errorIndicator = document.getElementById('errorIndicator');
const errorDisplay = document.getElementById('errorDisplay');
const charCount = document.getElementById('charCount');
const lineCount = document.getElementById('lineCount');
const themeToggle = document.getElementById('themeToggle');
const cheatSheetContent = document.getElementById('cheatSheetContent');
const toggleCheatSheet = document.getElementById('toggleCheatSheet');
const copyHighlighted = document.getElementById('copyHighlighted');
const clearAll = document.getElementById('clearAll');
const toggleGroups = document.getElementById('toggleGroups');
const exportMatches = document.getElementById('exportMatches');
const actionButtons = document.querySelectorAll('.action-btn');
const regexReference = document.getElementById('regexReference');
const resetTool = document.getElementById('resetTool');
const toast = document.getElementById('toast');

// State
let currentRegex = null;
let matches = [];
let showGroups = true;
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize
function init() {
    // Set theme
    setTheme(currentTheme);
    
    // Update text stats
    updateTextStats();
    
    // Initial regex test
    testRegex();
    
    // Set up event listeners
    setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
    // Regex input events
    regexInput.addEventListener('input', testRegex);
    regexInput.addEventListener('keydown', handleRegexKeydown);
    
    // Test string events
    testString.addEventListener('input', () => {
        updateTextStats();
        testRegex();
    });
    
    // Flag events
    flagGlobal.addEventListener('change', testRegex);
    flagCaseInsensitive.addEventListener('change', testRegex);
    flagMultiline.addEventListener('change', testRegex);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Cheat sheet toggle
    toggleCheatSheet.addEventListener('click', () => {
        cheatSheetContent.parentElement.classList.toggle('collapsed');
        toggleCheatSheet.querySelector('i').classList.toggle('fa-chevron-up');
        toggleCheatSheet.querySelector('i').classList.toggle('fa-chevron-down');
    });
    
    // Action buttons
    copyHighlighted.addEventListener('click', copyHighlightedText);
    clearAll.addEventListener('click', clearAllInputs);
    toggleGroups.addEventListener('click', () => {
        showGroups = !showGroups;
        updateMatchList();
        showToast(showGroups ? 'Group details shown' : 'Group details hidden');
    });
    exportMatches.addEventListener('click', exportMatchesAsJSON);
    
    // Quick action buttons
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const regex = button.getAttribute('data-regex');
            regexInput.value = regex;
            testRegex();
            showToast(`Applied pattern: ${regex}`);
        });
    });
    
    // Footer links
    regexReference.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions', '_blank');
    });
    
    resetTool.addEventListener('click', (e) => {
        e.preventDefault();
        resetToDefaults();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeydown);
}

// Handle regex input keydown
function handleRegexKeydown(e) {
    // Tab key inserts 4 spaces
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = regexInput.selectionStart;
        const end = regexInput.selectionEnd;
        regexInput.value = regexInput.value.substring(0, start) + '    ' + regexInput.value.substring(end);
        regexInput.selectionStart = regexInput.selectionEnd = start + 4;
        testRegex();
    }
    
    // Ctrl+Space toggles cheat sheet
    if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        cheatSheetContent.parentElement.classList.toggle('collapsed');
        toggleCheatSheet.querySelector('i').classList.toggle('fa-chevron-up');
        toggleCheatSheet.querySelector('i').classList.toggle('fa-chevron-down');
    }
}

// Handle global keyboard shortcuts
function handleGlobalKeydown(e) {
    // Ctrl+Enter to test regex
    if (e.key === 'Enter' && e.ctrlKey) {
        testRegex();
    }
    
    // Ctrl+/ to focus regex input
    if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        regexInput.focus();
    }
    
    // Ctrl+L to clear all
    if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        clearAllInputs();
    }
}

// Test the regex pattern


// Test the regex pattern
function testRegex() {
    const pattern = regexInput.value;
    const text = testString.value;
    
    // Update UI to show testing
    errorStatus.textContent = 'Testing...';
    errorStatus.className = 'has-error';
    
    // Clear previous results
    matches = [];
    matchList.innerHTML = '';
    highlightedText.innerHTML = '';
    
    // If pattern is empty, show default text
    if (!pattern.trim()) {
        highlightedText.textContent = text;
        matchCount.textContent = '0 matches';
        errorStatus.textContent = 'No pattern entered';
        errorStatus.className = 'no-error';
        errorIndicator.className = 'error-indicator no-error';
        errorIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
        errorDisplay.innerHTML = '<p>No regex pattern entered. Type a pattern to see matches.</p>';
        return;
    }
    
    try {
        // Build flags string
        let flags = '';
        if (flagGlobal.checked) flags += 'g';
        if (flagCaseInsensitive.checked) flags += 'i';
        if (flagMultiline.checked) flags += 'm';
        
        // IMPORTANT FIX: Properly handle escape sequences
        const displayPattern = pattern.replace(/\\\\/g, '\\');
        
        // Create regex object
        currentRegex = new RegExp(pattern, flags);
        
        // Ensure global flag for matchAll, but respect user preference
        const searchFlags = flags.includes('g') ? flags : flags + 'g';
        const regexGlobal = new RegExp(pattern, searchFlags);
        
        let matchResults = [...text.matchAll(regexGlobal)];
        
        // If global flag wasn't checked, only take the first match
        if (!flagGlobal.checked && matchResults.length > 0) {
            matchResults = [matchResults[0]];
        }
        
        // Store matches for access elsewhere
        matches = matchResults;
        
        // Process matches
        processMatches(matchResults, text);
        
        // Update UI with success
        errorStatus.textContent = 'Pattern valid';
        errorStatus.className = 'no-error';
        errorIndicator.className = 'error-indicator no-error';
        errorIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
        errorDisplay.innerHTML = `<p>No regex errors detected.</p><p>Pattern: /${displayPattern}/${flags}</p>`;
        
    } catch (error) {
        // Handle regex error
        handleRegexError(error);
    }
}

// Process and display matches
function processMatches(matchResults, text) {
    // strict check for array
    if (!matchResults) matchResults = [];

    // Update match count
    const count = matchResults.length;
    matchCount.textContent = count === 1 ? '1 match' : `${count} matches`;
    
    // 1. Update Highlighted Text
    let html = '';
    let lastIndex = 0;
    
    matchResults.forEach((match, i) => {
        const index = match.index;
        const length = match[0].length;
        const matchText = match[0];
        
        // Text before match
        html += escapeHTML(text.substring(lastIndex, index));
        
        // Match text with hover tooltip
        if (length === 0) {
            // Handle zero-length matches
            html += `<span class="match zero-length" title="Match ${i + 1} (Zero length)"><span class="match-index">${i + 1}</span></span>`;
        } else {
            html += `<span class="match" title="Match ${i + 1}: ${escapeHTML(matchText)}">
                ${escapeHTML(matchText)}
                <span class="match-index">${i + 1}</span>
            </span>`;
        }
        
        lastIndex = index + length;
    });
    
    // Remaining text
    html += escapeHTML(text.substring(lastIndex));
    highlightedText.innerHTML = html;
    
    // 2. Update Match List
    if (count === 0) {
        matchList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No matches found.</p>
            </div>
        `;
        return;
    }
    
    matchList.innerHTML = matchResults.map((match, i) => {
        const index = match.index;
        const fullMatch = match[0];
        
        // Groups
        let groupsHtml = '';
        const groupCount = match.length - 1; // Subtract 1 because 0 is full match
        
        if (groupCount > 0) {
            groupsHtml += '<div class="match-groups">';
            // Iterate over groups (skip 0)
            for (let g = 1; g <= groupCount; g++) {
                groupsHtml += `
                    <div class="group-item">
                        <span class="group-index">Group ${g}</span>
                        <span class="group-value">"${escapeHTML(match[g] || '')}"</span>
                    </div>
                `;
            }
            groupsHtml += '</div>';
        } else {
            groupsHtml = '<div class="match-groups"><div class="group-item"><i class="text-tertiary">No capture groups</i></div></div>';
        }
        
        return `
            <div class="match-item">
                <div class="match-header">
                    <span class="match-position">Match ${i + 1}</span>
                    <span class="match-length">Index: ${index} | Length: ${fullMatch.length}</span>
                </div>
                <div class="match-text">"${escapeHTML(fullMatch)}"</div>
                ${showGroups ? groupsHtml : ''}
            </div>
        `;
    }).join('');
}

// Handle regex errors
function handleRegexError(error) {
    const errorMessage = error.message;
    errorStatus.textContent = 'Invalid regex';
    errorStatus.className = 'has-error';
    errorIndicator.className = 'error-indicator has-error';
    errorIndicator.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
    
    // Parse error message for better display
    let displayMessage = errorMessage;
    if (errorMessage.includes('Invalid regular expression')) {
        const match = errorMessage.match(/:\s(.+)$/);
        if (match) {
            displayMessage = match[1];
        }
    }
    
    // Get the current pattern for debugging
    const pattern = regexInput.value;
    
    errorDisplay.innerHTML = `
        <p><strong>Regex Error:</strong> ${displayMessage}</p>
        <p><strong>Pattern:</strong> ${pattern}</p>
        <p><strong>Common Issues:</strong></p>
        <ul>
            <li>Check for unescaped special characters: . * + ? ^ $ { } [ ] ( ) | \\ /</li>
            <li>Ensure character classes [] are properly closed</li>
            <li>Check for unmatched parentheses</li>
            <li>Remember: in the input field, type a single backslash (\) not double (\\\\)</li>
        </ul>
    `;
    
    // Show original text
    highlightedText.textContent = text;
    
    // Update match count
    matchCount.textContent = '0 matches (invalid regex)';
    matchList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Invalid regex pattern. Fix the error to see matches.</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">Error: ${displayMessage}</p>
        </div>
    `;
}



// Update text statistics
function updateTextStats() {
    const text = testString.value;
    charCount.textContent = `${text.length} characters`;
    lineCount.textContent = `${text.split('\n').length} lines`;
}

// Theme functions
function setTheme(theme) {
    currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update theme toggle button
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span') || document.createElement('span');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Copy highlighted text to clipboard
async function copyHighlightedText() {
    try {
        const textToCopy = highlightedText.textContent;
        await navigator.clipboard.writeText(textToCopy);
        showToast('Highlighted text copied to clipboard');
    } catch (err) {
        showToast('Failed to copy text', 'error');
    }
}

// Clear all inputs
function clearAllInputs() {
    regexInput.value = '';
    testString.value = '';
    flagGlobal.checked = true;
    flagCaseInsensitive.checked = false;
    flagMultiline.checked = false;
    testRegex();
    showToast('All inputs cleared');
}

// Export matches as JSON
function exportMatchesAsJSON() {
    if (matches.length === 0) {
        showToast('No matches to export', 'error');
        return;
    }
    
    const exportData = {
        pattern: regexInput.value,
        flags: {
            global: flagGlobal.checked,
            caseInsensitive: flagCaseInsensitive.checked,
            multiline: flagMultiline.checked
        },
        testString: testString.value,
        matches: matches.map((match, index) => ({
            index: index,
            position: match.index,
            length: match[0].length,
            fullMatch: match[0],
            groups: Array.from(match.entries()).slice(1).map(([i, g]) => ({
                groupIndex: i,
                value: g
            }))
        })),
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `regex-matches-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast(`Exported ${matches.length} matches as JSON`);
}

// Reset to defaults
function resetToDefaults() {
    regexInput.value = '\\d{3}-\\d{3}-\\d{4}';
    testString.value = `Hello, my email is john.doe@example.com and my phone number is 123-456-7890. You can also reach me at jane_smith@test.co.uk or 987-654-3210. Dates: 01/23/2024, 12-31-2023, 2024.05.15. Also test for hex colors: #FF5733, #33FF57, #3357FF.`;
    flagGlobal.checked = true;
    flagCaseInsensitive.checked = false;
    flagMultiline.checked = false;
    showGroups = true;
    setTheme('light');
    testRegex();
    showToast('Reset to default settings');
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show';
    
    // Set border color based on type
    if (type === 'error') {
        toast.style.borderLeftColor = 'var(--error-color)';
    } else if (type === 'warning') {
        toast.style.borderLeftColor = 'var(--warning-color)';
    } else {
        toast.style.borderLeftColor = 'var(--primary-color)';
    }
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);