// DOM Elements
const binaryInput = document.getElementById('binary-input');
const decimalInput = document.getElementById('decimal-input');
const hexInput = document.getElementById('hex-input');
const clearBtn = document.getElementById('clear-btn');
const swapBtn = document.getElementById('swap-btn');

// Result display elements
const binaryResult = document.getElementById('binary-result');
const decimalResult = document.getElementById('decimal-result');
const hexResult = document.getElementById('hex-result');
const binaryDetail = document.getElementById('binary-detail');
const decimalDetail = document.getElementById('decimal-detail');
const hexDetail = document.getElementById('hex-detail');

// Validation regex patterns
const binaryPattern = /^[01]+$/;
const decimalPattern = /^\d+$/;
const hexPattern = /^[0-9A-Fa-f]+$/;

// Track last valid input to prevent infinite update loops
let lastValidBinary = '';
let lastValidDecimal = '';
let lastValidHex = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    clearAll();
});

// Event Listeners for inputs
binaryInput.addEventListener('input', function() {
    const value = this.value.trim();
    
    if (value === '') {
        clearAll();
        return;
    }
    
    if (!binaryPattern.test(value)) {
        showError(this, 'Invalid binary (only 0 and 1 allowed)');
        return;
    }
    
    clearError(this);
    lastValidBinary = value;
    convertFromBinary(value);
});

decimalInput.addEventListener('input', function() {
    const value = this.value.trim();
    
    if (value === '') {
        clearAll();
        return;
    }
    
    if (!decimalPattern.test(value)) {
        showError(this, 'Invalid decimal (whole numbers only)');
        return;
    }
    
    // Check if number is too large for reasonable conversion
    if (parseInt(value) > 999999999999999) {
        showError(this, 'Number too large');
        return;
    }
    
    clearError(this);
    lastValidDecimal = value;
    convertFromDecimal(value);
});

hexInput.addEventListener('input', function() {
    const value = this.value.trim().toUpperCase();
    
    if (value === '') {
        clearAll();
        return;
    }
    
    if (!hexPattern.test(value)) {
        showError(this, 'Invalid hex (only 0-9, A-F allowed)');
        return;
    }
    
    clearError(this);
    lastValidHex = value;
    convertFromHex(value);
});

// Clear button
clearBtn.addEventListener('click', clearAll);

// Swap byte order button
swapBtn.addEventListener('click', swapByteOrder);

// Conversion Functions
function convertFromBinary(binaryStr) {
    // Convert binary to decimal
    const decimal = parseInt(binaryStr, 2);
    
    // Convert decimal to hex
    const hex = decimal.toString(16).toUpperCase();
    
    // Update input fields without triggering events
    decimalInput.value = decimal;
    hexInput.value = hex;
    
    // Update result displays
    updateResults(binaryStr, decimal, hex);
}

function convertFromDecimal(decimalStr) {
    const decimal = parseInt(decimalStr, 10);
    
    // Convert decimal to binary
    const binary = decimal.toString(2);
    
    // Convert decimal to hex
    const hex = decimal.toString(16).toUpperCase();
    
    // Update input fields without triggering events
    binaryInput.value = binary;
    hexInput.value = hex;
    
    // Update result displays
    updateResults(binary, decimal, hex);
}

function convertFromHex(hexStr) {
    // Convert hex to decimal
    const decimal = parseInt(hexStr, 16);
    
    // Convert decimal to binary
    const binary = decimal.toString(2);
    
    // Update input fields without triggering events
    binaryInput.value = binary;
    decimalInput.value = decimal;
    
    // Update result displays
    updateResults(binary, decimal, hexStr);
}

