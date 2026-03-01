# 🪐 Orbit-Dash — One-Button Physics Game

## Closes #0000

---

## 📋 Description

This PR adds **Orbit-Dash**, a minimalist, one-button arcade game built entirely with Vanilla HTML5, CSS3, and ES6+ JavaScript. No external libraries or frameworks.

The player controls a tiny ship perpetually caught in the gravitational orbit of a planet. A single button press (Spacebar or tap) breaks the orbit, shooting the ship in the tangential direction. The goal is to time the release perfectly to get captured by the next planet's gravitational field.

---

<img width="1883" height="979" alt="Image" src="https://github.com/user-attachments/assets/a4cbf05a-65b3-4f4a-8e71-acada33c23b3" />

<img width="1919" height="1005" alt="Image" src="https://github.com/user-attachments/assets/31126615-f746-455e-8cc3-1687e7d00c3c" />

<img width="1915" height="1024" alt="Image" src="https://github.com/user-attachments/assets/4bb99bc6-c388-45a5-9f76-e43d5d9f598c" />


## ✨ Features Implemented

- **Custom Trigonometry Engine** — `Math.cos`/`Math.sin` compute real-time circular orbital position each frame.
- **2-State Physics Machine** — `ORBITING` (rotational) ↔ `DASHING` (linear) states transition seamlessly on input.
- **Procedural Planet Generation** — Planets are placed in world-space at random positions ahead, ensuring endless replayability.
- **Smooth Camera System** — A `lerp`-based camera smoothly follows the orbit center (when orbiting) or the ship (when dashing).
- **Trail Renderer** — A fading cyan trail is rendered from the ship's position history for satisfying visual feedback.
- **Parallax Star Field** — 180 stars with individual parallax factors create depth perception.
- **Glassmorphism HUD** — Score and Best score displayed with a frosted-glass overlay.
- **Responsive & Touch-Ready** — Scales to any viewport; works with pointer events for mobile.
- **Cyberpunk/Space Theme** — Neon glowing planets, radial gradient bodies, dashed orbit rings, pulsing glow effects.

---

## 🗂️ File Structure

```
projects/Orbit-Dash/
├── index.html       # Game shell, HUD overlay, canvas element
├── style.css        # CSS reset, variables, layout, glassmorphism HUD
├── script.js        # Full game engine: planets, ship, trail, camera, loop
├── project.json     # Metadata for the showcase
└── pr.md            # This file
```

---

## 🛠️ Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Markup   | HTML5 Canvas API                    |
| Styles   | CSS3 Custom Properties, Flexbox     |
| Logic    | Vanilla ES6+ JavaScript             |
| Math     | Trigonometry (`sin`, `cos`, `atan2`)|
| Render   | `requestAnimationFrame` @ 60 FPS    |

---

## 🎮 Controls

| Input        | Action              |
|--------------|---------------------|
| `Spacebar`   | Break orbit / Dash  |
| `Click/Tap`  | Break orbit / Dash  |

---

## 📸 How to Test

1. Open `projects/Orbit-Dash/index.html` directly in any modern browser.
2. Click **LAUNCH** on the start screen.
3. Watch the ship orbit the first planet.
4. Press `Space` or tap to break orbit and dash toward the next planet.
5. Time it so you enter the next planet's orbit ring.
6. Each successful capture increments your score.
7. Missing all planets ends the run.

---

## ✅ Checklist

- [x] Vanilla HTML5, CSS3, ES6+ only — zero dependencies
- [x] `index.html` links `style.css` and `script.js` correctly
- [x] Google Fonts loaded (`Orbitron`, `Space Grotesk`)
- [x] CSS Custom Properties used for all theming
- [x] Responsive layout (works on mobile and desktop)
- [x] `project.json` metadata block included
- [x] Code is clean, heavily commented, uses modern DOM APIs
- [x] Canvas game loop runs at 60 FPS via `requestAnimationFrame`
- [x] Touch events handled for mobile play
- [x] High score persisted in `localStorage`
