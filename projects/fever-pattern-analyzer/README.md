# Fever Pattern Analyzer

A comprehensive web application for monitoring fever patterns during illness, providing real-time analysis, trend visualization, and health alerts. This tool helps users track temperature fluctuations and detect concerning patterns that may require medical attention.

## 🌡️ Features

### Temperature Logging
- **Multiple Measurement Methods**: Support for oral, axillary, rectal, tympanic, and temporal measurements
- **Automatic Temperature Adjustment**: Converts all readings to oral equivalent for consistency
- **Symptom Tracking**: Record associated symptoms like chills, sweating, headache, etc.
- **Notes & Observations**: Add personal observations for each reading

### Real-time Analysis
- **Fever Classification**: Automatic classification (normal, low-grade, moderate, high, critical)
- **Pattern Detection**: Analyzes trends (improving, stable, worsening) with confidence scores
- **Duration Tracking**: Monitors how long fever has been present
- **Trend Analysis**: Compares recent vs. older readings for pattern identification

### Visual Analytics
- **Interactive Charts**: View temperature trends over 24 hours, 7 days, or 30 days
- **Pattern Visualization**: Graphical representation of fever patterns over time
- **Color-coded Indicators**: Visual cues for fever severity and trend direction
- **Fever Threshold Lines**: Clear indicators of normal vs. fever temperatures

### Health Alerts & Safety
- **Automated Alerts**: Warnings for high fevers, persistent fevers, and worsening patterns
- **Medical Disclaimer**: Clear warnings about professional medical consultation
- **Emergency Guidelines**: When to seek immediate medical attention
- **Safety Recommendations**: Hydration, monitoring, and care guidelines

## 🚀 Usage

### Getting Started
1. **Open the Application**: Navigate to the Fever Pattern Analyzer
2. **Log Your First Reading**: Enter your temperature and select measurement method
3. **Add Symptoms**: Check relevant symptoms you're experiencing
4. **Include Notes**: Add any observations about how you feel
5. **Monitor Patterns**: View trends and receive alerts as you log more readings

### Temperature Logging
1. **Enter Temperature**: Input your temperature reading (35°C - 45°C)
2. **Select Method**: Choose how the temperature was measured
3. **Record Symptoms**: Check all symptoms you're currently experiencing
4. **Add Notes**: Include any additional observations
5. **Submit**: Click to log the reading and update analysis

### Understanding the Dashboard
- **Latest Temperature**: Your most recent reading with fever classification
- **24h Average**: Average temperature over the last 24 hours with trend indicator
- **Fever Status**: Current fever classification and duration
- **Pattern Status**: Whether your fever is improving, stable, or worsening

### Chart Navigation
- **24H View**: Hourly temperature trends for the last day
- **7D View**: Daily averages over the past week
- **30D View**: Daily averages over the past month
- **Pattern Chart**: Visual representation of fever pattern changes

## 🛑 Safety Guidelines

### Important Medical Warnings
- **Not a Substitute for Professional Care**: This tool is for informational purposes only
- **Consult Healthcare Providers**: Always seek medical advice for fever management
- **Regular Monitoring**: Take readings every 4-6 hours when fever is present
- **Know When to Seek Help**: Don't wait for severe symptoms

### Fever Classification Guide
- **Normal**: < 37.0°C - No fever present
- **Low-grade Fever**: 37.0°C - 37.9°C - Mild fever, monitor symptoms
- **Moderate Fever**: 38.0°C - 39.4°C - Significant fever, consider medication
- **High Fever**: 39.5°C - 40.9°C - High fever, medical attention may be needed
- **Critical Fever**: ≥ 41.0°C - Emergency situation, seek immediate care

### When to Seek Medical Attention
**Immediate Emergency Care:**
- Temperature ≥ 40°C (104°F)
- Seizures or convulsions
- Severe dehydration
- Difficulty breathing
- Chest pain or irregular heartbeat
- Confusion or disorientation
- Fever lasting > 3 days in children < 3 months
- Fever lasting > 5 days in any age

**Contact Healthcare Provider:**
- Temperature 38.5°C (101.3°F) or higher
- Fever lasting > 3 days
- Worsening symptoms despite treatment
- Signs of dehydration
- Severe headache or neck stiffness
- Persistent vomiting

### Safe Usage Recommendations
1. **Stay Hydrated**: Drink plenty of fluids, especially water and electrolyte drinks
2. **Rest**: Get adequate rest while fever is present
3. **Monitor Symptoms**: Keep track of all symptoms, not just temperature
4. **Medication**: Use fever-reducing medication as directed by healthcare provider
5. **Environment**: Keep room cool but not cold, dress lightly
6. **Hygiene**: Practice good hand hygiene to prevent spreading illness

## 📊 Technical Details

### Temperature Adjustment Algorithm
The application automatically adjusts temperatures based on measurement method:
- **Oral**: No adjustment (reference standard)
- **Axillary**: +0.5°C (armpit readings are typically lower)
- **Rectal**: -0.5°C (rectal readings are typically higher)
- **Tympanic**: No adjustment (similar to oral)
- **Temporal**: No adjustment (similar to oral)

### Pattern Analysis
- **Trend Calculation**: Uses linear regression on recent readings
- **Confidence Scoring**: Based on slope magnitude and data consistency
- **Window Analysis**: Examines patterns over sliding 3-reading windows
- **Thresholds**: ±0.2°C change defines improving/worsening trends

### Data Storage
- **Local Storage**: All data stored locally in browser
- **No External Transmission**: Data never leaves your device
- **Privacy Protection**: No personal information collected or shared
- **Data Persistence**: Readings saved between browser sessions

### Chart Rendering
- **Canvas API**: High-performance chart rendering
- **Responsive Design**: Charts adapt to screen size
- **Interactive Elements**: Click controls for different time views
- **Color Coding**: Visual indicators for fever severity

## 🔧 Installation & Setup

### Local Development
1. Clone the repository
2. Navigate to the project directory
3. Open `index.html` in your web browser
4. No additional setup or dependencies required

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design works on desktop and mobile devices
- Local storage must be enabled for data persistence

## 🤝 Contributing

### Development Guidelines
- Follow existing code structure and naming conventions
- Add comprehensive comments for complex algorithms
- Test across different browsers and devices
- Ensure responsive design works on mobile screens
- Validate temperature input and provide clear error messages

### Feature Enhancement Ideas
- Export functionality for sharing with healthcare providers
- Integration with wearable temperature devices
- Medication tracking alongside temperature readings
- Symptom severity scoring
- Multi-user family profiles
- Integration with calendar for illness timeline

## 📋 Changelog

### Version 1.0.0
- Initial release with core temperature logging functionality
- Pattern analysis and trend detection
- Interactive charts and visual analytics
- Health alerts and safety guidelines
- Responsive design for mobile and desktop

## ⚖️ License

This project is part of the Dev Card Showcase and follows the same licensing terms as the main project.

## 🏥 Medical Disclaimer

**This application is not medical advice.** The Fever Pattern Analyzer is designed for informational and tracking purposes only. It does not replace professional medical diagnosis, treatment, or advice.

**Always consult qualified healthcare professionals for:**
- Fever evaluation and management
- Medication recommendations
- When to seek medical care
- Interpretation of symptoms and patterns

**The developers are not responsible for:**
- Medical decisions made based on this tool
- Any health outcomes or complications
- Accuracy of temperature measurements
- Interpretation of fever patterns

**Use this tool responsibly and seek professional medical care when needed.**