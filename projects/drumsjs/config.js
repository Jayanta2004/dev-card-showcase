// Drum sound configuration
const drumSounds = [
    { key: 'Q', name: 'Kick', freq: 60, color: '#ff00ff' },
    { key: 'W', name: 'Snare', freq: 200, color: '#00f5ff' },
    { key: 'E', name: 'Hi-Hat', freq: 8000, color: '#00ff88' },
    { key: 'R', name: 'Tom 1', freq: 150, color: '#ff6b6b' },
    { key: 'A', name: 'Tom 2', freq: 120, color: '#ffd93d' },
    { key: 'S', name: 'Clap', freq: 1000, color: '#6bcf7f' },
    { key: 'D', name: 'Cymbal', freq: 5000, color: '#a29bfe' },
    { key: 'F', name: 'Perc', freq: 300, color: '#fd79a8' }
];

// Beat patterns for auto-play
const beatPatterns = [
    // Classic Rock Beat
    ['Q', null, 'E', null, 'W', null, 'E', null, 'Q', null, 'E', null, 'W', null, 'E', null],
    
    // Funky Groove
    ['Q', 'E', null, 'E', 'W', 'E', null, 'E', 'Q', 'E', null, 'E', 'W', 'E', 'Q', 'E'],
    
    // Hip-Hop Beat
    ['Q', null, null, 'E', 'W', null, 'E', null, 'Q', null, 'E', null, 'W', null, null, 'E'],
    
    // Dance/EDM
    ['Q', 'E', 'E', 'E', 'Q', 'E', 'E', 'E', 'Q', 'E', 'E', 'E', 'Q', 'E', 'E', 'E'],
    
    // Breakbeat
    ['Q', null, 'E', 'W', null, 'E', 'Q', 'E', null, 'E', 'W', null, 'E', 'Q', null, 'E'],
    
    // Latin Rhythm
    ['Q', 'F', 'E', 'F', 'W', 'F', 'E', 'F', 'Q', 'F', 'E', 'F', 'W', 'F', 'E', 'F'],
    
    // Trap Beat
    ['Q', null, null, 'E', null, 'E', 'W', null, null, 'E', 'Q', null, 'W', 'E', null, 'E'],
    
    // Jungle/DnB
    ['Q', null, 'W', null, 'E', 'E', null, 'W', 'Q', null, 'E', 'W', null, 'E', 'Q', null],
    
    // Reggae
    ['Q', null, 'E', null, null, 'W', 'E', null, 'Q', null, 'E', null, null, 'W', 'E', null],
    
    // Dubstep
    ['Q', null, null, null, 'W', null, null, 'E', 'Q', null, null, 'E', 'W', null, 'E', null],
    
    // Samba
    ['Q', 'F', 'F', 'E', 'F', 'W', 'F', 'E', 'Q', 'F', 'E', 'F', 'W', 'F', 'F', 'E'],
    
    // Progressive House
    ['Q', 'E', 'E', 'E', 'W', 'E', 'E', 'E', 'Q', 'E', 'E', 'E', 'W', 'E', 'Q', 'E'],
    
    // Afrobeat
    ['Q', 'F', 'E', null, 'F', 'W', 'E', 'F', 'Q', null, 'F', 'E', 'W', 'F', 'E', 'F'],
    
    // Industrial
    ['Q', 'S', 'E', 'S', 'W', 'S', 'E', 'S', 'Q', 'S', 'E', 'S', 'W', 'S', 'E', 'S'],
    
    // Minimal Techno
    ['Q', null, 'E', null, 'Q', null, 'E', null, 'W', null, 'E', null, 'Q', null, 'E', null]
];

// Pattern names
const patternNames = [
    'Classic Rock',
    'Funky Groove',
    'Hip-Hop',
    'Dance/EDM',
    'Breakbeat',
    'Latin',
    'Trap',
    'Jungle/DnB',
    'Reggae',
    'Dubstep',
    'Samba',
    'Prog House',
    'Afrobeat',
    'Industrial',
    'Minimal Techno'
];