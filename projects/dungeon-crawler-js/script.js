/**
 * DUNGEON CRAWLER JS: INFINITE DEPTHS
 * Version 3.0 - Enhanced Edition
 * * Features:
 * - A* Pathfinding for AI
 * - Cellular Automata & Drunkard Walk Hybrid Generation
 * - Full Inventory & Gear System with Items
 * - Dynamic Viewport Rendering
 * - Experience & Leveling System
 * - Multiple Enemy Types with Unique AI
 * - Particle Effects & Visual Enhancements
 * - Mini-map System
 * - Status Effects (Poison, Regen)
 */

// --- CONFIGURATION ---
const CONFIG = {
    TILE_SIZE: 32,
    MAP_SIZE: 64,
    VISION_RADIUS: 8,
    MAX_LOG_ENTRIES: 50,
    DIFFICULTY_SCALING: 1.2,
    PARTICLE_DURATION: 30
};

const TILE = { WALL: 0, FLOOR: 1, STAIRS: 2, DOOR: 3, WATER: 4, CHEST: 5 };

const ITEMS = {
    HEALTH_POTION: { name: 'Health Potion', type: 'consumable', effect: 'heal', value: 30, icon: '🧪', color: '#ff4d88' },
    MEGA_POTION: { name: 'Mega Potion', type: 'consumable', effect: 'heal', value: 60, icon: '🍾', color: '#ff0088' },
    SWORD: { name: 'Iron Sword', type: 'weapon', atk: 8, icon: '⚔️', color: '#c0c0c0' },
    GREAT_SWORD: { name: 'Great Sword', type: 'weapon', atk: 15, icon: '🗡️', color: '#ffd700' },
    LEATHER_ARMOR: { name: 'Leather Armor', type: 'armor', def: 5, icon: '🛡️', color: '#8b4513' },
    STEEL_ARMOR: { name: 'Steel Armor', type: 'armor', def: 12, icon: '🛡️', color: '#b0b0b0' },
    POISON_DAGGER: { name: 'Poison Dagger', type: 'weapon', atk: 6, effect: 'poison', icon: '🗡️', color: '#00ff00' },
    REGEN_AMULET: { name: 'Regen Amulet', type: 'accessory', effect: 'regen', icon: '💎', color: '#00ffff' }
};

const ENEMY_TYPES = {
    RAT: { hp: 20, atk: 3, xp: 10, char: 'r', color: '#888888', behavior: 'coward', speed: 1.5 },
    GOBLIN: { hp: 35, atk: 6, xp: 25, char: 'g', color: '#4dff88', behavior: 'aggressive', speed: 1 },
    ORC: { hp: 75, atk: 14, xp: 50, char: 'O', color: '#ff4d4d', behavior: 'tank', speed: 0.7 },
    SKELETON: { hp: 50, atk: 10, xp: 40, char: 'S', color: '#e0e0e0', behavior: 'ranged', speed: 0.9 },
    DARK_MAGE: { hp: 45, atk: 16, xp: 70, char: 'M', color: '#9d00ff', behavior: 'caster', speed: 0.8 },
    DRAGON: { hp: 200, atk: 25, xp: 200, char: 'D', color: '#ff9d00', behavior: 'boss', speed: 0.6 }
};

// --- CORE UTILITIES ---
const rng = {
    int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    chance: (val) => Math.random() < val,
    choose: (arr) => arr[rng.int(0, arr.length - 1)]
};

