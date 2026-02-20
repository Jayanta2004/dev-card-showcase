const snowContainer = document.getElementById('snowContainer');
const toggleButton = document.getElementById('toggleSnow');
let snowing = true;
let snowflakes = [];

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = '❄';
    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2-5 seconds
    snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px'; // 10-20px
    snowContainer.appendChild(snowflake);
    snowflakes.push(snowflake);

    // Remove snowflake after animation
    setTimeout(() => {
        snowflake.remove();
        snowflakes = snowflakes.filter(s => s !== snowflake);
    }, 5000);
}

function startSnowfall() {
    if (snowing) {
        createSnowflake();
        setTimeout(startSnowfall, Math.random() * 200 + 100); // 100-300ms between snowflakes
    }
}

toggleButton.addEventListener('click', () => {
    snowing = !snowing;
    toggleButton.textContent = snowing ? 'Stop Snow' : 'Start Snow';
    if (snowing) {
        startSnowfall();
    }
});

// Start snowfall initially
startSnowfall();