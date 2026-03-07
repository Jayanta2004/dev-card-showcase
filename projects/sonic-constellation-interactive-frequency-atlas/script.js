// SONIC CONSTELLATION · Interactive Frequency Atlas - JavaScript Implementation

class SonicConstellation {
    constructor() {
        this.canvas = document.getElementById('constellation-canvas');
        this.audioVisualizer = document.getElementById('audio-visualizer');
        this.starInfoPanel = document.getElementById('star-info-panel');

        this.ctx = this.canvas.getContext('2d');
        this.audioCtx = this.audioVisualizer.getContext('2d');

        this.audioContext = null;
        this.currentAudio = null;
        this.isPlaying = false;
        this.volume = 0.7;

        // Canvas state
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Stars and constellations
        this.stars = [];
        this.connections = [];
        this.currentCategory = 'all';
        this.hoveredStar = null;
        this.selectedStar = null;

        // Exploration stats
        this.stats = {
            starsDiscovered: 0,
            soundsExplored: 0,
            categoriesMapped: 6,
            listeningTime: 0
        };

        // Achievements
        this.achievements = {
            explorer: { unlocked: false, threshold: 10 },
            collector: { unlocked: false, threshold: 6 },
            listener: { unlocked: false, threshold: 3000 } // 50 minutes in seconds
        };

        this.init();
        this.setupEventListeners();
        this.generateStars();
        this.animate();
    }

