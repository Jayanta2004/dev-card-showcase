# Arterial Elasticity Monitor

A comprehensive web-based tool for monitoring arterial elasticity and cardiovascular health through blood pressure measurements and pulse wave velocity tracking.

## Features

- **Blood Pressure Logging**: Record systolic and diastolic blood pressure readings
- **Pulse Wave Velocity**: Optional PWV measurement for advanced assessment
- **Elasticity Score Calculation**: Age-adjusted arterial elasticity scoring
- **Arterial Stiffness Index**: Calculate stiffness based on blood pressure parameters
- **Trend Visualization**: Chart your elasticity scores and blood pressure over time
- **Health Insights**: Educational information about arterial health ranges
- **Local Data Storage**: All data stored locally in your browser

## How It Works

### Elasticity Score Calculation
The tool calculates an arterial elasticity score based on:
- **Pulse Pressure**: Difference between systolic and diastolic BP
- **Age Adjustment**: Natural arterial stiffening with age
- **Pulse Wave Velocity**: Direct measure of arterial stiffness (if available)

### Score Ranges
- **80-100**: Excellent arterial elasticity
- **60-79**: Good elasticity
- **40-59**: Moderate elasticity
- **20-39**: Poor elasticity
- **0-19**: Very poor elasticity

### Pulse Wave Velocity Guidelines
- **< 8 m/s**: Normal arterial elasticity
- **8-10 m/s**: Borderline stiffness
- **> 10 m/s**: Increased arterial stiffness

## Usage

1. Enter your blood pressure readings (systolic and diastolic)
2. Optionally enter pulse wave velocity if you have the measurement
3. Enter your age for proper score adjustment
4. Add any relevant notes
5. Click "Calculate Elasticity Score"
6. Review your results and save the measurement

## Health Benefits

Regular monitoring of arterial elasticity can help:
- Detect early cardiovascular changes
- Track the effectiveness of lifestyle interventions
- Monitor age-related arterial stiffening
- Assess cardiovascular risk factors

## Improvement Strategies

- **Exercise**: Regular aerobic exercise improves arterial elasticity
- **Diet**: Mediterranean diet rich in antioxidants
- **Stress Management**: Chronic stress increases arterial stiffness
- **Sleep**: Adequate quality sleep supports vascular health
- **Smoking Cessation**: Smoking accelerates arterial aging

## Technical Details

- Built with vanilla JavaScript
- Uses Chart.js for data visualization
- Local storage for data persistence
- Responsive design for mobile and desktop
- No external dependencies except Chart.js

## Disclaimer

This tool is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a healthcare provider for medical concerns and before making significant lifestyle changes.