# Sleep Fragmentation Analyzer

A comprehensive sleep quality analysis tool that tracks sleep fragmentation, efficiency, and patterns to help you understand and improve your sleep health.

## Features

- **Sleep Efficiency Calculation**: Measure how much time in bed is actually spent sleeping
- **Fragmentation Index**: Track awakenings per hour of sleep
- **Wake After Sleep Onset (WASO)**: Monitor time spent awake during sleep period
- **Sleep Quality Rating**: Subjective sleep quality assessment
- **Trend Visualization**: Chart sleep metrics over time
- **Comprehensive Logging**: Record bed/wake times, total sleep, and notes
- **Local Data Storage**: All data stored locally in your browser

## How Sleep Fragmentation Works

### Sleep Efficiency
- **Formula**: (Total Sleep Time ÷ Time in Bed) × 100
- **Excellent**: >85%
- **Good**: 75-85%
- **Fair**: 65-74%
- **Poor**: <65%

### Fragmentation Index
- **Formula**: (Number of Awakenings ÷ Total Sleep Time) × 60
- **Low Fragmentation**: <5 awakenings per hour
- **Moderate Fragmentation**: 5-15 awakenings per hour
- **High Fragmentation**: >15 awakenings per hour

### Wake After Sleep Onset (WASO)
- Time spent awake between initial sleep onset and final awakening
- Lower WASO indicates better sleep continuity

## Usage

1. **Log Your Sleep**: Enter bed time, wake time, and total sleep duration
2. **Track Awakenings**: Record how many times you woke up during the night
3. **Note Time Awake**: Estimate total minutes spent awake during sleep period
4. **Rate Quality**: Provide subjective sleep quality rating (1-10)
5. **Add Notes**: Record factors that may have affected sleep
6. **Analyze**: Click "Analyze Sleep Fragmentation" to calculate metrics
7. **Save**: Store the session for trend tracking

## Sleep Health Insights

### Common Fragmentation Causes
- **Environmental Factors**: Noise, light, temperature changes
- **Lifestyle Factors**: Caffeine, alcohol, heavy meals before bed
- **Medical Conditions**: Sleep apnea, restless legs, pain
- **Stress & Anxiety**: Mental tension disrupting sleep
- **Age-Related Changes**: Natural sleep changes with aging

### Improvement Strategies
- **Consistent Schedule**: Same bedtime and wake time daily
- **Sleep Environment**: Cool, dark, quiet bedroom
- **Pre-Bed Routine**: Relaxing activities before sleep
- **Dietary Adjustments**: Limit caffeine and heavy meals
- **Stress Management**: Address anxiety and tension
- **Exercise Timing**: Regular exercise but not close to bedtime

## Benefits

- **Identify Patterns**: Recognize what affects your sleep quality
- **Track Progress**: Monitor improvements over time
- **Optimize Habits**: Make data-driven sleep hygiene changes
- **Health Awareness**: Better understand sleep health indicators
- **Prevent Issues**: Early detection of sleep fragmentation problems

## Technical Details

- Built with vanilla JavaScript
- Uses Chart.js for trend visualization
- Local storage for data persistence
- Responsive design for mobile and desktop
- No external dependencies except Chart.js

## Data Privacy

All sleep data is stored locally in your browser's local storage. No data is transmitted to external servers or shared with third parties. You have complete control over your sleep information.

## Disclaimer

This tool is for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. If you have concerns about your sleep quality or suspect a sleep disorder, consult a qualified healthcare provider or sleep specialist.