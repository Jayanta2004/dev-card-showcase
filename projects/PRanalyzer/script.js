
        // DOM elements
        const prUrlInput = document.getElementById('pr-url');
        const analyzeBtn = document.getElementById('analyze-btn');
        const loadingEl = document.getElementById('loading');
        const errorMessageEl = document.getElementById('error-message');
        const errorTextEl = document.getElementById('error-text');
        const emptyStateEl = document.getElementById('empty-state');
        const resultsContainerEl = document.getElementById('results-container');
        const exampleLink = document.getElementById('example-link');
        
        // Results elements
        const prTitleEl = document.getElementById('pr-title');
        const prNumberEl = document.getElementById('pr-number');
        const prAuthorEl = document.getElementById('pr-author');
        const prDateEl = document.getElementById('pr-date');
        const prRepoEl = document.getElementById('pr-repo');
        const linesAddedEl = document.getElementById('lines-added');
        const linesDeletedEl = document.getElementById('lines-deleted');
        const filesChangedCountEl = document.getElementById('files-changed-count');
        const effortScoreEl = document.getElementById('effort-score');
        const effortDescriptionEl = document.getElementById('effort-description');
        const filesListEl = document.getElementById('files-list');

        // Set current year in footer
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Example PR link
        exampleLink.addEventListener('click', (e) => {
            e.preventDefault();
            prUrlInput.value = exampleLink.textContent;
        });

        // Parse GitHub PR URL
        function parseGitHubPRUrl(url) {
            try {
                const urlObj = new URL(url);
                
                // Check if it's a GitHub URL
                if (urlObj.hostname !== 'github.com') {
                    throw new Error('Please enter a valid GitHub URL');
                }
                
                // Extract path parts
                const pathParts = urlObj.pathname.split('/').filter(part => part.trim() !== '');
                
                // Check if it's a PR URL (format: /owner/repo/pull/prNumber)
                if (pathParts.length < 4 || pathParts[2] !== 'pull') {
                    throw new Error('Please enter a valid GitHub Pull Request URL');
                }
                
                const owner = pathParts[0];
                const repo = pathParts[1];
                const prNumber = pathParts[3];
                
                return { owner, repo, prNumber };
            } catch (error) {
                throw new Error('Invalid URL format. Please use: https://github.com/owner/repo/pull/123');
            }
        }

        // Calculate effort score
        function calculateEffortScore(files, totalAdditions, totalDeletions) {
            // Base score from lines changed
            let score = Math.sqrt(totalAdditions + totalDeletions) * 2;
            
            // Factor in number of files (more files = more complexity)
            score += files.length * 3;
            
            // Factor in file types (code files are more complex than docs)
            let codeFiles = 0;
            files.forEach(file => {
                const filename = file.filename.toLowerCase();
                if (filename.endsWith('.js') || filename.endsWith('.ts') || filename.endsWith('.py') || 
                    filename.endsWith('.java') || filename.endsWith('.cpp') || filename.endsWith('.c') ||
                    filename.endsWith('.cs') || filename.endsWith('.go') || filename.endsWith('.rs') ||
                    filename.endsWith('.php') || filename.endsWith('.rb') || filename.endsWith('.swift')) {
                    codeFiles++;
                }
            });
            
            score += codeFiles * 5;
            
            // Normalize score to 0-100 scale
            score = Math.min(100, Math.round(score));
            
            // Determine effort level
            let level, description;
            if (score < 30) {
                level = 'effort-low';
                description = 'Low effort - Simple changes';
            } else if (score < 70) {
                level = 'effort-medium';
                description = 'Medium effort - Moderate changes';
            } else {
                level = 'effort-high';
                description = 'High effort - Complex changes';
            }
            
            return { score, level, description };
        }

        // Format date
        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Show error message
        function showError(message) {
            errorTextEl.textContent = message;
            errorMessageEl.classList.remove('hidden');
            setTimeout(() => {
                errorMessageEl.classList.add('hidden');
            }, 5000);
        }

        // Fetch PR data from GitHub API
        async function fetchPRData(owner, repo, prNumber) {
            // Show loading state
            loadingEl.classList.remove('hidden');
            analyzeBtn.disabled = true;
            
            try {
                // Fetch PR details
                const prUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
                const prResponse = await fetch(prUrl);
                
                if (!prResponse.ok) {
                    if (prResponse.status === 404) {
                        throw new Error('Pull Request not found. Check if the PR exists and is public.');
                    } else {
                        throw new Error(`GitHub API error: ${prResponse.status}`);
                    }
                }
                
                const prData = await prResponse.json();
                
                // Fetch PR files
                const filesUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;
                const filesResponse = await fetch(filesUrl);
                
                if (!filesResponse.ok) {
                    throw new Error(`Failed to fetch PR files: ${filesResponse.status}`);
                }
                
                const filesData = await filesResponse.json();
                
                // Process the data
                processPRData(prData, filesData);
                
            } catch (error) {
                showError(error.message);
                console.error('Error fetching PR data:', error);
            } finally {
                // Hide loading state
                loadingEl.classList.add('hidden');
                analyzeBtn.disabled = false;
            }
        }

        // Process and display PR data
        function processPRData(prData, filesData) {
            // Calculate totals
            let totalAdditions = 0;
            let totalDeletions = 0;
            
            filesData.forEach(file => {
                totalAdditions += file.additions;
                totalDeletions += file.deletions;
            });
            
            // Calculate effort score
            const effort = calculateEffortScore(filesData, totalAdditions, totalDeletions);
            
            // Update UI with PR info
            prTitleEl.textContent = prData.title;
            prNumberEl.textContent = prData.number;
            prAuthorEl.textContent = prData.user.login;
            prDateEl.textContent = formatDate(prData.created_at);
            prRepoEl.textContent = `${prData.base.repo.full_name}`;
            
            // Update metrics
            linesAddedEl.textContent = totalAdditions.toLocaleString();
            linesDeletedEl.textContent = totalDeletions.toLocaleString();
            filesChangedCountEl.textContent = filesData.length.toLocaleString();
            
            // Update effort score
            effortScoreEl.textContent = effort.score;
            effortScoreEl.className = 'metric-value ' + effort.level;
            effortDescriptionEl.textContent = effort.description;
            
            // Update files list
            filesListEl.innerHTML = '';
            filesData.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                // Truncate long filenames
                let displayName = file.filename;
                if (displayName.length > 50) {
                    displayName = '...' + displayName.substring(displayName.length - 47);
                }
                
                fileItem.innerHTML = `
                    <div class="file-name">${displayName}</div>
                    <div class="file-stats">
                        <span class="file-additions">+${file.additions}</span>
                        <span class="file-deletions">-${file.deletions}</span>
                    </div>
                `;
                
                filesListEl.appendChild(fileItem);
            });
            
            // Show results and hide empty state
            emptyStateEl.classList.add('hidden');
            resultsContainerEl.classList.remove('hidden');
            
            // Scroll to results on mobile
            if (window.innerWidth < 992) {
                resultsContainerEl.scrollIntoView({ behavior: 'smooth' });
            }
        }

        // Handle analyze button click
        analyzeBtn.addEventListener('click', () => {
            const url = prUrlInput.value.trim();
            
            if (!url) {
                showError('Please enter a GitHub PR URL');
                return;
            }
            
            try {
                const { owner, repo, prNumber } = parseGitHubPRUrl(url);
                fetchPRData(owner, repo, prNumber);
            } catch (error) {
                showError(error.message);
            }
        });

        // Handle Enter key in input field
        prUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                analyzeBtn.click();
            }
        });

        // Pre-fill with example on first load
        window.addEventListener('load', () => {
            // Check if URL has a PR parameter
            const urlParams = new URLSearchParams(window.location.search);
            const prParam = urlParams.get('pr');
            
            if (prParam) {
                prUrlInput.value = prParam;
                analyzeBtn.click();
            }
        });
    