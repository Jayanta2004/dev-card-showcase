
        // DOM Elements
        const userAgentsContainer = document.getElementById('user-agents-container');
        const addUserAgentBtn = document.getElementById('add-user-agent-btn');
        const generateBtn = document.getElementById('generate-btn');
        const copyBtn = document.getElementById('copy-btn');
        const downloadBtn = document.getElementById('download-btn');
        const resetBtn = document.getElementById('reset-btn');
        const robotsOutput = document.getElementById('robots-output');
        const sitemapUrlInput = document.getElementById('sitemap-url');
        const customDirectivesInput = document.getElementById('custom-directives');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        // Example robots.txt configurations
        const examples = {
            'allow-all': {
                sitemap: 'https://example.com/sitemap.xml',
                userAgents: [
                    { agent: '*', disallowPaths: [], allowAll: true }
                ],
                globalDisallow: [],
                allowRoot: true
            },
            'disallow-all': {
                sitemap: '',
                userAgents: [
                    { agent: '*', disallowPaths: ['/'], allowAll: false }
                ],
                globalDisallow: [],
                allowRoot: false
            },
            'disallow-private': {
                sitemap: 'https://example.com/sitemap.xml',
                userAgents: [
                    { agent: '*', disallowPaths: [], allowAll: true }
                ],
                globalDisallow: ['/admin/', '/private/', '/tmp/', '/logs/'],
                allowRoot: true
            },
            'specific-agents': {
                sitemap: 'https://example.com/sitemap.xml',
                userAgents: [
                    { agent: 'Googlebot', disallowPaths: ['/nogooglebot/'], allowAll: true },
                    { agent: '*', disallowPaths: [], allowAll: true }
                ],
                globalDisallow: [],
                allowRoot: true
            }
        };
        
        // User agents data
        const userAgents = [
            { id: 1, agent: '*', disallowPaths: [], allowAll: true },
            { id: 2, agent: 'Googlebot', disallowPaths: [], allowAll: true }
        ];
        
        let nextId = 3;
        
        // Initialize the UI
        function init() {
            renderUserAgents();
            generateRobotsTxt();
            
            // Add event listeners to example cards
            document.querySelectorAll('.example-card').forEach(card => {
                card.addEventListener('click', () => {
                    const exampleType = card.dataset.example;
                    loadExample(exampleType);
                    showNotification(`Loaded "${card.querySelector('h4').textContent}" example`);
                });
            });
        }
        
        // Render user agents in the UI
        function renderUserAgents() {
            userAgentsContainer.innerHTML = '';
            
            userAgents.forEach(userAgent => {
                const agentElement = document.createElement('div');
                agentElement.className = 'user-agent-item';
                agentElement.innerHTML = `
                    <div style="flex-grow: 1;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                            <span style="font-weight: 600; min-width: 120px;">User-agent:</span>
                            <input type="text" class="agent-input" value="${userAgent.agent}" data-id="${userAgent.id}" style="width: 200px;">
                        </div>
                        ${userAgent.disallowPaths.map(path => `
                            <div class="disallow-input">
                                <span style="font-weight: 600; min-width: 120px;">Disallow:</span>
                                <input type="text" class="path-input" value="${path}" data-id="${userAgent.id}">
                                <button class="remove-btn remove-path-btn" data-path="${path}" data-id="${userAgent.id}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                        <div class="disallow-input">
                            <span style="font-weight: 600; min-width: 120px;">Disallow:</span>
                            <input type="text" class="new-path-input" placeholder="/path/to/block/" data-id="${userAgent.id}">
                            <button class="add-btn add-path-btn" data-id="${userAgent.id}">
                                <i class="fas fa-plus"></i> Add
                            </button>
                        </div>
                    </div>
                    <button class="remove-btn remove-agent-btn" data-id="${userAgent.id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                `;
                
                userAgentsContainer.appendChild(agentElement);
            });
            
            // Add event listeners to dynamic elements
            document.querySelectorAll('.agent-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    const agent = e.target.value;
                    updateUserAgent(id, { agent });
                });
            });
            
            document.querySelectorAll('.path-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    const oldPath = e.target.defaultValue;
                    const newPath = e.target.value;
                    updateDisallowPath(id, oldPath, newPath);
                });
            });
            
            document.querySelectorAll('.new-path-input').forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        addDisallowPath(parseInt(e.target.dataset.id), e.target.value);
                        e.target.value = '';
                    }
                });
            });
            
            document.querySelectorAll('.add-path-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id || e.target.closest('button').dataset.id);
                    const input = document.querySelector(`.new-path-input[data-id="${id}"]`);
                    addDisallowPath(id, input.value);
                    input.value = '';
                });
            });
            
            document.querySelectorAll('.remove-path-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id || e.target.closest('button').dataset.id);
                    const path = e.target.dataset.path || e.target.closest('button').dataset.path;
                    removeDisallowPath(id, path);
                });
            });
            
            document.querySelectorAll('.remove-agent-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id || e.target.closest('button').dataset.id);
                    removeUserAgent(id);
                });
            });
        }
        
        // Add a new user agent
        function addUserAgent() {
            userAgents.push({
                id: nextId++,
                agent: 'Bingbot',
                disallowPaths: [],
                allowAll: true
            });
            renderUserAgents();
            generateRobotsTxt();
        }
        
        // Remove a user agent
        function removeUserAgent(id) {
            if (userAgents.length <= 1) {
                showNotification('You must have at least one user agent');
                return;
            }
            
            const index = userAgents.findIndex(agent => agent.id === id);
            if (index !== -1) {
                userAgents.splice(index, 1);
                renderUserAgents();
                generateRobotsTxt();
            }
        }
        
        // Update user agent properties
        function updateUserAgent(id, updates) {
            const index = userAgents.findIndex(agent => agent.id === id);
            if (index !== -1) {
                userAgents[index] = { ...userAgents[index], ...updates };
                generateRobotsTxt();
            }
        }
        
        // Add a disallow path to a user agent
        function addDisallowPath(id, path) {
            if (!path.trim()) return;
            
            // Ensure path starts with /
            if (!path.startsWith('/')) {
                path = '/' + path;
            }
            
            const index = userAgents.findIndex(agent => agent.id === id);
            if (index !== -1 && !userAgents[index].disallowPaths.includes(path)) {
                userAgents[index].disallowPaths.push(path);
                renderUserAgents();
                generateRobotsTxt();
            }
        }
        
        // Update a disallow path
        function updateDisallowPath(id, oldPath, newPath) {
            if (!newPath.trim()) {
                removeDisallowPath(id, oldPath);
                return;
            }
            
            // Ensure path starts with /
            if (!newPath.startsWith('/')) {
                newPath = '/' + newPath;
            }
            
            const index = userAgents.findIndex(agent => agent.id === id);
            if (index !== -1) {
                const pathIndex = userAgents[index].disallowPaths.indexOf(oldPath);
                if (pathIndex !== -1) {
                    userAgents[index].disallowPaths[pathIndex] = newPath;
                    generateRobotsTxt();
                }
            }
        }
        
        // Remove a disallow path
        function removeDisallowPath(id, path) {
            const index = userAgents.findIndex(agent => agent.id === id);
            if (index !== -1) {
                const pathIndex = userAgents[index].disallowPaths.indexOf(path);
                if (pathIndex !== -1) {
                    userAgents[index].disallowPaths.splice(pathIndex, 1);
                    renderUserAgents();
                    generateRobotsTxt();
                }
            }
        }
        
        // Generate the robots.txt content
        function generateRobotsTxt() {
            let output = '';
            
            // Get global directives
            const globalDisallow = [];
            if (document.getElementById('disallow-admin').checked) globalDisallow.push('/admin/');
            if (document.getElementById('disallow-cgi').checked) globalDisallow.push('/cgi-bin/');
            if (document.getElementById('disallow-tmp').checked) globalDisallow.push('/tmp/');
            if (document.getElementById('disallow-log').checked) globalDisallow.push('/logs/');
            
            // Add user agents
            userAgents.forEach(userAgent => {
                output += `User-agent: ${userAgent.agent}\n`;
                
                // Add disallow paths for this agent
                userAgent.disallowPaths.forEach(path => {
                    output += `Disallow: ${path}\n`;
                });
                
                // Add global disallow paths for all agents
                if (userAgent.agent === '*') {
                    globalDisallow.forEach(path => {
                        output += `Disallow: ${path}\n`;
                    });
                }
                
                // Add allow root directive if checked
                if (document.getElementById('allow-root').checked && userAgent.disallowPaths.length === 0 && globalDisallow.length === 0) {
                    output += `Allow: /\n`;
                }
                
                output += '\n';
            });
            
            // Add sitemap if provided
            const sitemapUrl = sitemapUrlInput.value.trim();
            if (sitemapUrl) {
                output += `Sitemap: ${sitemapUrl}\n`;
            }
            
            // Add custom directives
            const customDirectives = customDirectivesInput.value.trim();
            if (customDirectives) {
                if (output.trim() !== '' && !output.endsWith('\n\n')) {
                    output += '\n';
                }
                output += customDirectives + '\n';
            }
            
            robotsOutput.value = output;
        }
        
        // Copy robots.txt to clipboard
        function copyToClipboard() {
            robotsOutput.select();
            robotsOutput.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    showNotification('Robots.txt copied to clipboard!');
                } else {
                    showNotification('Failed to copy. Please try again.');
                }
            } catch (err) {
                // Fallback using Clipboard API
                navigator.clipboard.writeText(robotsOutput.value)
                    .then(() => showNotification('Robots.txt copied to clipboard!'))
                    .catch(() => showNotification('Failed to copy. Please try again.'));
            }
        }
        
        // Download robots.txt as a file
        function downloadRobotsTxt() {
            const content = robotsOutput.value;
            if (!content.trim()) {
                showNotification('Please generate robots.txt content first');
                return;
            }
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'robots.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Robots.txt file downloaded!');
        }
        
        // Reset the form to default values
        function resetForm() {
            // Clear user agents and reset to default
            userAgents.length = 0;
            userAgents.push(
                { id: 1, agent: '*', disallowPaths: [], allowAll: true },
                { id: 2, agent: 'Googlebot', disallowPaths: [], allowAll: true }
            );
            nextId = 3;
            
            // Reset inputs
            sitemapUrlInput.value = '';
            customDirectivesInput.value = '';
            
            // Reset checkboxes
            document.getElementById('disallow-admin').checked = true;
            document.getElementById('disallow-cgi').checked = true;
            document.getElementById('disallow-tmp').checked = true;
            document.getElementById('disallow-log').checked = true;
            document.getElementById('allow-root').checked = true;
            
            // Regenerate
            renderUserAgents();
            generateRobotsTxt();
            
            showNotification('Form reset to default values');
        }
        
        // Load an example configuration
        function loadExample(exampleType) {
            const example = examples[exampleType];
            if (!example) return;
            
            // Update user agents
            userAgents.length = 0;
            example.userAgents.forEach((agent, index) => {
                userAgents.push({
                    id: index + 1,
                    agent: agent.agent,
                    disallowPaths: [...agent.disallowPaths],
                    allowAll: agent.allowAll
                });
            });
            nextId = userAgents.length + 1;
            
            // Update sitemap
            sitemapUrlInput.value = example.sitemap;
            
            // Update checkboxes based on example
            document.getElementById('allow-root').checked = example.allowRoot;
            
            // Update global disallow checkboxes
            document.getElementById('disallow-admin').checked = example.globalDisallow.includes('/admin/');
            document.getElementById('disallow-cgi').checked = example.globalDisallow.includes('/cgi-bin/');
            document.getElementById('disallow-tmp').checked = example.globalDisallow.includes('/tmp/');
            document.getElementById('disallow-log').checked = example.globalDisallow.includes('/logs/');
            
            // Clear custom directives
            customDirectivesInput.value = '';
            
            // Regenerate
            renderUserAgents();
            generateRobotsTxt();
        }
        
        // Show notification
        function showNotification(message) {
            notificationText.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Event Listeners
        addUserAgentBtn.addEventListener('click', addUserAgent);
        generateBtn.addEventListener('click', generateRobotsTxt);
        copyBtn.addEventListener('click', copyToClipboard);
        downloadBtn.addEventListener('click', downloadRobotsTxt);
        resetBtn.addEventListener('click', resetForm);
        
        // Update robots.txt when any input changes
        document.querySelectorAll('input[type="checkbox"], input[type="text"], textarea').forEach(element => {
            element.addEventListener('change', generateRobotsTxt);
            element.addEventListener('input', generateRobotsTxt);
        });
        
        // Initialize the application
        init();
