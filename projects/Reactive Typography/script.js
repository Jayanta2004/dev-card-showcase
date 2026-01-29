/**
 * Kinetic Typography Simulation
 * Uses HTML5 Canvas to read pixel data from text and create interactive particles.
 */

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const textInput = document.getElementById('textInput');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Configuration
let particleArray = [];
let adjustX = 0;
let adjustY = 0;

// Mouse State
const mouse = {
    x: null,
    y: null,
    radius: 100 // Interaction radius
}

window.addEventListener('mousemove', function(e){
    mouse.x = e.x;
    mouse.y = e.y;
});

// Particle Class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 2;
        this.baseX = x; // Original position (Target)
        this.baseY = y;
        this.density = (Math.random() * 30) + 1; // Controls reaction speed
        this.color = 'white';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        // Physics Logic
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        
        let maxDistance = mouse.radius;
        // Force increases as mouse gets closer (0 to 1)
        let force = (maxDistance - distance) / maxDistance;
        
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
            // Repulsion: Move away from mouse
            this.x -= directionX;
            this.y -= directionY;
            this.color = `hsl(${Math.random() * 360}, 50%, 50%)`; // Random color on interaction
        } else {
            // Return: Move back to original base position
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 10; // Easing factor
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 10;
            }
            // Reset color slowly
            if(distance > mouse.radius + 50) this.color = 'white';
        }
    }
}

/**
 * Text Initialization
 * 1. Draw text on canvas.
 * 2. Scan pixel data.
 * 3. Create particles where pixels are non-transparent.
 */
function init(text) {
    particleArray = [];
    ctx.fillStyle = 'white';
    
    // Dynamic Font Sizing
    let fontSize = Math.min(150, window.innerWidth / 5);
    ctx.font = `900 ${fontSize}px Montserrat`;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text (invisible to user, just for data)
    ctx.fillText(text, canvas.width/2, canvas.height/2);
    
    // Get Pixel Data area (scan only the center to save performance)
    // We scan the whole canvas to be safe, but could optimize bounding box
    const textCoordinates = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Clear the standard text immediately
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Scan Resolution (skip pixels for performance/aesthetic)
    const step = 4; 

    for (let y = 0, y2 = textCoordinates.height; y < y2; y += step) {
        for (let x = 0, x2 = textCoordinates.width; x < x2; x += step) {
            // Check alpha value (4th byte in RGBA)
            // 128 is a threshold (roughly 50% opacity)
            if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
                let positionX = x;
                let positionY = y;
                particleArray.push(new Particle(positionX * 1, positionY * 1));
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].draw();
        particleArray[i].update();
    }
    
    connect(); // Optional: Draw lines between close particles
    requestAnimationFrame(animate);
}

// Optional: Connect particles with lines for a web/mesh effect
function connect(){
    let opacityValue = 1;
    for (let a = 0; a < particleArray.length; a++) {
        for (let b = a; b < particleArray.length; b++) {
            // Optimization: Only check particles within a small range
            // This is O(N^2), so we must be careful with particle count
            // We skip this check mostly or keep distance small
            /* Uncommenting full N^2 check is heavy. 
               Only checking standard neighbors is complex in this array structure.
               For this demo, we'll skip connecting lines to ensure 60FPS on all devices.
            */
        }
    }
}

// Event Listeners
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init(textInput.value);
});

// Debounce input to prevent lagging while typing
let timeout;
textInput.addEventListener('keyup', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        init(e.target.value);
    }, 500);
});

// Start
init('KINETIC');
animate();