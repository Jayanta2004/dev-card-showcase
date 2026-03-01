/**
 * Zero-Trust Identity Fabric - Decentralized Authentication Layer
 * Issue #6250
 *
 * Features:
 * - Cryptographic identity token generation
 * - Behavioral anomaly detection
 * - Dynamic least-privilege access control
 * - Enterprise IAM integration simulation
 */

// Global state
let identityToken = null;
let isAuthenticated = false;
let permissions = {
    read: false,
    write: false,
    admin: false
};
let behaviorMetrics = {
    mouseMoves: 0,
    keystrokes: 0,
    sessionStart: Date.now(),
    lastActivity: Date.now()
};
let anomalyThreshold = 0.7;

// DOM elements
const authStatus = document.getElementById('auth-status');
const generateIdentityBtn = document.getElementById('generate-identity');
const authenticateBtn = document.getElementById('authenticate');
const tokenDisplay = document.getElementById('token-display');
const readAccess = document.getElementById('read-access');
const writeAccess = document.getElementById('write-access');
const adminAccess = document.getElementById('admin-access');
const requestAccessBtn = document.getElementById('request-access');
const accessStatus = document.getElementById('access-status');
const mouseMovesSpan = document.getElementById('mouse-moves');
const keystrokesSpan = document.getElementById('keystrokes');
const anomalyScoreSpan = document.getElementById('anomaly-score');
const anomalyAlert = document.getElementById('anomaly-alert');
const syncIamBtn = document.getElementById('sync-iam');
const iamStatus = document.getElementById('iam-status');

// Cryptographic token generation using Web Crypto API
async function generateIdentityToken() {
    try {
        const keyPair = await crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256"
            },
            true,
            ["sign", "verify"]
        );

        const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
        const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

        const tokenData = {
            id: generateUUID(),
            timestamp: Date.now(),
            permissions: permissions,
            publicKey: arrayBufferToBase64(publicKey),
            signature: await signData(keyPair.privateKey, JSON.stringify({
                id: generateUUID(),
                timestamp: Date.now(),
                permissions: permissions
            }))
        };

        return btoa(JSON.stringify(tokenData));
    } catch (error) {
        console.error('Token generation failed:', error);
        // Fallback for browsers without crypto support
        return btoa(JSON.stringify({
            id: generateUUID(),
            timestamp: Date.now(),
            permissions: permissions,
            fallback: true
        }));
    }
}

