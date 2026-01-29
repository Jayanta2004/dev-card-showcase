// =========================================
// Password Strength Checker
// =========================================

const passwordInput = document.getElementById('password-input');
const togglePasswordBtn = document.getElementById('toggle-password');
const strengthText = document.getElementById('strength-text');
const strengthBar = document.getElementById('strength-bar');
const strengthDescription = document.getElementById('strength-description');
const charCount = document.getElementById('char-count');
const scoreValue = document.getElementById('score-value');
const entropyValue = document.getElementById('entropy-value');
const generateBtn = document.getElementById('generate-btn');
const copyPasswordBtn = document.getElementById('copy-password');
const clearPasswordBtn = document.getElementById('clear-password');

// Requirements elements
const requirements = {
    length: document.getElementById('req-length'),
    uppercase: document.getElementById('req-uppercase'),
    lowercase: document.getElementById('req-lowercase'),
    numbers: document.getElementById('req-numbers'),
    special: document.getElementById('req-special')
};

// =========================================
// Utility Functions
// =========================================

/**
 * Check if password meets length requirement (8+ chars)
 */
function checkLength(password) {
    return password.length >= 8;
}

/**
 * Check if password has uppercase letters
 */
function checkUppercase(password) {
    return /[A-Z]/.test(password);
}

/**
 * Check if password has lowercase letters
 */
function checkLowercase(password) {
    return /[a-z]/.test(password);
}

/**
 * Check if password has numbers
 */
function checkNumbers(password) {
    return /[0-9]/.test(password);
}

/**
 * Check if password has special characters
 */
function checkSpecial(password) {
    return /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password);
}

/**
 * Update requirement UI element
 */
function updateRequirement(element, isMet) {
    if (isMet) {
        element.classList.add('valid');
        element.querySelector('.checkbox').textContent = '✓';
    } else {
        element.classList.remove('valid');
        element.querySelector('.checkbox').textContent = '☐';
    }
}

/**
 * Calculate password strength score (0-100)
 */
function calculateStrengthScore(password) {
    let score = 0;

    // Length scoring
    if (password.length >= 8) score += 15;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 5;

    // Character variety scoring
    if (checkUppercase(password)) score += 15;
    if (checkLowercase(password)) score += 15;
    if (checkNumbers(password)) score += 15;
    if (checkSpecial(password)) score += 20;

    // Bonus for mixing different character types
    const varietyCount = [
        checkUppercase(password),
        checkLowercase(password),
        checkNumbers(password),
        checkSpecial(password)
    ].filter(Boolean).length;

    if (varietyCount === 4) score += 10;

    // Check for common patterns and reduce score
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/^[a-z]+$/i.test(password)) score -= 10; // Only letters
    if (/^\d+$/.test(password)) score -= 15; // Only numbers
    if (/^[a-zA-Z0-9]+$/.test(password)) score -= 5; // No special chars

    return Math.max(0, Math.min(100, score));
}

/**
 * Determine strength level based on score
 */
function getStrengthLevel(score) {
    if (score < 20) return { level: 'Very Weak', color: '#ef4444' };
    if (score < 40) return { level: 'Weak', color: '#f59e0b' };
    if (score < 60) return { level: 'Fair', color: '#f59e0b' };
    if (score < 80) return { level: 'Good', color: '#3b82f6' };
    return { level: 'Strong', color: '#10b981' };
}

/**
 * Calculate password entropy (in bits)
 */
function calculateEntropy(password) {
    let charsetSize = 0;

    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

    const entropy = password.length * Math.log2(charsetSize);
    return entropy.toFixed(1);
}

/**
 * Get description based on password analysis
 */
function getDescription(password, score) {
    if (password.length === 0) {
        return 'Your password is very weak. Add more characters and variety.';
    }

    const issues = [];
    if (password.length < 8) issues.push('too short');
    if (!checkUppercase(password)) issues.push('no uppercase');
    if (!checkLowercase(password)) issues.push('no lowercase');
    if (!checkNumbers(password)) issues.push('no numbers');
    if (!checkSpecial(password)) issues.push('no special characters');

    if (issues.length === 0) {
        return 'Excellent password! This password is very secure.';
    }

    return `Add ${issues.join(', ')} to strengthen your password.`;
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
}

/**
 * Update all password indicators
 */
function updatePasswordStrength() {
    const password = passwordInput.value;
    const score = calculateStrengthScore(password);
    const strength = getStrengthLevel(score);
    const entropy = calculateEntropy(password);

    // Update strength bar
    strengthBar.style.width = score + '%';
    strengthBar.style.background = strength.color;

    // Update strength text
    strengthText.textContent = strength.level;
    strengthText.className = 'strength-text ' + strength.level.toLowerCase().replace(/\s+/g, '-');

    // Update description
    strengthDescription.textContent = getDescription(password, score);

    // Update requirements
    updateRequirement(requirements.length, checkLength(password));
    updateRequirement(requirements.uppercase, checkUppercase(password));
    updateRequirement(requirements.lowercase, checkLowercase(password));
    updateRequirement(requirements.numbers, checkNumbers(password));
    updateRequirement(requirements.special, checkSpecial(password));

    // Update info
    charCount.textContent = password.length + ' character' + (password.length !== 1 ? 's' : '');
    scoreValue.textContent = score + '/100';
    entropyValue.textContent = entropy + ' bits';
}

/**
 * Generate a strong random password
 */
function generateStrongPassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Ensure at least one char from each category
    let password = [
        uppercase[Math.floor(Math.random() * uppercase.length)],
        lowercase[Math.floor(Math.random() * lowercase.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        special[Math.floor(Math.random() * special.length)]
    ];

    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < length; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // Shuffle the password
    return password.sort(() => Math.random() - 0.5).join('');
}

/**
 * Copy password to clipboard
 */
async function copyToClipboard() {
    const password = passwordInput.value;
    if (!password) {
        alert('No password to copy!');
        return;
    }

    try {
        await navigator.clipboard.writeText(password);
        const originalText = copyPasswordBtn.innerHTML;
        copyPasswordBtn.innerHTML = '<span>✓</span> Copied!';
        copyPasswordBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        copyPasswordBtn.style.color = 'white';

        setTimeout(() => {
            copyPasswordBtn.innerHTML = '<span>📋</span> Copy';
            copyPasswordBtn.style.background = '';
            copyPasswordBtn.style.color = '';
        }, 2000);
    } catch (err) {
        alert('Failed to copy: ' + err.message);
    }
}

// =========================================
// Event Listeners
// =========================================

togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

passwordInput.addEventListener('input', updatePasswordStrength);

generateBtn.addEventListener('click', () => {
    const newPassword = generateStrongPassword(16);
    passwordInput.value = newPassword;
    updatePasswordStrength();

    // Visual feedback
    generateBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        generateBtn.style.transform = 'scale(1)';
    }, 100);
});

copyPasswordBtn.addEventListener('click', copyToClipboard);

clearPasswordBtn.addEventListener('click', () => {
    passwordInput.value = '';
    updatePasswordStrength();
});

// Auto-focus on password input
window.addEventListener('load', () => {
    passwordInput.focus();
});

// Initialize on load
window.addEventListener('load', () => {
    updatePasswordStrength();
    initTheme();
});

// =========================================
// Theme Toggle
// =========================================

function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('password-checker-theme');

    if (savedTheme === 'dark' || (prefersDark && !savedTheme)) {
        document.body.classList.add('theme-dark');
    }
}

console.log('Password Strength Checker initialized successfully!');


