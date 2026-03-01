# 🛌 Power Nap Tracker

A comprehensive web application for tracking power naps and optimizing energy management. Log nap duration, quality, and energy levels to visualize energy impact and get personalized timing tips.

![Power Nap Tracker Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=🛌+Power+Nap+Tracker+Preview)

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [How to Use](#-how-to-use)
- [Technical Stack](#-technical-stack)
- [Installation](#-installation)
- [Usage](#-usage)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)
- [Nap Guide](#-nap-guide)
- [Developer Notes](#-developer-notes)

## ✨ Features

### Core Functionality
- **Nap Duration Tracking**: Log power nap duration with validation for optimal lengths
- **Energy Impact Visualization**: Interactive chart showing energy gain over time
- **Quality Assessment**: Rate nap quality and track energy levels before/after
- **Timing Tips**: Get expert advice on optimal nap timing for maximum benefit
- **Historical Analysis**: View recent naps with detailed energy impact data
- **Local Storage**: Persistent storage of nap logs and statistics

### User Experience
- **Intuitive Interface**: Clean, modern UI with sleep-focused design
- **Real-time Updates**: Charts and stats update instantly after logging
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Progress Visualization**: Visual representation of energy gains and trends
- **Expert Tips**: Built-in nap timing and energy management advice

### Technical Features
- **Vanilla JavaScript**: No external dependencies except built-in Canvas API
- **Modular Architecture**: Well-structured, maintainable codebase
- **Performance Optimized**: Efficient DOM manipulation and data handling
- **Cross-browser Compatible**: Works on all modern browsers
- **Accessibility**: Keyboard navigation and screen reader support

## 🎮 Demo

Experience the Power Nap Tracker live: [View Demo](./index.html)

## 🚀 How to Use

1. **Log Your Power Nap**:
   - Enter nap duration in minutes (recommended: 20-30 minutes)
   - Rate nap quality on a scale of 1-10
   - Set energy level before nap (1-10)
   - Set energy level after nap (1-10)
   - Choose the time and date of your nap

2. **View Energy Impact**:
   - See your energy gain visualized in the interactive chart
   - Check average energy gain across all naps
   - Find your optimal nap duration based on energy impact

3. **Get Timing Tips**:
   - Click "New Tip" for advice on optimal nap timing
   - Tips focus on circadian rhythms and energy management

4. **Review History**:
   - View your recent power naps with detailed information
   - Track energy changes and nap effectiveness over time

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Visualization**: HTML5 Canvas API
- **Storage**: Browser Local Storage
- **Styling**: Custom CSS with gradients and animations
- **Icons**: Unicode emojis for visual elements

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dev-card-showcase.git
   cd dev-card-showcase/projects/power-nap-tracker
   ```

2. Open `index.html` in your web browser

No additional dependencies or build steps required!

## 💻 Usage

Simply open `index.html` in any modern web browser. The application works entirely offline and stores data locally in your browser.

## 🤝 Contributing

We welcome contributions! Please see the main repository's [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

- Create an issue in the main repository
- Check the [FAQ](../../faq.html) for common questions
- Review the [Nap Guide](#-nap-guide) below

## 😴 Nap Guide

### Understanding Power Naps
Power naps are short naps (typically 10-30 minutes) that provide quick energy restoration without causing grogginess.

### Optimal Nap Duration
- **10-20 minutes**: Quick energy boost, no grogginess
- **20-30 minutes**: Maximum energy restoration
- **30-60 minutes**: May cause sleep inertia
- **90+ minutes**: Full sleep cycle, may disrupt nighttime sleep

### Best Timing
- **2-4 PM**: Natural afternoon energy dip
- **Avoid after 4 PM**: May interfere with nighttime sleep
- **Consistent timing**: Same time daily for best results

### Energy Management Tips
- Track energy levels before and after naps
- Aim for 2-3 point energy improvement
- Monitor nap quality and duration correlation
- Use naps strategically before demanding tasks

## 👨‍💻 Developer Notes

### Architecture
- **HTML**: Semantic structure with proper form validation
- **CSS**: Modular styling with CSS custom properties
- **JavaScript**: ES6+ features with Canvas API integration

### Key Components
- Nap logging form with validation
- Energy impact calculation algorithm
- Canvas-based charting system
- Local storage management
- Dynamic UI updates

### Future Enhancements
- Export/import nap data
- Advanced analytics and trends
- Integration with sleep trackers
- Custom tip categories
- Goal setting and reminders