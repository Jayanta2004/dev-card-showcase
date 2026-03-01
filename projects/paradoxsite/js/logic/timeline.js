// js/logic/timeline.js
import { ParadoxResolver } from './paradoxLogic.js';

export class TimelineLogic {
    constructor(stateManager, renderer, glitchEffects) {
        this.state = stateManager;
        this.renderer = renderer;
        this.glitch = glitchEffects;
        this.resolver = new ParadoxResolver(stateManager);

        this.bindEvents();
    }

    bindEvents() {
        this.renderer.onChoiceMade = (nodeId, choiceId, targetNode) => {
            this.handleUserChoice(nodeId, choiceId, targetNode);
        };
    }

    renderCurrentState() {
        const timeline = this.state.getState().timeline;

        // Clear DOM
        this.renderer.clear();

        // Rebuild timeline in order
        for (const nodeId of timeline) {
            const data = this.resolver.resolveNodeContent(nodeId);
            if (data) {
                // Check if a choice was made for this node
                const choice = this.state.getState().choices[nodeId];
                this.renderer.renderNode(nodeId, data, choice);
            }
        }

        // Attach observer to new elements
        this.renderer.initObserver();
    }

    async handleUserChoice(nodeId, choiceId, targetNode) {
        // 1. Check for Paradox
        const paradoxes = this.resolver.evaluateChoice(nodeId, choiceId);

        if (paradoxes.length > 0) {
            // Initiate paradox sequence
            this.glitch.triggerGlobalGlitch(1000);

            for (const paradox of paradoxes) {
                // 2. Rewrite the past BEFORE proceeding
                await this.executeParadoxRewrite(paradox);
            }

            // Clean up state (remove nodes after the paradox target if necessary)
            // Or just update history.
            this.state.triggerParadox(nodeId);
        }

        // 3. Get choice effects
        const content = this.resolver.resolveNodeContent(nodeId);
        const choiceData = content.choices.find(c => c.id === choiceId);

        // 4. Update state
        this.state.makeChoice(nodeId, choiceId, choiceData.effects);

        // 5. Render new node
        if (targetNode) {
            // Delay to allow scrolling/glitch effects to settle
            setTimeout(() => {
                this.advanceToNode(targetNode);
            }, 600);
        }
    }

    async executeParadoxRewrite(paradox) {
        console.warn("Paradox detected: Rewriting node", paradox.targetNode);

        // Update state to reflection new past
        if (paradox.overrideChoice) {
            this.state.getState().choices[paradox.targetNode] = paradox.overrideChoice;
            this.state.saveState();
        }

        // Get the altered content
        const newPastData = this.resolver.resolveNodeContent(paradox.newPastContent || paradox.targetNode);

        // Visually rewrite the past node in DOM
        // Generate the HTML for it
        let textHTML = `
            <div class="text-date">TIMELINE ALTERED: ${new Date(Date.now() - 3600000).toLocaleTimeString()}</div>
            <h2 class="paradox-altered">${newPastData.title} <span class="badge">[REVISED]</span></h2>
            <p>${newPastData.text}</p>
        `;

        // Re-render choices as disabled or whatever state they are in
        const choiceObj = this.state.getState().choices[paradox.targetNode];

        textHTML += `<div class="node-actions choice-container">`;
        if (newPastData.choices) {
            for (const c of newPastData.choices) {
                const disabled = c.id !== paradox.overrideChoice ? 'btn-disabled' : 'btn-resolve';
                textHTML += `<button class="paradox-btn ${disabled}">${c.label}</button>`;
            }
        }
        textHTML += `</div>`;

        await this.renderer.mutator.rewritePastNode(paradox.targetNode, textHTML);
    }

    advanceToNode(nextNodeId) {
        // Build data
        const data = this.resolver.resolveNodeContent(nextNodeId);
        if (!data) {
            console.error("Next node not found:", nextNodeId);
            return;
        }

        // Push to timeline state
        if (!this.state.getState().timeline.includes(nextNodeId)) {
            this.state.getState().timeline.push(nextNodeId);
            this.state.saveState();
        }

        // Render it
        this.renderer.renderNode(nextNodeId, data, null);
    }
}
