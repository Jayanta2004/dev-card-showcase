'use strict';

function getSavedTheme() {
  return localStorage.getItem('theme');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const currentTheme = getSavedTheme() || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
}

describe('Theme Management', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('getSavedTheme', () => {
    test('returns null when no theme is saved', () => {
      expect(getSavedTheme()).toBeNull();
    });

    test('returns the saved theme value', () => {
      localStorage.setItem('theme', 'light');
      expect(getSavedTheme()).toBe('light');
    });

    test('returns dark theme when set', () => {
      localStorage.setItem('theme', 'dark');
      expect(getSavedTheme()).toBe('dark');
    });
  });

  describe('applyTheme', () => {
    test('sets data-theme attribute on document element', () => {
      applyTheme('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('saves theme to localStorage', () => {
      applyTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    test('overwrites previous theme value', () => {
      applyTheme('light');
      applyTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    test('toggles from dark to light', () => {
      localStorage.setItem('theme', 'dark');
      const newTheme = toggleTheme();
      expect(newTheme).toBe('light');
    });

    test('toggles from light to dark', () => {
      localStorage.setItem('theme', 'light');
      const newTheme = toggleTheme();
      expect(newTheme).toBe('dark');
    });

    test('defaults to dark when no theme is set and toggles to light', () => {
      const newTheme = toggleTheme();
      expect(newTheme).toBe('light');
    });
  });
});
