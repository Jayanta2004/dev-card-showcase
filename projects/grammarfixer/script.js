// DOM Elements
const originalText = document.getElementById('original-text');
const fixedText = document.getElementById('fixed-text');
const fixBtn = document.getElementById('fix-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const speakBtn = document.getElementById('speak-btn');
const charCount = document.getElementById('char-count');
const fixLevel = document.getElementById('fix-level');
const changesList = document.getElementById('changes-list');
const exampleBtns = document.querySelectorAll('.example-btn');

// Example sentences
const examples = {
    1: "she dont like apples",
    2: "me and him went to the store",
    3: "their happy with there results",
    4: "i goed to school yesterday"
};

// Example corrections
const exampleCorrections = {
    1: {
        fixed: "She doesn't like apples.",
        changes: [
            "Capitalized first word",
            "Fixed 'dont' to 'doesn't'",
            "Added period at the end"
        ]
    },
    2: {
        fixed: "He and I went to the store.",
        changes: [
            "Fixed pronoun order to 'He and I'",
            "Changed 'me' to 'I' (subject pronoun)",
            "Changed 'him' to 'He' (subject pronoun)",
            "Added period at the end"
        ]
    },
    3: {
        fixed: "They're happy with their results.",
        changes: [
            "Fixed 'their' to 'They're' (they are)",
            "Fixed 'there' to 'their' (possessive)",
            "Capitalized first word",
            "Added period at the end"
        ]
    },
    4: {
        fixed: "I went to school yesterday.",
        changes: [
            "Fixed 'goed' to 'went' (past tense of go)",
            "Capitalized 'I'",
            "Added period at the end"
        ]
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCharCount();
    
    // Set up example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const exampleNum = this.getAttribute('data-example');
            loadExample(exampleNum);
        });
    });
});

// Event Listeners
originalText.addEventListener('input', updateCharCount);

fixBtn.addEventListener('click', function() {
    const text = originalText.value.trim();
    
    if (!text) {
        showMessage('Please enter some text to fix.', 'error');
        return;
    }
    
    fixSentence(text);
});

clearBtn.addEventListener('click', function() {
    originalText.value = '';
    fixedText.textContent = 'Your corrected text will appear here...';
    updateCharCount();
    clearChangesList();
    showMessage('All fields cleared.', 'info');
});

copyBtn.addEventListener('click', function() {
    const textToCopy = fixedText.textContent;
    
    if (!textToCopy || textToCopy.includes('Your corrected text')) {
        showMessage('No corrected text to copy.', 'error');
        return;
    }
    
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            showMessage('Text copied to clipboard!', 'success');
            
            // Visual feedback
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy Text';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showMessage('Failed to copy text.', 'error');
        });
});

speakBtn.addEventListener('click', function() {
    const textToSpeak = fixedText.textContent;
    
    if (!textToSpeak || textToSpeak.includes('Your corrected text')) {
        showMessage('No text to read aloud.', 'error');
        return;
    }
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        window.speechSynthesis.speak(utterance);
        
        // Visual feedback
        speakBtn.textContent = 'Speaking...';
        utterance.onend = function() {
            speakBtn.textContent = 'Listen';
        };
    } else {
        showMessage('Text-to-speech is not supported in your browser.', 'error');
    }
});

// Functions
function updateCharCount() {
    const count = originalText.value.length;
    charCount.textContent = count;
    
    // Update color based on length
    if (count === 0) {
        charCount.style.color = '#95a5a6';
    } else if (count < 100) {
        charCount.style.color = '#27ae60';
    } else if (count < 500) {
        charCount.style.color = '#f39c12';
    } else {
        charCount.style.color = '#e74c3c';
    }
}

function loadExample(exampleNum) {
    originalText.value = examples[exampleNum];
    updateCharCount();
    
    // Auto-fix the example
    fixSentence(examples[exampleNum]);
    
    showMessage(`Loaded example ${exampleNum}`, 'info');
}

function fixSentence(text) {
    // Show loading state
    fixBtn.textContent = 'Fixing...';
    fixBtn.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        const level = fixLevel.value;
        const result = grammarFix(text, level);
        
        // Update fixed text
        fixedText.textContent = result.fixed;
        
        // Update changes list
        updateChangesList(result.changes);
        
        // Reset button
        fixBtn.textContent = 'Fix Sentence';
        fixBtn.disabled = false;
        
        showMessage('Text fixed successfully!', 'success');
    }, 800);
}

