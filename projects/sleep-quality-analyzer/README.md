# Sleep Quality Analyzer 🌙

A comprehensive sleep tracking application that helps users monitor their sleep patterns, analyze sleep quality, and receive personalized recommendations for better rest. This tool combines sleep stage tracking, quality scoring, and data visualization to provide deep insights into sleep health.

## 🌟 Features

### Core Functionality
- **Sleep Session Logging**: Record bed time, wake time, and detailed sleep stages
- **Sleep Stage Tracking**: Monitor Deep Sleep, Light Sleep, REM Sleep, and awake periods
- **Quality Scoring**: Rate sleep quality on a 1-10 scale with visual feedback
- **Mood Tracking**: Record morning mood to correlate with sleep quality

### Analytics & Insights
- **Sleep Statistics**: Average sleep time, quality scores, sleep streaks, and deep sleep percentages
- **Interactive Charts**: Line chart for quality trends and pie chart for sleep stage distribution
- **Sleep History**: View recent sleep sessions with detailed breakdowns
- **Personalized Tips**: Dynamic sleep improvement recommendations based on your data

### Data Management
- **Local Storage**: All data persists securely in your browser
- **Data Export**: Export sleep data as CSV for external analysis
- **Data Visualization**: Beautiful charts powered by Chart.js
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🎯 Sleep Stages Explained

### Deep Sleep (Slow-Wave Sleep)
- **Color**: Blue
- **Duration**: Typically 1-2 hours per night
- **Benefits**: Physical restoration, immune system strengthening
- **Optimal**: 20-25% of total sleep time

### Light Sleep (Stage 1 & 2)
- **Color**: Purple
- **Duration**: 4-5 hours per night
- **Benefits**: Memory consolidation, learning
- **Optimal**: 50-60% of total sleep time

### REM Sleep (Rapid Eye Movement)
- **Color**: Pink
- **Duration**: 1.5-2 hours per night
- **Benefits**: Emotional processing, creativity, dreaming
- **Optimal**: 20-25% of total sleep time

### Awake Periods
- **Color**: Orange
- **Duration**: Minimal during good sleep
- **Note**: Brief awakenings are normal; long periods indicate sleep disruption

## 📊 Quality Scoring System

- **1-3**: Poor sleep - Frequent disturbances, low energy
- **4-6**: Fair sleep - Some interruptions, moderate fatigue
- **7-8**: Good sleep - Restful with minor issues
- **9-10**: Excellent sleep - Fully restorative, high energy

## 🚀 Getting Started

1. **Log Your First Sleep Session**:
   - Enter the date, bed time, and wake time
   - Input sleep stage durations (use sleep tracker app data or estimates)
   - Rate your sleep quality and morning mood
   - Add optional notes about your sleep experience

2. **Monitor Your Progress**:
   - View your sleep statistics and trends
   - Analyze sleep stage distributions
   - Read personalized improvement tips

3. **Track Consistently**:
   - Log sleep data daily for best insights
   - Review weekly patterns and adjustments
   - Export data for long-term analysis

## 💡 Sleep Improvement Tips

### Basic Sleep Hygiene
- **Consistent Schedule**: Same bedtime and wake time daily
- **Cool Environment**: 60-67°F (15-19°C) bedroom temperature
- **Dark Room**: Minimize light exposure during sleep
- **Quiet Space**: Reduce noise with earplugs or white noise

### Pre-Bedtime Routine
- **Screen Curfew**: No screens 1 hour before bed
- **Relaxation**: Reading, meditation, or light stretching
- **Caffeine Cutoff**: No caffeine after 2 PM
- **Light Exercise**: Morning or afternoon physical activity

### Dietary Considerations
- **Light Evening Meals**: Avoid heavy food 2-3 hours before bed
- **Hydration Balance**: Stay hydrated but reduce evening fluid intake
- **Sleep-Promoting Foods**: Bananas, almonds, chamomile tea

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup and responsive structure
- **CSS3**: Modern styling with glassmorphism effects and animations
- **JavaScript ES6+**: Core functionality and DOM manipulation
- **Chart.js**: Interactive data visualization and charting
- **Local Storage API**: Client-side data persistence

