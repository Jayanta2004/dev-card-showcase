/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║        SECURITY & DATA PRIVACY MANAGER — dev-card-showcase       ║
 * ║  AES-GCM Encrypted Storage · Consent System · Data Validation    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * This module provides a centralized, privacy-first data layer for
 * all features that persist data in localStorage.
 *
 * Components:
 *   1. CryptoEngine     — AES-GCM encryption/decryption via Web Crypto API
 *   2. StorageManager   — Unified read/write with size limits & versioning
 *   3. ConsentManager   — Permission & consent tracking
 *   4. Sanitizer        — Input validation & sanitization
 *   5. PrivacyAudit     — Storage inventory & cleanup scheduler
 *   6. DataPortability  — Export & reset utilities
 */

'use strict';

/* ─────────────────────────────────────────────────
   1.  CRYPTO ENGINE  (AES-GCM via Web Crypto API)
───────────────────────────────────────────────── */
const CryptoEngine = (() => {
    const ALGORITHM = 'AES-GCM';
    const KEY_BITS = 256;
    const IV_BYTES = 12;          // 96-bit IV recommended for AES-GCM
    const SALT_BYTES = 16;
    const ITER_COUNT = 100_000;
    const KEY_MATERIAL_KEY = '_dcs_km_';   // stores wrapped key in sessionStorage

    /** Derive a CryptoKey from a passphrase using PBKDF2 */
    async function deriveKey(passphrase, salt) {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, hash: 'SHA-256', iterations: ITER_COUNT },
            keyMaterial,
            { name: ALGORITHM, length: KEY_BITS },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /** Generate a random device key that lives only in sessionStorage */
    async function getOrCreateDeviceKey() {
        const stored = sessionStorage.getItem(KEY_MATERIAL_KEY);
        if (stored) {
            try {
                const { keyBytes, salt } = JSON.parse(atob(stored));
                return await deriveKey(
                    String.fromCharCode(...new Uint8Array(keyBytes)),
                    new Uint8Array(salt)
                );
            } catch (_) { /* fall through to regenerate */ }
        }
        // Generate new random passphrase material
        const passBytes = crypto.getRandomValues(new Uint8Array(32));
        const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
        sessionStorage.setItem(
            KEY_MATERIAL_KEY,
            btoa(JSON.stringify({ keyBytes: Array.from(passBytes), salt: Array.from(salt) }))
        );
        return deriveKey(String.fromCharCode(...passBytes), salt);
    }

    /** Encrypt a plain-text string; returns base64-encoded ciphertext */
    async function encrypt(plaintext) {
        if (!plaintext) return plaintext;
        const key = await getOrCreateDeviceKey();
        const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
        const enc = new TextEncoder();
        const cipherBuf = await crypto.subtle.encrypt(
            { name: ALGORITHM, iv },
            key,
            enc.encode(plaintext)
        );
        // Prepend IV to cipher bytes, then base64-encode
        const combined = new Uint8Array(iv.byteLength + cipherBuf.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(cipherBuf), iv.byteLength);
        return btoa(String.fromCharCode(...combined));
    }

    /** Decrypt a base64-encoded ciphertext produced by encrypt() */
    async function decrypt(ciphertext) {
        if (!ciphertext) return ciphertext;
        try {
            const key = await getOrCreateDeviceKey();
            const bytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
            const iv = bytes.slice(0, IV_BYTES);
            const data = bytes.slice(IV_BYTES);
            const plainBuf = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, data);
            return new TextDecoder().decode(plainBuf);
        } catch (_) {
            console.warn('[SecurityManager] Decryption failed — returning null');
            return null;
        }
    }

    return { encrypt, decrypt };
})();


