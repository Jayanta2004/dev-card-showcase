# Interactive Code Playground

A powerful, feature-rich code editor and playground where users can write, test, and share code snippets directly in the browser.

## Features

### 🎯 Core Features
- **Multi-Language Support**: JavaScript, Python, HTML/CSS, Java, C++, TypeScript, CSS, SQL
- **Live Code Editor**: Monaco Editor integration with syntax highlighting
- **Output Console**: Display console logs, errors, and execution results in real-time
- **Live Preview**: Real-time HTML/CSS/JS preview in split-pane view
- **Code Templates**: Pre-built starter templates for common tasks

### 💾 Save & Share
- **Generate Shareable Links**: Create shareable links with URL parameters
- **Download Code**: Export code as files with appropriate extensions
- **Code History**: LocalStorage-based history of recent snippets (up to 10)

### 🎨 Customization
- **Theme Selector**: Light/Dark/High Contrast/Monokai themes
- **Code Formatting**: Auto-format code with Prettier integration
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 📝 Advanced Features
- **Multiple Tabs**: Support multiple files/tabs in single playground
- **Run Button**: Execute code and show output with proper error handling
- **Keyboard Shortcuts**: 
  - `Ctrl+Enter` - Run Code
  - `Ctrl+S` - Save to History
  - `Ctrl+Shift+F` - Format Code
  - `Ctrl+/` - Toggle Comment
- **Line/Character Count**: Real-time editor statistics
- **Copy to Clipboard**: One-click code copying

## Available Templates

1. **Hello World** - Basic console output
2. **Console Output** - Different data type logging
3. **Todo App** - Basic task management example
4. **Calculator** - Simple arithmetic operations
5. **Timer** - Countdown timer with intervals
6. **Weather UI** - HTML/CSS UI example
7. **Form Validation** - Email and password validation

## How to Use

### Getting Started
1. Open `interactive-playground.html` in your browser
2. Choose your language from the dropdown
3. Select a template or write your own code
4. Click "Run Code" or press `Ctrl+Enter` to execute

### Saving & Sharing
1. Click "Share" to generate a shareable link
2. Copy the link to share with others
3. Click "Download" to save your code as a file

### Managing Code
- Use tabs to work with multiple files
- View code history in the sidebar
- Clear history when needed
- Switch between Console and Preview outputs

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technical Stack

- **HTML5** - Structure and semantic markup
- **CSS3** - Responsive styling with CSS Grid/Flexbox
- **JavaScript (ES6+)** - Core functionality
- **Monaco Editor** - Professional code editor (VS Code engine)
- **Prettier** - Code formatting
- **LocalStorage** - Data persistence

## How It Works

### Code Execution
- **JavaScript**: Executed directly using `eval()` with console interception
- **HTML/CSS**: Rendered in an iframe sandbox
- **Python/Other**: Provides informational message about backend requirements

### Console Output
The console captures and displays:
- `console.log()` - Standard output
- `console.error()` - Errors (red)
- `console.warn()` - Warnings (yellow)
- `console.info()` - Info messages (blue)

### Syntax Highlighting
Monaco Editor provides:
- Real-time syntax highlighting
- Code suggestions and autocomplete
- Error underlining
- Bracket matching
- Code folding

### Theme System
Choose from multiple themes:
- **Light** - Clean light theme
- **Dark** (default) - Comfortable dark theme
- **High Contrast** - Accessibility-focused
- **Monokai** - Popular dark theme

## localStorage Features

- **History Storage**: Recent code snippets saved locally
- **Persistent Session**: Your code remains if you refresh
- **Auto-Save**: Changes are automatically tracked

## API & URL Parameters

### Share via URL
```
/interactive-playground.html?code=[base64-encoded-code]
```

The code is base64-encoded to handle special characters and preserve formatting.

## Future Enhancements

- Real-time collaboration (WebSocket support)
- More language support (Go, Rust, etc.)
- Code snippet library
- User accounts and cloud storage
- Performance profiling tools
- Debugging with breakpoints
- Plugin system for extensions

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Run Code |
| `Ctrl+S` | Save to History |
| `Ctrl+Shift+F` | Format Code |
| `Ctrl+/` | Toggle Comment |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+F` | Find |
| `Ctrl+H` | Find & Replace |

## Error Handling

- Runtime errors are caught and displayed in the console
- Syntax errors are highlighted in the editor
- Stack traces are shown for debugging

## Performance Tips

- For better performance, clear console output periodically
- Close unused tabs to reduce memory usage
- Use templates to quickly scaffold projects

## Privacy

- All code execution happens in your browser
- No data is sent to external servers (except CDNs for libraries)
- History is stored locally in localStorage
- Shared links contain code in the URL

## Notes

- Python execution requires a backend or library
- The sandbox prevents access to the file system
- Limited resources available for long-running code

## License

This interactive playground is part of the Dev Card Showcase project.

---

**Happy Coding!** 🚀
