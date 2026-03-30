// ...existing code...
// UI Components for Zero-to-Hackathon Copilot
function renderIdeaInput(idea) {
  return `<input class='idea-input' placeholder='Enter your hackathon idea...' value='${idea||''}' />`;
}
function renderRoadmap(roadmap) {
  return `<div class='roadmap'><div class='section-title'>Auto Roadmap</div><ul>${roadmap.map(r=>`<li>${r}</li>`).join('')}</ul></div>`;
}
function renderTaskBoard(tasks) {
  return `<div class='task-board'><div class='section-title'>Task Board</div><ul>${tasks.map(t=>`<li>${t}</li>`).join('')}</ul></div>`;
}
function renderPitchScript(script) {
  return `<div class='pitch-script'><div class='section-title'>3-Minute Pitch Generator</div><p>${script}</p></div>`;
}
function renderDemoChecklist(checklist) {
  return `<div class='demo-checklist'><div class='section-title'>Demo Checklist</div><ul>${checklist.map(c=>`<li>${c}</li>`).join('')}</ul></div>`;
}