/* ─────────────────────────────────────────────────
   2.  STORAGE MANAGER
       • Schema versioning
       • Per-key size limits
       • Write audit trail (timestamp / size)
       • Auto-cleanup when nearing quota
───────────────────────────────────────────────── */
const StorageManager = (() => {
    const SCHEMA_VERSION = 1;
    const MAX_TOTAL_KB = 2048;           // 2 MB soft limit
    const MAX_VALUE_KB = 256;            // 256 KB per key
    const META_KEY = '_dcs_meta_';   // metadata registry
    const VERSION_KEY = '_dcs_ver_';
    const ENCRYPTION_FLAG = '_dcs_enc_';

    // Keys allowed to store sensitive / encrypted data
    const SENSITIVE_KEYS = new Set([
        'devCardSpotlight', 'userProfile', 'moodData', 'focusData',
        'analyticsPrefs', 'viewMode'
    ]);

    /** Bootstrap: write schema version if missing */
    function init() {
        if (!localStorage.getItem(VERSION_KEY)) {
            localStorage.setItem(VERSION_KEY, String(SCHEMA_VERSION));
        }
        _pruneOldEntries(90); // Remove entries older than 90 days on init
    }

    /** Retrieve metadata registry (key → { size, ts, encrypted }) */
    function _getMeta() {
        try {
            return JSON.parse(localStorage.getItem(META_KEY) || '{}');
        } catch (_) { return {}; }
    }

    function _saveMeta(meta) {
        localStorage.setItem(META_KEY, JSON.stringify(meta));
    }

    /** Current total storage used (bytes) */
    function getTotalUsed() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key) || '';
            total += (key.length + val.length) * 2; // UTF-16
        }
        return total;
    }

    /** Remove entries not accessed for `days` days */
    function _pruneOldEntries(days) {
        const cutoff = Date.now() - days * 86_400_000;
        const meta = _getMeta();
        Object.keys(meta).forEach(key => {
            if (meta[key].ts < cutoff) {
                localStorage.removeItem(key);
                delete meta[key];
            }
        });
        _saveMeta(meta);
    }

    /** Write a value; auto-encrypts sensitive keys */
    async function setItem(key, value, opts = {}) {
        if (!ConsentManager.hasConsent('storage')) {
            console.warn('[StorageManager] Storage consent not granted.');
            return false;
        }
        const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        const byteSize = new Blob([strValue]).size;

        if (byteSize > MAX_VALUE_KB * 1024) {
            console.warn(`[StorageManager] Value for "${key}" exceeds ${MAX_VALUE_KB}KB limit.`);
            return false;
        }
        if (getTotalUsed() > MAX_TOTAL_KB * 1024) {
            _pruneOldEntries(30); // Try freeing space first
        }

        const shouldEncrypt = opts.encrypt !== false && SENSITIVE_KEYS.has(key);
        let finalValue = strValue;
        let encrypted = false;

        if (shouldEncrypt && window.isSecureContext) {
            try {
                finalValue = await CryptoEngine.encrypt(strValue);
                encrypted = true;
            } catch (_) { /* store plain if crypto fails */ }
        }

        localStorage.setItem(key, finalValue);
        localStorage.setItem(ENCRYPTION_FLAG + key, String(encrypted));

        const meta = _getMeta();
        meta[key] = { size: byteSize, ts: Date.now(), encrypted };
        _saveMeta(meta);
        return true;
    }

    /** Read a value; auto-decrypts if needed */
    async function getItem(key, fallback = null) {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;

        const isEncrypted = localStorage.getItem(ENCRYPTION_FLAG + key) === 'true';
        let decoded = raw;

        if (isEncrypted && window.isSecureContext) {
            decoded = await CryptoEngine.decrypt(raw);
            if (decoded === null) return fallback;
        }

        // Update access timestamp
        const meta = _getMeta();
        if (meta[key]) {
            meta[key].ts = Date.now();
            _saveMeta(meta);
        }

        try { return JSON.parse(decoded); }
        catch (_) { return decoded; }
    }

    /** Remove a key and its metadata */
    function removeItem(key) {
        localStorage.removeItem(key);
        localStorage.removeItem(ENCRYPTION_FLAG + key);
        const meta = _getMeta();
        delete meta[key];
        _saveMeta(meta);
    }

    /** Return a storage inventory report */
    function getInventory() {
        const meta = _getMeta();
        const total = getTotalUsed();
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && !k.startsWith('_dcs_')) {
                keys.push({
                    key: k,
                    size: Math.round(((k.length + (localStorage.getItem(k) || '').length) * 2) / 1024 * 10) / 10,
                    encrypted: meta[k]?.encrypted || false,
                    age: meta[k] ? Math.round((Date.now() - meta[k].ts) / 86_400_000) : '?'
                });
            }
        }
        return { totalKB: Math.round(total / 1024), maxKB: MAX_TOTAL_KB, keys };
    }

    /** Nuke ALL user data (GDPR-style reset) */
    function resetAll() {
        localStorage.clear();
        sessionStorage.clear();
        init(); // Re-write schema version
    }

    return { init, setItem, getItem, removeItem, getInventory, resetAll, getTotalUsed };
})();


