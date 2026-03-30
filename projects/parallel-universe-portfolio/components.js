// Modular UI components for Parallel-Universe Portfolio
function createUniverseSelector(universes, selected) {
  return `<div class="universe-btns">${universes.map(u=>`<button class="btn universe-btn${u===selected?' selected':''}" data-universe="${u}">${u}</button>`).join('')}</div>`;
}
function createUniverseContent(universe, data) {
  return `<div class="universe-card">
    <h2>${universe} You</h2>
    <div class="universe-projects">
      <h3>Projects</h3>
      <ul>${data.projects.map(p=>`<li><b>${p.name}</b>: ${p.desc}</li>`).join('')}</ul>
    </div>
    <div class="universe-skills">
      <h3>Skills</h3>
      <ul>${data.skills.map(s=>`<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="universe-timeline">
      <h3>Timeline Outcomes</h3>
      <ul>${data.timeline.map(t=>`<li>${t}</li>`).join('')}</ul>
    </div>
  </div>`;
}
window.Components = { createUniverseSelector, createUniverseContent };