    init() {
        this.resizeCanvas();

        // Initialize audio context on user interaction
        document.getElementById('enable-audio').addEventListener('click', () => {
            this.initializeAudio();
        });

        // Generate connections between stars
        this.generateConnections();
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a simple oscillator for demonstration
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;

            document.getElementById('audio-warning').style.display = 'none';
            this.updateExplorationStatus();

        } catch (error) {
            console.error('Audio initialization failed:', error);
            alert('Audio initialization failed. Please check your browser settings.');
        }
    }

    generateStars() {
        const categories = {
            nature: { count: 15, color: '#10b981', icon: 'leaf' },
            urban: { count: 12, color: '#6b7280', icon: 'city' },
            electronic: { count: 10, color: '#6366f1', icon: 'bolt' },
            human: { count: 8, color: '#f59e0b', icon: 'users' },
            atmospheric: { count: 6, color: '#ec4899', icon: 'cloud' }
        };

        let starId = 0;
        Object.entries(categories).forEach(([category, config]) => {
            for (let i = 0; i < config.count; i++) {
                const angle = (Math.PI * 2 * i) / config.count + Math.random() * 0.5;
                const radius = 200 + Math.random() * 400;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                const star = {
                    id: starId++,
                    x: x,
                    y: y,
                    category: category,
                    color: config.color,
                    icon: config.icon,
                    size: 3 + Math.random() * 4,
                    brightness: 0.5 + Math.random() * 0.5,
                    discovered: false,
                    explored: false,
                    name: this.generateStarName(category, i),
                    description: this.generateStarDescription(category),
                    frequency: this.generateFrequency(category),
                    duration: this.generateDuration(),
                    location: this.generateLocation(category),
                    audioData: this.generateAudioData(category)
                };

                this.stars.push(star);
            }
        });
    }

    generateConnections() {
        // Create constellation patterns by connecting nearby stars
        this.stars.forEach(star => {
            const nearbyStars = this.stars
                .filter(other => other !== star && other.category === star.category)
                .sort((a, b) => {
                    const distA = Math.sqrt((a.x - star.x) ** 2 + (a.y - star.y) ** 2);
                    const distB = Math.sqrt((b.x - star.x) ** 2 + (b.y - star.y) ** 2);
                    return distA - distB;
                })
                .slice(0, 2); // Connect to 2 nearest stars in same category

            nearbyStars.forEach(nearby => {
                if (!this.connections.some(conn =>
                    (conn.star1 === star && conn.star2 === nearby) ||
                    (conn.star1 === nearby && conn.star2 === star)
                )) {
                    this.connections.push({
                        star1: star,
                        star2: nearby,
                        opacity: 0.3,
                        animated: false
                    });
                }
            });
        });
    }

    generateStarName(category, index) {
        const names = {
            nature: ['Forest Whisper', 'Ocean Tide', 'Wind Symphony', 'Rain Chorus', 'Birdsong Dawn', 'Leaf Rustle', 'Thunder Storm', 'Stream Flow', 'Mountain Echo', 'Desert Wind', 'Jungle Rhythm', 'Waterfall', 'Cricket Night', 'Fire Crackle', 'Snow Fall'],
            urban: ['City Pulse', 'Traffic Flow', 'Subway Echo', 'Market Buzz', 'Construction Beat', 'Street Music', 'Siren Call', 'Crowd Murmur', 'Elevator Music', 'Door Bell', 'Phone Ring', 'Typewriter'],
            electronic: ['Digital Pulse', 'Circuit Hum', 'Data Stream', 'Modem Dial', 'Hard Drive', 'Keyboard Click', 'Mouse Scroll', 'Fan Spin', 'Printer Feed', 'Scanner Light'],
            human: ['Laughter Echo', 'Footsteps', 'Heart Beat', 'Breathing', 'Whisper', 'Applause', 'Conversation', 'Singing Voice', 'Crying', 'Yawning'],
            atmospheric: ['Thunder Roll', 'Wind Howl', 'Rain Storm', 'Hail Impact', 'Lightning Crack', 'Tornado']
        };
        return names[category][index % names[category].length] || `${category} Sound ${index}`;
    }

    generateStarDescription(category) {
        const descriptions = {
            nature: 'A natural sound recording capturing the essence of the wilderness',
            urban: 'An urban soundscape reflecting the rhythm of city life',
            electronic: 'Digital audio artifacts from our technological world',
            human: 'The sounds of human expression and activity',
            atmospheric: 'Powerful atmospheric phenomena and weather events'
        };
        return descriptions[category] || 'A unique sound from the audio universe';
    }

    generateFrequency(category) {
        const ranges = {
            nature: ['20-2000 Hz', '50-5000 Hz', '100-8000 Hz'],
            urban: ['30-3000 Hz', '60-6000 Hz', '80-4000 Hz'],
            electronic: ['100-10000 Hz', '200-15000 Hz', '50-8000 Hz'],
            human: ['80-8000 Hz', '100-10000 Hz', '60-6000 Hz'],
            atmospheric: ['10-500 Hz', '20-2000 Hz', '30-3000 Hz']
        };
        return ranges[category][Math.floor(Math.random() * ranges[category].length)];
    }

    generateDuration() {
        const durations = ['2:30', '1:45', '3:15', '0:45', '4:20', '1:20', '2:10', '5:00'];
        return durations[Math.floor(Math.random() * durations.length)];
    }

    generateLocation(category) {
        const locations = {
            nature: ['Amazon Rainforest', 'Rocky Mountains', 'Pacific Ocean', 'Sahara Desert', 'Arctic Tundra', 'Great Barrier Reef'],
            urban: ['New York City', 'Tokyo', 'London', 'Mumbai', 'São Paulo', 'Dubai'],
            electronic: ['Silicon Valley', 'Tokyo Tech Hub', 'Berlin Startup', 'Seoul Digital City'],
            human: ['Global', 'Various Cities', 'Community Centers', 'Public Spaces'],
            atmospheric: ['Various Locations', 'Weather Stations', 'Remote Areas']
        };
        return locations[category][Math.floor(Math.random() * locations[category].length)];
    }

    generateAudioData(category) {
        // Generate simulated audio data for visualization
        const length = 1024;
        const data = new Uint8Array(length);

        // Different patterns for different categories
        for (let i = 0; i < length; i++) {
            switch (category) {
                case 'nature':
                    data[i] = Math.sin(i * 0.01) * 64 + Math.random() * 32 + 128;
                    break;
                case 'urban':
                    data[i] = Math.sin(i * 0.05) * 32 + Math.sin(i * 0.1) * 16 + Math.random() * 64 + 128;
                    break;
                case 'electronic':
                    data[i] = Math.sin(i * 0.2) * 96 + Math.random() * 16 + 128;
                    break;
                case 'human':
                    data[i] = Math.sin(i * 0.02) * 48 + Math.sin(i * 0.04) * 24 + Math.random() * 48 + 128;
                    break;
                case 'atmospheric':
                    data[i] = Math.sin(i * 0.005) * 120 + Math.random() * 8 + 128;
                    break;
                default:
                    data[i] = Math.random() * 256;
            }
        }

        return data;
    }

    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Navigation controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        document.getElementById('auto-explore').addEventListener('click', () => this.toggleAutoExplore());

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setCategory(btn.dataset.category));
        });

        // Audio controls
        document.getElementById('play-pause').addEventListener('click', () => this.togglePlayback());
        document.getElementById('volume-slider').addEventListener('input', (e) => this.setVolume(e.target.value / 100));

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.canvas.width / 2) / this.scale - this.offsetX;
        const y = (e.clientY - rect.top - this.canvas.height / 2) / this.scale - this.offsetY;

        // Check if clicking on a star
        const clickedStar = this.getStarAtPosition(x, y);
        if (clickedStar) {
            this.selectStar(clickedStar);
        } else {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.canvas.width / 2) / this.scale - this.offsetX;
        const y = (e.clientY - rect.top - this.canvas.height / 2) / this.scale - this.offsetY;

        if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;
            this.offsetX += deltaX / this.scale;
            this.offsetY += deltaY / this.scale;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        } else {
            const hoveredStar = this.getStarAtPosition(x, y);
            if (hoveredStar !== this.hoveredStar) {
                this.hoveredStar = hoveredStar;
                this.updateStarInfo();
            }
        }
    }

    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }

    handleWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale *= zoomFactor;
        this.scale = Math.max(0.1, Math.min(5, this.scale));
    }

    getStarAtPosition(x, y) {
        const visibleStars = this.getVisibleStars();
        for (const star of visibleStars) {
            const distance = Math.sqrt((star.x - x) ** 2 + (star.y - y) ** 2);
            if (distance < star.size * 2) {
                return star;
            }
        }
        return null;
    }

    getVisibleStars() {
        return this.stars.filter(star =>
            this.currentCategory === 'all' || star.category === this.currentCategory
        );
    }

    selectStar(star) {
        this.selectedStar = star;
        star.discovered = true;
        star.explored = true;

        this.stats.starsDiscovered = Math.max(this.stats.starsDiscovered, this.stars.filter(s => s.discovered).length);
        this.stats.soundsExplored = Math.max(this.stats.soundsExplored, this.stars.filter(s => s.explored).length);

        this.updateStarInfo();
        this.updateStats();
        this.checkAchievements();
        this.playStarAudio(star);
    }

    updateStarInfo() {
        const panel = this.starInfoPanel;

        if (this.hoveredStar || this.selectedStar) {
            const star = this.selectedStar || this.hoveredStar;

            document.getElementById('star-name').textContent = star.name;
            document.getElementById('star-category').textContent = star.category.charAt(0).toUpperCase() + star.category.slice(1);
            document.getElementById('star-frequency').textContent = star.frequency;
            document.getElementById('star-duration').textContent = star.duration;
            document.getElementById('star-location').textContent = star.location;
            document.getElementById('star-description').textContent = star.description;

            panel.classList.add('visible');
        } else {
            panel.classList.remove('visible');
        }
    }

    playStarAudio(star) {
        if (!this.audioContext) return;

        // Stop current audio
        if (this.currentAudio) {
            this.currentAudio.stop();
        }

        // Create new oscillator based on star category
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = this.getWaveformForCategory(star.category);
        oscillator.frequency.value = this.getFrequencyForCategory(star.category);

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 2);

        this.currentAudio = oscillator;
        this.isPlaying = true;
        this.updatePlaybackControls();

        // Track listening time
        setTimeout(() => {
            this.stats.listeningTime += 2;
            this.checkAchievements();
        }, 2000);
    }

    getWaveformForCategory(category) {
        const waveforms = {
            nature: 'sine',
            urban: 'triangle',
            electronic: 'square',
            human: 'sine',
            atmospheric: 'sawtooth'
        };
        return waveforms[category] || 'sine';
    }

    getFrequencyForCategory(category) {
        const frequencies = {
            nature: 220,
            urban: 330,
            electronic: 440,
            human: 262,
            atmospheric: 110
        };
        return frequencies[category] || 220;
    }

    togglePlayback() {
        if (this.isPlaying && this.currentAudio) {
            this.currentAudio.stop();
            this.isPlaying = false;
        } else if (this.selectedStar) {
            this.playStarAudio(this.selectedStar);
        }
        this.updatePlaybackControls();
    }

    setVolume(volume) {
        this.volume = volume;
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
        document.getElementById('volume-value').textContent = `${Math.round(volume * 100)}%`;
    }

    zoomIn() {
        this.scale *= 1.2;
        this.scale = Math.min(5, this.scale);
    }

    zoomOut() {
        this.scale *= 0.8;
        this.scale = Math.max(0.1, this.scale);
    }

    resetView() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    toggleAutoExplore() {
        this.autoExplore = !this.autoExplore;
        const btn = document.getElementById('auto-explore');
        btn.innerHTML = this.autoExplore ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    setCategory(category) {
        this.currentCategory = category;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
    }

    updateStats() {
        document.getElementById('stars-discovered').textContent = this.stats.starsDiscovered;
        document.getElementById('sounds-explored').textContent = this.stats.soundsExplored;

        const progress = (this.stats.starsDiscovered / this.stars.length) * 100;
        document.getElementById('exploration-progress').style.width = `${progress}%`;
    }

    checkAchievements() {
        // Explorer achievement
        if (!this.achievements.explorer.unlocked && this.stats.soundsExplored >= this.achievements.explorer.threshold) {
            this.unlockAchievement('explorer');
        }

        // Collector achievement
        const categoriesExplored = new Set(this.stars.filter(s => s.explored).map(s => s.category)).size;
        if (!this.achievements.collector.unlocked && categoriesExplored >= this.achievements.collector.threshold) {
            this.unlockAchievement('collector');
        }

        // Listener achievement
        if (!this.achievements.listener.unlocked && this.stats.listeningTime >= this.achievements.listener.threshold) {
            this.unlockAchievement('listener');
        }
    }

    unlockAchievement(achievementId) {
        this.achievements[achievementId].unlocked = true;
        const achievementEl = document.querySelector(`[data-achievement="${achievementId}"]`);
        achievementEl.classList.add('unlocked');

        // Add some visual feedback
        achievementEl.style.animation = 'star-pulse 1s ease-in-out';
        setTimeout(() => {
            achievementEl.style.animation = '';
        }, 1000);
    }

    updatePlaybackControls() {
        const playPauseBtn = document.getElementById('play-pause');
        playPauseBtn.innerHTML = this.isPlaying ?
            '<i class="fas fa-pause"></i>' :
            '<i class="fas fa-play"></i>';
    }

    updateExplorationStatus() {
        const statusEl = document.getElementById('exploration-status');
        const statusText = document.querySelector('.status-text');

        if (this.audioContext && this.audioContext.state === 'running') {
            statusEl.innerHTML = '<i class="fas fa-compass"></i>';
            statusText.textContent = 'Exploring Sound Universe';
        } else {
            statusEl.innerHTML = '<i class="fas fa-pause"></i>';
            statusText.textContent = 'Audio Paused';
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }

    update() {
        // Auto-explore mode
        if (this.autoExplore && Math.random() < 0.005) {
            const randomStar = this.getVisibleStars()[Math.floor(Math.random() * this.getVisibleStars().length)];
            if (randomStar) {
                this.selectStar(randomStar);
            }
        }

        // Update connections animation
        this.connections.forEach(connection => {
            if (connection.star1.explored && connection.star2.explored) {
                connection.opacity = Math.min(0.8, connection.opacity + 0.01);
                connection.animated = true;
            }
        });
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(15, 10, 25, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(this.offsetX, this.offsetY);

        // Render connections
        this.renderConnections();

        // Render stars
        this.renderStars();

        this.ctx.restore();

        // Render audio visualizer
        this.renderAudioVisualizer();
    }

    renderConnections() {
        this.connections.forEach(connection => {
            if (connection.star1.category !== this.currentCategory && this.currentCategory !== 'all') return;
            if (connection.star2.category !== this.currentCategory && this.currentCategory !== 'all') return;

            this.ctx.strokeStyle = `rgba(99, 102, 241, ${connection.opacity})`;
            this.ctx.lineWidth = connection.animated ? 2 : 1;
            this.ctx.beginPath();
            this.ctx.moveTo(connection.star1.x, connection.star1.y);
            this.ctx.lineTo(connection.star2.x, connection.star2.y);
            this.ctx.stroke();
        });
    }

    renderStars() {
        const visibleStars = this.getVisibleStars();

        visibleStars.forEach(star => {
            this.ctx.save();

            // Star glow effect
            if (star === this.hoveredStar || star === this.selectedStar) {
                this.ctx.shadowColor = star.color;
                this.ctx.shadowBlur = 20;
            }

            // Star body
            this.ctx.fillStyle = star.color;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Star highlight
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(star.x - star.size * 0.3, star.y - star.size * 0.3, star.size * 0.3, 0, Math.PI * 2);
            this.ctx.fill();

            // Exploration indicator
            if (star.explored) {
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size + 3, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        });
    }

    renderAudioVisualizer() {
        const ctx = this.audioCtx;
        const width = this.audioVisualizer.width;
        const height = this.audioVisualizer.height;

        // Clear
        ctx.fillStyle = '#0f0a19';
        ctx.fillRect(0, 0, width, height);

        if (this.selectedStar && this.selectedStar.audioData) {
            const data = this.selectedStar.audioData;
            const sliceWidth = width / data.length;

            ctx.fillStyle = this.selectedStar.color;
            ctx.strokeStyle = this.selectedStar.color;

            for (let i = 0; i < data.length; i++) {
                const x = i * sliceWidth;
                const y = (data[i] / 255) * height;

                if (this.isPlaying) {
                    ctx.fillRect(x, height - y, sliceWidth, y);
                } else {
                    ctx.beginPath();
                    ctx.moveTo(x, height / 2);
                    ctx.lineTo(x, height / 2 - y / 2);
                    ctx.stroke();
                }
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SonicConstellation();
});