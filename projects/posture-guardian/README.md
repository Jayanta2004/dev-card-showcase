# Posture Guardian

A browser extension that uses webcam AI to monitor posture and gently reminds users to sit upright or stretch.

## Features
- Real-time posture monitoring using webcam
- AI-based posture detection (expandable with TensorFlow.js or MediaPipe)
- Gentle reminders via notifications
- Privacy-focused: all processing is local

## Usage
1. Load the extension in your browser (Developer mode > Load unpacked)
2. Click the extension icon to open the popup
3. Click "Start Monitoring" to begin posture detection
4. Receive reminders if bad posture is detected

## Development
- `manifest.json`: Extension config
- `popup.html`: UI
- `popup.js`: UI logic
- `background.js`: Notifications
- `posture.js`: AI posture detection
- `style.css`: Styling

## TODO
- Integrate TensorFlow.js or MediaPipe for real pose detection
- Add settings for sensitivity and reminder frequency
- Improve UI/UX
- Add sound/vibration reminders

## License
MIT
