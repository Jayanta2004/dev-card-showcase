# 🌿 Wellness Score Dashboard

A comprehensive wellness tracking application that provides a unified health overview through multi-factor scoring, interactive visualizations, and personalized wellness tips.

![Wellness Score Dashboard Preview](https://via.placeholder.com/800x400/84fab0/ffffff?text=🌿+Wellness+Score+Dashboard+Preview)

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
- [Wellness Guide](#-wellness-guide)
- [Developer Notes](#-developer-notes)

## ✨ Features

### Core Functionality
- **Multi-Factor Wellness Scoring**: Comprehensive algorithm combining sleep, activity, nutrition, mental health, and hydration
- **Interactive Visualizations**: Line chart for score trends and radar chart for metric breakdown
- **Personalized Insights**: AI-generated recommendations based on your wellness data
- **Wellness Tips**: Expert advice for improving overall health and wellness
- **Progress Tracking**: Historical data storage and trend analysis
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Wellness Metrics
- **Sleep Quality**: Hours slept and subjective sleep quality rating
- **Physical Activity**: Exercise duration and intensity levels
- **Nutrition**: Meal frequency and diet quality assessment
- **Mental Health**: Stress levels and mood tracking
- **Hydration**: Water intake and hydration status

### User Experience
- **Unified Dashboard**: Single-view health snapshot with all key metrics
- **Real-time Updates**: Instant score calculations and chart updates
- **Intuitive Interface**: Clean, modern UI with wellness-focused design
- **Data Persistence**: Local storage for tracking long-term wellness trends
- **Personalized Feedback**: Context-aware insights and improvement suggestions

### Technical Features
- **Vanilla JavaScript**: No external dependencies except built-in Canvas API
- **Modular Architecture**: Well-structured, maintainable codebase
- **Performance Optimized**: Efficient DOM manipulation and data handling
- **Cross-browser Compatible**: Works on all modern browsers
- **Accessibility**: Keyboard navigation and screen reader support

## 🎮 Demo

Experience the Wellness Score Dashboard live: [View Demo](./index.html)

## 🚀 How to Use

1. **Update Your Metrics**:
   - **Sleep**: Enter hours slept and rate sleep quality (1-10)
   - **Activity**: Log exercise minutes and intensity level (1-10)
   - **Nutrition**: Record meals eaten and diet quality (1-10)
   - **Mental Health**: Rate stress level (lower is better) and mood (1-10)
   - **Hydration**: Track water glasses and hydration feeling (1-10)

2. **View Your Wellness Score**:
   - See your overall wellness score (0-100) in the main circular indicator
   - Review individual metric scores in the breakdown panel
   - Monitor score changes over time with the trend chart

3. **Analyze Your Data**:
   - View radar chart showing balance across all wellness dimensions
   - Check historical trends in the score history chart
   - Read personalized insights based on your current metrics

4. **Get Wellness Tips**:
   - Click "New Tip" for expert wellness advice
   - Tips cover sleep, exercise, nutrition, mental health, and hydration

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Visualization**: HTML5 Canvas API (custom charts)
- **Storage**: Browser Local Storage
- **Styling**: Custom CSS with gradients and animations
- **Icons**: Unicode emojis for visual elements

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dev-card-showcase.git
   cd dev-card-showcase/projects/wellness-score-dashboard
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
- Review the [Wellness Guide](#-wellness-guide) below

## 🌱 Wellness Guide

### Understanding Your Wellness Score
Your overall wellness score is calculated using a weighted algorithm:

- **Sleep (25%)**: Quality and duration of sleep
- **Activity (20%)**: Physical exercise and movement
- **Nutrition (20%)**: Meal frequency and diet quality
- **Mental Health (20%)**: Stress management and mood
- **Hydration (15%)**: Water intake and hydration status

### Score Ranges
- **80-100**: Excellent wellness - maintain these habits!
- **60-79**: Good wellness - small improvements possible
- **40-59**: Fair wellness - focus on improvement areas
- **0-39**: Needs attention - prioritize wellness fundamentals

### Improvement Strategies
- **Sleep**: Aim for 7-9 hours, maintain consistent schedule
- **Activity**: 30+ minutes of moderate exercise daily
- **Nutrition**: 3 balanced meals with quality ingredients
- **Mental Health**: Practice stress management techniques
- **Hydration**: 8+ glasses of water daily

### Tracking Best Practices
- Update metrics daily for accurate trends
- Be honest with self-assessment ratings
- Focus on gradual, sustainable improvements
- Use insights to guide specific wellness goals
- Review trends weekly to identify patterns

## 👨‍💻 Developer Notes

### Architecture
- **HTML**: Semantic structure with proper form validation
- **CSS**: Modular styling with CSS custom properties
- **JavaScript**: ES6+ features with Canvas API integration

### Key Components
- Wellness scoring algorithm with weighted calculations
- Canvas-based charting system (line and radar charts)
- Local storage management for data persistence
- Dynamic insight generation based on scores
- Responsive design with mobile-first approach

### Scoring Algorithm
```javascript
// Weighted calculation example
totalScore = (sleepScore * 0.25) +
            (activityScore * 0.20) +
            (nutritionScore * 0.20) +
            (mentalScore * 0.20) +
            (hydrationScore * 0.15);
```

### Future Enhancements
- Integration with wearable device data
- Goal setting and achievement tracking
- Social sharing of wellness milestones
- Advanced analytics and correlations
- Custom wellness plan generation