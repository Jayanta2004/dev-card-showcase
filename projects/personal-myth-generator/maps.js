// World map generation module
const mapSection = document.getElementById('map-section');
function generateMap() {
    mapSection.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '700');
    svg.setAttribute('height', '300');
    svg.style.background = '#c8e6c9';
    // Draw random continents
    for (let i = 0; i < 3; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = '';
        let cx = 120 + i * 220;
        let cy = 120 + Math.random() * 40;
        for (let j = 0; j < 8; j++) {
            let angle = (2 * Math.PI / 8) * j;
            let r = 60 + Math.random() * 40;
            let x = cx + Math.cos(angle) * r;
            let y = cy + Math.sin(angle) * r;
            d += j === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `;
        }
        d += 'Z';
        path.setAttribute('d', d);
        path.setAttribute('fill', `rgba(${100 + i*50},${200 - i*60},${120 + i*40},0.7)`);
        path.setAttribute('stroke', '#388e3c');
        path.setAttribute('stroke-width', '3');
        svg.appendChild(path);
    }
    mapSection.appendChild(svg);
}
