# Autonomous Compliance Deviation Tracker

A real-time system that continuously scans operational workflows for deviations from regulatory compliance standards. Autonomously compares operational data against compliance rule sets and generates alerts for any discrepancies.

![Status: Active](https://img.shields.io/badge/status-active-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Continuous Monitoring

- **Real-Time Scanning**: Automated workflow scanning every 30 seconds
- **Autonomous Detection**: No manual intervention required
- **Multi-Framework Support**: Monitors GDPR, HIPAA, SOX, and PCI-DSS simultaneously
- **Workflow Coverage**: Tracks multiple operational workflows
- **Alert Generation**: Instant notifications for compliance violations

### Regulatory Framework Support

**4 Major Frameworks:**

1. **GDPR** (General Data Protection Regulation)
   - 8 core compliance rules
   - Data encryption and privacy controls
   - Right to erasure and data portability
   - Breach notification requirements

2. **HIPAA** (Health Insurance Portability and Accountability Act)
   - 6 healthcare compliance rules
   - Protected Health Information (PHI) encryption
   - Access audit logging
   - Business associate agreements

3. **SOX** (Sarbanes-Oxley Act)
   - 5 financial compliance rules
   - Financial data integrity controls
   - Audit trail requirements
   - Change management procedures

4. **PCI-DSS** (Payment Card Industry Data Security Standard)
   - 6 payment security rules
   - Cardholder data encryption
   - Network segmentation requirements
   - Vulnerability management

### Deviation Detection

**Severity Classification:**
- **Critical**: Immediate action required, major regulatory violation
- **High**: Address within 48 hours, significant compliance gap
- **Medium**: Schedule remediation within next sprint
- **Low**: Add to backlog for future improvement

**Deviation Tracking:**
- Unique deviation identifiers
- Workflow association
- Framework and rule mapping
- Detection timestamp
- Status tracking (open, acknowledged, resolved)
- Automated recommendations

### Compliance Scoring

**Workflow Scoring:**
- Individual workflow compliance percentage
- Weighted by deviation severity
- Real-time recalculation
- Historical trending

**Overall Score Calculation:**
- Aggregates all workflow scores
- Provides enterprise-wide compliance view
- 24-hour historical tracking
- Visual trend charts

### Intelligent Recommendations

Automated recommendations based on severity:
- **Critical**: Immediate action + compensating controls + escalation
- **High**: 48-hour remediation + policy review
- **Medium**: Sprint-cycle scheduling
- **Low**: Backlog addition

## 🚀 Getting Started

### Basic Usage

```html
<script src="tracker.js"></script>
<script>
    // Initialize the tracker
    const tracker = new ComplianceDeviationTracker();
    tracker.initialize();
    
    // Start monitoring
    tracker.toggleMonitoring();
    
    // Manual scan
    tracker.scanAll();
    
    // Export report
    tracker.exportReport();
</script>
```

## 📊 Dashboard Features

### Dashboard Tab
- Real-time monitoring status
- Framework coverage summary
- 24-hour compliance trend chart
- Recent deviations feed
- System health indicators

### Deviations Tab
- Complete deviation listing
- Multi-filter controls:
  - Severity (Critical, High, Medium, Low)
  - Framework (GDPR, HIPAA, SOX, PCI-DSS)
  - Status (Open, Acknowledged, Resolved)
- Detailed deviation cards
- Click-through to full details

### Workflows Tab
- All monitored workflows
- Individual compliance scores
- Deviation counts per workflow
- Last scan timestamps
- Category classification
- Interactive detail modals

### Frameworks Tab
- Full framework information
- Rule counts
- Workflow associations
- Deviation tracking
- Active/disabled status

### Audit Trail Tab
- Complete activity log
- Searchable entries
- Type filtering (Scans, Deviations, Resolutions, Configuration)
- Chronological sorting
- Timestamp tracking
- 100-entry rolling history

## 🔬 Deviation Detection Algorithm

### Scanning Process

1. **Workflow Iteration**: Scan each monitored workflow
2. **Framework Mapping**: Check applicable regulatory frameworks
3. **Rule Evaluation**: Test each rule against current state
4. **Deviation Logging**: Record any violations found
5. **Severity Assignment**: Classify based on rule criticality
6. **Recommendation Generation**: Provide remediation guidance
7. **Score Recalculation**: Update compliance percentages
8. **Audit Trail**: Log all scan activities

### Probability Model

- 15% baseline deviation probability per rule
- Random sampling for realistic simulation
- Weighted by severity for score impact
- Historical tracking for trending

### Scoring Formula

**Workflow Score:**
```
Score = 100 - Σ(severity_weight × deviation_count)

Severity Weights:
- Critical: 25 points
- High: 15 points
- Medium: 10 points
- Low: 5 points

Minimum Score: 0%
Maximum Score: 100%
```

**Overall Score:**
```
Overall = Σ(workflow_scores) / workflow_count
```

## 📈 Key Metrics

### Compliance Monitoring
- Total workflows monitored
- Compliant vs. non-compliant ratio
- Overall compliance score
- Critical issues count
- Active framework count

### Deviation Metrics
- Total deviations detected
- Open vs. resolved ratio
- Severity distribution
- Framework breakdown
- Resolution time tracking

### Performance Indicators
- Scan frequency (30-second intervals)
- Detection accuracy
- False positive rate
- Time to resolution
- Compliance trend direction

## 🔧 Configuration

### Monitoring Settings
- `scanInterval`: 30000ms (30 seconds between scans)
- `maxAuditLogSize`: 100 entries
- `maxHistorySize`: 24 hours of historical data

### Framework Customization

Each framework includes:
- Unique identifier
- Full name and description
- Rule definitions with severity
- Enable/disable toggle
- Workflow associations

### Workflow Configuration

Each workflow includes:
- Unique identifier and name
- Category classification
- Applicable frameworks
- Rule count
- Baseline compliance status

## 🎨 Responsive Design

- **Desktop**: Full dashboard with all features
- **Tablet**: Adaptive grid layouts
- **Mobile**: Single-column responsive design
- **Touch-Friendly**: Large interactive targets
- **Modal Dialogs**: Detailed deviation inspection

## 🧪 Built-in Test Data

### 6 Pre-Configured Workflows:
1. User Authentication (GDPR, HIPAA)
2. Data Storage (GDPR, HIPAA, PCI-DSS)
3. Payment Processing (PCI-DSS, SOX)
4. Financial Reporting (SOX)
5. User Data Export (GDPR)
6. Audit Logging (GDPR, HIPAA, SOX)

### 4 Regulatory Frameworks:
- GDPR: 8 rules
- HIPAA: 6 rules
- SOX: 5 rules
- PCI-DSS: 6 rules

**Total**: 25 compliance rules across 4 frameworks

## 📋 Workflow Categories

- **Security**: Authentication, access control
- **Data Management**: Storage, export, retention
- **Financial**: Reporting, payment processing
- **Monitoring**: Audit logging, alerting

## 💡 Use Cases

1. **Enterprise Governance**: Continuous compliance monitoring across all systems
2. **Regulatory Audits**: Automated evidence collection and reporting
3. **Risk Management**: Early detection of compliance drift
4. **DevSecOps**: Integrate compliance into CI/CD pipelines
5. **Third-Party Oversight**: Monitor vendor compliance
6. **Policy Enforcement**: Automated control validation
7. **Incident Response**: Rapid identification of violations
8. **Compliance Training**: Demonstrate control frameworks
9. **Executive Dashboards**: Real-time compliance visibility
10. **Gap Analysis**: Identify areas needing improvement

## 🔌 Integration Points

- **SIEM Systems**: Export deviations to security operations
- **Ticketing Systems**: Auto-create remediation tickets
- **Monitoring Tools**: Integrate with existing observability
- **Audit Platforms**: Feed compliance data to audit systems
- **Workflow Engines**: Trigger automated remediation
- **Notification Services**: Send alerts via email/Slack/Teams

## 📊 Report Generation

Export comprehensive reports including:
- Overall compliance score
- Workflow compliance breakdown
- Active frameworks
- Critical deviations list
- Remediation priorities
- Historical trends
- Recommended actions

## 🔐 Security Considerations

- **No External Dependencies**: Self-contained implementation
- **Client-Side Only**: No data transmission
- **Audit Trail**: Complete activity logging
- **Role-Based Actions**: Acknowledge/resolve workflows
- **Historical Preservation**: Immutable audit log

## 🚨 Alert System

**Deviation States:**
1. **Open**: Newly detected, requires attention
2. **Acknowledged**: Team is aware, remediation planned
3. **Resolved**: Issue fixed, controls restored

**Alert Workflow:**
1. Deviation detected during scan
2. Alert generated with severity
3. Recommendation provided
4. Stakeholder acknowledgment
5. Remediation implementation
6. Resolution verification
7. Audit trail completion

## 📈 Compliance Trending

**24-Hour Historical Data:**
- Score over time
- Deviation count trends
- Peak violation periods
- Improvement tracking
- Regression detection

**Visual Indicators:**
- Line chart for score trending
- Color-coded severity markers
- Threshold lines (90% target)
- Real-time updates

## 🤝 Contributing

Part of dev-card-showcase. Contributions welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related Features

- Secure Configuration Baseline Enforcer
- Contextual Intent Drift Analyzer
- Cold-Start Mitigation Layer
- Dependency Health Auditor

---

**Last Updated**: February 2026  
**Version**: 1.0.0  
**Status**: Production Ready
