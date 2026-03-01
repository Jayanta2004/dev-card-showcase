# Contextual Intent Drift Analyzer

An intelligent system for detecting gradual shifts in user intent during extended interactions through rolling semantic comparison and coherence analysis.

![Status: Active](https://img.shields.io/badge/status-active-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Intent Tracking

- **Initial Intent Capture**: Establishes baseline from first interaction
- **Continuous Monitoring**: Tracks subsequent queries and contexts
- **Rolling Analysis**: Real-time semantic comparison
- **Drift Quantification**: Precise measurement of intent divergence

### Semantic Analysis

Four core metrics:

1. **Semantic Similarity** (0-100%)
   - Compares current query to initial intent
   - Measures vocabulary overlap and concept alignment
   - Threshold: 70% for alignment

2. **Topic Coherence** (0-100%)
   - Analyzes consistency within rolling window
   - Detects topic switching patterns
   - Window size: 5 interactions

3. **Vocabulary Overlap** (0-100%)
   - Measures shared keywords between sessions
   - Identifies semantic distance
   - Reflects domain consistency

4. **Intent Stability** (0-100%)
   - Tracks low-variance drift across interactions
   - Measures predictability of conversation
   - Higher = more stable intent

### Drift Detection

- **Drift Calculation**: |1 - Similarity| × 100%
- **Threshold Alert**: 30% drift triggers warning
- **Critical Threshold**: 50%+ drift = critical shift
- **Real-time Notifications**: Instant alert on significant divergence

### Visualization

#### Timeline Chart
- Visual representation of drift progression
- Coherence trend overlay
- Threshold indicator line
- Granularity options: Per interaction, Rolling window, By phase

#### Drift Map
- 2D heatmap of interaction similarities
- Shows semantic distance between all query pairs
- Highlights clusters of similar intent
- Color intensity = similarity strength

#### Interaction Timeline
- Chronological event markers
- Drift percentage for each interaction
- Keyword tags for quick scanning
- Similarity and coherence at each point

### Phase Detection

Multiple intent phases automatically identified:

1. **Question Phase** - Information gathering
2. **Problem Phase** - Issue identification
3. **Decision Phase** - Solution evaluation
4. **Planning Phase** - Implementation planning

### Alert System

Real-time notifications for:

- **Drift Warning**: Drift > 30%
- **Drift Critical**: Drift > 50%
- **Low Coherence**: Score < 50%
- **Phase Shift**: Intent category change
- **Semantic Divergence**: Vocabulary drift

### Session Management

- Start/stop recording
- Add interactions manually or simulate
- Clear session data
- Export comprehensive reports

## 🚀 Getting Started

### Basic Usage

```html
<script src="analyzer.js"></script>
<script>
    // Initialize the analyzer
    const analyzer = new ContextualIntentDriftAnalyzer();
    analyzer.initialize();
    
    // Start session
    analyzer.startSession();
    
    // Add interaction
    analyzer.addInteraction("How do I optimize database performance?");
    
    // Analyze session
    analyzer.analyzeSession();
</script>
```

## 📊 Dashboard Features

### Timeline Tab
- Drift and coherence chart
- Interactive event timeline
- Granularity selector (Interaction/Window/Phase)
- Per-interaction drift visualization

### Semantic Analysis Tab
- Side-by-side intent comparison
- Keyword similarity matrix
- Four key metrics display
- Vocabulary overlap analysis

### Interaction History Tab
- Complete interaction list
- Individual query details
- Similarity and coherence metrics
- Quick add/clear controls

### Drift Map Tab
- 2D similarity heatmap
- Interaction correlation matrix
- Phase detection summary
- Drift analysis narrative

### Alerts Tab
- Real-time alert log
- Type-based filtering
- Severity indicators
- Timestamp tracking

## 🔬 Semantic Comparison

### Embedding Strategy

**Keyword-Based Representation**
- Extract top keywords from each query
- Weight by frequency and position
- Build semantic vector space
- Compare using Jaccard + overlap metrics

### Similarity Calculation

```
Similarity = (Jaccard × 0.4) + (Overlap × 0.6)
```

- **Jaccard**: Set similarity of keywords
- **Overlap**: Weighted keyword matching
- Combined approach balances coverage and precision

### Coherence Evaluation

Rolling window analysis:
- Compare consecutive interactions
- Average pairwise similarities in window
- Size: 5 interactions
- Detects topic erosion and wandering

## 📈 Key Metrics

### Drift Score
- Range: 0% (aligned) to 100% (completely different)
- Formula: |1 - Similarity| × 100
- Tracks divergence from initial intent

### Intent Alignment
- Range: 0% to 100%
- Inverse of drift score
- Target: ≥ 70%

### Stability
- Range: 0% to 100%
- Inverse of drift variance
- Higher = more predictable conversation

### Coherence
- Range: 0% to 100%
- Measures local topic consistency
- Target: ≥ 80%

## 💡 Use Cases

1. **Customer Support**: Ensure conversations stay on-topic
2. **Technical Interviews**: Track candidate focus and clarity
3. **Requirement Gathering**: Identify scope creep early
4. **User Research**: Understand natural interest shifts
5. **Quality Assurance**: Detect requirement misalignment
6. **Conversation Coaching**: Provide real-time intent feedback
7. **Chat Bot Training**: Improve response relevance

## 🔧 Configuration

### Thresholds
- `driftThreshold`: 30% (warning trigger)
- `coherenceTarget`: 80% (ideal coherence)

### Analysis Parameters
- `windowSize`: 5 interactions
- `minInteractions`: 2 (for analysis)
- `maxAuditLogs`: 100 events

## 📋 Interaction Model

Each interaction captures:

```javascript
{
    id: number,
    query: string,
    timestamp: Date,
    keywords: string[],
    embedding: object,
    similarity: number,
    coherence: number,
    drift: number
}
```

## 🎨 Responsive Design

- Mobile-optimized interface
- Adaptive chart sizing
- Touch-friendly controls
- Flexible gridlayout

## 🔐 Data Structure

### Session Data
- Start time and duration
- Interaction count
- Overall metrics
- Alert log

### Export Format
```json
{
    "sessionInfo": {},
    "metrics": {
        "drift": number,
        "alignment": number,
        "coherence": number,
        "stability": number
    },
    "interactions": [],
    "alerts": []
}
```

## 📊 Visualization Methods

### Canvas-Based Charts
- Real-time drift timeline
- Coherence trend overlay
- 2D similarity heatmap
- No external charting libraries

### Interactive Elements
- Clickable interactions for details
- Modal inspection views
- Filterable alert logs
- Responsive grid layouts

## 🧪 Sample Data

Built-in sample queries for testing:
- Database optimization questions
- Query indexing discussions
- API performance issues
- Database switching decisions
- Cloud migration planning
- Financial analysis queries

## 🔌 Integration Points

- Event-driven updates
- Real-time metric calculation
- Exportable JSON data
- RESTful API ready

## 📈 Analytics

Tracks:
- Drift progression
- Coherence trends
- Phase transitions
- Keyword evolution
- Intent stability

## 🤝 Contributing

Part of dev-card-showcase. Contributions welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related Features

- Secure Configuration Baseline Enforcer
- Dependency Health Auditor
- Predictive Capacity Planner

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production Ready
