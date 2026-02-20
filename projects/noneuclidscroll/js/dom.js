/**
 * NonEuclidScroll | DOM Manager
 * Handles the visual mounting/unmounting of sections.
 */

class DOMManager {
    constructor() {
        this.track = document.getElementById('corridor-track');
        this.sections = new Map(); // nodeId -> Element
    }

    /**
     * Renders a node into the corridor.
     */
    createSection(nodeData, position = 'center') {
        const section = document.createElement('div');
        section.className = `corridor-section section-${position}`;

        section.innerHTML = `
            <div class="corridor-walls"></div>
            <div class="corridor-content">
                <h2 class="room-title">${nodeData.title}</h2>
                <p class="room-desc">${nodeData.desc}</p>
                <div class="room-id">LOCATION HEX: ${Math.random().toString(16).substr(2, 6).toUpperCase()}</div>
            </div>
        `;

        this.track.appendChild(section);
        return section;
    }

    /**
     * Perfom a seamless swap of sections.
     */
    async transition(newNodeData, direction) {
        const currentSection = this.track.querySelector('.section-center');

        // 1. Create the new section in the distance
        const nextPos = direction === 'down' ? 'ahead' : 'behind';
        const exitPos = direction === 'down' ? 'behind' : 'ahead';

        const nextSection = this.createSection(newNodeData, nextPos);

        // Force reflow
        nextSection.offsetHeight;

        // 2. Animate!
        if (currentSection) {
            currentSection.classList.remove('section-center');
            currentSection.classList.add(`section-${exitPos}`);
        }

        nextSection.classList.remove(`section-${nextPos}`);
        nextSection.classList.add('section-center');

        // 3. Cleanup old section
        setTimeout(() => {
            if (currentSection && currentSection.parentNode) {
                this.track.removeChild(currentSection);
            }
        }, 1000);

        // Update HUD
        document.getElementById('location-anchor').innerText = newNodeData.title.toUpperCase();

        // Debug
        document.getElementById('debug-current-node').innerText = State.currentNodeId;
        document.getElementById('debug-history').innerText = State.history.join(' → ');
    }

    /**
     * Initialize the first view.
     */
    init(nodeData) {
        this.createSection(nodeData, 'center');
        document.getElementById('location-anchor').innerText = nodeData.title.toUpperCase();
    }
}

const DOM = new DOMManager();
