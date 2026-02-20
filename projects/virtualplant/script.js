// Game state
const gameState = {
    plantType: 'cactus',
    growth: 0,
    health: 100,
    water: 50,
    sunlight: 50,
    temperature: 22,
    humidity: 60,
    age: 0,
    stage: 'seed',
    lastWatered: 0,
    lastSun: 0,
    needs: {
        cactus: { water: 'low', sunlight: 'high', temp: 'warm', humidity: 'low' },
        flower: { water: 'medium', sunlight: 'medium', temp: 'moderate', humidity: 'medium' },
        fern: { water: 'high', sunlight: 'low', temp: 'cool', humidity: 'high' },
        tree: { water: 'medium', sunlight: 'high', temp: 'moderate', humidity: 'medium' }
    },
    growthStages: ['seed', 'sprout', 'young', 'mature', 'flowering', 'fruit'],
    notifications: []
};

// DOM Elements
const plantElement = document.getElementById('plant');
const soilElement = document.getElementById('soil');
const healthBar = document.getElementById('health-bar');
const growthBar = document.getElementById('growth-bar');
const waterBar = document.getElementById('water-bar');
const sunlightBar = document.getElementById('sunlight-bar');
const healthValue = document.getElementById('health-value');
const growthValue = document.getElementById('growth-value');
const waterValue = document.getElementById('water-value');
const sunlightValue = document.getElementById('sunlight-value');
const currentPlantName = document.getElementById('current-plant-name');
const plantType = document.getElementById('plant-type');
const plantAge = document.getElementById('plant-age');
const plantStage = document.getElementById('plant-stage');
const plantNeeds = document.getElementById('plant-needs');
const notificationArea = document.getElementById('notification-area');
const tempSlider = document.getElementById('temperature-slider');
const humiditySlider = document.getElementById('humidity-slider');
const tempValue = document.getElementById('temp-value');
const humidityValue = document.getElementById('humidity-value');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
    startGameLoop();
});

