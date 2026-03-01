# IsoCity Builders

A grid-based city building simulator with an isometric perspective, built using only **HTML, CSS, and Vanilla JavaScript**. All 3D effects are achieved using CSS 3D transforms.

## Features
- **Isometric Perspective**: 2D grid transformed into 3D space using `rotateX` and `rotateZ`.
- **Building System**: Construct residential and commercial zones.
- **3D Buildings**: Structures composed of multiple divs (base, walls, roof) with `preserve-3d`.
- **Traffic Simulation**: Tiny cars navigate road networks using A* pathfinding.
- **Day/Night Cycle**: Dynamic lighting system with glowing windows at night.
- **Resource Management**: Manage money, population, and tax income.

## Controls
- **1**: Select Road Tool
- **2**: Select Residential Zone
- **3**: Select Commercial Zone
- **B**: Select Bulldozer
- **Mouse Click**: Place/Interact with tiles
- **Shift + Click**: Quick Bulldoze

## Technical Implementation
- **Visuals**: CSS `transform-style: preserve-3d` used for all buildings.
- **Performance**: DOM-based car pooling and efficient grid lookups.
- **Pathfinding**: BFS-based route calculation for traffic flow.

## Requirements
- Pure HTML/CSS/JS
- No WebGL, Three.js, or external frameworks.
- Modern browser (Chrome/Edge/Safari/Firefox).
