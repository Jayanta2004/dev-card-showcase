// js/engine/domMutator.js
export class DOMMutator {
    constructor(containerElement) {
        this.container = containerElement;
    }

    // Safely injects new timeline nodes into the DOM backwards
    prependNode(nodeContent, nodeId) {
        const wrapper = document.createElement('div');
        wrapper.className = 'timeline-node anim-fade-in';
        wrapper.id = `node-${nodeId}`;
        wrapper.innerHTML = nodeContent;

        // Prepend because we are reverse scrolling
        this.container.prepend(wrapper);

        // Add a spacer for visual pacing
        const spacer = document.createElement('div');
        spacer.className = 'scroll-spacer';
        this.container.prepend(spacer);

        return wrapper;
    }

    // Applies a rewrite animation and updates content of a past node
    async rewritePastNode(nodeId, newContent) {
        const nodeElem = document.getElementById(`node-${nodeId}`);
        if (!nodeElem) {
            console.warn(`Node ${nodeId} not found in DOM for rewriting.`);
            return false;
        }

        // Apply rewriting transition effects
        nodeElem.classList.add('node-rewrite-anim', 'rewriting');
        nodeElem.setAttribute('data-text', nodeElem.innerText);

        // Wait for mid-point of animation to swap content
        await new Promise(resolve => setTimeout(resolve, 750));

        nodeElem.classList.remove('rewriting');
        // Actual content swap
        nodeElem.innerHTML = newContent;

        // Flash effect
        nodeElem.style.backgroundColor = 'var(--button-hover)';
        setTimeout(() => {
            nodeElem.style.transition = 'background-color var(--transition-slow)';
            nodeElem.style.backgroundColor = 'transparent';
        }, 100);

        // Remove animation class after completion
        setTimeout(() => {
            nodeElem.classList.remove('node-rewrite-anim');
        }, 1500);

        return true;
    }

    removeFutureNodes(nodeId) {
        // Collect all nodes that come "after" chronologically
        // In DOM, since we prepend, chronological "future" is lower in DOM or higher in DOM depending on implementation.
        // It's safer to query all timeline nodes and check their state index.
        const allNodes = Array.from(this.container.querySelectorAll('.timeline-node'));

        let foundNode = false;
        // In reverse scroll flow, the "newest" node is at the TOP of the container. 
        // The "oldest" node is at the BOTTOM.
        for (let i = 0; i < allNodes.length; i++) {
            const current = allNodes[i];

            if (current.id === `node-${nodeId}`) {
                foundNode = true;
                continue; // Keep this one
            }

            // If we found the target node, nodes ABOVE it are future nodes
            if (foundNode) {
                // Remove the node
                current.style.opacity = '0';
                setTimeout(() => {
                    const nextNode = current.nextElementSibling;
                    if (nextNode && nextNode.classList.contains('scroll-spacer')) {
                        nextNode.remove();
                    }
                    current.remove();
                }, 500);
            }
        }
    }

    // Useful for glitching text temporarily
    scrambleText(element, finalString, duration = 1000) {
        const chars = '!<>-_\\/[]{}—=+*^?#_';
        let iterations = 0;
        const totalIterations = duration / 30;

        const originalText = element.innerText;

        const interval = setInterval(() => {
            element.innerText = finalString.split('').map((char, index) => {
                if (index < (iterations / totalIterations) * finalString.length) {
                    return finalString[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');

            iterations++;
            if (iterations >= totalIterations) {
                clearInterval(interval);
                element.innerText = finalString;
            }
        }, 30);
    }
}
