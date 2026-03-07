function toggleModal(id) {
    document.getElementById(id).classList.toggle('hidden');
}

class CatchMinigame {
    constructor(petApp) {
        this.petApp = petApp;
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        this.score = 0;
        this.timeLeft = 15;
        this.basket = { x: 130, y: 270, width: 40, height: 20 };
        this.treats = [];
        this.animationId = null;
        this.timerId = null;

        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isActive) return;
            const rect = this.canvas.getBoundingClientRect();
            this.basket.x = e.clientX - rect.left - (this.basket.width / 2);
            // Bounds check
            if (this.basket.x < 0) this.basket.x = 0;
            if (this.basket.x + this.basket.width > this.canvas.width) this.basket.x = this.canvas.width - this.basket.width;
        });
    }

    start() {
        if (this.petApp.state.energy < 20 || this.petApp.state.isSick) {
            alert("Pet is too tired or sick to play!");
            return;
        }
        
        document.getElementById('start-minigame-btn').classList.add('hidden');
        this.isActive = true;
        this.score = 0;
        this.timeLeft = 15;
        this.treats = [];
        
        this.petApp.state.energy -= 15;
        this.petApp.state.hunger -= 10;

        this.timerId = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) this.end();
        }, 1000);

        this.loop();
    }

    spawnTreat() {
        if (Math.random() < 0.05) {
            this.treats.push({
                x: Math.random() * (this.canvas.width - 15),
                y: 0,
                speed: 2 + Math.random() * 2,
                emoji: Math.random() > 0.5 ? '🍎' : '🪙'
            });
        }
    }

    loop() {
        if (!this.isActive) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Basket
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(this.basket.x, this.basket.y, this.basket.width, this.basket.height);

        // Manage Treats
        this.spawnTreat();
        for (let i = this.treats.length - 1; i >= 0; i--) {
            let t = this.treats[i];
            t.y += t.speed;

            this.ctx.font = '20px Arial';
            this.ctx.fillText(t.emoji, t.x, t.y);

            // Collision Detection
            if (t.y + 20 >= this.basket.y && t.x + 15 >= this.basket.x && t.x <= this.basket.x + this.basket.width) {
                this.score += (t.emoji === '🪙') ? 5 : 2; 
                this.treats.splice(i, 1);
            } else if (t.y > this.canvas.height) {
                this.treats.splice(i, 1);
            }
        }

        document.getElementById('minigame-score').innerText = `Score: ${this.score} | Time: ${this.timeLeft}s`;
        this.animationId = requestAnimationFrame(() => this.loop());
    }

    end() {
        this.isActive = false;
        clearInterval(this.timerId);
        cancelAnimationFrame(this.animationId);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillText("Game Over!", 100, 150);
        
        // Reward Player
        this.petApp.state.coins += this.score;
        this.petApp.state.happy += Math.floor(this.score / 2);
        this.petApp.logMessage(`Earned ${this.score} coins!`);
        this.petApp.triggerInteraction();
        
        document.getElementById('start-minigame-btn').classList.remove('hidden');
    }

    close() {
        if(this.isActive) this.end();
        toggleModal('minigame-modal');
    }
}


class VirtualPet {
    constructor() {
        this.petDictionary = {
            'chicken': { EGG: '🥚', BABY: '🐣', TEEN: '🐥', ADULT: '🐔', SAD: '😿', DEAD: '🪦' },
            'cat':     { EGG: '🥚', BABY: '🐱', TEEN: '🐈', ADULT: '🐆', SAD: '😿', DEAD: '🪦' },
            'dog':     { EGG: '🥚', BABY: '🐶', TEEN: '🐕', ADULT: '🐺', SAD: '😿', DEAD: '🪦' },
            'rabbit':  { EGG: '🥚', BABY: '🐰', TEEN: '🐇', ADULT: '🐇', SAD: '😿', DEAD: '🪦' },
            'parrot':  { EGG: '🥚', BABY: '🐦', TEEN: '🦜', ADULT: '🦚', SAD: '😿', DEAD: '🪦' },
            'monkey':  { EGG: '🥚', BABY: '🐵', TEEN: '🐒', ADULT: '🦍', SAD: '😿', DEAD: '🪦' }
        };

        this.shopItems = [
            { id: 'apple', name: '🍎 Apple', price: 10, hunger: 15, happy: 5 },
            { id: 'burger', name: '🍔 Burger', price: 25, hunger: 40, happy: 10 },
            { id: 'sushi', name: '🍣 Sushi', price: 40, hunger: 60, happy: 20 },
            { id: 'medicine', name: '💊 Medicine', price: 50, hunger: 0, happy: 0, cures: true }
        ];

        this.state = {
            petType: null,
            coins: 50, // Start with some money
            hunger: 100, happy: 100, energy: 100, clean: 100,
            age: 0, stage: 'EGG', isSleeping: false, hasPoop: false, isSick: false,
            lastUpdated: Date.now()
        };

        this.gameLoop = null;
        this.initGame();
        this.renderShop();
    }