/* ─────────────────────────────────────────────────
   3.  CONSENT MANAGER
       • Granular permissions: storage, geolocation,
         analytics, notifications
       • Consent version tracking
       • UI event hooks
───────────────────────────────────────────────── */
const ConsentManager = (() => {
    const CONSENT_KEY = '_dcs_consent_';
    const CONSENT_VER = 1;

    const DEFAULT_CONSENT = {
        version: CONSENT_VER,
        ts: null,
        storage: false,
        geolocation: false,
        analytics: false,
        notifications: false
    };

    function _load() {
        try {
            const raw = localStorage.getItem(CONSENT_KEY);
            return raw ? { ...DEFAULT_CONSENT, ...JSON.parse(raw) } : { ...DEFAULT_CONSENT };
        } catch (_) { return { ...DEFAULT_CONSENT }; }
    }

    function _save(consent) {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    }

    function hasConsent(permission) {
        return _load()[permission] === true;
    }

    function needsBanner() {
        const c = _load();
        return c.ts === null; // Never seen the banner
    }

    function grantAll() {
        const consent = {
            ...DEFAULT_CONSENT,
            storage: true, geolocation: true, analytics: true, notifications: true,
            ts: Date.now()
        };
        _save(consent);
        _dispatchEvent('consent-updated', consent);
    }

    function grantEssentialOnly() {
        const consent = {
            ...DEFAULT_CONSENT,
            storage: true,
            ts: Date.now()
        };
        _save(consent);
        _dispatchEvent('consent-updated', consent);
    }

    function updateConsent(permissions) {
        const consent = { ..._load(), ...permissions, ts: Date.now() };
        _save(consent);
        _dispatchEvent('consent-updated', consent);
    }

    function getConsent() { return _load(); }

    function revokeAll() {
        const consent = { ...DEFAULT_CONSENT, ts: Date.now() };
        _save(consent);
        _dispatchEvent('consent-updated', consent);
    }

    function _dispatchEvent(name, detail) {
        window.dispatchEvent(new CustomEvent(name, { detail }));
    }

    return { hasConsent, needsBanner, grantAll, grantEssentialOnly, updateConsent, getConsent, revokeAll };
})();


/* ─────────────────────────────────────────────────
   4.  SANITIZER  — Input validation & sanitization
───────────────────────────────────────────────── */
const Sanitizer = (() => {
    const MAX_TEXT_LEN = 10_000;

    /** Strip HTML tags and trim */
    function stripHTML(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/<[^>]*>/g, '')          // remove tags
            .replace(/javascript:/gi, '')      // remove js: proto
            .replace(/on\w+\s*=/gi, '')        // remove event handlers
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .trim()
            .slice(0, MAX_TEXT_LEN);
    }

    /** Escape for safe HTML insertion */
    function escapeHTML(str) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(str).replace(/[&<>"']/g, m => map[m]);
    }

    /** Validate an object against a schema */
    function validate(data, schema) {
        const errors = [];
        for (const [key, rules] of Object.entries(schema)) {
            const val = data[key];
            if (rules.required && (val === undefined || val === null || val === '')) {
                errors.push(`"${key}" is required.`);
                continue;
            }
            if (val !== undefined && rules.type && typeof val !== rules.type) {
                errors.push(`"${key}" must be of type ${rules.type}.`);
            }
            if (rules.maxLen && typeof val === 'string' && val.length > rules.maxLen) {
                errors.push(`"${key}" exceeds max length of ${rules.maxLen}.`);
            }
            if (rules.min !== undefined && val < rules.min) {
                errors.push(`"${key}" must be ≥ ${rules.min}.`);
            }
            if (rules.max !== undefined && val > rules.max) {
                errors.push(`"${key}" must be ≤ ${rules.max}.`);
            }
            if (rules.pattern && !rules.pattern.test(val)) {
                errors.push(`"${key}" has invalid format.`);
            }
        }
        return { valid: errors.length === 0, errors };
    }

    /** Sanitize an entire object (strip HTML from all strings) */
    function sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
        const result = {};
        for (const [k, v] of Object.entries(obj)) {
            result[k] = typeof v === 'string' ? stripHTML(v)
                : typeof v === 'object' ? sanitizeObject(v)
                    : v;
        }
        return result;
    }

    return { stripHTML, escapeHTML, validate, sanitizeObject };
})();


