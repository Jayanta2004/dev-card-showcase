# Dev Card Showcase Design System

This repository follows a strict Design System to maintain visual consistency across all 1000+ tracker tools and projects. 

When contributing a new UI component or tracker tool, **do not use hardcoded hex colors or arbitrary RGB values** for your styles. Instead, use the CSS custom properties (variables) defined in the root `style.css`. 

By strictly adhering to these variables, your tool will automatically support both Dark Mode (default) and Light Mode.

## Core Variables

### Backgrounds
- `var(--bg-primary)`: The main page background. Use for `body` or main wrapper.
- `var(--bg-card)` / `var(--bg-secondary)`: Background color for cards, sections, modals.
- `var(--bg-navbar)`: Transparent overlay backgrounds for headers.

### Text
- `var(--text-primary)`: Used for primary text, headings, body.
- `var(--text-secondary)`: Used for subtitles, labels, secondary information.
- `var(--text-accent)`: Used for active text states.

### Borders
- `var(--border-primary)`: Standard thin borders.
- `var(--border-secondary)`: Muted / subtle borders.

### Accents
- `var(--primary-color)`: Main brand color. Used for buttons, active links, highlights.
- `var(--success-color)`: Used for positive indicators (e.g. "Completed", "Perfect").

## Utility Variables

### Shadows and Effects
- `var(--shadow-sm)`: Small shadow depth.
- `var(--shadow-md)`: Standard card shadow depth.
- `var(--shadow-lg)`: Large shadow depth (hover states).
- `var(--shadow-glow)`: Used for active / focal input glow effects.
- `var(--glass-bg)`: Glassmorphic transparent backgrounds.
- `var(--glass-border)`: Glassmorphic borders.

### Gradients
- `var(--gradient-primary)`: The standard primary sweeping gradient.
- `var(--gradient-button)`: The gradient applied to main CTAs.

## Example Refactoring

### BAD (Hardcoded Colors):
```css
.card {
    background: #1e293b;
    color: #ffffff;
    border: 1px solid #38bdf8;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.btn {
    background-color: #38bdf8;
}
```

### GOOD (Using Design System Variables):
```css
.card {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-primary);
    box-shadow: var(--shadow-sm);
}
.btn {
    background-color: var(--primary-color);
}
```

By conforming to these standards, you ensure that the `dev-card-showcase` repository feels unified and dynamically responds to the site's theme selection.
