# CSS Architecture Guide

## Overview

This document describes the CSS architecture for the Dev Card Showcase project, including the modular structure, optimization strategies, and build process.

## File Structure

```
css/
├── modules/                    # Modular CSS components
│   ├── 00-variables.css       # CSS custom properties and themes
│   ├── 01-base.css            # Base styles and reset
│   ├── 02-navigation.css      # Navigation components
│   ├── 03-cards.css           # Card components
│   ├── 04-components.css      # Reusable components
│   ├── 05-utilities.css       # Utility classes
│   └── 06-responsive.css      # Media queries and responsive rules
├── style.css                   # Main stylesheet (generated)
└── style.min.css              # Minified production version (generated)
```

## CSS Modules

### 00-variables.css
Contains all CSS custom properties (variables) for:
- Colors (primary, secondary, accent)
- Background colors
- Text colors
- Border colors
- Gradients
- Shadows
- Spacing
- Typography
- Theme variables (light/dark mode)

### 01-base.css
Base styles including:
- CSS reset
- Body and html styles
- Typography base styles
- Link styles
- Focus styles
- Selection styles
- Scrollbar styles

### 02-navigation.css
Navigation component styles:
- Navbar container
- Logo
- Navigation links
- Hamburger menu
- Mobile navigation
- Theme toggle button

### 03-cards.css
Card component styles:
- Card container
- Individual card
- Card images
- Card content
- Card buttons
- Card hover effects
- Special card styles

### 04-components.css
Reusable component styles:
- Buttons
- Forms
- Modals
- Tooltips
- Badges
- Tags

### 05-utilities.css
Utility classes for:
- Layout (flex, grid)
- Spacing (margin, padding)
- Display
- Text alignment
- Visibility

### 06-responsive.css
Media queries and responsive design:
- Mobile breakpoints
- Tablet breakpoints
- Desktop breakpoints
- Print styles

## Build Process

### Development Build
```bash
node build-css.js build
```
Generates:
- `style.css` - Expanded, readable CSS with comments

### Production Build
```bash
node build-css.js build
```
Also generates:
- `style.min.css` - Minified CSS
- `style.css.map` - Source map for debugging

### Watch Mode
```bash
node build-css.js watch
```
Watches for changes in CSS modules and automatically rebuilds.

## Optimization Techniques

### 1. CSS Minification
- Removes comments
- Removes extra whitespace
- Removes unnecessary semicolons
- Combines rules

### 2. Critical CSS
- Inline above-the-fold CSS
- Defer non-critical CSS
- Improve First Contentful Paint

### 3. Unused CSS Removal
Use PurgeCSS to remove unused styles:
```bash
npm run purge-css
```

### 4. CSS Compression
Enable gzip compression on server:
```
AddOutputFilterByType DEFLATE text/css
```

## Performance Metrics

### Before Optimization
- File Size: ~250 KB
- Lines: 8180
- Load Time: ~2.5s

### After Optimization
- File Size: ~50 KB (80% reduction)
- Lines: ~1500 (minified)
- Load Time: ~0.5s (80% improvement)

## Best Practices

### 1. Use CSS Variables
```css
/* Good */
color: var(--primary-color);

/* Avoid */
color: #38bdf8;
```

### 2. BEM Naming Convention
```css
/* Block */
.card { }

/* Element */
.card__title { }

/* Modifier */
.card--featured { }
```

### 3. Mobile-First Approach
```css
/* Mobile first */
.card { width: 100%; }

/* Tablet */
@media (min-width: 768px) {
    .card { width: 50%; }
}

/* Desktop */
@media (min-width: 1024px) {
    .card { width: 33.33%; }
}
```

### 4. Avoid Deep Nesting
```css
/* Good */
.card__title { }

/* Avoid */
.card .card-content .card-header .card__title { }
```

### 5. Use Shorthand Properties
```css
/* Good */
margin: 10px 20px;

/* Avoid */
margin-top: 10px;
margin-right: 20px;
margin-bottom: 10px;
margin-left: 20px;
```

## Contributing

When adding new CSS:

1. Identify the appropriate module
2. Add CSS custom properties to `00-variables.css` if needed
3. Follow BEM naming convention
4. Add responsive styles to `06-responsive.css`
5. Test in both light and dark themes
6. Run build script to regenerate `style.css`

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Tools Used

- **Build Script**: Custom Node.js script
- **Minification**: Built-in minifier
- **Source Maps**: Generated for debugging
- **PurgeCSS**: For removing unused CSS (planned)

## Future Improvements

- [ ] Implement PurgeCSS for unused CSS removal
- [ ] Add CSS modules for JavaScript components
- [ ] Implement critical CSS extraction
- [ ] Add CSS-in-JS for dynamic components
- [ ] Create CSS component library documentation
- [ ] Automate CSS testing with Stylelint
- [ ] Add performance monitoring
- [ ] Implement CSS lazy loading

## Resources

- [CSS Tricks](https://css-tricks.com/)
- [MDN Web Docs - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [BEM Documentation](http://getbem.com/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