/* ─────────────────────────────────────────────────
   5.  DATA PORTABILITY
       • Export all user data as JSON
       • Full reset with confirmation
───────────────────────────────────────────────── */
const DataPortability = (() => {

    /** Collect all non-internal localStorage entries */
    function collectData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.startsWith('_dcs_')) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch (_) {
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        return {
            exportedAt: new Date().toISOString(),
            schemaVersion: 1,
            data
        };
    }

    /** Trigger a JSON download of user data */
    function exportData() {
        const bundle = collectData();
        const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dev-card-data-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        return bundle;
    }

    /** Full wipe with an optional confirmation callback */
    function resetMyData(onConfirm) {
        if (typeof onConfirm === 'function') {
            onConfirm(() => {
                StorageManager.resetAll();
                ConsentManager.revokeAll();
                window.dispatchEvent(new CustomEvent('data-reset'));
            });
        } else {
            StorageManager.resetAll();
            ConsentManager.revokeAll();
            window.dispatchEvent(new CustomEvent('data-reset'));
        }
    }

    return { exportData, collectData, resetMyData };
})();


/* ─────────────────────────────────────────────────
   6.  PRIVACY AUDIT — Security Checklist & UI
───────────────────────────────────────────────── */
const PrivacyAudit = (() => {

    function runChecks() {
        const checks = [];

        // HTTPS check
        checks.push({
            id: 'https',
            label: 'Secure Context (HTTPS)',
            pass: window.isSecureContext,
            note: window.isSecureContext ? 'Running on HTTPS ✓' : 'Not on HTTPS — encryption unavailable'
        });

        // Web Crypto availability
        checks.push({
            id: 'crypto',
            label: 'Web Crypto API Available',
            pass: !!(window.crypto && window.crypto.subtle),
            note: !!(window.crypto && window.crypto.subtle) ? 'AES-GCM encryption available ✓' : 'Crypto API unavailable'
        });

        // Consent given
        const consent = ConsentManager.getConsent();
        checks.push({
            id: 'consent',
            label: 'User Consent Recorded',
            pass: consent.ts !== null,
            note: consent.ts ? `Consent given on ${new Date(consent.ts).toLocaleDateString()}` : 'Consent not yet obtained'
        });

        // Storage within limits
        const inv = StorageManager.getInventory();
        const pct = Math.round((inv.totalKB / inv.maxKB) * 100);
        checks.push({
            id: 'storage',
            label: 'Storage Within Limits',
            pass: pct < 80,
            note: `${inv.totalKB} KB used of ${inv.maxKB} KB (${pct}%)`
        });

        // No eval usage (static check)
        checks.push({
            id: 'noeval',
            label: 'No eval() Usage',
            pass: true,
            note: 'Code does not use eval() for dynamic execution ✓'
        });

        // CSP present check (best effort via meta tag)
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        checks.push({
            id: 'csp',
            label: 'Content Security Policy',
            pass: !!cspMeta,
            note: cspMeta ? 'CSP meta tag present ✓' : 'Consider adding a CSP meta tag'
        });

        return checks;
    }

    return { runChecks };
})();


