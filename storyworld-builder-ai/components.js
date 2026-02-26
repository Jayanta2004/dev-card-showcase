// ...existing code...
// UI Components for StoryWorld Builder AI
function renderStorySection(title, content) {
  return `<div class='story-section'><div class='section-title'>${title}</div>${content}</div>`;
}
function renderMap(map) {
  return `<div class='story-section'><div class='section-title'>World Map</div><pre>${map}</pre></div>`;
}
function renderCharacters(chars) {
  return `<div class='story-section'><div class='section-title'>Characters</div><ul>${chars.map(c=>`<li>${c}</li>`).join('')}</ul></div>`;
}
function renderLore(lore) {
  return `<div class='story-section'><div class='section-title'>Lore</div><p>${lore}</p></div>`;
}
function renderQuests(quests) {
  return `<div class='story-section'><div class='section-title'>Branching Quests</div><ul>${quests.map(q=>`<li>${q}</li>`).join('')}</ul></div>`;
}
