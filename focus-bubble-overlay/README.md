# Focus Bubble Overlay

A browser extension that creates a customizable “focus bubble” overlay, blocking distractions and showing calming animations during work sessions.

## Features
- Customizable overlay with opacity, animation, and session duration
- Calming animations: bubbles, gradient, waves
- Popup UI for easy control
- All settings stored locally

## Usage
1. Load the extension in your browser (Developer mode > Load unpacked)
2. Click the extension icon to open the popup
3. Set your preferences and click "Start Focus"
4. Overlay will appear on the current tab, blocking distractions

## Development
- `manifest.json`: Extension config
- `popup.html`: UI
- `popup.js`: UI logic
- `background.js`: Background tasks
- `content.js`: Overlay and animation logic
- `overlay.css`: Overlay styling

## TODO
- Add more animation types
- Allow whitelisting certain sites
- Add sound/vibration reminders
- Improve accessibility

## License
MIT
