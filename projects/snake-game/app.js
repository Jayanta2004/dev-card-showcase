// script.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const restartButton = document.getElementById("restartButton"); // Botón de reinicio

const gridSize = 20; // Tamaño de la cuadrícula
let snake = [{ x: 200, y: 200 }]; // La serpiente empieza en el centro
let food = { x: 100, y: 100 }; // Posición inicial de la comida
let direction = { x: 0, y: 0 }; // Dirección inicial de la serpiente
let snakeLength = 1; // Longitud inicial de la serpiente
let score = 0; // Puntaje inicial
let gameOver = false;

function drawRect(x, y, color) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = color; // Efecto de brillo
    ctx.fillStyle = color;
    ctx.fillRect(x, y, gridSize, gridSize);
}

// Genera una nueva posición para la comida
function placeFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

// Detecta colisión con los bordes o con el cuerpo de la serpiente
function checkCollision() {
    const head = snake[0];
    
    // Colisión con los bordes
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }

    // Colisión con el propio cuerpo
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = "#ff0044";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff0044";
        ctx.font = "40px 'Courier New'";
        ctx.fillText("Game Over", canvas.width / 6, canvas.height / 2);
        
        // Muestra el botón de reinicio cuando termina el juego
        restartButton.style.display = "block";
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mueve la serpiente
    const head = { x: snake[0].x + direction.x * gridSize, y: snake[0].y + direction.y * gridSize };
    snake.unshift(head);

    // Verifica si la serpiente ha comido la comida
    if (head.x === food.x && head.y === food.y) {
        snakeLength++;
        score++; // Aumenta el puntaje
        scoreDisplay.textContent = "Score: " + score; // Actualiza el puntaje en pantalla
        placeFood();
    }

    // Mantiene el tamaño de la serpiente
    if (snake.length > snakeLength) {
        snake.pop();
    }

    // Dibuja la comida con color neón
    drawRect(food.x, food.y, "#ff00ff");

    // Dibuja la serpiente con color neón
    snake.forEach((segment) => drawRect(segment.x, segment.y, "#00ffcc"));

    // Verifica si ha colisionado
    if (checkCollision()) {
        gameOver = true;
    }
}

// Captura el input del teclado para controlar la dirección
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && direction.y === 0) {
        direction = { x: 0, y: -1 };
    } else if (event.key === "ArrowDown" && direction.y === 0) {
        direction = { x: 0, y: 1 };
    } else if (event.key === "ArrowLeft" && direction.x === 0) {
        direction = { x: -1, y: 0 };
    } else if (event.key === "ArrowRight" && direction.x === 0) {
        direction = { x: 1, y: 0 };
    }
});

// Reinicia el juego
function restartGame() {
    snake = [{ x: 200, y: 200 }];
    direction = { x: 0, y: 0 };
    snakeLength = 1;
    score = 0;
    scoreDisplay.textContent = "Score: 0";
    gameOver = false;
    restartButton.style.display = "none"; // Oculta el botón de reinicio
    placeFood(); // Recoloca la comida
}

placeFood();
setInterval(gameLoop, 100); // Ejecuta el juego cada 100ms
