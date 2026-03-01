// BIOSONIC TERRAIN · Environmental Audio Mapper - JavaScript Implementation

class BiosonicTerrain {
    constructor() {
        this.canvas = document.getElementById('terrain-canvas');
        this.miniMapCanvas = document.getElementById('mini-map-canvas');
        this.terrainInfoPanel = document.getElementById('terrain-info-panel');

        this.ctx = this.canvas.getContext('2d');
        this.miniCtx = this.miniMapCanvas.getContext('2d');

        this.audioContext = null;
        this.masterGain = null;
        this.audioLayers = {};
        this.isPlaying = false;
        this.masterVolume = 0.7;

        // Terrain and navigation
        this.terrainSize = 2000; // Virtual terrain size
        this.viewSize = 800; // Viewport size
        this.scale = this.viewSize / this.terrainSize;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Player position (center of view)
        this.playerX = this.terrainSize / 2;
        this.playerY = this.terrainSize / 2;

        // Terrain data
        this.terrainMap = [];
        this.biomes = {};
        this.currentBiome = null;

        // Weather system
        this.weather = 'clear';
        this.weatherIntensity = 0.5;

        // Exploration stats
        this.stats = {
            terrainsExplored: 0,
            distanceTraveled: 0,
            activeLayers: 0,
            explorationTime: 0,
            startTime: Date.now()
        };

        // Discovered biomes
        this.discoveredBiomes = new Set();

        this.init();
        this.setupEventListeners();
        this.generateTerrain();
        this.setupAudioLayers();
        this.animate();
    }

