# Mood Room Generator

## Overview
A "Spotify for Moods" visual generator. Select a mood (Calm, Focus, Sad, Happy, Chaos) and watch your room transform with live animations, lighting, and particles.

## Features
- **Dynamic Themes:** 5 distinct moods with unique color palettes and lighting.
- **Particle Engine:** Custom particle systems for rain, confetti, orbs, and glitches.
- **3D Room Effect:** CSS-based 3D perspective without WebGL overhead.
- **Modular Architecture:** built with vanilla ES6 modules.

## Tech Stack
- HTML5
- CSS3 (Variables, Flexbox, Grid, 3D Transforms)
- Vanilla JavaScript (ES6 Modules)

## Project Structure
- `js/core`: System logic (EventBus, StateManager).
- `js/engine`: Visual engines (Scene, Particles).
- `js/moods`: Configuration files for each mood.
- `js/particles`: Specific particle behaviors.
- `css/`: Modular styles.
