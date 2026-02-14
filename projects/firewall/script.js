        // Initialize variables
        let rules = [];
        let trafficLog = [];
        let allowedCount = 0;
        let blockedCount = 0;
        let packetAnimation = null;
        
        // DOM Elements
        const ruleForm = document.getElementById('ruleForm');
        const rulesList = document.getElementById('rulesList');
        const emptyRules = document.getElementById('emptyRules');
        const trafficLogElement = document.getElementById('trafficLog');
        const emptyLog = document.getElementById('emptyLog');
        const allowedCountElement = document.getElementById('allowedCount');
        const blockedCountElement = document.getElementById('blockedCount');
        const totalRulesElement = document.getElementById('totalRules');
        const testCoverageElement = document.getElementById('testCoverage');
        const packet = document.getElementById('packet');
        const resetRulesButton = document.getElementById('resetRules');
        
        // Test traffic buttons
        document.getElementById('testWeb').addEventListener('click', () => testTraffic('http', 'any', '10.0.0.1:80'));
        document.getElementById('testSSH').addEventListener('click', () => testTraffic('tcp', 'any', '10.0.0.1:22'));
        document.getElementById('testDNS').addEventListener('click', () => testTraffic('udp', 'any', '10.0.0.1:53'));
        document.getElementById('testCustom').addEventListener('click', testCustomTraffic);
        
        // Load sample rules on first load
        window.addEventListener('DOMContentLoaded', () => {
            loadSampleRules();
            updateStats();
        });
        
        // Handle form submission
        ruleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const rule = {
                id: Date.now(),
                name: document.getElementById('ruleName').value,
                action: document.getElementById('action').value,
                protocol: document.getElementById('protocol').value,
                source: document.getElementById('source').value,
                destination: document.getElementById('destination').value,
                hits: 0
            };
            
            addRule(rule);
            ruleForm.reset();
            document.getElementById('source').value = 'any';
        });
        
        // Reset all rules
        resetRulesButton.addEventListener('click', function() {
            if (rules.length > 0 && confirm("Are you sure you want to clear all firewall rules?")) {
                rules = [];
                trafficLog = [];
                allowedCount = 0;
                blockedCount = 0;
                updateRulesList();
                updateTrafficLog();
                updateStats();
                resetPacketAnimation();
            }
        });
        
        // Add a new rule
        function addRule(rule) {
            rules.unshift(rule); // Add to beginning of array
            updateRulesList();
            updateStats();
        }
        
        // Delete a rule
        function deleteRule(id) {
            rules = rules.filter(rule => rule.id !== id);
            updateRulesList();
            updateStats();
        }
        
        // Update the rules list display
        function updateRulesList() {
            if (rules.length === 0) {
                emptyRules.style.display = 'block';
                rulesList.innerHTML = '';
                rulesList.appendChild(emptyRules);
                return;
            }
            
            emptyRules.style.display = 'none';
            
            let rulesHTML = '';
            rules.forEach(rule => {
                const protocolClass = `protocol-${rule.protocol}`;
                const statusClass = rule.action === 'allow' ? 'status-allow' : 'status-deny';
                const statusText = rule.action === 'allow' ? 'ALLOW' : 'DENY';
                
                rulesHTML += `
                    <div class="rule-item">
                        <div class="rule-details">
                            <h4>${rule.name} <span class="rule-status ${statusClass}">${statusText}</span></h4>
                            <p>
                                <span class="badge ${protocolClass}">${rule.protocol.toUpperCase()}</span>
                                From: <strong>${rule.source}</strong> → To: <strong>${rule.destination}</strong>
                            </p>
                            <p><small>Hits: ${rule.hits} | Created: ${new Date(rule.id).toLocaleTimeString()}</small></p>
                        </div>
                        <div class="rule-actions">
                            <button class="rule-action-btn delete-btn" onclick="deleteRule(${rule.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            
            rulesList.innerHTML = rulesHTML;
        }
        
        // Test traffic against rules
        function testTraffic(protocol, source, destination) {
            // Reset packet animation
            resetPacketAnimation();
            
            // Find matching rule (first match applies)
            let matchedRule = null;
            let action = 'deny'; // Default deny
            let ruleHit = false;
            
            for (const rule of rules) {
                // Check if protocol matches
                if (rule.protocol !== protocol && rule.protocol !== 'any') continue;
                
                // Check if source matches
                if (rule.source !== 'any' && rule.source !== source) continue;
                
                // Check if destination matches (simplified check)
                if (!destination.includes(rule.destination) && rule.destination !== 'any') continue;
                
                // Rule matches!
                matchedRule = rule;
                action = rule.action;
                rule.hits++;
                ruleHit = true;
                break;
            }
            
            // Create log entry
            const logEntry = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                protocol,
                source,
                destination,
                action,
                ruleName: matchedRule ? matchedRule.name : 'No matching rule'
            };
            
            trafficLog.unshift(logEntry);
            
            // Update counters
            if (action === 'allow') {
                allowedCount++;
                animatePacket(true);
            } else {
                blockedCount++;
                animatePacket(false);
            }
            
            // Update displays
            updateTrafficLog();
            updateRulesList();
            updateStats();
        }
        
        // Test custom traffic
        function testCustomTraffic() {
            const input = document.getElementById('customTraffic').value.trim();
            if (!input) {
                alert('Please enter traffic parameters in the format: protocol,source,destination');
                return;
            }
            
            const parts = input.split(',');
            if (parts.length !== 3) {
                alert('Invalid format. Please use: protocol,source,destination');
                return;
            }
            
            const protocol = parts[0].trim();
            const source = parts[1].trim();
            const destination = parts[2].trim();
            
            testTraffic(protocol, source, destination);
        }
        
        // Update traffic log display
        function updateTrafficLog() {
            if (trafficLog.length === 0) {
                emptyLog.style.display = 'block';
                trafficLogElement.innerHTML = '';
                trafficLogElement.appendChild(emptyLog);
                return;
            }
            
            emptyLog.style.display = 'none';
            
            let logHTML = '';
            trafficLog.forEach(entry => {
                const logClass = entry.action === 'allow' ? 'allowed' : 'blocked';
                const icon = entry.action === 'allow' ? 'fa-check-circle' : 'fa-times-circle';
                
                logHTML += `
                    <div class="log-entry ${logClass}">
                        <i class="fas ${icon} log-icon"></i>
                        <div>
                            <strong>[${entry.timestamp}]</strong> ${entry.action.toUpperCase()} ${entry.protocol.toUpperCase()} 
                            from ${entry.source} to ${entry.destination}
                            <div><small>Rule: ${entry.ruleName}</small></div>
                        </div>
                    </div>
                `;
            });
            
            trafficLogElement.innerHTML = logHTML;
        }
        
        // Update statistics
        function updateStats() {
            allowedCountElement.textContent = allowedCount;
            blockedCountElement.textContent = blockedCount;
            totalRulesElement.textContent = rules.length;
            
            // Calculate test coverage (percentage of rules that have been hit)
            const hitRules = rules.filter(rule => rule.hits > 0).length;
            const coverage = rules.length > 0 ? Math.round((hitRules / rules.length) * 100) : 0;
            testCoverageElement.textContent = `${coverage}%`;
        }
        
        // Animate packet through the visualization
        function animatePacket(allowed) {
            // Reset packet position
            packet.style.left = '160px';
            packet.style.backgroundColor = allowed ? '#66ff99' : '#ff5e62';
            
            // Clear any existing animation
            if (packetAnimation) {
                clearInterval(packetAnimation);
            }
            
            // Animate packet movement
            let position = 160;
            const firewallPosition = 550; // Approximate position of firewall
            const destinationPosition = 1150; // Approximate position of destination
            
            packetAnimation = setInterval(() => {
                position += 8;
                
                // If packet reaches firewall
                if (position >= firewallPosition - 15 && position <= firewallPosition + 15) {
                    // Pause briefly at firewall
                    setTimeout(() => {
                        // Continue if allowed, stop if blocked
                        if (allowed) {
                            packet.style.left = `${destinationPosition}px`;
                            setTimeout(() => {
                                packet.style.left = '160px';
                                clearInterval(packetAnimation);
                            }, 500);
                        } else {
                            // Packet blocked - bounce back
                            const bounceBack = setInterval(() => {
                                position -= 5;
                                packet.style.left = `${position}px`;
                                
                                if (position <= 200) {
                                    clearInterval(bounceBack);
                                    clearInterval(packetAnimation);
                                }
                            }, 20);
                        }
                    }, 300);
                }
                
                packet.style.left = `${position}px`;
                
                // Stop animation when packet reaches destination or goes back to source
                if (position >= destinationPosition || position <= 170) {
                    clearInterval(packetAnimation);
                }
            }, 20);
        }
        
        // Reset packet animation
        function resetPacketAnimation() {
            if (packetAnimation) {
                clearInterval(packetAnimation);
            }
            packet.style.left = '160px';
            packet.style.backgroundColor = '#ff9966';
        }
        
        // Load sample rules for demonstration
        function loadSampleRules() {
            const sampleRules = [
                {
                    id: Date.now() - 10000,
                    name: "Allow Web Access",
                    action: "allow",
                    protocol: "http",
                    source: "any",
                    destination: "10.0.0.1:80",
                    hits: 0
                },
                {
                    id: Date.now() - 20000,
                    name: "Block FTP",
                    action: "deny",
                    protocol: "tcp",
                    source: "any",
                    destination: "10.0.0.1:21",
                    hits: 0
                },
                {
                    id: Date.now() - 30000,
                    name: "Allow Secure Web",
                    action: "allow",
                    protocol: "https",
                    source: "any",
                    destination: "10.0.0.1:443",
                    hits: 0
                },
                {
                    id: Date.now() - 40000,
                    name: "Restrict Admin SSH",
                    action: "allow",
                    protocol: "tcp",
                    source: "192.168.1.100",
                    destination: "10.0.0.1:22",
                    hits: 0
                }
            ];
            
            sampleRules.forEach(rule => addRule(rule));
            
            // Add some sample traffic log entries
            trafficLog = [
                {
                    id: Date.now() - 5000,
                    timestamp: new Date(Date.now() - 5000).toLocaleTimeString(),
                    protocol: "http",
                    source: "192.168.1.50",
                    destination: "10.0.0.1:80",
                    action: "allow",
                    ruleName: "Allow Web Access"
                },
                {
                    id: Date.now() - 10000,
                    timestamp: new Date(Date.now() - 10000).toLocaleTimeString(),
                    protocol: "tcp",
                    source: "192.168.1.75",
                    destination: "10.0.0.1:21",
                    action: "deny",
                    ruleName: "Block FTP"
                },
                {
                    id: Date.now() - 15000,
                    timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
                    protocol: "tcp",
                    source: "192.168.1.200",
                    destination: "10.0.0.1:22",
                    action: "deny",
                    ruleName: "No matching rule"
                }
            ];
            
            allowedCount = 1;
            blockedCount = 2;
            
            updateTrafficLog();
        }