# 🩺 Blood Pressure Monitor UI

A comprehensive blood pressure tracking web application that helps users monitor their cardiovascular health through systematic BP recording, trend visualization, and risk assessment based on medical guidelines.

## ✨ Features

### 🏥 Core Functionality
- **Blood Pressure Recording**: Input systolic/diastolic readings with optional heart rate
- **Risk Assessment**: Automatic categorization based on American Heart Association guidelines
- **Trend Visualization**: Interactive charts showing BP and heart rate trends over time
- **Health Statistics**: Average readings, total recordings, and high BP alerts
- **Data Management**: View, delete, and organize historical readings

### 📊 Health Monitoring
- **Real-time Risk Assessment**: Color-coded risk levels (Normal, Elevated, High, Crisis)
- **Comprehensive Statistics**: Average systolic/diastolic, total readings, high reading count
- **Visual Trends**: Dual-axis charts for BP trends and separate heart rate tracking
- **Medical Guidelines**: Based on AHA blood pressure categories

### 🎨 User Experience
- **Modern Glassmorphism Design**: Beautiful, translucent UI with backdrop blur effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Forms**: Easy-to-use input forms with validation and helpful placeholders
- **Real-time Updates**: Instant feedback and UI updates on all interactions

## 🚀 Usage

### Recording a Reading
1. Enter your systolic blood pressure (upper number)
2. Enter your diastolic blood pressure (lower number)
3. Optionally add heart rate in BPM
4. Select the date and time of the reading
5. Add any notes about the reading
6. Click "Record Reading" to save

### Understanding Risk Levels
- **Normal**: < 120/80 mmHg - Maintain healthy lifestyle
- **Elevated**: 120-129 (systolic) and < 80 (diastolic) - Consider lifestyle changes
- **High (Stage 1)**: 130-139/80-89 mmHg - Consult healthcare provider
- **Hypertensive Crisis**: ≥ 180/120 mmHg - Seek immediate medical attention

### Viewing Trends
- Check the "Blood Pressure Trends" chart for systolic/diastolic patterns
- Monitor heart rate trends in the separate chart
- Review statistics cards for overall health metrics
- Browse recent readings in the history section

## 🛠️ Technical Implementation

### Technologies Used
- **HTML5**: Semantic markup and responsive structure
- **CSS3**: Modern styling with gradients, flexbox, and glassmorphism effects
- **Vanilla JavaScript (ES6+)**: Class-based architecture for BP monitoring
- **Chart.js**: Interactive data visualization for trend analysis
- **Local Storage API**: Client-side data persistence

### Architecture
```
BloodPressureMonitor Class
├── Reading Management
│   ├── addReading()
│   ├── deleteReading()
│   └── calculateRisk()
├── Health Analytics
│   ├── updateStatistics()
│   ├── updateRiskAssessment()
│   └── getRiskDescription()
├── Data Visualization
│   ├── updateBPChart()
│   ├── updateHRChart()
│   └── updateCharts()
└── Data Persistence
    ├── saveReadings()
    ├── loadReadings()
    └── exportData()
```

### Key Features Implementation

#### Risk Assessment Algorithm
- **Normal**: Systolic < 120 AND Diastolic < 80
- **Elevated**: Systolic 120-129 AND Diastolic < 80
- **High**: Systolic 130-179 OR Diastolic 80-119
- **Crisis**: Systolic ≥ 180 OR Diastolic ≥ 120

#### Data Validation
- Systolic range: 70-250 mmHg
- Diastolic range: 40-150 mmHg
- Heart rate range: 40-200 BPM (optional)
- Required date/time for each reading

#### Chart Visualization
- Line charts with dual datasets for systolic/diastolic
- Separate heart rate trend chart
- Last 30 readings displayed for optimal performance
- Responsive design with hover interactions

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- **Desktop**: Full-width layout with side-by-side charts
- **Tablet**: Adjusted grid layouts and stacked elements
- **Mobile**: Single-column layout with touch-friendly controls

## 🎨 Design System

### Color Palette
- **Primary**: Coral (#FF6B6B) for systolic readings and alerts
- **Secondary**: Teal (#4ECDC4) for diastolic readings and success states
- **Accent**: Yellow (#FFE66D) for heart rate and highlights
- **Danger**: Red (#FF4757) for high-risk indicators
- **Warning**: Orange (#FFA726) for elevated risk
- **Success**: Green (#4CAF50) for normal readings

### Risk Level Colors
- **Normal**: Green theme for healthy readings
- **Elevated**: Orange theme for attention-needed readings
- **High**: Red theme for concerning readings
- **Crisis**: Purple theme for emergency situations

### Components
- **Glass Cards**: Translucent containers with backdrop blur
- **Interactive Charts**: Custom Chart.js configuration with themed colors
- **Form Elements**: Styled inputs with focus states and validation
- **Statistics Cards**: Grid layout with icons and metrics

## 🔧 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📊 Data Storage

All health data is stored locally in the browser using:
- **Readings Array**: Stores BP readings with timestamps and metadata
- **Risk Calculation**: Computed on-the-fly based on current guidelines
- **No server required**: Works offline and persists between sessions

## ⚕️ Medical Disclaimer

This application is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns and before making health-related decisions.

### Blood Pressure Categories (AHA Guidelines)
- **Normal**: Less than 120/80 mmHg
- **Elevated**: 120-129 (systolic) / less than 80 (diastolic)
- **Stage 1 Hypertension**: 130-139 / 80-89 mmHg
- **Stage 2 Hypertension**: 140 or higher / 90 or higher mmHg
- **Hypertensive Crisis**: Higher than 180 / higher than 120 mmHg

## 🚀 Future Enhancements

- [ ] Data export/import functionality
- [ ] PDF report generation
- [ ] Medication tracking
- [ ] Appointment reminders
- [ ] Integration with wearables
- [ ] Advanced analytics and insights
- [ ] Multi-user support
- [ ] Cloud backup

## 📝 License

This project is part of the Dev Card Showcase and follows the same licensing terms as the main repository.

## 🤝 Contributing

Contributions are welcome! Please follow the contribution guidelines in the main repository.

---

**Built with ❤️ for better cardiovascular health monitoring**