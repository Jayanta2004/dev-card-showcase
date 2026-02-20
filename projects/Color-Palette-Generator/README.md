# 🎨 Color Palette Generator

A powerful and intuitive color palette generator with 6 generation modes based on color theory, multiple format support, color locking, export capabilities, and WCAG accessibility contrast checking.

## ✨ Features

### 🎯 6 Generation Modes
1. **Random**: Generate completely random color palettes
2. **Monochromatic**: Variations of a single hue with different lightness
3. **Complementary**: Colors opposite each other on the color wheel
4. **Triadic**: Three colors evenly spaced on the color wheel
5. **Analogous**: Colors adjacent to each other on the color wheel
6. **Split-Complementary**: Base color plus two colors adjacent to its complement

### 🌈 Multiple Color Formats
- **HEX**: #FF5733 (web standard)
- **RGB**: rgb(255, 87, 51)
- **HSL**: hsl(9, 100%, 60%)
- Switch between formats with one click
- All formats displayed for each color

### 🔒 Lock Individual Colors
- Lock any color to preserve it during regeneration
- Useful for finding colors that complement specific brand colors
- Visual lock indicator on each color card
- Generate new palettes while keeping locked colors fixed

### 📤 Export Capabilities
- **CSS Variables**: Export as CSS custom properties
- **Tailwind Config**: Export as Tailwind theme colors
- **JSON**: Export palette data with all formats
- **Copy All**: Copy all colors at once
- Download exported files directly

### ♿ Accessibility Contrast Checker
- **WCAG Compliance**: Check contrast ratios between all color pairs
- **AA & AAA Standards**: Visual pass/fail indicators
- **Contrast Ratios**: Precise numerical values (e.g., 4.51:1)
- **Automatic Calculation**: Updates with every new palette
- Helps ensure readable text and accessible designs

### 🎨 Additional Features
- Generate 5 colors per palette
- One-click copy for individual colors
- Keyboard shortcuts (Spacebar to generate)
- Responsive design for all devices
- Beautiful gradient UI with smooth animations
- Toast notifications for user feedback

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: 
  - CSS Grid and Flexbox for layout
  - CSS Variables for theming
  - Advanced animations and transitions
  - Responsive design with media queries
- **Vanilla JavaScript**: 
  - ES6+ features
  - Color space conversions (HEX ↔ RGB ↔ HSL)
  - Color theory algorithms
  - WCAG contrast calculation
  - Blob API for file downloads
  - Clipboard API
- **Font Awesome**: Icons for enhanced UI

## 📁 Project Structure

```
Color-Palette-Generator/
│
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Color generation and logic
└── README.md          # Documentation
```

## 🚀 Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Start Creating!** Select a mode and generate palettes

No build process or dependencies required!

## 💻 Usage

### Generating Palettes
1. Select a generation mode from the dropdown
2. Click **Generate Palette** or press **Spacebar**
3. View your new color palette with all format options

### Locking Colors
1. Click the **lock icon** on any color card
2. Generate new palettes - locked colors stay the same
3. Click again to unlock

### Copying Colors
- Click the **copy icon** on individual colors
- Use **Copy All Colors** button to copy entire palette
- Format automatically matches your selected format (HEX/RGB/HSL)

### Checking Accessibility
- Scroll to the **Accessibility Contrast Check** section
- View contrast ratios between all color pairs
- Check AA and AAA compliance badges
- Ensure your palette meets WCAG standards

### Exporting Palettes

#### CSS Variables
```css
:root {
  --color-1: #FF5733;
  --color-2: #33FF57;
  --color-3: #3357FF;
  --color-4: #F333FF;
  --color-5: #FFD700;
}
```

