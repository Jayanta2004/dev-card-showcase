// js/data/content.js
// This file contains the entire narrative structure of the ParadoxSite experience.
// It is heavily nested and branching to provide a unique playthrough every time.

export const contentDB = {
    start_node: {
        title: "INITIALIZATION",
        text: "The terminal flickers. A single message remains burned into the phosphor: 'You are late.' You do not remember arriving here. You only remember what you must do tomorrow.",
        conditionalText: [
            { flag: "isAwake", expected: false, marker: "You are late.", replacement: "You are dreaming." }
        ],
        choices: [
            { id: "c1", label: "Read the terminal", next: "node_terminal" },
            { id: "c2", label: "Look out the window", next: "node_window" },
            { id: "c3", label: "Go back to sleep", next: "node_sleep", paradoxical: false }
        ]
    },

    node_terminal: {
        title: "THE TERMINAL",
        text: "Green text flows upwards, defying gravity. It lists coordinates, names, and a date. The date is yesterday. It says you authorized a chronal shift.",
        choices: [
            { id: "c1", label: "Deny authorization", next: "node_deny", effects: { integrity: -10 } },
            { id: "c2", label: "Accept responsibility", next: "node_accept", effects: { integrity: 10 } }
        ]
    },

    node_window: {
        title: "OUTSIDE",
        text: "The city below is frozen. Raindrops hang in the air like glass beads. A bird is suspended mid-flight. Time has stopped here.",
        choices: [
            { id: "c1", label: "Try to open the window", next: "node_open_window" },
            { id: "c2", label: "Turn away from the impossibility", next: "node_turn_away" }
        ]
    },

    node_sleep: {
        title: "DORMANT",
        text: "You close your eyes. The world fades. But the darkness is not empty. Whispers echo in the void, speaking of timelines unraveling.",
        choices: [
            { id: "c1", label: "Wake up", next: "start_node", effects: { setFlags: { isAwake: false } } }
        ]
    },

    node_deny: {
        title: "DENIAL",
        text: "You type 'NO' into the terminal. The screen flashes red. 'ERROR: TIMELINE LOCKED. YOUR SIGNATURE IS MANDATORY.' The system begins a sequence you cannot stop.",
        choices: [
            { id: "c1", label: "Pull the plug", next: "node_blackout" },
            { id: "c2", label: "Watch it execute", next: "node_execution" }
        ]
    },

    node_accept: {
        title: "ACCEPTANCE",
        text: "You type 'YES'. The terminal hums with sudden life. 'CHRONAL SHIFT CONFIRMED. COMMENCING REVERSAL.' Reality shudders around you.",
        choices: [
            { id: "c1", label: "Brace for impact", next: "node_shift" },
            { id: "c2", label: "Let go", next: "node_void" }
        ]
    },

    node_open_window: {
        title: "THE GLASS",
        text: "You force the window open. The moment the seal breaks, time rushes in like a physical force. The raindrops plummet. The bird screeches and flies away. The noise is deafening.",
        choices: [
            { id: "c1", label: "Listen to the noise", next: "node_noise" },
            { id: "c2", label: "Shut it again quickly", next: "node_silence" }
        ]
    },

    node_turn_away: {
        title: "IGNORANCE",
        text: "You walk away from the window. Sometimes it is better not to look at broken things. The terminal is still waiting behind you.",
        choices: [
            { id: "c1", label: "Approach the terminal", next: "node_terminal" }
        ]
    },

    node_blackout: {
        title: "BLACKOUT",
        text: "You yank the power cord from the wall. Sparks fly. The room goes entirely dark. But the terminal screen remains lit. It is running on something else.",
        choices: [
            { id: "c1", label: "Smash the screen", next: "node_smash_screen" },
            { id: "c2", label: "Wait in the dark", next: "node_wait_dark" }
        ]
    },

    node_execution: {
        title: "EXECUTION",
        text: "Lines of code scroll too fast to read. A progress bar appears: 'UNDOING 24 HOURS...' The objects in your room begin to move backward.",
        choices: [
            { id: "c1", label: "Try to grab something", next: "node_grab" },
            { id: "c2", label: "Stand still", next: "node_stand_still" }
        ]
    },

    node_shift: {
        title: "THE SHIFT",
        text: "The room stretches. Colors invert. You feel yourself being pulled backwards, not through physical space, but through memories.",
        choices: [
            { id: "c1", label: "Resist the pull", next: "node_resist" },
            { id: "c2", label: "Flow with it", next: "node_flow" }
        ]
    },

    node_void: {
        title: "THE VOID",
        text: "You surrender. There is a moment of absolute nothingness. No sound, no light, no sensation. Just the pure awareness of existing outside of time.",
        choices: [
            { id: "c1", label: "Form a thought", next: "node_thought" },
            { id: "c2", label: "Remain empty", next: "node_empty" }
        ]
    },

    node_noise: {
        title: "CACOPHONY",
        text: "The sounds of the city are overwhelming. Horns, voices, sirens. It's as if 24 hours of noise are playing all at once.",
        choices: [
            { id: "c1", label: "Cover your ears", next: "node_cover_ears" },
            { id: "c2", label: "Listen closer", next: "node_listen_closer" }
        ]
    },

    node_silence: {
        title: "SILENCE RESTORED",
        text: "You slam the window shut. Silence falls instantly, unnervingly fast. It's quieter than before. You can hear your own heartbeat, terribly loud.",
        choices: [
            { id: "c1", label: "Focus on the heartbeat", next: "node_heartbeat" },
            { id: "c2", label: "Find the source of the silence", next: "node_source" }
        ]
    },

    // Deep Narrative Nodes (To fulfill length constraints)
    node_smash_screen: {
        title: "SHATTERED",
        text: "You pick up a heavy chair and smash it into the terminal. The glass shatters into a million pieces. The pieces hang in the air, slowly drifting upwards instead of falling.",
        choices: [
            { id: "c1", label: "Touch a floating shard", next: "node_touch_shard", paradoxical: true }, // Potential paradox trigger
            { id: "c2", label: "Back away slowly", next: "node_back_away" }
        ]
    },

    node_wait_dark: {
        title: "IN THE SHADOWS",
        text: "You sit on the floor in the dark. The glowing text from the terminal casts long, strange shadows. The text now reads: 'WAITING IS NOT AN OPTION.'",
        choices: [
            { id: "c1", label: "It has to be an option", next: "node_stubborn" },
            { id: "c2", label: "Stand up", next: "node_stand_up" }
        ]
    },

    node_grab: {
        title: "FUTILE GRASP",
        text: "You reach for a coffee cup that is flying back up to the table. Your hand passes right through it. You are out of phase with the local matter.",
        choices: [
            { id: "c1", label: "Examine your hand", next: "node_examine_hand" },
            { id: "c2", label: "Look for something solid", next: "node_find_solid" }
        ]
    },

    node_stand_still: {
        title: "OBSERVER STATUE",
        text: "You don't move. The room reconstructs itself around you. Broken things become whole. Spilled things leap back into their containers. You are the only fixed point.",
        choices: [
            { id: "c1", label: "Embrace the stillness", next: "node_embrace" },
            { id: "c2", label: "It's too unnatural", next: "node_unnatural" }
        ]
    },

    node_resist: {
        title: "FRICTION",
        text: "You fight the pull. It mentally hurts. The air smells like ozone. Something tears. 'WARNING: TIMELINE FRACTURE IMMINENT.'",
        choices: [
            { id: "c1", label: "Keep fighting it", next: "node_fracture_reality", paradoxical: true },
            { id: "c2", label: "Stop resisting", next: "node_flow" }
        ]
    },

    node_flow: {
        title: "THE RIVER OF TIME",
        text: "You let the current take you. Memories whip past you like stars in warp drive. You see yourself making coffee, you see yourself sleeping, you see yourself arriving.",
        choices: [
            { id: "c1", label: "Try to pause at arrival", next: "node_arrival" },
            { id: "c2", label: "Go further back", next: "node_further_back" }
        ]
    },

    node_thought: {
        title: "THE FIRST SPARK",
        text: "You think: 'Where am I?' The void shudders. The thought echoes, creating ripples in the nothingness. Reality begins to crystallize around the concept of 'where'.",
        choices: [
            { id: "c1", label: "Think 'When'", next: "node_when" },
            { id: "c2", label: "Think 'Who'", next: "node_who" }
        ]
    },

    node_empty: {
        title: "SUSTAINED VOID",
        text: "The emptiness stretches. It's peaceful. But it cannot hold you forever. The universe abhors a vacuum, especially a temporal one. It starts to fill the space with random data.",
        choices: [
            { id: "c1", label: "Observe the data", next: "node_observe_data" },
            { id: "c2", label: "Filter it out", next: "node_filter_data" }
        ]
    },

    node_cover_ears: {
        title: "MUFFLED",
        text: "Covering your ears doesn't help. The noise is inside your head now. It's the sound of every potential timeline happening at once.",
        choices: [
            { id: "c1", label: "Scream to drown it out", next: "node_scream" },
            { id: "c2", label: "Focus on one single voice", next: "node_single_voice" }
        ]
    },

    node_listen_closer: {
        title: "DISSONANCE",
        text: "You strain to hear an individual sound. You isolate a siren. But it's playing backwards. 'Hee-haw, Hee-haw' becomes an agonizing wail of Doppler distortion.",
        choices: [
            { id: "c1", label: "Try another sound", next: "node_another_sound" },
            { id: "c2", label: "Stop listening", next: "node_stop_listening" }
        ]
    },

    node_heartbeat: {
        title: "METRONOME",
        text: "Your heart beats. Ba-dum. Ba-dum. But something is wrong. The rhythm is off. It's beating in prime numbers. 2, 3, 5, 7, 11...",
        choices: [
            { id: "c1", label: "Count along", next: "node_count_prime" },
            { id: "c2", label: "Try to calm it down", next: "node_calm_heart" }
        ]
    },

    node_source: {
        title: "ORIGIN OF QUIET",
        text: "You wander the room trying to find where the silence originates. It seems to come from the phone on the desk. A phone that wasn't there five minutes ago.",
        choices: [
            { id: "c1", label: "Pick it up", next: "node_pick_phone" },
            { id: "c2", label: "Leave it alone", next: "node_ignore_phone" }
        ]
    },

    node_touch_shard: {
        title: "BLEEDING LIGHT",
        text: "You touch the floating glass. It doesn't cut you. Instead, your finger sinks into it. The glass is a pocket dimension containing a few seconds of yesterday.",
        choices: [
            { id: "c1", label: "Pull your finger back", next: "node_pull_finger" },
            { id: "c2", label: "Push your whole hand in", next: "node_push_hand" }
        ]
    },

    node_back_away: {
        title: "RETREAT",
        text: "You step back. The shards begin to orbit each other like a tiny, aggressive solar system of glass.",
        choices: [
            { id: "c1", label: "Watch the orbit", next: "node_watch_orbit" }
        ]
    },

    node_fracture_reality: {
        title: "FRACTURE",
        text: "You push back against the current until something snaps. A white crack appears in the air. The timeline has split. You are now responsible for two realities.",
        choices: [
            { id: "c1", label: "Look into reality A", next: "node_reality_a" },
            { id: "c2", label: "Look into reality B", next: "node_reality_b" }
        ]
    },

    node_reality_a: {
        title: "REALITY A",
        text: "In this timeline, you never touched the terminal. You just walked out the door and never looked back. The world is normal, but intensely dull.",
        choices: [
            { id: "c1", label: "Is this better?", next: "node_end_dull" }
        ]
    },

    node_reality_b: {
        title: "REALITY B",
        text: "In this timeline, the terminal exploded. The room is scorched. The chronal shift failed catastrophically.",
        choices: [
            { id: "c1", label: "Accept the failure", next: "node_end_fail" }
        ]
    },

    node_arrival: {
        title: "THE ARRIVAL",
        text: "You manage to stop at the moment you walked into the room. But wait. You look at yourself entering. You are wearing different clothes. This isn't your past.",
        choices: [
            { id: "c1", label: "Warn them", next: "node_warn_them", paradoxical: true },
            { id: "c2", label: "Stay hidden", next: "node_stay_hidden" }
        ]
    },

    node_further_back: {
        title: "PREHISTORY",
        text: "You let it keep going. Days blur into months. The room dissolves into a forest, then a barren plain. The speed is intoxicating.",
        choices: [
            { id: "c1", label: "Keep going to the beginning", next: "node_the_beginning" }
        ]
    },

    node_warn_them: {
        title: "INTERVENTION",
        text: "You step out and yell 'Stop!'. The other you freezes. They look at you, horrified. 'You're not supposed to be here yet,' they say.",
        choices: [
            { id: "c1", label: "Argue with them", next: "node_argue" }
        ]
    }
};
