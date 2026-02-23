# Theme Persistence Module

This module handles the light/dark theme switching and persistence functionality for the Community Card Showcase.

## Features

- **Persistent Theme Storage**: Saves user theme preference in localStorage
- **Automatic Application**: Applies saved theme on page load
- **Cross-page Consistency**: Theme persists across all pages
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Fallback Support**: Defaults to dark theme if no preference saved

## Usage

The theme module is automatically loaded via `include.js` and requires no manual initialization.

### Manual Control

```javascript
// Get current theme
const currentTheme = themeManager.getSavedTheme();

// Toggle theme
themeManager.toggleTheme();

// Apply specific theme
themeManager.applyTheme('light');
```

## Implementation Details

### Files
- `theme-persistence/theme.js` - Main theme management logic
- `js/include.js` - Loads theme script dynamically
- `style.css` - CSS variables for theme colors

### Theme Storage
- Key: `devCardShowcaseTheme`
- Values: `'light'` or `'dark'`
- Storage: `localStorage`

### CSS Variables
The theme system uses CSS custom properties defined in `:root` and `body[data-theme="light"]`.

## Browser Support

- Modern browsers with localStorage support
- Graceful degradation for older browsers (defaults to dark theme)

## Accessibility

- Theme toggle button includes `aria-label`
- Keyboard navigation support (Enter/Space keys)
- High contrast ratios maintained in both themes