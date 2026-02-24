// Main app logic for Personal Myth Generator
const charBtn = document.getElementById('generate-character');
const storyBtn = document.getElementById('generate-story');
const mapBtn = document.getElementById('generate-map');

charBtn.onclick = () => generateCharacter();
storyBtn.onclick = () => generateStory();
mapBtn.onclick = () => generateMap();
