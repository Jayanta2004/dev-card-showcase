# 🧠 Mood Tracker

A comprehensive web application for daily mood tracking and emotional well-being analysis. Monitor your mental health patterns, gain insights into your emotional state, and receive personalized tips for better mental wellness.

![Mood Tracker Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=🧠+Mood+Tracker+Preview)

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [How to Use](#-how-to-use)
- [Technical Stack](#-technical-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)
- [Changelog](#-changelog)
- [FAQ](#-faq)
- [Mental Health Guide](#-mental-health-guide)
- [Developer Notes](#-developer-notes)

## ✨ Features

### Core Functionality
- **Daily Mood Logging**: 8 mood options from Ecstatic to Depressed with emoji indicators
- **Optional Notes**: Add personal reflections and context to mood entries
- **Trend Visualization**: Interactive line charts showing mood patterns over time
- **Weekly Insights**: AI-powered analysis of mood trends and patterns
- **Statistics Dashboard**: Current streak, average mood, and best day tracking
- **Mood History**: Complete chronological record of mood entries
- **Local Storage**: Persistent data storage with no external dependencies

### User Experience
- **Intuitive Interface**: Clean, empathetic design focused on mental wellness
- **Visual Feedback**: Selected mood highlighting and smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Mental Health Tips**: Curated collection of wellness advice and coping strategies
- **Progress Awareness**: Real-time updates to charts and statistics
- **Privacy First**: All data stored locally on device

### Technical Features
- **Chart.js Integration**: Professional data visualization for mood trends
- **Modular Architecture**: Well-structured JavaScript with clear separation of concerns
- **Performance Optimized**: Efficient DOM manipulation and data handling
- **Cross-browser Compatible**: Works on all modern browsers
- **Accessibility**: Keyboard navigation and screen reader support

## 🎮 Demo

### Live Demo
[View Live Demo](https://your-demo-url.com) *(Replace with actual demo URL)*

### Screenshots

#### Main Interface
![Main Interface](https://via.placeholder.com/600x400/667eea/ffffff?text=Main+Interface)

#### Mood Selection
![Mood Selection](https://via.placeholder.com/600x400/764ba2/ffffff?text=Mood+Selection)

#### Trend Analysis
![Trend Analysis](https://via.placeholder.com/600x400/FF6B6B/ffffff?text=Trend+Analysis)

## 🚀 How to Use

### Getting Started
1. Open the application in your web browser
2. Select your current mood from the 8 available options
3. Add optional notes about your emotional state
4. Click "Save Today's Mood" to record your entry

### Daily Tracking
- **Morning Check-in**: Start your day by logging your baseline mood
- **Evening Reflection**: End your day by noting how you feel
- **Add Context**: Use notes to record what influenced your mood
- **View Patterns**: Check the trends chart to see your emotional patterns

### Understanding Insights
- **Weekly Analysis**: Get personalized insights about your mood trends
- **Streak Tracking**: See how consistently you're monitoring your mental health
- **Average Mood**: Understand your general emotional state over time
- **Best Days**: Identify what contributes to your most positive moods

### Tips for Best Results
- Track daily for at least a week to see meaningful patterns
- Be honest with yourself about your emotional state
- Use notes to identify triggers and positive influences
- Review insights regularly to understand your mental health patterns
- Combine with other wellness practices for holistic self-care

## 🛠️ Technical Stack

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JS with modern features
- **Chart.js**: Lightweight charting library for data visualization

### Key Technologies
- **Local Storage API**: Client-side data persistence
- **Web APIs**: Modern browser APIs for enhanced functionality
- **Responsive Design**: Mobile-first approach with media queries
- **CSS Animations**: Smooth transitions and hover effects

### Browser Support
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 📦 Installation

### Option 1: Direct Download
1. Download the project files
2. Open `index.html` in your web browser
3. No server required - works offline!

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/your-repo/mood-tracker.git

# Navigate to the project directory
cd mood-tracker

# Open in browser or serve locally
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Open http://localhost:8000 in your browser
```

### Option 3: Integration
```html
<!-- Include in existing project -->
<link rel="stylesheet" href="path/to/style.css">
<script src="path/to/script.js"></script>
```

## 💻 Usage

### Basic Implementation
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Mental Wellness Tracker</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="mood-app"></div>
    <script src="script.js"></script>
</body>
</html>
```

### Advanced Customization
```javascript
// Initialize with custom options
const moodApp = new MoodTracker({
    theme: 'calm',
    moodOptions: customMoods,
    insightsEnabled: true
});
```

## 📚 API Reference

### MoodTracker Class

#### Constructor
```javascript
const app = new MoodTracker(options);
```

#### Methods

##### `selectMood(moodType)`
Selects a mood option for logging.

**Parameters:**
- `moodType` (string): Mood identifier ('happy', 'sad', etc.)

**Returns:** void

##### `saveMood()`
Saves the current mood entry to storage.

**Returns:** void

##### `updateChart()`
Updates the mood trend visualization chart.

**Returns:** void

##### `generateInsights()`
Analyzes mood data and generates personalized insights.

**Returns:** Array of insight objects

### Mood Data Structure
```javascript
{
  moodData: [
    {
      date: "2024-01-30T10:00:00.000Z",
      mood: "happy",
      value: 7,
      notes: "Great day at work!"
    }
  ]
}
```

### Events
- `moodSaved`: Fired when a mood entry is successfully saved
- `chartUpdated`: Fired when the trend chart is updated
- `insightsGenerated`: Fired when new insights are available

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Fork and clone
git clone https://github.com/your-username/mood-tracker.git
cd mood-tracker

# Install dependencies (if any)
npm install

# Start development server
npm run dev

# Run tests
npm test
```

### Code Style
- Use ESLint for JavaScript linting
- Follow BEM methodology for CSS
- Write descriptive commit messages
- Add JSDoc comments for functions

### Adding New Features
1. Create a feature branch
2. Write tests for new functionality
3. Implement the feature
4. Update documentation
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Getting Help
- 📧 **Email**: support@moodtracker.com
- 💬 **Discord**: [Join our mental health community](https://discord.gg/moodtracker)
- 📖 **Documentation**: [Full docs](https://docs.moodtracker.com)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/your-repo/issues)

### Common Issues
- **Charts not loading**: Ensure Chart.js is properly included
- **Data not saving**: Check browser local storage permissions
- **Mobile display issues**: Verify viewport meta tag

## 📝 Changelog

### Version 1.0.0 (Current)
- Initial release
- 8 mood options with emoji indicators
- Interactive trend visualization
- Weekly insights and analysis
- Mental health tips section
- Mood history tracking
- Responsive design

### Upcoming Features
- [ ] Mood prediction based on patterns
- [ ] Export mood data to CSV
- [ ] Integration with mental health apps
- [ ] Custom mood categories
- [ ] Advanced analytics dashboard

## ❓ FAQ

### General Questions

**Q: Is my mood data private?**
A: Absolutely! All data is stored locally in your browser. Nothing is sent to external servers.

**Q: Can I use this offline?**
A: Yes! The app works completely offline once loaded.

**Q: How often should I track my mood?**
A: Daily tracking provides the best insights, but even 3-4 times per week can be valuable.

**Q: What if I don't know how I'm feeling?**
A: That's okay! You can always select "Neutral" or add notes explaining your uncertainty.

### Technical Questions

**Q: What browsers are supported?**
A: All modern browsers including Chrome, Firefox, Safari, and Edge.

**Q: Can I export my mood data?**
A: Currently, data is stored locally. Export functionality is planned for a future update.

**Q: Is there a mobile app version?**
A: Not yet, but the web app is fully responsive and works great on mobile devices.

## 🧘 Mental Health Guide

### Understanding Mood Tracking
Mood tracking helps you become more aware of your emotional patterns and identify factors that influence your mental well-being.

### Mood Categories Explained
- **Ecstatic (8)**: Extremely happy, euphoric feelings
- **Happy (7)**: Generally positive, content mood
- **Content (6)**: Satisfied, at peace
- **Neutral (5)**: Neither particularly good nor bad
- **Sad (3)**: Feeling down or melancholic
- **Anxious (2)**: Worried, nervous, or stressed
- **Angry (2)**: Irritated, frustrated, or upset
- **Depressed (1)**: Severely low mood, hopelessness

### Benefits of Mood Tracking
- **Self-Awareness**: Better understanding of emotional patterns
- **Trigger Identification**: Recognize what affects your mood
- **Progress Monitoring**: Track improvements in mental health
- **Communication**: Share insights with healthcare providers
- **Preventive Care**: Early identification of concerning patterns

### When to Seek Professional Help
- Persistent low mood lasting more than 2 weeks
- Difficulty functioning in daily activities
- Thoughts of self-harm or suicide
- Significant changes in sleep, appetite, or energy
- Intense anxiety or panic attacks

### Additional Resources
- **Crisis Hotlines**: National Suicide Prevention Lifeline (988)
- **Mental Health Apps**: Headspace, Calm, Insight Timer
- **Professional Help**: Therapists, counselors, psychiatrists
- **Support Groups**: Local and online mental health communities

## 👨‍💻 Developer Notes

### Architecture
The application follows a modular architecture with clear separation of concerns:

```
mood-tracker/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # Main application logic
└── README.md           # This documentation
```

### Key Classes
- `MoodTracker`: Main application class
- `MoodDatabase`: Manages mood data storage
- `ChartManager`: Handles chart rendering
- `InsightsEngine`: Generates mood insights

### Performance Considerations
- Minimal DOM manipulation
- Efficient event handling
- Lazy loading of chart library
- Optimized CSS animations

### Future Enhancements
- [ ] Unit tests with Jest
- [ ] TypeScript migration
- [ ] Progressive Web App features
- [ ] Database integration
- [ ] Multi-language support

### Code Quality
- ESLint configuration
- Prettier formatting
- JSDoc documentation
- Semantic versioning

---

**Made with ❤️ for mental health awareness**

*Track your mood, understand your mind, improve your well-being! 🧠💙*