    init() {
        this.resizeCanvas();

        // Initialize audio context on user interaction
        document.getElementById('enable-audio').addEventListener('click', () => {
            this.initializeAudio();
        });

        // Update exploration time
        setInterval(() => {
            this.stats.explorationTime = Math.floor((Date.now() - this.stats.startTime) / 1000);
            this.updateExplorationTime();
        }, 1000);
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.masterVolume;

            // Initialize audio layers
            await this.initializeAudioLayers();

            document.getElementById('audio-warning').style.display = 'none';
            this.isPlaying = true;
            this.updateAudioControls();

        } catch (error) {
            console.error('Audio initialization failed:', error);
            alert('Audio initialization failed. Please check your browser settings.');
        }
    }

    generateTerrain() {
        // Generate procedural terrain map
        this.terrainMap = [];
        for (let x = 0; x < this.terrainSize; x++) {
            this.terrainMap[x] = [];
            for (let y = 0; y < this.terrainSize; y++) {
                // Use multiple noise functions for different biomes
                const biomeValue = this.getBiomeAtPosition(x, y);
                this.terrainMap[x][y] = biomeValue;
            }
        }

        // Define biome centers
        this.biomes = {
            forest: { x: 400, y: 400, radius: 300, color: '#166534', discovered: false },
            desert: { x: 1400, y: 600, radius: 400, color: '#92400e', discovered: false },
            tundra: { x: 200, y: 1400, radius: 350, color: '#1e40af', discovered: false },
            mountain: { x: 1600, y: 200, radius: 250, color: '#374151', discovered: false },
            wetland: { x: 800, y: 1200, radius: 300, color: '#0f766e', discovered: false },
            grassland: { x: 1200, y: 1000, radius: 350, color: '#65a30d', discovered: false }
        };
    }

    getBiomeAtPosition(x, y) {
        let closestBiome = null;
        let minDistance = Infinity;

        Object.entries(this.biomes).forEach(([name, biome]) => {
            const distance = Math.sqrt((x - biome.x) ** 2 + (y - biome.y) ** 2);
            if (distance < minDistance) {
                minDistance = distance;
                closestBiome = name;
            }
        });

        // Add some noise for terrain variation
        const noise = (Math.sin(x * 0.01) + Math.cos(y * 0.01)) * 0.3;
        return { biome: closestBiome, elevation: Math.max(0, 1 - minDistance / 500 + noise) };
    }

    setupAudioLayers() {
        // Define audio layers for each biome
        this.audioLayers = {
            // Ambient layers (always present, vary by biome)
            ambient: {
                forest: [
                    { name: 'Wind through trees', frequency: 80, volume: 0.3 },
                    { name: 'Bird calls', frequency: 2000, volume: 0.2 },
                    { name: 'Rustling leaves', frequency: 150, volume: 0.4 }
                ],
                desert: [
                    { name: 'Hot wind', frequency: 60, volume: 0.5 },
                    { name: 'Distant thunder', frequency: 40, volume: 0.1 },
                    { name: 'Sand movement', frequency: 100, volume: 0.2 }
                ],
                tundra: [
                    { name: 'Cold wind', frequency: 50, volume: 0.6 },
                    { name: 'Ice cracking', frequency: 30, volume: 0.3 },
                    { name: 'Snow falling', frequency: 20, volume: 0.2 }
                ],
                mountain: [
                    { name: 'Mountain wind', frequency: 70, volume: 0.4 },
                    { name: 'Echoing calls', frequency: 300, volume: 0.2 },
                    { name: 'Rock slides', frequency: 25, volume: 0.1 }
                ],
                wetland: [
                    { name: 'Water movement', frequency: 90, volume: 0.5 },
                    { name: 'Frog calls', frequency: 800, volume: 0.3 },
                    { name: 'Reed rustling', frequency: 120, volume: 0.3 }
                ],
                grassland: [
                    { name: 'Grass wind', frequency: 85, volume: 0.4 },
                    { name: 'Insect buzz', frequency: 600, volume: 0.2 },
                    { name: 'Distant animals', frequency: 200, volume: 0.1 }
                ]
            },

            // Foreground layers (appear based on proximity and conditions)
            foreground: {
                forest: [
                    { name: 'Woodpecker', frequency: 1500, volume: 0.6, triggerDistance: 100 },
                    { name: 'Stream', frequency: 200, volume: 0.4, triggerDistance: 80 },
                    { name: 'Wildlife movement', frequency: 300, volume: 0.3, triggerDistance: 120 }
                ],
                desert: [
                    { name: 'Scorpion movement', frequency: 800, volume: 0.2, triggerDistance: 60 },
                    { name: 'Oasis water', frequency: 180, volume: 0.5, triggerDistance: 90 },
                    { name: 'Sand storm', frequency: 150, volume: 0.7, triggerDistance: 150 }
                ],
                tundra: [
                    { name: 'Wolf howl', frequency: 250, volume: 0.4, triggerDistance: 200 },
                    { name: 'Snow crunch', frequency: 400, volume: 0.3, triggerDistance: 50 },
                    { name: 'Aurora hum', frequency: 50, volume: 0.2, triggerDistance: 300 }
                ],
                mountain: [
                    { name: 'Avalanche rumble', frequency: 35, volume: 0.8, triggerDistance: 250 },
                    { name: 'Eagle cry', frequency: 1200, volume: 0.5, triggerDistance: 180 },
                    { name: 'Waterfall', frequency: 220, volume: 0.6, triggerDistance: 120 }
                ],
                wetland: [
                    { name: 'Duck quacks', frequency: 900, volume: 0.4, triggerDistance: 100 },
                    { name: 'Mud bubbles', frequency: 80, volume: 0.3, triggerDistance: 70 },
                    { name: 'Insect swarm', frequency: 1000, volume: 0.5, triggerDistance: 90 }
                ],
                grassland: [
                    { name: 'Horse hooves', frequency: 150, volume: 0.4, triggerDistance: 130 },
                    { name: 'Cricket chorus', frequency: 1800, volume: 0.6, triggerDistance: 110 },
                    { name: 'Thunder', frequency: 45, volume: 0.7, triggerDistance: 300 }
                ]
            },

            // Weather layers (activated by weather conditions)
            weather: {
                rain: [
                    { name: 'Light rain', frequency: 2000, volume: 0.3 },
                    { name: 'Rain on leaves', frequency: 800, volume: 0.4 },
                    { name: 'Puddles', frequency: 150, volume: 0.2 }
                ],
                storm: [
                    { name: 'Thunder claps', frequency: 30, volume: 0.8 },
                    { name: 'Heavy rain', frequency: 500, volume: 0.6 },
                    { name: 'Wind gusts', frequency: 80, volume: 0.5 }
                ],
                wind: [
                    { name: 'Wind howl', frequency: 60, volume: 0.7 },
                    { name: 'Leaves rustling', frequency: 200, volume: 0.4 },
                    { name: 'Branch creaking', frequency: 100, volume: 0.3 }
                ],
                fog: [
                    { name: 'Distant echoes', frequency: 300, volume: 0.2 },
                    { name: 'Muffled sounds', frequency: 150, volume: 0.3 },
                    { name: 'Atmospheric hum', frequency: 40, volume: 0.4 }
                ]
            }
        };
    }

    async initializeAudioLayers() {
        // Create oscillators for each layer type
        Object.keys(this.audioLayers).forEach(layerType => {
            Object.keys(this.audioLayers[layerType]).forEach(biome => {
                this.audioLayers[layerType][biome].forEach(layer => {
                    if (!layer.oscillator) {
                        layer.oscillator = this.audioContext.createOscillator();
                        layer.gainNode = this.audioContext.createGain();

                        layer.oscillator.type = this.getWaveformForLayer(layerType, biome);
                        layer.oscillator.frequency.value = layer.frequency;

                        layer.gainNode.gain.value = 0; // Start muted

                        layer.oscillator.connect(layer.gainNode);
                        layer.gainNode.connect(this.masterGain);

                        layer.oscillator.start();
                    }
                });
            });
        });
    }

    getWaveformForLayer(layerType, biome) {
        const waveforms = {
            ambient: {
                forest: 'sine',
                desert: 'triangle',
                tundra: 'sawtooth',
                mountain: 'sine',
                wetland: 'triangle',
                grassland: 'sine'
            },
            foreground: {
                forest: 'square',
                desert: 'sawtooth',
                tundra: 'triangle',
                mountain: 'sine',
                wetland: 'square',
                grassland: 'triangle'
            },
            weather: {
                rain: 'sine',
                storm: 'sawtooth',
                wind: 'triangle',
                fog: 'sine'
            }
        };

        return waveforms[layerType]?.[biome] || 'sine';
    }

    setupEventListeners() {
        // Canvas navigation
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Audio controls
        document.getElementById('play-pause').addEventListener('click', () => this.togglePlayback());
        document.getElementById('master-volume').addEventListener('input', (e) => this.setMasterVolume(e.target.value / 100));
        document.getElementById('mute-toggle').addEventListener('click', () => this.toggleMute());

        // Weather controls
        document.querySelectorAll('.weather-btn').forEach(btn => {
            btn.addEventListener('click', () => this.setWeather(btn.dataset.weather));
        });
        document.getElementById('weather-intensity-slider').addEventListener('input', (e) => this.setWeatherIntensity(e.target.value / 100));

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;

        // Convert canvas coordinates to world coordinates
        const worldX = (canvasX - this.canvas.width / 2) / this.scale + this.playerX;
        const worldY = (canvasY - this.canvas.height / 2) / this.scale + this.playerY;

        // Move player to clicked position
        const oldX = this.playerX;
        const oldY = this.playerY;
        this.playerX = Math.max(0, Math.min(this.terrainSize, worldX));
        this.playerY = Math.max(0, Math.min(this.terrainSize, worldY));

        // Update distance traveled
        const distance = Math.sqrt((this.playerX - oldX) ** 2 + (this.playerY - oldY) ** 2);
        this.stats.distanceTraveled += distance / 10; // Convert to km
        this.updateStats();

        this.updateCurrentBiome();
        this.updateAudioLayers();
    }

    handleMouseMove(e) {
        // Optional: Could implement smooth dragging
    }

    handleMouseUp() {
        // Handle mouse up if needed
    }

    handleWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale *= zoomFactor;
        this.scale = Math.max(0.1, Math.min(2, this.scale));
    }

    updateCurrentBiome() {
        const terrainData = this.getBiomeAtPosition(this.playerX, this.playerY);
        const newBiome = terrainData.biome;

        if (newBiome !== this.currentBiome) {
            this.currentBiome = newBiome;
            this.discoveredBiomes.add(newBiome);
            this.biomes[newBiome].discovered = true;

            this.updateBiomeDisplay();
            this.updateBiomeCard(newBiome);
            this.stats.terrainsExplored = this.discoveredBiomes.size;
            this.updateStats();
        }

        // Update terrain info
        this.updateTerrainInfo(terrainData);
    }

    updateBiomeDisplay() {
        const locationEl = document.getElementById('current-location');
        const coordsEl = document.getElementById('current-coords');
        const elevationEl = document.getElementById('current-elevation');

        locationEl.textContent = this.currentBiome ? this.currentBiome.charAt(0).toUpperCase() + this.currentBiome.slice(1) : 'Unknown Terrain';
        coordsEl.textContent = `${Math.round(this.playerX)}, ${Math.round(this.playerY)}`;
        elevationEl.textContent = `${Math.round(this.getBiomeAtPosition(this.playerX, this.playerY).elevation * 1000)}m`;
    }

    updateTerrainInfo(terrainData) {
        const panel = this.terrainInfoPanel;
        const biomeNameEl = document.getElementById('biome-name');
        const biomeTypeEl = document.getElementById('biome-type');
        const tempEl = document.getElementById('biome-temp');
        const humidityEl = document.getElementById('biome-humidity');
        const windEl = document.getElementById('biome-wind');
        const descriptionEl = document.getElementById('biome-description');

        if (terrainData.biome) {
            biomeNameEl.textContent = terrainData.biome.charAt(0).toUpperCase() + terrainData.biome.slice(1);
            biomeTypeEl.textContent = terrainData.biome.charAt(0).toUpperCase() + terrainData.biome.slice(1);
            tempEl.textContent = this.getBiomeTemperature(terrainData.biome);
            humidityEl.textContent = this.getBiomeHumidity(terrainData.biome);
            windEl.textContent = this.getBiomeWind(terrainData.biome);
            descriptionEl.textContent = this.getBiomeDescription(terrainData.biome);

            panel.classList.add('visible');
        } else {
            panel.classList.remove('visible');
        }
    }

    getBiomeTemperature(biome) {
        const temps = {
            forest: '22°C',
            desert: '35°C',
            tundra: '-5°C',
            mountain: '8°C',
            wetland: '18°C',
            grassland: '25°C'
        };
        return temps[biome] || '20°C';
    }

    getBiomeHumidity(biome) {
        const humidities = {
            forest: '75%',
            desert: '25%',
            tundra: '60%',
            mountain: '45%',
            wetland: '85%',
            grassland: '55%'
        };
        return humidities[biome] || '50%';
    }

    getBiomeWind(biome) {
        const winds = {
            forest: '8 km/h',
            desert: '15 km/h',
            tundra: '12 km/h',
            mountain: '20 km/h',
            wetland: '5 km/h',
            grassland: '10 km/h'
        };
        return winds[biome] || '10 km/h';
    }

    getBiomeDescription(biome) {
        const descriptions = {
            forest: 'Dense woodlands teeming with life, where every rustle tells a story of nature\'s intricate web.',
            desert: 'Vast arid landscapes where the wind whispers secrets across endless dunes.',
            tundra: 'Frozen plains where the cold wind carries the songs of hardy survivors.',
            mountain: 'Rugged peaks where echoes bounce between ancient stone and open sky.',
            wetland: 'Marshy realms alive with the gentle symphony of water and wetland creatures.',
            grassland: 'Open plains where the wind dances through tall grasses and distant horizons.'
        };
        return descriptions[biome] || 'A unique ecological zone with its own sonic signature.';
    }

    updateBiomeCard(biome) {
        const card = document.querySelector(`[data-biome="${biome}"]`);
        if (card) {
            card.classList.add('discovered');
        }
    }

    updateAudioLayers() {
        if (!this.audioContext || !this.isPlaying) return;

        const terrainData = this.getBiomeAtPosition(this.playerX, this.playerY);
        const biome = terrainData.biome;

        if (!biome) return;

        // Update ambient layers (always active for current biome)
        this.updateLayerGroup('ambient', biome, 1.0);

        // Update foreground layers (based on proximity to biome center)
        const biomeCenter = this.biomes[biome];
        const distanceToCenter = Math.sqrt((this.playerX - biomeCenter.x) ** 2 + (this.playerY - biomeCenter.y) ** 2);
        const proximityFactor = Math.max(0, 1 - distanceToCenter / biomeCenter.radius);
        this.updateLayerGroup('foreground', biome, proximityFactor);

        // Update weather layers
        this.updateWeatherLayers();

        this.updateAudioControls();
    }

    updateLayerGroup(layerType, biome, baseVolume) {
        const layers = this.audioLayers[layerType][biome] || [];
        let activeCount = 0;

        layers.forEach(layer => {
            let volume = baseVolume * layer.volume;

            // Apply weather modifications
            volume *= this.getWeatherModifier(layerType, layer.name);

            // Apply distance attenuation for foreground layers
            if (layerType === 'foreground' && layer.triggerDistance) {
                const biomeCenter = this.biomes[biome];
                const distance = Math.sqrt((this.playerX - biomeCenter.x) ** 2 + (this.playerY - biomeCenter.y) ** 2);
                const distanceFactor = Math.max(0, 1 - distance / layer.triggerDistance);
                volume *= distanceFactor;
            }

            if (layer.gainNode) {
                layer.gainNode.gain.setTargetAtTime(volume * this.masterVolume, this.audioContext.currentTime, 0.1);
                if (volume > 0.01) activeCount++;
            }
        });

        if (layerType === 'ambient') {
            this.stats.activeLayers = activeCount;
        }
    }

    updateWeatherLayers() {
        const weatherLayers = this.audioLayers.weather[this.weather] || [];
        weatherLayers.forEach(layer => {
            const volume = layer.volume * this.weatherIntensity;
            if (layer.gainNode) {
                layer.gainNode.gain.setTargetAtTime(volume * this.masterVolume, this.audioContext.currentTime, 0.1);
            }
        });
    }

    getWeatherModifier(layerType, layerName) {
        // Weather affects different layer types differently
        const modifiers = {
            rain: {
                ambient: 1.2,
                foreground: 0.8,
                weather: 1.0
            },
            storm: {
                ambient: 0.7,
                foreground: 0.5,
                weather: 1.0
            },
            wind: {
                ambient: 1.3,
                foreground: 0.9,
                weather: 1.0
            },
            fog: {
                ambient: 0.8,
                foreground: 0.6,
                weather: 1.0
            }
        };

        return modifiers[this.weather]?.[layerType] || 1.0;
    }

    setWeather(weather) {
        this.weather = weather;
        document.querySelectorAll('.weather-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.weather === weather);
        });
        this.updateAudioLayers();
    }

    setWeatherIntensity(intensity) {
        this.weatherIntensity = intensity;
        document.getElementById('weather-intensity-value').textContent = `${Math.round(intensity * 100)}%`;
        this.updateAudioLayers();
    }

    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        this.updateAudioLayers();
        this.updateAudioControls();
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
        document.getElementById('master-volume-value').textContent = `${Math.round(volume * 100)}%`;
    }

    toggleMute() {
        this.setMasterVolume(this.masterVolume > 0 ? 0 : 0.7);
    }

    updateAudioControls() {
        const playPauseBtn = document.getElementById('play-pause');
        const muteBtn = document.getElementById('mute-toggle');

        playPauseBtn.innerHTML = this.isPlaying ?
            '<i class="fas fa-pause"></i>' :
            '<i class="fas fa-play"></i>';

        muteBtn.innerHTML = this.masterVolume > 0 ?
            '<i class="fas fa-volume-up"></i>' :
            '<i class="fas fa-volume-off"></i>';

        this.updateLayerControls();
    }

    updateLayerControls() {
        // Update ambient layers
        const ambientContainer = document.getElementById('ambient-layers');
        ambientContainer.innerHTML = '';

        if (this.currentBiome && this.audioLayers.ambient[this.currentBiome]) {
            this.audioLayers.ambient[this.currentBiome].forEach(layer => {
                const layerEl = this.createLayerElement(layer);
                ambientContainer.appendChild(layerEl);
            });
        }

        // Update foreground layers
        const foregroundContainer = document.getElementById('foreground-layers');
        foregroundContainer.innerHTML = '';

        if (this.currentBiome && this.audioLayers.foreground[this.currentBiome]) {
            this.audioLayers.foreground[this.currentBiome].forEach(layer => {
                const layerEl = this.createLayerElement(layer);
                foregroundContainer.appendChild(layerEl);
            });
        }

        // Update weather layers
        const weatherContainer = document.getElementById('weather-layers');
        weatherContainer.innerHTML = '';

        if (this.audioLayers.weather[this.weather]) {
            this.audioLayers.weather[this.weather].forEach(layer => {
                const layerEl = this.createLayerElement(layer);
                weatherContainer.appendChild(layerEl);
            });
        }
    }

    createLayerElement(layer) {
        const layerEl = document.createElement('div');
        layerEl.className = 'layer-item';
        layerEl.innerHTML = `
            <div class="layer-name">${layer.name}</div>
            <div class="layer-volume">
                <div class="layer-volume-fill" style="width: ${layer.volume * 100}%"></div>
            </div>
        `;

        // Add active class based on current gain
        if (layer.gainNode && layer.gainNode.gain.value > 0.01) {
            layerEl.classList.add('active');
        }

        return layerEl;
    }

    updateStats() {
        document.getElementById('terrains-explored').textContent = this.stats.terrainsExplored;
        document.getElementById('distance-traveled').textContent = this.stats.distanceTraveled.toFixed(1);
        document.getElementById('active-layers').textContent = this.stats.activeLayers;
    }

    updateExplorationTime() {
        const minutes = Math.floor(this.stats.explorationTime / 60);
        const seconds = this.stats.explorationTime % 60;
        document.getElementById('exploration-time').textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        // Update compass
        this.updateCompass();

        // Update mini-map
        this.updateMiniMap();

        // Update audio layers continuously
        this.updateAudioLayers();
    }

    updateCompass() {
        // Simple compass that points north (could be enhanced with actual direction)
        const needle = document.getElementById('compass-needle');
        const angle = (Date.now() * 0.001) % (Math.PI * 2); // Slow rotation for effect
        needle.style.transform = `rotate(${angle}rad)`;
    }

    updateMiniMap() {
        const ctx = this.miniCtx;
        const size = this.miniMapCanvas.width;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);

        // Draw terrain overview (simplified)
        const scale = size / this.terrainSize;
        for (let x = 0; x < this.terrainSize; x += 10) {
            for (let y = 0; y < this.terrainSize; y += 10) {
                const terrainData = this.getBiomeAtPosition(x, y);
                const biome = this.biomes[terrainData.biome];

                if (biome) {
                    ctx.fillStyle = biome.color;
                    ctx.fillRect(x * scale, y * scale, 10 * scale, 10 * scale);
                }
            }
        }

        // Draw player position
        const playerX = this.playerX * scale;
        const playerY = this.playerY * scale;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = this.getBiomeBackgroundColor();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.playerX, -this.playerY);

        // Render terrain
        this.renderTerrain();

        // Render biome centers
        this.renderBiomeCenters();

        // Render player
        this.renderPlayer();

        this.ctx.restore();

        // Render weather effects
        this.renderWeatherEffects();
    }

    getBiomeBackgroundColor() {
        if (!this.currentBiome) return '#f0f0f0';

        const colors = {
            forest: '#dcfce7',
            desert: '#fef3c7',
            tundra: '#dbeafe',
            mountain: '#f3f4f6',
            wetland: '#ccfbf1',
            grassland: '#ecfccb'
        };

        return colors[this.currentBiome] || '#f0f0f0';
    }

    renderTerrain() {
        const viewSize = this.viewSize / this.scale;
        const startX = Math.max(0, this.playerX - viewSize / 2);
        const startY = Math.max(0, this.playerY - viewSize / 2);
        const endX = Math.min(this.terrainSize, this.playerX + viewSize / 2);
        const endY = Math.min(this.terrainSize, this.playerY + viewSize / 2);

        for (let x = Math.floor(startX); x < endX; x += 5) {
            for (let y = Math.floor(startY); y < endY; y += 5) {
                const terrainData = this.getBiomeAtPosition(x, y);
                const biome = this.biomes[terrainData.biome];

                if (biome) {
                    // Create elevation-based color variation
                    const elevation = terrainData.elevation;
                    const baseColor = biome.color;
                    const alpha = 0.3 + elevation * 0.7;

                    this.ctx.fillStyle = this.adjustColorAlpha(baseColor, alpha);
                    this.ctx.fillRect(x, y, 5, 5);
                }
            }
        }
    }

    renderBiomeCenters() {
        Object.entries(this.biomes).forEach(([name, biome]) => {
            if (biome.discovered) {
                this.ctx.strokeStyle = biome.color;
                this.ctx.lineWidth = 3 / this.scale;
                this.ctx.beginPath();
                this.ctx.arc(biome.x, biome.y, biome.radius, 0, Math.PI * 2);
                this.ctx.stroke();

                // Biome name
                this.ctx.fillStyle = biome.color;
                this.ctx.font = `${12 / this.scale}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), biome.x, biome.y - biome.radius - 10);
            }
        });
    }

    renderPlayer() {
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(this.playerX, this.playerY, 8 / this.scale, 0, Math.PI * 2);
        this.ctx.fill();

        // Direction indicator
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 2 / this.scale;
        this.ctx.beginPath();
        this.ctx.moveTo(this.playerX, this.playerY);
        this.ctx.lineTo(this.playerX, this.playerY - 15 / this.scale);
        this.ctx.stroke();
    }

    renderWeatherEffects() {
        if (this.weather !== 'clear') {
            this.ctx.save();
            this.ctx.globalAlpha = this.weatherIntensity * 0.5;

            switch (this.weather) {
                case 'rain':
                    this.renderRain();
                    break;
                case 'storm':
                    this.renderStorm();
                    break;
                case 'wind':
                    this.renderWind();
                    break;
                case 'fog':
                    this.renderFog();
                    break;
            }

            this.ctx.restore();
        }
    }

    renderRain() {
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const length = 10 + Math.random() * 10;

            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 2, y + length);
            this.ctx.stroke();
        }
    }

    renderStorm() {
        // Dark clouds
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 3);

        // Lightning flashes occasionally
        if (Math.random() < 0.01) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    renderWind() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 2;

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const length = 20 + Math.random() * 30;

            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + length, y);
            this.ctx.stroke();
        }
    }

    renderFog() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    adjustColorAlpha(color, alpha) {
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BiosonicTerrain();
});