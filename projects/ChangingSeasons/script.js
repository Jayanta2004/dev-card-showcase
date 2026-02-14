        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const seasonButtons = document.querySelectorAll('.season-btn');
            const seasonScenes = document.querySelectorAll('.season-scene');
            const windowGlass = document.getElementById('windowGlass');
            const soundToggle = document.getElementById('soundToggle');
            const weatherBtn = document.getElementById('weatherBtn');
            const timeBtn = document.getElementById('timeBtn');
            const interactBtn = document.getElementById('interactBtn');
            
            // Info panel elements
            const seasonTitle = document.getElementById('seasonTitle');
            const seasonDescription = document.getElementById('seasonDescription');
            const tempValue = document.getElementById('tempValue');
            const daylightValue = document.getElementById('daylightValue');
            const precipValue = document.getElementById('precipValue');
            const bloomValue = document.getElementById('bloomValue');
            
            // Audio elements
            const springSound = document.getElementById('springSound');
            const summerSound = document.getElementById('summerSound');
            const autumnSound = document.getElementById('autumnSound');
            const winterSound = document.getElementById('winterSound');
            const birdsSound = document.getElementById('birdsSound');
            
            // State
            let currentSeason = 'spring';
            let isSoundOn = true;
            let weatherState = 'clear'; // clear, rainy, cloudy
            let timeOfDay = 'day'; // day, evening, night
            let sceneElements = {};
            
            // Season data
            const seasonData = {
                spring: {
                    title: 'Spring',
                    icon: 'fa-seedling',
                    description: 'Spring is a time of renewal and growth. Flowers bloom, trees regain their leaves, and animals awaken from hibernation. The air is fresh with the scent of rain and blossoms.',
                    temp: '15°C',
                    daylight: '12h',
                    precip: '60mm',
                    bloom: 'High',
                    color: '#a8e6cf',
                    sound: springSound
                },
                summer: {
                    title: 'Summer',
                    icon: 'fa-sun',
                    description: 'Summer brings warm sunshine, long days, and vibrant life. Trees are in full foliage, flowers are in full bloom, and the world is alive with activity.',
                    temp: '28°C',
                    daylight: '16h',
                    precip: '30mm',
                    bloom: 'Peak',
                    color: '#ffd3b6',
                    sound: summerSound
                },
                autumn: {
                    title: 'Autumn',
                    icon: 'fa-leaf',
                    description: 'Autumn is a season of change. Leaves turn brilliant shades of red, orange, and yellow before falling. The air becomes crisp, and harvest time begins.',
                    temp: '12°C',
                    daylight: '10h',
                    precip: '80mm',
                    bloom: 'Fading',
                    color: '#ffaaa5',
                    sound: autumnSound
                },
                winter: {
                    title: 'Winter',
                    icon: 'fa-snowflake',
                    description: 'Winter transforms the landscape into a peaceful, white wonderland. Trees stand bare against the sky, and a quiet stillness settles over the world.',
                    temp: '-2°C',
                    daylight: '8h',
                    precip: '120mm',
                    bloom: 'None',
                    color: '#dcedc1',
                    sound: winterSound
                }
            };
            
            // Initialize the application
            function init() {
                // Set up event listeners
                setupEventListeners();
                
                // Create initial scene elements
                createSceneElements();
                
                // Set initial season
                setSeason('spring');
                
                // Start animations
                startAnimations();
            }
            
            // Set up event listeners
            function setupEventListeners() {
                // Season buttons
                seasonButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        const season = this.getAttribute('data-season');
                        setSeason(season);
                        
                        // Update active button
                        seasonButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                    });
                });
                
                // Sound toggle
                soundToggle.addEventListener('click', toggleSound);
                
                // Interactive buttons
                weatherBtn.addEventListener('click', changeWeather);
                timeBtn.addEventListener('click', changeTimeOfDay);
                interactBtn.addEventListener('click', interactWithScene);
                
                // Click on window to add interactive elements
                windowGlass.addEventListener('click', function(e) {
                    if (e.target === windowGlass) {
                        addInteractiveElement(e.clientX, e.clientY);
                    }
                });
            }
            
            // Set the current season
            function setSeason(season) {
                currentSeason = season;
                
                // Update scene visibility
                seasonScenes.forEach(scene => {
                    scene.classList.remove('active');
                });
                document.getElementById(`${season}Scene`).classList.add('active');
                
                // Update info panel
                updateInfoPanel(season);
                
                // Update sound
                updateSound(season);
                
                // Update window glass tint
                updateWindowTint(season);
                
                // Recreate scene elements for the new season
                recreateSceneElements(season);
            }
            
            // Update the info panel with season data
            function updateInfoPanel(season) {
                const data = seasonData[season];
                
                // Update title and icon
                seasonTitle.innerHTML = `<i class="fas ${data.icon}"></i> ${data.title}`;
                
                // Update description
                seasonDescription.textContent = data.description;
                
                // Update stats
                tempValue.textContent = data.temp;
                daylightValue.textContent = data.daylight;
                precipValue.textContent = data.precip;
                bloomValue.textContent = data.bloom;
                
                // Update interactive button text
                interactBtn.innerHTML = getInteractionText(season);
            }
            
            // Get interaction text based on season
            function getInteractionText(season) {
                switch(season) {
                    case 'spring': return '<i class="fas fa-hand-pointer"></i> Plant a Flower';
                    case 'summer': return '<i class="fas fa-hand-pointer"></i> Add a Butterfly';
                    case 'autumn': return '<i class="fas fa-hand-pointer"></i> Drop a Leaf';
                    case 'winter': return '<i class="fas fa-hand-pointer"></i> Add a Snowflake';
                    default: return '<i class="fas fa-hand-pointer"></i> Interact with Scene';
                }
            }
            
            // Update sound based on season
            function updateSound(season) {
                if (!isSoundOn) return;
                
                // Stop all sounds
                springSound.pause();
                summerSound.pause();
                autumnSound.pause();
                winterSound.pause();
                
                // Play current season sound
                const sound = seasonData[season].sound;
                sound.currentTime = 0;
                sound.play().catch(e => console.log("Audio play failed:", e));
            }
            
            // Toggle sound on/off
            function toggleSound() {
                isSoundOn = !isSoundOn;
                
                if (isSoundOn) {
                    soundToggle.classList.remove('muted');
                    soundToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    updateSound(currentSeason);
                } else {
                    soundToggle.classList.add('muted');
                    soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    
                    // Pause all sounds
                    springSound.pause();
                    summerSound.pause();
                    autumnSound.pause();
                    winterSound.pause();
                }
            }
            
            // Update window tint based on season
            function updateWindowTint(season) {
                const colors = {
                    spring: 'rgba(168, 230, 207, 0.05)',
                    summer: 'rgba(255, 211, 182, 0.05)',
                    autumn: 'rgba(255, 170, 165, 0.05)',
                    winter: 'rgba(220, 237, 193, 0.05)'
                };
                
                windowGlass.style.backgroundColor = colors[season];
            }
            
            // Create scene elements for all seasons
            function createSceneElements() {
                sceneElements = {
                    spring: createSpringScene(),
                    summer: createSummerScene(),
                    autumn: createAutumnScene(),
                    winter: createWinterScene()
                };
            }
            
            // Recreate scene elements for a specific season
            function recreateSceneElements(season) {
                const scene = document.getElementById(`${season}Scene`);
                scene.innerHTML = '';
                
                switch(season) {
                    case 'spring':
                        scene.appendChild(createSpringScene());
                        break;
                    case 'summer':
                        scene.appendChild(createSummerScene());
                        break;
                    case 'autumn':
                        scene.appendChild(createAutumnScene());
                        break;
                    case 'winter':
                        scene.appendChild(createWinterScene());
                        break;
                }
            }
            
            // Create spring scene
            function createSpringScene() {
                const container = document.createElement('div');
                container.className = 'scene-container';
                
                // Add trees
                for (let i = 0; i < 3; i++) {
                    const tree = document.createElement('div');
                    tree.className = 'tree';
                    tree.style.left = `${20 + i * 30}%`;
                    
                    const trunk = document.createElement('div');
                    trunk.className = 'tree-trunk';
                    
                    const foliage = document.createElement('div');
                    foliage.className = 'tree-foliage';
                    
                    tree.appendChild(trunk);
                    tree.appendChild(foliage);
                    container.appendChild(tree);
                }
                
                // Add flowers
                for (let i = 0; i < 15; i++) {
                    const flower = document.createElement('div');
                    flower.className = 'flower';
                    flower.style.left = `${Math.random() * 90 + 5}%`;
                    flower.style.bottom = `${Math.random() * 30}%`;
                    flower.style.animationDelay = `${Math.random() * 4}s`;
                    container.appendChild(flower);
                }
                
                // Add birds
                for (let i = 0; i < 3; i++) {
                    const bird = document.createElement('div');
                    bird.className = 'bird';
                    bird.style.top = `${20 + i * 15}%`;
                    bird.style.animationDelay = `${i * 3}s`;
                    container.appendChild(bird);
                }
                
                return container;
            }
            
            // Create summer scene
            function createSummerScene() {
                const container = document.createElement('div');
                container.className = 'scene-container';
                
                // Add sun
                const sun = document.createElement('div');
                sun.className = 'sun';
                container.appendChild(sun);
                
                // Add trees
                for (let i = 0; i < 4; i++) {
                    const tree = document.createElement('div');
                    tree.className = 'tree';
                    tree.style.left = `${15 + i * 25}%`;
                    
                    const trunk = document.createElement('div');
                    trunk.className = 'tree-trunk';
                    
                    const foliage = document.createElement('div');
                    foliage.className = 'tree-foliage';
                    
                    tree.appendChild(trunk);
                    tree.appendChild(foliage);
                    container.appendChild(tree);
                }
                
                // Add clouds
                for (let i = 0; i < 4; i++) {
                    const cloud = document.createElement('div');
                    cloud.className = 'cloud';
                    cloud.style.width = `${60 + Math.random() * 40}px`;
                    cloud.style.height = `${30 + Math.random() * 20}px`;
                    cloud.style.top = `${15 + i * 15}%`;
                    cloud.style.left = `${Math.random() * 100}%`;
                    cloud.style.animationDelay = `${Math.random() * 20}s`;
                    container.appendChild(cloud);
                }
                
                return container;
            }
            
            // Create autumn scene
            function createAutumnScene() {
                const container = document.createElement('div');
                container.className = 'scene-container';
                
                // Add trees
                for (let i = 0; i < 3; i++) {
                    const tree = document.createElement('div');
                    tree.className = 'tree';
                    tree.style.left = `${20 + i * 30}%`;
                    
                    const trunk = document.createElement('div');
                    trunk.className = 'tree-trunk';
                    
                    const foliage = document.createElement('div');
                    foliage.className = 'tree-foliage';
                    
                    tree.appendChild(trunk);
                    tree.appendChild(foliage);
                    container.appendChild(tree);
                }
                
                // Add falling leaves
                for (let i = 0; i < 20; i++) {
                    const leaf = document.createElement('div');
                    leaf.className = 'leaf';
                    leaf.style.left = `${Math.random() * 100}%`;
                    leaf.style.animationDelay = `${Math.random() * 10}s`;
                    leaf.style.animationDuration = `${8 + Math.random() * 8}s`;
                    container.appendChild(leaf);
                }
                
                return container;
            }
            
            // Create winter scene
            function createWinterScene() {
                const container = document.createElement('div');
                container.className = 'scene-container';
                
                // Add trees
                for (let i = 0; i < 3; i++) {
                    const tree = document.createElement('div');
                    tree.className = 'tree';
                    tree.style.left = `${20 + i * 30}%`;
                    
                    const trunk = document.createElement('div');
                    trunk.className = 'tree-trunk';
                    
                    const foliage = document.createElement('div');
                    foliage.className = 'tree-foliage';
                    
                    tree.appendChild(trunk);
                    tree.appendChild(foliage);
                    container.appendChild(tree);
                }
                
                // Add snow
                for (let i = 0; i < 50; i++) {
                    const snowflake = document.createElement('div');
                    snowflake.className = 'snowflake';
                    snowflake.style.left = `${Math.random() * 100}%`;
                    snowflake.style.animationDelay = `${Math.random() * 10}s`;
                    snowflake.style.animationDuration = `${5 + Math.random() * 10}s`;
                    container.appendChild(snowflake);
                }
                
                return container;
            }
            
            // Change weather
            function changeWeather() {
                const weatherStates = ['clear', 'rainy', 'cloudy'];
                const currentIndex = weatherStates.indexOf(weatherState);
                weatherState = weatherStates[(currentIndex + 1) % weatherStates.length];
                
                // Visual feedback
                weatherBtn.innerHTML = `<i class="fas fa-cloud-sun-rain"></i> ${weatherState.charAt(0).toUpperCase() + weatherState.slice(1)} Weather`;
                
                // Update scene based on weather
                updateWeatherEffects();
            }
            
            // Update weather effects
            function updateWeatherEffects() {
                const scene = document.getElementById(`${currentSeason}Scene`);
                
                // Remove existing weather effects
                const existingEffects = scene.querySelectorAll('.weather-effect');
                existingEffects.forEach(effect => effect.remove());
                
                // Add new effects based on weather
                if (weatherState === 'rainy') {
                    addRainEffect(scene);
                } else if (weatherState === 'cloudy') {
                    addCloudEffect(scene);
                }
            }
            
            // Add rain effect
            function addRainEffect(scene) {
                for (let i = 0; i < 50; i++) {
                    const raindrop = document.createElement('div');
                    raindrop.className = 'weather-effect';
                    raindrop.style.position = 'absolute';
                    raindrop.style.width = '1px';
                    raindrop.style.height = '15px';
                    raindrop.style.backgroundColor = 'rgba(100, 150, 255, 0.7)';
                    raindrop.style.left = `${Math.random() * 100}%`;
                    raindrop.style.top = `${-20}%`;
                    raindrop.style.animation = `fall ${0.5 + Math.random() * 1}s linear infinite`;
                    raindrop.style.animationDelay = `${Math.random() * 2}s`;
                    scene.appendChild(raindrop);
                }
            }
            
            // Add cloud effect
            function addCloudEffect(scene) {
                for (let i = 0; i < 8; i++) {
                    const cloud = document.createElement('div');
                    cloud.className = 'weather-effect cloud';
                    cloud.style.width = `${80 + Math.random() * 60}px`;
                    cloud.style.height = `${40 + Math.random() * 30}px`;
                    cloud.style.top = `${10 + i * 10}%`;
                    cloud.style.left = `${Math.random() * 100}%`;
                    cloud.style.animationDelay = `${Math.random() * 20}s`;
                    scene.appendChild(cloud);
                }
                
                // Dim the sun if present
                const sun = scene.querySelector('.sun');
                if (sun) {
                    sun.style.opacity = '0.6';
                }
            }
            
            // Change time of day
            function changeTimeOfDay() {
                const times = ['day', 'evening', 'night'];
                const currentIndex = times.indexOf(timeOfDay);
                timeOfDay = times[(currentIndex + 1) % times.length];
                
                // Visual feedback
                timeBtn.innerHTML = `<i class="fas fa-clock"></i> ${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}`;
                
                // Update scene based on time
                updateTimeOfDayEffects();
            }
            
            // Update time of day effects
            function updateTimeOfDayEffects() {
                const scene = document.getElementById(`${currentSeason}Scene`);
                
                // Update background gradient based on time
                let gradient;
                switch(timeOfDay) {
                    case 'day':
                        gradient = 'rgba(255, 255, 255, 0)';
                        break;
                    case 'evening':
                        gradient = 'rgba(255, 150, 50, 0.3)';
                        break;
                    case 'night':
                        gradient = 'rgba(0, 0, 50, 0.7)';
                        break;
                }
                
                scene.style.background = gradient;
                
                // Update sun/moon visibility
                const sun = scene.querySelector('.sun');
                if (sun) {
                    if (timeOfDay === 'night') {
                        sun.style.display = 'none';
                    } else {
                        sun.style.display = 'block';
                        sun.style.backgroundColor = timeOfDay === 'evening' ? '#ff9966' : '#ffde59';
                    }
                }
                
                // Add stars for night
                const existingStars = scene.querySelectorAll('.star');
                existingStars.forEach(star => star.remove());
                
                if (timeOfDay === 'night') {
                    addStars(scene);
                }
            }
            
            // Add stars to scene
            function addStars(scene) {
                for (let i = 0; i < 50; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    star.style.position = 'absolute';
                    star.style.width = `${Math.random() * 3 + 1}px`;
                    star.style.height = star.style.width;
                    star.style.backgroundColor = 'white';
                    star.style.borderRadius = '50%';
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 100}%`;
                    star.style.opacity = `${Math.random() * 0.8 + 0.2}`;
                    star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite alternate`;
                    scene.appendChild(star);
                }
            }
            
            // Interact with scene
            function interactWithScene() {
                const scene = document.getElementById(`${currentSeason}Scene`);
                
                switch(currentSeason) {
                    case 'spring':
                        addSpringInteraction(scene);
                        break;
                    case 'summer':
                        addSummerInteraction(scene);
                        break;
                    case 'autumn':
                        addAutumnInteraction(scene);
                        break;
                    case 'winter':
                        addWinterInteraction(scene);
                        break;
                }
            }
            
            // Add spring interaction (flower)
            function addSpringInteraction(scene) {
                const flower = document.createElement('div');
                flower.className = 'flower';
                flower.style.left = `${Math.random() * 80 + 10}%`;
                flower.style.bottom = `${Math.random() * 40}%`;
                flower.style.animationDelay = `${Math.random() * 4}s`;
                scene.appendChild(flower);
                
                // Play bird sound
                if (isSoundOn) {
                    birdsSound.currentTime = 0;
                    birdsSound.play().catch(e => console.log("Sound play failed"));
                }
            }
            
            // Add summer interaction (butterfly)
            function addSummerInteraction(scene) {
                const butterfly = document.createElement('div');
                butterfly.className = 'butterfly';
                butterfly.style.position = 'absolute';
                butterfly.style.width = '30px';
                butterfly.style.height = '30px';
                butterfly.style.background = 'radial-gradient(circle, #ffde59 0%, #ff9966 100%)';
                butterfly.style.borderRadius = '50%';
                butterfly.style.left = `${Math.random() * 80 + 10}%`;
                butterfly.style.top = `${Math.random() * 60 + 20}%`;
                butterfly.style.animation = `float 3s infinite ease-in-out`;
                scene.appendChild(butterfly);
            }
            
            // Add autumn interaction (leaf)
            function addAutumnInteraction(scene) {
                const leaf = document.createElement('div');
                leaf.className = 'leaf';
                leaf.style.left = `${Math.random() * 100}%`;
                leaf.style.animationDuration = `${8 + Math.random() * 8}s`;
                scene.appendChild(leaf);
            }
            
            // Add winter interaction (snowflake)
            function addWinterInteraction(scene) {
                const snowflake = document.createElement('div');
                snowflake.className = 'snowflake';
                snowflake.style.left = `${Math.random() * 100}%`;
                snowflake.style.animationDuration = `${5 + Math.random() * 10}s`;
                scene.appendChild(snowflake);
            }
            
            // Add interactive element on click
            function addInteractiveElement(x, y) {
                const rect = windowGlass.getBoundingClientRect();
                const relativeX = ((x - rect.left) / rect.width) * 100;
                const relativeY = ((y - rect.top) / rect.height) * 100;
                
                const scene = document.getElementById(`${currentSeason}Scene`);
                
                switch(currentSeason) {
                    case 'spring':
                        const flower = document.createElement('div');
                        flower.className = 'flower';
                        flower.style.left = `${relativeX}%`;
                        flower.style.bottom = `${100 - relativeY}%`;
                        scene.appendChild(flower);
                        break;
                        
                    case 'winter':
                        const snowflake = document.createElement('div');
                        snowflake.className = 'snowflake';
                        snowflake.style.left = `${relativeX}%`;
                        snowflake.style.top = `${relativeY}%`;
                        scene.appendChild(snowflake);
                        break;
                }
            }
            
            // Start animations
            function startAnimations() {
                // CSS animation for twinkling stars
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes twinkle {
                        0% { opacity: 0.2; }
                        100% { opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Initialize the application
            init();
        });