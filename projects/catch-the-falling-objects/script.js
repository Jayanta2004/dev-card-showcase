const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const scoreDisplay = document.getElementById("score");

let score = 0;
let gameActive = false;
let objectInterval;
let playerX = 120;
let fallingObjects = [];

// Set initial player position
player.style.left = playerX + "px";

// Keyboard controls
document.addEventListener("keydown", movePlayer);

function movePlayer(e) {
  if (!gameActive) return;
  
  if (e.key === "ArrowLeft" && playerX > 0) {
    playerX -= 20;
  }
  if (e.key === "ArrowRight" && playerX < 240) { // 300px width - 60px player width
    playerX += 20;
  }
  player.style.left = playerX + "px";
}

function startGame() {
  if (gameActive) return;
  
  // Reset game state
  gameActive = true;
  score = 0;
  scoreDisplay.textContent = score;
  playerX = 120;
  player.style.left = playerX + "px";
  
  // Clear any existing falling objects
  document.querySelectorAll('.falling').forEach(obj => {
    obj.remove();
  });
  fallingObjects = [];
  
  // Stop any existing intervals
  clearInterval(objectInterval);
  
  // Start creating objects
  objectInterval = setInterval(createObject, 1000);
}

function createObject() {
  if (!gameActive) return;
  
  const falling = document.createElement("div");
  falling.classList.add("falling");
  
  // Add random object type for visual variety
  const types = ["danger", "bonus", "special"];
  const randomType = types[Math.floor(Math.random() * types.length)];
  falling.setAttribute("data-type", randomType);
  
  // Random horizontal position (0 to 275 to keep within bounds)
  const x = Math.floor(Math.random() * 275);
  falling.style.left = x + "px";
  falling.style.top = "0px";
  
  gameArea.appendChild(falling);
  
  // Store object data
  const objData = {
    element: falling,
    x: x,
    y: 0,
    interval: null,
    type: randomType
  };
  
  fallingObjects.push(objData);
  
  // Move object down
  objData.interval = setInterval(() => {
    if (!gameActive) {
      clearInterval(objData.interval);
      return;
    }
    
    objData.y += 4; // Movement speed
    falling.style.top = objData.y + "px";
    
    // Check if object reached bottom
    if (objData.y > 380) { // 400px height - 20px margin
      // Game over only for dangerous objects
      if (objData.type === "danger") {
        gameOver();
      }
      removeObject(objData);
    } else {
      // Collision detection
      const playerRect = {
        left: playerX,
        right: playerX + 60, // Player width
        top: 380, // Player is at bottom
        bottom: 400
      };
      
      const objectRect = {
        left: objData.x,
        right: objData.x + 30, // Object width
        top: objData.y,
        bottom: objData.y + 30 // Object height
      };
      
      // Check for collision
      if (
        objectRect.left < playerRect.right &&
        objectRect.right > playerRect.left &&
        objectRect.top < playerRect.bottom &&
        objectRect.bottom > playerRect.top
      ) {
        // Handle collision based on object type
        if (objData.type === "danger") {
          score += 5; // More points for catching danger objects
        } else if (objData.type === "bonus") {
          score += 10; // Bonus points
        } else if (objData.type === "special") {
          score += 15; // Special bonus
        }
        
        scoreDisplay.textContent = score;
        
        // Visual feedback
        falling.style.transform = "scale(1.3)";
        falling.style.opacity = "0.5";
        
        setTimeout(() => {
          removeObject(objData);
        }, 100);
      }
    }
  }, 20);
}

function removeObject(objData) {
  clearInterval(objData.interval);
  if (objData.element.parentNode) {
    objData.element.remove();
  }
  
  // Remove from array
  const index = fallingObjects.indexOf(objData);
  if (index > -1) {
    fallingObjects.splice(index, 1);
  }
}

function gameOver() {
  gameActive = false;
  clearInterval(objectInterval);
  
  // Clear all falling objects
  fallingObjects.forEach(obj => {
    clearInterval(obj.interval);
    obj.element.remove();
  });
  fallingObjects = [];
  
  // Show game over message
  setTimeout(() => {
    alert(`Game Over! Final Score: ${score}\nClick OK to restart.`);
    startGame(); // Auto-restart
  }, 100);
}

// Optional: Add touch/mouse controls for mobile
let touchStartX = 0;
let touchEndX = 0;

gameArea.addEventListener('touchstart', (e) => {
  if (!gameActive) return;
  touchStartX = e.touches[0].clientX;
}, false);

gameArea.addEventListener('touchmove', (e) => {
  if (!gameActive) return;
  e.preventDefault();
  touchEndX = e.touches[0].clientX;
  
  // Calculate movement
  const diff = touchStartX - touchEndX;
  
  if (diff > 5 && playerX > 0) { // Swipe left
    playerX = Math.max(0, playerX - 15);
  } else if (diff < -5 && playerX < 240) { // Swipe right
    playerX = Math.min(240, playerX + 15);
  }
  
  player.style.left = playerX + "px";
  touchStartX = touchEndX;
}, false);

// Mouse click controls
gameArea.addEventListener('mousedown', (e) => {
  if (!gameActive) return;
  const clickX = e.clientX - gameArea.getBoundingClientRect().left;
  
  // Move player towards click position
  if (clickX < playerX + 30) { // Click left of player center
    playerX = Math.max(0, playerX - 40);
  } else { // Click right of player center
    playerX = Math.min(240, playerX + 40);
  }
  
  player.style.left = playerX + "px";
});

// Prevent right-click menu
gameArea.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});