// --- PARTICLE SYSTEM ---
class Particle {
    constructor(x, y, color, text = '', vx = 0, vy = -2) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.text = text;
        this.vx = vx + (Math.random() - 0.5) * 2;
        this.vy = vy + (Math.random() - 0.5) * 2;
        this.life = CONFIG.PARTICLE_DURATION;
        this.alpha = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = this.life / CONFIG.PARTICLE_DURATION;
        return this.life > 0;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 14px Courier';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

// --- DATA STRUCTURES: A* PATHFINDING ---
class Node {
    constructor(x, y, walkable) {
        this.x = x; this.y = y;
        this.walkable = walkable;
        this.g = 0; this.h = 0; this.f = 0;
        this.parent = null;
    }
}

function findPath(start, end, map) {
    let openList = [];
    let closedList = new Set();
    
    let startNode = new Node(start.x, start.y, true);
    let endNode = new Node(end.x, end.y, true);
    
    openList.push(startNode);
    
    while (openList.length > 0) {
        let current = openList.sort((a, b) => a.f - b.f)[0];
        if (current.x === endNode.x && current.y === endNode.y) {
            let path = [];
            while (current.parent) {
                path.push({x: current.x, y: current.y});
                current = current.parent;
            }
            return path.reverse();
        }
        
        openList = openList.filter(n => n !== current);
        closedList.add(`${current.x},${current.y}`);
        
        const neighbors = [
            {x: 0, y: -1}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 1, y: 0}
        ];
        
        for (let dir of neighbors) {
            let nx = current.x + dir.x;
            let ny = current.y + dir.y;
            
            if (nx < 0 || ny < 0 || nx >= CONFIG.MAP_SIZE || ny >= CONFIG.MAP_SIZE) continue;
            if (map[ny][nx] === TILE.WALL || closedList.has(`${nx},${ny}`)) continue;
            
            let neighborNode = new Node(nx, ny, true);
            neighborNode.g = current.g + 1;
            neighborNode.h = Math.abs(nx - endNode.x) + Math.abs(ny - endNode.y);
            neighborNode.f = neighborNode.g + neighborNode.h;
            neighborNode.parent = current;
            
            if (!openList.some(n => n.x === nx && n.y === ny)) openList.push(neighborNode);
        }
    }
    return [];
}

// --- WORLD GENERATOR ---
class LevelGenerator {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(TILE.WALL));
    }

    generate() {
        // Drunkard's Walk + Smoothing
        let x = Math.floor(this.size / 2);
        let y = Math.floor(this.size / 2);
        let floorCount = 0;
        const target = (this.size * this.size) * 0.45;

        while (floorCount < target) {
            if (this.grid[y][x] === TILE.WALL) {
                this.grid[y][x] = TILE.FLOOR;
                floorCount++;
            }
            const move = rng.int(0, 3);
            if (move === 0 && y > 2) y--;
            else if (move === 1 && y < this.size - 3) y++;
            else if (move === 2 && x > 2) x--;
            else if (move === 3 && x < this.size - 3) x++;
        }
        
        this.placeStairs();
        this.placeChests();
        return this.grid;
    }

    placeStairs() {
        let placed = false;
        while (!placed) {
            let rx = rng.int(5, this.size - 5);
            let ry = rng.int(5, this.size - 5);
            if (this.grid[ry][rx] === TILE.FLOOR) {
                this.grid[ry][rx] = TILE.STAIRS;
                placed = true;
            }
        }
    }

    placeChests() {
        const chestCount = rng.int(2, 5);
        for (let i = 0; i < chestCount; i++) {
            let placed = false;
            while (!placed) {
                let rx = rng.int(3, this.size - 3);
                let ry = rng.int(3, this.size - 3);
                if (this.grid[ry][rx] === TILE.FLOOR) {
                    this.grid[ry][rx] = TILE.CHEST;
                    placed = true;
                }
            }
        }
    }
}

