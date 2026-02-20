
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const sky = document.getElementById('sky');
            const stars = document.getElementById('stars');
            const celestialBody = document.getElementById('celestial-body');
            const thoughtInput = document.getElementById('thoughtInput');
            const charCount = document.getElementById('charCount');
            const addCloudBtn = document.getElementById('addCloudBtn');
            const clearBtn = document.getElementById('clearBtn');
            const saveBtn = document.getElementById('saveBtn');
            const cloudsContainer = document.getElementById('cloudsContainer');
            const emptyClouds = document.getElementById('emptyClouds');
            const timeButtons = document.querySelectorAll('.time-btn');
            const moodButtons = document.querySelectorAll('.mood-btn');
            
            // State
            let currentTime = 'noon';
            let currentMood = 'happy';
            let clouds = [];
            let nextCloudId = 1;
            let isDragging = false;
            let dragCloud = null;
            let dragOffsetX = 0;
            let dragOffsetY = 0;
            
            // Time of day settings
            const timeSettings = {
                dawn: {
                    gradient: 'var(--dawn-gradient)',
                    celestialColor: '#ff9966',
                    celestialPosition: { x: 20, y: 70 },
                    starOpacity: 0
                },
                morning: {
                    gradient: 'var(--morning-gradient)',
                    celestialColor: '#ffcc33',
                    celestialPosition: { x: 30, y: 50 },
                    starOpacity: 0
                },
                noon: {
                    gradient: 'var(--noon-gradient)',
                    celestialColor: '#ffff66',
                    celestialPosition: { x: 50, y: 30 },
                    starOpacity: 0
                },
                afternoon: {
                    gradient: 'var(--afternoon-gradient)',
                    celestialColor: '#ff9966',
                    celestialPosition: { x: 70, y: 40 },
                    starOpacity: 0
                },
                dusk: {
                    gradient: 'var(--dusk-gradient)',
                    celestialColor: '#ff6699',
                    celestialPosition: { x: 80, y: 60 },
                    starOpacity: 0.2
                },
                night: {
                    gradient: 'var(--night-gradient)',
                    celestialColor: '#f0f0f0',
                    celestialPosition: { x: 30, y: 40 },
                    starOpacity: 0.8
                },
                midnight: {
                    gradient: 'var(--midnight-gradient)',
                    celestialColor: '#cccccc',
                    celestialPosition: { x: 70, y: 50 },
                    starOpacity: 1
                }
            };
            
            // Mood settings
            const moodSettings = {
                happy: { color: '#fff9c4', emoji: '😊' },
                calm: { color: '#e3f2fd', emoji: '😌' },
                thoughtful: { color: '#f3e5f5', emoji: '🤔' },
                dreamy: { color: '#fce4ec', emoji: '🌙' },
                sad: { color: '#e8eaf6', emoji: '😢' },
                excited: { color: '#ffecb3', emoji: '🎉' }
            };
            
            // Initialize
            function init() {
                // Load saved clouds from localStorage
                loadClouds();
                
                // Set up event listeners
                setupEventListeners();
                
                // Set initial time of day
                setTimeOfDay('noon');
                
                // Create stars
                createStars();
                
                // Add sample clouds if no clouds exist
                if (clouds.length === 0) {
                    addSampleClouds();
                }
                
                // Update character count
                updateCharCount();
            }
            
            // Set up event listeners
            function setupEventListeners() {
                // Thought input
                thoughtInput.addEventListener('input', updateCharCount);
                
                // Add cloud button
                addCloudBtn.addEventListener('click', addCloud);
                
                // Clear all button
                clearBtn.addEventListener('click', clearAllClouds);
                
                // Save button
                saveBtn.addEventListener('click', saveDiary);
                
                // Time of day buttons
                timeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const time = this.getAttribute('data-time');
                        setTimeOfDay(time);
                        
                        // Update active button
                        timeButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                
                // Mood buttons
                moodButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const mood = this.getAttribute('data-mood');
                        setCurrentMood(mood);
                        
                        // Update active button
                        moodButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                
                // Allow pressing Enter to add cloud (with Ctrl/Shift)
                thoughtInput.addEventListener('keydown', function(e) {
                    if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
                        addCloud();
                    }
                });
                
                // Drag and drop for clouds
                document.addEventListener('mousedown', startDrag);
                document.addEventListener('mousemove', drag);
                document.addEventListener('mouseup', stopDrag);
                
                // Touch events for mobile
                document.addEventListener('touchstart', startDragTouch);
                document.addEventListener('touchmove', dragTouch);
                document.addEventListener('touchend', stopDrag);
            }
            
            // Update character count
            function updateCharCount() {
                const length = thoughtInput.value.length;
                charCount.textContent = length;
                
                // Change color if approaching limit
                if (length > 180) {
                    charCount.style.color = '#ff6b6b';
                } else if (length > 150) {
                    charCount.style.color = '#ffa726';
                } else {
                    charCount.style.color = '#777';
                }
            }
            
            // Set time of day
            function setTimeOfDay(time) {
                currentTime = time;
                const settings = timeSettings[time];
                
                // Update sky gradient
                sky.style.background = settings.gradient;
                
                // Update celestial body (sun/moon)
                celestialBody.style.background = settings.celestialColor;
                celestialBody.style.left = `calc(${settings.celestialPosition.x}% - 40px)`;
                celestialBody.style.top = `calc(${settings.celestialPosition.y}% - 40px)`;
                
                // Update stars visibility
                stars.style.opacity = settings.starOpacity;
                
                // Save preference
                localStorage.setItem('cloudDiaryTime', time);
            }
            
            // Create stars for night sky
            function createStars() {
                const starsContainer = document.getElementById('stars');
                starsContainer.innerHTML = '';
                
                // Create 150 stars
                for (let i = 0; i < 150; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    
                    // Random position and size
                    const size = Math.random() * 3 + 1;
                    const x = Math.random() * 100;
                    const y = Math.random() * 100;
                    
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    star.style.left = `${x}%`;
                    star.style.top = `${y}%`;
                    
                    // Random opacity
                    star.style.opacity = Math.random() * 0.8 + 0.2;
                    
                    // Add twinkle animation
                    star.style.animation = `twinkle ${Math.random() * 5 + 3}s infinite alternate`;
                    
                    starsContainer.appendChild(star);
                }
            }
            
            // Set current mood
            function setCurrentMood(mood) {
                currentMood = mood;
            }
            
            // Add a new cloud
            function addCloud() {
                const text = thoughtInput.value.trim();
                
                if (text === '') {
                    alert('Please write something before adding a cloud!');
                    thoughtInput.focus();
                    return;
                }
                
                // Create cloud object
                const cloud = {
                    id: nextCloudId++,
                    text: text,
                    mood: currentMood,
                    timestamp: new Date().toLocaleString(),
                    position: {
                        x: Math.random() * 70 + 5, // 5-75%
                        y: Math.random() * 70 + 5  // 5-75%
                    },
                    rotation: Math.random() * 20 - 10 // -10 to 10 degrees
                };
                
                // Add to array
                clouds.push(cloud);
                
                // Save to localStorage
                saveClouds();
                
                // Create cloud element
                createCloudElement(cloud);
                
                // Clear input
                thoughtInput.value = '';
                updateCharCount();
                
                // Hide empty state
                emptyClouds.style.display = 'none';
            }
            
            // Create cloud element
            function createCloudElement(cloud) {
                const cloudEl = document.createElement('div');
                cloudEl.className = 'cloud';
                cloudEl.id = `cloud-${cloud.id}`;
                cloudEl.dataset.id = cloud.id;
                
                // Set position and rotation
                cloudEl.style.left = `${cloud.position.x}%`;
                cloudEl.style.top = `${cloud.position.y}%`;
                cloudEl.style.transform = `rotate(${cloud.rotation}deg)`;
                
                // Set background color based on mood
                const moodColor = moodSettings[cloud.mood].color;
                cloudEl.style.backgroundColor = moodColor;
                
                // Create pseudo-elements with same color
                const style = document.createElement('style');
                style.textContent = `
                    #cloud-${cloud.id}::before, #cloud-${cloud.id}::after {
                        background-color: ${moodColor};
                    }
                `;
                document.head.appendChild(style);
                
                // Cloud content
                cloudEl.innerHTML = `
                    <div class="cloud-content">${cloud.text}</div>
                    <div class="cloud-footer">
                        <div>
                            <span class="cloud-mood" style="background-color: rgba(0,0,0,0.05);">${moodSettings[cloud.mood].emoji} ${cloud.mood}</span>
                            <span style="margin-left: 10px;">${formatTime(cloud.timestamp)}</span>
                        </div>
                        <div class="cloud-controls">
                            <button class="cloud-btn edit-btn" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="cloud-btn delete-btn" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                // Add event listeners to cloud buttons
                const editBtn = cloudEl.querySelector('.edit-btn');
                const deleteBtn = cloudEl.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    editCloud(cloud.id);
                });
                
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteCloud(cloud.id);
                });
                
                // Add animation
                cloudEl.style.animation = `float ${Math.random() * 10 + 15}s infinite ease-in-out`;
                cloudEl.style.animationDelay = `${Math.random() * 5}s`;
                
                // Add to container
                cloudsContainer.appendChild(cloudEl);
            }
            
            // Edit cloud
            function editCloud(cloudId) {
                const cloud = clouds.find(c => c.id === cloudId);
                if (!cloud) return;
                
                // Fill input with cloud text
                thoughtInput.value = cloud.text;
                updateCharCount();
                
                // Set mood
                setCurrentMood(cloud.mood);
                moodButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-mood') === cloud.mood);
                });
                
                // Delete the cloud (will be re-added when user clicks "Add to Sky")
                deleteCloud(cloudId);
                
                // Scroll to input
                thoughtInput.focus();
            }
            
            // Delete cloud
            function deleteCloud(cloudId) {
                // Remove from array
                clouds = clouds.filter(c => c.id !== cloudId);
                
                // Remove from DOM
                const cloudEl = document.getElementById(`cloud-${cloudId}`);
                if (cloudEl) cloudEl.remove();
                
                // Save to localStorage
                saveClouds();
                
                // Show empty state if no clouds left
                if (clouds.length === 0) {
                    emptyClouds.style.display = 'block';
                }
            }
            
            // Clear all clouds
            function clearAllClouds() {
                if (clouds.length === 0) return;
                
                if (confirm('Are you sure you want to clear all your cloud thoughts?')) {
                    clouds = [];
                    cloudsContainer.innerHTML = '';
                    emptyClouds.style.display = 'block';
                    saveClouds();
                }
            }
            
            // Save diary (download as JSON)
            function saveDiary() {
                const data = {
                    clouds: clouds,
                    savedAt: new Date().toISOString()
                };
                
                const dataStr = JSON.stringify(data, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                
                const url = URL.createObjectURL(dataBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cloud-diary-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                // Show feedback
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                setTimeout(() => {
                    saveBtn.innerHTML = originalText;
                }, 2000);
            }
            
            // Save clouds to localStorage
            function saveClouds() {
                const data = {
                    clouds: clouds,
                    nextCloudId: nextCloudId
                };
                localStorage.setItem('cloudDiaryData', JSON.stringify(data));
            }
            
            // Load clouds from localStorage
            function loadClouds() {
                const saved = localStorage.getItem('cloudDiaryData');
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        clouds = data.clouds || [];
                        nextCloudId = data.nextCloudId || 1;
                        
                        // Restore saved time preference
                        const savedTime = localStorage.getItem('cloudDiaryTime');
                        if (savedTime && timeSettings[savedTime]) {
                            currentTime = savedTime;
                            timeButtons.forEach(btn => {
                                btn.classList.toggle('active', btn.getAttribute('data-time') === savedTime);
                            });
                        }
                        
                        // Create cloud elements
                        clouds.forEach(cloud => createCloudElement(cloud));
                        
                        // Hide empty state if we have clouds
                        if (clouds.length > 0) {
                            emptyClouds.style.display = 'none';
                        }
                    } catch (e) {
                        console.error('Error loading saved data:', e);
                    }
                }
            }
            
            // Add sample clouds for first-time users
            function addSampleClouds() {
                const sampleClouds = [
                    {
                        text: "Today was a beautiful day. I feel grateful for the little things.",
                        mood: "happy"
                    },
                    {
                        text: "I wonder what the future holds... Sometimes I get lost in my thoughts.",
                        mood: "thoughtful"
                    },
                    {
                        text: "Remember to breathe deeply and stay present in the moment.",
                        mood: "calm"
                    }
                ];
                
                // Add sample clouds with a delay for effect
                sampleClouds.forEach((cloudData, index) => {
                    setTimeout(() => {
                        const cloud = {
                            id: nextCloudId++,
                            text: cloudData.text,
                            mood: cloudData.mood,
                            timestamp: new Date().toLocaleString(),
                            position: {
                                x: Math.random() * 70 + 5,
                                y: Math.random() * 70 + 5
                            },
                            rotation: Math.random() * 20 - 10
                        };
                        
                        clouds.push(cloud);
                        createCloudElement(cloud);
                        
                        // Hide empty state after first cloud
                        if (index === 0) {
                            emptyClouds.style.display = 'none';
                        }
                    }, index * 500);
                });
                
                // Save after adding all samples
                setTimeout(saveClouds, sampleClouds.length * 500 + 500);
            }
            
            // Format time for display
            function formatTime(dateString) {
                const date = new Date(dateString);
                const now = new Date();
                const diffMs = now - date;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                
                if (diffMins < 1) return "Just now";
                if (diffMins < 60) return `${diffMins}m ago`;
                if (diffHours < 24) return `${diffHours}h ago`;
                if (diffDays < 7) return `${diffDays}d ago`;
                
                return date.toLocaleDateString();
            }
            
            // Drag and drop functions
            function startDrag(e) {
                if (e.target.closest('.cloud')) {
                    isDragging = true;
                    dragCloud = e.target.closest('.cloud');
                    
                    const rect = dragCloud.getBoundingClientRect();
                    dragOffsetX = e.clientX - rect.left;
                    dragOffsetY = e.clientY - rect.top;
                    
                    dragCloud.style.animationPlayState = 'paused';
                    dragCloud.style.zIndex = '100';
                    e.preventDefault();
                }
            }
            
            function startDragTouch(e) {
                if (e.target.closest('.cloud')) {
                    isDragging = true;
                    dragCloud = e.target.closest('.cloud');
                    
                    const rect = dragCloud.getBoundingClientRect();
                    dragOffsetX = e.touches[0].clientX - rect.left;
                    dragOffsetY = e.touches[0].clientY - rect.top;
                    
                    dragCloud.style.animationPlayState = 'paused';
                    dragCloud.style.zIndex = '100';
                    e.preventDefault();
                }
            }
            
            function drag(e) {
                if (!isDragging || !dragCloud) return;
                
                const containerRect = cloudsContainer.getBoundingClientRect();
                let clientX, clientY;
                
                if (e.type === 'touchmove') {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }
                
                // Calculate new position in percentages
                const newX = ((clientX - containerRect.left - dragOffsetX) / containerRect.width) * 100;
                const newY = ((clientY - containerRect.top - dragOffsetY) / containerRect.height) * 100;
                
                // Constrain within container
                const constrainedX = Math.max(0, Math.min(newX, 95));
                const constrainedY = Math.max(0, Math.min(newY, 95));
                
                dragCloud.style.left = `${constrainedX}%`;
                dragCloud.style.top = `${constrainedY}%`;
                
                // Update cloud position in data
                const cloudId = parseInt(dragCloud.dataset.id);
                const cloud = clouds.find(c => c.id === cloudId);
                if (cloud) {
                    cloud.position.x = constrainedX;
                    cloud.position.y = constrainedY;
                    saveClouds();
                }
            }
            
            function dragTouch(e) {
                drag(e);
            }
            
            function stopDrag() {
                if (isDragging && dragCloud) {
                    dragCloud.style.animationPlayState = 'running';
                    dragCloud.style.zIndex = '1';
                }
                
                isDragging = false;
                dragCloud = null;
            }
            
            // CSS for star twinkling
            const style = document.createElement('style');
            style.textContent = `
                @keyframes twinkle {
                    0% { opacity: 0.2; }
                    100% { opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);
            
            // Initialize the app
            init();
        });
    