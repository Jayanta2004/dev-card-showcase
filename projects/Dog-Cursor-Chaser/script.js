const dog = document.getElementById('dog');
let mouseX = 0;
let mouseY = 0;
let dogX = 0;
let dogY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function chaseCursor() {
    // Calculate the difference
    let dx = mouseX - dogX;
    let dy = mouseY - dogY;

    // Move the dog towards the cursor with some delay
    dogX += dx * 0.05; // Adjust the 0.05 for speed (lower = slower)
    dogY += dy * 0.05;

    // Update dog position
    dog.style.left = dogX - 25 + 'px'; // Center the dog on cursor
    dog.style.top = dogY - 25 + 'px';

    requestAnimationFrame(chaseCursor);
}

// Start the chasing animation
chaseCursor();