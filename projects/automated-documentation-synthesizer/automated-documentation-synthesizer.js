// Automated Documentation Synthesizer JavaScript

class DocumentationSynthesizer {
    constructor() {
        this.currentSection = 'input';
        this.codeInput = '';
        this.uploadedFiles = [];
        this.projectInfo = {};
        this.generationOptions = {};
        this.generatedDocs = {};
        this.templates = {};
        this.currentPreviewTab = 'overview';
        this.isGenerating = false;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTemplates();
        this.showSection('input');
        this.initializePrism();
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Input method tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchInputTab(tabId);
            });
        });

        // Code input
        document.getElementById('codeInput').addEventListener('input', (e) => {
            this.codeInput = e.target.value;
            this.updateCodePreview();
        });

        // File upload
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        document.querySelector('.upload-area').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.querySelector('.upload-area').addEventListener('dragover', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('dragover');
        });

        document.querySelector('.upload-area').addEventListener('dragleave', (e) => {
            e.currentTarget.classList.remove('dragover');
        });

        document.querySelector('.upload-area').addEventListener('drop', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Project info
        document.querySelectorAll('.project-info input, .project-info select, .project-info textarea').forEach(field => {
            field.addEventListener('input', (e) => {
                this.projectInfo[e.target.name] = e.target.value;
            });
        });

        // Generation options
        document.querySelectorAll('.generation-options input[type="checkbox"], .generation-options input[type="radio"]').forEach(option => {
            option.addEventListener('change', (e) => {
                const category = e.target.closest('.option-group').dataset.category;
                if (!this.generationOptions[category]) {
                    this.generationOptions[category] = {};
                }
                if (e.target.type === 'checkbox') {
                    this.generationOptions[category][e.target.name] = e.target.checked;
                } else if (e.target.type === 'radio') {
                    this.generationOptions[category] = e.target.value;
                }
            });
        });

        // Generation controls
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateDocumentation();
        });

        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showSection('preview');
        });

        // Preview tabs
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchPreviewTab(e.target.dataset.tab);
            });
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.exportDocumentation(format);
            });
        });

        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.applyTemplate(template);
            });
        });

        // Modal controls
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => {
                this.closeModal();
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Template builder
        document.getElementById('saveTemplateBtn').addEventListener('click', () => {
            this.saveCustomTemplate();
        });

        document.getElementById('loadTemplateBtn').addEventListener('click', () => {
            this.loadCustomTemplate();
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        this.currentSection = sectionId;
    }

    switchInputTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.input-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (this.isValidFileType(file)) {
                this.uploadedFiles.push(file);
                this.displayFile(file);
            } else {
                this.showMessage(`Invalid file type: ${file.name}. Please upload code files only.`, 'error');
            }
        });
    }

    isValidFileType(file) {
        const validExtensions = ['.js', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.ts', '.html', '.css', '.json', '.xml', '.yml', '.yaml', '.md'];
        const fileName = file.name.toLowerCase();
        return validExtensions.some(ext => fileName.endsWith(ext));
    }

    displayFile(file) {
        const fileList = document.querySelector('.file-list');
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file-code"></i>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
            <i class="fas fa-times remove-file" data-file="${file.name}"></i>
        `;

        fileItem.querySelector('.remove-file').addEventListener('click', () => {
            this.removeFile(file.name);
        });

        fileList.appendChild(fileItem);
    }

    removeFile(fileName) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== fileName);
        document.querySelector(`[data-file="${fileName}"]`).closest('.file-item').remove();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    updateCodePreview() {
        // Update syntax highlighting if Prism is loaded
        if (window.Prism) {
            setTimeout(() => {
                Prism.highlightAll();
            }, 100);
        }
    }

    async generateDocumentation() {
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.showProgress(true);

        try {
            // Collect all input data
            const inputData = await this.collectInputData();

            // Analyze code
            const analysis = await this.analyzeCode(inputData);

            // Generate documentation
            this.generatedDocs = await this.synthesizeDocumentation(analysis);

            // Update preview
            this.updatePreview();

            this.showSection('preview');
            this.showMessage('Documentation generated successfully!', 'success');

        } catch (error) {
            console.error('Generation error:', error);
            this.showMessage('Error generating documentation. Please try again.', 'error');
        } finally {
            this.isGenerating = false;
            this.showProgress(false);
        }
    }

    async collectInputData() {
        const inputData = {
            code: this.codeInput,
            files: [],
            projectInfo: this.projectInfo,
            options: this.generationOptions
        };

        // Read uploaded files
        for (const file of this.uploadedFiles) {
            const content = await this.readFileContent(file);
            inputData.files.push({
                name: file.name,
                content: content,
                language: this.detectLanguage(file.name)
            });
        }

        return inputData;
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    detectLanguage(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'cs': 'csharp',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'ts': 'typescript',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'xml': 'xml',
            'yml': 'yaml',
            'yaml': 'yaml',
            'md': 'markdown'
        };
        return languageMap[ext] || 'text';
    }

    async analyzeCode(inputData) {
        const analysis = {
            functions: [],
            classes: [],
            variables: [],
            imports: [],
            comments: [],
            complexity: {},
            dependencies: []
        };

        // Analyze code input
        if (inputData.code) {
            const codeAnalysis = this.analyzeCodeString(inputData.code, 'input');
            Object.keys(analysis).forEach(key => {
                analysis[key].push(...codeAnalysis[key]);
            });
        }

        // Analyze uploaded files
        for (const file of inputData.files) {
            const fileAnalysis = this.analyzeCodeString(file.content, file.name);
            Object.keys(analysis).forEach(key => {
                analysis[key].push(...fileAnalysis[key]);
            });
        }

        // Calculate complexity metrics
        analysis.complexity = this.calculateComplexity(analysis);

        return analysis;
    }

    analyzeCodeString(code, source) {
        const analysis = {
            functions: [],
            classes: [],
            variables: [],
            imports: [],
            comments: [],
            dependencies: []
        };

        const lines = code.split('\n');

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            // Detect functions
            const functionMatches = this.detectFunctions(trimmed, index + 1);
            analysis.functions.push(...functionMatches);

            // Detect classes
            const classMatches = this.detectClasses(trimmed, index + 1);
            analysis.classes.push(...classMatches);

            // Detect variables
            const variableMatches = this.detectVariables(trimmed, index + 1);
            analysis.variables.push(...variableMatches);

            // Detect imports
            const importMatches = this.detectImports(trimmed, index + 1);
            analysis.imports.push(...importMatches);

            // Detect comments
            if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
                analysis.comments.push({
                    content: trimmed,
                    line: index + 1,
                    source: source
                });
            }
        });

        return analysis;
    }

    detectFunctions(line, lineNumber) {
        const functions = [];
        const patterns = [
            /function\s+(\w+)\s*\(/g,
            /(\w+)\s*\([^)]*\)\s*{/g,
            /def\s+(\w+)\s*\(/g,
            /public\s+\w+\s+(\w+)\s*\(/g,
            /private\s+\w+\s+(\w+)\s*\(/g,
            /protected\s+\w+\s+(\w+)\s*\(/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(line)) !== null) {
                functions.push({
                    name: match[1],
                    line: lineNumber,
                    signature: line.trim()
                });
            }
        });

        return functions;
    }

    detectClasses(line, lineNumber) {
        const classes = [];
        const patterns = [
            /class\s+(\w+)/g,
            /public\s+class\s+(\w+)/g,
            /class\s+(\w+)\s*extends/g,
            /class\s+(\w+)\s*implements/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(line)) !== null) {
                classes.push({
                    name: match[1],
                    line: lineNumber,
                    definition: line.trim()
                });
            }
        });

        return classes;
    }

    detectVariables(line, lineNumber) {
        const variables = [];
        const patterns = [
            /(?:var|let|const)\s+(\w+)\s*=/g,
            /(\w+)\s*=\s*[^=]/g,
            /int\s+(\w+)\s*;/g,
            /String\s+(\w+)\s*;/g,
            /\w+\s+(\w+)\s*;/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(line)) !== null) {
                if (!['if', 'for', 'while', 'function', 'class'].includes(match[1])) {
                    variables.push({
                        name: match[1],
                        line: lineNumber,
                        declaration: line.trim()
                    });
                }
            }
        });

        return variables;
    }

    detectImports(line, lineNumber) {
        const imports = [];
        const patterns = [
            /import\s+.*from\s+['"]([^'"]+)['"]/g,
            /import\s+['"]([^'"]+)['"]/g,
            /#include\s*<([^>]+)>/g,
            /using\s+([^;]+);/g,
            /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(line)) !== null) {
                imports.push({
                    module: match[1],
                    line: lineNumber,
                    statement: line.trim()
                });
            }
        });

        return imports;
    }

    calculateComplexity(analysis) {
        return {
            totalFunctions: analysis.functions.length,
            totalClasses: analysis.classes.length,
            totalVariables: analysis.variables.length,
            totalImports: analysis.imports.length,
            linesOfCode: analysis.functions.reduce((sum, func) => sum + (func.endLine - func.line + 1), 0),
            cyclomaticComplexity: this.calculateCyclomaticComplexity(analysis.functions)
        };
    }

    calculateCyclomaticComplexity(functions) {
        // Simplified cyclomatic complexity calculation
        return functions.reduce((complexity, func) => {
            let funcComplexity = 1; // Base complexity
            // Add complexity for control structures (simplified)
            const controlKeywords = ['if', 'else', 'for', 'while', 'case', 'catch', '&&', '||'];
            controlKeywords.forEach(keyword => {
                const count = (func.signature.match(new RegExp(keyword, 'g')) || []).length;
                funcComplexity += count;
            });
            return complexity + funcComplexity;
        }, 0);
    }

    async synthesizeDocumentation(analysis) {
        const docs = {
            overview: this.generateOverview(analysis),
            api: this.generateAPI(analysis),
            installation: this.generateInstallation(),
            usage: this.generateUsage(analysis),
            examples: this.generateExamples(analysis),
            changelog: this.generateChangelog(),
            license: this.generateLicense()
        };

        // Apply selected options
        if (this.generationOptions.format && this.generationOptions.format === 'markdown') {
            Object.keys(docs).forEach(key => {
                docs[key] = this.convertToMarkdown(docs[key]);
            });
        }

        return docs;
    }

    generateOverview(analysis) {
        return {
            title: this.projectInfo.name || 'Project Documentation',
            description: this.projectInfo.description || 'Generated documentation for the project.',
            features: this.extractFeatures(analysis),
            requirements: this.projectInfo.requirements || 'Standard runtime environment',
            complexity: analysis.complexity
        };
    }

    generateAPI(analysis) {
        return {
            functions: analysis.functions,
            classes: analysis.classes,
            variables: analysis.variables,
            endpoints: this.extractEndpoints(analysis)
        };
    }

    generateInstallation() {
        const language = this.projectInfo.language || 'javascript';
        const installCommands = {
            javascript: 'npm install',
            python: 'pip install -r requirements.txt',
            java: 'mvn install',
            dotnet: 'dotnet restore',
            go: 'go mod download'
        };

        return {
            prerequisites: this.getPrerequisites(language),
            commands: installCommands[language] || 'Please refer to project documentation',
            dependencies: this.projectInfo.dependencies || []
        };
    }

    generateUsage(analysis) {
        return {
            quickStart: this.generateQuickStart(analysis),
            configuration: this.projectInfo.configuration || {},
            examples: this.generateUsageExamples(analysis)
        };
    }

    generateExamples(analysis) {
        return analysis.functions.slice(0, 5).map(func => ({
            title: `Using ${func.name}`,
            code: `// Example usage of ${func.name}\n${func.signature}`,
            description: `Demonstrates how to use the ${func.name} function.`
        }));
    }

    generateChangelog() {
        return {
            version: '1.0.0',
            date: new Date().toISOString().split('T')[0],
            changes: [
                'Initial release',
                'Generated comprehensive documentation',
                'Added API reference',
                'Included usage examples'
            ]
        };
    }

    generateLicense() {
        return {
            type: this.projectInfo.license || 'MIT',
            text: this.getLicenseText(this.projectInfo.license || 'MIT')
        };
    }

    extractFeatures(analysis) {
        const features = [];
        if (analysis.functions.length > 0) {
            features.push(`${analysis.functions.length} functions implemented`);
        }
        if (analysis.classes.length > 0) {
            features.push(`${analysis.classes.length} classes defined`);
        }
        if (analysis.imports.length > 0) {
            features.push(`Depends on ${analysis.imports.length} external modules`);
        }
        return features;
    }

    extractEndpoints(analysis) {
        // Extract potential API endpoints from code
        return analysis.functions
            .filter(func => func.name.toLowerCase().includes('get') ||
                           func.name.toLowerCase().includes('post') ||
                           func.name.toLowerCase().includes('put') ||
                           func.name.toLowerCase().includes('delete'))
            .map(func => ({
                method: this.inferHTTPMethod(func.name),
                path: `/${func.name.toLowerCase()}`,
                description: `Endpoint for ${func.name}`
            }));
    }

    inferHTTPMethod(funcName) {
        const name = funcName.toLowerCase();
        if (name.includes('get')) return 'GET';
        if (name.includes('post')) return 'POST';
        if (name.includes('put')) return 'PUT';
        if (name.includes('delete')) return 'DELETE';
        return 'GET';
    }

    getPrerequisites(language) {
        const prereqs = {
            javascript: ['Node.js 14+', 'npm'],
            python: ['Python 3.6+', 'pip'],
            java: ['Java 8+', 'Maven'],
            dotnet: ['.NET Core 3.1+', 'NuGet'],
            go: ['Go 1.16+']
        };
        return prereqs[language] || ['Appropriate runtime environment'];
    }

    generateQuickStart(analysis) {
        const mainFunctions = analysis.functions.slice(0, 3);
        return mainFunctions.map(func =>
            `Call ${func.name}() to ${func.name.toLowerCase().replace(/_/g, ' ')}`
        ).join('\n');
    }

    generateUsageExamples(analysis) {
        return analysis.functions.slice(0, 3).map(func => ({
            scenario: `Basic usage of ${func.name}`,
            code: `${func.name}(${this.generateMockParameters(func)})`,
            result: 'Expected result based on function implementation'
        }));
    }

    generateMockParameters(func) {
        // Generate mock parameters based on function signature
        const paramCount = (func.signature.match(/,/g) || []).length + 1;
        return Array(paramCount).fill().map((_, i) => `"param${i + 1}"`).join(', ');
    }

    getLicenseText(license) {
        const licenses = {
            'MIT': `MIT License

Copyright (c) ${new Date().getFullYear()} ${this.projectInfo.author || 'Author'}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
            'Apache-2.0': 'Apache License 2.0 - Full text would be here',
            'GPL-3.0': 'GNU General Public License v3.0 - Full text would be here'
        };
        return licenses[license] || licenses['MIT'];
    }

    convertToMarkdown(content) {
        // Convert generated content to Markdown format
        if (typeof content === 'object') {
            return this.objectToMarkdown(content);
        }
        return content;
    }

    objectToMarkdown(obj, level = 1) {
        let markdown = '';

        for (const [key, value] of Object.entries(obj)) {
            const header = '#'.repeat(level) + ' ' + this.capitalizeFirst(key.replace(/([A-Z])/g, ' $1'));
            markdown += header + '\n\n';

            if (Array.isArray(value)) {
                value.forEach(item => {
                    if (typeof item === 'object') {
                        markdown += this.objectToMarkdown(item, level + 1);
                    } else {
                        markdown += `- ${item}\n`;
                    }
                });
                markdown += '\n';
            } else if (typeof value === 'object') {
                markdown += this.objectToMarkdown(value, level + 1);
            } else {
                markdown += `${value}\n\n`;
            }
        }

        return markdown;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    updatePreview() {
        this.renderPreview(this.currentPreviewTab);
    }

    switchPreviewTab(tabId) {
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        this.currentPreviewTab = tabId;
        this.renderPreview(tabId);
    }

    renderPreview(tabId) {
        const previewContent = document.querySelector('.preview-content');
        const content = this.generatedDocs[tabId];

        if (!content) {
            previewContent.innerHTML = '<div class="loading-preview"><i class="fas fa-file-alt"></i><p>No content available for this section.</p></div>';
            return;
        }

        let html = '';

        switch (tabId) {
            case 'overview':
                html = this.renderOverview(content);
                break;
            case 'api':
                html = this.renderAPI(content);
                break;
            case 'installation':
                html = this.renderInstallation(content);
                break;
            case 'usage':
                html = this.renderUsage(content);
                break;
            case 'examples':
                html = this.renderExamples(content);
                break;
            case 'changelog':
                html = this.renderChangelog(content);
                break;
            case 'license':
                html = this.renderLicense(content);
                break;
        }

        previewContent.innerHTML = html;
        this.updateCodePreview();
    }

    renderOverview(content) {
        return `
            <h2>${content.title}</h2>
            <p>${content.description}</p>
            <h3>Features</h3>
            <ul>
                ${content.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <h3>Requirements</h3>
            <p>${content.requirements}</p>
            <h3>Complexity Metrics</h3>
            <ul>
                <li>Functions: ${content.complexity.totalFunctions}</li>
                <li>Classes: ${content.complexity.totalClasses}</li>
                <li>Variables: ${content.complexity.totalVariables}</li>
                <li>Lines of Code: ${content.complexity.linesOfCode}</li>
            </ul>
        `;
    }

    renderAPI(content) {
        let html = '<h2>API Reference</h2>';

        if (content.functions.length > 0) {
            html += '<h3>Functions</h3>';
            content.functions.forEach(func => {
                html += `
                    <div class="code-block">
                        <h4>${func.name}</h4>
                        <pre><code class="language-javascript">${func.signature}</code></pre>
                        <p>Line ${func.line}</p>
                    </div>
                `;
            });
        }

        if (content.classes.length > 0) {
            html += '<h3>Classes</h3>';
            content.classes.forEach(cls => {
                html += `
                    <div class="code-block">
                        <h4>${cls.name}</h4>
                        <pre><code class="language-javascript">${cls.definition}</code></pre>
                        <p>Line ${cls.line}</p>
                    </div>
                `;
            });
        }

        return html;
    }

    renderInstallation(content) {
        return `
            <h2>Installation</h2>
            <h3>Prerequisites</h3>
            <ul>
                ${content.prerequisites.map(prereq => `<li>${prereq}</li>`).join('')}
            </ul>
            <h3>Installation Command</h3>
            <div class="code-block">
                <pre><code class="language-bash">${content.commands}</code></pre>
            </div>
            ${content.dependencies.length > 0 ? `
                <h3>Dependencies</h3>
                <ul>
                    ${content.dependencies.map(dep => `<li>${dep}</li>`).join('')}
                </ul>
            ` : ''}
        `;
    }

    renderUsage(content) {
        return `
            <h2>Usage</h2>
            <h3>Quick Start</h3>
            <div class="code-block">
                <pre><code class="language-javascript">${content.quickStart}</code></pre>
            </div>
            <h3>Configuration</h3>
            <pre><code class="language-json">${JSON.stringify(content.configuration, null, 2)}</code></pre>
        `;
    }

    renderExamples(content) {
        return `
            <h2>Examples</h2>
            ${content.map(example => `
                <div class="code-block">
                    <h3>${example.title}</h3>
                    <p>${example.description}</p>
                    <pre><code class="language-javascript">${example.code}</code></pre>
                </div>
            `).join('')}
        `;
    }

    renderChangelog(content) {
        return `
            <h2>Changelog</h2>
            <h3>Version ${content.version} (${content.date})</h3>
            <ul>
                ${content.changes.map(change => `<li>${change}</li>`).join('')}
            </ul>
        `;
    }

    renderLicense(content) {
        return `
            <h2>License</h2>
            <h3>${content.type}</h3>
            <pre>${content.text}</pre>
        `;
    }

    async exportDocumentation(format) {
        const content = this.compileDocumentation(format);
        const fileName = `${this.projectInfo.name || 'documentation'}.${format}`;

        try {
            if (format === 'html') {
                this.downloadFile(content, fileName, 'text/html');
            } else if (format === 'pdf') {
                await this.generatePDF(content);
            } else if (format === 'json') {
                this.downloadFile(JSON.stringify(this.generatedDocs, null, 2), fileName, 'application/json');
            } else {
                this.downloadFile(content, fileName, 'text/plain');
            }

            this.showMessage(`Documentation exported as ${format.toUpperCase()} successfully!`, 'success');
        } catch (error) {
            this.showMessage('Error exporting documentation.', 'error');
        }
    }

    compileDocumentation(format) {
        let content = '';

        if (format === 'markdown' || format === 'md') {
            Object.entries(this.generatedDocs).forEach(([section, data]) => {
                content += this.objectToMarkdown({ [section]: data });
                content += '\n---\n\n';
            });
        } else if (format === 'html') {
            content = this.generateHTMLDocumentation();
        } else {
            content = JSON.stringify(this.generatedDocs, null, 2);
        }

        return content;
    }

    generateHTMLDocumentation() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.projectInfo.name || 'Project'} Documentation</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .code-block { background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 10px 0; }
        pre { margin: 0; }
    </style>
</head>
<body>
    <h1>${this.projectInfo.name || 'Project'} Documentation</h1>
    ${Object.entries(this.generatedDocs).map(([section, content]) => `
        <section id="${section}">
            ${this.renderPreviewSection(section, content)}
        </section>
    `).join('')}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
</body>
</html>`;
    }

    renderPreviewSection(section, content) {
        // Reuse the render methods but return HTML strings
        switch (section) {
            case 'overview': return this.renderOverview(content);
            case 'api': return this.renderAPI(content);
            case 'installation': return this.renderInstallation(content);
            case 'usage': return this.renderUsage(content);
            case 'examples': return this.renderExamples(content);
            case 'changelog': return this.renderChangelog(content);
            case 'license': return this.renderLicense(content);
            default: return `<p>No content for ${section}</p>`;
        }
    }

    downloadFile(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async generatePDF(content) {
        // This would require a PDF generation library like jsPDF
        // For now, we'll show a message
        this.showMessage('PDF generation requires additional libraries. Please use HTML export instead.', 'info');
    }

    loadTemplates() {
        this.templates = {
            basic: {
                name: 'Basic Documentation',
                sections: ['overview', 'installation', 'usage', 'api']
            },
            comprehensive: {
                name: 'Comprehensive Documentation',
                sections: ['overview', 'installation', 'usage', 'api', 'examples', 'changelog', 'license']
            },
            api: {
                name: 'API Documentation',
                sections: ['overview', 'api', 'examples']
            }
        };
    }

    applyTemplate(templateName) {
        const template = this.templates[templateName];
        if (template) {
            // Update generation options based on template
            this.generationOptions.sections = template.sections;
            this.showMessage(`Applied ${template.name} template`, 'success');
        }
    }

    showProgress(show) {
        const progressContainer = document.querySelector('.progress-container');
        const generateBtn = document.getElementById('generateBtn');

        if (show) {
            progressContainer.style.display = 'block';
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                document.querySelector('.progress-fill').style.width = progress + '%';
                document.querySelector('.progress-text').textContent = `Generating documentation... ${Math.round(progress)}%`;
            }, 200);
        } else {
            progressContainer.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.innerHTML = 'Generate Documentation';
            document.querySelector('.progress-fill').style.width = '0%';
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    saveCustomTemplate() {
        const templateName = document.getElementById('templateName').value;
        const templateContent = document.getElementById('templateContent').value;

        if (templateName && templateContent) {
            this.templates[templateName.toLowerCase().replace(/\s+/g, '_')] = {
                name: templateName,
                content: templateContent,
                custom: true
            };
            this.showMessage('Custom template saved!', 'success');
            this.closeModal();
        } else {
            this.showMessage('Please provide both template name and content.', 'error');
        }
    }

    loadCustomTemplate() {
        const templateSelect = document.getElementById('templateSelect');
        const selectedTemplate = templateSelect.value;

        if (selectedTemplate && this.templates[selectedTemplate]) {
            document.getElementById('templateContent').value = this.templates[selectedTemplate].content || '';
            this.showMessage('Template loaded!', 'success');
        }
    }

    initializePrism() {
        // Load Prism.js for syntax highlighting
        if (!window.Prism) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
            document.head.appendChild(script);

            const css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
            document.head.appendChild(css);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentationSynthesizer();
});

// Export for potential use in other scripts
window.DocumentationSynthesizer = DocumentationSynthesizer;