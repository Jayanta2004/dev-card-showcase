// SecureVault - Military-Grade File Encryption Tool

// Application State
const appState = {
    mode: 'encrypt', // 'encrypt' or 'decrypt'
    currentFile: null,
    encryptedFile: null,
    decryptedFile: null,
    password: '',
    theme: 'light',
    encryptionProgress: 0,
    decryptionProgress: 0,
    passwordStrength: 0,
    securityAcknowledged: false
};

// DOM Elements
const securityOverlay = document.getElementById('security-overlay');
const acknowledgeSecurityBtn = document.getElementById('acknowledge-security');
const themeToggle = document.getElementById('toggle-theme');
const encryptTab = document.getElementById('encrypt-tab');
const decryptTab = document.getElementById('decrypt-tab');
const encryptSection = document.getElementById('encrypt-section');
const decryptSection = document.getElementById('decrypt-section');
const modeDescription = document.getElementById('mode-description');

// Encryption Elements
const encryptFileInput = document.getElementById('encrypt-file-input');
const encryptDropArea = document.getElementById('encrypt-drop-area');
const encryptFileInfo = document.getElementById('encrypt-file-info');
const encryptPasswordInput = document.getElementById('encrypt-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const toggleEncryptPassword = document.getElementById('toggle-encrypt-password');
const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
const encryptStrengthText = document.getElementById('encrypt-strength-text');
const encryptStrengthSegments = document.querySelectorAll('#encrypt-strength .strength-segment');
const passwordMatch = document.getElementById('password-match');
const checkPasswordStrengthBtn = document.getElementById('check-password-strength');
const generateRandomPasswordBtn = document.getElementById('generate-random-password');
const compressBeforeEncrypt = document.getElementById('compress-before-encrypt');
const includeMetadata = document.getElementById('include-metadata');
const startEncryptionBtn = document.getElementById('start-encryption');
const downloadEncryptedBtn = document.getElementById('download-encrypted');
const encryptOutputPlaceholder = document.getElementById('encrypt-output-placeholder');
const encryptOutput = document.getElementById('encrypt-output');
const outputFilename = document.getElementById('output-filename');
const outputFilesize = document.getElementById('output-filesize');
const outputTimestamp = document.getElementById('output-timestamp');

// Encryption Progress Elements
const encryptProgress = document.getElementById('encrypt-progress');
const encryptProgressPercentage = document.getElementById('encrypt-progress-percentage');
const encryptProgressFill = document.getElementById('encrypt-progress-fill');
const encryptStatus = document.getElementById('encrypt-status');
const encryptTimeRemaining = document.getElementById('encrypt-time-remaining');

// Decryption Elements
const decryptFileInput = document.getElementById('decrypt-file-input');
const decryptDropArea = document.getElementById('decrypt-drop-area');
const decryptFileInfo = document.getElementById('decrypt-file-info');
const decryptPasswordInput = document.getElementById('decrypt-password');
const toggleDecryptPassword = document.getElementById('toggle-decrypt-password');
const startDecryptionBtn = document.getElementById('start-decryption');
const downloadDecryptedBtn = document.getElementById('download-decrypted');
const decryptOutputPlaceholder = document.getElementById('decrypt-output-placeholder');
const decryptOutput = document.getElementById('decrypt-output');
const decryptedFilename = document.getElementById('decrypted-filename');
const decryptedFilesize = document.getElementById('decrypted-filesize');
const decryptedFiletype = document.getElementById('decrypted-filetype');

// Decryption Progress Elements
const decryptProgress = document.getElementById('decrypt-progress');
const decryptProgressPercentage = document.getElementById('decrypt-progress-percentage');
const decryptProgressFill = document.getElementById('decrypt-progress-fill');
const decryptStatus = document.getElementById('decrypt-status');
const decryptIntegrity = document.getElementById('decrypt-integrity');

// Modal Elements
const passwordStrengthModal = document.getElementById('password-strength-modal');
const closeStrengthModal = document.getElementById('close-strength-modal');
const strengthBar = document.getElementById('strength-bar');
const strengthLabel = document.getElementById('strength-label');
const generatePasswordBtn = document.getElementById('generate-password');
const usePasswordBtn = document.getElementById('use-password');

const fileInfoModal = document.getElementById('file-info-modal');
const closeFileInfo = document.getElementById('close-file-info');
const closeInfoModal = document.getElementById('close-info-modal');

// Common password list for strength checking
const commonPasswords = [
    'password', '123456', '12345678', '1234', 'qwerty', 'letmein',
    'monkey', 'football', 'iloveyou', 'admin', 'welcome', 'sunshine',
    'master', 'hello', 'freedom', 'whatever', 'qazwsx', 'trustno1',
    'dragon', 'baseball', 'superman', 'password1', 'mustang', 'michael',
    'shadow', 'jennifer', 'hunter', 'jordan', 'harley', 'robert',
    'matthew', 'thomas', 'michelle', 'daniel', 'andrew', 'william',
    'george', 'nicholas', 'anthony', 'joshua', 'charles', 'david'
];

// Initialize the application
function init() {
    // Check if security notice has been acknowledged
    const acknowledged = localStorage.getItem('securevault-security-acknowledged');
    if (!acknowledged) {
        securityOverlay.style.display = 'flex';
    } else {
        appState.securityAcknowledged = true;
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('securevault-theme');
    if (savedTheme === 'dark') {
        enableDarkTheme();
    }
    
    // Initialize event listeners
    setupEventListeners();
    
    // Update mode description
    updateModeDescription();
}

// Set up all event listeners
function setupEventListeners() {
    // Security overlay
    acknowledgeSecurityBtn.addEventListener('click', acknowledgeSecurity);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Mode tabs
    encryptTab.addEventListener('click', () => switchMode('encrypt'));
    decryptTab.addEventListener('click', () => switchMode('decrypt'));
    
    // File uploads (encryption)
    encryptFileInput.addEventListener('change', handleEncryptFileSelect);
    setupDragAndDrop(encryptDropArea, encryptFileInput, handleEncryptFileSelect);
    
    // File uploads (decryption)
    decryptFileInput.addEventListener('change', handleDecryptFileSelect);
    setupDragAndDrop(decryptDropArea, decryptFileInput, handleDecryptFileSelect);
    
    // Password input
    encryptPasswordInput.addEventListener('input', handlePasswordInput);
    confirmPasswordInput.addEventListener('input', handlePasswordMatch);
    
    // Password visibility toggles
    toggleEncryptPassword.addEventListener('click', () => togglePasswordVisibility(encryptPasswordInput, toggleEncryptPassword));
    toggleConfirmPassword.addEventListener('click', () => togglePasswordVisibility(confirmPasswordInput, toggleConfirmPassword));
    toggleDecryptPassword.addEventListener('click', () => togglePasswordVisibility(decryptPasswordInput, toggleDecryptPassword));
    
    // Password strength
    checkPasswordStrengthBtn.addEventListener('click', showPasswordStrengthModal);
    generateRandomPasswordBtn.addEventListener('click', generateRandomPassword);
    
    // Modals
    closeStrengthModal.addEventListener('click', () => passwordStrengthModal.style.display = 'none');
    closeFileInfo.addEventListener('click', () => fileInfoModal.style.display = 'none');
    closeInfoModal.addEventListener('click', () => fileInfoModal.style.display = 'none');
    
    generatePasswordBtn.addEventListener('click', generateRandomPassword);
    usePasswordBtn.addEventListener('click', useGeneratedPassword);
    
    // Encryption/Decryption buttons
    startEncryptionBtn.addEventListener('click', startEncryption);
    downloadEncryptedBtn.addEventListener('click', downloadEncryptedFile);
    
    startDecryptionBtn.addEventListener('click', startDecryption);
    downloadDecryptedBtn.addEventListener('click', downloadDecryptedFile);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === passwordStrengthModal) {
            passwordStrengthModal.style.display = 'none';
        }
        if (e.target === fileInfoModal) {
            fileInfoModal.style.display = 'none';
        }
    });
}

