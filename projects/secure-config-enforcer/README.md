# Secure Configuration Baseline Enforcer

A comprehensive system for enforcing standardized configuration baselines across environments, detecting violations, and ensuring consistent security and operational policies.

![Status: Active](https://img.shields.io/badge/status-active-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Configuration Baselines

Three pre-configured baselines for different environments:

1. **Production Baseline**
   - Strictest security requirements
   - Encryption mandatory
   - TLS 1.3 required
   - Multi-factor authentication enabled
   - Debug mode disabled
   - Full audit logging

2. **Staging Baseline**
   - Balanced security
   - TLS 1.2+ allowed
   - MFA optional
   - Debug mode controlled
   - Relaxed rate limiting

3. **Development Baseline**
   - Developer-friendly
   - Testing features allowed
   - Debug mode permitted
   - Flexible rate limiting
   - Local testing support

### Compliance Monitoring

- **Real-time Validation**: Continuous checking against baselines
- **Automated Violations**: Instant detection of non-compliance
- **Environment Status**: Compliant, Non-compliant, or Critical
- **Compliance Score**: Overall infrastructure compliance percentage
- **Violation Categorization**: By severity and type

### Violation Management

Four severity levels:
- **Critical**: Security-critical violations
- **High**: Important security/operational issues
- **Medium**: Notable deviations
- **Low**: Best practice recommendations

### Auto-Remediation

- Single-violation fixes
- Bulk environment remediation
- Automatic configuration correction
- Audit trail of remediation actions

### Policy Management

Four core policies:

1. **🔐 Encryption Policy**
   - Data at rest encryption
   - TLS version control
   - Database SSL enforcement

2. **👤 Authentication Policy**
   - MFA requirements
   - TLS standards
   - Credential management

3. **📝 Logging & Audit Policy**
   - Comprehensive logging
   - Audit trail maintenance
   - Event tracking

4. **🛡️ Security Policy**
   - Debug mode control
   - CORS restrictions
   - Rate limiting

## 🚀 Getting Started

### Basic Usage

```html
<script src="enforcer.js"></script>
<script>
    // Initialize the enforcer
    const enforcer = new ConfigurationBaselineEnforcer();
    enforcer.initialize();
    
    // Validate all environments
    enforcer.validateAll();
    
    // Generate compliance report
    enforcer.generateComplianceReport();
</script>
```

## 📊 Dashboard Features

### Environments Tab
- Environment status overview
- Violation count
- Last validation timestamp
- Quick actions (Validate, Details, Remediate)

### Baselines Tab
- Available configuration baselines
- Version tracking
- Rule count per baseline
- Edit, view, and duplicate options
- Import/Export capabilities

### Violations Tab
- Comprehensive violation list
- Severity filtering
- Environment-based filtering
- Violation details in modal
- Auto-remediation options

### Policies Tab
- All configured policies
- Policy descriptions
- Associated rules
- Edit and view options

### Audit Log Tab
- Complete audit trail
- Event type filtering
- Timestamp tracking
- Action documentation

## 🔒 Configuration Rules

### Encryption Rules
- `encryption.enabled`: Enable/disable encryption
- `tls.version`: Required TLS version (1.2, 1.3)
- `database.ssl`: SSL for database connections

### Authentication Rules
- `auth.mfa`: Multi-factor authentication
- TLS requirements for secure authentication

### Logging Rules
- `logging.enabled`: Application logging
- `audit.enabled`: Audit trail maintenance

### Security Rules
- `debug.mode`: Debug mode enable/disable
- `cors.enabled`: CORS settings
- `api.rateLimit`: Rate limiting configuration
- `timeout.request`: Request timeout values

## 📈 Compliance Scoring

Score calculated as:
```
Compliance Score = (Passed Rules / Total Rules) × 100%
```

Environments rated as:
- **Compliant**: 100% or all critical rules met
- **Non-Compliant**: < 100% but no critical violations
- **Critical**: Any critical severity violations

## 🔧 Remediation Process

### Manual Remediation
1. View violation details
2. Click "Auto-Remediate"
3. System corrects configuration
4. Validation re-runs
5. Audit logged

### Bulk Remediation
1. Select environment
2. Click "Remediate"
3. All violations corrected
4. Compliance re-assessed
5. Changes audited

## 📋 Audit Trail

Every action logged:
- Validations performed
- Violations detected
- Remediations executed
- Syncs completed
- Policy changes

Maintained chronologically with:
- Timestamp
- Action type
- Details
- Associated resources

## 🔐 Security Features

- Baseline versioning
- Change tracking
- Auto-remediation capability
- Policy enforcement
- Comprehensive auditing
- Violation severity classification
- Multi-environment support

## 💼 Use Cases

1. **Regulatory Compliance**: Meet industry standards
2. **Security Hardening**: Enforce security policies
3. **Operational Consistency**: Standardize across infrastructure
4. **Vulnerability Prevention**: Prevent configuration weaknesses
5. **Environment Parity**: Keep environments aligned
6. **Risk Management**: Identify and remediate risks
7. **Audit Readiness**: Maintain compliance evidence

## 🎨 Responsive Design

- Mobile-optimized interface
- Adaptive cards and tables
- Touch-friendly controls
- Flexible layouts

## 📊 Metrics & KPIs

- Compliance Score: Overall infrastructure compliance
- Compliant Environments: Count of fully compliant systems
- Non-Compliant Systems: Count of policy violators
- Critical Issues: Number of security-critical violations
- Violation Distribution: By severity and type

## 🔄 Workflows

### Validation Workflow
1. Run "Validate All"
2. System checks each environment
3. Compares against baselines
4. Identifies violations
5. Updates compliance score
6. Logs validation event

### Remediation Workflow
1. Review violation
2. Click auto-remediate
3. Config corrected to baseline value
4. Re-validate environment
5. Log remediation action
6. Update UI

### Sync Workflow
1. Initiate sync
2. Baselines pushed to all environments
3. Configurations aligned
4. Validations run
5. Report generated

## 📄 Configuration File Structure

```json
{
  "baseline-name": {
    "version": "1.0.0",
    "rules": {
      "rule-name": {
        "required": true,
        "value": expectedValue,
        "severity": "critical|high|medium|low"
      }
    }
  }
}
```

## 🔌 Integration Points

- REST API ready
- JSON data structures
- Real-time validation
- Event logging
- Remediation automation

## 📈 Scalability

- Unlimited environment support
- Bulk operations
- Efficient filtering
- Audit log pagination
- Baseline versioning

## 🧪 Built-in Test Data

- 4 sample environments (Production, Staging, Development)
- 3 baseline configurations
- 4 security policies
- Realistic violation scenarios
- Pre-populated audit log

## 🤝 Contributing

Part of dev-card-showcase. Contributions welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🔗 Related Features

- Dependency Health Auditor
- Predictive Capacity Planner
- Infrastructure Monitoring
- Security Dashboard

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production Ready
