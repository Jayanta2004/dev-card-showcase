/**
 * utils.js
 * Shared helper functions for Browser Storage Comparison Demo
 */

/* ===========================
   DOM Helpers
=========================== */
function $(id) {
  return document.getElementById(id);
}

function createElement(tag, text = "", className = "") {
  const el = document.createElement(tag);
  el.textContent = text;
  if (className) el.className = className;
  return el;
}

/* ===========================
   Cookie Utilities
=========================== */
function setCookie(key, value, days = 1) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookiesAsObject() {
  return document.cookie.split(";").reduce((acc, c) => {
    const [k, v] = c.split("=");
    if (k && v) acc[k.trim()] = decodeURIComponent(v);
    return acc;
  }, {});
}

function clearAllCookies() {
  document.cookie.split(";").forEach(c => {
    document.cookie =
      c.replace(/^ +/, "")
       .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
}

/* ===========================
   Storage Formatter
=========================== */
function formatStorage(storage) {
  const obj = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    obj[key] = storage.getItem(key);
  }
  return JSON.stringify(obj, null, 2);
}

/* ===========================
   Validation
=========================== */
function validateInput(key, value) {
  if (!key || !value) {
    return "Key and Value cannot be empty.";
  }
  if (key.length > 50) {
    return "Key is too long (max 50 characters).";
  }
  return null;
}

/* ===========================
   History Logger
=========================== */
function logAction(listEl, message) {
  const li = createElement("li", message);
  listEl.prepend(li);
}