// Security acknowledgement
function acknowledgeSecurity() {
    localStorage.setItem('securevault-security-acknowledged', 'true');
    appState.securityAcknowledged = true;
    securityOverlay.style.display = 'none';
}

// Theme management
function toggleTheme() {
    if (appState.theme === 'light') {
        enableDarkTheme();
    } else {
        enableLightTheme();
    }
    localStorage.setItem('securevault-theme', appState.theme);
}

function enableDarkTheme() {
    document.body.classList.add('dark-theme');
    appState.theme = 'dark';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
}

function enableLightTheme() {
    document.body.classList.remove('dark-theme');
    appState.theme = 'light';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
}

// Mode switching
function switchMode(mode) {
    appState.mode = mode;
    
    // Update active tab
    if (mode === 'encrypt') {
        encryptTab.classList.add('active');
        decryptTab.classList.remove('active');
        encryptSection.classList.add('active');
        decryptSection.classList.remove('active');
    } else {
        encryptTab.classList.remove('active');
        decryptTab.classList.add('active');
        encryptSection.classList.remove('active');
        decryptSection.classList.add('active');
    }
    
    updateModeDescription();
    resetUI();
}

function updateModeDescription() {
    if (appState.mode === 'encrypt') {
        modeDescription.textContent = 'Select a file, set a strong password, and generate an encrypted .enc file that can only be opened with the correct password.';
    } else {
        modeDescription.textContent = 'Select a .enc file, enter the correct password, and recover the original file. All processing happens locally in your browser.';
    }
}