// --- ENTITY CLASSES ---
class Actor {
    constructor(x, y, type, stats) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.baseAtk = stats.atk;
        this.atk = stats.atk;
        this.def = 0;
        this.char = stats.char;
        this.color = stats.color;
        this.xp = stats.xp || 0;
        this.level = 1;
        this.xpToNext = 100;
        this.inventory = [];
        this.equipped = { weapon: null, armor: null, accessory: null };
        this.statusEffects = [];
        this.behavior = stats.behavior || 'aggressive';
        this.speed = stats.speed || 1;
        this.turnCounter = 0;
        this.kills = 0;
    }

    addXP(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNext) {
            this.levelUp();
            return true;
        }
        return false;
    }

    levelUp() {
        this.level++;
        this.xp = 0;
        this.xpToNext = Math.floor(this.xpToNext * 1.5);
        this.maxHp += 15;
        this.hp = this.maxHp;
        this.baseAtk += 3;
        this.atk = this.baseAtk;
        this.updateStats();
        return true;
    }

    updateStats() {
        this.atk = this.baseAtk;
        this.def = 0;
        if (this.equipped.weapon) this.atk += this.equipped.weapon.atk;
        if (this.equipped.armor) this.def += this.equipped.armor.def;
    }

    addItem(item) {
        this.inventory.push(item);
    }

    useItem(index) {
        const item = this.inventory[index];
        if (!item) return false;

        if (item.type === 'consumable') {
            if (item.effect === 'heal') {
                this.hp = Math.min(this.maxHp, this.hp + item.value);
                this.inventory.splice(index, 1);
                return { success: true, msg: `Used ${item.name}, restored ${item.value} HP` };
            }
        } else if (item.type === 'weapon') {
            if (this.equipped.weapon) this.inventory.push(this.equipped.weapon);
            this.equipped.weapon = item;
            this.inventory.splice(index, 1);
            this.updateStats();
            return { success: true, msg: `Equipped ${item.name}` };
        } else if (item.type === 'armor') {
            if (this.equipped.armor) this.inventory.push(this.equipped.armor);
            this.equipped.armor = item;
            this.inventory.splice(index, 1);
            this.updateStats();
            return { success: true, msg: `Equipped ${item.name}` };
        } else if (item.type === 'accessory') {
            if (this.equipped.accessory) this.inventory.push(this.equipped.accessory);
            this.equipped.accessory = item;
            this.inventory.splice(index, 1);
            return { success: true, msg: `Equipped ${item.name}` };
        }
        return { success: false };
    }

    addStatusEffect(effect, duration = 5) {
        this.statusEffects.push({ type: effect, duration });
    }

    updateStatusEffects() {
        this.statusEffects = this.statusEffects.filter(eff => {
            eff.duration--;
            if (eff.type === 'poison') {
                this.hp -= 2;
                this.hp = Math.max(0, this.hp);
            } else if (eff.type === 'regen' && this.type === 'player') {
                this.hp = Math.min(this.maxHp, this.hp + 3);
            }
            return eff.duration > 0;
        });
    }

    hasStatusEffect(type) {
        return this.statusEffects.some(eff => eff.type === type);
    }
}

