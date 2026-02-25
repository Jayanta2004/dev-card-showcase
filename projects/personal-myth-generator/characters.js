// Character generation module
const characterSection = document.getElementById('character-section');
const characterNames = [
    'Aelwyn', 'Bran', 'Calyra', 'Darian', 'Elyra', 'Faelar', 'Galen', 'Helia', 'Ithil', 'Joren',
    'Kaelis', 'Lirael', 'Maelis', 'Nym', 'Orin', 'Pyria', 'Quorin', 'Ryn', 'Sylas', 'Thalor',
    'Uria', 'Varyn', 'Wyn', 'Xyra', 'Yorin', 'Zara'
];
const characterTraits = [
    'Brave', 'Wise', 'Cunning', 'Gentle', 'Fierce', 'Curious', 'Loyal', 'Mysterious', 'Bold', 'Kind',
    'Ambitious', 'Patient', 'Rebellious', 'Visionary', 'Playful', 'Stoic', 'Resourceful', 'Charming', 'Resilient', 'Enigmatic'
];
const characterRoles = [
    'Hero', 'Villain', 'Guide', 'Trickster', 'Guardian', 'Seeker', 'Healer', 'Warrior', 'Scholar', 'Explorer'
];
function generateCharacter() {
    const name = characterNames[Math.floor(Math.random() * characterNames.length)];
    const trait = characterTraits[Math.floor(Math.random() * characterTraits.length)];
    const role = characterRoles[Math.floor(Math.random() * characterRoles.length)];
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `<strong>Name:</strong> ${name}<br><strong>Trait:</strong> ${trait}<br><strong>Role:</strong> ${role}`;
    characterSection.appendChild(card);
}
