# Performance Audit & Optimization Framework

## 🚀 Overview

This document outlines the comprehensive Performance Audit & Optimization framework implemented for the `dev-card-showcase` platform. This framework ensures scalability, prevents performance regression, and maintains fast load times as new features are added.

## 🎯 Optimization Strategies Implemented

### 1. Continuous Integration (CI) Checks
We have introduced automated performance checks that run on every Pull Request to prevent regressions.

- **Lighthouse CI** (`.github/workflows/lighthouse.yml`):
  - Automatically audits `index.html` and `projects.html` using Google Lighthouse.
  - Enforces minimum scores:
    - **Performance**: > 80
    - **Accessibility**: > 90
    - **SEO**: > 90
  - Fails the PR if scores drop below these thresholds.
  - Uses `lighthouserc.json` for configuration.

- **Bundle Size Monitoring** (`.github/workflows/bundle-size.yml`):
  - Tracks the size of critical JavaScript and CSS files using `size-limit`.
  - Configured in `package.json` to alert if:
    - `js/static-projects.js` exceeds **150 kB**
    - `js/projects.js` exceeds **30 kB**
    - `style.css` exceeds **120 kB**

### 2. Code Splitting (JS)
- **Strategy**: Extracted the massive static projects data from the main bundle.
- **Implementation**:
  - `static-projects.js` contains the large dataset of project cards.
  - `projects.js` dynamically imports this file only when needed (`import('./static-projects.js')`).
- **Benefit**: Reduces the initial JavaScript payload significantly, improving Time to Interactive (TTI).

### 3. Dependency Optimization
- **Action**: Performed a deep audit of `package.json` and removed unused dependencies.
- **Removed**:
  - `lucide-react` (Unused, valid usage is via CDN)
  - `express`, `socket.io`, `cors` (Unused backend dependencies)
  - `format` (Unused)
- **Benefit**: Cleaner project structure and faster installation times for contributors.

### 4. Asset Optimization
- **Images**: All images in `index.html` utilize `loading="lazy"` to defer loading until they are near the viewport.
- **Scripts**: Third-party scripts (e.g., FontAwesome, Lucide) are loaded via CDN with appropriate caching.

## 📊 How to Run Audits Locally

### 1. Bundle Size Check
To verify file sizes before committing:

```bash
cd dev-card-showcase
npm install
npm run size
```

### 2. Lighthouse Audit
You can run Lighthouse manually using Chrome DevTools or via the CLI if installed:

1. Serve the project locally (e.g., using Live Server or `python -m http.server`).
2. Open Chrome DevTools > Lighthouse.
3. Run a "Mobile" audit.

## 🔮 Future Roadmap (Advanced)

1. **Image Compression Pipeline**: Implement a pre-commit hook or CI step to automatically compress images (WebP).
2. **Critical CSS**: Extract critical CSS for above-the-fold content to improve First Contentful Paint (FCP).
3. **Service Worker**: Implement PWA features for offline caching and faster repeat visits.