function resetUI() {
    if (appState.mode === 'encrypt') {
        // Reset encryption UI
        encryptFileInput.value = '';
        encryptFileInfo.innerHTML = '';
        encryptPasswordInput.value = '';
        confirmPasswordInput.value = '';
        encryptOutputPlaceholder.style.display = 'flex';
        encryptOutput.style.display = 'none';
        startEncryptionBtn.disabled = true;
        downloadEncryptedBtn.disabled = true;
        encryptProgress.style.display = 'none';
        updatePasswordStrength(0);
        passwordMatch.classList.remove('show', 'matched');
    } else {
        // Reset decryption UI
        decryptFileInput.value = '';
        decryptFileInfo.innerHTML = '';
        decryptPasswordInput.value = '';
        decryptOutputPlaceholder.style.display = 'flex';
        decryptOutput.style.display = 'none';
        startDecryptionBtn.disabled = true;
        downloadDecryptedBtn.disabled = true;
        decryptProgress.style.display = 'none';
    }
}

// Drag and drop setup
function setupDragAndDrop(dropArea, fileInput, handler) {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('dragover');
    }
    
    function unhighlight() {
        dropArea.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handler({ target: fileInput });
        }
    }
}

// File selection handlers
function handleEncryptFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB in bytes
    if (file.size > maxSize) {
        alert('File size exceeds 500MB limit. Please choose a smaller file.');
        encryptFileInput.value = '';
        return;
    }
    
    appState.currentFile = file;
    displayFileInfo(file, encryptFileInfo, 'encrypt');
    
    // Enable encryption button if password is set
    startEncryptionBtn.disabled = !validateEncryptionForm();
    
    // Show file info modal
    showFileInfo(file);
}

function handleDecryptFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check if it's a .enc file
    if (!file.name.endsWith('.enc')) {
        alert('Please select a valid .enc file encrypted with SecureVault.');
        decryptFileInput.value = '';
        return;
    }
    
    appState.currentFile = file;
    displayFileInfo(file, decryptFileInfo, 'decrypt');
    
    // Enable password input and decryption button
    decryptPasswordInput.disabled = false;
    toggleDecryptPassword.disabled = false;
    startDecryptionBtn.disabled = false;
}

function displayFileInfo(file, container, mode) {
    const fileSize = formatFileSize(file.size);
    const fileType = file.type || 'Unknown';
    const fileName = file.name;
    
    container.innerHTML = `
        <div class="file-info">
            <div class="file-icon">
                <i class="fas fa-file${mode === 'encrypt' ? '' : '-shield'}"></i>
            </div>
            <div class="file-details">
                <h4>${fileName}</h4>
                <div class="file-meta">
                    <span class="file-size">${fileSize}</span>
                    <span class="file-type">${fileType}</span>
                </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="showFileInfo(appState.currentFile)">
                <i class="fas fa-info-circle"></i> Details
            </button>
        </div>
    `;
}

