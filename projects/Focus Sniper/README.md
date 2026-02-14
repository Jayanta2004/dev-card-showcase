# 🎯 Focus Sniper - Distraction Interference Shooter

An intense, psychology-driven browser game that challenges your ability to maintain focus while surrounded by digital distractions. Hit targets with precision as fake UI elements, notifications, and popups try to break your concentration!

## 🎮 Game Concept

While aiming at moving targets, you'll face:
- **Fake Notifications** - System alerts and messages
- **Popup Windows** - Intrusive dialogs and forms
- **Cookie Consent Banners** - Realistic cookie popups
- **Fake Advertisements** - Annoying clickbait ads
- **System Alerts** - Warning and error messages
- **Loading Bars** - Fake progress indicators
- **Screen Effects** - Glitches, inversions, and distortions
- **Fake Cursors** - Duplicate mouse pointers

If your cursor leaves targets for too long, your accuracy and focus decrease. The game simulates real attention interference under distraction!

## ✨ Features

### Core Gameplay
- **Dynamic Target System** - Normal, bonus, and danger targets
- **Real-time Focus Meter** - Tracks your concentration level
- **Accuracy Decay Curve** - Performance decreases with lost focus
- **Focus Recovery System** - Regain concentration by staying on target
- **Combo Multipliers** - Chain hits for massive score bonuses
- **Mouse Deviation Tracking** - Simulates eye-tracking mechanics

### Distraction System
- **10+ Distraction Types** - Each with unique interactions
- **Adjustable Density Slider** - Control chaos levels (1-10)
- **Progressive Difficulty** - Distractions intensify over time
- **Realistic UI Elements** - Professional-looking fake interfaces
- **Interactive Distractions** - Click handlers and animations

### Game Modes
- **Normal Mode** - Balanced challenge
- **Zen Focus** - Reduced distraction intensity
- **Chaos Mode** - Maximum distraction mayhem
- **Nightmare Mode** - Extreme difficulty for experts

### Difficulty Levels
- **Easy** - Fewer targets, slower spawns, higher focus recovery
- **Normal** - Standard balanced gameplay
- **Hard** - More targets, faster spawns, rapid focus loss

### Statistics & Achievements
- **Comprehensive Stats Tracking**
  - Score and accuracy
  - Targets hit/missed
  - Maximum combo
  - Average focus percentage
  - Distractions resisted
  - Session duration
  
- **Achievement System**
  - Sharpshooter (90%+ accuracy)
  - Laser Focus (80%+ average focus)
  - Combo Master (10+ combo)
  - Zen Master (20+ distractions resisted)
  - On Fire, Unstoppable, Legendary, Godlike (combo milestones)

- **Ranking System** - S+, S, A+, A, B+, B, C+, C, D, F grades
- **High Score Storage** - Local storage persistence

### Visual Effects
- **Particle System** - Explosions, trails, confetti
- **Screen Effects** - Shake, glitch, flash, distortion
- **Hit Markers** - Critical hits and damage indicators
- **Laser Beams** - Shooting visual feedback
- **Energy Rings** - Focus and impact effects
- **Combo Notifications** - Animated combo popups
- **Scan Lines** - Retro CRT effect

### Audio System
- **Procedural Sound Effects** - Generated using Web Audio API
- **Hit/Miss Sounds** - Satisfying audio feedback
- **Combo Sounds** - Escalating combo effects
- **Critical Hit Audio** - Special critical sound
- **Warning Tones** - Low focus alerts
- **Achievement Fanfare** - Victory sounds
- **UI Click Sounds** - Button feedback

### Accessibility
- **Keyboard Controls**
  - ESC - Pause/Resume
  - SPACE - Shoot (when on target)
  - CTRL+H - Show keyboard help
  - TAB - Navigate menus
- **Focus Indicators** - Keyboard navigation highlights
- **Screen Reader Friendly** - Semantic HTML
- **Customizable Settings** - Toggle effects

## 🚀 How to Play

### Starting the Game
1. Open `index.html` in a modern web browser
2. Select your difficulty (Easy, Normal, or Hard)
3. Click "START GAME"
4. Focus and shoot!

### Controls
- **Mouse** - Aim at targets
- **Click** - Shoot
- **ESC** - Pause game
- **SPACE** - Alternative shoot button