    initGame() {
        const saved = localStorage.getItem('advancedPetSave');
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
            this.calculateOfflineTime();
            this.startGameLoop();
        } else {
            document.getElementById('selection-modal').classList.remove('hidden');
        }
    }

    choosePet(type) {
        this.state.petType = type;
        this.state.lastUpdated = Date.now();
        toggleModal('selection-modal');
        this.saveGame();
        this.startGameLoop();
        this.logMessage(`You adopted a ${type}!`);
    }

    startGameLoop() {
        this.updateUI();
        this.gameLoop = setInterval(() => this.tick(), 1000);
    }

    tick() {
        if (this.state.stage === 'DEAD' || !this.state.petType) return;

        const now = Date.now();
        const deltaTime = (now - this.state.lastUpdated) / 1000;
        this.state.lastUpdated = now;
        const decayRate = 0.5 * deltaTime;

        // Sickness penalty
        const sickPenalty = this.state.isSick ? 2 : 1;

        if (this.state.isSleeping) {
            this.state.energy = Math.min(100, this.state.energy + (decayRate * 5));
            this.state.hunger -= decayRate * 0.2 * sickPenalty; 
        } else {
            this.state.hunger -= decayRate * sickPenalty;
            this.state.energy -= decayRate * 0.8 * sickPenalty;
            this.state.happy -= decayRate * (this.state.hasPoop ? 3 : 0.5) * sickPenalty; 
        }

        // Poop & Sickness Logic
        if (!this.state.hasPoop && this.state.hunger > 50 && Math.random() < 0.05 * deltaTime) {
            this.state.hasPoop = true;
            this.state.clean -= 30;
            this.logMessage("Oh no! A mess was made.");
        }

        if (this.state.hasPoop && !this.state.isSick && Math.random() < 0.02 * deltaTime) {
            this.state.isSick = true;
            this.logMessage("Your pet got sick from the mess!");
        }

        this.state.age += deltaTime;
        this.checkBounds();
        this.checkEvolution();
        this.saveGame();
        this.updateUI();
    }

    checkBounds() {
        ['hunger', 'happy', 'energy', 'clean'].forEach(stat => {
            this.state[stat] = Math.max(0, Math.min(100, this.state[stat]));
        });

        if (this.state.hunger === 0 || this.state.happy === 0) {
            this.state.stage = 'DEAD';
            this.logMessage("Your pet has returned to the stars...");
            clearInterval(this.gameLoop);
        }
    }

    checkEvolution() {
        if (this.state.stage === 'DEAD') return;
        const ageInMin = this.state.age / 60;
        if (this.state.stage === 'EGG' && ageInMin > 0.5) { this.state.stage = 'BABY'; this.logMessage("Egg hatched!"); }
        else if (this.state.stage === 'BABY' && ageInMin > 2) { this.state.stage = 'TEEN'; this.logMessage("Grew to a teen!"); }
        else if (this.state.stage === 'TEEN' && ageInMin > 5) { this.state.stage = 'ADULT'; this.logMessage("Fully grown!"); }
    }

    calculateOfflineTime() {
        const now = Date.now();
        const offlineSecs = (now - this.state.lastUpdated) / 1000;
        if (offlineSecs > 3600) {
            this.state.hunger -= (offlineSecs / 3600) * 15;
            this.state.happy -= (offlineSecs / 3600) * 15;
        }
        this.state.lastUpdated = now;
        this.logMessage("Welcome back!");
    }

    // --- ACTIONS ---
    openMinigame() {
        if (this.state.isSleeping || this.state.stage === 'DEAD' || this.state.stage === 'EGG') return;
        toggleModal('minigame-modal');
    }

    openShop() {
        if (this.state.stage === 'DEAD') return;
        document.getElementById('shop-coins').innerText = this.state.coins;
        toggleModal('shop-modal');
    }

    buyItem(itemId) {
        const item = this.shopItems.find(i => i.id === itemId);
        if (this.state.coins >= item.price) {
            this.state.coins -= item.price;
            
            if (item.cures) {
                if (this.state.isSick) {
                    this.state.isSick = false;
                    this.logMessage("Cured the sickness!");
                } else {
                    this.logMessage("Pet wasn't sick, but feels great!");
                }
            } else {
                if (this.state.isSleeping || this.state.isSick) {
                    this.logMessage("Can't eat right now!");
                    this.state.coins += item.price; // Refund
                    return;
                }
                this.state.hunger += item.hunger;
                this.state.happy += item.happy;
                this.logMessage(`Ate a delicious ${item.name}!`);
            }
            
            document.getElementById('shop-coins').innerText = this.state.coins;
            this.triggerInteraction();
        } else {
            alert("Not enough coins! Play the game to earn more.");
        }
    }

    clean() {
        if (this.state.stage === 'DEAD') return;
        if (this.state.hasPoop) {
            this.state.hasPoop = false; this.state.clean = 100;
            this.logMessage("All clean!"); this.triggerInteraction();
        } else {
            this.logMessage("Already clean.");
        }
    }

    toggleSleep() {
        if (this.state.stage === 'DEAD' || this.state.stage === 'EGG') return;
        this.state.isSleeping = !this.state.isSleeping;
        this.logMessage(this.state.isSleeping ? "Lights out. Zzz..." : "Waking up!");
        this.triggerInteraction();
    }

    triggerInteraction() {
        this.checkBounds(); this.saveGame(); this.updateUI();
        const sprite = document.getElementById('pet-sprite');
        sprite.style.transform = 'scale(1.2)';
        setTimeout(() => sprite.style.transform = 'scale(1)', 200);
    }

    saveGame() { localStorage.setItem('advancedPetSave', JSON.stringify(this.state)); }
    resetGame() { if(confirm("Delete your current pet forever?")) { localStorage.removeItem('advancedPetSave'); location.reload(); } }

    // --- UI RENDER ---
    renderShop() {
        const shopDiv = document.getElementById('shop-items');
        shopDiv.innerHTML = '';
        this.shopItems.forEach(item => {
            shopDiv.innerHTML += `
                <div class="shop-item">
                    <span>${item.name}</span>
                    <button onclick="petApp.buyItem('${item.id}')">Buy (🪙${item.price})</button>
                </div>
            `;
        });
    }

    updateUI() {
        if (!this.state.petType) return;

        document.getElementById('bar-hunger').style.width = `${this.state.hunger}%`;
        document.getElementById('bar-happy').style.width = `${this.state.happy}%`;
        document.getElementById('bar-energy').style.width = `${this.state.energy}%`;
        document.getElementById('bar-clean').style.width = `${this.state.clean}%`;
        document.getElementById('age-display').innerText = `Age: ${Math.floor(this.state.age / 60)}m`;
        document.getElementById('coin-display').innerText = `🪙 ${this.state.coins}`;
        
        const petSprite = document.getElementById('pet-sprite');
        const sprites = this.petDictionary[this.state.petType];

        if (this.state.happy < 30 && this.state.stage !== 'DEAD' && this.state.stage !== 'EGG') {
            petSprite.innerText = sprites['SAD'];
        } else {
            petSprite.innerText = sprites[this.state.stage];
        }

        if (this.state.isSick) {
            petSprite.classList.add('sick-pet');
            document.getElementById('sick-sprite').classList.remove('hidden');
        } else {
            petSprite.classList.remove('sick-pet');
            document.getElementById('sick-sprite').classList.add('hidden');
        }

        if (this.state.isSleeping) {
            petSprite.classList.add('sleeping');
            document.getElementById('zZz-sprite').classList.remove('hidden');
            document.getElementById('btn-sleep').innerText = "Wake Up";
        } else {
            petSprite.classList.remove('sleeping');
            document.getElementById('zZz-sprite').classList.add('hidden');
            document.getElementById('btn-sleep').innerText = "Sleep";
        }

        if (this.state.hasPoop && this.state.stage !== 'DEAD') {
            document.getElementById('poop-sprite').classList.remove('hidden');
        } else {
            document.getElementById('poop-sprite').classList.add('hidden');
        }
    }

    logMessage(msg) { document.getElementById('message-log').innerText = msg; }
}

const petApp = new VirtualPet();
const minigame = new CatchMinigame(petApp);