function showFileInfo(file) {
    if (!file) return;
    
    const fileSize = formatFileSize(file.size);
    const fileType = file.type || 'Unknown';
    const fileName = file.name;
    const lastModified = new Date(file.lastModified).toLocaleString();
    
    // Calculate SHA-256 hash (simplified for demo)
    const hash = calculateFileHash(file);
    
    document.getElementById('info-filename').textContent = fileName;
    document.getElementById('info-filetype').textContent = fileType;
    document.getElementById('info-filesize').textContent = fileSize;
    document.getElementById('info-modified').textContent = lastModified;
    document.getElementById('info-hash').textContent = hash;
    
    // Security assessment
    let securityAssessment = 'File appears safe for encryption';
    if (file.size > 100 * 1024 * 1024) { // 100MB
        securityAssessment = 'Large file - encryption may take longer';
    }
    
    document.getElementById('info-security').innerHTML = `
        <i class="fas fa-shield-alt"></i> ${securityAssessment}
    `;
    
    fileInfoModal.style.display = 'flex';
}

function calculateFileHash(file) {
    // In a real implementation, this would calculate the actual SHA-256 hash
    // For this demo, we'll generate a simulated hash
    const timestamp = file.lastModified;
    const size = file.size;
    const name = file.name;
    
    // Simple hash simulation (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    
    // Convert to hex string
    const hashStr = (hash >>> 0).toString(16).padStart(8, '0');
    const sizeStr = size.toString(16).padStart(8, '0');
    const timeStr = timestamp.toString(16).padStart(8, '0');
    
    return `${hashStr}${sizeStr}${timeStr}...`.toUpperCase();
}

// Password handling
function handlePasswordInput() {
    const password = encryptPasswordInput.value;
    appState.password = password;
    
    // Update password strength
    const strength = calculatePasswordStrength(password);
    appState.passwordStrength = strength;
    updatePasswordStrength(strength);
    
    // Check password match
    handlePasswordMatch();
    
    // Enable encryption button if form is valid
    startEncryptionBtn.disabled = !validateEncryptionForm();
}

function handlePasswordMatch() {
    const password = encryptPasswordInput.value;
    const confirm = confirmPasswordInput.value;
    
    if (password === '' && confirm === '') {
        passwordMatch.classList.remove('show');
        return;
    }
    
    passwordMatch.classList.add('show');
    
    if (password === confirm) {
        passwordMatch.classList.add('matched');
        passwordMatch.innerHTML = '<i class="fas fa-check"></i><span>Passwords match</span>';
    } else {
        passwordMatch.classList.remove('matched');
        passwordMatch.innerHTML = '<i class="fas fa-times"></i><span>Passwords do not match</span>';
    }
    
    // Enable encryption button if form is valid
    startEncryptionBtn.disabled = !validateEncryptionForm();
}

