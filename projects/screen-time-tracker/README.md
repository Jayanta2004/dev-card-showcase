# 🕒 Screen Time Tracker UI

A comprehensive digital wellness application that helps users monitor and manage their screen time across different apps and activities. Features detailed analytics, category breakdowns, and personalized wellness tips to promote healthier digital habits.

## ✨ Features

### 📱 Core Functionality
- **Activity Logging**: Track screen time for any app or digital activity
- **Category Organization**: Classify activities by type (social, entertainment, work, gaming, education)
- **Daily Monitoring**: Real-time tracking of daily screen time with customizable limits
- **Trend Analysis**: Weekly usage patterns and progress tracking

### 📊 Analytics Dashboard
- **Daily Summary**: Today's total screen time, limit status, and app count
- **Statistics Overview**: Average daily usage, most used app, days under limit, weekly trends
- **Visual Charts**: Bar chart for daily usage trends and pie chart for app distribution
- **Category Breakdown**: Time spent in each activity category with percentages

### 💡 Digital Wellness
- **Wellness Tips**: Rotating collection of evidence-based tips for reducing screen time
- **Limit Tracking**: Visual indicators for staying within healthy daily limits
- **Progress Monitoring**: Track improvements in screen time habits over time
- **Mindful Reminders**: Encouragement to replace screen time with healthier activities

### 🎨 User Experience
- **Modern Glassmorphism Design**: Beautiful, translucent UI with backdrop blur effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Interface**: Easy-to-use forms with smart defaults and validation
- **Real-time Updates**: Instant feedback and UI updates on all interactions

## 🚀 Usage

### Logging Screen Time
1. Enter the app or activity name (e.g., "Instagram", "YouTube", "Work Email")
2. Select the appropriate category from the dropdown
3. Input the hours and minutes spent
4. Choose the date (defaults to today)
5. Click "Log Activity" to record

### Understanding Your Data
- **Daily Limit**: Default 8 hours, adjustable in code
- **Limit Status**: Green (good), Yellow (near limit), Red (exceeded)
- **Categories**: Social Media, Entertainment, Work, Gaming, Education, Other
- **Trends**: Compare current week to previous week

### Viewing Analytics
- Check the "Today's Summary" for current day overview
- Review statistics cards for overall patterns
- Analyze the daily chart for usage trends over the last week
- Examine the app distribution pie chart for usage breakdown
- Browse category breakdown for time allocation insights

## 🛠️ Technical Implementation

### Technologies Used
- **HTML5**: Semantic markup and responsive structure
- **CSS3**: Modern styling with gradients, flexbox, and glassmorphism effects
- **Vanilla JavaScript (ES6+)**: Class-based architecture for screen time management
- **Chart.js**: Interactive data visualization for trends and distributions
- **Local Storage API**: Client-side data persistence

### Architecture
```
ScreenTimeTracker Class
├── Activity Management
│   ├── addActivity()
│   ├── deleteActivity()
│   └── groupByDate()
├── Analytics & Statistics
│   ├── updateStatistics()
│   ├── calculateWeeklyTrend()
│   └── updateCategoryBreakdown()
├── Data Visualization
│   ├── updateDailyChart()
│   ├── updateAppChart()
│   └── updateCharts()
└── Wellness Features
    ├── rotateWellnessTips()
    └── exportData()
```

### Key Features Implementation

#### Daily Limit Tracking
- Configurable daily screen time limit (default: 8 hours)
- Color-coded status indicators (Good/Near Limit/Exceeded)
- Visual feedback in charts and statistics

#### Category System
- **Social Media**: Instagram, Facebook, Twitter, TikTok, etc.
- **Entertainment**: YouTube, Netflix, gaming, streaming services
- **Work**: Email, productivity apps, work-related browsing
- **Gaming**: Video games, gaming platforms
- **Education**: Online courses, research, learning apps
- **Other**: Miscellaneous screen activities

#### Trend Analysis
- Weekly comparison (current vs. previous week)
- Improvement tracking with visual indicators
- Days under limit counter for consistency measurement

#### Wellness Tips System
- Curated collection of evidence-based digital wellness advice
- Randomized rotation to keep tips fresh and engaging
- Covers topics like sleep, mindfulness, physical activity, and habit formation

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- **Desktop**: Full-width layout with side-by-side charts
- **Tablet**: Adjusted grid layouts and stacked elements
- **Mobile**: Single-column layout with touch-friendly controls

## 🎨 Design System

### Color Palette
- **Primary**: Coral (#FF6B6B) for screen time and alerts
- **Secondary**: Teal (#4ECDC4) for positive indicators and success states
- **Accent**: Yellow (#FFE66D) for highlights and gaming category
- **Warning**: Orange (#FFA726) for near-limit warnings
- **Danger**: Red (#FF4757) for exceeded limits
- **Success**: Green (#4CAF50) for good habits and achievements

### Category Colors
- **Social Media**: Coral (#FF6B6B)
- **Entertainment**: Teal (#4ECDC4)
- **Work**: Yellow (#FFE66D)
- **Gaming**: Purple (#9C27B0)
- **Education**: Green (#4CAF50)
- **Other**: Orange (#FFA726)

### Components
- **Glass Cards**: Translucent containers with backdrop blur
- **Interactive Charts**: Custom Chart.js configuration with themed colors
- **Statistics Cards**: Grid layout with icons and metrics
- **Activity Items**: Structured display with app, category, time, and actions

## 🔧 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📊 Data Storage

All screen time data is stored locally in the browser using:
- **Activities Array**: Stores screen time entries with timestamps and metadata
- **No server required**: Works offline and persists between sessions
- **Export functionality**: JSON export for backup or analysis

## 💡 Digital Wellness Guidelines

### Recommended Daily Limits
- **Children (2-5 years)**: 1 hour maximum
- **Children (6-12 years)**: 1-2 hours
- **Teens (13-18 years)**: 2-3 hours
- **Adults**: 3-8 hours (depending on lifestyle and work requirements)

### 20-20-20 Rule
Every 20 minutes of screen time, look at something 20 feet away for 20 seconds to reduce eye strain.

### Screen-Free Zones
- **Bedrooms**: Keep screens out to improve sleep quality
- **Meal Times**: Family meals should be screen-free
- **First Hour**: Avoid screens for the first hour after waking
- **Last Hour**: No screens for the last hour before bed

## 🚀 Future Enhancements

- [ ] Customizable daily limits per category
- [ ] App usage integration with device APIs
- [ ] Goal setting and achievement tracking
- [ ] Social features for accountability
- [ ] Advanced analytics and insights
- [ ] Reminder notifications
- [ ] Integration with calendar apps
- [ ] Data import from other tracking apps

## 📝 License

This project is part of the Dev Card Showcase and follows the same licensing terms as the main repository.

## 🤝 Contributing

Contributions are welcome! Please follow the contribution guidelines in the main repository.

---

**Built with ❤️ for promoting digital wellness and mindful technology use**