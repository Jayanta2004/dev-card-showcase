/**
 * Melodies Database
 * Contains pre-programmed melodies for auto-play
 */

const MELODIES = {
    twinkle: {
        name: "Twinkle Twinkle Little Star",
        notes: [
            { note: 'C4', duration: 0.5 }, { note: 'C4', duration: 0.5 },
            { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
            { note: 'A4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
            { note: 'G4', duration: 1.0 },
            { note: 'F4', duration: 0.5 }, { note: 'F4', duration: 0.5 },
            { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
            { note: 'D4', duration: 0.5 }, { note: 'D4', duration: 0.5 },
            { note: 'C4', duration: 1.0 }
        ]
    },

    jingle: {
        name: "Jingle Bells",
        notes: [
            { note: 'E4', duration: 0.4 }, { note: 'E4', duration: 0.4 }, { note: 'E4', duration: 0.8 },
            { note: 'E4', duration: 0.4 }, { note: 'E4', duration: 0.4 }, { note: 'E4', duration: 0.8 },
            { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'C4', duration: 0.4 }, { note: 'D4', duration: 0.4 },
            { note: 'E4', duration: 1.2 }
        ]
    },

    mary: {
        name: "Mary Had a Little Lamb",
        notes: [
            { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'C4', duration: 0.5 }, { note: 'D4', duration: 0.5 },
            { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 1.0 },
            { note: 'D4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'D4', duration: 1.0 },
            { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 }, { note: 'G4', duration: 1.0 }
        ]
    },

    ode: {
        name: "Ode to Joy",
        notes: [
            { note: 'E4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
            { note: 'G4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'D4', duration: 0.5 },
            { note: 'C4', duration: 0.5 }, { note: 'C4', duration: 0.5 }, { note: 'D4', duration: 0.5 }, { note: 'E4', duration: 0.5 },
            { note: 'E4', duration: 0.75 }, { note: 'D4', duration: 0.25 }, { note: 'D4', duration: 1.0 }
        ]
    },

    elise: {
        name: "Für Elise (Intro)",
        notes: [
            { note: 'E5', duration: 0.3 }, { note: 'Eb5', duration: 0.3 },
            { note: 'E5', duration: 0.3 }, { note: 'Eb5', duration: 0.3 },
            { note: 'E5', duration: 0.3 }, { note: 'B4', duration: 0.3 },
            { note: 'D5', duration: 0.3 }, { note: 'C5', duration: 0.3 },
            { note: 'A4', duration: 0.8 },
            { note: 'C4', duration: 0.3 }, { note: 'E4', duration: 0.3 }, { note: 'A4', duration: 0.3 },
            { note: 'B4', duration: 0.8 },
            { note: 'E4', duration: 0.3 }, { note: 'Ab4', duration: 0.3 }, { note: 'B4', duration: 0.3 },
            { note: 'C5', duration: 0.8 }
        ]
    },
    
    canon: {
        name: "Canon in D",
        notes: [
            { note: 'A4', duration: 0.8 }, { note: 'G4', duration: 0.2 }, { note: 'F4', duration: 0.2 }, { note: 'E4', duration: 0.2 },
            { note: 'D4', duration: 0.8 }, { note: 'E4', duration: 0.2 }, { note: 'F4', duration: 0.2 }, { note: 'G4', duration: 0.2 },
            { note: 'F4', duration: 0.8 }, { note: 'E4', duration: 0.2 }, { note: 'D4', duration: 0.2 }, { note: 'C4', duration: 0.2 },
            { note: 'Bb4', duration: 0.8 }, { note: 'C4', duration: 0.2 }, { note: 'D4', duration: 0.2 }, { note: 'E4', duration: 0.2 }
        ]
    }
};

function getMelody(name) {
    return MELODIES[name] || MELODIES.twinkle;
}

function getMelodyNames() {
    return Object.keys(MELODIES);
}