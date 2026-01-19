
        const emojiData = [
            { emoji: "✨", code: ":sparkles:", description: "Introducing new features" },
            { emoji: "🐛", code: ":bug:", description: "Fixing a bug" },
            { emoji: "📚", code: ":books:", description: "Writing documentation" },
            { emoji: "♻️", code: ":recycle:", description: "Refactoring code" },
            { emoji: "✅", code: ":white_check_mark:", description: "Adding tests" },
            { emoji: "🔧", code: ":wrench:", description: "Tooling or maintenance" },
            { emoji: "⚡", code: ":zap:", description: "Improving performance" },
            { emoji: "🔥", code: ":fire:", description: "Removing code/files" },
            { emoji: "🚀", code: ":rocket:", description: "Deploying stuff" },
            { emoji: "🎨", code: ":art:", description: "Improving structure/format" },
            { emoji: "🚧", code: ":construction:", description: "Work in progress" },
            { emoji: "💄", code: ":lipstick:", description: "Updating UI/style" },
            { emoji: "🎉", code: ":tada:", description: "Initial commit" },
            { emoji: "🔒", code: ":lock:", description: "Fixing security issues" },
            { emoji: "🍎", code: ":apple:", description: "Fixing macOS" },
            { emoji: "🐧", code: ":penguin:", description: "Fixing Linux" },
            { emoji: "🏁", code: ":checkered_flag:", description: "Fixing Windows" },
            { emoji: "🔖", code: ":bookmark:", description: "Releasing / Version tags" },
            { emoji: "🚨", code: ":rotating_light:", description: "Removing linter warnings" },
            { emoji: "💚", code: ":green_heart:", description: "Fixing CI Build" },
            { emoji: "⬇️", code: ":arrow_down:", description: "Downgrading dependencies" },
            { emoji: "⬆️", code: ":arrow_up:", description: "Upgrading dependencies" },
            { emoji: "📌", code: ":pushpin:", description: "Pinning dependencies" },
            { emoji: "👷", code: ":construction_worker:", description: "Adding CI build system" },
            { emoji: "💡", code: ":bulb:", description: "Documenting source code" },
            { emoji: "🍻", code: ":beers:", description: "Writing code drunkenly" },
            { emoji: "💬", code: ":speech_balloon:", description: "Updating text and literals" },
            { emoji: "🗃️", code: ":card_file_box:", description: "Performing database changes" },
            { emoji: "🔊", code: ":loud_sound:", description: "Adding logs" },
            { emoji: "🔇", code: ":mute:", description: "Removing logs" },
            { emoji: "👽️", code: ":alien:", description: "Updating code due to API changes" },
            { emoji: "🚚", code: ":truck:", description: "Moving or renaming files" },
            { emoji: "📄", code: ":page_facing_up:", description: "Adding or updating license" },
            { emoji: "💩", code: ":poop:", description: "Writing bad code" },
            { emoji: "🙈", code: ":see_no_evil:", description: "Adding or updating a .gitignore" },
            { emoji: "🚸", code: ":children_crossing:", description: "Improving user experience" },
            { emoji: "🏗️", code: ":building_construction:", description: "Making architectural changes" },
            { emoji: "📱", code: ":iphone:", description: "Working on responsive design" },
            { emoji: "🤡", code: ":clown_face:", description: "Mocking things" },
            { emoji: "🥚", code: ":egg:", description: "Adding an easter egg" },
            { emoji: "🙏", code: ":pray:", description: "Thanks" }
        ];

        // Commit type configurations
        const commitTypes = {
            feat: {
                emoji: "✨",
                description: "A new feature",
                color: "green",
                examples: [
                    "Add user authentication system",
                    "Implement dark mode toggle",
                    "Create new API endpoint for users"
                ]
            },
            fix: {
                emoji: "🐛",
                description: "A bug fix",
                color: "red",
                examples: [
                    "Fix login button not working on mobile",
                    "Resolve memory leak in data processing",
                    "Correct typo in error message"
                ]
            },
            docs: {
                emoji: "📚",
                description: "Documentation only changes",
                color: "blue",
                examples: [
                    "Update README with installation instructions",
                    "Add JSDoc comments to functions",
                    "Write API documentation"
                ]
            },
            refactor: {
                emoji: "♻️",
                description: "Code change that neither fixes a bug nor adds a feature",
                color: "purple",
                examples: [
                    "Restructure component architecture",
                    "Optimize database queries",
                    "Improve code readability"
                ]
            },
            test: {
                emoji: "✅",
                description: "Adding missing tests or correcting existing tests",
                color: "orange",
                examples: [
                    "Add unit tests for utility functions",
                    "Fix flaky integration test",
                    "Increase test coverage for authentication"
                ]
            },
            chore: {
                emoji: "🔧",
                description: "Changes to the build process or auxiliary tools",
                color: "gray",
                examples: [
                    "Update dependencies to latest versions",
                    "Configure ESLint rules",
                    "Set up CI/CD pipeline"
                ]
            }
        };

        // AI Patterns for generating commit messages
        const aiPatterns = {
            conventional: [
                "{type}({scope}): {description}",
                "{type}: {description}",
                "{emoji} {type}({scope}): {description}"
            ],
            simple: [
                "{description}",
                "{emoji} {description}",
                "{type}: {description}"
            ],
            detailed: [
                "{type}({scope}): {description}\n\n{body}\n\n{footer}",
                "{emoji} {type}({scope}): {description}\n\n{body}"
            ]
        };

        // Scopes for different languages
        const languageScopes = {
            javascript: ["auth", "api", "ui", "utils", "config", "db", "test", "docs"],
            python: ["api", "models", "views", "utils", "tests", "docs", "config", "cli"],
            java: ["controller", "service", "repository", "model", "config", "test", "util"],
            any: ["core", "api", "ui", "auth", "db", "test", "docs", "config", "utils"]
        };

        // Sample diffs for examples
        const sampleDiffs = {
            bugfix: `diff --git a/src/auth.js b/src/auth.js
index abc123..def456 100644
--- a/src/auth.js
+++ b/src/auth.js
@@ -15,7 +15,7 @@ function login(email, password) {
     const user = await db.findUser(email);
     
     if (!user) {
-        return { error: "User not found" };
+        throw new Error("Invalid credentials");
     }
     
     const isValid = await bcrypt.compare(password, user.password);`,
            
            feature: `diff --git a/src/components/Button.js b/src/components/Button.js
new file mode 100644
index 0000000..abc123
--- /dev/null
+++ b/src/components/Button.js
@@ -0,0 +1,25 @@
+import React from 'react';
+import PropTypes from 'prop-types';
+import './Button.css';
+
+const Button = ({ variant = 'primary', children, onClick, disabled }) => {
+    return (
+        <button 
+            className={\`btn btn-\${variant}\`}
+            onClick={onClick}
+            disabled={disabled}
+        >
+            {children}
+        </button>
+    );
+};`,
            
            refactor: `diff --git a/src/utils/helpers.js b/src/utils/helpers.js
index abc123..def456 100644
--- a/src/utils/helpers.js
+++ b/src/utils/helpers.js
@@ -1,15 +1,20 @@
-// Old implementation
-function formatDate(date) {
-    const d = new Date(date);
-    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
-}
+// New implementation using date-fns
+import { format } from 'date-fns';
 
+/**
+ * Format a date to readable string
+ * @param {Date|string} date - The date to format
+ * @param {string} formatStr - Optional format string
+ * @returns {string} Formatted date
+ */
+function formatDate(date, formatStr = 'dd/MM/yyyy') {
+    return format(new Date(date), formatStr);
+}`
        };
    


        // Main Application
        class CommitGenius {
            constructor() {
                this.state = {
                    selectedType: 'feat',
                    selectedScope: '',
                    history: [],
                    settings: {
                        emojiStyle: 'github',
                        formatStyle: 'conventional',
                        maxLength: 100,
                        tone: 'neutral',
                        language: 'any'
                    },
                    currentMessages: [],
                    stats: {
                        totalGenerated: 0,
                        saved: 0,
                        typeCounts: {},
                        avgLength: 0
                    }
                };

                this.init();
            }

            init() {
                this.loadFromStorage();
                this.setupEventListeners();
                this.renderEmojiPicker();
                this.updateStatsDisplay();
                this.renderHistory();
                this.setupTutorial();
            }

            loadFromStorage() {
                const saved = localStorage.getItem('commitGeniusData');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.state.history = data.history || [];
                    this.state.stats = data.stats || this.state.stats;
                    this.state.settings = { ...this.state.settings, ...data.settings };
                    
                    // Update UI with saved settings
                    document.getElementById('emojiStyle').value = this.state.settings.emojiStyle;
                    document.getElementById('formatStyle').value = this.state.settings.formatStyle;
                    document.getElementById('maxLength').value = this.state.settings.maxLength;
                    document.getElementById('maxLengthValue').textContent = this.state.settings.maxLength;
                    document.getElementById('toneSelect').value = this.state.settings.tone;
                    document.getElementById('languageSelect').value = this.state.settings.language;
                    
                    // Select the active commit type
                    document.querySelectorAll('.commit-type-btn').forEach(btn => {
                        if (btn.dataset.type === this.state.selectedType) {
                            btn.classList.add('active');
                        }
                    });
                }
            }

            saveToStorage() {
                const data = {
                    history: this.state.history,
                    stats: this.state.stats,
                    settings: this.state.settings
                };
                localStorage.setItem('commitGeniusData', JSON.stringify(data));
            }

            setupEventListeners() {
                // Commit type selection
                document.querySelectorAll('.commit-type-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        document.querySelectorAll('.commit-type-btn').forEach(b => b.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        this.state.selectedType = e.currentTarget.dataset.type;
                    });
                });

                // Generate button
                document.getElementById('generateBtn').addEventListener('click', () => this.generateCommit());

                // Clear diff
                document.getElementById('clearDiffBtn').addEventListener('click', () => {
                    document.getElementById('diffInput').value = '';
                });

                // Load example
                document.getElementById('exampleBtn').addEventListener('click', () => {
                    const types = Object.keys(sampleDiffs);
                    const randomType = types[Math.floor(Math.random() * types.length)];
                    document.getElementById('diffInput').value = sampleDiffs[randomType];
                    
                    // Also update description with example
                    const typeConfig = commitTypes[this.state.selectedType];
                    if (typeConfig && typeConfig.examples) {
                        const randomExample = typeConfig.examples[Math.floor(Math.random() * typeConfig.examples.length)];
                        document.getElementById('descriptionInput').value = randomExample;
                    }
                });

                // Settings
                document.getElementById('emojiStyle').addEventListener('change', (e) => {
                    this.state.settings.emojiStyle = e.target.value;
                    this.saveToStorage();
                });

                document.getElementById('formatStyle').addEventListener('change', (e) => {
                    this.state.settings.formatStyle = e.target.value;
                    this.saveToStorage();
                });

                document.getElementById('maxLength').addEventListener('input', (e) => {
                    const value = e.target.value;
                    document.getElementById('maxLengthValue').textContent = value;
                    this.state.settings.maxLength = parseInt(value);
                    this.saveToStorage();
                });

                document.getElementById('toneSelect').addEventListener('change', (e) => {
                    this.state.settings.tone = e.target.value;
                    this.saveToStorage();
                });

                document.getElementById('languageSelect').addEventListener('change', (e) => {
                    this.state.settings.language = e.target.value;
                    this.saveToStorage();
                });

                // Advanced options toggle
                document.getElementById('toggleAdvanced').addEventListener('click', () => {
                    const options = document.getElementById('advancedOptions');
                    const icon = document.querySelector('#toggleAdvanced i');
                    if (options.classList.contains('hidden')) {
                        options.classList.remove('hidden');
                        icon.className = 'fas fa-chevron-up mr-1';
                        document.getElementById('toggleAdvanced').innerHTML = '<i class="fas fa-chevron-up mr-1"></i>Hide';
                    } else {
                        options.classList.add('hidden');
                        icon.className = 'fas fa-chevron-down mr-1';
                        document.getElementById('toggleAdvanced').innerHTML = '<i class="fas fa-chevron-down mr-1"></i>Show';
                    }
                });

                // Emoji picker
                document.getElementById('emojiPickerBtn').addEventListener('click', (e) => {
                    const picker = document.getElementById('emojiPicker');
                    picker.classList.toggle('show');
                    e.stopPropagation();
                });

                document.addEventListener('click', (e) => {
                    if (!e.target.closest('#emojiPicker') && !e.target.closest('#emojiPickerBtn')) {
                        document.getElementById('emojiPicker').classList.remove('show');
                    }
                });

                // Template buttons
                document.querySelectorAll('.template-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const template = e.currentTarget.dataset.template;
                        this.loadTemplate(template);
                    });
                });

                // Regenerate
                document.getElementById('regenerateBtn').addEventListener('click', () => {
                    if (this.state.currentMessages.length > 0) {
                        this.generateCommit(true);
                    }
                });

                // Save all
                document.getElementById('saveAllBtn').addEventListener('click', () => {
                    this.state.currentMessages.forEach(msg => this.saveToHistory(msg));
                    this.showToast('Saved!', 'All messages saved to history');
                });

                // Clear history
                document.getElementById('clearHistory').addEventListener('click', () => {
                    if (confirm('Clear all history? This cannot be undone.')) {
                        this.state.history = [];
                        this.state.stats.saved = 0;
                        this.saveToStorage();
                        this.renderHistory();
                        this.updateStatsDisplay();
                    }
                });

                // Copy command
                document.getElementById('copyCmdBtn').addEventListener('click', () => {
                    const command = document.getElementById('copyCommand').textContent;
                    navigator.clipboard.writeText(command);
                    this.showToast('Copied!', 'Git command copied to clipboard');
                });

                // Theme toggle
                document.getElementById('themeToggle').addEventListener('click', () => {
                    const icon = document.querySelector('#themeToggle i');
                    if (icon.classList.contains('fa-moon')) {
                        icon.className = 'fas fa-sun text-yellow-400';
                        document.documentElement.classList.add('dark');
                    } else {
                        icon.className = 'fas fa-moon text-gray-400';
                        document.documentElement.classList.remove('dark');
                    }
                });

                // Export
                document.getElementById('exportBtn').addEventListener('click', () => {
                    this.exportHistory();
                });

                // Feedback
                document.getElementById('feedbackBtn').addEventListener('click', () => {
                    document.getElementById('feedbackModal').classList.remove('hidden');
                });

                document.getElementById('closeFeedback').addEventListener('click', () => {
                    document.getElementById('feedbackModal').classList.add('hidden');
                });

                document.getElementById('submitFeedback').addEventListener('click', () => {
                    const feedback = document.getElementById('feedbackInput').value;
                    const email = document.getElementById('feedbackEmail').value;
                    
                    if (feedback.trim()) {
                        console.log('Feedback:', { feedback, email, timestamp: new Date().toISOString() });
                        this.showToast('Thank you!', 'Feedback submitted successfully');
                        document.getElementById('feedbackModal').classList.add('hidden');
                        document.getElementById('feedbackInput').value = '';
                        document.getElementById('feedbackEmail').value = '';
                    }
                });
            }

            setupTutorial() {
                let currentStep = 1;
                const totalSteps = 3;
                const steps = document.querySelectorAll('.tutorial-step');
                
                document.getElementById('tutorialBtn').addEventListener('click', () => {
                    document.getElementById('tutorialOverlay').classList.remove('hidden');
                    currentStep = 1;
                    this.updateTutorialSteps();
                });
                
                document.getElementById('closeTutorial').addEventListener('click', () => {
                    document.getElementById('tutorialOverlay').classList.add('hidden');
                });
                
                document.getElementById('nextStep').addEventListener('click', () => {
                    if (currentStep < totalSteps) {
                        currentStep++;
                        this.updateTutorialSteps();
                    } else {
                        document.getElementById('tutorialOverlay').classList.add('hidden');
                    }
                });
                
                document.getElementById('prevStep').addEventListener('click', () => {
                    if (currentStep > 1) {
                        currentStep--;
                        this.updateTutorialSteps();
                    }
                });
                
                this.updateTutorialSteps = () => {
                    steps.forEach(step => {
                        step.classList.remove('active');
                        if (parseInt(step.dataset.step) === currentStep) {
                            step.classList.add('active');
                        }
                    });
                    
                    // Update dots
                    const dots = document.querySelectorAll('#tutorialOverlay .w-2');
                    dots.forEach((dot, index) => {
                        if (index < currentStep) {
                            dot.classList.remove('bg-gray-700');
                            dot.classList.add('bg-green-600');
                        } else {
                            dot.classList.remove('bg-green-600');
                            dot.classList.add('bg-gray-700');
                        }
                    });
                    
                    // Update button text
                    const nextBtn = document.getElementById('nextStep');
                    if (currentStep === totalSteps) {
                        nextBtn.innerHTML = 'Finish <i class="fas fa-check ml-2"></i>';
                    } else {
                        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right ml-2"></i>';
                    }
                };
            }

            renderEmojiPicker() {
                const picker = document.getElementById('emojiPicker');
                emojiData.forEach(emoji => {
                    const div = document.createElement('div');
                    div.className = 'emoji-option';
                    div.innerHTML = emoji.emoji;
                    div.title = `${emoji.code} - ${emoji.description}`;
                    div.addEventListener('click', () => {
                        const input = document.getElementById('descriptionInput');
                        input.value += ` ${emoji.emoji} `;
                        input.focus();
                        picker.classList.remove('show');
                    });
                    picker.appendChild(div);
                });
            }

            async generateCommit(isRegenerate = false) {
                const diff = document.getElementById('diffInput').value.trim();
                const description = document.getElementById('descriptionInput').value.trim();
                
                if (!description && !diff) {
                    this.showToast('Oops!', 'Please describe your changes or paste a diff');
                    return;
                }

                // Show results section
                document.getElementById('resultsSection').classList.remove('hidden');
                
                // Show AI thinking animation
                const aiThinking = document.getElementById('aiThinking');
                const aiProgress = document.getElementById('aiProgress');
                const aiStatus = document.getElementById('aiStatus');
                aiThinking.classList.remove('hidden');
                
                // Simulate AI thinking with progress
                const statuses = [
                    "Analyzing your code changes...",
                    "Understanding the context...",
                    "Generating commit message options...",
                    "Applying best practices...",
                    "Finalizing suggestions..."
                ];
                
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 20;
                    aiProgress.style.width = `${progress}%`;
                    
                    if (progress <= 100) {
                        const statusIndex = Math.floor(progress / 20) - 1;
                        if (statusIndex >= 0 && statusIndex < statuses.length) {
                            aiStatus.textContent = statuses[statusIndex];
                        }
                    }
                    
                    if (progress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => {
                            aiThinking.classList.add('hidden');
                            this.generateAndDisplayMessages(diff, description, isRegenerate);
                        }, 500);
                    }
                }, 300);
            }

            generateAndDisplayMessages(diff, description, isRegenerate) {
                const messages = [];
                const typeConfig = commitTypes[this.state.selectedType];
                const language = this.state.settings.language;
                const scopeOptions = languageScopes[language] || languageScopes.any;
                const selectedScope = scopeOptions[Math.floor(Math.random() * scopeOptions.length)];
                
                // Generate 3 different messages
                for (let i = 0; i < 3; i++) {
                    const message = this.generateSingleMessage(diff, description, typeConfig, selectedScope, i);
                    messages.push({
                        id: Date.now() + i,
                        text: message,
                        type: this.state.selectedType,
                        scope: selectedScope,
                        emoji: typeConfig.emoji,
                        language: language,
                        timestamp: new Date().toISOString()
                    });
                }
                
                this.state.currentMessages = messages;
                this.renderGeneratedMessages(messages);
                
                // Update stats
                this.state.stats.totalGenerated += messages.length;
                this.state.stats.typeCounts[this.state.selectedType] = 
                    (this.state.stats.typeCounts[this.state.selectedType] || 0) + messages.length;
                this.updateStatsDisplay();
                this.saveToStorage();
                
                // Update copy command with first message
                this.updateCopyCommand(messages[0].text);
                
                // Show success message
                if (!isRegenerate) {
                    this.showToast('Success!', `Generated ${messages.length} commit messages`);
                }
            }

            generateSingleMessage(diff, description, typeConfig, scope, variation) {
                const patterns = aiPatterns[this.state.settings.formatStyle];
                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                
                // Extract keywords from diff and description
                const keywords = this.extractKeywords(diff + ' ' + description);
                
                // Generate description based on tone
                let generatedDescription = this.generateDescription(description, keywords, variation);
                
                // Clean up description
                generatedDescription = generatedDescription.trim();
                generatedDescription = generatedDescription.charAt(0).toUpperCase() + generatedDescription.slice(1);
                
                // Truncate if too long
                if (generatedDescription.length > this.state.settings.maxLength) {
                    generatedDescription = generatedDescription.substring(0, this.state.settings.maxLength - 3) + '...';
                }
                
                // Build the message
                let message = pattern
                    .replace('{type}', this.state.selectedType)
                    .replace('{scope}', scope)
                    .replace('{description}', generatedDescription)
                    .replace('{emoji}', this.state.settings.emojiStyle !== 'none' ? typeConfig.emoji + ' ' : '')
                    .replace('{body}', this.generateBody(diff, keywords))
                    .replace('{footer}', this.generateFooter(keywords));
                
                // Clean up any leftover placeholders
                message = message.replace(/\{.*?\}/g, '').trim();
                
                return message;
            }

            extractKeywords(text) {
                const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
                const words = text.toLowerCase()
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter(word => word.length > 2 && !commonWords.has(word));
                
                // Get unique keywords with frequency
                const frequency = {};
                words.forEach(word => {
                    frequency[word] = (frequency[word] || 0) + 1;
                });
                
                // Sort by frequency and return top 5
                return Object.entries(frequency)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([word]) => word);
            }

            generateDescription(baseDescription, keywords, variation) {
                if (baseDescription) {
                    // If we have a base description, enhance it based on variation
                    const enhancements = [
                        `Improved ${keywords[0] || 'implementation'}`,
                        `Fixed issue with ${keywords[0] || 'component'}`,
                        `Added ${keywords[0] || 'feature'}`,
                        `Updated ${keywords[0] || 'code'}`,
                        `Refactored ${keywords[0] || 'logic'}`
                    ];
                    
                    if (variation > 0) {
                        return `${enhancements[variation % enhancements.length]}: ${baseDescription}`;
                    }
                    return baseDescription;
                }
                
                // Generate from keywords
                const actions = {
                    feat: ['Add', 'Implement', 'Introduce', 'Create', 'Enable'],
                    fix: ['Fix', 'Resolve', 'Correct', 'Repair', 'Handle'],
                    docs: ['Document', 'Update', 'Add', 'Improve', 'Clarify'],
                    refactor: ['Refactor', 'Optimize', 'Simplify', 'Restructure', 'Clean up'],
                    test: ['Test', 'Add tests for', 'Increase coverage for', 'Fix tests for'],
                    chore: ['Update', 'Configure', 'Setup', 'Bump', 'Clean']
                };
                
                const action = actions[this.state.selectedType] || actions.feat;
                const randomAction = action[Math.floor(Math.random() * action.length)];
                
                if (keywords.length > 0) {
                    return `${randomAction} ${keywords[0]} ${keywords[1] ? `and ${keywords[1]}` : ''}`.trim();
                }
                
                // Fallback descriptions
                const fallbacks = {
                    feat: 'new feature implementation',
                    fix: 'bug fix and improvements',
                    docs: 'documentation updates',
                    refactor: 'code refactoring and optimization',
                    test: 'test coverage improvements',
                    chore: 'maintenance and configuration updates'
                };
                
                return `${randomAction} ${fallbacks[this.state.selectedType]}`;
            }

            generateBody(diff, keywords) {
                if (!diff) return '';
                
                // Simple body generation from diff
                const lines = diff.split('\n').slice(0, 3);
                const changes = lines.filter(line => line.startsWith('+') || line.startsWith('-'));
                
                if (changes.length === 0) return '';
                
                return `Changes include:\n- ${changes.slice(0, 3).join('\n- ')}`;
            }

            generateFooter(keywords) {
                const footers = [
                    `Closes #${Math.floor(Math.random() * 100) + 1}`,
                    `Related to ${keywords[0] || 'feature'}`,
                    `BREAKING CHANGE: ${keywords[0] ? `Updated ${keywords[0]} API` : 'API changes'}`,
                    `See also: ${keywords.slice(0, 2).join(', ')}`
                ];
                
                return Math.random() > 0.7 ? footers[Math.floor(Math.random() * footers.length)] : '';
            }

            renderGeneratedMessages(messages) {
                const container = document.getElementById('generatedMessages');
                container.innerHTML = '';
                
                messages.forEach((msg, index) => {
                    const messageElement = this.createMessageElement(msg, index);
                    container.appendChild(messageElement);
                });
                
                // Update suggestion count
                document.getElementById('suggestionCount').textContent = 
                    `${messages.length} suggestions generated`;
            }

            createMessageElement(msg, index) {
                const div = document.createElement('div');
                div.className = 'commit-card rounded-xl p-5 hover:scale-[1.02] transition-transform';
                div.innerHTML = `
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center space-x-3">
                            <span class="text-2xl">${msg.emoji}</span>
                            <div>
                                <span class="tag tag-${msg.type} px-3 py-1 rounded-full text-xs font-medium">
                                    ${msg.type}
                                </span>
                                ${msg.scope ? `<span class="ml-2 text-xs text-gray-400">${msg.scope}</span>` : ''}
                            </div>
                            <span class="text-xs text-gray-500">${this.formatTimeAgo(msg.timestamp)}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button class="copy-btn p-2 text-gray-400 hover:text-green-400 hover:bg-gray-800 rounded-lg transition-colors" data-id="${msg.id}">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="edit-btn p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-colors" data-id="${msg.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="save-btn p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-800 rounded-lg transition-colors" data-id="${msg.id}">
                                <i class="fas fa-star"></i>
                            </button>
                        </div>
                    </div>
                    <div class="font-mono text-sm bg-gray-900 rounded-lg p-4 whitespace-pre-wrap border-l-4 border-${commitTypes[msg.type].color}-500 syntax-highlight">
                        ${msg.text}
                    </div>
                    <div class="flex items-center justify-between mt-3">
                        <div class="text-xs text-gray-500">
                            <i class="fas fa-code mr-1"></i>${msg.language}
                            <span class="mx-2">•</span>
                            <i class="fas fa-ruler mr-1"></i>${msg.text.length} chars
                        </div>
                        <div class="flex space-x-2">
                            <button class="use-btn px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-medium transition-colors" data-id="${msg.id}">
                                Use This
                            </button>
                        </div>
                    </div>
                `;
                
                // Add event listeners
                const copyBtn = div.querySelector('.copy-btn');
                const editBtn = div.querySelector('.edit-btn');
                const saveBtn = div.querySelector('.save-btn');
                const useBtn = div.querySelector('.use-btn');
                
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(msg.text);
                    copyBtn.classList.add('copy-success');
                    setTimeout(() => copyBtn.classList.remove('copy-success'), 500);
                    this.showToast('Copied!', 'Commit message copied to clipboard');
                });
                
                editBtn.addEventListener('click', () => {
                    this.editMessage(msg);
                });
                
                saveBtn.addEventListener('click', () => {
                    this.saveToHistory(msg);
                    saveBtn.innerHTML = '<i class="fas fa-check text-green-400"></i>';
                    setTimeout(() => {
                        saveBtn.innerHTML = '<i class="fas fa-star"></i>';
                    }, 2000);
                });
                
                useBtn.addEventListener('click', () => {
                    this.updateCopyCommand(msg.text);
                    this.showToast('Selected!', 'Updated git command with this message');
                });
                
                return div;
            }

            editMessage(msg) {
                const newText = prompt('Edit commit message:', msg.text);
                if (newText && newText.trim() !== msg.text) {
                    msg.text = newText.trim();
                    this.renderGeneratedMessages(this.state.currentMessages);
                    this.updateCopyCommand(msg.text);
                    this.showToast('Updated!', 'Commit message edited successfully');
                }
            }

            saveToHistory(msg) {
                const historyItem = {
                    ...msg,
                    id: Date.now(),
                    savedAt: new Date().toISOString(),
                    isSaved: true
                };
                
                this.state.history.unshift(historyItem);
                this.state.stats.saved++;
                
                // Keep only last 50 items
                if (this.state.history.length > 50) {
                    this.state.history = this.state.history.slice(0, 50);
                }
                
                this.saveToStorage();
                this.renderHistory();
                this.updateStatsDisplay();
                
                this.showToast('Saved!', 'Added to your history');
            }

            renderHistory() {
                const container = document.getElementById('historyList');
                const emptyHistory = document.getElementById('emptyHistory');
                
                if (this.state.history.length === 0) {
                    container.innerHTML = '';
                    container.appendChild(emptyHistory);
                    return;
                }
                
                container.innerHTML = '';
                
                this.state.history.slice(0, 10).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'history-item p-3 rounded-lg bg-gray-900/50';
                    div.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3 truncate">
                                <span class="text-lg">${item.emoji}</span>
                                <div class="truncate">
                                    <div class="font-medium text-sm truncate">${item.text.split('\n')[0]}</div>
                                    <div class="text-xs text-gray-500">
                                        ${item.type} • ${this.formatTimeAgo(item.savedAt)}
                                    </div>
                                </div>
                            </div>
                            <button class="copy-history-btn p-1 text-gray-400 hover:text-white" data-text="${this.escapeHtml(item.text)}">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    `;
                    
                    const copyBtn = div.querySelector('.copy-history-btn');
                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(item.text);
                        this.showToast('Copied!', 'Message copied from history');
                    });
                    
                    div.addEventListener('click', () => {
                        document.getElementById('descriptionInput').value = item.text.split('\n')[0];
                        this.state.selectedType = item.type;
                        document.querySelectorAll('.commit-type-btn').forEach(btn => {
                            btn.classList.toggle('active', btn.dataset.type === item.type);
                        });
                        this.showToast('Loaded!', 'Message loaded for editing');
                    });
                    
                    container.appendChild(div);
                });
            }

            updateStatsDisplay() {
                document.getElementById('totalCommits').textContent = this.state.stats.totalGenerated;
                document.getElementById('savedCommits').textContent = this.state.stats.saved;
                
                // Calculate average length
                if (this.state.history.length > 0) {
                    const totalLength = this.state.history.reduce((sum, item) => sum + item.text.length, 0);
                    const avgLength = Math.round(totalLength / this.state.history.length);
                    document.getElementById('avgLength').textContent = `${avgLength} chars`;
                    document.getElementById('lengthBar').style.width = `${Math.min(avgLength / 2, 100)}%`;
                }
                
                // Find most used type
                if (Object.keys(this.state.stats.typeCounts).length > 0) {
                    const topType = Object.entries(this.state.stats.typeCounts)
                        .sort((a, b) => b[1] - a[1])[0];
                    if (topType) {
                        document.getElementById('topType').textContent = topType[0];
                        const percentage = (topType[1] / this.state.stats.totalGenerated) * 100;
                        document.getElementById('typeBar').style.width = `${percentage}%`;
                    }
                }
            }

            updateCopyCommand(message) {
                const escapedMessage = this.escapeForCommand(message);
                const command = `git commit -m "${escapedMessage}"`;
                document.getElementById('copyCommand').innerHTML = 
                    `<span class="text-green-400">git commit -m</span> <span class="text-yellow-200">"${this.escapeHtml(message)}"</span>`;
                
                // Store for copy functionality
                document.getElementById('copyCommand').dataset.command = command;
            }

            loadTemplate(template) {
                const templates = {
                    bugfix: {
                        description: "Fixed issue where users couldn't reset passwords due to email validation bug",
                        type: "fix"
                    },
                    feature: {
                        description: "Added dark mode toggle with system preference detection",
                        type: "feat"
                    },
                    refactor: {
                        description: "Optimized database queries to reduce response time by 40%",
                        type: "refactor"
                    },
                    docs: {
                        description: "Updated API documentation with examples and error codes",
                        type: "docs"
                    }
                };
                
                const tmpl = templates[template];
                if (tmpl) {
                    document.getElementById('descriptionInput').value = tmpl.description;
                    this.state.selectedType = tmpl.type;
                    
                    // Update UI
                    document.querySelectorAll('.commit-type-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.type === tmpl.type);
                    });
                    
                    this.showToast('Template loaded!', 'Fill in the details and generate');
                }
            }

            exportHistory() {
                const data = {
                    exportedAt: new Date().toISOString(),
                    totalItems: this.state.history.length,
                    history: this.state.history
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `commit-history-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showToast('Exported!', 'History downloaded as JSON');
            }

            showToast(title, message) {
                const toast = document.getElementById('successToast');
                document.getElementById('toastTitle').textContent = title;
                document.getElementById('toastMessage').textContent = message;
                
                toast.classList.remove('translate-y-full');
                toast.classList.add('translate-y-0');
                
                setTimeout(() => {
                    toast.classList.remove('translate-y-0');
                    toast.classList.add('translate-y-full');
                }, 3000);
            }

            formatTimeAgo(timestamp) {
                const now = new Date();
                const past = new Date(timestamp);
                const diffMs = now - past;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 1) return 'just now';
                if (diffMins < 60) return `${diffMins}m ago`;
                if (diffHours < 24) return `${diffHours}h ago`;
                if (diffDays < 7) return `${diffDays}d ago`;
                return past.toLocaleDateString();
            }

            escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            escapeForCommand(text) {
                return text.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`');
            }
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            window.app = new CommitGenius();
        });
    