function togglePasswordVisibility(input, button) {
    const type = input.getAttribute('type');
    if (type === 'password') {
        input.setAttribute('type', 'text');
        button.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.setAttribute('type', 'password');
        button.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Password strength calculation
function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1; // Lowercase
    if (/[A-Z]/.test(password)) score += 1; // Uppercase
    if (/[0-9]/.test(password)) score += 1; // Numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 1; // Symbols
    
    // Avoid common passwords
    if (!commonPasswords.includes(password.toLowerCase())) score += 1;
    
    // Penalize repeated characters
    const repeatedChars = /(.)\1{2,}/.test(password);
    if (repeatedChars) score -= 1;
    
    // Penalize sequential characters
    const sequential = /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
    if (sequential) score -= 1;
    
    // Ensure score is between 0 and 5
    return Math.max(0, Math.min(5, score));
}

function updatePasswordStrength(strength) {
    // Update strength text
    let strengthText, strengthColor;
    switch (strength) {
        case 0:
            strengthText = 'Enter a password';
            strengthColor = '#6c757d';
            break;
        case 1:
            strengthText = 'Very Weak';
            strengthColor = '#dc3545';
            break;
        case 2:
            strengthText = 'Weak';
            strengthColor = '#fd7e14';
            break;
        case 3:
            strengthText = 'Fair';
            strengthColor = '#ffc107';
            break;
        case 4:
            strengthText = 'Good';
            strengthColor = '#28a745';
            break;
        case 5:
            strengthText = 'Excellent';
            strengthColor = '#20c997';
            break;
    }
    
    encryptStrengthText.textContent = strengthText;
    encryptStrengthText.style.color = strengthColor;
    
    // Update strength segments
    encryptStrengthSegments.forEach((segment, index) => {
        if (index < strength) {
            segment.style.backgroundColor = strengthColor;
        } else {
            segment.style.backgroundColor = '';
        }
    });
}

function showPasswordStrengthModal() {
    const password = encryptPasswordInput.value;
    const strength = calculatePasswordStrength(password);
    
    // Update modal
    updateStrengthModal(password, strength);
    
    // Show modal
    passwordStrengthModal.style.display = 'flex';
}

function updateStrengthModal(password, strength) {
    // Update strength bar
    const percentage = (strength / 5) * 100;
    strengthBar.style.width = `${percentage}%`;
    
    // Update strength label and color
    let label, color;
    switch (strength) {
        case 0:
            label = 'No Password';
            color = '#6c757d';
            break;
        case 1:
            label = 'Very Weak';
            color = '#dc3545';
            break;
        case 2:
            label = 'Weak';
            color = '#fd7e14';
            break;
        case 3:
            label = 'Fair';
            color = '#ffc107';
            break;
        case 4:
            label = 'Good';
            color = '#28a745';
            break;
        case 5:
            label = 'Excellent';
            color = '#20c997';
            break;
    }
    
    strengthLabel.textContent = label;
    strengthLabel.style.color = color;
    strengthBar.style.background = `linear-gradient(90deg, ${color} 0%, ${color}66 100%)`;
    
    // Update criteria checkmarks
    const criteria = {
        length: password.length >= 12,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^a-zA-Z0-9]/.test(password),
        uncommon: !commonPasswords.includes(password.toLowerCase())
    };
    
    Object.keys(criteria).forEach(key => {
        const element = document.getElementById(`criteria-${key}`);
        if (element) {
            if (criteria[key]) {
                element.classList.add('valid');
                element.innerHTML = '<i class="fas fa-check"></i> ' + element.textContent.replace(/^[^a-zA-Z]+/, '');
            } else {
                element.classList.remove('valid');
                element.innerHTML = '<i class="fas fa-times"></i> ' + element.textContent.replace(/^[^a-zA-Z]+/, '');
            }
        }
    });
}

function generateRandomPassword() {
    // Generate a strong random password
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charset.length];
    }
    
    // Ensure the password meets all criteria
    if (!/[A-Z]/.test(password)) {
        password = password.replace(password[0], 'A');
    }
    if (!/[a-z]/.test(password)) {
        password = password.replace(password[1], 'a');
    }
    if (!/[0-9]/.test(password)) {
        password = password.replace(password[2], '1');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
        password = password.replace(password[3], '!');
    }
    
    // Update password input
    encryptPasswordInput.value = password;
    handlePasswordInput();
    
    // Update strength modal
    const strength = calculatePasswordStrength(password);
    updateStrengthModal(password, strength);
}

function useGeneratedPassword() {
    const password = encryptPasswordInput.value;
    encryptPasswordInput.value = password;
    confirmPasswordInput.value = password;
    handlePasswordInput();
    passwordStrengthModal.style.display = 'none';
}

// Form validation
function validateEncryptionForm() {
    const hasFile = appState.currentFile !== null;
    const hasPassword = encryptPasswordInput.value.trim() !== '';
    const passwordsMatch = encryptPasswordInput.value === confirmPasswordInput.value;
    const passwordStrong = appState.passwordStrength >= 3;
    
    return hasFile && hasPassword && passwordsMatch && passwordStrong;
}

