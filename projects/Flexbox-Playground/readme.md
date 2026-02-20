
# Flexbox Playground

>A small interactive demo for learning and experimenting with CSS Flexbox properties.

**Overview**
- Live editor to tweak container and item-level flex properties and see results immediately.
- Adjustable properties include `flex-direction`, `justify-content`, `align-items`, `flex-wrap`, `align-content`, `order`, and `align-self`.
- Change the number of boxes and individual box width to observe layout changes.

**How to use**
1. Open [projects/Flexbox-Playground/index.html](projects/Flexbox-Playground/index.html) in your browser.
2. Use the left-side controls to modify container and box settings.
3. Click a box to select it and change its `order` / `align-self` values.
4. Use the `Reset` buttons to restore defaults.

**Notes**
- The demo uses Vue for reactivity (no build step required; CDN can be included in HTML).
- For best results, test in modern browsers that fully support Flexbox.
- Serving the folder with a simple static server is recommended for local development.

**Quick local server**

	- `npx http-server .`
	- `python -m http.server 8000`

**License**
- See repository root for licensing information.

