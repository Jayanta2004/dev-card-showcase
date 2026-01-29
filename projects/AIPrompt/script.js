        // Sample prompt data
        const prompts = [
            {
                id: 1,
                title: "Cyberpunk Cityscape at Night",
                content: "A breathtaking cyberpunk cityscape at night, neon lights reflecting on wet streets, towering skyscrapers with holographic advertisements, flying cars, dark moody atmosphere, cinematic lighting, highly detailed, digital art, 8K resolution",
                category: "art",
                likes: 42,
                isLiked: false,
                isSaved: false
            },
            {
                id: 2,
                title: "Fantasy Novel Opening",
                content: "Write the opening paragraph of a fantasy novel where magic is forbidden but returns in an unexpected way. Include vivid sensory details, establish a mysterious atmosphere, and hint at a coming conflict between tradition and change.",
                category: "writing",
                likes: 31,
                isLiked: false,
                isSaved: false
            },
            {
                id: 3,
                title: "Minimalist Website Design",
                content: "Create a minimalist website design with ample white space, elegant typography, subtle animations, and a cohesive color palette of soft neutrals. Focus on user experience, loading speed, and mobile responsiveness.",
                category: "code",
                likes: 28,
                isLiked: false,
                isSaved: false
            },
            {
                id: 4,
                title: "Surreal Portrait Photography",
                content: "A surreal portrait photograph where the subject's face is partially made of flowers, with soft natural lighting, shallow depth of field, ethereal atmosphere, muted color palette, fine art photography style",
                category: "photo",
                likes: 56,
                isLiked: false,
                isSaved: false
            },
            {
                id: 5,
                title: "AI Assistant Personality",
                content: "Design a helpful, witty, and slightly sarcastic AI assistant personality that can explain complex topics in simple terms, make appropriate jokes, and adapt its communication style based on user preferences.",
                category: "creative",
                likes: 39,
                isLiked: false,
                isSaved: false
            },
            {
                id: 6,
                title: "Anime Style Character Design",
                content: "Design a character in anime style: a mysterious traveler with heterochromatic eyes, flowing silver hair, intricate fantasy clothing with glowing runes, carrying an ancient book, standing in a mystical forest, vibrant colors, detailed line art",
                category: "art",
                likes: 67,
                isLiked: false,
                isSaved: false
            },
            {
                id: 7,
                title: "Science Fiction Short Story",
                content: "Write a short story about the first human-AI friendship in a world where emotions are considered inefficient. Explore themes of consciousness, what it means to be alive, and the value of irrational human qualities.",
                category: "writing",
                likes: 45,
                isLiked: false,
                isSaved: false
            },
            {
                id: 8,
                title: "E-commerce Product Card",
                content: "Code a modern e-commerce product card component with hover effects, add-to-cart animation, discount badges, color swatches, and a quick view modal. Use CSS Grid for layout and CSS variables for theming.",
                category: "code",
                likes: 33,
                isLiked: false,
                isSaved: false
            },
            {
                id: 9,
                title: "Macro Nature Photography",
                content: "Extreme macro photography of dewdrops on a spiderweb at sunrise, each droplet acting as a tiny lens refracting the morning light, vibrant colors, incredible detail, natural background blur, professional photography",
                category: "photo",
                likes: 51,
                isLiked: false,
                isSaved: false
            },
            {
                id: 10,
                title: "Futuristic Product Concept",
                content: "Conceptualize a futuristic wearable device that enhances human perception. Describe its form, function, user interface, and how it integrates seamlessly into daily life while addressing privacy concerns.",
                category: "creative",
                likes: 48,
                isLiked: false,
                isSaved: false
            },
            {
                id: 11,
                title: "Impressionist Landscape Painting",
                content: "An impressionist oil painting of a lavender field at sunset, visible brush strokes, warm golden hour light, hazy atmospheric perspective, soft focus, inspired by Monet, peaceful and dreamy mood",
                category: "art",
                likes: 37,
                isLiked: false,
                isSaved: false
            },
            {
                id: 12,
                title: "Poetry About Technology",
                content: "Write a poem that explores the relationship between humanity and technology, using metaphors from nature. Consider themes of connection, isolation, progress, and what we gain and lose in the digital age.",
                category: "writing",
                likes: 29,
                isLiked: false,
                isSaved: false
            }
        ];

        // State
        let currentCategory = 'all';
        let searchTerm = '';
        let savedPrompts = [];
        let likedCount = 0;

        // DOM Elements
        const promptsGrid = document.getElementById('promptsGrid');
        const categoryButtons = document.querySelectorAll('.category-btn');
        const searchInput = document.getElementById('searchInput');
        const savedCountElement = document.getElementById('savedCount');
        const savedBadge = document.getElementById('savedBadge');
        const likesCountElement = document.getElementById('likesCount');
        const totalPromptsElement = document.getElementById('totalPrompts');
        const viewSavedBtn = document.getElementById('viewSavedBtn');
        const savedSidebar = document.getElementById('savedSidebar');
        const closeSidebar = document.getElementById('closeSidebar');
        const savedPromptsList = document.getElementById('savedPromptsList');
        const copyModal = document.getElementById('copyModal');
        const closeModal = document.getElementById('closeModal');

        // Initialize
        function init() {
            renderPrompts();
            setupEventListeners();
            updateStats();
            loadSavedPrompts();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Category filter
            categoryButtons.forEach(button => {
                button.addEventListener('click', () => {
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    currentCategory = button.dataset.category;
                    renderPrompts();
                });
            });

            // Search
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value.toLowerCase();
                renderPrompts();
            });

            // Saved prompts sidebar
            viewSavedBtn.addEventListener('click', () => {
                savedSidebar.classList.add('active');
            });

            closeSidebar.addEventListener('click', () => {
                savedSidebar.classList.remove('active');
            });

            // Modal
            closeModal.addEventListener('click', () => {
                copyModal.style.display = 'none';
            });

            // Close modal on outside click
            copyModal.addEventListener('click', (e) => {
                if (e.target === copyModal) {
                    copyModal.style.display = 'none';
                }
            });
        }

        // Render prompts based on filter and search
        function renderPrompts() {
            promptsGrid.innerHTML = '';
            
            const filteredPrompts = prompts.filter(prompt => {
                // Category filter
                if (currentCategory !== 'all' && prompt.category !== currentCategory) {
                    return false;
                }
                
                // Search filter
                if (searchTerm) {
                    const searchContent = prompt.title.toLowerCase() + ' ' + prompt.content.toLowerCase();
                    if (!searchContent.includes(searchTerm)) {
                        return false;
                    }
                }
                
                return true;
            });
            
            totalPromptsElement.textContent = filteredPrompts.length;
            
            filteredPrompts.forEach(prompt => {
                const promptCard = createPromptCard(prompt);
                promptsGrid.appendChild(promptCard);
            });
        }

        // Create prompt card element
        function createPromptCard(prompt) {
            const card = document.createElement('div');
            card.className = 'prompt-card';
            card.dataset.id = prompt.id;
            
            const categoryLabel = getCategoryLabel(prompt.category);
            
            card.innerHTML = `
                <div class="prompt-header">
                    <span class="prompt-category">${categoryLabel}</span>
                    <h3 class="prompt-title">${prompt.title}</h3>
                </div>
                <div class="prompt-content">
                    <div class="prompt-text">${prompt.content}</div>
                    <div class="prompt-meta">
                        <span>${prompt.likes} likes</span>
                    </div>
                </div>
                <div class="prompt-footer">
                    <button class="btn btn-copy" data-id="${prompt.id}">
                        📋 Copy Prompt
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-like ${prompt.isLiked ? 'liked' : ''}" data-id="${prompt.id}">
                            ${prompt.isLiked ? '❤️ Liked' : '🤍 Like'}
                        </button>
                        <button class="btn btn-save ${prompt.isSaved ? 'saved' : ''}" data-id="${prompt.id}">
                            ${prompt.isSaved ? '⭐ Saved' : '☆ Save'}
                        </button>
                    </div>
                </div>
            `;
            
            // Add event listeners to buttons
            const copyBtn = card.querySelector('.btn-copy');
            const likeBtn = card.querySelector('.btn-like');
            const saveBtn = card.querySelector('.btn-save');
            
            copyBtn.addEventListener('click', () => copyPrompt(prompt));
            likeBtn.addEventListener('click', () => toggleLike(prompt));
            saveBtn.addEventListener('click', () => toggleSave(prompt));
            
            return card;
        }

        // Copy prompt to clipboard
        function copyPrompt(prompt) {
            navigator.clipboard.writeText(prompt.content)
                .then(() => {
                    copyModal.style.display = 'flex';
                    setTimeout(() => {
                        copyModal.style.display = 'none';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        }

        // Toggle like
        function toggleLike(prompt) {
            prompt.isLiked = !prompt.isLiked;
            
            if (prompt.isLiked) {
                prompt.likes++;
                likedCount++;
            } else {
                prompt.likes--;
                likedCount--;
            }
            
            updateStats();
            renderPrompts();
        }

        // Toggle save
        function toggleSave(prompt) {
            prompt.isSaved = !prompt.isSaved;
            
            if (prompt.isSaved) {
                savedPrompts.push(prompt);
            } else {
                savedPrompts = savedPrompts.filter(p => p.id !== prompt.id);
            }
            
            updateStats();
            renderPrompts();
            updateSavedSidebar();
        }

        // Update stats
        function updateStats() {
            const savedPromptsCount = prompts.filter(p => p.isSaved).length;
            savedCountElement.textContent = savedPromptsCount;
            savedBadge.textContent = savedPromptsCount;
            
            const totalLikes = prompts.reduce((sum, prompt) => sum + prompt.likes, 0);
            likesCountElement.textContent = totalLikes;
        }

        // Get category label
        function getCategoryLabel(category) {
            const labels = {
                'art': '🎨 Art & Design',
                'writing': '✍️ Writing',
                'code': '💻 Code & Tech',
                'photo': '📸 Photography',
                'creative': '✨ Creative'
            };
            return labels[category] || category;
        }

        // Update saved prompts sidebar
        function updateSavedSidebar() {
            savedPromptsList.innerHTML = '';
            
            if (savedPrompts.length === 0) {
                savedPromptsList.innerHTML = `
                    <div style="text-align: center; color: var(--secondary-color); padding: 40px 20px;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">📚</div>
                        <p>No saved prompts yet.</p>
                        <p>Click the ☆ Save button on any prompt to add it here.</p>
                    </div>
                `;
                return;
            }
            
            savedPrompts.forEach(prompt => {
                const savedItem = document.createElement('div');
                savedItem.className = 'saved-prompt-item';
                savedItem.innerHTML = `
                    <div class="saved-prompt-title">${prompt.title}</div>
                    <div class="saved-prompt-text">${prompt.content.substring(0, 100)}...</div>
                    <button class="remove-saved" data-id="${prompt.id}">
                        🗑️ Remove
                    </button>
                `;
                
                const removeBtn = savedItem.querySelector('.remove-saved');
                removeBtn.addEventListener('click', () => toggleSave(prompt));
                
                savedPromptsList.appendChild(savedItem);
            });
        }

        // Load saved prompts from localStorage
        function loadSavedPrompts() {
            const savedIds = JSON.parse(localStorage.getItem('savedPromptIds') || '[]');
            savedIds.forEach(id => {
                const prompt = prompts.find(p => p.id === id);
                if (prompt) {
                    prompt.isSaved = true;
                    savedPrompts.push(prompt);
                }
            });
            
            const likedIds = JSON.parse(localStorage.getItem('likedPromptIds') || '[]');
            likedIds.forEach(id => {
                const prompt = prompts.find(p => p.id === id);
                if (prompt) {
                    prompt.isLiked = true;
                    likedCount++;
                }
            });
            
            updateStats();
            updateSavedSidebar();
        }

        // Save to localStorage when changes occur
        function saveToLocalStorage() {
            const savedIds = prompts.filter(p => p.isSaved).map(p => p.id);
            const likedIds = prompts.filter(p => p.isLiked).map(p => p.id);
            
            localStorage.setItem('savedPromptIds', JSON.stringify(savedIds));
            localStorage.setItem('likedPromptIds', JSON.stringify(likedIds));
        }

        // Initialize the gallery
        init();
        
        // Save to localStorage periodically
        setInterval(saveToLocalStorage, 2000);