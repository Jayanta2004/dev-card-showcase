/**
 * Keyboard Navigation and Accessibility Module
 * Implements keyboard shortcuts, focus management, and accessibility features
 */

class KeyboardNavigation {
  constructor() {
    this.shortcuts = {
      'Ctrl+K': 'focusSearch',
      'Cmd+K': 'focusSearch',
      'Ctrl+Shift+D': 'toggleTheme',
      'Cmd+Shift+D': 'toggleTheme',
      'Ctrl+G': 'goToGithub',
      'Cmd+G': 'goToGithub',
      'Ctrl+P': 'goToProjects',
      'Cmd+P': 'goToProjects',
      'Ctrl+H': 'goToHome',
      'Cmd+H': 'goToHome',
      'Ctrl+Slash': 'showShortcuts',
      'Cmd+Slash': 'showShortcuts',
      '?': 'showShortcuts',
      'Escape': 'closeModals'
    };

    this.lastFocusedElement = null;
    this.init();
  }

  init() {
    this.setupKeyboardListeners();
    this.setupSkipLinks();
    this.setupFocusManagement();
    this.setupModalFocusTrap();
    this.enhanceFocusIndicators();
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyString(e);

      if (this.shortcuts[key]) {
        e.preventDefault();
        this[this.shortcuts[key]](e);
      }
    });
  }

  getKeyString(event) {
    const parts = [];

    if (event.ctrlKey) parts.push('Ctrl');
    if (event.metaKey) parts.push('Cmd');
    if (event.shiftKey) parts.push('Shift');
    if (event.altKey) parts.push('Alt');

    const key = event.key;
    if (key === '/') parts.push('Slash');
    else if (key === '?') parts.push('?');
    else if (!['Control', 'Meta', 'Shift', 'Alt'].includes(key)) {
      parts.push(key.charAt(0).toUpperCase() + key.slice(1));
    }

    return parts.join('+');
  }

  focusSearch() {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
    if (searchInput) {
      searchInput.focus();
      this.announceToScreenReader('Search focused');
    } else {
      this.announceToScreenReader('No search field found');
    }
  }

  toggleTheme() {
    const themeToggle = document.querySelector('[data-theme-toggle], .theme-toggle');
    if (themeToggle) {
      themeToggle.click();
      const currentTheme = document.body.getAttribute('data-theme');
      this.announceToScreenReader(`Theme changed to ${currentTheme || 'default'}`);
    }
  }

  goToGithub() {
    const githubLink = document.querySelector('a[href*="github.com"]');
    if (githubLink) {
      githubLink.click();
    }
  }

  goToProjects() {
    const projectsLink = document.querySelector('a[href="projects.html"]');
    if (projectsLink) {
      projectsLink.click();
    }
  }

  goToHome() {
    const homeLink = document.querySelector('a[href="index.html"]');
    if (homeLink) {
      homeLink.click();
    }
  }

  showShortcuts(event) {
    if (event && event.target.tagName === 'INPUT') return;

    let modal = document.getElementById('shortcuts-modal');

    if (!modal) {
      modal = this.createShortcutsModal();
    }

    this.lastFocusedElement = document.activeElement;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');

    const closeButton = modal.querySelector('.close-shortcuts');
    if (closeButton) {
      closeButton.focus();
    }

    this.announceToScreenReader('Keyboard shortcuts modal opened');
  }

  createShortcutsModal() {
    const modal = document.createElement('div');
    modal.id = 'shortcuts-modal';
    modal.className = 'shortcuts-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'shortcuts-title');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
      <div class="shortcuts-modal-content">
        <div class="shortcuts-modal-header">
          <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
          <button class="close-shortcuts" aria-label="Close shortcuts modal">&times;</button>
        </div>
        <div class="shortcuts-modal-body">
          <div class="shortcuts-section">
            <h3>Navigation</h3>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>K</kbd>
              <span>Focus search</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>H</kbd>
              <span>Go to home</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>P</kbd>
              <span>Go to projects</span>
            </div>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>G</kbd>
              <span>Go to GitHub</span>
            </div>
          </div>
          <div class="shortcuts-section">
            <h3>Actions</h3>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd>
              <span>Toggle dark/light theme</span>
            </div>
            <div class="shortcut-item">
              <kbd>Escape</kbd>
              <span>Close modals/dropdowns</span>
            </div>
          </div>
          <div class="shortcuts-section">
            <h3>Help</h3>
            <div class="shortcut-item">
              <kbd>Ctrl</kbd> + <kbd>/</kbd> or <kbd>?</kbd>
              <span>Show this help</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-shortcuts');
    closeButton.addEventListener('click', () => this.closeModals());

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModals();
      }
    });

    return modal;
  }

  closeModals() {
    const shortcutsModal = document.getElementById('shortcuts-modal');
    if (shortcutsModal) {
      shortcutsModal.style.display = 'none';
      shortcutsModal.setAttribute('aria-hidden', 'true');
    }

    const dropdowns = document.querySelectorAll('.dropdown-menu.active');
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
      dropdown.setAttribute('aria-expanded', 'false');
    });

    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }

    this.announceToScreenReader('Modal closed');
  }

  setupSkipLinks() {
    if (document.querySelector('.skip-links')) return;

    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#nav-links" class="skip-link">Skip to navigation</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    `;

    document.body.insertBefore(skipLinks, document.body.firstChild);

    skipLinks.querySelectorAll('.skip-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();
          targetElement.tabIndex = -1;
          targetElement.focus();
          this.announceToScreenReader(`Navigated to ${targetElement.textContent.trim().substring(0, 50)}...`);
        }
      });
    });
  }

  setupFocusManagement() {
    document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(element => {
      element.addEventListener('focus', (e) => {
        e.target.classList.add('keyboard-focused');
      });

      element.addEventListener('blur', (e) => {
        e.target.classList.remove('keyboard-focused');
      });
    });

    this.setupDropdownFocus();
  }

  setupDropdownFocus() {
    const dropdownButtons = document.querySelectorAll('.drop-btn');

    dropdownButtons.forEach(button => {
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          button.click();
          const dropdownMenu = button.nextElementSibling;
          if (dropdownMenu) {
            const firstLink = dropdownMenu.querySelector('a');
            if (firstLink) {
              setTimeout(() => firstLink.focus(), 100);
            }
          }
        }
      });
    });
  }

  setupModalFocusTrap() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const modals = node.querySelectorAll ? node.querySelectorAll('[role="dialog"]') : [];
            modals.forEach(modal => this.trapFocus(modal));

            if (node.getAttribute && node.getAttribute('role') === 'dialog') {
              this.trapFocus(node);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });

    firstFocusable.focus();
  }

  enhanceFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      *:focus-visible {
        outline: 3px solid #4d90fe !important;
        outline-offset: 3px !important;
        border-radius: 2px !important;
      }

      .keyboard-focused {
        outline: 3px solid #4d90fe !important;
        outline-offset: 3px !important;
      }

      .skip-links {
        position: absolute;
        top: -40px;
        left: 0;
        right: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      .skip-link {
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        padding: 12px 24px;
        background: #000;
        color: #fff;
        text-decoration: none;
        z-index: 10000;
        border-radius: 0 0 4px 0;
        font-weight: 600;
      }

      .skip-link:focus {
        position: static;
        left: 0;
        width: auto;
        height: auto;
        overflow: visible;
      }

      [data-theme="ocean"] .skip-link:focus,
      [data-theme="dark"] .skip-link:focus {
        background: #38bdf8;
        color: #000;
      }

      .shortcuts-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.75);
        z-index: 10000;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }

      .shortcuts-modal-content {
        background: var(--bg-primary, #fff);
        border-radius: 12px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      [data-theme="ocean"] .shortcuts-modal-content,
      [data-theme="dark"] .shortcuts-modal-content {
        background: var(--bg-primary, #1a1a2e);
        color: var(--text-primary, #fff);
      }

      .shortcuts-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-bottom: 1px solid var(--border-color, #e5e7eb);
      }

      .shortcuts-modal-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      .close-shortcuts {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        color: var(--text-primary, #000);
      }

      .close-shortcuts:hover {
        background: var(--bg-secondary, #f3f4f6);
      }

      .shortcuts-modal-body {
        padding: 24px;
      }

      .shortcuts-section {
        margin-bottom: 24px;
      }

      .shortcuts-section:last-child {
        margin-bottom: 0;
      }

      .shortcuts-section h3 {
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #6b7280);
        margin: 0 0 12px 0;
        font-weight: 600;
      }

      .shortcut-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-color, #f3f4f6);
      }

      .shortcut-item:last-child {
        border-bottom: none;
      }

      .shortcut-item kbd {
        display: inline-block;
        padding: 4px 8px;
        font-size: 12px;
        font-family: inherit;
        background: var(--bg-secondary, #f3f4f6);
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 4px;
        margin: 0 2px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      .shortcut-item span {
        color: var(--text-secondary, #6b7280);
        font-size: 14px;
      }

      @media (max-width: 768px) {
        .shortcuts-modal-content {
          max-width: 100%;
        }

        .shortcut-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .shortcut-item span {
          font-size: 12px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  announceToScreenReader(message) {
    let announcement = document.getElementById('a11y-announcement');

    if (!announcement) {
      announcement = document.createElement('div');
      announcement.id = 'a11y-announcement';
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(announcement);
    }

    announcement.textContent = '';
    setTimeout(() => {
      announcement.textContent = message;
    }, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.keyboardNavigation = new KeyboardNavigation();
  });
} else {
  window.keyboardNavigation = new KeyboardNavigation();
}

export default KeyboardNavigation;