// Event Listeners
function setupEventListeners() {
    // Plant selection
    document.querySelectorAll('.plant-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const plantType = this.getAttribute('data-plant');
            selectPlant(plantType);
            
            // Update active state
            document.querySelectorAll('.plant-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Action buttons
    document.getElementById('water-btn').addEventListener('click', waterPlant);
    document.getElementById('sunlight-btn').addEventListener('click', giveSunlight);
    document.getElementById('fertilize-btn').addEventListener('click', fertilizePlant);
    document.getElementById('prune-btn').addEventListener('click', prunePlant);
    document.getElementById('reset-btn').addEventListener('click', resetPlant);
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);

    // Environment sliders
    tempSlider.addEventListener('input', function() {
        gameState.temperature = parseInt(this.value);
        tempValue.textContent = `${gameState.temperature}°C`;
        updatePlant();
    });

    humiditySlider.addEventListener('input', function() {
        gameState.humidity = parseInt(this.value);
        humidityValue.textContent = `${gameState.humidity}%`;
        updatePlant();
    });
}

// Game Functions
function initializeGame() {
    updateBars();
    updatePlantInfo();
    generatePlant();
    addNotification('Welcome to Virtual Plant Grower! Choose a plant and start growing!', 'info');
}

function selectPlant(type) {
    gameState.plantType = type;
    gameState.growth = 10; // Start with some growth for new plants
    updatePlantInfo();
    generatePlant();
    addNotification(`You planted a ${type}!`, 'success');
}

function waterPlant() {
    if (gameState.water >= 100) {
        addNotification('Plant is already well watered!', 'warning');
        return;
    }
    
    gameState.water = Math.min(100, gameState.water + 25);
    gameState.lastWatered = Date.now();
    
    // Different plants respond differently to water
    if (gameState.plantType === 'cactus' && gameState.water > 70) {
        gameState.health -= 10;
        addNotification('Cactus doesn\'t like too much water!', 'warning');
    } else if (gameState.plantType === 'fern' && gameState.water < 30) {
        gameState.health -= 5;
        addNotification('Fern needs more water!', 'warning');
    } else {
        gameState.health = Math.min(100, gameState.health + 5);
    }
    
    updateBars();
    generatePlant();
    addNotification('Plant watered!', 'success');
}

function giveSunlight() {
    if (gameState.sunlight >= 100) {
        addNotification('Plant has enough sunlight!', 'warning');
        return;
    }
    
    gameState.sunlight = Math.min(100, gameState.sunlight + 30);
    gameState.lastSun = Date.now();
    
    // Different plants respond differently to sunlight
    if (gameState.plantType === 'fern' && gameState.sunlight > 70) {
        gameState.health -= 10;
        addNotification('Fern prefers shade! Too much sun!', 'warning');
    } else if (gameState.plantType === 'cactus' && gameState.sunlight < 30) {
        gameState.health -= 5;
        addNotification('Cactus needs more sunlight!', 'warning');
    } else {
        gameState.health = Math.min(100, gameState.health + 5);
        gameState.growth = Math.min(100, gameState.growth + 5);
    }
    
    updateBars();
    generatePlant();
    addNotification('Sunlight given!', 'success');
}

function fertilizePlant() {
    if (gameState.health < 80) {
        gameState.health = Math.min(100, gameState.health + 20);
        gameState.growth = Math.min(100, gameState.growth + 10);
        updateBars();
        generatePlant();
        addNotification('Plant fertilized! Growth boosted!', 'success');
    } else {
        addNotification('Plant is already healthy!', 'info');
    }
}

function prunePlant() {
    if (gameState.growth > 30) {
        const oldGrowth = gameState.growth;
        gameState.growth = Math.max(10, gameState.growth - 15);
        gameState.health = Math.min(100, gameState.health + 10);
        updateBars();
        generatePlant();
        addNotification(`Plant pruned! Growth: ${oldGrowth}% → ${gameState.growth}%`, 'success');
    } else {
        addNotification('Plant is too small to prune!', 'warning');
    }
}

function updatePlant() {
    // Check environment conditions
    const needs = gameState.needs[gameState.plantType];
    
    // Temperature check
    let tempOk = true;
    if (needs.temp === 'warm' && gameState.temperature < 20) tempOk = false;
    if (needs.temp === 'cool' && gameState.temperature > 25) tempOk = false;
    if (needs.temp === 'moderate' && (gameState.temperature < 15 || gameState.temperature > 28)) tempOk = false;
    
    // Humidity check
    let humidityOk = true;
    if (needs.humidity === 'low' && gameState.humidity > 50) humidityOk = false;
    if (needs.humidity === 'high' && gameState.humidity < 60) humidityOk = false;
    if (needs.humidity === 'medium' && (gameState.humidity < 40 || gameState.humidity > 70)) humidityOk = false;
    
    if (!tempOk || !humidityOk) {
        gameState.health = Math.max(0, gameState.health - 1);
        updateBars();
    }
    
    // Auto-growth based on good conditions
    if (tempOk && humidityOk && gameState.water > 30 && gameState.sunlight > 30) {
        gameState.growth = Math.min(100, gameState.growth + 0.5);
        updateBars();
        generatePlant();
    }
}

function updateBars() {
    healthBar.style.width = `${gameState.health}%`;
    growthBar.style.width = `${gameState.growth}%`;
    waterBar.style.width = `${gameState.water}%`;
    sunlightBar.style.width = `${gameState.sunlight}%`;
    
    healthValue.textContent = `${Math.round(gameState.health)}%`;
    growthValue.textContent = `${Math.round(gameState.growth)}%`;
    waterValue.textContent = `${Math.round(gameState.water)}%`;
    sunlightValue.textContent = `${Math.round(gameState.sunlight)}%`;
    
    // Update colors based on values
    healthBar.style.background = gameState.health > 50 ? 
        'linear-gradient(to right, #66bb6a, #4caf50)' : 
        'linear-gradient(to right, #ef5350, #f44336)';
}

function updatePlantInfo() {
    const plantName = gameState.plantType.charAt(0).toUpperCase() + gameState.plantType.slice(1);
    currentPlantName.textContent = plantName;
    
    const needs = gameState.needs[gameState.plantType];
    plantType.textContent = getPlantTypeDescription(gameState.plantType);
    plantAge.textContent = `${gameState.age} days`;
    
    // Determine growth stage based on growth percentage
    let stageIndex = Math.floor(gameState.growth / 20);
    if (stageIndex >= gameState.growthStages.length) stageIndex = gameState.growthStages.length - 1;
    gameState.stage = gameState.growthStages[stageIndex];
    
    plantStage.textContent = gameState.stage.charAt(0).toUpperCase() + gameState.stage.slice(1);
    plantNeeds.textContent = `${needs.water} water, ${needs.sunlight} sunlight`;
}

function getPlantTypeDescription(type) {
    const descriptions = {
        cactus: 'Succulent',
        flower: 'Blooming',
        fern: 'Foliage',
        tree: 'Woody'
    };
    return descriptions[type] || 'Plant';
}

function generatePlant() {
    // Clear existing plant
    plantElement.innerHTML = '';
    
    // Add plant parts based on type and growth
    const growthPercent = gameState.growth;
    
    if (gameState.plantType === 'cactus') {
        generateCactus(growthPercent);
    } else if (gameState.plantType === 'flower') {
        generateFlower(growthPercent);
    } else if (gameState.plantType === 'fern') {
        generateFern(growthPercent);
    } else if (gameState.plantType === 'tree') {
        generateTree(growthPercent);
    }
    
    // Update soil appearance based on water level
    updateSoil();
}

function generateCactus(growth) {
    const height = 50 + (growth / 100) * 150;
    const width = 20 + (growth / 100) * 15;
    
    // Main stem
    const stem = document.createElement('div');
    stem.className = 'plant-part stem';
    stem.style.width = `${width}px`;
    stem.style.height = `${height}px`;
    stem.style.bottom = '110px';
    stem.style.left = '50%';
    stem.style.transform = 'translateX(-50%)';
    stem.style.backgroundColor = '#4caf50';
    plantElement.appendChild(stem);
    
    // Arms for mature cactus
    if (growth > 50) {
        const armHeight = height * 0.6;
        const armWidth = width * 0.7;
        
        // Left arm
        const leftArm = document.createElement('div');
        leftArm.className = 'plant-part stem';
        leftArm.style.width = `${armWidth}px`;
        leftArm.style.height = `${armHeight}px`;
        leftArm.style.bottom = '110px';
        leftArm.style.left = 'calc(50% - 40px)';
        leftArm.style.transform = 'rotate(-30deg)';
        leftArm.style.transformOrigin = 'bottom right';
        plantElement.appendChild(leftArm);
        
        // Right arm
        const rightArm = document.createElement('div');
        rightArm.className = 'plant-part stem';
        rightArm.style.width = `${armWidth}px`;
        rightArm.style.height = `${armHeight}px`;
        rightArm.style.bottom = '110px';
        rightArm.style.left = 'calc(50% + 40px)';
        rightArm.style.transform = 'rotate(30deg)';
        rightArm.style.transformOrigin = 'bottom left';
        plantElement.appendChild(rightArm);
    }
    
    // Spines
    if (growth > 20) {
        for (let i = 0; i < 10; i++) {
            const spine = document.createElement('div');
            spine.className = 'plant-part';
            spine.style.width = '2px';
            spine.style.height = '10px';
            spine.style.backgroundColor = '#8bc34a';
            spine.style.position = 'absolute';
            spine.style.bottom = `${110 + Math.random() * height}px`;
            spine.style.left = `calc(50% + ${(Math.random() - 0.5) * width}px)`;
            plantElement.appendChild(spine);
        }
    }
}

function generateFlower(growth) {
    const stemHeight = 30 + (growth / 100) * 120;
    
    // Stem
    const stem = document.createElement('div');
    stem.className = 'plant-part stem';
    stem.style.width = '8px';
    stem.style.height = `${stemHeight}px`;
    stem.style.bottom = '110px';
    stem.style.left = '50%';
    stem.style.transform = 'translateX(-50%)';
    plantElement.appendChild(stem);
    
    // Leaves
    if (growth > 20) {
        for (let i = 0; i < 3; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'plant-part leaf';
            leaf.style.width = '25px';
            leaf.style.height = '15px';
            leaf.style.bottom = `${110 + (stemHeight / 4) * (i + 1)}px`;
            leaf.style.left = 'calc(50% + 10px)';
            leaf.style.transform = `rotate(${i % 2 === 0 ? '20' : '-20'}deg)`;
            plantElement.appendChild(leaf);
        }
    }
    
    // Flower head
    if (growth > 40) {
        const flowerSize = 15 + (growth / 100) * 25;
        
        // Center
        const center = document.createElement('div');
        center.className = 'plant-part';
        center.style.width = `${flowerSize / 2}px`;
        center.style.height = `${flowerSize / 2}px`;
        center.style.borderRadius = '50%';
        center.style.backgroundColor = '#ffeb3b';
        center.style.bottom = `${110 + stemHeight}px`;
        center.style.left = '50%';
        center.style.transform = 'translateX(-50%)';
        plantElement.appendChild(center);
        
        // Petals
        const petalColors = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50'];
        const numPetals = growth > 70 ? 8 : 5;
        
        for (let i = 0; i < numPetals; i++) {
            const angle = (i * 360) / numPetals;
            const petal = document.createElement('div');
            petal.className = 'plant-part petal';
            petal.style.width = `${flowerSize}px`;
            petal.style.height = `${flowerSize}px`;
            petal.style.backgroundColor = petalColors[i % petalColors.length];
            petal.style.opacity = '0.8';
            petal.style.bottom = `${110 + stemHeight}px`;
            petal.style.left = '50%';
            petal.style.transform = `translateX(-50%) rotate(${angle}deg) translateY(-${flowerSize}px)`;
            plantElement.appendChild(petal);
        }
    }
}

function generateFern(growth) {
    const baseHeight = 80 + (growth / 100) * 100;
    
    // Multiple fronds
    const numFronds = 3 + Math.floor(growth / 25);
    
    for (let f = 0; f < numFronds; f++) {
        const angle = -30 + (f * 60) / (numFronds - 1);
        const frondHeight = baseHeight * (0.7 + Math.random() * 0.3);
        
        // Main frond stem
        const stem = document.createElement('div');
        stem.className = 'plant-part stem';
        stem.style.width = '4px';
        stem.style.height = `${frondHeight}px`;
        stem.style.bottom = '110px';
        stem.style.left = `calc(50% + ${(f - (numFronds - 1) / 2) * 15}px)`;
        stem.style.transform = `rotate(${angle}deg)`;
        stem.style.transformOrigin = 'bottom center';
        stem.style.backgroundColor = '#388e3c';
        plantElement.appendChild(stem);
        
        // Leaflets
        const numLeaflets = 8 + Math.floor(growth / 15);
        for (let i = 1; i <= numLeaflets; i++) {
            if (Math.random() > 0.3) {
                const leaflet = document.createElement('div');
                leaflet.className = 'plant-part leaf';
                leaflet.style.width = `${15 + (growth / 100) * 10}px`;
                leaflet.style.height = `${8 + (growth / 100) * 6}px`;
                leaflet.style.bottom = `${110 + (frondHeight / numLeaflets) * i}px`;
                leaflet.style.left = `calc(50% + ${(f - (numFronds - 1) / 2) * 15}px)`;
                leaflet.style.transform = `rotate(${angle}deg) translateX(${i % 2 === 0 ? '15' : '-15'}px)`;
                leaflet.style.transformOrigin = 'bottom center';
                leaflet.style.backgroundColor = '#81c784';
                plantElement.appendChild(leaflet);
            }
        }
    }
}

function generateTree(growth) {
    const trunkHeight = 50 + (growth / 100) * 150;
    const trunkWidth = 10 + (growth / 100) * 15;
    
    // Trunk
    const trunk = document.createElement('div');
    trunk.className = 'plant-part stem';
    trunk.style.width = `${trunkWidth}px`;
    trunk.style.height = `${trunkHeight}px`;
    trunk.style.bottom = '110px';
    trunk.style.left = '50%';
    trunk.style.transform = 'translateX(-50%)';
    trunk.style.backgroundColor = '#8d6e63';
    plantElement.appendChild(trunk);
    
    // Branches
    if (growth > 30) {
        const numBranches = 2 + Math.floor(growth / 25);
        
        for (let b = 0; b < numBranches; b++) {
            const branchHeight = trunkHeight * (0.3 + (b / numBranches) * 0.5);
            const branchLength = 30 + (growth / 100) * 50;
            const angle = -45 + (b * 90) / (numBranches - 1);
            
            const branch = document.createElement('div');
            branch.className = 'plant-part stem';
            branch.style.width = `${trunkWidth * 0.7}px`;
            branch.style.height = `${branchLength}px`;
            branch.style.bottom = `${110 + branchHeight}px`;
            branch.style.left = '50%';
            branch.style.transform = `translateX(-50%) rotate(${angle}deg)`;
            branch.style.transformOrigin = 'bottom center';
            branch.style.backgroundColor = '#795548';
            plantElement.appendChild(branch);
            
            // Leaves on branches
            if (growth > 50) {
                const leafCount = 10 + Math.floor(growth / 10);
                for (let l = 0; l < leafCount; l++) {
                    if (Math.random() > 0.5) {
                        const leaf = document.createElement('div');
                        leaf.className = 'plant-part leaf';
                        leaf.style.width = '20px';
                        leaf.style.height = '15px';
                        leaf.style.bottom = `${110 + branchHeight + (branchLength / leafCount) * l}px`;
                        leaf.style.left = '50%';
                        leaf.style.transform = `translateX(-50%) rotate(${angle}deg) translateX(${branchLength * 0.7}px) rotate(${Math.random() * 60 - 30}deg)`;
                        leaf.style.transformOrigin = 'bottom left';
                        leaf.style.backgroundColor = '#4caf50';
                        plantElement.appendChild(leaf);
                    }
                }
            }
        }
    }
    
    // Tree top (leaves)
    if (growth > 20) {
        const canopySize = 40 + (growth / 100) * 60;
        const canopy = document.createElement('div');
        canopy.className = 'plant-part';
        canopy.style.width = `${canopySize}px`;
        canopy.style.height = `${canopySize}px`;
        canopy.style.borderRadius = '50%';
        canopy.style.backgroundColor = '#81c784';
        canopy.style.opacity = '0.8';
        canopy.style.bottom = `${110 + trunkHeight - canopySize / 3}px`;
        canopy.style.left = '50%';
        canopy.style.transform = 'translateX(-50%)';
        plantElement.appendChild(canopy);
    }
}

function updateSoil() {
    // Change soil color based on water level
    let soilColor;
    if (gameState.water < 20) {
        soilColor = 'linear-gradient(to bottom, #8d6e63 0%, #5d4037 100%)';
    } else if (gameState.water < 50) {
        soilColor = 'linear-gradient(to bottom, #a1887f 0%, #8d6e63 100%)';
    } else if (gameState.water < 80) {
        soilColor = 'linear-gradient(to bottom, #bcaaa4 0%, #a1887f 100%)';
    } else {
        soilColor = 'linear-gradient(to bottom, #d7ccc8 0%, #bcaaa4 100%)';
    }
    
    soilElement.style.background = soilColor;
}

function addNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error') icon = 'times-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    notificationArea.insertBefore(notification, notificationArea.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Keep only last 5 notifications
    while (notificationArea.children.length > 5) {
        notificationArea.removeChild(notificationArea.lastChild);
    }
}

function startGameLoop() {
    setInterval(() => {
        // Natural decay
        gameState.water = Math.max(0, gameState.water - 0.5);
        gameState.sunlight = Math.max(0, gameState.sunlight - 0.3);
        
        // Age plant
        gameState.age += 0.1;
        
        // Check for critical conditions
        if (gameState.water < 10) {
            gameState.health = Math.max(0, gameState.health - 1);
            if (Math.random() < 0.1) {
                addNotification('Plant is thirsty!', 'warning');
            }
        }
        
        if (gameState.sunlight < 10) {
            gameState.health = Math.max(0, gameState.health - 0.5);
            if (Math.random() < 0.1) {
                addNotification('Plant needs sunlight!', 'warning');
            }
        }
        
        // Update everything
        updateBars();
        updatePlantInfo();
        updatePlant();
        
        // Check for growth stage change
        const oldStage = gameState.stage;
        let stageIndex = Math.floor(gameState.growth / 20);
        if (stageIndex >= gameState.growthStages.length) stageIndex = gameState.growthStages.length - 1;
        gameState.stage = gameState.growthStages[stageIndex];
        
        if (oldStage !== gameState.stage) {
            addNotification(`Plant has reached the ${gameState.stage} stage!`, 'success');
            generatePlant();
        }
        
        // Check for plant death
        if (gameState.health <= 0) {
            addNotification('Your plant has died! Try again with different care.', 'error');
            resetPlant();
        }
        
        // Check for full growth
        if (gameState.growth >= 100) {
            addNotification('Your plant has reached full growth! Congratulations!', 'success');
        }
    }, 2000); // Update every 2 seconds
}

function resetPlant() {
    gameState.growth = 10;
    gameState.health = 100;
    gameState.water = 50;
    gameState.sunlight = 50;
    gameState.age = 0;
    gameState.stage = 'seed';
    
    updateBars();
    updatePlantInfo();
    generatePlant();
    addNotification('New plant started!', 'info');
}

function saveGame() {
    const saveData = {
        plantType: gameState.plantType,
        growth: gameState.growth,
        health: gameState.health,
        water: gameState.water,
        sunlight: gameState.sunlight,
        age: Math.floor(gameState.age),
        stage: gameState.stage
    };
    
    localStorage.setItem('plantGrowerSave', JSON.stringify(saveData));
    addNotification('Game saved successfully!', 'success');
}

function loadGame() {
    const savedData = localStorage.getItem('plantGrowerSave');
    
    if (savedData) {
        try {
            const saveData = JSON.parse(savedData);
            
            gameState.plantType = saveData.plantType || gameState.plantType;
            gameState.growth = saveData.growth || gameState.growth;
            gameState.health = saveData.health || gameState.health;
            gameState.water = saveData.water || gameState.water;
            gameState.sunlight = saveData.sunlight || gameState.sunlight;
            gameState.age = saveData.age || gameState.age;
            gameState.stage = saveData.stage || gameState.stage;
            
            // Update UI
            updateBars();
            updatePlantInfo();
            generatePlant();
            
            // Update active plant button
            document.querySelectorAll('.plant-option').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-plant') === gameState.plantType) {
                    btn.classList.add('active');
                }
            });
            
            addNotification('Game loaded successfully!', 'success');
        } catch (error) {
            addNotification('Error loading saved game.', 'error');
        }
    } else {
        addNotification('No saved game found.', 'warning');
    }
}