#### Tailwind Config
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        "color-1": "#FF5733",
        "color-2": "#33FF57",
        "color-3": "#3357FF",
        "color-4": "#F333FF",
        "color-5": "#FFD700"
      }
    }
  }
}
```

#### JSON
```json
{
  "palette": [
    {
      "name": "color-1",
      "hex": "#FF5733",
      "rgb": "rgb(255, 87, 51)",
      "hsl": "hsl(9, 100%, 60%)"
    }
  ],
  "mode": "triadic"
}
```

## 🎨 Color Theory Explained

### Monochromatic
Uses variations of a single hue by changing lightness and saturation. Creates harmonious, cohesive palettes perfect for minimalist designs.

### Complementary
Uses colors opposite on the color wheel (180° apart). Creates high contrast and vibrant palettes ideal for call-to-action elements.

### Triadic
Uses three colors evenly spaced on the color wheel (120° apart). Creates balanced, colorful palettes with good contrast.

### Analogous
Uses colors adjacent on the color wheel (within 30° of each other). Creates harmonious, serene palettes often found in nature.

### Split-Complementary
Uses a base color plus two colors adjacent to its complement. Offers strong contrast while being easier on the eyes than pure complementary.

### Random
Generates completely random colors. Great for unexpected combinations and creative exploration.

## ♿ Accessibility Standards

### WCAG Contrast Ratios
- **AA Normal Text**: 4.5:1 minimum
- **AA Large Text**: 3:1 minimum
- **AAA Normal Text**: 7:1 minimum
- **AAA Large Text**: 4.5:1 minimum

The tool checks all color pairs and displays:
- Precise contrast ratio (e.g., 4.51:1)
- AA compliance badge
- AAA compliance badge

## ⌨️ Keyboard Shortcuts

- **Spacebar**: Generate new palette
- **Escape**: Close export modal

## 🎨 Customization

### Change Number of Colors
Edit in `script.js`:
```javascript
let state = {
    // ...
    numColors: 5  // Change to 3, 4, 6, etc.
};
```

### Add New Generation Mode
1. Add option to HTML select
2. Create generation function in `colorGenerators` object
3. Implement color theory algorithm

### Custom Theme Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary-color: #8b5cf6;
    --secondary-color: #ec4899;
    --success-color: #10b981;
}
```

## 🔧 Color Conversion Details

### HEX to RGB
Converts hexadecimal color codes to RGB values:
```javascript
#FF5733 → rgb(255, 87, 51)
```

### RGB to HSL
Converts RGB to Hue, Saturation, Lightness:
```javascript
rgb(255, 87, 51) → hsl(9, 100%, 60%)
```

### HSL to RGB
Converts HSL back to RGB for rendering:
```javascript
hsl(9, 100%, 60%) → rgb(255, 87, 51)
```

## 📊 Contrast Calculation

Uses WCAG 2.1 formula:
```
Relative Luminance = 0.2126 × R + 0.7152 × G + 0.0722 × B
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)
```
Where L1 is lighter and L2 is darker luminance.

## 🔒 Privacy & Security

- **100% Client-Side**: All processing in browser
- **No Data Collection**: Colors never sent to servers
- **No Tracking**: Complete privacy
- **Offline Capable**: Works without internet

## 📱 Responsive Design

Fully responsive layout:
- **Desktop**: Full feature display (>768px)
- **Tablet**: Optimized layout (481px-768px)
- **Mobile**: Single-column view (<480px)

## 🔧 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

Requires:
- ES6+ JavaScript
- CSS Grid & Flexbox
- Blob API
- Clipboard API

## 💡 Use Cases

1. **Web Design**: Generate color schemes for websites
2. **Branding**: Create brand color palettes
3. **UI/UX**: Design accessible interfaces
4. **Graphic Design**: Find complementary colors
5. **App Development**: Export to Tailwind or CSS
6. **Learning**: Understand color theory principles

## 🎓 Color Theory Resources

- [Color Theory Basics](https://www.colormatters.com/color-and-design/basic-color-theory)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Color Wheel Harmonies](https://www.sessions.edu/color-calculator/)

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest new generation modes
- Add export formats
- Improve algorithms
- Enhance UI/UX

## 📄 License

This project is open source and available for educational and commercial use.

## 🙏 Acknowledgments

- Color theory principles from traditional art
- WCAG accessibility guidelines
- Font Awesome for icons
- Web development community

---

**Made with ❤️ for designers and developers**

**Happy Color Generating! 🎨**