function updateResults(binary, decimal, hex) {
    // Format binary in 8-bit groups
    const formattedBinary = formatBinary(binary);
    binaryResult.textContent = formattedBinary;
    binaryDetail.textContent = `${binary.length} bits`;
    
    // Display decimal
    decimalResult.textContent = decimal.toLocaleString();
    decimalDetail.textContent = `Base 10`;
    
    // Format hex with 0x prefix and group by bytes
    const formattedHex = formatHex(hex);
    hexResult.textContent = `0x${formattedHex}`;
    hexDetail.textContent = `${hex.length} hex digits`;
}

function formatBinary(binaryStr) {
    // Pad with leading zeros to make complete bytes
    const paddedLength = Math.ceil(binaryStr.length / 8) * 8;
    const paddedBinary = binaryStr.padStart(paddedLength, '0');
    
    // Split into 8-bit groups
    const groups = [];
    for (let i = 0; i < paddedBinary.length; i += 8) {
        groups.push(paddedBinary.substr(i, 8));
    }
    
    return groups.join(' ');
}

function formatHex(hexStr) {
    // Pad with leading zeros to make complete bytes (2 hex digits per byte)
    const paddedLength = Math.ceil(hexStr.length / 2) * 2;
    const paddedHex = hexStr.padStart(paddedLength, '0');
    
    // Split into 2-character groups (bytes)
    const groups = [];
    for (let i = 0; i < paddedHex.length; i += 2) {
        groups.push(paddedHex.substr(i, 2));
    }
    
    return groups.join(' ');
}

function swapByteOrder() {
    const hexValue = hexInput.value.trim().toUpperCase();
    
    if (!hexPattern.test(hexValue) || hexValue === '') {
        showError(hexInput, 'No valid hex to swap');
        return;
    }
    
    // Pad to even number of hex digits
    const paddedHex = hexValue.length % 2 === 0 ? hexValue : '0' + hexValue;
    
    // Split into bytes and reverse
    const bytes = [];
    for (let i = 0; i < paddedHex.length; i += 2) {
        bytes.push(paddedHex.substr(i, 2));
    }
    
    const swappedHex = bytes.reverse().join('');
    
    // Convert swapped hex back to update all fields
    convertFromHex(swappedHex);
    
    // Show a message
    hexDetail.textContent = 'Byte order swapped';
}

function clearAll() {
    // Clear input fields
    binaryInput.value = '';
    decimalInput.value = '';
    hexInput.value = '';
    
    // Clear errors
    clearError(binaryInput);
    clearError(decimalInput);
    clearError(hexInput);
    
    // Reset results
    binaryResult.textContent = '-';
    decimalResult.textContent = '-';
    hexResult.textContent = '-';
    
    // Reset details
    binaryDetail.textContent = '8-bit groups';
    decimalDetail.textContent = 'Base 10';
    hexDetail.textContent = '0x prefix';
    
    // Reset last valid values
    lastValidBinary = '';
    lastValidDecimal = '';
    lastValidHex = '';
}

function showError(inputElement, message) {
    // Remove any existing error class
    clearError(inputElement);
    
    // Add error styling
    inputElement.parentElement.classList.add('error');
    
    // Update hint with error message
    const hint = inputElement.parentElement.parentElement.querySelector('.hint');
    if (hint) {
        const originalText = hint.getAttribute('data-original') || hint.textContent;
        hint.setAttribute('data-original', originalText);
        hint.textContent = message;
        hint.style.color = '#e63946';
    }
}

function clearError(inputElement) {
    // Remove error styling
    inputElement.parentElement.classList.remove('error');
    
    // Restore original hint
    const hint = inputElement.parentElement.parentElement.querySelector('.hint');
    if (hint && hint.hasAttribute('data-original')) {
        hint.textContent = hint.getAttribute('data-original');
        hint.style.color = '#888';
    }
}

// Add CSS for error state
const style = document.createElement('style');
style.textContent = `
    .input-with-icon.error .base-indicator {
        background-color: #e63946;
        color: white;
    }
    
    .input-with-icon.error input {
        border-color: #e63946;
    }
`;
document.head.appendChild(style);