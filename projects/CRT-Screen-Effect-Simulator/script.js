const crtScreen = document.querySelector('.crt-screen');
const toggleBtn = document.getElementById('toggleEffect');
const changeContentBtn = document.getElementById('changeContent');
const demoText = document.querySelector('.demo-text');

let effectEnabled = true;
const contentVariations = [
    `
        <p>Retro gaming was awesome!</p>
        <p>Pixels and scanlines everywhere...</p>
        <p>Can you feel the nostalgia?</p>
    `,
    `
        <p>Welcome to the 80s!</p>
        <p>CRT monitors ruled the world.</p>
        <p>Remember floppy disks?</p>
    `,
    `
        <p>Old school computing</p>
        <p>Green text on black screens</p>
        <p>The future is now retro!</p>
    `,
    `
        <p>Arcade games galore</p>
        <p>Quarter munchers</p>
        <p>High score chasers</p>
    `
];

let currentContentIndex = 0;

function toggleEffect() {
    effectEnabled = !effectEnabled;
    if (effectEnabled) {
        crtScreen.classList.remove('no-effect');
        crtScreen.classList.add('crt-effect');
        toggleBtn.textContent = 'Disable CRT Effect';
    } else {
        crtScreen.classList.remove('crt-effect');
        crtScreen.classList.add('no-effect');
        toggleBtn.textContent = 'Enable CRT Effect';
    }
}

function changeContent() {
    currentContentIndex = (currentContentIndex + 1) % contentVariations.length;
    demoText.innerHTML = contentVariations[currentContentIndex];
}

// Initialize
crtScreen.classList.add('crt-effect');
toggleBtn.textContent = 'Disable CRT Effect';

// Event listeners
toggleBtn.addEventListener('click', toggleEffect);
changeContentBtn.addEventListener('click', changeContent);