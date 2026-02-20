const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const cols = Math.floor(width / 20) + 1;
const ypos = Array(cols).fill(0);

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

function matrix() {
    // Fade out slightly to create trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#0f0';
    ctx.font = '15pt monospace';

    ypos.forEach((y, index) => {
        // Random character
        const text = String.fromCharCode(Math.random() * 128);
        const x = index * 20;
        
        ctx.fillText(text, x, y);

        // Randomly reset scanline to top if it's past 100px
        if (y > 100 + Math.random() * 10000) {
            ypos[index] = 0;
        } else {
            ypos[index] = y + 20;
        }
    });
}

// Run loop
setInterval(matrix, 50);
