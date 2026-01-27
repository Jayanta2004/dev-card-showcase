/**
 * Effects Module
 * Handles Holographic Tile, Data Overlays, and Theme Logic
 */

let isDataMode = false;

export function initEffects() {
    setupHolographicCards();
    setupDataToggle();
}

function setupHolographicCards() {
    const cards = document.querySelectorAll('.experiment-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse x within element
            const y = e.clientY - rect.top;  // Mouse y within element

            // Calculate center
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (max +/- 10deg)
            const rotateX = ((y - centerY) / centerY) * -5; // Invert Y for correct tilt feel
            const rotateY = ((x - centerX) / centerX) * 5;

            // Apply transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            // Update Shine Gradient
            // card.style.background = `linear-gradient(${135 + rotateY}deg, rgba(255,255,255,0.1), rgba(20, 22, 33, 0.6))`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

function setupDataToggle() {
    // Add Toggle Button to Header dynamically
    const header = document.querySelector('.control-panel > .control-group:last-child > .button-row');
    if (!header) return;

    const btn = document.createElement('button');
    btn.textContent = 'Data: OFF';
    btn.id = 'btn-data-mode';
    btn.addEventListener('click', toggleDataMode);

    // Insert before range slider or append
    document.querySelector('.control-panel').appendChild(createDataGroup(btn));
}

function createDataGroup(btn) {
    const group = document.createElement('div');
    group.className = 'control-group';
    const label = document.createElement('label');
    label.textContent = 'Overlay';
    const row = document.createElement('div');
    row.className = 'button-row';

    row.appendChild(btn);
    group.appendChild(label);
    group.appendChild(row);
    return group;
}

function toggleDataMode() {
    isDataMode = !isDataMode;
    const btn = document.getElementById('btn-data-mode');

    if (isDataMode) {
        btn.textContent = 'Data: ON';
        btn.classList.add('active', 'neon-green'); // Use green to signify "Matrix" feel
        document.body.classList.add('data-mode-active');
    } else {
        btn.textContent = 'Data: OFF';
        btn.classList.remove('active', 'neon-green');
        document.body.classList.remove('data-mode-active');
    }
}