async function signData(privateKey, data) {
    try {
        const signature = await crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" }
            },
            privateKey,
            new TextEncoder().encode(data)
        );
        return arrayBufferToBase64(signature);
    } catch (error) {
        return 'fallback-signature';
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Authentication functions
async function generateIdentity() {
    identityToken = await generateIdentityToken();
    tokenDisplay.textContent = `Token: ${identityToken.substring(0, 50)}...`;
    updateAuthStatus();
}

function authenticate() {
    if (identityToken && validateToken(identityToken)) {
        isAuthenticated = true;
        updateAuthStatus();
        updateAccessStatus();
    } else {
        alert('Invalid or missing identity token. Please generate a token first.');
    }
}

function validateToken(token) {
    try {
        const tokenData = JSON.parse(atob(token));
        const now = Date.now();
        const tokenAge = now - tokenData.timestamp;

        // Token expires after 1 hour
        if (tokenAge > 3600000) {
            return false;
        }

        // Validate anomaly score
        const anomalyScore = calculateAnomalyScore();
        if (anomalyScore > anomalyThreshold) {
            return false;
        }

        return true;
    } catch (error) {
        return false;
    }
}

// Access control functions
function requestAccess() {
    if (!isAuthenticated) {
        accessStatus.textContent = 'Authentication required';
        accessStatus.className = '';
        return;
    }

    permissions.read = readAccess.checked;
    permissions.write = writeAccess.checked;
    permissions.admin = adminAccess.checked;

    // Dynamic access control: enforce least privilege
    if (permissions.admin) {
        permissions.read = true;
        permissions.write = true;
        readAccess.checked = true;
        writeAccess.checked = true;
    } else if (permissions.write) {
        permissions.read = true;
        readAccess.checked = true;
    }

    updateAccessStatus();
    regenerateToken();
}

function updateAccessStatus() {
    const grantedPermissions = Object.entries(permissions)
        .filter(([_, granted]) => granted)
        .map(([perm, _]) => perm.charAt(0).toUpperCase() + perm.slice(1));

    if (grantedPermissions.length > 0) {
        accessStatus.textContent = `Access granted: ${grantedPermissions.join(', ')}`;
        accessStatus.className = 'authenticated';
    } else {
        accessStatus.textContent = 'No access granted';
        accessStatus.className = 'not-authenticated';
    }
}

async function regenerateToken() {
    if (isAuthenticated) {
        identityToken = await generateIdentityToken();
        tokenDisplay.textContent = `Token: ${identityToken.substring(0, 50)}...`;
    }
}

// Behavioral anomaly detection
function trackMouseMovement() {
    document.addEventListener('mousemove', () => {
        behaviorMetrics.mouseMoves++;
        behaviorMetrics.lastActivity = Date.now();
        updateBehaviorMetrics();
        checkAnomaly();
    });
}

function trackKeystrokes() {
    document.addEventListener('keydown', () => {
        behaviorMetrics.keystrokes++;
        behaviorMetrics.lastActivity = Date.now();
        updateBehaviorMetrics();
        checkAnomaly();
    });
}

function updateBehaviorMetrics() {
    mouseMovesSpan.textContent = behaviorMetrics.mouseMoves;
    keystrokesSpan.textContent = behaviorMetrics.keystrokes;
    anomalyScoreSpan.textContent = calculateAnomalyScore().toFixed(2);
}

function calculateAnomalyScore() {
    const sessionDuration = (Date.now() - behaviorMetrics.sessionStart) / 1000; // seconds
    const timeSinceLastActivity = (Date.now() - behaviorMetrics.lastActivity) / 1000;

    // Simple anomaly detection based on activity patterns
    const expectedMouseRate = sessionDuration * 0.5; // expected 0.5 mouse moves per second
    const expectedKeyRate = sessionDuration * 0.1; // expected 0.1 keystrokes per second

    const mouseAnomaly = Math.abs(behaviorMetrics.mouseMoves - expectedMouseRate) / (expectedMouseRate + 1);
    const keyAnomaly = Math.abs(behaviorMetrics.keystrokes - expectedKeyRate) / (expectedKeyRate + 1);
    const inactivityAnomaly = timeSinceLastActivity > 300 ? 0.5 : 0; // high anomaly if inactive > 5 min

    return Math.min((mouseAnomaly + keyAnomaly + inactivityAnomaly) / 3, 1);
}

function checkAnomaly() {
    const score = calculateAnomalyScore();
    if (score > anomalyThreshold) {
        anomalyAlert.textContent = '⚠️ Behavioral anomaly detected! Session may be compromised.';
        anomalyAlert.className = 'anomaly';
        // In a real system, this would trigger additional verification
    } else {
        anomalyAlert.textContent = '';
        anomalyAlert.className = '';
    }
}

// Enterprise IAM integration simulation
function syncWithEnterpriseIAM() {
    // Simulate API call to enterprise IAM system
    iamStatus.textContent = 'Syncing with Enterprise IAM...';
    iamStatus.className = '';

    setTimeout(() => {
        // Simulate successful sync
        iamStatus.textContent = 'Successfully synced with Enterprise IAM system';
        iamStatus.className = 'authenticated';

        // Update permissions based on IAM sync
        if (isAuthenticated) {
            permissions.read = true;
            readAccess.checked = true;
            updateAccessStatus();
            regenerateToken();
        }
    }, 2000);
}

// UI update functions
function updateAuthStatus() {
    if (isAuthenticated) {
        authStatus.textContent = 'Authenticated';
        authStatus.className = 'authenticated';
    } else {
        authStatus.textContent = 'Not Authenticated';
        authStatus.className = 'not-authenticated';
    }
}

// Initialize the application
function init() {
    // Event listeners
    generateIdentityBtn.addEventListener('click', generateIdentity);
    authenticateBtn.addEventListener('click', authenticate);
    requestAccessBtn.addEventListener('click', requestAccess);
    syncIamBtn.addEventListener('click', syncWithEnterpriseIAM);

    // Start behavioral tracking
    trackMouseMovement();
    trackKeystrokes();

    // Periodic anomaly checking
    setInterval(checkAnomaly, 5000);

    updateAuthStatus();
    updateAccessStatus();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);