### Architecture
- **Modular Design**: Separate HTML, CSS, and JavaScript files
- **Object-Oriented**: SleepQualityAnalyzer class for organized code
- **Event-Driven**: Interactive elements with proper event handling
- **Data Validation**: Form inputs validated for accuracy and completeness

### Performance
- **Lightweight**: No external dependencies except Chart.js
- **Fast Loading**: Optimized for quick page loads
- **Efficient Storage**: Minimal local storage usage with JSON format
- **Responsive**: Mobile-first design with flexible layouts

## 📈 Understanding Your Sleep Data

### Key Metrics to Monitor

**Sleep Duration**
- Adults: 7-9 hours per night
- Quality over quantity: Consistent, restful sleep matters more than total hours

**Sleep Efficiency**
- Time asleep vs. time in bed
- Target: 85% or higher efficiency

**Sleep Stages Balance**
- Deep Sleep: Essential for physical recovery
- REM Sleep: Important for mental health and memory
- Light Sleep: Transitions between stages

**Sleep Consistency**
- Regular sleep schedule strengthens circadian rhythm
- Track sleep debt and recovery patterns

### Interpreting Trends

**Improving Quality Scores**
- Look for upward trends over weeks
- Correlate with lifestyle changes
- Identify patterns (weekdays vs. weekends)

**Sleep Stage Changes**
- Deep sleep may decrease with age
- REM sleep affected by stress and medications
- Monitor for significant deviations from baseline

## 🔧 Customization

### Adding Custom Metrics
To add new sleep-related metrics, modify the `sleepSession` object in `script.js`:

```javascript
const sleepSession = {
  // Existing properties...
  customMetric: value
};
```

### Styling Modifications
The app uses CSS custom properties for easy theming:

```css
:root {
  --primary-color: #6366f1;
  --background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  --text-primary: #ffffff;
}
```

### Chart Customization
Modify chart options in the `initializeCharts()` method:

```javascript
options: {
  scales: {
    y: {
      max: 10, // Adjust scale as needed
      ticks: {
        color: '#cbd5e1'
      }
    }
  }
}
```

## 📱 Browser Compatibility

- **Chrome**: 80+
- **Firefox**: 75+
- **Safari**: 13+
- **Edge**: 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-sleep-metric`)
3. Make your changes
4. Test thoroughly on multiple devices
5. Submit a pull request

### Suggested Improvements
- Integration with wearable sleep trackers
- Advanced sleep analysis algorithms
- Sleep goal setting and reminders
- Social features for sleep challenges
- Integration with health apps

## 📄 License

This project is part of the Dev Card Showcase and follows the same licensing terms.

## 🙏 Acknowledgments

- **Sleep Science**: Based on guidelines from American Academy of Sleep Medicine
- **Chart.js**: For beautiful and interactive data visualizations
- **Sleep Research**: Informed by studies from National Sleep Foundation
- **UI Inspiration**: Modern glassmorphism and dark theme trends

## 🔍 Troubleshooting

### Common Issues

**Data Not Saving**
- Check browser local storage permissions
- Clear browser cache and try again
- Ensure JavaScript is enabled

**Charts Not Loading**
- Verify internet connection for Chart.js CDN
- Check browser console for JavaScript errors
- Try refreshing the page

**Incorrect Time Calculations**
- Ensure bed time is before wake time
- Check for timezone issues
- Verify 24-hour time format

**Mobile Display Issues**
- Ensure viewport meta tag is present
- Test on different screen sizes
- Check for CSS media query conflicts

### Data Recovery
If local storage is cleared accidentally:
1. Check browser history for cached versions
2. Use export feature regularly for backups
3. Consider using browser extensions for data backup

### Performance Tips
- Limit history display to recent sessions
- Clear old data periodically if storage becomes large
- Use data export for archiving old records

---

**Sweet Dreams! 😴** Track your sleep, improve your health, and wake up feeling refreshed!