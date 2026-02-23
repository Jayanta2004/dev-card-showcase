// js/data/paradoxes.js
// This file defines the logical rules for when a choice contradicts a past state.

export const paradoxRules = {
    // Format: 'node_id.choice_id': [ { rule definition } ]

    // If they touch the shard in node_smash_screen after choosing to blackout in node_deny earlier.
    'node_smash_screen.c1': [
        {
            type: 'contradiction',
            targetNode: 'node_deny',          // The node that gets rewritten
            targetChoice: 'c1',               // The choice that conflicts with the current action
            newPastContent: 'node_deny_alt',  // The alternative content to replace the target node
            overrideChoice: 'c2'              // Force the past to register as if they chose this instead
        }
    ],

    // If they argue with themselves in node_warn_them but they previously accepted responsibility
    'node_warn_them.c1': [
        {
            type: 'contradiction',
            targetNode: 'node_terminal',
            targetChoice: 'c2',
            newPastContent: 'node_terminal_alt',
            overrideChoice: 'c1'
        }
    ],

    // If they try to pull their finger back from the shard but the window was opened
    'node_touch_shard.c1': [
        {
            type: 'contradiction',
            targetNode: 'node_window',
            targetChoice: 'c1',
            newPastContent: 'node_open_window_alt',
            overrideChoice: 'c2'
        }
    ],

    // Example of a flag based conflict: If they resist the shift, but they had the 'isAwake: false' flag
    'node_resist.c1': [
        {
            type: 'flag_conflict',
            targetFlag: 'isAwake',
            flagState: false,
            targetNode: 'start_node', // Rewrites the very beginning
            newPastContent: 'start_node', // Could point to an alt start node
            overrideChoice: 'c1'
        }
    ],

    // Warning them creates a huge rift if they didn't deny
    'node_arrival.c1': [
        {
            type: 'contradiction',
            targetNode: 'node_terminal',
            targetChoice: 'c2',
            newPastContent: 'node_terminal_alt',
            overrideChoice: 'c1'
        }
    ]
};

// Ensure that every key matches the format exact nodeID.choiceID
// And maps to an array of objects specifying how reality breaks.
