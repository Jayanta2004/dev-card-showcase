// js/ui/renderer.js
import { DOMMutator } from '../engine/domMutator.js';
import { ScrollObserver } from './scrollObserver.js';

export class Renderer {
    constructor(container) {
        this.container = container;
        this.mutator = new DOMMutator(container);
        this.observer = new ScrollObserver('.timeline-node');
        this.onChoiceMade = null; // Callback assigned externally
    }

    clear() {
        this.container.innerHTML = '';
    }

    renderNode(nodeId, data, priorChoiceId) {
        // Build the HTML for the semantic node
        let html = `
            <div class="text-date">RECORD: ${new Date().toLocaleTimeString()}</div>
            <h2>${data.title}</h2>
            <p>${data.text}</p>
        `;

        if (data.choices && data.choices.length > 0) {
            html += `<div class="node-actions choice-container">`;
            data.choices.forEach(choice => {
                let btnClass = priorChoiceId
                    ? (priorChoiceId === choice.id ? 'btn-resolve' : 'btn-disabled')
                    : (choice.paradoxical ? 'btn-contradict' : 'btn-resolve');

                let tooltip = choice.paradoxical ? `<div class="timeline-tooltip">Warning: Contradicts previous choice</div>` : '';

                html += `
                    <button class="paradox-btn ${btnClass} clickable" 
                            data-node="${nodeId}" 
                            data-choice="${choice.id}"
                            data-target="${choice.next}"
                            ${priorChoiceId ? 'disabled' : ''}>
                        ${choice.label}
                        ${tooltip}
                    </button>
                `;
            });
            html += `</div>`;
        } else if (!priorChoiceId) {
            // End of timeline, allow reset
            html += `
                <div class="node-actions choice-container">
                    <button class="paradox-btn btn-contradict clickable" id="btn-reset-timeline">SHATTER TIMELINE (RESET)</button>
                </div>
            `;
        }

        const nodeElement = this.mutator.prependNode(html, nodeId);

        // Add event listeners for new buttons
        const buttons = nodeElement.querySelectorAll('.paradox-btn:not(:disabled):not(#btn-reset-timeline)');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const b = e.currentTarget;
                if (this.onChoiceMade) {
                    this.onChoiceMade(
                        b.getAttribute('data-node'),
                        b.getAttribute('data-choice'),
                        b.getAttribute('data-target')
                    );
                }
            });
        });

        const resetBtn = nodeElement.querySelector('#btn-reset-timeline');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                localStorage.clear();
                window.location.reload();
            });
        }

        // Trigger reveal animation instantly for the newest node
        setTimeout(() => {
            nodeElement.classList.add('visible');
        }, 50);

        // Smooth scroll to push new content into view
        const containerScroll = this.container.parentElement;
        containerScroll.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    initObserver() {
        this.observer.init();
    }
}