function grammarFix(text, level) {
    // This is a simplified grammar fixer
    // In a real application, you would use a proper NLP library
    
    let fixed = text;
    const changes = [];
    
    // Always capitalize first letter
    if (fixed.length > 0 && /^[a-z]/.test(fixed)) {
        fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
        changes.push("Capitalized first letter");
    }
    
    // Common grammar fixes
    const grammarRules = [
        { pattern: /\bdont\b/gi, replacement: "don't", desc: "Fixed 'dont' to 'don't'" },
        { pattern: /\bdoesnt\b/gi, replacement: "doesn't", desc: "Fixed 'doesnt' to 'doesn't'" },
        { pattern: /\bcant\b/gi, replacement: "can't", desc: "Fixed 'cant' to 'can't'" },
        { pattern: /\bwont\b/gi, replacement: "won't", desc: "Fixed 'wont' to 'won't'" },
        { pattern: /\bim\b/gi, replacement: "I'm", desc: "Fixed 'im' to 'I'm'" },
        { pattern: /\byoure\b/gi, replacement: "you're", desc: "Fixed 'youre' to 'you're'" },
        { pattern: /\btheyre\b/gi, replacement: "they're", desc: "Fixed 'theyre' to 'they're'" },
        { pattern: /\btheyre\b/gi, replacement: "they're", desc: "Fixed 'theyre' to 'they're'" },
        { pattern: /\bthere\b happy/gi, replacement: "they're happy", desc: "Fixed 'there' to 'they're'" },
        { pattern: /\btheir\b happy/gi, replacement: "they're happy", desc: "Fixed 'their' to 'they're'" },
        { pattern: /\bme and him\b/gi, replacement: "he and I", desc: "Fixed pronoun order" },
        { pattern: /\bme and her\b/gi, replacement: "she and I", desc: "Fixed pronoun order" },
        { pattern: /\bgoed\b/gi, replacement: "went", desc: "Fixed 'goed' to 'went'" },
        { pattern: /\brunned\b/gi, replacement: "ran", desc: "Fixed 'runned' to 'ran'" },
        { pattern: /\beated\b/gi, replacement: "ate", desc: "Fixed 'eated' to 'ate'" },
        { pattern: /\bgooder\b/gi, replacement: "better", desc: "Fixed 'gooder' to 'better'" },
        { pattern: /\bbadder\b/gi, replacement: "worse", desc: "Fixed 'badder' to 'worse'" },
    ];
    
    grammarRules.forEach(rule => {
        if (rule.pattern.test(fixed)) {
            fixed = fixed.replace(rule.pattern, rule.replacement);
            if (!changes.includes(rule.desc)) {
                changes.push(rule.desc);
            }
        }
    });
    
    // Add punctuation if missing
    if (!/[.!?]$/.test(fixed)) {
        fixed += '.';
        changes.push("Added period at the end");
    }
    
    // Apply level-specific fixes
    if (level === 'thorough') {
        // More aggressive fixes
        fixed = fixed.replace(/\bi\b/g, 'I');
        if (text.includes('i ') && !changes.includes("Capitalized 'I'")) {
            changes.push("Capitalized 'I'");
        }
    }
    
    return {
        fixed: fixed,
        changes: changes.length > 0 ? changes : ["No grammar issues found!"]
    };
}

function updateChangesList(changes) {
    changesList.innerHTML = '';
    
    changes.forEach(change => {
        const changeItem = document.createElement('div');
        changeItem.className = 'change-item';
        
        // Determine badge type based on change content
        let badgeType = 'Grammar';
        if (change.includes('Capitalized')) badgeType = 'Capitalization';
        if (change.includes('period') || change.includes('punctuation')) badgeType = 'Punctuation';
        if (change.includes('No')) badgeType = 'Info';
        
        changeItem.innerHTML = `
            <span class="change-badge">${badgeType}</span>
            <p>${change}</p>
        `;
        
        changesList.appendChild(changeItem);
    });
}

function clearChangesList() {
    changesList.innerHTML = `
        <div class="change-item">
            <span class="change-badge">Grammar</span>
            <p>No changes yet. Enter text and click "Fix Sentence" to see corrections.</p>
        </div>
    `;
}

function showMessage(text, type) {
    // Create message element
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    // Style the message
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set color based on type
    if (type === 'success') {
        message.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
        message.style.backgroundColor = '#e74c3c';
    } else {
        message.style.backgroundColor = '#3498db';
    }
    
    // Add to page
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
        message.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .change-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-bottom: 8px;
    }
    
    .change-badge {
        background-color: #e3f2fd;
        color: #1976d2;
    }
    
    .change-badge[data-type="Capitalization"] {
        background-color: #e8f5e9;
        color: #2e7d32;
    }
    
    .change-badge[data-type="Punctuation"] {
        background-color: #fff3e0;
        color: #ef6c00;
    }
    
    .change-badge[data-type="Info"] {
        background-color: #f3e5f5;
        color: #7b1fa2;
    }
`;
document.head.appendChild(style);