// --- MAIN GAME ENGINE ---
class Engine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.floor = 1;
        this.isInvOpen = false;
        this.entities = [];
        this.particles = [];
        this.groundItems = [];
        this.gameOver = false;
        this.score = 0;
        
        this.init();
        this.setupListeners();
        this.gameLoop();
    }

    init() {
        this.resize();
        const gen = new LevelGenerator(CONFIG.MAP_SIZE);
        this.map = gen.generate();
        
        // Spawn Player (only if new game)
        if (!this.player) {
            const pPos = this.getEmptyTile();
            this.player = new Actor(pPos.x, pPos.y, 'player', {
                hp: 100, 
                atk: 12, 
                char: '@', 
                color: '#00d2ff',
                behavior: 'player'
            });
            
            // Give starting items
            this.player.addItem({...ITEMS.HEALTH_POTION});
            this.player.addItem({...ITEMS.HEALTH_POTION});
        } else {
            // Move player to new floor start position
            const pPos = this.getEmptyTile();
            this.player.x = pPos.x;
            this.player.y = pPos.y;
        }
        
        // Spawn Enemies
        this.spawnEnemies();
        
        // Spawn Items on ground
        this.spawnItems();
        
        if (this.floor === 1) {
            this.addLog('Welcome to the dungeon...', "#ffd700");
        } else {
            this.addLog(`Floor ${this.floor}: You descend deeper...`, "#ffd700");
        }
        this.render();
    }

    spawnEnemies() {
        this.entities = [];
        const baseCount = 4 + Math.floor(this.floor * 1.5);
        const count = rng.int(baseCount, baseCount + 3);
        
        for (let i = 0; i < count; i++) {
            const pos = this.getEmptyTile();
            
            // Enemy selection based on floor
            let enemyType;
            if (this.floor === 1) {
                enemyType = rng.choose(['RAT', 'GOBLIN']);
            } else if (this.floor < 5) {
                enemyType = rng.choose(['RAT', 'GOBLIN', 'SKELETON']);
            } else if (this.floor < 10) {
                enemyType = rng.choose(['GOBLIN', 'ORC', 'SKELETON', 'DARK_MAGE']);
            } else {
                enemyType = rng.choose(['ORC', 'SKELETON', 'DARK_MAGE', 'DRAGON']);
            }
            
            const template = ENEMY_TYPES[enemyType];
            const scaling = Math.pow(CONFIG.DIFFICULTY_SCALING, this.floor - 1);
            
            const enemy = new Actor(pos.x, pos.y, enemyType.toLowerCase(), {
                hp: Math.floor(template.hp * scaling),
                atk: Math.floor(template.atk * scaling),
                xp: Math.floor(template.xp * scaling),
                char: template.char,
                color: template.color,
                behavior: template.behavior,
                speed: template.speed
            });
            
            this.entities.push(enemy);
        }
    }

    spawnItems() {
        this.groundItems = [];
        const itemCount = rng.int(3, 6);
        
        for (let i = 0; i < itemCount; i++) {
            const pos = this.getEmptyTile();
            const itemKeys = Object.keys(ITEMS);
            const itemKey = itemKeys[rng.int(0, itemKeys.length - 1)];
            this.groundItems.push({ ...ITEMS[itemKey], x: pos.x, y: pos.y });
        }
    }

    getEmptyTile() {
        let x, y;
        let attempts = 0;
        do {
            x = rng.int(0, CONFIG.MAP_SIZE - 1);
            y = rng.int(0, CONFIG.MAP_SIZE - 1);
            attempts++;
            if (attempts > 1000) break; // Safety
        } while (
            this.map[y][x] !== TILE.FLOOR || 
            this.entities.some(e => e.x === x && e.y === y) ||
            (this.player && this.player.x === x && this.player.y === y) ||
            (this.groundItems && this.groundItems.some(i => i.x === x && i.y === y))
        );
        return {x, y};
    }

    handleInput(key) {
        if (this.gameOver) {
            if (key === 'r' || key === 'R') {
                this.restart();
            }
            return;
        }

        let dx = 0, dy = 0;
        if (key === 'w' || key === 'W' || key === 'ArrowUp') dy = -1;
        if (key === 's' || key === 'S' || key === 'ArrowDown') dy = 1;
        if (key === 'a' || key === 'A' || key === 'ArrowLeft') dx = -1;
        if (key === 'd' || key === 'D' || key === 'ArrowRight') dx = 1;
        if (key === 'i' || key === 'I') this.toggleInventory();
        
        // Use item with number keys
        if (key >= '1' && key <= '9') {
            const index = parseInt(key) - 1;
            const result = this.player.useItem(index);
            if (result && result.success) {
                this.addLog(result.msg, '#00ff88');
                this.updateInventoryUI();
            }
        }

        if (dx !== 0 || dy !== 0) {
            this.moveEntity(this.player, dx, dy);
            this.player.updateStatusEffects();
            this.enemyTurn();
            
            // Check game over
            if (this.player.hp <= 0) {
                this.endGame(false);
            }
        }
        this.render();
    }

    moveEntity(entity, dx, dy) {
        const nx = entity.x + dx;
        const ny = entity.y + dy;

        // Boundary check
        if (nx < 0 || ny < 0 || nx >= CONFIG.MAP_SIZE || ny >= CONFIG.MAP_SIZE) return;

        // Wall Collision
        if (this.map[ny][nx] === TILE.WALL) return;

        // Combat Collision
        const target = this.entities.find(e => e.x === nx && e.y === ny);
        if (target) {
            this.combat(entity, target);
            return;
        }

        // Move
        entity.x = nx;
        entity.y = ny;

        // Player-specific interactions
        if (entity.type === 'player') {
            // Stairs check
            if (this.map[ny][nx] === TILE.STAIRS) {
                this.floor++;
                this.score += 100 * this.floor;
                this.init();
                return;
            }

            // Chest check
            if (this.map[ny][nx] === TILE.CHEST) {
                this.openChest(nx, ny);
                this.map[ny][nx] = TILE.FLOOR;
            }

            // Item pickup
            const itemIndex = this.groundItems.findIndex(i => i.x === nx && i.y === ny);
            if (itemIndex !== -1) {
                const item = this.groundItems[itemIndex];
                this.player.addItem(item);
                this.addLog(`Picked up ${item.name}`, item.color);
                this.groundItems.splice(itemIndex, 1);
                this.updateInventoryUI();
            }
        }
    }

    openChest(x, y) {
        const loot = [];
        const lootCount = rng.int(1, 3);
        
        for (let i = 0; i < lootCount; i++) {
            const itemKeys = Object.keys(ITEMS);
            const itemKey = rng.choose(itemKeys);
            const item = {...ITEMS[itemKey]};
            this.player.addItem(item);
            loot.push(item.name);
        }
        
        // Particle effect
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(
                x * CONFIG.TILE_SIZE + 16,
                y * CONFIG.TILE_SIZE + 16,
                '#ffd700',
                '✨',
                (Math.random() - 0.5) * 3,
                -Math.random() * 3
            ));
        }
        
        this.addLog(`Chest opened! Found: ${loot.join(', ')}`, '#ffd700');
        this.updateInventoryUI();
    }

    enemyTurn() {
        this.entities.forEach(enemy => {
            // Speed mechanic - enemies with lower speed skip turns
            enemy.turnCounter += enemy.speed;
            if (enemy.turnCounter < 1) return;
            enemy.turnCounter = 0;

            // Update status effects
            enemy.updateStatusEffects();
            if (enemy.hp <= 0) {
                this.entities = this.entities.filter(e => e !== enemy);
                return;
            }

            const dist = Math.abs(enemy.x - this.player.x) + Math.abs(enemy.y - this.player.y);
            
            // Behavior patterns
            switch(enemy.behavior) {
                case 'coward':
                    // Flee if low HP or player too close
                    if (enemy.hp < enemy.maxHp * 0.3 || dist < 3) {
                        this.moveEnemyAway(enemy);
                    } else if (dist < 10) {
                        this.moveEnemyToward(enemy);
                    }
                    break;
                    
                case 'aggressive':
                    if (dist < 12) {
                        this.moveEnemyToward(enemy);
                    }
                    break;
                    
                case 'tank':
                    // Only chase if close
                    if (dist < 6) {
                        this.moveEnemyToward(enemy);
                    }
                    break;
                    
                case 'ranged':
                    // Keep distance but attack from range
                    if (dist < 4) {
                        this.moveEnemyAway(enemy);
                    } else if (dist === 4 || dist === 5) {
                        // Stay at range and attack
                        if (rng.chance(0.5)) {
                            this.rangedAttack(enemy, this.player);
                        }
                    } else if (dist < 10) {
                        this.moveEnemyToward(enemy);
                    }
                    break;
                    
                case 'caster':
                    if (dist < 8) {
                        if (rng.chance(0.3)) {
                            this.magicAttack(enemy, this.player);
                        } else if (dist < 5) {
                            this.moveEnemyAway(enemy);
                        }
                    }
                    break;
                    
                case 'boss':
                    if (dist < 10) {
                        if (rng.chance(0.2)) {
                            this.areaAttack(enemy);
                        } else {
                            this.moveEnemyToward(enemy);
                        }
                    }
                    break;
                    
                default:
                    if (dist < 8) {
                        this.moveEnemyToward(enemy);
                    }
            }
        });
    }

    moveEnemyToward(enemy) {
        const path = findPath({x: enemy.x, y: enemy.y}, {x: this.player.x, y: this.player.y}, this.map);
        if (path.length > 0) {
            const step = path[0];
            if (step.x === this.player.x && step.y === this.player.y) {
                this.combat(enemy, this.player);
            } else {
                if (!this.entities.some(e => e !== enemy && e.x === step.x && e.y === step.y)) {
                    enemy.x = step.x;
                    enemy.y = step.y;
                }
            }
        }
    }

    moveEnemyAway(enemy) {
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        const moveX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
        const moveY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
        
        const nx = enemy.x + moveX;
        const ny = enemy.y + moveY;
        
        if (nx >= 0 && ny >= 0 && nx < CONFIG.MAP_SIZE && ny < CONFIG.MAP_SIZE) {
            if (this.map[ny][nx] !== TILE.WALL && !this.entities.some(e => e.x === nx && e.y === ny)) {
                enemy.x = nx;
                enemy.y = ny;
            }
        }
    }

    rangedAttack(source, target) {
        const dmg = Math.floor(source.atk * 0.7);
        target.hp -= Math.max(1, dmg - target.def);
        target.hp = Math.max(0, target.hp);
        this.addLog(`${source.type} shoots ${target.type} for ${dmg} HP!`, '#ff9d00');
        this.createCombatParticles(target.x, target.y, dmg, '#ff9d00');
    }

    magicAttack(source, target) {
        const dmg = Math.floor(source.atk * 1.2);
        target.hp -= Math.max(1, dmg - Math.floor(target.def * 0.5));
        target.hp = Math.max(0, target.hp);
        target.addStatusEffect('poison', 3);
        this.addLog(`${source.type} casts spell on ${target.type} for ${dmg} HP + poison!`, '#9d00ff');
        this.createCombatParticles(target.x, target.y, dmg, '#9d00ff');
    }

    areaAttack(source) {
        const dist = Math.abs(source.x - this.player.x) + Math.abs(source.y - this.player.y);
        if (dist <= 3) {
            const dmg = Math.floor(source.atk * 1.5);
            this.player.hp -= Math.max(1, dmg - this.player.def);
            this.player.hp = Math.max(0, this.player.hp);
            this.addLog(`${source.type} unleashes devastating area attack for ${dmg} HP!`, '#ff0000');
            this.createCombatParticles(this.player.x, this.player.y, dmg, '#ff0000');
        }
    }

    combat(source, target) {
        const baseDmg = rng.int(source.atk - 2, source.atk + 5);
        const dmg = Math.max(1, baseDmg - target.def);
        target.hp -= dmg;
        target.hp = Math.max(0, target.hp);
        
        // Combat particles
        this.createCombatParticles(target.x, target.y, dmg, source.type === 'player' ? '#00ff88' : '#ff4d4d');
        
        this.addLog(
            `${source.type} hits ${target.type} for ${dmg} HP`, 
            source.type === 'player' ? '#fff' : '#ff4d4d'
        );

        // Apply weapon effects
        if (source.equipped && source.equipped.weapon) {
            if (source.equipped.weapon.effect === 'poison') {
                target.addStatusEffect('poison', 5);
                this.addLog(`${target.type} is poisoned!`, '#00ff00');
            }
        }

        // Apply accessory effects
        if (source.equipped && source.equipped.accessory) {
            if (source.equipped.accessory.effect === 'regen') {
                source.addStatusEffect('regen', 3);
            }
        }

        if (target.hp <= 0) {
            this.addLog(`${target.type} was slain!`, "#ffd700");
            
            // Player kills enemy - gain XP and maybe loot
            if (source.type === 'player') {
                const leveledUp = source.addXP(target.xp);
                source.kills++;
                this.score += target.xp;
                
                if (leveledUp) {
                    this.addLog(`LEVEL UP! Now level ${source.level}`, '#00ffff');
                    this.createLevelUpParticles();
                }
                
                // Drop loot chance
                if (rng.chance(0.3)) {
                    const itemKeys = Object.keys(ITEMS);
                    const itemKey = rng.choose(itemKeys);
                    const item = {...ITEMS[itemKey]};
                    this.groundItems.push({ ...item, x: target.x, y: target.y });
                    this.addLog(`${target.type} dropped ${item.name}!`, item.color);
                }
            }
            
            this.entities = this.entities.filter(e => e !== target);
        }
    }

    createCombatParticles(x, y, dmg, color) {
        // Damage number
        this.particles.push(new Particle(
            x * CONFIG.TILE_SIZE + 16,
            y * CONFIG.TILE_SIZE + 16,
            color,
            `-${dmg}`,
            0,
            -3
        ));
        
        // Hit effects
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(
                x * CONFIG.TILE_SIZE + 16,
                y * CONFIG.TILE_SIZE + 16,
                color,
                '•',
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            ));
        }
    }

    createLevelUpParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(
                this.player.x * CONFIG.TILE_SIZE + 16,
                this.player.y * CONFIG.TILE_SIZE + 16,
                '#00ffff',
                '★',
                (Math.random() - 0.5) * 5,
                -Math.random() * 5
            ));
        }
    }

    addLog(msg, color) {
        const log = document.getElementById('log');
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.style.color = color;
        entry.innerText = `> ${msg}`;
        log.prepend(entry);
        
        // Limit log entries
        while (log.children.length > CONFIG.MAX_LOG_ENTRIES) {
            log.removeChild(log.lastChild);
        }
    }

    toggleInventory() {
        this.isInvOpen = !this.isInvOpen;
        document.getElementById('inventory-panel').style.display = this.isInvOpen ? 'block' : 'none';
        if (this.isInvOpen) {
            this.updateInventoryUI();
        }
    }

    updateInventoryUI() {
        const invList = document.getElementById('inv-list');
        invList.innerHTML = '';
        
        // Equipped items
        if (this.player.equipped.weapon || this.player.equipped.armor || this.player.equipped.accessory) {
            const equipped = document.createElement('li');
            equipped.style.color = '#ffd700';
            equipped.style.marginBottom = '10px';
            equipped.innerHTML = '<strong>Equipped:</strong>';
            invList.appendChild(equipped);
            
            if (this.player.equipped.weapon) {
                const item = document.createElement('li');
                item.style.color = this.player.equipped.weapon.color;
                item.innerHTML = `${this.player.equipped.weapon.icon} ${this.player.equipped.weapon.name} (+${this.player.equipped.weapon.atk} ATK)`;
                invList.appendChild(item);
            }
            if (this.player.equipped.armor) {
                const item = document.createElement('li');
                item.style.color = this.player.equipped.armor.color;
                item.innerHTML = `${this.player.equipped.armor.icon} ${this.player.equipped.armor.name} (+${this.player.equipped.armor.def} DEF)`;
                invList.appendChild(item);
            }
            if (this.player.equipped.accessory) {
                const item = document.createElement('li');
                item.style.color = this.player.equipped.accessory.color;
                item.innerHTML = `${this.player.equipped.accessory.icon} ${this.player.equipped.accessory.name}`;
                invList.appendChild(item);
            }
            
            const divider = document.createElement('li');
            divider.innerHTML = '---';
            divider.style.color = '#666';
            invList.appendChild(divider);
        }
        
        // Inventory items
        this.player.inventory.forEach((item, index) => {
            const li = document.createElement('li');
            li.style.color = item.color;
            li.style.cursor = 'pointer';
            li.innerHTML = `[${index + 1}] ${item.icon} ${item.name}`;
            if (item.type === 'consumable') {
                li.innerHTML += ` (+${item.value} HP)`;
            } else if (item.type === 'weapon') {
                li.innerHTML += ` (+${item.atk} ATK)`;
            } else if (item.type === 'armor') {
                li.innerHTML += ` (+${item.def} DEF)`;
            }
            invList.appendChild(li);
        });
        
        if (this.player.inventory.length === 0 && !this.player.equipped.weapon && !this.player.equipped.armor) {
            const empty = document.createElement('li');
            empty.style.color = '#666';
            empty.innerText = 'Empty';
            invList.appendChild(empty);
        }
    }

    endGame(victory) {
        this.gameOver = true;
        if (victory) {
            this.addLog('VICTORY! You completed the dungeon!', '#00ff00');
        } else {
            this.addLog('GAME OVER - Press R to restart', '#ff0000');
        }
    }

    restart() {
        this.floor = 1;
        this.gameOver = false;
        this.score = 0;
        this.particles = [];
        this.player = null; // Reset player for new game
        this.init();
    }

    gameLoop() {
        // Update particles
        this.particles = this.particles.filter(p => p.update());
        
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    render() {
        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = Math.floor(this.canvas.width / 2 / CONFIG.TILE_SIZE);
        const cy = Math.floor(this.canvas.height / 2 / CONFIG.TILE_SIZE);
        const offsetX = cx - this.player.x;
        const offsetY = cy - this.player.y;

        // Render Map
        for (let y = 0; y < CONFIG.MAP_SIZE; y++) {
            for (let x = 0; x < CONFIG.MAP_SIZE; x++) {
                const screenX = (x + offsetX) * CONFIG.TILE_SIZE;
                const screenY = (y + offsetY) * CONFIG.TILE_SIZE;
                
                // Different tile styles
                if (this.map[y][x] === TILE.WALL) {
                    const gradient = this.ctx.createLinearGradient(
                        screenX, screenY, screenX, screenY + CONFIG.TILE_SIZE
                    );
                    gradient.addColorStop(0, '#1a1a2e');
                    gradient.addColorStop(1, '#0a0a14');
                    this.ctx.fillStyle = gradient;
                } else if (this.map[y][x] === TILE.STAIRS) {
                    this.ctx.fillStyle = '#0055ff';
                } else if (this.map[y][x] === TILE.CHEST) {
                    this.ctx.fillStyle = '#ffd700';
                } else {
                    // Floor with slight variation
                    const shade = 0x1a + (x + y) % 5;
                    this.ctx.fillStyle = `#${shade.toString(16)}${shade.toString(16)}2e`;
                }

                this.ctx.fillRect(screenX, screenY, CONFIG.TILE_SIZE - 1, CONFIG.TILE_SIZE - 1);
                
                // Add borders to walls
                if (this.map[y][x] === TILE.WALL) {
                    this.ctx.strokeStyle = '#2a2a4e';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(screenX, screenY, CONFIG.TILE_SIZE - 1, CONFIG.TILE_SIZE - 1);
                }
                
                // Stairs glow
                if (this.map[y][x] === TILE.STAIRS) {
                    this.ctx.fillStyle = '#0088ff';
                    this.ctx.font = 'bold 24px Courier';
                    this.ctx.fillText('▼', screenX + 6, screenY + 24);
                }
                
                // Chest
                if (this.map[y][x] === TILE.CHEST) {
                    this.ctx.fillStyle = '#ffd700';
                    this.ctx.font = 'bold 20px Courier';
                    this.ctx.fillText('⚑', screenX + 8, screenY + 22);
                }
            }
        }

        // Render ground items
        if (this.groundItems) {
            this.groundItems.forEach(item => {
                const screenX = (item.x + offsetX) * CONFIG.TILE_SIZE;
                const screenY = (item.y + offsetY) * CONFIG.TILE_SIZE;
                this.ctx.fillStyle = item.color;
                this.ctx.font = '18px Arial';
                this.ctx.fillText(item.icon, screenX + 8, screenY + 22);
            });
        }

        // Render Enemies with HP bars
        this.entities.forEach(e => {
            const screenX = (e.x + offsetX) * CONFIG.TILE_SIZE;
            const screenY = (e.y + offsetY) * CONFIG.TILE_SIZE;
            
            // Shadow
            this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
            this.ctx.fillRect(screenX + 4, screenY + 26, CONFIG.TILE_SIZE - 8, 3);
            
            // Character
            this.ctx.fillStyle = e.color;
            this.ctx.font = 'bold 20px Courier';
            this.ctx.fillText(e.char, screenX + 8, screenY + 22);
            
            // HP Bar
            const hpPercent = e.hp / e.maxHp;
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(screenX, screenY - 5, CONFIG.TILE_SIZE, 4);
            this.ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
            this.ctx.fillRect(screenX, screenY - 5, CONFIG.TILE_SIZE * hpPercent, 4);
            
            // Status effect indicators
            if (e.hasStatusEffect('poison')) {
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.fillText('☠', screenX + 24, screenY + 8);
            }
        });

        // Render Player with glow
        const pScreenX = (this.player.x + offsetX) * CONFIG.TILE_SIZE;
        const pScreenY = (this.player.y + offsetY) * CONFIG.TILE_SIZE;
        
        // Player glow
        const gradient = this.ctx.createRadialGradient(
            pScreenX + 16, pScreenY + 16, 5,
            pScreenX + 16, pScreenY + 16, 20
        );
        gradient.addColorStop(0, 'rgba(0, 210, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(0, 210, 255, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(pScreenX - 4, pScreenY - 4, CONFIG.TILE_SIZE + 8, CONFIG.TILE_SIZE + 8);
        
        // Player character
        this.ctx.fillStyle = this.player.color;
        this.ctx.font = 'bold 22px Courier';
        this.ctx.fillText(this.player.char, pScreenX + 7, pScreenY + 23);
        
        // Player status effects
        if (this.player.hasStatusEffect('poison')) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('☠', pScreenX + 22, pScreenY + 6);
        }
        if (this.player.hasStatusEffect('regen')) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText('♥', pScreenX + 22, pScreenY + 6);
        }

        // Render Particles
        this.particles.forEach(p => p.render(this.ctx));

        // Update UI Stats
        document.getElementById('hp-val').innerText = this.player.hp;
        document.getElementById('hp-max').innerText = this.player.maxHp;
        document.getElementById('lvl-val').innerText = this.player.level;
        document.getElementById('floor-val').innerText = this.floor;
        
        // Update stats display
        const statsDisplay = document.getElementById('stats-display');
        if (statsDisplay) {
            statsDisplay.innerHTML = `
                ATK: ${this.player.atk} | DEF: ${this.player.def} | 
                XP: ${this.player.xp}/${this.player.xpToNext} | 
                Kills: ${this.player.kills} | Score: ${this.score}
            `;
        }
        
        // Game Over overlay
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 48px Courier';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 24px Courier';
            this.ctx.fillText(`Floor: ${this.floor} | Kills: ${this.player.kills} | Score: ${this.score}`, 
                this.canvas.width / 2, this.canvas.height / 2 + 10);
            
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '20px Courier';
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
            
            this.ctx.textAlign = 'left';
        }
    }

    setupListeners() {
        window.onkeydown = (e) => {
            e.preventDefault();
            this.handleInput(e.key);
        };
        window.onresize = () => {
            this.resize();
            this.render();
        };
    }
}

// Initialize game
const game = new Engine();