// Story generation module
const storySection = document.getElementById('story-section');
const storyTemplates = [
    'In the land of {place}, {hero} must overcome {challenge} to restore balance.',
    '{hero} discovers a hidden power within and faces {villain} in a battle of wits.',
    'Guided by {guide}, {hero} journeys through {place} to find the lost artifact.',
    'A prophecy foretells that {hero} will change the fate of {place}.',
    '{hero} and {companion} embark on a quest to defeat {villain} and save {place}.',
    'After a betrayal, {hero} must confront {challenge} and reclaim their destiny.'
];
const places = ['Eldoria', 'Mistvale', 'Sunreach', 'Shadowfen', 'Frosthold', 'Starhaven', 'Ironwood', 'Crystal Lake'];
const challenges = ['a curse', 'a dragon', 'a storm', 'a labyrinth', 'an ancient riddle', 'a forbidden love', 'a lost memory', 'a rival clan'];
const villains = ['Morvath', 'Zyra', 'The Shadow King', 'The Serpent', 'The Iron Queen', 'The Whisperer'];
const guides = ['Elyra', 'Faelar', 'Lirael', 'Maelis', 'Sylas'];
const companions = ['Bran', 'Calyra', 'Darian', 'Galen', 'Helia'];
function generateStory() {
    const template = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
    const hero = characterNames[Math.floor(Math.random() * characterNames.length)];
    const place = places[Math.floor(Math.random() * places.length)];
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    const villain = villains[Math.floor(Math.random() * villains.length)];
    const guide = guides[Math.floor(Math.random() * guides.length)];
    const companion = companions[Math.floor(Math.random() * companions.length)];
    const story = template
        .replace('{hero}', hero)
        .replace('{place}', place)
        .replace('{challenge}', challenge)
        .replace('{villain}', villain)
        .replace('{guide}', guide)
        .replace('{companion}', companion);
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `<strong>Story:</strong> ${story}`;
    storySection.appendChild(card);
}
