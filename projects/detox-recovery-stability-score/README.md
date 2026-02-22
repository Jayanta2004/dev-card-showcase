# Detox Recovery Stability Score

A web application to monitor and track recovery stability after detoxification. This tool helps individuals assess their progress through daily assessments of key recovery metrics.

## Features

- **Daily Assessment Form**: Track energy levels, mood stability, craving intensity, sleep quality, and physical symptoms
- **Stability Score Calculation**: Automated calculation of recovery stability score based on weighted metrics
- **Progress Visualization**: Chart showing stability trends over time
- **Statistics Dashboard**: View average stability, best scores, total assessments, and recovery days
- **Assessment History**: Review recent assessments with detailed metrics
- **Local Storage**: Data persists locally in the browser

## How It Works

The stability score is calculated using a weighted formula:
- Energy Level: 25%
- Mood Stability: 25%
- Craving Intensity (inverted): 20%
- Sleep Quality: 15%
- Physical Symptoms (inverted): 15%

Higher scores indicate better recovery stability.

## Usage

1. Open `index.html` in a web browser
2. Fill out the daily assessment form with your current metrics
3. Click "Log Assessment" to save your data
4. View your stability score, statistics, and trends

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Chart.js for data visualization
- Local Storage API for data persistence

## Score Interpretation

- **80-100**: Excellent stability - Recovery progressing well!
- **60-79**: Good stability - Keep up the good work!
- **40-59**: Moderate stability - Focus on self-care and support
- **0-39**: Low stability - Consider professional support

## Privacy

All data is stored locally in your browser's local storage. No data is transmitted or stored on external servers.