### Objective
- Hit as many targets as possible in 60 seconds
- Maintain high accuracy by staying focused
- Avoid clicking on distractions
- Build combos for score multipliers
- Keep your focus meter above 30%

### Scoring
- **Normal Target**: 10 points
- **Bonus Target**: 50 points (appears cyan)
- **Danger Target**: -50 points (appears red)
- **Critical Hit**: 2x points (hit center)
- **Combo Multiplier**: +10% per combo level

### Tips
1. Stay on targets to maintain focus
2. Ignore all distractions - they're fake!
3. Closing/dismissing distractions gives small focus boost
4. Clicking distractions causes major focus loss
5. Build combos early for maximum score
6. Watch out for red danger targets

## 🛠️ Technical Details

### Technology Stack
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No frameworks or libraries
- **Web Audio API** - Procedural sound generation
- **Local Storage API** - Save data persistence

### File Structure
```
Focus Sniper/
├── index.html              # Main HTML structure
├── style.css              # Core styles and layout
├── distractions.css       # Distraction element styles
├── animations.css         # Animation keyframes
├── utils.js              # Utility functions
├── audio.js              # Audio system
├── particles.js          # Visual effects system
├── distractions.js       # Distraction manager
├── targets.js            # Target spawning system
├── stats.js              # Statistics tracking
├── ui.js                 # UI management
├── game.js               # Core game loop
├── main.js               # App initialization
└── README.md            # Documentation
```

### Browser Compatibility
- **Chrome/Edge** - Full support ✅
- **Firefox** - Full support ✅
- **Safari** - Full support ✅
- **Opera** - Full support ✅

**Requirements:**
- Modern browser with ES6+ support
- Web Audio API support
- Local Storage enabled

## 🎨 Customization

### Adjusting Difficulty
Modify difficulty settings in `game.js`:
```javascript
difficultySettings: {
    easy: {
        targetSpawnRate: 3000,
        maxTargets: 3,
        distractionDensity: 3
    }
    // ... more settings
}
```

### Adding New Distractions
Add new distraction types in `distractions.js`:
```javascript
spawnDistraction(type) {
    switch(type) {
        case 'your-new-distraction':
            return this.createYourDistraction();
    }
}
```

### Modifying Visual Effects
Customize particle effects in `particles.js` and animations in `animations.css`.

## 🐛 Debug Mode

Open browser console and type:
```javascript
FocusSniperDebug.enableDebug()  // Enable debug mode
FocusSniperDebug.getStats()     // View current stats
FocusSniperDebug.addScore(1000) // Add score (testing)
FocusSniperDebug.addTime(30)    // Add time (testing)
FocusSniperDebug.spawnTarget()  // Spawn target manually
```

## 📊 Performance

The game is optimized for smooth 60 FPS gameplay:
- Efficient particle management (max 500 particles)
- Request animation frame for game loop
- Throttled distraction spawning
- Minimal DOM manipulation
- CSS transforms for animations

## 🎯 Game Design Philosophy

**Focus Sniper** combines:
1. **Psychology** - Real distraction interference research
2. **Game Design** - Engaging mechanics and progression
3. **UX Critique** - Commentary on modern web annoyances
4. **Skill Development** - Improves focus and attention control

The game serves as both entertainment and a tool for understanding how digital distractions affect concentration in real-world scenarios.

## 🔧 Development

### Local Development
No build process required! Simply:
1. Clone or download the project
2. Open `index.html` in a browser
3. Edit files and refresh to see changes

### Adding Features
The modular architecture makes it easy to extend:
- New distractions → `distractions.js`
- New visual effects → `particles.js` + `animations.css`
- New game modes → `game.js`
- New achievements → `stats.js`

## 📝 License

This project is open source and available for educational purposes.

## 🙏 Credits

**Creator**: AI-Assisted Development
**Concept**: Focus + Distraction Psychology
**Sound**: Web Audio API (Procedural)
**Graphics**: Pure CSS & DOM Manipulation

## 🎮 Future Enhancements

Potential additions:
- [ ] Leaderboard system
- [ ] Daily challenges
- [ ] Custom target skins
- [ ] More game modes
- [ ] Mobile touch support
- [ ] Multiplayer mode
- [ ] Power-ups and abilities
- [ ] Level progression system
- [ ] Custom difficulty editor

---

**Have fun and stay focused!** 🎯✨

For issues or suggestions, feel free to contribute or provide feedback!
