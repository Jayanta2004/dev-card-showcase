// DOM Elements
const password = document.getElementById('password');
const toggleBtn = document.getElementById('toggleBtn');
const strengthFill = document.getElementById('strengthFill');
const strengthText = document.getElementById('strengthText');
const charCount = document.getElementById('charCount');
const requirementsList = document.getElementById('requirementsList');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const notification = document.getElementById('notification');
const lengthScore = document.getElementById('lengthScore');
const complexityScore = document.getElementById('complexityScore');
const uniquenessScore = document.getElementById('uniquenessScore');

// Requirements
const requirements = {
    length: { id: 'req-length', test: (pwd) => pwd.length >= 8 },
    uppercase: { id: 'req-uppercase', test: (pwd) => /[A-Z]/.test(pwd) },
    lowercase: { id: 'req-lowercase', test: (pwd) => /[a-z]/.test(pwd) },
    number: { id: 'req-number', test: (pwd) => /[0-9]/.test(pwd) },
    special: { id: 'req-special', test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) }
};

// Event Listeners
password.addEventListener('input', () => {
    updateCharCount();
    validatePassword();
    updateScores();
});

toggleBtn.addEventListener('click', togglePasswordVisibility);
generateBtn.addEventListener('click', generateStrongPassword);
copyBtn.addEventListener('click', copyPasswordToClipboard);
clearBtn.addEventListener('click', clearAll);

// Toggle password visibility
function togglePasswordVisibility() {
    const type = password.type === 'password' ? 'text' : 'password';
    password.type = type;
    toggleBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
}

// Validate password and update UI
function validatePassword() {
    const pwd = password.value;
    let strength = 0;
    let metRequirements = 0;

    // Check each requirement
    for (const [key, req] of Object.entries(requirements)) {
        const element = document.getElementById(req.id);
        const isMet = req.test(pwd);
        
        if (isMet) {
            element.classList.add('met');
            element.querySelector('.check-icon').textContent = '●';
            metRequirements++;
            strength++;
        } else {
            element.classList.remove('met');
            element.querySelector('.check-icon').textContent = '○';
        }
    }

    // Calculate strength based on length and complexity
    if (pwd.length >= 16) strength += 2;
    else if (pwd.length >= 12) strength += 1;

    // Update strength bar and text
    updateStrengthBar(strength);

    // Update character count
    charCount.textContent = pwd.length;
}

// Update strength bar visualization
function updateStrengthBar(strength) {
    const pwd = password.value;
    let percentage = 0;
    let strengthLevel = '-';
    let strengthClass = '';

    if (!pwd) {
        strengthLevel = '-';
        percentage = 0;
        strengthClass = '';
    } else if (strength <= 2) {
        strengthLevel = 'Weak';
        percentage = 20;
        strengthClass = 'weak';
    } else if (strength <= 3) {
        strengthLevel = 'Fair';
        percentage = 40;
        strengthClass = 'fair';
    } else if (strength <= 4) {
        strengthLevel = 'Good';
        percentage = 60;
        strengthClass = 'good';
    } else if (strength <= 5) {
        strengthLevel = 'Strong';
        percentage = 80;
        strengthClass = 'strong';
    } else {
        strengthLevel = 'Very Strong';
        percentage = 100;
        strengthClass = 'very-strong';
    }

    strengthFill.style.width = percentage + '%';
    strengthText.textContent = strengthLevel;
    strengthText.className = 'strength-text ' + strengthClass;
}

// Update quality scores
function updateScores() {
    const pwd = password.value;

    // Length score
    let lengthPercent = (pwd.length / 16) * 100;
    if (lengthPercent > 100) lengthPercent = 100;
    lengthScore.style.width = lengthPercent + '%';

    // Complexity score
    let complexity = 0;
    if (/[a-z]/.test(pwd)) complexity += 25;
    if (/[A-Z]/.test(pwd)) complexity += 25;
    if (/[0-9]/.test(pwd)) complexity += 25;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) complexity += 25;
    complexityScore.style.width = complexity + '%';

    // Uniqueness score (based on variety of characters)
    let uniqueness = 0;
    const chars = new Set(pwd);
    uniqueness = (chars.size / pwd.length) * 100;
    uniquenessScore.style.width = uniqueness + '%';
}

// Generate strong password
function generateStrongPassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + special;

    // Ensure at least one from each category
    let generated = '';
    generated += uppercase[Math.floor(Math.random() * uppercase.length)];
    generated += lowercase[Math.floor(Math.random() * lowercase.length)];
    generated += numbers[Math.floor(Math.random() * numbers.length)];
    generated += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = generated.length; i < 14; i++) {
        generated += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    generated = generated.split('').sort(() => Math.random() - 0.5).join('');

    password.value = generated;
    updateCharCount();
    validatePassword();
    updateScores();
    showNotification('Strong password generated!', 'success');
}

// Copy password to clipboard
function copyPasswordToClipboard() {
    if (!password.value) {
        showNotification('Please enter or generate a password first!', 'error');
        return;
    }

    navigator.clipboard.writeText(password.value).then(() => {
        showNotification('Password copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy password!', 'error');
    });
}

// Clear all
function clearAll() {
    password.value = '';
    charCount.textContent = '0';
    strengthFill.style.width = '0%';
    strengthText.textContent = '-';
    strengthText.className = 'strength-text';
    
    // Reset all requirements
    for (const req of Object.values(requirements)) {
        const element = document.getElementById(req.id);
        element.classList.remove('met');
        element.querySelector('.check-icon').textContent = '○';
    }

    // Reset scores
    lengthScore.style.width = '0%';
    complexityScore.style.width = '0%';
    uniquenessScore.style.width = '0%';

    password.focus();
}

// Update character count display
function updateCharCount() {
    charCount.textContent = password.value.length;
}

// Show notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification show ${type}`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+G or Cmd+G to generate
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        generateStrongPassword();
    }
});
    score++;
    rules.number.classList.add("valid");
  } else {
    rules.number.classList.remove("valid");
    suggestions.push("Add a number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
    rules.special.classList.add("valid");
  } else {
    rules.special.classList.remove("valid");
    suggestions.push("Add a special character");
  }

  if (score <= 2) {
    indicator.style.width = "30%";
    indicator.style.background = "#dc2626";
    strengthText.textContent = "Weak Password";
  } else if (score <= 4) {
    indicator.style.width = "70%";
    indicator.style.background = "#facc15";
    strengthText.textContent = "Medium Password";
  } else {
    indicator.style.width = "100%";
    indicator.style.background = "#16a34a";
    strengthText.textContent = "Strong Password";
  }

  suggestionsBox.innerHTML =
    suggestions.length > 0
      ? "Suggestions:<br>• " + suggestions.join("<br>• ")
      : "Great! Your password is strong 🔐";
});

function generateStrongPassword(length = 12) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+[]{}<>?/";

  // Ensure at least one character from each category
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];

  const allChars = upper + lower + numbers + special;

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle password to avoid predictable order
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

generateBtn.addEventListener("click", () => {
  const newPassword = generateStrongPassword();
  passwordInput.value = newPassword;

  // Trigger input event so strength checker updates
  passwordInput.dispatchEvent(new Event("input"));
});

generateBtn.addEventListener("click", () => {
  const newPassword = generateStrongPassword();
  passwordInput.value = newPassword;

  // Trigger strength check
  passwordInput.dispatchEvent(new Event("input"));

  // Glow feedback
  generateBtn.classList.add("glow");
  setTimeout(() => generateBtn.classList.remove("glow"), 800);
});

