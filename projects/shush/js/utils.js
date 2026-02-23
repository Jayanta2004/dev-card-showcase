/**
 * SHUSH - Utility Functions
 */

function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const context = this;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, wait) {
    let inThrottle, lastFunc, lastTime;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            lastTime = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if (Date.now() - lastTime >= wait) {
                    func.apply(context, args);
                    lastTime = Date.now();
                }
            }, Math.max(wait - (Date.now() - lastTime), 0));
        }
    };
}

function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function mapRange(value, inMin, inMax, outMin, outMax) { 
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin; 
}
function lerp(start, end, amount) { return start + (end - start) * amount; }
function formatNumber(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
}

function generateId(prefix = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function isInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 &&
           rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
           rect.right <= (window.innerWidth || document.documentElement.clientWidth);
}

function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function safeJsonParse(str, fallback = null) {
    try { return JSON.parse(str); } 
    catch (e) { console.warn('Failed to parse JSON:', e); return fallback; }
}

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) console.warn(`Element with id "${id}" not found`);
    return element;
}

function getElements(selector) { return Array.from(document.querySelectorAll(selector)); }

function addListener(element, event, handler, options = {}) {
    if (!element) return null;
    element.addEventListener(event, handler, options);
    return { remove: () => element.removeEventListener(event, handler, options) };
}

function supportsWebAudio() { return !!(window.AudioContext || window.webkitAudioContext); }
function supportsGetUserMedia() { 
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); 
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown', version = 'Unknown';
    if (ua.indexOf('Firefox') > -1) {
        browser = 'Firefox';
        version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Chrome') > -1) {
        browser = 'Chrome';
        version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Safari') > -1) {
        browser = 'Safari';
        version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.indexOf('Edge') > -1) {
        browser = 'Edge';
        version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
    }
    return { browser, version };
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function getViewportSize() {
    return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
}

function scrollToElement(element, offset = 0) {
    if (!element) return;
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: targetPosition + offset, behavior: 'smooth' });
}

function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') element.className = value;
        else if (key === 'style' && typeof value === 'object') Object.assign(element.style, value);
        else if (key.startsWith('on') && typeof value === 'function') 
            element.addEventListener(key.substring(2).toLowerCase(), value);
        else element.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
        else if (child instanceof HTMLElement) element.appendChild(child);
    });
    return element;
}

function clearElement(element) {
    if (!element) return;
    while (element.firstChild) element.removeChild(element.firstChild);
}

function toggleClass(element, className, force) {
    return element ? element.classList.toggle(className, force) : undefined;
}

function hasClass(element, className) {
    return element ? element.classList.contains(className) : false;
}

const storage = {
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) { console.warn('Failed to get from localStorage:', error); return defaultValue; }
    },
    set: function(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } 
        catch (error) { console.warn('Failed to save to localStorage:', error); return false; }
    },
    remove: function(key) {
        try { localStorage.removeItem(key); return true; } 
        catch (error) { console.warn('Failed to remove from localStorage:', error); return false; }
    },
    clear: function() {
        try { localStorage.clear(); return true; } 
        catch (error) { console.warn('Failed to clear localStorage:', error); return false; }
    }
};

class EventEmitter {
    constructor() { this.events = {}; }
    on(event, listener) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(listener);
        return () => this.off(event, listener);
    }
    off(event, listenerToRemove) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    }
    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(...args));
    }
    once(event, listener) {
        const onceWrapper = (...args) => { listener(...args); this.off(event, onceWrapper); };
        return this.on(event, onceWrapper);
    }
    removeAllListeners(event) {
        if (event) delete this.events[event];
        else this.events = {};
    }
}

function validateSensitivity(value) {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 0 && num <= 100 ? num : 50;
}

function validateTransitionSpeed(value) {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= 100 && num <= 2000 ? num : 500;
}

function random(min, max) { return Math.random() * (max - min) + min; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
