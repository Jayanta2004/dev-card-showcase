// js/logic/paradoxLogic.js
import { contentDB } from '../data/content.js';
import { paradoxRules } from '../data/paradoxes.js';

export class ParadoxResolver {
    constructor(stateManager) {
        this.state = stateManager;
    }

    // Evaluates if a choice causes a paradox with previous decisions
    evaluateChoice(nodeId, choiceId) {
        const choiceRef = `${nodeId}.${choiceId}`;
        const rules = paradoxRules[choiceRef];

        const paradoxes = [];

        if (!rules) return paradoxes; // No rules defined for this choice

        // Check each rule against current state
        for (const rule of rules) {
            // Rule structure: { type: 'contradiction', targetNode: 'node_1', targetChoice: 'choice_A', newPastContent: 'node_1_alt' }

            const pastChoice = this.state.getState().choices[rule.targetNode];

            if (pastChoice === rule.targetChoice) {
                // Paradox detected!
                paradoxes.push(rule);
            }

            // Or check against flags
            if (rule.type === 'flag_conflict') {
                const flagValue = this.state.getFlag(rule.targetFlag);
                if (flagValue === rule.flagState) {
                    paradoxes.push(rule);
                }
            }
        }

        return paradoxes;
    }

    // Returns formatted content for a node based on current state parameters
    resolveNodeContent(nodeId) {
        const baseContent = contentDB[nodeId];
        if (!baseContent) return null;

        // Deep clone to avoid mutating origin DB
        const resolved = JSON.parse(JSON.stringify(baseContent));

        // Check for state conditional text replacements
        if (resolved.conditionalText) {
            resolved.conditionalText.forEach(cond => {
                const flagVal = this.state.getFlag(cond.flag);
                if (flagVal === cond.expected) {
                    resolved.text = resolved.text.replace(cond.marker, cond.replacement);
                }
            });
        }

        // Filter choices based on prerequisites
        if (resolved.choices) {
            resolved.choices = resolved.choices.filter(choice => {
                if (!choice.requires) return true;

                // If it requires a choice, check it
                if (choice.requires.choiceId) {
                    const made = this.state.getState().choices[choice.requires.nodeId];
                    return made === choice.requires.choiceId;
                }

                // If it requires a flag, check it
                if (choice.requires.flag) {
                    return this.state.getFlag(choice.requires.flag) === choice.requires.expected;
                }

                return true;
            });
        }

        return resolved;
    }
}
