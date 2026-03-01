        // Git command database
        const gitCommands = {
            "init": {
                command: "git init",
                explanation: "Initializes a new Git repository in the current directory. Creates a .git folder with all necessary repository files.",
                example: "git init"
            },
            "clone": {
                command: "git clone https://github.com/username/repository.git",
                explanation: "Creates a copy of a remote repository on your local machine. Replace the URL with the actual repository URL.",
                example: "git clone https://github.com/username/repository.git"
            },
            "remote-add": {
                command: "git remote add origin https://github.com/username/repository.git",
                explanation: "Adds a remote repository URL with the name 'origin'. This is typically done after initializing a repository to connect it to a remote.",
                example: "git remote add origin https://github.com/username/repository.git"
            },
            "status": {
                command: "git status",
                explanation: "Shows the state of the working directory and staging area. Displays which changes have been staged, which haven't, and which files aren't being tracked by Git.",
                example: "git status"
            },
            "add": {
                command: "git add .",
                explanation: "Stages all changes in the current directory for commit. You can also specify individual files instead of '.' to add specific files.",
                example: "git add ."
            },
            "commit": {
                command: 'git commit -m "Your commit message here"',
                explanation: "Records changes to the repository with a descriptive message. The -m flag allows you to add a commit message directly in the command.",
                example: 'git commit -m "Add new feature"'
            },
            "diff": {
                command: "git diff",
                explanation: "Shows changes between the working directory and the staging area. Add --staged to see changes between the staging area and the last commit.",
                example: "git diff"
            },
            "branch": {
                command: "git branch new-feature",
                explanation: "Creates a new branch called 'new-feature'. This doesn't switch to the new branch; use 'git checkout new-feature' to switch.",
                example: "git branch new-feature"
            },
            "switch": {
                command: "git checkout main",
                explanation: "Switches to the 'main' branch. You can also use 'git switch main' in newer versions of Git.",
                example: "git checkout main"
            },
            "merge": {
                command: "git merge feature-branch",
                explanation: "Merges changes from 'feature-branch' into the current branch. This combines the branch histories.",
                example: "git merge feature-branch"
            },
            "rebase": {
                command: "git rebase main",
                explanation: "Reapplies commits from the current branch on top of another base branch (main). This creates a linear project history.",
                example: "git rebase main"
            },
            "fetch": {
                command: "git fetch origin",
                explanation: "Downloads objects and refs from a remote repository without merging them into your local branches. This updates your remote-tracking branches.",
                example: "git fetch origin"
            },
            "pull": {
                command: "git pull origin main",
                explanation: "Fetches from and integrates with another repository or local branch. This is equivalent to 'git fetch' followed by 'git merge'.",
                example: "git pull origin main"
            },
            "push": {
                command: "git push origin main",
                explanation: "Updates remote refs along with associated objects. Pushes your local commits to the 'main' branch on the 'origin' remote.",
                example: "git push origin main"
            },
            "remote-update": {
                command: "git remote set-url origin https://github.com/username/new-repository.git",
                explanation: "Changes the URL of an existing remote repository. Useful if you've moved repositories or need to update authentication.",
                example: "git remote set-url origin https://github.com/username/new-repository.git"
            },
            "restore": {
                command: "git restore file.txt",
                explanation: "Discards changes in the working directory for the specified file. This reverts the file to its state in the last commit.",
                example: "git restore file.txt"
            },
            "reset": {
                command: "git reset HEAD file.txt",
                explanation: "Unstages a file while keeping the changes in the working directory. Removes the file from the staging area.",
                example: "git reset HEAD file.txt"
            },
            "revert": {
                command: "git revert HEAD",
                explanation: "Creates a new commit that undoes the changes made in a previous commit. This is a safe way to undo changes as it doesn't rewrite history.",
                example: "git revert HEAD"
            },
            "amend": {
                command: "git commit --amend",
                explanation: "Allows you to modify the most recent commit. You can change the commit message or add forgotten files to the commit.",
                example: "git commit --amend"
            }
        };
        
        // DOM Elements
        const scenarioButtons = document.querySelectorAll('.scenario-btn');
        const quickCmdButtons = document.querySelectorAll('.quick-cmd');
        const commandOutput = document.getElementById('commandOutput');
        const explanationText = document.getElementById('explanationText');
        const copyBtn = document.getElementById('copyBtn');
        const executeBtn = document.getElementById('executeBtn');
        const resetBtn = document.getElementById('resetBtn');
        const notification = document.getElementById('notification');
        
        // Initialize with first scenario
        displayCommand('init');
        
        // Add event listeners to scenario buttons
        scenarioButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                scenarioButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get the scenario from data attribute
                const scenario = this.getAttribute('data-scenario');
                
                // Display the corresponding command
                displayCommand(scenario);
            });
        });
        
        // Add event listeners to quick command buttons
        quickCmdButtons.forEach(button => {
            button.addEventListener('click', function() {
                const command = this.getAttribute('data-cmd');
                commandOutput.textContent = command;
                explanationText.textContent = "Quick command reference. Click on scenario buttons above for more detailed explanations.";
                
                // Highlight the corresponding scenario button if it exists
                scenarioButtons.forEach(btn => {
                    btn.classList.remove('active');
                    const scenario = btn.getAttribute('data-scenario');
                    if (gitCommands[scenario] && gitCommands[scenario].example === command) {
                        btn.classList.add('active');
                    }
                });
            });
        });
        
        // Copy button functionality
        copyBtn.addEventListener('click', function() {
            const command = commandOutput.textContent;
            
            // Use the Clipboard API if available
            if (navigator.clipboard) {
                navigator.clipboard.writeText(command)
                    .then(() => showNotification())
                    .catch(err => console.error('Failed to copy: ', err));
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = command;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification();
            }
        });
        
        // Execute button functionality (simulated)
        executeBtn.addEventListener('click', function() {
            const command = commandOutput.textContent;
            
            // Show a simulation message
            explanationText.innerHTML = `<strong>Simulating execution:</strong> ${command}<br><br>
            <em>Note: This is a simulation. In a real terminal, this command would execute and produce output based on your repository state.</em>`;
            
            // Change button temporarily
            const originalText = executeBtn.innerHTML;
            executeBtn.innerHTML = '<i class="fas fa-check"></i> Simulated';
            executeBtn.style.backgroundColor = '#f39c12';
            
            setTimeout(() => {
                executeBtn.innerHTML = originalText;
                executeBtn.style.backgroundColor = '';
            }, 1500);
        });
        
        // Reset button functionality
        resetBtn.addEventListener('click', function() {
            // Reset to initial state
            displayCommand('init');
            
            // Remove active class from all scenario buttons
            scenarioButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to init button
            document.querySelector('[data-scenario="init"]').classList.add('active');
            
            // Show reset notification
            explanationText.textContent = "Reset to initial state. Select a scenario to generate a Git command.";
        });
        
        // Function to display a command
        function displayCommand(scenario) {
            const commandData = gitCommands[scenario];
            if (commandData) {
                commandOutput.textContent = commandData.example;
                explanationText.textContent = commandData.explanation;
            }
        }
        
        // Function to show notification
        function showNotification() {
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
        
        // Initialize with first button active
        document.querySelector('[data-scenario="init"]').classList.add('active');