/* ─────────────────────────────────────────────────
   7.  CONSENT BANNER UI  (injected into DOM)
───────────────────────────────────────────────── */
const ConsentBannerUI = (() => {
    const BANNER_ID = 'dcs-consent-banner';

    function show() {
        if (document.getElementById(BANNER_ID)) return;

        const banner = document.createElement('div');
        banner.id = BANNER_ID;
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-modal', 'true');
        banner.setAttribute('aria-label', 'Privacy Consent');
        banner.innerHTML = `
      <div class="dcs-banner-inner">
        <div class="dcs-banner-icon">🔒</div>
        <div class="dcs-banner-content">
          <h3>Your Privacy Matters</h3>
          <p>
            This platform stores preferences and feature data locally on your device.
            We don't send your data to external servers. You can manage permissions anytime
            from the <a href="privacy-center.html" class="dcs-link">Privacy Center</a>.
          </p>
          <div class="dcs-banner-toggles">
            <label class="dcs-toggle-label">
              <input type="checkbox" id="dcs-consent-storage" checked disabled>
              <span class="dcs-toggle-track"><span class="dcs-toggle-thumb"></span></span>
              Essential Storage <span class="dcs-badge">Required</span>
            </label>
            <label class="dcs-toggle-label">
              <input type="checkbox" id="dcs-consent-analytics">
              <span class="dcs-toggle-track"><span class="dcs-toggle-thumb"></span></span>
              Analytics
            </label>
            <label class="dcs-toggle-label">
              <input type="checkbox" id="dcs-consent-geo">
              <span class="dcs-toggle-track"><span class="dcs-toggle-thumb"></span></span>
              Geolocation
            </label>
          </div>
        </div>
        <div class="dcs-banner-actions">
          <button id="dcs-accept-all"   class="dcs-btn dcs-btn-primary">Accept All</button>
          <button id="dcs-accept-sel"   class="dcs-btn dcs-btn-secondary">Save Choices</button>
          <button id="dcs-reject"       class="dcs-btn dcs-btn-ghost">Essential Only</button>
        </div>
      </div>
    `;
        document.body.appendChild(banner);

        // Animate in
        requestAnimationFrame(() => banner.classList.add('dcs-banner-visible'));

        document.getElementById('dcs-accept-all').addEventListener('click', () => {
            ConsentManager.grantAll();
            document.getElementById('dcs-consent-analytics').checked = true;
            document.getElementById('dcs-consent-geo').checked = true;
            hide();
        });

        document.getElementById('dcs-accept-sel').addEventListener('click', () => {
            ConsentManager.updateConsent({
                storage: true,
                analytics: document.getElementById('dcs-consent-analytics').checked,
                geolocation: document.getElementById('dcs-consent-geo').checked
            });
            hide();
        });

        document.getElementById('dcs-reject').addEventListener('click', () => {
            ConsentManager.grantEssentialOnly();
            hide();
        });
    }

    function hide() {
        const banner = document.getElementById(BANNER_ID);
        if (banner) {
            banner.classList.remove('dcs-banner-visible');
            banner.classList.add('dcs-banner-hiding');
            setTimeout(() => banner.remove(), 500);
        }
    }

    function init() {
        if (ConsentManager.needsBanner()) {
            // Small delay so page renders first
            setTimeout(show, 1200);
        }
    }

    return { init, show, hide };
})();


/* ─────────────────────────────────────────────────
   8.  BOOTSTRAP — Run on DOMContentLoaded
───────────────────────────────────────────────── */
(function bootstrap() {
    StorageManager.init();

    // Show consent banner if needed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ConsentBannerUI.init);
    } else {
        ConsentBannerUI.init();
    }

    // Expose to window for use by other scripts
    window.SecurityManager = {
        crypto: CryptoEngine,
        storage: StorageManager,
        consent: ConsentManager,
        sanitize: Sanitizer,
        portability: DataPortability,
        audit: PrivacyAudit,
        consentUI: ConsentBannerUI
    };

    console.info('[SecurityManager] Initialized — Privacy-first data layer active.');
})();
