# 🔄 Unit Converter

A comprehensive and user-friendly unit converter web application that allows you to convert between multiple measurement systems with real-time conversion, swap functionality, conversion history, and clipboard integration.

## ✨ Features

### 📏 Multiple Categories
- **Length**: Meter, Kilometer, Centimeter, Millimeter, Mile, Yard, Foot, Inch, Nautical Mile
- **Weight**: Kilogram, Gram, Milligram, Metric Ton, Pound, Ounce, Stone, US Ton
- **Temperature**: Celsius, Fahrenheit, Kelvin (with special conversion logic)
- **Volume**: Liter, Milliliter, Cubic Meter, Gallon, Quart, Pint, Cup, Fluid Ounce, Tablespoon, Teaspoon
- **Time**: Second, Millisecond, Microsecond, Nanosecond, Minute, Hour, Day, Week, Month, Year

### 🚀 Core Functionality
- ⚡ **Real-time Conversion**: Instant conversion as you type
- 🔄 **Swap Direction**: Quickly swap between units with animated button
- 📋 **Copy to Clipboard**: One-click copy of conversion results
- 🧮 **Formula Display**: Shows the conversion formula and relationship
- 📊 **Smart Formatting**: Automatic number formatting with scientific notation for very small values
- 🎯 **High Precision**: Accurate conversions with up to 6 decimal places

### 📜 Conversion History
- 💾 **Persistent History**: Saves up to 50 recent conversions in local storage
- 🕐 **Timestamps**: Each conversion is timestamped
- 🔄 **Reload Conversions**: Click any history item to reload that conversion
- 📋 **Copy from History**: Copy any historical conversion
- 🗑️ **Delete Items**: Remove individual items or clear entire history
- 🔍 **Category Indicators**: Visual indication of conversion category

### 💡 User Experience
- 🎨 **Modern Design**: Beautiful gradient background with smooth animations
- 📱 **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- ⌨️ **Keyboard Shortcuts**:
  - `Ctrl/Cmd + K`: Clear inputs
  - `Ctrl/Cmd + S`: Swap units
  - `Ctrl/Cmd + C`: Copy result (when focused on result field)
- 🔔 **Toast Notifications**: Visual feedback for actions
- ♿ **Accessible**: Proper labels and ARIA attributes

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: 
  - CSS Grid and Flexbox for layout
  - CSS Variables for theming
  - Custom animations and transitions
  - Gradient backgrounds
  - Responsive design with media queries
- **Vanilla JavaScript**: 
  - ES6+ features
  - LocalStorage API for history persistence
  - Clipboard API for copy functionality
  - Event delegation
  - State management
- **Font Awesome**: Icons for visual enhancement

## 📁 Project Structure

```
Unit-Converter/
│
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Application logic and conversions
└── README.md          # Documentation
```

## 🚀 Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Start Converting!** Select a category, enter a value, and see instant results

No build process or dependencies required!

## 💻 Usage

### Basic Conversion
1. Select a category (Length, Weight, Temperature, Volume, or Time)
2. Enter a value in the "From" field
3. Select your source and target units
4. See the result instantly in the "To" field

### Swap Units
- Click the circular swap button (🔄) to instantly swap source and target units

### Copy Result
- Click the "Copy Result" button to copy the converted value to your clipboard

### View History
- Scroll down to see your conversion history
- Click the reload icon (🔄) to load a previous conversion
- Click the copy icon (📋) to copy a historical conversion
- Click the trash icon (🗑️) to delete an item

### Clear History
- Click "Clear All" button in the history section to remove all history items

## 🔢 Conversion Logic

### Standard Units (Length, Weight, Volume, Time)
All units are converted relative to a base unit:
1. Convert input value to base unit
2. Convert base unit to target unit

Example: Mile to Kilometer
```
Miles → Meters (base) → Kilometers
5 miles × 1609.34 = 8046.7 meters
8046.7 meters × 0.001 = 8.0467 kilometers
```

### Temperature
Special conversion formulas:
- **Celsius to Fahrenheit**: (C × 9/5) + 32
- **Celsius to Kelvin**: C + 273.15
- **Fahrenheit to Celsius**: (F - 32) × 5/9
- **Kelvin to Celsius**: K - 273.15

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-color: #6366f1;
    --primary-dark: #4f46e5;
    --secondary-color: #8b5cf6;
    --success-color: #10b981;
    --danger-color: #ef4444;
}
```

### Adding New Units
1. Open `script.js`
2. Find the `units` object
3. Add your unit to the appropriate category:
```javascript
myUnit: { 
    name: 'My Unit', 
    symbol: 'mu', 
    factor: 1.234 // conversion factor to base unit
}
```

### Adding New Categories
1. Add category to `units` object with base unit and conversion factors
2. Add a new tab button in `index.html`
3. Add corresponding icon from Font Awesome

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (full layout)
- **Tablet**: 481px - 768px (stacked converter)
- **Mobile**: < 480px (full stack layout)

## 🔧 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

Requires modern browser with support for:
- ES6+ JavaScript
- CSS Grid & Flexbox
- LocalStorage API
- Clipboard API

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available for educational and commercial use.

## 🙏 Acknowledgments

- Font Awesome for the beautiful icons
- CSS Gradient inspiration from various design systems
- Conversion factors verified against scientific standards

## 📞 Support

If you encounter any issues or have questions:
1. Check the formula display for conversion relationships
2. Verify your input values are valid numbers
3. Try clearing your browser cache and localStorage
4. Check browser console for any errors

---

**Made with ❤️ for the developer community**

**Happy Converting! 🎉**