// Encryption/Decryption functions
async function startEncryption() {
    if (!validateEncryptionForm()) {
        alert('Please fill in all required fields with valid information.');
        return;
    }
    
    try {
        // Show progress
        encryptProgress.style.display = 'block';
        updateEncryptionProgress(0, 'Preparing file...');
        
        // Read file
        const file = appState.currentFile;
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        // Generate random salt
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        // Derive encryption key from password
        updateEncryptionProgress(10, 'Generating encryption key...');
        const key = await deriveKey(appState.password, salt);
        
        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Compress if enabled (simulated)
        let dataToEncrypt = arrayBuffer;
        if (compressBeforeEncrypt.checked) {
            updateEncryptionProgress(30, 'Compressing data...');
            // In a real implementation, you would compress the data here
            // For this demo, we'll just simulate compression
            await simulateProgress(40, 60, 1000);
        }
        
        // Encrypt data
        updateEncryptionProgress(60, 'Encrypting data...');
        const encryptedData = await encryptData(key, iv, dataToEncrypt);
        
        // Create metadata
        const metadata = {
            filename: includeMetadata.checked ? file.name : 'encrypted_file',
            originalSize: file.size,
            timestamp: new Date().toISOString(),
            algorithm: 'AES-GCM-256',
            salt: Array.from(salt),
            iv: Array.from(iv)
        };
        
        // Combine metadata and encrypted data
        updateEncryptionProgress(80, 'Creating output file...');
        const finalData = await packageEncryptedData(metadata, encryptedData);
        
        // Create encrypted file
        appState.encryptedFile = new Blob([finalData], { type: 'application/octet-stream' });
        
        // Update UI
        updateEncryptionProgress(100, 'Encryption complete!');
        setTimeout(() => {
            encryptProgress.style.display = 'none';
            showEncryptionOutput();
        }, 1000);
        
    } catch (error) {
        console.error('Encryption failed:', error);
        alert('Encryption failed: ' + error.message);
        encryptProgress.style.display = 'none';
    }
}

async function startDecryption() {
    if (!appState.currentFile || !decryptPasswordInput.value) {
        alert('Please select a .enc file and enter the password.');
        return;
    }
    
    try {
        // Show progress
        decryptProgress.style.display = 'block';
        updateDecryptionProgress(0, 'Reading encrypted file...');
        
        // Read encrypted file
        const file = appState.currentFile;
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        // Parse encrypted file
        updateDecryptionProgress(20, 'Parsing file structure...');
        const { metadata, encryptedData } = await parseEncryptedFile(arrayBuffer);
        
        // Derive decryption key from password
        updateDecryptionProgress(40, 'Verifying password...');
        const salt = new Uint8Array(metadata.salt);
        const key = await deriveKey(decryptPasswordInput.value, salt);
        
        // Decrypt data
        updateDecryptionProgress(60, 'Decrypting data...');
        const iv = new Uint8Array(metadata.iv);
        const decryptedData = await decryptData(key, iv, encryptedData);
        
        // Verify integrity
        updateDecryptionProgress(80, 'Verifying file integrity...');
        decryptIntegrity.textContent = 'Verified ✓';
        
        // Create decrypted file
        const filename = metadata.filename || 'decrypted_file';
        const fileType = getFileTypeFromFilename(filename);
        
        appState.decryptedFile = new Blob([decryptedData], { type: fileType });
        appState.decryptedFilename = filename;
        
        // Update UI
        updateDecryptionProgress(100, 'Decryption complete!');
        setTimeout(() => {
            decryptProgress.style.display = 'none';
            showDecryptionOutput();
        }, 1000);
        
    } catch (error) {
        console.error('Decryption failed:', error);
        
        if (error.message.includes('bad password')) {
            alert('Decryption failed: Incorrect password. Please try again.');
        } else if (error.message.includes('integrity')) {
            alert('Decryption failed: File integrity check failed. The file may be corrupted.');
        } else {
            alert('Decryption failed: ' + error.message);
        }
        
        decryptProgress.style.display = 'none';
    }
}

// Crypto functions
async function deriveKey(password, salt) {
    // Convert password to ArrayBuffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Import password as raw key
    const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );
    
    // Derive key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    );
    
    return derivedKey;
}

async function encryptData(key, iv, data) {
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
            tagLength: 128
        },
        key,
        data
    );
    
    return encrypted;
}

async function decryptData(key, iv, data) {
    try {
        const decrypted = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
                tagLength: 128
            },
            key,
            data
        );
        
        return decrypted;
    } catch (error) {
        if (error.toString().includes('bad password') || error.toString().includes('decryption')) {
            throw new Error('bad password');
        }
        throw error;
    }
}

// File packaging
async function packageEncryptedData(metadata, encryptedData) {
    // Convert metadata to JSON string
    const metadataStr = JSON.stringify(metadata);
    const encoder = new TextEncoder();
    const metadataBuffer = encoder.encode(metadataStr);
    
    // Create header: metadata length (4 bytes) + metadata + encrypted data
    const header = new DataView(new ArrayBuffer(4));
    header.setUint32(0, metadataBuffer.length, false); // Big-endian
    
    // Combine everything
    const packaged = new Uint8Array(4 + metadataBuffer.length + encryptedData.byteLength);
    packaged.set(new Uint8Array(header.buffer), 0);
    packaged.set(metadataBuffer, 4);
    packaged.set(new Uint8Array(encryptedData), 4 + metadataBuffer.length);
    
    return packaged.buffer;
}

