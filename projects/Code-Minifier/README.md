# 🗜️ Code Minifier

A powerful and user-friendly code minifier web application that supports JavaScript, CSS, HTML, and JSON. Features side-by-side comparison, syntax highlighting, size reduction statistics, and file download capabilities.

## ✨ Features

### 📝 Multi-Language Support
- **JavaScript**: Minify JS code with comment and whitespace removal
- **CSS**: Optimize stylesheets by removing unnecessary characters
- **HTML**: Compress HTML markup while preserving structure
- **JSON**: Minimize JSON files to reduce payload size

### 🔍 Side-by-Side Comparison
- **Dual Editor View**: Original and minified code displayed simultaneously
- **Visual Comparison**: Easily compare before and after results
- **Syntax Highlighting**: Beautiful color-coded syntax using Prism.js
- **Toggle Views**: Switch between plain text and syntax-highlighted views

### 📊 Size Reduction Analytics
- **Original Size**: Display file size before minification
- **Minified Size**: Show compressed file size
- **Reduction Percentage**: Calculate and display space savings
- **Real-time Stats**: Statistics update instantly as you type
- **Color-Coded Results**: Visual feedback based on compression efficiency

### 🎨 Syntax Highlighting
- **Powered by Prism.js**: Industry-standard syntax highlighting
- **Multiple Languages**: Support for JS, CSS, HTML, and JSON
- **Dark Theme**: Eye-friendly code display
- **Toggle Option**: Enable/disable highlighting on demand

### 💾 Download & Copy
- **Download Minified Files**: Save compressed code with proper file extensions
- **Copy to Clipboard**: One-click copy of minified results
- **Sample Code**: Load example code for each language
- **Clear Function**: Reset both editors quickly

### ⚙️ Customizable Options
- **Remove Comments**: Strip out code comments
- **Remove Whitespace**: Eliminate unnecessary spaces
- **Remove Newlines**: Compress code to single lines
- **Syntax Highlighting**: Toggle visual enhancements

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: 
  - CSS Grid and Flexbox for layout
  - CSS Variables for theming
  - Smooth animations and transitions
  - Responsive design with media queries
- **Vanilla JavaScript**: 
  - ES6+ features
  - Blob API for file downloads
  - Clipboard API for copy functionality
  - Custom minification algorithms
- **Prism.js**: Syntax highlighting library
- **Font Awesome**: Icons for enhanced UI

## 📁 Project Structure

```
Code-Minifier/
│
├── index.html          # Main HTML structure
├── style.css           # Styling and responsive design
├── script.js           # Minification logic and interactions
└── README.md          # Documentation
```

## 🚀 Getting Started

1. **Clone or Download** the project files
2. **Open** `index.html` in a modern web browser
3. **Start Minifying!** Select a language, enter code, and click minify

No build process or dependencies required! Works entirely in the browser.

## 💻 Usage

### Basic Minification
1. Select your code language (JavaScript, CSS, HTML, or JSON)
2. Paste or type your code in the left editor
3. Click the **Minify** button in the center
4. View the minified result in the right editor

### Using Options
- Toggle checkboxes in the options panel to customize minification
- **Remove Comments**: Strips all comments from code
- **Remove Whitespace**: Removes extra spaces and tabs
- **Remove Newlines**: Compresses code to fewer lines
- **Syntax Highlighting**: Shows color-coded preview

### Downloading Files
1. Minify your code
2. Click the **Download** icon (⬇️) in the minified code header
3. File downloads with appropriate extension (.js, .css, .html, .json)

### Copying Results
1. Minify your code
2. Click the **Copy** icon (📋) in the minified code header
3. Paste anywhere you need the minified code

### Loading Samples
- Click the **Import** icon (📥) to load example code
- Helpful for testing and learning how minification works

## 🔧 Minification Details

### JavaScript Minification
- Removes single-line (`//`) and multi-line (`/* */`) comments
- Eliminates unnecessary whitespace
- Compresses spaces around operators and punctuation
- Preserves string literals and functionality

### CSS Minification
- Removes CSS comments (`/* */`)
- Eliminates whitespace between selectors and properties
- Removes unnecessary semicolons
- Compresses media queries and rules

### HTML Minification
- Strips HTML comments (`<!-- -->`)
- Removes whitespace between tags
- Compresses inline styles and scripts
- Preserves document structure

### JSON Minification
- Validates JSON syntax
- Removes all whitespace and newlines
- Preserves data structure and values
- Uses native JSON.parse/stringify for accuracy

## 📊 Statistics Explained

### Original Size
The size of your input code in bytes, KB, or MB

### Minified Size
The size of the compressed code after minification

### Reduction Percentage
Calculated as: `((Original - Minified) / Original) × 100`

**Color Indicators:**
- 🟢 **Green** (>50%): Excellent compression
- 🟡 **Yellow** (25-50%): Good compression
- ⚪ **Gray** (<25%): Minimal compression

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + M**: Minify code
- **Ctrl/Cmd + K**: Clear all code
- **Ctrl/Cmd + C**: Copy result (when focused)

## 🎨 Customization

### Changing Colors
Edit the CSS variables in `style.css`:
```css
:root {
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --danger-color: #ef4444;
    --code-bg: #1e1e1e;
}
```

### Adding New Languages
1. Add language button in HTML
2. Create minification function in JavaScript
3. Add sample code to `sampleCode` object
4. Include Prism.js component for syntax highlighting

### Custom Minification Rules
Modify the minification functions in `script.js`:
- `minifyJavaScript()` - JavaScript logic
- `minifyCSS()` - CSS logic
- `minifyHTML()` - HTML logic
- `minifyJSON()` - JSON logic

## 🔒 Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Server Uploads**: Your code never leaves your computer
- **No Data Collection**: We don't store or track any code
- **Offline Capable**: Works without internet (after initial load)

## 📱 Responsive Design

Fully responsive layout that adapts to:
- **Desktop**: Full side-by-side layout (>1200px)
- **Tablet**: Stacked vertical layout (768px-1200px)
- **Mobile**: Optimized single-column view (<768px)

## 🔧 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Opera (latest)

Requires modern browser with support for:
- ES6+ JavaScript
- CSS Grid & Flexbox
- Blob API
- Clipboard API

## ⚠️ Limitations

- **Variable Renaming**: This minifier doesn't rename variables (basic minification only)
- **Advanced Optimization**: For production builds, consider tools like:
  - UglifyJS or Terser for JavaScript
  - cssnano for CSS
  - html-minifier for HTML
- **Large Files**: Performance may vary with very large files (>1MB)

## 💡 Use Cases

1. **Web Development**: Reduce file sizes before deployment
2. **Learning**: Understand minification concepts visually
3. **Quick Testing**: Test minified code compatibility
4. **Code Sharing**: Create compact code snippets
5. **Performance**: Optimize assets for faster loading

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Add new language support
- Improve minification algorithms
- Enhance UI/UX

## 📚 Resources

- [Prism.js Documentation](https://prismjs.com/)
- [MDN Web Docs - Minification](https://developer.mozilla.org/en-US/docs/Glossary/Minification)
- [Google Web Fundamentals - Optimize CSS](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/optimize-encoding-and-transfer)

## 📄 License

This project is open source and available for educational and commercial use.

## 🙏 Acknowledgments

- Prism.js for syntax highlighting
- Font Awesome for icons
- The web development community for best practices

---

**Made with ❤️ for developers who care about performance**

**Happy Minifying! 🚀**
