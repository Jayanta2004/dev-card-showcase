        // Docker commands database
        const dockerCommands = [
            {
                id: 1,
                title: "docker run",
                description: "Create and run a new container from an image",
                category: "container",
                difficulty: "basic",
                command: "docker run [OPTIONS] IMAGE [COMMAND] [ARG...]",
                parameters: [
                    "-d: Run container in background (detached mode)",
                    "-p: Publish a container's port to the host",
                    "--name: Assign a name to the container",
                    "-v: Bind mount a volume",
                    "-e: Set environment variables",
                    "-it: Run container interactively with a pseudo-TTY"
                ],
                example: "docker run -d -p 8080:80 --name mynginx nginx",
                exampleDescription: "Run Nginx web server in background, mapping host port 8080 to container port 80"
            },
            {
                id: 2,
                title: "docker ps",
                description: "List running containers",
                category: "container",
                difficulty: "basic",
                command: "docker ps [OPTIONS]",
                parameters: [
                    "-a: Show all containers (default shows just running)",
                    "-q: Only display container IDs",
                    "--format: Format output using a Go template",
                    "-s: Display total file sizes"
                ],
                example: "docker ps -a --format \"table {{.Names}}\\t{{.Status}}\\t{{.Ports}}\"",
                exampleDescription: "List all containers with custom formatted output"
            },
            {
                id: 3,
                title: "docker build",
                description: "Build an image from a Dockerfile",
                category: "image",
                difficulty: "intermediate",
                command: "docker build [OPTIONS] PATH | URL | -",
                parameters: [
                    "-t: Tag an image with a name",
                    "-f: Name of the Dockerfile (default is 'PATH/Dockerfile')",
                    "--no-cache: Do not use cache when building the image",
                    "--build-arg: Set build-time variables",
                    "--pull: Always attempt to pull a newer version of the image"
                ],
                example: "docker build -t myapp:latest -f Dockerfile.prod .",
                exampleDescription: "Build an image with a custom tag and Dockerfile name"
            },
            {
                id: 4,
                title: "docker images",
                description: "List local Docker images",
                category: "image",
                difficulty: "basic",
                command: "docker images [OPTIONS] [REPOSITORY[:TAG]]",
                parameters: [
                    "-a: Show all images (default hides intermediate images)",
                    "-q: Only show image IDs",
                    "--digests: Show digests",
                    "--no-trunc: Don't truncate output"
                ],
                example: "docker images --format \"table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}\"",
                exampleDescription: "List images with custom formatted output"
            },
            {
                id: 5,
                title: "docker stop",
                description: "Stop one or more running containers",
                category: "container",
                difficulty: "basic",
                command: "docker stop [OPTIONS] CONTAINER [CONTAINER...]",
                parameters: [
                    "-t: Seconds to wait before killing the container (default 10)",
                    "--signal: Signal to send to the container (default SIGTERM)"
                ],
                example: "docker stop mycontainer",
                exampleDescription: "Stop a container named 'mycontainer'"
            },
            {
                id: 6,
                title: "docker rm",
                description: "Remove one or more containers",
                category: "container",
                difficulty: "basic",
                command: "docker rm [OPTIONS] CONTAINER [CONTAINER...]",
                parameters: [
                    "-f: Force removal of a running container",
                    "-v: Remove volumes associated with the container",
                    "-l: Remove the specified link"
                ],
                example: "docker rm -f mycontainer",
                exampleDescription: "Forcefully remove a running container"
            },
            {
                id: 7,
                title: "docker rmi",
                description: "Remove one or more images",
                category: "image",
                difficulty: "basic",
                command: "docker rmi [OPTIONS] IMAGE [IMAGE...]",
                parameters: [
                    "-f: Force removal of the image",
                    "--no-prune: Do not delete untagged parents"
                ],
                example: "docker rmi myapp:oldversion",
                exampleDescription: "Remove a specific image tag"
            },
            {
                id: 8,
                title: "docker exec",
                description: "Execute a command in a running container",
                category: "container",
                difficulty: "intermediate",
                command: "docker exec [OPTIONS] CONTAINER COMMAND [ARG...]",
                parameters: [
                    "-it: Interactive mode with pseudo-TTY",
                    "-e: Set environment variables",
                    "-u: Username or UID",
                    "-w: Working directory inside the container"
                ],
                example: "docker exec -it mycontainer /bin/bash",
                exampleDescription: "Open an interactive bash shell in a running container"
            },
            {
                id: 9,
                title: "docker logs",
                description: "Fetch the logs of a container",
                category: "container",
                difficulty: "basic",
                command: "docker logs [OPTIONS] CONTAINER",
                parameters: [
                    "-f: Follow log output",
                    "--tail: Number of lines to show from the end of the logs",
                    "-t: Show timestamps",
                    "--since: Show logs since timestamp"
                ],
                example: "docker logs -f --tail 100 mycontainer",
                exampleDescription: "Follow the last 100 lines of logs from a container"
            },
            {
                id: 10,
                title: "docker network create",
                description: "Create a new Docker network",
                category: "network",
                difficulty: "intermediate",
                command: "docker network create [OPTIONS] NETWORK",
                parameters: [
                    "-d: Driver to use (bridge, overlay, etc.)",
                    "--subnet: Subnet in CIDR format",
                    "--ip-range: Allocate IPs from a sub-range",
                    "--gateway: IPv4 or IPv6 gateway for the network"
                ],
                example: "docker network create --driver bridge --subnet 172.20.0.0/16 mynetwork",
                exampleDescription: "Create a custom bridge network with a specific subnet"
            },
            {
                id: 11,
                title: "docker-compose up",
                description: "Create and start containers defined in docker-compose.yml",
                category: "compose",
                difficulty: "intermediate",
                command: "docker-compose up [OPTIONS] [SERVICE...]",
                parameters: [
                    "-d: Run containers in the background",
                    "--build: Build images before starting containers",
                    "--force-recreate: Recreate containers even if config hasn't changed",
                    "--scale: Scale services to the specified number"
                ],
                example: "docker-compose up -d --build",
                exampleDescription: "Start services in background, rebuilding images if needed"
            },
            {
                id: 12,
                title: "docker volume create",
                description: "Create a new volume",
                category: "volume",
                difficulty: "intermediate",
                command: "docker volume create [OPTIONS] [VOLUME]",
                parameters: [
                    "-d: Specify volume driver name",
                    "--label: Set metadata for a volume",
                    "--opt: Set driver specific options"
                ],
                example: "docker volume create --name mysqldata",
                exampleDescription: "Create a volume for MySQL data persistence"
            },
            {
                id: 13,
                title: "docker inspect",
                description: "Return low-level information on Docker objects",
                category: "system",
                difficulty: "intermediate",
                command: "docker inspect [OPTIONS] NAME|ID [NAME|ID...]",
                parameters: [
                    "-f: Format the output using the given Go template",
                    "--size: Display total file sizes if the type is container",
                    "--type: Return JSON for specified type"
                ],
                example: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mycontainer",
                exampleDescription: "Get the IP address of a container"
            },
            {
                id: 14,
                title: "docker pull",
                description: "Pull an image or a repository from a registry",
                category: "image",
                difficulty: "basic",
                command: "docker pull [OPTIONS] NAME[:TAG|@DIGEST]",
                parameters: [
                    "-a: Download all tagged images in the repository",
                    "--platform: Set platform if server is multi-platform capable",
                    "--quiet: Suppress verbose output"
                ],
                example: "docker pull nginx:alpine",
                exampleDescription: "Pull the lightweight alpine version of Nginx"
            },
            {
                id: 15,
                title: "docker push",
                description: "Push an image or a repository to a registry",
                category: "image",
                difficulty: "intermediate",
                command: "docker push [OPTIONS] NAME[:TAG]",
                parameters: [
                    "--disable-content-trust: Skip image signing (default true)",
                    "--quiet: Suppress verbose output"
                ],
                example: "docker push myusername/myapp:latest",
                exampleDescription: "Push an image to Docker Hub"
            }
        ];

        // Initialize variables
        let favorites = JSON.parse(localStorage.getItem('dockerFavorites')) || [];
        let currentCategory = 'all';
        let currentSearch = '';
        
        // DOM Elements
        const commandsGrid = document.getElementById('commandsGrid');
        const favoritesGrid = document.getElementById('favoritesGrid');
        const favoritesSection = document.getElementById('favoritesSection');
        const searchInput = document.getElementById('searchInput');
        const categoryItems = document.querySelectorAll('.category-item');
        const commandsCount = document.getElementById('commandsCount');
        const favoriteCount = document.getElementById('favoriteCount');
        const showFavoritesBtn = document.getElementById('showFavorites');
        const resetFavoritesBtn = document.getElementById('resetFavorites');
        const exportCommandsBtn = document.getElementById('exportCommands');
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            renderCommands();
            updateFavoriteCount();
            setupEventListeners();
        });
        
        // Set up event listeners
        function setupEventListeners() {
            // Category filter
            categoryItems.forEach(item => {
                item.addEventListener('click', function() {
                    categoryItems.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    currentCategory = this.dataset.category;
                    renderCommands();
                });
            });
            
            // Search functionality
            searchInput.addEventListener('input', function() {
                currentSearch = this.value.toLowerCase();
                renderCommands();
            });
            
            // Show favorites
            showFavoritesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleFavoritesSection();
            });
            
            // Reset favorites
            resetFavoritesBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm("Are you sure you want to remove all favorite commands?")) {
                    favorites = [];
                    localStorage.setItem('dockerFavorites', JSON.stringify(favorites));
                    updateFavoriteCount();
                    renderCommands();
                    if (favoritesSection.style.display === 'block') {
                        renderFavorites();
                    }
                }
            });
            
            // Export commands
            exportCommandsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                exportCommands();
            });
        }
        
        // Render commands based on current filter
        function renderCommands() {
            let filteredCommands = dockerCommands;
            
            // Apply category filter
            if (currentCategory !== 'all') {
                filteredCommands = filteredCommands.filter(cmd => cmd.category === currentCategory);
            }
            
            // Apply search filter
            if (currentSearch) {
                filteredCommands = filteredCommands.filter(cmd => 
                    cmd.title.toLowerCase().includes(currentSearch) ||
                    cmd.description.toLowerCase().includes(currentSearch) ||
                    cmd.command.toLowerCase().includes(currentSearch) ||
                    (cmd.parameters && cmd.parameters.some(param => param.toLowerCase().includes(currentSearch))) ||
                    (cmd.example && cmd.example.toLowerCase().includes(currentSearch))
                );
            }
            
            // Update commands count
            commandsCount.textContent = filteredCommands.length;
            
            // If no results
            if (filteredCommands.length === 0) {
                commandsGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>No commands found</h3>
                        <p>Try a different search term or select another category</p>
                    </div>
                `;
                return;
            }
            
            // Render command cards
            let commandsHTML = '';
            filteredCommands.forEach(cmd => {
                const isFavorite = favorites.includes(cmd.id);
                const difficultyClass = `tag-${cmd.difficulty}`;
                const categoryClass = `tag-${cmd.category}`;
                
                commandsHTML += `
                    <div class="command-card" data-id="${cmd.id}">
                        <div class="command-title">
                            <span>${cmd.title}</span>
                            <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${cmd.id}">
                                <i class="fas fa-star"></i>
                            </button>
                        </div>
                        
                        <div class="command-desc">${cmd.description}</div>
                        
                        <div>
                            <span class="tag ${difficultyClass}">${cmd.difficulty}</span>
                            <span class="tag ${categoryClass}">${cmd.category}</span>
                        </div>
                        
                        <div class="command-code">
                            <code>${cmd.command}</code>
                            <button class="copy-btn" data-command="${cmd.command.replace(/"/g, '&quot;')}">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        
                        ${cmd.parameters ? `
                        <div class="command-params">
                            <div class="param-title">Common Parameters:</div>
                            <ul class="param-list">
                                ${cmd.parameters.map(param => `<li>${param}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${cmd.example ? `
                        <div class="example-container">
                            <div class="example-title">
                                <i class="fas fa-code"></i> Example:
                            </div>
                            <div>${cmd.exampleDescription}</div>
                            <div class="example-code">
                                <code>${cmd.example}</code>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
            });
            
            commandsGrid.innerHTML = commandsHTML;
            
            // Add event listeners to copy buttons
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const command = this.getAttribute('data-command');
                    copyToClipboard(command);
                    
                    // Visual feedback
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    this.style.backgroundColor = '#66cc99';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.style.backgroundColor = '#FF9966';
                    }, 1500);
                });
            });
            
            // Add event listeners to favorite buttons
            document.querySelectorAll('.favorite-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = parseInt(this.getAttribute('data-id'));
                    toggleFavorite(id, this);
                });
            });
        }
        
        // Render favorite commands
        function renderFavorites() {
            const favoriteCommands = dockerCommands.filter(cmd => favorites.includes(cmd.id));
            
            if (favoriteCommands.length === 0) {
                favoritesGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-star"></i>
                        <h3>No favorite commands yet</h3>
                        <p>Click the star icon on any command to add it to favorites</p>
                    </div>
                `;
                return;
            }
            
            let favoritesHTML = '';
            favoriteCommands.forEach(cmd => {
                const isFavorite = favorites.includes(cmd.id);
                const difficultyClass = `tag-${cmd.difficulty}`;
                const categoryClass = `tag-${cmd.category}`;
                
                favoritesHTML += `
                    <div class="command-card" data-id="${cmd.id}">
                        <div class="command-title">
                            <span>${cmd.title}</span>
                            <button class="favorite-btn active" data-id="${cmd.id}">
                                <i class="fas fa-star"></i>
                            </button>
                        </div>
                        
                        <div class="command-desc">${cmd.description}</div>
                        
                        <div>
                            <span class="tag ${difficultyClass}">${cmd.difficulty}</span>
                            <span class="tag ${categoryClass}">${cmd.category}</span>
                        </div>
                        
                        <div class="command-code">
                            <code>${cmd.command}</code>
                            <button class="copy-btn" data-command="${cmd.command.replace(/"/g, '&quot;')}">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        
                        ${cmd.parameters ? `
                        <div class="command-params">
                            <div class="param-title">Common Parameters:</div>
                            <ul class="param-list">
                                ${cmd.parameters.map(param => `<li>${param}</li>`).join('')}
                            </ul>
                        </div>
                        ` : ''}
                        
                        ${cmd.example ? `
                        <div class="example-container">
                            <div class="example-title">
                                <i class="fas fa-code"></i> Example:
                            </div>
                            <div>${cmd.exampleDescription}</div>
                            <div class="example-code">
                                <code>${cmd.example}</code>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
            });
            
            favoritesGrid.innerHTML = favoritesHTML;
            
            // Add event listeners to copy buttons in favorites
            document.querySelectorAll('#favoritesGrid .copy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const command = this.getAttribute('data-command');
                    copyToClipboard(command);
                    
                    // Visual feedback
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    this.style.backgroundColor = '#66cc99';
                    
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.style.backgroundColor = '#FF9966';
                    }, 1500);
                });
            });
            
            // Add event listeners to favorite buttons in favorites
            document.querySelectorAll('#favoritesGrid .favorite-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const id = parseInt(this.getAttribute('data-id'));
                    toggleFavorite(id, this);
                });
            });
        }
        
        // Toggle favorite status
        function toggleFavorite(id, button) {
            const index = favorites.indexOf(id);
            
            if (index === -1) {
                // Add to favorites
                favorites.push(id);
                if (button) button.classList.add('active');
            } else {
                // Remove from favorites
                favorites.splice(index, 1);
                if (button) button.classList.remove('active');
            }
            
            // Save to localStorage
            localStorage.setItem('dockerFavorites', JSON.stringify(favorites));
            
            // Update UI
            updateFavoriteCount();
            
            // If favorites section is open, update it
            if (favoritesSection.style.display === 'block') {
                renderFavorites();
            }
        }
        
        // Toggle favorites section visibility
        function toggleFavoritesSection() {
            if (favoritesSection.style.display === 'block') {
                favoritesSection.style.display = 'none';
                showFavoritesBtn.textContent = 'View Favorites';
            } else {
                favoritesSection.style.display = 'block';
                showFavoritesBtn.textContent = 'Hide Favorites';
                renderFavorites();
            }
        }
        
        // Update favorite count display
        function updateFavoriteCount() {
            favoriteCount.textContent = favorites.length;
        }
        
        // Copy text to clipboard
        function copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        
        // Export commands to a text file
        function exportCommands() {
            let exportText = "DOCKER COMMAND REFERENCE\n";
            exportText += "=======================\n\n";
            
            dockerCommands.forEach((cmd, index) => {
                exportText += `${index + 1}. ${cmd.title}\n`;
                exportText += `   ${cmd.description}\n`;
                exportText += `   Command: ${cmd.command}\n`;
                
                if (cmd.parameters && cmd.parameters.length > 0) {
                    exportText += `   Common Parameters:\n`;
                    cmd.parameters.forEach(param => {
                        exportText += `     * ${param}\n`;
                    });
                }
                
                if (cmd.example) {
                    exportText += `   Example: ${cmd.example}\n`;
                    exportText += `   ${cmd.exampleDescription}\n`;
                }
                
                exportText += `   Category: ${cmd.category} | Difficulty: ${cmd.difficulty}\n`;
                exportText += `   ${favorites.includes(cmd.id) ? '⭐ FAVORITE' : ''}\n\n`;
            });
            
            exportText += `\nTotal Commands: ${dockerCommands.length}`;
            exportText += `\nFavorite Commands: ${favorites.length}`;
            exportText += `\nExported on: ${new Date().toLocaleDateString()}`;
            
            // Create download link
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'docker-commands-reference.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        
        // Add a sample command to demonstrate the functionality
        setTimeout(() => {
            // Auto-select a command to demonstrate the interface
            const firstCommandCard = document.querySelector('.command-card');
            if (firstCommandCard) {
                firstCommandCard.style.boxShadow = '0 0 0 3px rgba(255, 153, 102, 0.3)';
                setTimeout(() => {
                    firstCommandCard.style.boxShadow = '';
                }, 2000);
            }
        }, 1000);