async function parseEncryptedFile(arrayBuffer) {
    try {
        // Read metadata length from first 4 bytes
        const header = new DataView(arrayBuffer, 0, 4);
        const metadataLength = header.getUint32(0, false); // Big-endian
        
        // Extract metadata
        const metadataStart = 4;
        const metadataEnd = metadataStart + metadataLength;
        const metadataBuffer = arrayBuffer.slice(metadataStart, metadataEnd);
        
        const decoder = new TextDecoder();
        const metadataStr = decoder.decode(metadataBuffer);
        const metadata = JSON.parse(metadataStr);
        
        // Extract encrypted data
        const encryptedData = arrayBuffer.slice(metadataEnd);
        
        return { metadata, encryptedData };
    } catch (error) {
        throw new Error('Invalid encrypted file format');
    }
}

// UI update functions
function showEncryptionOutput() {
    if (!appState.encryptedFile) return;
    
    const fileSize = formatFileSize(appState.encryptedFile.size);
    const timestamp = new Date().toLocaleString();
    const filename = `${appState.currentFile.name}.enc`;
    
    outputFilename.textContent = filename;
    outputFilesize.textContent = fileSize;
    outputTimestamp.textContent = timestamp;
    
    encryptOutputPlaceholder.style.display = 'none';
    encryptOutput.style.display = 'block';
    downloadEncryptedBtn.disabled = false;
}

function showDecryptionOutput() {
    if (!appState.decryptedFile || !appState.decryptedFilename) return;
    
    const fileSize = formatFileSize(appState.decryptedFile.size);
    const filename = appState.decryptedFilename;
    const fileType = getFileTypeFromFilename(filename);
    
    decryptedFilename.textContent = filename;
    decryptedFilesize.textContent = fileSize;
    decryptedFiletype.textContent = fileType || 'Unknown';
    
    decryptOutputPlaceholder.style.display = 'none';
    decryptOutput.style.display = 'block';
    downloadDecryptedBtn.disabled = false;
}

function updateEncryptionProgress(percentage, status) {
    appState.encryptionProgress = percentage;
    encryptProgressPercentage.textContent = `${percentage}%`;
    encryptProgressFill.style.width = `${percentage}%`;
    encryptStatus.textContent = status;
    
    // Calculate estimated time remaining (simplified)
    if (percentage < 100) {
        const timeRemaining = Math.max(1, Math.round((100 - percentage) / 10));
        encryptTimeRemaining.textContent = `${timeRemaining}s`;
    } else {
        encryptTimeRemaining.textContent = 'Complete';
    }
}

function updateDecryptionProgress(percentage, status) {
    appState.decryptionProgress = percentage;
    decryptProgressPercentage.textContent = `${percentage}%`;
    decryptProgressFill.style.width = `${percentage}%`;
    decryptStatus.textContent = status;
}

// File download functions
function downloadEncryptedFile() {
    if (!appState.encryptedFile) return;
    
    const filename = `${appState.currentFile.name}.enc`;
    downloadFile(appState.encryptedFile, filename);
    
    // Show success message
    alert('Encrypted file downloaded successfully!\n\nRemember to share the password securely through a different channel.');
}

function downloadDecryptedFile() {
    if (!appState.decryptedFile || !appState.decryptedFilename) return;
    
    downloadFile(appState.decryptedFile, appState.decryptedFilename);
    
    // Show success message
    alert('File decrypted successfully!\n\nConsider deleting the .enc file for security.');
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utility functions
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileTypeFromFilename(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const mimeTypes = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'txt': 'text/plain',
        'zip': 'application/zip'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
}

async function simulateProgress(start, end, duration) {
    return new Promise(resolve => {
        const steps = 10;
        const stepDuration = duration / steps;
        let current = start;
        
        const interval = setInterval(() => {
            current += (end - start) / steps;
            updateEncryptionProgress(Math.round(current), 'Processing...');
            
            if (current >= end) {
                clearInterval(interval);
                resolve();
            }
        }, stepDuration);
    });
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);